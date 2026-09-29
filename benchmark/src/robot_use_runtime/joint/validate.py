"""Independent storage, SQLite, perception and actual-physics replay checks."""
from __future__ import annotations
import argparse
from collections import defaultdict,Counter
from concurrent.futures import ProcessPoolExecutor,as_completed
import hashlib
import json
import multiprocessing
from pathlib import Path
import tempfile

import numpy as np
from PIL import Image

from ..common import digest,file_hash,write_json
from .world import DispatchWorld,CATALOG
from .vision import detect_colored_parts
from .ledger import DispatchLedger,evaluate_digital_state

read=lambda p:json.loads(Path(p).read_text())


def validate_one(job):
    root=Path(job["root"]);record=job["record"];case=job["case"]
    folder=root/"trials"/record["trial_id"]
    issues=[]
    trace_path=root/record["trace_file"]
    if file_hash(trace_path)!=record["trace_sha256"]:issues.append("trace_hash_mismatch")
    events=read(folder/"tool_events.json");frames=read(folder/"frames.json")
    if file_hash(folder/"tool_events.json")!=record["tool_event_sha256"]:issues.append("event_hash_mismatch")
    if file_hash(folder/"frames.json")!=record["frame_manifest_sha256"]:issues.append("frame_manifest_hash_mismatch")
    frame_by_id={f["frame_id"]:f for f in frames}
    packet=read(folder/"public_packet.json")
    calibration=packet["initial_rgb"]["calibration"]
    image_by_ref={}
    for frame in frames:
        path=root/frame["file"]
        if file_hash(path)!=frame["png_sha256"]:issues.append("image_file_hash_mismatch")
        if frame["file"] not in image_by_ref:
            with Image.open(path) as image:image_by_ref[frame["file"]]=np.asarray(image.convert("RGB")).copy()
        if hashlib.sha256(image_by_ref[frame["file"]].tobytes()).hexdigest()!=frame["pixel_sha256"]:
            issues.append("pixel_hash_mismatch")
    recomputed_detections=0
    for event in events:
        if event["name"]=="vision.locate_parts" and event["response"].get("ok"):
            frame=frame_by_id[event["arguments"]["frame_id"]]
            detections=detect_colored_parts(image_by_ref[frame["file"]],calibration)
            if digest(detections)!=digest(event["response"]["parts"]):issues.append("rgb_detection_mismatch")
            recomputed_detections+=1
        if record["method_id"]!="pose_oracle_reference" and event["name"]=="diagnostics.pose_oracle" and event["response"].get("ok"):
            issues.append("privileged_pose_leak")
    digital_replay_calls=0
    with tempfile.TemporaryDirectory(prefix="joint-ledger-replay-") as tmp:
        ledger=DispatchLedger(Path(tmp)/"replay.sqlite",case["order"],
                              lose_first_commit_response=case["fault_mode"]=="reply_lost_after_commit")
        if digest(ledger.snapshot())!=record["initial_database_hash"]:issues.append("initial_database_mismatch")
        for event in events:
            name=event["name"];args=event["arguments"]
            if name=="dispatch.record":
                got=ledger.record_dispatch(**args,control_step=event["control_step_before"])
            elif name=="orders.get" and event["response"].get("ok"):
                got=ledger.get_order(args["order_id"])
            elif name=="inventory.list" and event["response"].get("ok"):
                got={"ok":True,"inventory":ledger.inventory()}
            elif name=="catalog.list" and event["response"].get("ok"):
                got={"ok":True,"catalog":ledger.catalog()}
            else:continue
            digital_replay_calls+=1
            if digest(got)!=digest(event["response"]):issues.append("digital_tool_replay_mismatch")
        database=ledger.snapshot();ledger.close()
    if digest(database)!=record.get("final_database_hash"):issues.append("final_database_mismatch")
    digital=evaluate_digital_state(database,case["order"])
    if digital!=record.get("digital"):issues.append("digital_score_mismatch")
    commits=read(folder/"commit_evidence.private.json")
    perception=read(folder/"perception_evidence.private.json")
    commits_by_step=defaultdict(list)
    for c in commits:commits_by_step[c["control_step"]].append(c)
    frames_by_step=defaultdict(list)
    for f in frames:frames_by_step[f["control_step"]].append(f)
    perception_by_step=defaultdict(list)
    for p in perception:
        perception_by_step[frame_by_id[p["frame_id"]]["control_step"]].append(p)
    reset="native_warmup" if record["contract_id"].endswith("0.1") else "canonical_1e10"
    world=DispatchWorld(case["world_seed"],root/".cache",reset_contract=reset)
    max_state_error=0.;max_image_error=0;replayed_images=0;max_pose_error=0.
    try:
        if world.initial_state_hash!=record["initial_state_hash"]:issues.append("reset_hash_mismatch")
        physical_commit_flags=[]
        def checks_at_step(step):
            nonlocal max_image_error,replayed_images,max_pose_error
            if step in frames_by_step:
                replayed=world.rgb()
                # Several frame IDs can refer to the same unchanged state.
                for frame in frames_by_step[step]:
                    original=image_by_ref[frame["file"]]
                    difference=np.abs(replayed.astype(np.int16)-original.astype(np.int16))
                    error=int(difference.max())
                    max_image_error=max(max_image_error,error)
                    if error>1 or float(np.mean(difference>0))>1e-4:issues.append("rendered_observation_replay_mismatch")
                    replayed_images+=1
            for c in commits_by_step.get(step,[]):
                goal=world.evaluator_goal(case["order"]["sku"],case["order"]["bay_id"])
                old=c["physical_state_at_call"]
                for key in ["inside_requested_bay","supported_on_table","non_target_preserved","stationary_last_steps","physical_success"]:
                    if goal[key]!=old[key]:issues.append("commit_physics_replay_mismatch")
                if c["ledger_effect"] and c["ledger_effect"]["mutated"]:physical_commit_flags.append(goal["physical_success"])
            for p in perception_by_step.get(step,[]):
                true=world.evaluator_positions()[p["sku"]][:2]
                if not np.allclose(true,p["true_xy"],atol=1e-8,rtol=0):issues.append("perception_ground_truth_replay_mismatch")
                error=float(np.linalg.norm(np.asarray(p["estimated_xy"])-true))
                max_pose_error=max(max_pose_error,error)
                if abs(error-p["error_m"])>1e-8:issues.append("perception_error_recompute_mismatch")
        with np.load(trace_path,allow_pickle=False) as trace:
            actions=trace["actions"];qpos=trace["qpos"];qvel=trace["qvel"];clock=trace["simulator_time"]
            if len(qpos)!=len(actions)+1 or len(qvel)!=len(qpos):issues.append("trace_shape_mismatch")
            if actions.ndim!=2 or actions.shape[1]!=4 or np.any(np.abs(actions)>1.000001):issues.append("invalid_action")
            if any(not np.isfinite(trace[key]).all() for key in trace.files):issues.append("nonfinite_trace")
            if len(clock)>1 and not np.allclose(np.diff(clock),.0125,atol=1e-9,rtol=0):issues.append("time_discontinuity")
            checks_at_step(0)
            for index,action in enumerate(actions,1):
                world.step(action)
                error=max(float(np.max(np.abs(world.data.qpos-qpos[index]))),
                          float(np.max(np.abs(world.data.qvel-qvel[index]))))
                max_state_error=max(max_state_error,error)
                if error>1e-8:issues.append("physics_action_replay_mismatch");break
                checks_at_step(index)
        physical=world.evaluator_goal(case["order"]["sku"],case["order"]["bay_id"])
        for key in ["inside_requested_bay","supported_on_table","non_target_preserved","stationary_last_steps","physical_success"]:
            if physical[key]!=record.get("physics",{}).get(key):issues.append("physical_score_mismatch")
        process=bool(physical_commit_flags) and all(physical_commit_flags)
        recomputed=physical["physical_success"] and digital["digital_success"] and process
        if recomputed!=record["joint_success"]:issues.append("joint_score_mismatch")
    finally:world.close()
    return {"trial_id":record["trial_id"],"issues":sorted(set(issues)),
            "physics_max_abs_error":max_state_error,"rgb_max_channel_error":max_image_error,
            "rgb_frames_replayed":replayed_images,"pixel_detections_recomputed":recomputed_detections,
            "digital_calls_replayed":digital_replay_calls,"max_pixel_pose_error_m":max_pose_error}


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("run",type=Path)
    parser.add_argument("--workers",type=int,default=2)
    args=parser.parse_args()
    root=args.run.resolve()
    protocol=read(root/"protocol.json");manifest=read(root/"trial_manifest.json")
    records=[read(p) for p in sorted((root/"trials").glob("*/record.json"))]
    assert {r["trial_id"] for r in records}=={r["trial_id"] for r in manifest}
    assert len(records)==len(manifest)
    cases={c["case_id"]:c for c in read(root/"cases.private.json")}
    case_groups=defaultdict(list);world_groups=defaultdict(list)
    for r in records:
        case_groups[r["case_id"]].append(r);world_groups[r["world_seed"]].append(r)
    group_issues=[]
    for cid,group in case_groups.items():
        if len({r.get("initial_state_hash") for r in group})!=1:group_issues.append(f"case_reset:{cid}")
        if len({r.get("initial_pixel_sha256") for r in group})!=1:group_issues.append(f"case_initial_rgb:{cid}")
        if len({r.get("initial_database_hash") for r in group})!=1:group_issues.append(f"case_database:{cid}")
    for seed,group in world_groups.items():
        if len({r.get("initial_state_hash") for r in group})!=1:group_issues.append(f"world_reset:{seed}")
        if len({r.get("initial_pixel_sha256") for r in group})!=1:group_issues.append(f"matched_image:{seed}")
    for name,expected in protocol["source_hashes"].items():
        if file_hash(root/"runtime_source"/name)!=expected:group_issues.append(f"source_archive:{name}")
    usable=[r for r in records if r["status"]=="completed"]
    jobs=[{"root":str(root),"record":r,"case":cases[r["case_id"]]} for r in usable]
    results=[]
    with ProcessPoolExecutor(max_workers=args.workers,mp_context=multiprocessing.get_context("spawn")) as pool:
        futures=[pool.submit(validate_one,j) for j in jobs]
        for f in as_completed(futures):
            results.append(f.result())
            if len(results)%16==0:print(json.dumps({"replayed_trials":len(results),"requested_replays":len(jobs),
                                                  "issues":sum(bool(r["issues"]) for r in results)}),flush=True)
    bad=[r for r in results if r["issues"]]
    candidate_validity=[]
    valid_trial_ids={r["trial_id"] for r in results if not r["issues"]}
    for cid,group in case_groups.items():
        witnesses=[r["trial_id"] for r in group if r["trial_id"] in valid_trial_ids and r["joint_success"]
                   and r["method_id"] in {"pose_oracle_reference","rgb_tools_closed_loop"}]
        candidate_validity.append({"case_id":cid,"joint_completion_witnesses":witnesses,
                                   "has_replayed_completion_witness":bool(witnesses)})
    report={
        "status":"passed" if not bad and not group_issues and len(usable)==len(records) else "failed",
        "scope":"Complete action/RGB/SQLite replay of all completed pilot trials; engineering data validity, not broad task coverage or VLM performance.",
        "requested_trials":len(records),"completed_trials":len(usable),"replayed_trials":len(results),
        "case_count":len(case_groups),"physical_initial_worlds":len(world_groups),
        "distinct_physics_hashes":len({r.get("initial_state_hash") for r in records}),
        "distinct_initial_rgb_hashes":len({r.get("initial_pixel_sha256") for r in records}),
        "group_issues":group_issues,"failed_trial_replays":bad,
        "max_physics_replay_error":max((r["physics_max_abs_error"] for r in results),default=0),
        "max_rgb_channel_replay_error":max((r["rgb_max_channel_error"] for r in results),default=0),
        "rgb_frames_replayed":sum(r["rgb_frames_replayed"] for r in results),
        "pixel_detection_calls_recomputed":sum(r["pixel_detections_recomputed"] for r in results),
        "digital_tool_calls_replayed":sum(r["digital_calls_replayed"] for r in results),
        "max_pixel_pose_error_m":max((r["max_pixel_pose_error_m"] for r in results),default=0),
        "cases_with_replayed_joint_completion_witness":sum(r["has_replayed_completion_witness"] for r in candidate_validity),
        "case_validity":candidate_validity,"new_canonical_g2_count":None,
        "new_authored_workflow_candidates":1,"human_video_cases":0,
        "formal_universal_benchmark_complete":False,
    }
    write_json(root/"validation.json",report)
    write_json(root/"trial_replay_checks.json",results)
    print(json.dumps({k:v for k,v in report.items() if k not in ["case_validity","failed_trial_replays"]},indent=2),flush=True)
    if report["status"]!="passed":raise SystemExit(1)


if __name__=="__main__":main()
