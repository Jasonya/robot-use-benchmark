"""Run a predeclared synthetic joint-data pilot; all requested trials are retained."""
from __future__ import annotations
import argparse
from concurrent.futures import ProcessPoolExecutor,as_completed
from datetime import datetime,timezone
import hashlib
import importlib.metadata
import json
import multiprocessing
from pathlib import Path
import platform
import shutil
import sqlite3
import time

import numpy as np
from PIL import Image

from ..common import digest,file_hash,plain,write_json
from . import CONTRACT_VERSION
from .world import DispatchWorld,BAYS,CATALOG,build_scene
from .ledger import DispatchLedger,evaluate_digital_state,SQL_SCHEMA
from .tools import ToolService,TOOL_ARGUMENTS
from .agents import METHODS,run_agent
from .schemas import TOOL_SCHEMAS,WORKFLOW_CANDIDATE

INSTRUCTION_ZH="請依指定出貨單，把正確的料件推到指定出貨區。保持其他料件原位，完成後登記出貨並更新庫存。一次出貨只可記錄一次。"
INSTRUCTION_EN="Retrieve the indicated order, push its part fully into the requested dispatch bay, preserve the other part, and then record exactly one dispatch with consistent inventory."


def make_cases(seeds,faults):
    rng=np.random.default_rng(20260929)
    cases=[]
    for seed in seeds:
        id_rng=np.random.default_rng(np.random.SeedSequence([20260929,int(seed),7919]))
        for sku in CATALOG:
            for bay in BAYS:
                # Identifier is an opaque random token, not a semantic SKU/bay label.
                # World-keyed streams prevent dev/test runs from restarting the
                # same identifier sequence or changing IDs with batch composition.
                order_id="ord-"+id_rng.bytes(12).hex()
                for fault in faults:
                    spec={"world_seed":seed,"order":{"order_id":order_id,"sku":sku,"bay_id":bay,"quantity":1},
                          "fault_mode":fault,"workflow_candidate":"inspect_order_route_part_and_record",
                          "contract_id":CONTRACT_VERSION,
                          "task_kind":"synthetic_rgb_digital_tool_and_contact_control",
                          "canonical_g2_id":None,"new_canonical_task_claim":False}
                    spec["case_id"]="case-"+digest(spec)[:20]
                    spec["public_instruction"]={"zh-Hant":INSTRUCTION_ZH,"en":INSTRUCTION_EN,"order_id":order_id}
                    cases.append(spec)
    order=rng.permutation(len(cases))
    return [cases[i] for i in order]


def execute_trial(job):
    root=Path(job["root"]);case=job["case"];method=job["method"]
    trial_id=job["trial_id"];folder=root/"trials"/trial_id
    folder.mkdir(parents=True)
    start=time.perf_counter()
    world=ledger=service=None
    record={"trial_id":trial_id,"case_id":case["case_id"],"method_id":method,
            "method_group":METHODS[method]["group"],"world_seed":case["world_seed"],
            "fault_mode":case["fault_mode"],"status":"started","workflow_candidate":case["workflow_candidate"],
            "contract_id":CONTRACT_VERSION,"formal_universal_release_result":False,
            "new_canonical_g2_claim":False,"agent_is_learned_vlm":False}
    try:
        world=DispatchWorld(case["world_seed"],root/".cache")
        record["initial_state_hash"]=world.initial_state_hash
        write_json(folder/"initial_state.private.json",world.initial_state)
        order=case["order"]
        record["initial_geometry_unsolved"]=not world.evaluator_goal(order["sku"],order["bay_id"])["inside_requested_bay"]
        ledger=DispatchLedger(folder/"database.sqlite",order,
                              lose_first_commit_response=case["fault_mode"]=="reply_lost_after_commit")
        initial_database=ledger.snapshot()
        record["initial_database_hash"]=digest(initial_database)
        write_json(folder/"initial_database.private.json",initial_database)
        config=METHODS[method]
        service=ToolService(world,ledger,folder,order,image_store_root=root,
                            allow_oracle=config["oracle"],deny_camera=config["no_image"],
                            deny_order_lookup=config["no_order"],max_control_steps=4000)
        # Dataset input image is saved independently of diagnostic method access.
        capture=service._capture()
        service.frame_receipts[-1]["role"]="dataset_initial_observation"
        initial_frame=service.frame_receipts[-1]
        record["initial_image_ref"]=capture["image_attachment"]
        record["initial_pixel_sha256"]=capture["pixel_sha256"]
        public_packet={
            "case_id":case["case_id"],"instruction":case["public_instruction"],
            "initial_rgb":{k:v for k,v in capture.items() if k not in {"ok","frame_id"}},
            "robot_profile":"Sawyer native Cartesian/gripper control",
            "modality_origin":"rendered robot workcell; no human video",
            "allowed_tools":list(TOOL_ARGUMENTS),
            "tool_schema_file":"tool_schemas.json",
            "evaluation_kind":"program/skill feasibility, not learned VLA benchmark results",
            "diagnostic_method_access":{"image_disabled":config["no_image"],"order_lookup_disabled":config["no_order"],
                                        "privileged_pose_enabled":config["oracle"]},
            "initial_rgb_is_not_delivered_to_image_disabled_control":config["no_image"],
        }
        write_json(folder/"public_packet.json",public_packet)
        try:
            record["agent_result"]=run_agent(method,order["order_id"],service.call)
            record["agent_exception"]=False
        except Exception as exc:
            # A failed program still has an observable final world/database.
            # Preserve that evidence rather than dropping the trial.
            record["agent_result"]={"agent_status":"program_exception","error_type":type(exc).__name__,"error":str(exc)}
            record["agent_exception"]=True
        physics=world.evaluator_goal(order["sku"],order["bay_id"])
        final_database=ledger.snapshot()
        digital=evaluate_digital_state(final_database,order)
        changed_commits=[r for r in service.private_commit_evidence if r["ledger_effect"] and r["ledger_effect"]["mutated"]]
        after_physics=bool(changed_commits) and all(r["physical_state_at_call"]["physical_success"] for r in changed_commits)
        record.update({
            "status":"completed","physics":physics,"digital":digital,
            "commits_after_physical_completion":after_physics,
            "joint_success":bool(physics["physical_success"] and digital["digital_success"] and after_physics),
            "tool_calls":len(service.events),"control_steps":world.steps,
            "fault_triggered":ledger.fault_fired,"dispatch_events":len(final_database["dispatch_events"]),
            "final_database_hash":digest(final_database),
            "private_perception_samples":len(service.private_perception_evidence),
        })
        write_json(folder/"final_database.private.json",final_database)
        write_json(folder/"final_state.private.json",world.evaluator_state())
        capture=service._capture();service.frame_receipts[-1]["role"]="evaluator_final_observation"
        record["final_image_ref"]=capture["image_attachment"]
        record["final_pixel_sha256"]=capture["pixel_sha256"]
    except Exception as exc:
        record.update(status="error",error_type=type(exc).__name__,error_summary=str(exc),
                      joint_success=False)
    finally:
        if world is not None:
            trace=folder/"physics_trace.npz"
            np.savez_compressed(trace,
                actions=np.asarray(world.actions,dtype=np.float32).reshape((-1,4)),
                qpos=np.asarray(world.qpos_trace),qvel=np.asarray(world.qvel_trace),
                simulator_time=np.asarray(world.time_trace),robot_tcp=np.asarray(world.tcp_trace))
            record["trace_file"]=str(trace.relative_to(root))
            record["trace_sha256"]=file_hash(trace)
            record["control_steps"]=world.steps
            record["simulator_warning_delta"]=(np.array([w.number for w in world.data.warning])-world.warning_start).tolist()
        if service is not None:
            write_json(folder/"tool_events.json",service.events)
            write_json(folder/"frames.json",service.frame_receipts)
            write_json(folder/"commit_evidence.private.json",service.private_commit_evidence)
            write_json(folder/"perception_evidence.private.json",service.private_perception_evidence)
            record["tool_event_sha256"]=file_hash(folder/"tool_events.json")
            record["frame_manifest_sha256"]=file_hash(folder/"frames.json")
        if ledger is not None:ledger.close()
        if world is not None:world.close()
    record["wall_seconds"]=time.perf_counter()-start
    write_json(folder/"record.json",record)
    return record


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--output",type=Path,required=True)
    parser.add_argument("--seeds",type=int,nargs="+",required=True)
    parser.add_argument("--faults",nargs="+",choices=["clean","reply_lost_after_commit"],default=["clean","reply_lost_after_commit"])
    parser.add_argument("--methods",nargs="+",choices=list(METHODS),default=list(METHODS))
    parser.add_argument("--workers",type=int,default=2)
    parser.add_argument("--phase",choices=["development","frozen_pilot"],default="development")
    args=parser.parse_args()
    if args.output.exists():parser.error("Use a fresh immutable run directory")
    if len(set(args.seeds))!=len(args.seeds) or len(set(args.methods))!=len(args.methods) or len(set(args.faults))!=len(args.faults):
        parser.error("Duplicate seeds, methods or conditions")
    if not 1<=args.workers<=4:parser.error("Use 1–4 processes")
    root=args.output.resolve();root.mkdir(parents=True)
    cases=make_cases(args.seeds,args.faults)
    source_dir=Path(__file__).parent
    sources={p.name:file_hash(p) for p in sorted(source_dir.glob("*.py"))}
    for p in sorted(source_dir.glob("*.py")):
        (root/"runtime_source").mkdir(exist_ok=True);shutil.copy2(p,root/"runtime_source"/p.name)
    sources["parent_common.py"]=file_hash(source_dir.parent/"common.py")
    shutil.copy2(source_dir.parent/"common.py",root/"runtime_source/parent_common.py")
    _,recipe=build_scene(root/".cache")
    protocol={
        "contract_id":CONTRACT_VERSION,"phase":args.phase,
        "created_at":datetime.now(timezone.utc).isoformat(),
        "data_origin":"synthetic simulator images and synthetic SQLite orders/inventory",
        "workflow_candidates":1,"world_seeds":args.seeds,"fault_conditions":args.faults,
        "cases":len(cases),"methods":{m:METHODS[m] for m in args.methods},
        "requested_trials":len(cases)*len(args.methods),
        "main_method":"rgb_tools_closed_loop",
        "method_limit":"All methods are fixed programs/diagnostic controls; no learned VLM or VLA scores.",
        "missing_information_limit":"Ablated image/order controls deliberately guess in ambiguous conditions; their scores are not a fair model leaderboard.",
        "robot_controller":"Inherited native Sawyer Cartesian delta + gripper; motion controller reads robot TCP only",
        "reset_contract":"canonical_1e10: actual initial qpos/qvel/act/ctrl/mocap rounded to ten decimals, quaternions normalized, solver warmstart/external forces cleared, episode clock reset; no object pose edits during execution.",
        "control_period_seconds":.0125,"max_control_steps":4000,
        "physics_goal":"Whole target rigid box inside requested region; bottom face z in [-.006,.006]m and top at most.065m (geometric table-height proxy); last40-step translational speed<.04m/s; non-target displacement<=.02m",
        "digital_goal":"One correct dispatch event; correct completed order and inventory; no duplicate dispatch",
        "process_goal":"Every mutating dispatch write occurs after physical completion",
        "vision":"Color-component RGB centroid and known camera/top-plane calibration; no object-state input",
        "fault":"Deterministic loss of first successful commit response AFTER SQLite commit; synthetic API fault, not physical disturbance",
        "time_model":"Synchronous physics; no claim about asynchronous real-world latency",
        "identity_counting":"One authored workflow candidate; seed, SKU, bay and fault variants do not establish new canonical G2 task kinds",
        "source_hashes":sources,"scene_recipe":recipe,
        "packages":{p:importlib.metadata.version(p) for p in ["metaworld","mujoco","gymnasium","numpy","scipy","Pillow"]},
        "python":platform.python_version(),"platform":platform.platform(),"sqlite":sqlite3.sqlite_version,
        "formal_universal_release":False,
    }
    write_json(root/"protocol.json",protocol)
    write_json(root/"tool_schemas.json",TOOL_SCHEMAS)
    write_json(root/"workflow_candidate.json",WORKFLOW_CANDIDATE)
    write_json(root/"cases.private.json",cases)
    (root/"database_schema.sql").write_text(SQL_SCHEMA)
    jobs=[]
    for case in cases:
        for method in args.methods:
            trial_id="trial-"+digest({"case_id":case["case_id"],"method":method,"contract":CONTRACT_VERSION})[:20]
            jobs.append({"root":str(root),"case":case,"method":method,"trial_id":trial_id})
    write_json(root/"trial_manifest.json",[{k:v for k,v in j.items() if k!="root"} for j in jobs])
    results=[];started=time.perf_counter()
    if args.workers==1:
        for job in jobs:
            results.append(execute_trial(job))
            if len(results)%8==0:print(json.dumps({"completed":len(results),"requested":len(jobs),"errors":sum(r["status"]=="error" for r in results)}),flush=True)
    else:
        with ProcessPoolExecutor(max_workers=args.workers,mp_context=multiprocessing.get_context("spawn")) as pool:
            futures={pool.submit(execute_trial,j):j for j in jobs}
            for future in as_completed(futures):
                results.append(future.result())
                if len(results)%16==0:print(json.dumps({"completed":len(results),"requested":len(jobs),"errors":sum(r["status"]=="error" for r in results)}),flush=True)
    summary=[]
    for method in args.methods:
        selected=[r for r in results if r["method_id"]==method]
        n=len(selected)
        summary.append({"method_id":method,"trials":n,"errors":sum(r["status"]=="error" for r in selected),
            "program_exceptions":sum(r.get("agent_exception",False) for r in selected),
            "physical_success":sum(r.get("physics",{}).get("physical_success",False) for r in selected)/n,
            "digital_success":sum(r.get("digital",{}).get("digital_success",False) for r in selected)/n,
            "joint_success":sum(r["joint_success"] for r in selected)/n})
    report={"status":"execution_completed_pending_independent_validation",
            "wall_seconds":time.perf_counter()-started,"trials":len(results),"summary":summary}
    write_json(root/"execution_summary.json",report)
    print(json.dumps(report,indent=2),flush=True)


if __name__=="__main__":main()
