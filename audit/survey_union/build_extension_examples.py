"""Author a task/rule grammar with provenance; no generated case count is claimed."""
from __future__ import annotations
import csv
import json
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parent
PROJECT = ROOT.parent.parent
WEB = PROJECT / "web" if (PROJECT / "web/content").exists() else PROJECT
PUBLIC = WEB / "content/survey_union"
records = {
    row["record_id"]: row
    for row in json.loads((ROOT / "task_source_bridge.json").read_text())
}
operators = [
    ("X01", "增加終態", "新增必要成果，與父任務一起成立", "task_spec_variant"),
    ("X02", "改變成功規則", "修改容差、完整性、排除或合規條件", "rule_variant"),
    ("X03", "必要順序", "以事件前後關係約束完成過程", "process_variant"),
    ("X04", "條件分支", "以可觀察條件選擇後續子目標", "conditional_task_spec"),
    ("X05", "跨任務組合", "將多個父任務接成有明確成果的工作", "composite_task_spec"),
    ("X06", "歷史指涉", "以合法歷史中的身份／狀態選取目標", "reference_variant"),
    ("X07", "容量與資源", "在有效解中加入容量、數量或工具限制", "constraint_variant"),
    ("X08", "協作與交接", "加入另一角色的時序、接收與共同結果", "role_variant"),
    ("X09", "恢復或復原", "定義介入後續作或恢復指定歷史狀態", "recovery_spec_or_intervention_case"),
    ("X10", "數位工具與物理一致", "查詢／版本／提交結果需與物理工作一致", "tool_process_variant"),
    ("X11", "觀測與泛化條件", "同規格換視角、資訊條件、資產或初態", "observation_or_instance_case"),
    ("X12", "資訊與預測輸出", "將活動轉為有來源支持的QA／程序／預測題型", "typed_information_spec"),
]
# Examples are authored specifications. A separating example is logical, not a
# simulated witness. Cross-work novelty and physical solvability remain separate.
specs = [
    ("EX01", "X01", ["behavior::fold_towels"], "摺疊後按尺寸收納",
     "將毛巾摺好", "摺疊符合尺寸規格，並放入對應收納區",
     "只在桌上摺好：父任務可滿足，但新增收納條件未滿足",
     "cloth_fold_quality; target_region; object_identity"),
    ("EX02", "X02", ["vima::constraint_satisfaction/sweep_without_touching"], "掃集時限制非目標物位移",
     "完成原掃集目標及原作限制", "為指定非目標物增加明確的整段位移上限",
     "掃集完成但非目標物超過新上限：原版是否接受依原作判分，新規格拒絕",
     "target_collection; protected_object_trace; tolerance"),
    ("EX03", "X03", ["arnold::open_drawer", "arnold::close_drawer"], "取物後關回抽屜",
     "達到指定抽屜開合程度", "開抽屜、取得指定物件、最後關回；加入必要事件順序",
     "最後抽屜關好但未取物：單一關閉任務可滿足，組合程序未完成",
     "drawer_state; grasp_or_acquired_object; event_order"),
    ("EX04", "X04", ["arnold::transfer_water"], "依接收容器餘量選擇分裝",
     "轉移到指定連續物料目標", "先取得容器餘量；容量足夠時一次轉移，不足時依規則分裝",
     "達到總轉移量但任一容器超容：新增容量分支規則拒絕",
     "source_and_destination_volume; capacity; branch_observation"),
    ("EX05", "X05", ["behavior::packing_meal_for_delivery", "behavior::delivering_groceries_to_doorstep"], "按訂單打包後交付",
     "來源分別提供打包與送達工作的起點", "按清單打包、保留載荷、送到指定交付點並完成確認",
     "打包正確但送錯交付點：打包子任務完成，組合任務未完成",
     "order_contents; container_state; load_retention; delivery_region"),
    ("EX06", "X06", ["vima::require_memory/manipulate_old_neighbor"], "按先前鄰接關係取回",
     "根據原作歷史／鄰接規則選取物件", "加入明訂參考時刻與物件身份，移動後仍按該時刻關係選取",
     "選了目前鄰居而非參考時刻的鄰居：兩套指涉規則給出不同答案",
     "history_snapshot; object_identity; reference_time"),
    ("EX07", "X07", ["rlbench::straighten_rope"], "拉直並保持端點在指定區",
     "完成原繩索拉直目標", "加上兩端點區域與禁止跨越區；確認材料模型可支援後實作",
     "繩索拉直但端點位於區外：原拉直目標可滿足，擴充約束未滿足",
     "rope_geometry; endpoints; forbidden_region"),
    ("EX08", "X08", ["behavior::delivering_groceries_to_doorstep"], "接收確認後才釋放載荷",
     "把物品送到指定交付位置", "加入接收方與可觀察接穩事件，之後才允許釋放",
     "物品到達但提前釋放：到達子目標可滿足，交接順序違反",
     "partner_model; supported_load; receive_event; release_event"),
    ("EX09", "X09", ["metaworld::assembly-v3"], "偏離後完成装配並復原工具",
     "完成原生裝配目標", "在記錄的中途偏離條件後完成裝配，並把使用工具放回指定狀態",
     "裝配成功但工具未復原：新增終態尚未全部完成",
     "assembly_predicate; intervention_event; tool_restoration"),
    ("EX10", "X10", ["vima::instruction_following/visual_manipulation"], "依最新有效訂單分揀並登記",
     "依視覺／文字提示移動指定物件", "查詢有效訂單版本，完成對應放置後登記；物理與數位結果需一致",
     "依過期版本正確放置：舊提示可滿足，最新版本規格不接受",
     "order_version; image_entity_binding; physical_goal; database_goal"),
    ("EX11", "X11", ["softgym::ClothFold"], "摺疊規格保持，增加觀測條件",
     "完成同一摺疊目標", "分別提供固定相機、多視角或可主動觀察條件；保留足夠線索",
     "這項擴充不宣稱新的物理目標；它形成不同的觀測測例",
     "same_fold_goal; camera_or_observation_contract; information_sufficiency"),
    ("EX12", "X12", ["crosstask::59684"], "從架子製作程序建立下一步判斷",
     "來源提供製作架子的活動與步驟定義", "給定可用影片前綴／已完成步驟，判斷下一個合法程序步驟",
     "下一步推論正確只滿足資訊題；機器人完成實物另有控制task",
     "activity_identity; observed_prefix; partial_order_or_reference_step; answer_set"),
]
result = []
for sid, operator, parents, name, before, after, counterexample, requirements in specs:
    assert all(parent in records for parent in parents), (sid, parents)
    result.append({
        "id": sid, "operator": operator, "name": name,
        "parent_source_ids": parents,
        "parent_paper_ids": sorted({p for parent in parents for p in records[parent]["paper_ids"]}),
        "parent_sources": [records[parent]["source_url"] for parent in parents],
        "base_definition": before, "extended_definition": after,
        "distinguishing_example": counterexample,
        "distinguishing_example_is_executed": False,
        "evaluator_requirements": requirements.split("; "),
        "status": "authored_extension_specification_not_executed",
        "novelty_vs_prior_union": "pending; equivalent existing rules must be linked rather than claimed new",
        "count_level": next(row[3] for row in operators if row[0] == operator),
        "scope": "Example design, not a calibrated difficulty label or valid case count.",
    })
grammar = {
    "version": "task-rule-extension-0.7",
    "operators": [
        {"id": sid, "name": name, "meaning": meaning, "default_count_level": level}
        for sid, name, meaning, level in operators
    ],
    "identity_fields": ["parent_source_ids", "base_task_id", "variant_spec_id",
                        "goal", "reference_rule", "process_constraints",
                        "resource_constraints", "evaluator_requirements"],
    "generation_process": ["select_parent_definition", "check_operator_applicability",
                           "author_goal_and_rule_change", "record_count_level",
                           "compare_existing_equivalents", "validate_definition",
                           "instantiate_and_test_separately"],
    "all_operator_products_are_valid": False,
    "parent_task_count_changes_on_every_rule_variant": False,
    "catalogue_inclusion_requires_simulator_execution": False,
    "authored_examples": len(result),
    "new_executed_cases": 0,
}
for name, data in [("extension_grammar.json", grammar), ("extension_examples.json", result)]:
    text = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    (ROOT / name).write_text(text)
    (PUBLIC / name).write_text(text)
with (ROOT / "extension_examples.csv").open("w", encoding="utf-8-sig", newline="") as fp:
    writer = csv.writer(fp, lineterminator="\n")
    writer.writerow(["id", "operator", "name", "parent_source_ids",
                     "base_definition", "extended_definition", "count_level", "status"])
    for row in result:
        writer.writerow([row[k] if not isinstance(row[k], list) else "; ".join(row[k])
                         for k in ["id", "operator", "name", "parent_source_ids",
                                   "base_definition", "extended_definition", "count_level", "status"]])
shutil.copy2(ROOT / "extension_examples.csv", PUBLIC / "extension_examples.csv")
lines = ["# 任務與規則擴充：12個可追溯的規格例子", "",
         "以下是作者規格，來源已有定義；尚未新增模擬測例或宣稱跨作新穎性。", "",
         "| ID／操作 | 來源任務 | 擴充定義 | 計數層 |",
         "|---|---|---|---|"]
for row in result:
    lines.append(f"| {row['id']}／{row['operator']} | {'; '.join(row['parent_source_ids'])} | "
                 f"{row['extended_definition']} | {row['count_level']} |")
lines += ["", "每例的父來源URL、邏輯區分例和判分需求見extension_examples.json。"
          "其中EX11是觀測測例，EX12是資訊題；沒有把它們改報成新的物理任務家族。", ""]
for path in [ROOT / "TASK_RULE_EXTENSIONS.md", PUBLIC / "TASK_RULE_EXTENSIONS.md"]:
    path.write_text("\n".join(lines))
print(json.dumps({"operators": len(operators), "examples": len(result),
                  "parent_ids_resolved": True, "new_executed_cases": 0}))
