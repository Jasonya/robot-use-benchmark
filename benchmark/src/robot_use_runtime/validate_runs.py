"""Verify immutable trial manifests, saved traces, paired resets and native endpoint counts."""
from __future__ import annotations

import argparse
from collections import Counter, defaultdict
import csv
import json
from pathlib import Path
import time

import numpy as np

from .common import digest, file_hash, write_json
from .metaworld_adapter import MetaWorldAdapter, versions


def replay_record(root: Path, record: dict, tolerance: float) -> dict:
    adapter = MetaWorldAdapter(record["native_task_id"], record["reset_seed"],
                               reset_mode=record["contract"].get("reset_mode","native"))
    try:
        with np.load(root / record["trace_file"]) as saved:
            initial_match = adapter.initial_state_hash == record["initial_state_hash"]
            max_error = float(np.max(np.abs(adapter.observation - saved["observations"][0])))
            success_disagreements = 0
            for index, action in enumerate(saved["actions"]):
                obs, _, terminated, truncated, info, _ = adapter.step(action)
                max_error = max(max_error, float(np.max(np.abs(obs - saved["observations"][index + 1]))))
                success_disagreements += bool(info["success"]) != bool(saved["native_success"][index])
            return {"trial_id": record["trial_id"], "native_task_id": record["native_task_id"],
                    "initial_state_hash_matches": initial_match, "max_observation_abs_error": max_error,
                    "success_disagreements": success_disagreements,
                    "passed": initial_match and max_error <= tolerance and success_disagreements == 0}
    finally:
        adapter.close()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("run", type=Path)
    parser.add_argument("--replay-per-task", type=int, default=1)
    parser.add_argument("--tolerance", type=float, default=1e-8)
    args = parser.parse_args()
    root = args.run
    manifest = json.loads((root / "trial_manifest.json").read_text())
    protocol = json.loads((root / "protocol.json").read_text())
    provenance = json.loads((root / "provenance.json").read_text())
    assert file_hash(root / "protocol.json") == provenance["protocol_sha256"], "Protocol changed after execution"
    assert protocol["versions"] == versions(), "Replay requires the same package versions"
    records = []
    issues = []
    manifest_ids = {job["trial_id"] for job in manifest}
    assert len(manifest_ids) == len(manifest)
    actual_ids = {path.parent.name for path in (root / "trials").glob("*/record.json")}
    assert actual_ids == manifest_ids, "Missing or unexpected trial records"
    case_hashes = defaultdict(set)
    for job in manifest:
        record = json.loads((root / "trials" / job["trial_id"] / "record.json").read_text())
        for key in ["trial_id", "case_id", "native_task_id", "method_id", "reset_seed", "policy_seed"]:
            expected = job[{"native_task_id":"task_id", "method_id":"method"}.get(key, key)]
            assert record[key] == expected, (key, record["trial_id"])
        records.append(record)
        if record["status"] != "completed":
            issues.append({"trial_id": record["trial_id"], "kind": "execution_error", "detail": record.get("error_type")})
            continue
        assert file_hash(root / record["trace_file"]) == record["trace_sha256"]
        assert file_hash(root / record["native_info_file"]) == record["native_info_sha256"]
        assert digest(record["contract"]) == record["contract_hash"]
        assert digest(record["initial_state"]) == record["initial_state_hash"]
        case_hashes[record["case_id"]].add(record["initial_state_hash"])
        with np.load(root / record["trace_file"]) as trace:
            length = record["steps_executed"]
            assert trace["observations"].shape == (length + 1, 39)
            assert trace["actions"].shape == (length, 4)
            assert np.isfinite(trace["observations"]).all() and np.isfinite(trace["qpos"]).all()
            assert np.isfinite(trace["qvel"]).all() and np.isfinite(trace["actions"]).all()
            assert np.abs(trace["actions"]).max() <= 1 + 1e-7
            assert bool(trace["native_success"].max()) == record["native_success_ever"]
            assert bool(trace["native_success"][-1]) == record["native_success_final"]
            assert (len(trace["native_success"]) >= 10 and bool(np.all(trace["native_success"][-10:]))) == record["native_success_last_10_steps"]
            assert record["steps_executed"] <= protocol["horizon"]
        if record["geometry_comparison_disagreements"]:
            issues.append({"trial_id":record["trial_id"],"kind":"geometry_evaluator_disagreement","steps":record["geometry_comparison_disagreements"]})
        if record.get("native_sim_exception_steps",0):
            issues.append({"trial_id":record["trial_id"],"kind":"native_engine_exception_flag","steps":record["native_sim_exception_steps"]})
        if record.get("reset_forward_audit"):
            assert all(record["reset_forward_audit"][key] for key in ["qpos_unchanged","qvel_unchanged","simulation_time_unchanged"])
    reset_mismatches = {case:len(hashes) for case, hashes in case_hashes.items() if len(hashes) != 1}
    for case, count in reset_mismatches.items():
        issues.append({"case_id":case,"kind":"paired_reset_mismatch","distinct_initial_hashes":count})
    completed = [r for r in records if r["status"] == "completed"]
    replay = []
    started = time.perf_counter()
    for task in protocol["native_tasks"]:
        replay_method="scripted_reference" if "scripted_reference" in protocol["methods"] else protocol["methods"][0]
        selected = sorted([r for r in completed if r["native_task_id"] == task and r["method_id"] == replay_method],
                          key=lambda r:(r["reset_seed"],r["policy_seed"]))[:args.replay_per_task]
        for record in selected:
            result = replay_record(root,record,args.tolerance)
            replay.append(result)
            if not result["passed"]:
                issues.append({"trial_id":record["trial_id"],"kind":"action_replay_mismatch"})
    rows = []
    for task in protocol["native_tasks"]:
        for method in protocol["methods"]:
            selected = [r for r in records if r["native_task_id"] == task and r["method_id"] == method]
            done = [r for r in selected if r["status"] == "completed"]
            nontrivial = [r for r in done if not r["initial_native_success"] and r["case_id"] not in reset_mismatches]
            rows.append({
                "native_task_id":task, "method_id":method, "requested_trials":len(selected),
                "completed_trials":len(done), "execution_errors":len(selected)-len(done),
                "initially_solved_trials":sum(r["initial_native_success"] for r in done),
                "native_success_ever_all_requested":sum(r.get("native_success_ever",False) for r in selected)/len(selected),
                "native_success_final_all_requested":sum(r.get("native_success_final",False) for r in selected)/len(selected),
                "native_success_last_10_all_requested":sum(r.get("native_success_last_10_steps",False) for r in selected)/len(selected),
                "nontrivial_completed_trials":len(nontrivial),
                "success_ever_nontrivial_completed":sum(r["native_success_ever"] for r in nontrivial)/len(nontrivial) if nontrivial else None,
            })
    with (root / "native_results.csv").open("w",encoding="utf-8-sig",newline="") as fp:
        writer=csv.DictWriter(fp,fieldnames=list(rows[0]),lineterminator="\n");writer.writeheader();writer.writerows(rows)
    reference_by_task = {task:[r for r in completed if r["native_task_id"]==task and r["method_id"]=="scripted_reference"] for task in protocol["native_tasks"]}
    report = {
        "schema_version":"native-validation-0.2", "run_id":provenance["run_id"],
        "status":"passed" if not issues else "issues_found",
        "native_task_ids":len(protocol["native_tasks"]), "requested_cases":len({j["case_id"] for j in manifest}),
        "requested_trials":len(manifest), "completed_trials":len(completed), "execution_errors":len(records)-len(completed),
        "simulation_steps":sum(r.get("steps_executed",0) for r in records),
        "distinct_task_bound_initial_states":len({(r["native_task_id"],r["initial_state_hash"]) for r in completed}),
        "paired_reset_mismatch_cases":len(reset_mismatches),
        "initially_solved_cases":len({r["case_id"] for r in completed if r["initial_native_success"]}),
        "reset_mode":protocol.get("reset_mode","native"),
        "reset_success_query_changed_cases":len({r["case_id"] for r in completed if r.get("reset_forward_audit") and r["reset_forward_audit"]["raw_native_success_query"] != r["reset_forward_audit"]["synchronized_success_query"]}),
        "native_sim_exception_steps":sum(r.get("native_sim_exception_steps",0) for r in completed),
        "reference_native_tasks_with_any_success":sum(any(r["native_success_ever"] for r in group) for group in reference_by_task.values()) if "scripted_reference" in protocol["methods"] else None,
        "reference_native_tasks_all_tested_seeds_successful":sum(bool(group) and all(r["native_success_ever"] for r in group) for group in reference_by_task.values()) if "scripted_reference" in protocol["methods"] else None,
        "independent_geometry_steps":sum(r.get("geometry_comparison_steps",0) for r in completed),
        "independent_geometry_disagreements":sum(r.get("geometry_comparison_disagreements",0) for r in completed),
        "replayed_trials":len(replay), "replay_failures":sum(not r["passed"] for r in replay),
        "replay_tolerance":args.tolerance, "replay_wall_seconds":time.perf_counter()-started,
        "global_canonical_g2_count":None, "new_universal_task_count":0, "official_scoring_allowed":False,
        "capability_claim":"Native inherited rigid/articulated manipulation under a state+goal contract. No human-video, deployment-domain, bimanual, deformable, or universal-scale claim.",
        "evaluation_validity_limit":"Native goal predicates are retained. Geometric agreement is checked only for reach/window tasks; other independent evaluator audits and process-compliance tests remain required. Forward reset synchronization is an explicitly versioned adapter modification.",
        "methods_are_development_controls_not_final_vla_baselines":True,
        "issues":issues, "replays":replay, "results":rows,
    }
    write_json(root / "validation.json",report)
    print(json.dumps({key:value for key,value in report.items() if key not in {"replays","results","issues"}},ensure_ascii=False,indent=2))
    if issues:
        print(json.dumps({"issues":issues[:15]},ensure_ascii=False,indent=2))


if __name__ == "__main__":
    main()
