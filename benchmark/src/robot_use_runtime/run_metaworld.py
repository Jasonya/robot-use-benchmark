"""Run a preregistered native-task development panel and preserve actual traces."""
from __future__ import annotations

import argparse
from concurrent.futures import ProcessPoolExecutor, as_completed
from datetime import datetime, timezone
import json
import multiprocessing
import os
from pathlib import Path
import platform
import time
import traceback
import warnings
import shutil

import numpy as np

from .common import digest, file_hash, plain, write_json
from .metaworld_adapter import MetaWorldAdapter, available_tasks, make_reference_policy, reference_policy_name, versions

METHODS = ("scripted_reference", "uniform_random", "zero_action", "bc_linear", "bc_extra_trees")


def execute_trial(job: dict) -> dict:
    warnings.filterwarnings("ignore", message=r"Constant\(s\) may be too high.*", category=UserWarning)
    task = job["task_id"]
    trial_id = job["trial_id"]
    folder = Path(job["output"]) / "trials" / trial_id
    if folder.exists():
        raise FileExistsError(f"Trial output already exists: {trial_id}")
    folder.mkdir(parents=True)
    started = time.perf_counter()
    adapter = None
    record = {
        "schema_version": "native-execution-evidence-0.2",
        "trial_id": trial_id,
        "case_id": job["case_id"],
        "run_id": job["run_id"],
        "native_task_id": task,
        "global_canonical_g2_id": None,
        "source": {"work": "Meta-World", "package": "metaworld", "package_version": versions()["metaworld"]},
        "method_id": job["method"],
        "policy_seed": job["policy_seed"],
        "reset_seed": job["reset_seed"],
        "step_budget": job["horizon"],
        "phase": "development_native_task_validation",
        "official_scoring_allowed": False,
        "human_demonstration_used": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "started",
    }
    try:
        adapter = MetaWorldAdapter(task, job["reset_seed"], reset_mode=job["reset_mode"])
        reference = make_reference_policy(task) if job["method"] == "scripted_reference" else None
        learned = None
        if job["method"] in {"bc_linear","bc_extra_trees"}:
            from .learned_policies import LearnedPolicy
            learned=LearnedPolicy(job["policy_bundle_path"],task,job["method"])
            if job["reset_seed"] in learned.training_reset_seeds or adapter.initial_state_hash in learned.training_initial_state_hashes:
                raise ValueError("Evaluation case overlaps this learned policy's training pool")
            record["model_sha256"]=learned.model_sha256
            record["model_bundle_sha256"]=learned.bundle_sha256
            record["model_scope"]="state-based task-specific behavioral cloning; held-out initial-state evaluation"
        rng = np.random.default_rng(job["policy_seed"])
        obs = adapter.observation.copy()
        observations = [obs.copy()]
        qpos, qvel = [adapter.env.data.qpos.copy()], [adapter.env.data.qvel.copy()]
        actions, raw_actions, rewards, successes, geometry_checks, sim_times = [], [], [], [], [], [float(adapter.env.data.time)]
        info_rows = []
        record.update({
            "contract": adapter.contract,
            "contract_hash": digest(adapter.contract),
            "initial_state": adapter.initial_state,
            "initial_state_hash": adapter.initial_state_hash,
            "initial_observation_hash": adapter.initial_observation_hash,
            "initial_native_success": adapter.initial_native_success,
            "raw_native_reset_success_query": adapter.raw_native_reset_success_query,
            "reset_forward_audit": adapter.reset_forward_audit,
            "compiled_model_sha256": adapter.compiled_model_sha256,
            "model_file": adapter.relative_model_path,
            "model_file_sha256": adapter.model_file_hash,
            "reference_policy": reference_policy_name(task) if reference else None,
            "reference_policy_source_sha256": file_hash(adapter.reference_source_file) if reference else None,
        })
        for _ in range(job["horizon"]):
            if reference is not None:
                action = reference.get_action(obs.copy())
            elif learned is not None:
                action = learned.get_action(obs.copy())
            elif job["method"] == "uniform_random":
                action = rng.uniform(-1, 1, size=4)
            else:
                action = np.zeros(4)
            next_obs, reward, terminated, truncated, info, applied = adapter.step(action)
            raw_actions.append(np.asarray(action, dtype=np.float64))
            actions.append(applied)
            rewards.append(reward)
            successes.append(float(info["success"]))
            independent = adapter.independent_geometry_success()
            geometry_checks.append(-1 if independent is None else int(independent))
            info["adapter_native_sim_exception"] = bool(adapter.env._did_see_sim_exception)
            info_rows.append(info)
            observations.append(next_obs.copy())
            qpos.append(adapter.env.data.qpos.copy())
            qvel.append(adapter.env.data.qvel.copy())
            sim_times.append(float(adapter.env.data.time))
            obs = next_obs
            if terminated or truncated:
                break
        trace = folder / "trace.npz"
        np.savez_compressed(trace, observations=np.asarray(observations), actions=np.asarray(actions),
                            raw_actions=np.asarray(raw_actions), rewards=np.asarray(rewards), native_success=np.asarray(successes),
                            qpos=np.asarray(qpos), qvel=np.asarray(qvel), simulator_time=np.asarray(sim_times),
                            independent_geometry_success=np.asarray(geometry_checks, dtype=np.int8))
        write_json(folder / "native_info.json", info_rows)
        checked = [(a, b) for a, b in zip(successes, geometry_checks) if b >= 0]
        record.update({
            "status": "completed",
            "steps_executed": len(actions),
            "simulated_elapsed_seconds": sim_times[-1] - sim_times[0],
            "native_success_ever": bool(max(successes, default=0)),
            "native_success_final": bool(successes[-1]) if successes else False,
            "native_success_last_10_steps": len(successes) >= 10 and all(successes[-10:]),
            "first_native_success_step": next((i + 1 for i, value in enumerate(successes) if value), None),
            "action_clip_steps": int(np.any(np.abs(np.asarray(raw_actions) - np.asarray(actions)) > 1e-6, axis=1).sum()),
            "return": float(sum(rewards)),
            "final_info": info_rows[-1] if info_rows else {},
            "geometry_comparison_steps": len(checked),
            "geometry_comparison_disagreements": sum(bool(a) != bool(b) for a, b in checked),
            "native_sim_exception_steps": sum(row["adapter_native_sim_exception"] for row in info_rows),
            "trace_file": str(trace.relative_to(Path(job["output"]))),
            "trace_sha256": file_hash(trace),
            "native_info_file": str((folder / "native_info.json").relative_to(Path(job["output"]))),
            "native_info_sha256": file_hash(folder / "native_info.json"),
            "terminated": terminated if successes else False,
            "truncated": truncated if successes else False,
        })
    except Exception as error:
        # A failed method/engine run remains in the manifest; it is never silently omitted.
        record.update({"status": "error", "error_type": type(error).__name__, "error_message": str(error)})
        (folder / "error.log").write_text(traceback.format_exc())
    finally:
        if adapter is not None:
            try:
                adapter.close()
            except Exception as error:
                record["cleanup_error"] = {"type": type(error).__name__, "message": str(error)}
    record["wall_seconds"] = time.perf_counter() - started
    write_json(folder / "record.json", record)
    return {"trial_id": trial_id, "status": record["status"], "native_task_id": task, "method_id": job["method"],
            "native_success_ever": record.get("native_success_ever"), "wall_seconds": record["wall_seconds"],
            "error_type": record.get("error_type")}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--tasks", nargs="+", default=["all"])
    parser.add_argument("--seeds", nargs="+", type=int, default=[101, 102, 103, 104, 105])
    parser.add_argument("--methods", nargs="+", choices=METHODS, default=["scripted_reference","uniform_random","zero_action"])
    parser.add_argument("--repeats", type=int, default=1)
    parser.add_argument("--horizon", type=int, default=500)
    parser.add_argument("--workers", type=int, default=3)
    parser.add_argument("--reset-mode", choices=["native","forward_consistent"], default="forward_consistent")
    parser.add_argument("--policy-bundle",type=Path)
    args = parser.parse_args()
    if not 1 <= args.horizon <= 500 or not 1 <= args.workers <= 6 or args.repeats < 1:
        parser.error("Use 1–500 steps, 1–6 workers and positive repeats")
    tasks = available_tasks() if args.tasks == ["all"] else sorted(set(args.tasks))
    if set(tasks) - set(available_tasks()):
        parser.error("Unknown native task IDs")
    if len(set(args.seeds)) != len(args.seeds):
        parser.error("Duplicate reset seeds would not create additional instances")
    if len(set(args.methods)) != len(args.methods):
        parser.error("Duplicate methods")
    if set(args.methods)&{"bc_linear","bc_extra_trees"}:
        if not args.policy_bundle:
            parser.error("Learned methods require a policy bundle")
        model_info=json.loads((args.policy_bundle/"bundle.json").read_text())
        if set(args.seeds)&set(model_info["training_reset_seeds"]):
            parser.error("Evaluation reset seeds overlap the policy training pool")
    if args.output.exists():
        parser.error("Output directory exists; choose a fresh immutable run directory")
    args.output.mkdir(parents=True)
    runtime_source = {path.name: file_hash(path) for path in Path(__file__).parent.glob("*.py")}
    source_snapshot=args.output/"runtime_source"
    source_snapshot.mkdir()
    for name in runtime_source:
        shutil.copy2(Path(__file__).parent/name,source_snapshot/name)
    protocol = {
        "native_tasks": tasks,
        "reset_seeds": args.seeds,
        "methods": args.methods,
        "policy_repeats": args.repeats,
        "horizon": args.horizon,
        "reset_mode": args.reset_mode,
        "versions": versions(),
        "runtime_source_sha256": runtime_source,
        "model_bundle_sha256": file_hash(args.policy_bundle/"bundle.json") if args.policy_bundle else None,
        "scoring": "native_success_ever; also report final and last-10-step success",
        "invalidity_rule": "Record every requested trial. Flag errors, non-finite states, reset mismatches and initially solved cases. Do not discard method failures.",
        "eligibility_scope": "All selected native environments under the same declared state+goal/action contract. No claim of canonical G2 or deployment-domain coverage.",
        "preregistered_before_execution": True,
    }
    run_id = "mw-dev-" + digest(protocol)[:16]
    write_json(args.output / "protocol.json", protocol)
    write_json(args.output / "provenance.json", {
        "run_id": run_id, "protocol_sha256": file_hash(args.output / "protocol.json"),
        "runtime_source_sha256": runtime_source,
        "python": platform.python_version(), "system": platform.system(), "machine": platform.machine(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "execution_mode": "actual_native_simulator_execution", "official_universal_benchmark_release": False,
    })
    jobs = []
    for task in tasks:
        for seed in args.seeds:
            case_id = "mw-case-" + digest({"task": task, "seed": seed, "versions": versions(), "reset_mode":args.reset_mode})[:18]
            for method in args.methods:
                for repeat in range(args.repeats):
                    policy_seed = 900_000 + repeat
                    trial_id = "trial-" + digest({"case": case_id, "method": method, "policy_seed": policy_seed, "protocol": protocol})[:22]
                    jobs.append({"run_id": run_id, "case_id": case_id, "trial_id": trial_id, "task_id": task,
                                 "reset_seed": seed, "method": method, "policy_seed": policy_seed,
                                 "horizon": args.horizon, "output": str(args.output.resolve())})
                    jobs[-1]["reset_mode"] = args.reset_mode
                    if args.policy_bundle:
                        jobs[-1]["policy_bundle_path"]=str(args.policy_bundle.resolve())
    public_jobs = [{k: v for k, v in job.items() if k not in {"output","policy_bundle_path"}} for job in jobs]
    write_json(args.output / "trial_manifest.json", public_jobs)
    print(json.dumps({"run_id": run_id, "native_tasks": len(tasks), "requested_cases": len(tasks)*len(args.seeds),
                      "requested_trials": len(jobs), "workers": args.workers}), flush=True)
    started = time.perf_counter()
    outcomes = []
    with ProcessPoolExecutor(max_workers=args.workers, mp_context=multiprocessing.get_context("spawn")) as executor:
        pending = [executor.submit(execute_trial, job) for job in jobs]
        for future in as_completed(pending):
            outcome = future.result()
            outcomes.append(outcome)
            if len(outcomes) % 25 == 0 or outcome["status"] == "error" or len(outcomes) == len(jobs):
                print(json.dumps({"completed": len(outcomes), "requested": len(jobs),
                                  "errors": sum(r["status"] == "error" for r in outcomes),
                                  "elapsed_seconds": round(time.perf_counter() - started, 1),
                                  "latest": outcome}, ensure_ascii=False), flush=True)
    write_json(args.output / "execution_index.json", {"run_id": run_id, "requested_trials": len(jobs),
                "outcomes": sorted(outcomes, key=lambda row: row["trial_id"]),
                "wall_seconds": time.perf_counter() - started,
                "validation_required": True})


if __name__ == "__main__":
    main()
