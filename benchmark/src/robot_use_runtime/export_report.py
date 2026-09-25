"""Export checked development results, paired uncertainty and concise public evidence."""
from __future__ import annotations
import argparse
from datetime import datetime,timezone
import json
from pathlib import Path
import shutil
import csv

import numpy as np

from .common import file_hash,write_json


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--run",type=Path,required=True)
    parser.add_argument("--training-run",type=Path,required=True)
    parser.add_argument("--run-history",type=Path,required=True)
    parser.add_argument("--output",type=Path,required=True)
    args=parser.parse_args()
    validation=json.loads((args.run/"validation.json").read_text())
    models=json.loads((args.run/"learned_model_validation.json").read_text())
    assert validation["status"]==models["status"]=="passed"
    protocol=json.loads((args.run/"protocol.json").read_text())
    records=[json.loads(p.read_text()) for p in (args.run/"trials").glob("*/record.json")]
    tasks=protocol["native_tasks"];seeds=protocol["reset_seeds"];methods=protocol["methods"]
    lookup={(r["native_task_id"],r["reset_seed"],r["method_id"]):r for r in records}
    # Equal-task means, preserving identical seed/method pairing. Reusing a seed
    # across tasks creates a shared randomization block, so bootstrap that block.
    tensors={}
    for field in ["native_success_ever","native_success_final","native_success_last_10_steps"]:
        tensors[field]=np.array([[[float(lookup[(task,seed,method)][field]) for method in methods]
                                 for seed in seeds] for task in tasks])
    rng=np.random.default_rng(20260925)
    bootstrap_indices=rng.integers(0,len(seeds),size=(10000,len(seeds)))
    summary=[]
    boot={}
    for field,tensor in tensors.items():
        seed_block_scores=tensor.mean(axis=0)
        boot[field]=seed_block_scores[bootstrap_indices].mean(axis=1)
    for index,method in enumerate(methods):
        item={"method_id":method,"evaluated_native_tasks":len(tasks),"evaluated_cases":len(tasks)*len(seeds)}
        for field,tensor in tensors.items():
            values=boot[field][:,index]
            item[field]=float(tensor[:,:,index].mean())
            degenerate=bool(np.ptp(tensor[:,:,index].mean(axis=0))==0)
            item[field+"_ci95"]=None if degenerate else [float(v) for v in np.quantile(values,[0.025,0.975])]
            item[field+"_bootstrap_degenerate"]=degenerate
        summary.append(item)
    differences=[]
    if "bc_extra_trees" in methods and "bc_linear" in methods:
        i,j=methods.index("bc_extra_trees"),methods.index("bc_linear")
        values=boot["native_success_ever"][:,i]-boot["native_success_ever"][:,j]
        differences.append({"contrast":"bc_extra_trees minus bc_linear","metric":"native_success_ever",
                            "difference":float(tensors["native_success_ever"][:,:,i].mean()-tensors["native_success_ever"][:,:,j].mean()),
                            "paired_ci95":[float(v) for v in np.quantile(values,[0.025,0.975])]})
    history=[]
    for folder in sorted(args.run_history.iterdir()):
        index=folder/"execution_index.json"
        if not index.exists():
            continue
        data=json.loads(index.read_text())
        history.append({"run_id":data["run_id"],"run_folder":folder.name,"requested_trials":data["requested_trials"],
                        "completed_trials":sum(r["status"]=="completed" for r in data["outcomes"]),
                        "wall_seconds":data["wall_seconds"]})
    train_validation=json.loads((args.training_run/"validation.json").read_text())
    primary_case_states=set()
    for folder in [args.training_run,args.run]:
        for path in (folder/"trials").glob("*/record.json"):
            r=json.loads(path.read_text())
            if r["status"]=="completed":
                primary_case_states.add((r["native_task_id"],r["initial_state_hash"]))
    report={
        "version":"development-execution-report-1.0","date":datetime.now(timezone.utc).date().isoformat(),
        "status":"validated_native_development_evidence",
        "benchmark_design_version":"0.4","runtime_contract_version":"0.2",
        "main_test_run_id":validation["run_id"],"training_pool_run_id":train_validation["run_id"],
        "native_source":"Meta-World","native_task_ids_executed":len(tasks),
        "held_out_initial_cases":validation["distinct_task_bound_initial_states"],
        "held_out_method_trials":validation["completed_trials"],
        "training_pool_initial_cases":train_validation["distinct_task_bound_initial_states"],
        "distinct_forward_consistent_native_initial_cases":len(primary_case_states),
        "recorded_trial_history_total":sum(r["completed_trials"] for r in history),
        "history_counts_include_development_and_reset_audit_runs_not_new_tasks":True,
        "global_canonical_g2_count":None,"new_universal_task_count":0,
        "official_universal_release_available":False,
        "native_goal_metric":"native success at any step; final and sustained-last-ten endpoints are separate",
        "input_contract":"39-dimensional native state with explicit goal; no images or human video",
        "embodiment":"native single Sawyer arm and gripper",
        "materials_validated_in_this_run":"native rigid/articulated manipulation only",
        "training_seeds":models["training_reset_seeds"],"test_seeds":models["test_reset_seeds"],
        "generalization_scope":models["generalization_claim"],
        "method_scope":"Task-specific state BC models and development controls; not generalist VLA baselines",
        "uncertainty":{"method":"paired percentile bootstrap over shared reset-seed blocks, conditional on the fixed 50 native tasks",
                       "replicates":10000,"seed":20260925,"independent_seed_blocks":len(seeds),
                       "limitation":"Only five reset-seed blocks; intervals are descriptive and do not establish population-level or task-family generalization. Degenerate all-equal block outcomes receive null intervals, not a false zero-width confidence claim."},
        "summary":summary,"paired_contrasts":differences,
        "validation":{
            "all_requested_trials_present":True,"execution_errors":validation["execution_errors"],
            "paired_reset_mismatch_cases":validation["paired_reset_mismatch_cases"],
            "initially_solved_cases_after_sync":validation["initially_solved_cases"],
            "raw_reset_success_queries_changed_cases":validation["reset_success_query_changed_cases"],
            "independent_geometry_steps":validation["independent_geometry_steps"],
            "independent_geometry_disagreements":validation["independent_geometry_disagreements"],
            "replayed_test_trials":validation["replayed_trials"],"replay_failures":validation["replay_failures"],
            "learned_action_steps_recomputed":models["action_steps_checked"],
            "learned_action_max_error":models["max_action_abs_error"],
            "training_test_initial_hashes_disjoint":models["initial_state_hashes_disjoint"],
            "general_evaluator_validity":"native predicates retained; only reach/window have separate geometric agreement checks, not all process or stability requirements"}
        ,"run_history":history,
        "input_hashes":{file:file_hash(args.run/file) for file in ["protocol.json","provenance.json","trial_manifest.json","validation.json","learned_model_validation.json"]},
        "task_results":validation["results"],
        "remaining_scope":["cross-work canonical task reconciliation","deployment-domain and multi-material coverage","human observation-to-execution","additional backends and robot profiles","full process-compliance and recovery evaluation","large-scale frozen universal release"]
    }
    args.output.mkdir(parents=True,exist_ok=True)
    write_json(args.output/"execution_report.json",report)
    for file in ["native_results.csv","protocol.json","provenance.json","learned_model_validation.json"]:
        shutil.copy2(args.run/file,args.output/file)
    with (args.output/"method_summary.csv").open("w",encoding="utf-8-sig",newline="") as fp:
        fields=["method_id","evaluated_native_tasks","evaluated_cases","native_success_ever","native_success_ever_ci95_low","native_success_ever_ci95_high","native_success_final","native_success_last_10_steps"]
        writer=csv.DictWriter(fp,fieldnames=fields,lineterminator="\n");writer.writeheader()
        for row in summary:
            writer.writerow({**{key:row[key] for key in fields if key in row},
                "native_success_ever_ci95_low":row["native_success_ever_ci95"][0] if row["native_success_ever_ci95"] else None,
                "native_success_ever_ci95_high":row["native_success_ever_ci95"][1] if row["native_success_ever_ci95"] else None})
    md=["# 本機原生執行與基線驗證","","這是 Meta-World 原生任務的開發證據，沒有把它當成新增的通用 G2 任務或完整 VLA 排行榜。","",
        f"測試：{len(tasks)} 個原生任務、{len(seeds)} 個新初態種子、{validation['completed_trials']:,} 次方法執行。訓練使用其他初態，seed 與初態 hash 都不重疊。","",
        "| 方法 | 曾達原生成功 | episode 結束成功 | 最後10步持續成功 |","|---|---:|---:|---:|"]
    labels={"scripted_reference":"原生腳本參考","uniform_random":"均勻隨機","zero_action":"零動作","bc_linear":"線性 BC（分任務）","bc_extra_trees":"Extra Trees BC（分任務）"}
    for row in summary:
        md.append(f"| {labels[row['method_id']]} | {100*row['native_success_ever']:.1f}% | {100*row['native_success_final']:.1f}% | {100*row['native_success_last_10_steps']:.1f}% |")
    md+=["","主要指標沿用原生『任一時刻成功』；final／最後10步結果不同，不能互換，也不自動代表完整過程合規。BC 是使用相同 state＋goal 的任務專用模型，沒有接收人類影片或 RGB。","",
         "## 實際驗證","",
         f"- 所有 {validation['completed_trials']:,} 次測試均有完整記錄；沒有執行錯誤或跨方法 reset 不一致。",
         f"- 重播 {validation['replayed_trials']} 次測試，觀測誤差在宣告容差內、成功標記一致。",
         f"- 對 reach/window 的 {validation['independent_geometry_steps']:,} 個步驟作獨立幾何比對，沒有分歧；其他任務仍保留原生判分器的驗證限制。",
         f"- 從模型權重重新計算 {models['action_steps_checked']:,} 個學習模型動作，與記錄完全一致；測試 seed 為 {models['test_reset_seeds']}。",
         "- reset 修正只同步 MuJoCo kinematics 與初始觀測歷史，沒有改 qpos、qvel 或推進時間；window-close 的過期初態成功查詢已修正。","",
         "## 計數與統計界線","",
         f"- 目前 forward-consistent 訓練池＋測試共有 {len(primary_case_states)} 個原生 task-bound 初態；不是這麼多種獨立任務。",
         f"- 歷史累計記錄 {report['recorded_trial_history_total']:,} 次開發執行，包含初期接口／reset 診斷；主表僅用本次獨立測試集合。",
         "- 區間以共享 reset-seed 區塊做成對 bootstrap，條件在固定原生任務集合；僅有五個 seed blocks，不主張全體任務或真實機器人上的統計普遍性。",
         "- 所有 seed 區塊結果相同時，bootstrap 會退化。本報告將該區間標為不可估，而不把觀察到的 0% 寫成真正成功率必為 0 的證據。",
         "- 本次沒有完成全庫 G2 語義去重、跨場域／材料／機體驗證、人類影片到執行或通用 2× 規模門檻。",""]
    (args.output/"EXECUTION_EVIDENCE.md").write_text("\n".join(md))
    print(json.dumps({"native_tasks":len(tasks),"heldout_cases":len(tasks)*len(seeds),
        "heldout_trials":validation["completed_trials"],"recorded_trial_history_total":report["recorded_trial_history_total"],
        "method_summary":summary},indent=2))


if __name__=="__main__":
    main()
