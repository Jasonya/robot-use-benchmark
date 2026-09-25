"""Render saved simulator actions; output remains robot/synthetic footage, not human video."""
import argparse
import json
from pathlib import Path
import imageio.v2 as imageio
import numpy as np

from .common import file_hash,write_json
from .metaworld_adapter import MetaWorldAdapter


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--run",type=Path,required=True)
    parser.add_argument("--trial-id",required=True)
    parser.add_argument("--output",type=Path,required=True)
    parser.add_argument("--stride",type=int,default=4)
    args=parser.parse_args()
    record=json.loads((args.run/"trials"/args.trial_id/"record.json").read_text())
    trace=args.run/record["trace_file"];assert file_hash(trace)==record["trace_sha256"]
    adapter=MetaWorldAdapter(record["native_task_id"],record["reset_seed"],render_mode="rgb_array",
                             reset_mode=record["contract"].get("reset_mode","native"))
    assert adapter.initial_state_hash==record["initial_state_hash"]
    args.output.parent.mkdir(parents=True,exist_ok=True)
    fps=1/(record["contract"]["control_period_seconds"]*args.stride)
    frames=0;maximum=0.
    try:
        with np.load(trace,allow_pickle=False) as data, imageio.get_writer(str(args.output),fps=fps,codec="libx264",quality=7) as writer:
            writer.append_data(adapter.env.render());frames+=1
            for step,action in enumerate(data["actions"]):
                obs,*_=adapter.step(action)
                maximum=max(maximum,float(np.max(np.abs(obs-data["observations"][step+1]))))
                if (step+1)%args.stride==0:
                    writer.append_data(adapter.env.render());frames+=1
    finally:
        adapter.close()
    assert maximum<=1e-8
    write_json(args.output.with_suffix(".json"),{
        "run_id":record["run_id"],"trial_id":record["trial_id"],"native_task_id":record["native_task_id"],
        "method_id":record["method_id"],"source_trace_sha256":record["trace_sha256"],
        "video_sha256":file_hash(args.output),"frames":frames,"fps":fps,
        "max_replay_observation_error":maximum,"agent_origin":"robot","camera_mount":"virtual",
        "data_origin":"rendered replay of actual simulator actions","human_video":False,
        "selection":"illustrative example only; aggregate results use the complete declared test set"
    })
    print(json.dumps({"frames":frames,"fps":fps,"max_replay_observation_error":maximum,"video":args.output.name}))


if __name__=="__main__":
    main()
