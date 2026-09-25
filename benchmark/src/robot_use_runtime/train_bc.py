"""Train fixed-hyperparameter, per-task BC baselines from development references.

Training and future evaluation seed sets must remain disjoint. This is not a
generalist VLA model or a claim of held-out-task/object generalization.
"""
from __future__ import annotations
import argparse
from datetime import datetime,timezone
import importlib.metadata
import json
from pathlib import Path
import time

import numpy as np
from sklearn.ensemble import ExtraTreesRegressor

from .common import file_hash,digest,write_json
from .learned_policies import extra_trees_predict_one


def tree_arrays(model):
    trees=[estimator.tree_ for estimator in model.estimators_]
    size=max(tree.node_count for tree in trees)
    n=len(trees)
    output={"features":np.full((n,size),-2,dtype=np.int32),
            "thresholds":np.zeros((n,size),dtype=np.float64),
            "children_left":np.full((n,size),-1,dtype=np.int32),
            "children_right":np.full((n,size),-1,dtype=np.int32),
            "values":np.zeros((n,size,4),dtype=np.float64),
            "max_depth":np.array(max(tree.max_depth for tree in trees),dtype=np.int32)}
    for i,tree in enumerate(trees):
        m=tree.node_count
        output["features"][i,:m]=tree.feature
        output["thresholds"][i,:m]=tree.threshold
        output["children_left"][i,:m]=tree.children_left
        output["children_right"][i,:m]=tree.children_right
        output["values"][i,:m]=tree.value[:,:,0]
    return output


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--source-run",type=Path,required=True)
    parser.add_argument("--output",type=Path,required=True)
    parser.add_argument("--stride",type=int,default=3)
    args=parser.parse_args()
    if args.output.exists() or args.stride<1:
        parser.error("Use a new output directory and a positive stride")
    validation=json.loads((args.source_run/"validation.json").read_text())
    if validation["status"]!="passed" or validation.get("reset_mode")!="forward_consistent":
        parser.error("Training requires a validated forward-consistent source run")
    protocol=json.loads((args.source_run/"protocol.json").read_text())
    records=[json.loads(p.read_text()) for p in (args.source_run/"trials").glob("*/record.json")]
    eligible=[r for r in records if r["status"]=="completed" and r["method_id"]=="scripted_reference"
              and r["native_success_ever"] and not r["initial_native_success"]]
    args.output.mkdir(parents=True)
    training_protocol={
        "source_run_id":validation["run_id"],
        "source_protocol_sha256":file_hash(args.source_run/"protocol.json"),
        "source_validation_sha256":file_hash(args.source_run/"validation.json"),
        "training_reset_seeds":protocol["reset_seeds"],
        "task_conditioning":"separate model per native task; not a task-generalist model",
        "observation":"same native 39-value state+explicit goal as execution controls",
        "target":"clipped native four-component expert action",
        "quality_filter":"completed, native-ever-successful, non-presolved reference episodes",
        "temporal_filter":"prefix through first native success plus 20 actions; stride sampling",
        "stride":args.stride,
        "hyperparameters":{
            "bc_linear":{"regularizer":0.01,"standardize_observations":True},
            "bc_extra_trees":{"n_estimators":48,"max_depth":14,"min_samples_leaf":2,"random_state":1337,"n_jobs":1}
        },
        "evaluation_rule":"Evaluate only on reset seeds absent from the source training pool; report this as initial-state generalization.",
        "hyperparameters_fixed_before_future_test_runs":True,
        "packages":{name:importlib.metadata.version(name) for name in ["numpy","scipy","scikit-learn"]},
        "created_at":datetime.now(timezone.utc).isoformat()
    }
    write_json(args.output/"training_protocol.json",training_protocol)
    bundle={"schema_version":"state-bc-bundle-0.1","training_protocol":training_protocol,
            "training_protocol_sha256":file_hash(args.output/"training_protocol.json"),
            "training_reset_seeds":protocol["reset_seeds"],"training_case_ids":sorted({r["case_id"] for r in eligible}),
            "training_initial_state_hashes":sorted({r["initial_state_hash"] for r in eligible}),
            "methods":{"bc_linear":{"models":{}},"bc_extra_trees":{"models":{}}},
            "method_scope":"development state-based specialist BC; no human demonstrations or VLA claim"}
    started=time.perf_counter()
    for task in protocol["native_tasks"]:
        chosen=sorted([r for r in eligible if r["native_task_id"]==task],key=lambda r:r["reset_seed"])
        if not chosen:
            raise RuntimeError(f"No qualifying training demonstration for {task}; do not silently skip it")
        xs,ys=[],[]
        traces=[]
        for record in chosen:
            trace=args.source_run/record["trace_file"]
            if file_hash(trace)!=record["trace_sha256"]:
                raise RuntimeError("Training trace changed")
            with np.load(trace,allow_pickle=False) as data:
                stop=min(len(data["actions"]),record["first_native_success_step"]+20)
                xs.append(data["observations"][:stop:args.stride])
                ys.append(data["actions"][:stop:args.stride])
            traces.append(record["trace_sha256"])
        x=np.concatenate(xs);y=np.concatenate(ys).astype(np.float64)
        mean=x.mean(0);scale=np.maximum(x.std(0),1e-6)
        z=np.c_[(x-mean)/scale,np.ones(len(x))]
        regularizer=np.eye(z.shape[1])*0.01;regularizer[-1,-1]=0
        weights=np.linalg.solve(z.T@z+regularizer,z.T@y)
        linear=args.output/(task+"-linear.npz")
        np.savez_compressed(linear,mean=mean,scale=scale,weights=weights)
        model=ExtraTreesRegressor(n_estimators=48,max_depth=14,min_samples_leaf=2,random_state=1337,n_jobs=1)
        model.fit(x,y)
        arrays=tree_arrays(model)
        # sklearn evaluates tree decisions with float32 input. Preserve that input
        # convention in the exported evaluator to avoid threshold-boundary drift.
        check=x[:min(100,len(x))].astype(np.float32)
        exported=np.array([extra_trees_predict_one(row,arrays) for row in check])
        mismatch=float(np.max(np.abs(exported-model.predict(check))))
        if mismatch>1e-10:
            raise RuntimeError(f"Safe tree export mismatch for {task}: {mismatch}")
        forest=args.output/(task+"-extra-trees.npz");np.savez_compressed(forest,**arrays)
        for method,file in [("bc_linear",linear),("bc_extra_trees",forest)]:
            bundle["methods"][method]["models"][task]={"file":file.name,"sha256":file_hash(file),
                "training_episodes":len(chosen),"training_samples":len(x),"training_trace_sha256":traces,
                "safe_export_prediction_max_abs_error":mismatch if method=="bc_extra_trees" else None}
        if len(bundle["methods"]["bc_linear"]["models"])%10==0:
            print(json.dumps({"trained_tasks":len(bundle["methods"]["bc_linear"]["models"]),
                "total_tasks":len(protocol["native_tasks"]),"wall_seconds":round(time.perf_counter()-started,1)}),flush=True)
    bundle["training_wall_seconds"]=time.perf_counter()-started
    bundle["bundle_id"]="bc-"+digest({"protocol":training_protocol,"models":bundle["methods"]})[:20]
    write_json(args.output/"bundle.json",bundle)
    print(json.dumps({"bundle_id":bundle["bundle_id"],"models_per_method":len(protocol["native_tasks"]),
                     "training_cases":len(bundle["training_case_ids"]),"wall_seconds":bundle["training_wall_seconds"]},indent=2),flush=True)


if __name__=="__main__":
    main()
