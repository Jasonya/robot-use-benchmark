"""Confirm saved learned-policy actions and train/test separation from actual bundle data."""
import argparse
import json
from pathlib import Path
import numpy as np

from .common import file_hash,write_json
from .learned_policies import LearnedPolicy


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--run",type=Path,required=True)
    parser.add_argument("--bundle",type=Path,required=True)
    parser.add_argument("--samples-per-trial",type=int,default=20)
    args=parser.parse_args()
    protocol=json.loads((args.run/"protocol.json").read_text())
    bundle=json.loads((args.bundle/"bundle.json").read_text())
    bundle_hash=file_hash(args.bundle/"bundle.json")
    assert protocol["model_bundle_sha256"]==bundle_hash
    assert not set(protocol["reset_seeds"])&set(bundle["training_reset_seeds"])
    records=[json.loads(path.read_text()) for path in (args.run/"trials").glob("*/record.json")]
    policies={}
    results=[]
    for record in records:
        if record["method_id"] not in bundle["methods"] or record["status"]!="completed":
            continue
        key=(record["method_id"],record["native_task_id"])
        if key not in policies:
            policies[key]=LearnedPolicy(args.bundle,record["native_task_id"],record["method_id"])
        model=policies[key]
        assert record["model_bundle_sha256"]==bundle_hash
        assert record["model_sha256"]==model.model_sha256
        assert record["initial_state_hash"] not in model.training_initial_state_hashes
        trace=args.run/record["trace_file"];assert file_hash(trace)==record["trace_sha256"]
        with np.load(trace,allow_pickle=False) as data:
            indices=np.unique(np.linspace(0,len(data["actions"])-1,args.samples_per_trial,dtype=int))
            errors=[float(np.max(np.abs(model.get_action(data["observations"][index])-data["raw_actions"][index]))) for index in indices]
            maximum=max(errors,default=0.)
            assert maximum<=1e-8,(record["trial_id"],maximum)
        results.append({"trial_id":record["trial_id"],"checked_action_steps":len(indices),"max_abs_error":maximum})
    report={"status":"passed","bundle_id":bundle["bundle_id"],"model_bundle_sha256":bundle_hash,
            "learned_trials_checked":len(results),"action_steps_checked":sum(r["checked_action_steps"] for r in results),
            "max_action_abs_error":max((r["max_abs_error"] for r in results),default=0),
            "training_reset_seeds":bundle["training_reset_seeds"],"test_reset_seeds":protocol["reset_seeds"],
            "seed_sets_disjoint":True,"initial_state_hashes_disjoint":True,
            "generalization_claim":"held-out initial states within the same native tasks/assets; not held-out tasks, objects, language or human-video generalization",
            "checks":results}
    write_json(args.run/"learned_model_validation.json",report)
    print(json.dumps({key:value for key,value in report.items() if key!="checks"},indent=2))


if __name__=="__main__":
    main()
