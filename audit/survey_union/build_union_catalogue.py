"""Join the complete existing survey to task sources, without runtime gating."""
from __future__ import annotations

import ast
from collections import Counter, defaultdict
import csv
import hashlib
import json
from pathlib import Path
import re
import shutil
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parent
PROJECT = ROOT.parent.parent
WEB = PROJECT / "web" if (PROJECT / "web/content").exists() else PROJECT
PUBLIC = WEB / "content/survey_union"
PUBLIC.mkdir(parents=True, exist_ok=True)
CACHE = ROOT / ".cache"
read = lambda p: json.loads(p.read_text())
papers = read(WEB / "content/literature_refresh/unified_literature.json")
comparison = read(WEB / "content/benchmark_comparison/benchmark_matrix.json")
inventory = read(WEB / "content/scale_first/native_source_inventory.json")
semantics = {
    r["source_record_id"]: r
    for r in read(ROOT / "source_semantics_input.json" if (ROOT / "source_semantics_input.json").exists()
                  else PROJECT / "planning/semantic_registry/source_semantics_catalogue.json")
}
receipts = read(ROOT / "source_addition_receipts.json")
sources = {r["id"]: r for r in receipts["sources"]}


def source_key(url):
    found = re.search(r"\d{4}\.\d{4,5}", url)
    return found.group() if found else url


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def source_url(sid, path):
    source = sources[sid]
    return f"https://github.com/{source['repository']}/blob/{source['commit']}/{path}"


def write_json(name, value):
    text = json.dumps(value, ensure_ascii=False, indent=2) + "\n"
    (ROOT / name).write_text(text)
    (PUBLIC / name).write_text(text)


def write_csv(name, rows, fields):
    with (ROOT / name).open("w", encoding="utf-8-sig", newline="") as fp:
        writer = csv.DictWriter(fp, fieldnames=fields, lineterminator="\n", extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            writer.writerow({
                k: json.dumps(row.get(k), ensure_ascii=False)
                if isinstance(row.get(k), (list, dict)) else row.get(k)
                for k in fields
            })
    shutil.copy2(ROOT / name, PUBLIC / name)


by_url = {source_key(p["source_url"]): p for p in papers}
comparison_by_paper = {}
for row in comparison["rows"]:
    if row["group"] == "ours":
        continue
    ids = {
        by_url[source_key(ref["url"])]["id"]
        for ref in row["references"] if source_key(ref["url"]) in by_url
    }
    assert len(ids) == 1, (row["id"], ids)
    comparison_by_paper[next(iter(ids))] = row
assert len(comparison_by_paper) == 68

additions = []


def add(sid, native_id, title, unit, bucket, kind, pid, definition_path, **extra):
    item = {
        "record_id": f"{sid}::{native_id}", "source_id": sid,
        "native_id": native_id, "title": title,
        "native_unit": unit, "inventory_bucket": bucket, "task_kind": kind,
        "paper_ids": [pid], "repository": sources[sid]["repository"],
        "commit": sources[sid]["commit"], "definition_path": definition_path,
        "source_url": source_url(sid, definition_path),
        "definition_status": "official_native_definition_extracted",
        "common_task_mapping": "pending", "runtime_validation": "not_executed",
        "new_authored_task": False, "native_family": None, "native_domain": None,
        **extra,
    }
    additions.append(item)


# VIMA: parse official task-suite registrations and actual task_name declarations.
vima_tree = ast.parse((CACHE / "vima/files/vima_bench/tasks/__init__.py").read_text())
registration = next(
    node.value for node in vima_tree.body
    if isinstance(node, ast.Assign)
    and any(isinstance(target, ast.Name) and target.id == "_ALL_TASKS" for target in node.targets)
)
classes = {}
for path in sources["vima"]["selected_paths"]:
    if "task_suite/" not in path or not path.endswith(".py"):
        continue
    file = CACHE / "vima/files" / path
    for node in ast.parse(file.read_text()).body:
        if not isinstance(node, ast.ClassDef):
            continue
        names = [
            ast.literal_eval(member.value) for member in node.body
            if isinstance(member, ast.Assign)
            and any(isinstance(t, ast.Name) and t.id == "task_name" for t in member.targets)
        ]
        if names:
            classes[node.name] = (names[0], path, node.lineno)
for group, members in zip(registration.keys, registration.values):
    family = ast.literal_eval(group)
    for member in members.elts:
        task_name, path, line = classes[member.id]
        add("vima", family + "/" + task_name, task_name.replace("_", " "),
            "native_task_template", "native_task_candidates", "robot_control", "P075", path,
            native_family=family, native_class=member.id, definition_line=line,
            definition_sha256=digest(CACHE / "vima/files" / path))
assert len(additions) == 17

# ARNOLD: eight imported concrete task classes, excluding BaseTask/checkers.
arnold = ast.parse((CACHE / "arnold/files/tasks/__init__.py").read_text())
for node in arnold.body:
    if not isinstance(node, ast.ImportFrom) or node.level != 1 or node.module == "base_task":
        continue
    assert len(node.names) == 1
    path = f"tasks/{node.module}.py"
    if not (CACHE / "arnold/files" / path).exists():
        continue
    add("arnold", node.module, node.module.replace("_", " "),
        "native_task_class", "native_task_candidates", "robot_control", "P081", path,
        native_family="continuous_state_goal", native_class=node.names[0].name,
        definition_sha256=digest(CACHE / "arnold/files" / path))
assert len(additions) == 25

# COIN: retain the author's domain taxonomy and 180 activity identities.
ns = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
with zipfile.ZipFile(CACHE / "coin_video/files/taxonomy.xlsx") as z:
    strings = [
        "".join(node.itertext())
        for node in ET.fromstring(z.read("xl/sharedStrings.xml")).findall("s:si", ns)
    ]
    sheet = ET.fromstring(z.read("xl/worksheets/sheet1.xml"))
    domains_by_target = {}
    for row in sheet.findall(".//s:row", ns)[1:]:
        cells = {}
        for cell in row.findall("s:c", ns):
            value = cell.find("s:v", ns)
            if value is None:
                continue
            cells[re.sub(r"\d", "", cell.get("r"))] = (
                strings[int(value.text)] if cell.get("t") == "s" else value.text
            )
        if cells.get("A") and cells.get("B"):
            domains_by_target[cells["B"]] = cells["A"]
coin_db = read(CACHE / "coin_video/files/COIN.json")["database"]
coin = defaultdict(list)
for value in coin_db.values():
    coin[str(value["recipe_type"])].append(value)
for native_id, videos in sorted(coin.items(), key=lambda item: int(item[0])):
    names = {video["class"] for video in videos}
    assert len(names) == 1
    name = next(iter(names))
    assert name in domains_by_target, name
    step_ids = {step["id"] for video in videos for step in video["annotation"]}
    add("coin_video", native_id, name, "instructional_activity_definition",
        "human_activity_definitions", "human_video_procedure", "P003", "COIN.json",
        native_domain=domains_by_target[name], annotation_video_records=len(videos),
        annotated_step_label_ids=sorted(step_ids, key=int),
        taxonomy_path="taxonomy.xlsx",
        definition_sha256=digest(CACHE / "coin_video/files/COIN.json"))
assert len(coin) == 180
assert len(set(domains_by_target.values())) == 12

# CrossTask: keep primary and related activities as separately scoped sets.
crosstask_counts = {}
with zipfile.ZipFile(CACHE / "crosstask/crosstask_release.zip") as z:
    for split in ["primary", "related"]:
        name = f"crosstask_release/tasks_{split}.txt"
        blocks = re.split(r"\n\s*\n", z.read(name).decode().strip())
        crosstask_counts[split] = len(blocks)
        for block in blocks:
            lines = block.splitlines()
            assert len(lines) == 5
            native_id, title, procedure_url, count, labels = lines
            assert len(labels.split(",")) == int(count), native_id
            add("crosstask", native_id, title, "instructional_activity_definition",
                "human_activity_definitions", "human_video_procedure", "P004",
                "official_release/" + name, native_family=split,
                declared_step_count=int(count),
                source_url="https://www.di.ens.fr/~dzhukov/crosstask/crosstask_release.zip",
                archive_member=name, procedure_source_url=procedure_url,
                definition_sha256=hashlib.sha256(z.read(name)).hexdigest())
assert crosstask_counts == {"primary": 18, "related": 65}
assert len(additions) == 288

bridges = []
for row in inventory:
    sem = semantics[row["record_id"]]
    bridges.append({
        "record_id": row["record_id"], "source_id": row["source_id"],
        "native_id": row["native_id"], "title": row["title"],
        "native_unit": row["native_unit"], "inventory_bucket": row["inventory_bucket"],
        "paper_ids": row["paper_ids"], "source_url": row["source_url"],
        "repository": row["repository"], "commit": row["commit"],
        "definition_path": row["definition_path"],
        "definition_status": sem["index_status"],
        "declared_goal_count": len(sem["declared_goals"]),
        "direct_checker_indexed": sem["direct_checker_methods_available"],
        "configuration_only_derivation": bool(row["native_metadata"].get("configuration_only_derived_class")),
        "common_task_mapping": "pending",
        "runtime_validation": row["runtime_validation"],
        "collection_snapshot": "2026-09-22/25",
        "native_domain": None, "native_family": None,
        "new_authored_task": False,
    })
bridges.extend({**row, "collection_snapshot": "2026-09-29"} for row in additions)
assert len(bridges) == 5308
assert len({row["record_id"] for row in bridges}) == len(bridges)
assert all(pid in {p["id"] for p in papers} for r in bridges for pid in r["paper_ids"])
by_paper = defaultdict(list)
for row in bridges:
    for pid in row["paper_ids"]:
        by_paper[pid].append(row)

rows = []
for paper in papers:
    comp = comparison_by_paper.get(paper["id"])
    flagged = paper.get("new_benchmark_contribution") == "yes"
    benchmark_source = comp is not None or flagged
    flags = paper.get("contribution_types", "").split(";")
    role = (
        "benchmark_or_evaluation_resource" if benchmark_source else
        "survey_or_evaluation_method" if paper["primary_category_code"] == "S" else
        "role_review_pending" if paper.get("snapshot_membership") == "supplement_2026_09_25" else
        "data_or_method_resource"
    )
    task_rows = by_paper[paper["id"]]
    row = {
        "paper_id": paper["id"], "name": paper["short_name"], "title": paper["title"],
        "year": paper["year"], "source_url": paper["source_url"],
        "category": paper["primary_category_code"],
        "category_name": paper["primary_category_zh"],
        "role": role, "benchmark_source_registered": benchmark_source,
        "role_basis": "detailed_comparison_row" if comp else
            "existing_bibliography_benchmark_contribution_annotation" if flagged else
            "retained_related_work_not_promoted_to_benchmark",
        "detailed_comparison_id": comp["id"] if comp else None,
        "evidence_depth": paper["evidence_depth"],
        "scope_note": paper["scope_note"], "family_label_as_recorded": paper.get("family"),
        "source_records": len(task_rows),
        "native_units": dict(Counter(r["native_unit"] for r in task_rows)),
        "source_ids": sorted({r["source_id"] for r in task_rows}),
        "declared_domains": comp["domain"] if comp else None,
        "scenes": comp["scenes"] if comp else None,
        "native_tasks": comp["tasks"] if comp else None,
        "cases": comp["cases"] if comp else None,
        "materials": comp["materials"] if comp else None,
        "observation": comp["observation"] if comp else None,
        "task_list_status": "fixed_source_records_available" if task_rows else "native_task_list_to_collect",
        "task_list_complete_for_whole_work": None,
        "source_scope_note": "Available fixed-source subset; original benchmark versions and native units remain explicit.",
        "forecast_targets": paper.get("forecast_targets", []),
    }
    if paper["id"] == "P075":
        row.update(
            declared_domains="桌面操作；7個原生分組為指令、約束、新概念、一次模仿、重排、記憶、推理",
            native_tasks="17個原生task templates；已逐一連到官方class與task_name",
            observation="文字／圖像／影片組成的multimodal prompts",
            task_list_complete_for_whole_work=True,
            source_scope_note="Pinned VIMA ALL_TASKS registry; completeness applies to these17 templates, not every asset/episode.",
        )
    elif paper["id"] == "P081":
        row.update(
            declared_domains="連續狀態目標的室內物件操作",
            native_tasks="8個原生task classes；每類的連續目標與資料split另列",
            materials="剛體／關節與液體相關任務；本輪僅取得定義",
            observation="語言＋視覺；連續程度／比例目標",
            task_list_complete_for_whole_work=True,
            source_scope_note="Pinned eight concrete task classes; asset loading and physical execution are separate.",
        )
    elif paper["id"] == "P003":
        row.update(
            declared_domains="12個COIN原生domain，按作者taxonomy保留；不是本計畫12域的直接對應",
            native_tasks="180個instructional activity definitions；12個原生domain",
            cases=f"{len(coin_db):,}個影片annotation records，分屬180個活動；未下載影片",
            observation="網路教學影片、時間區段／步驟標籤",
            task_list_complete_for_whole_work=True,
            source_scope_note="COIN.json recipe_type/class + taxonomy.xlsx; complete activity IDs in the pinned annotation release.",
        )
    elif paper["id"] == "P004":
        row.update(
            declared_domains="烹飪、家居DIY、車輛維護等人類程序題材；保留原生任務名",
            native_tasks="83個活動定義＝18 primary＋65 related；兩種scope分開",
            observation="教學影片與任務步驟；本輪只取得定義／annotation bundle",
            task_list_complete_for_whole_work=True,
            source_scope_note="Both official task-list files parsed;83 activity IDs, not83 validated robot tasks.",
        )
    rows.append(row)

bench_rows = [r for r in rows if r["benchmark_source_registered"]]
assert len(bench_rows) == 143
source_summaries = []
names = {p["id"]: p["short_name"] for p in papers}
for sid in sorted({r["source_id"] for r in bridges}):
    items = [r for r in bridges if r["source_id"] == sid]
    pids = sorted({pid for r in items for pid in r["paper_ids"]})
    source_summaries.append({
        "source_id": sid, "name": " / ".join(names[p] for p in pids), "paper_ids": pids,
        "records": len(items), "native_units": dict(Counter(r["native_unit"] for r in items)),
        "buckets": dict(Counter(r["inventory_bucket"] for r in items)),
        "repositories": sorted({r["repository"] for r in items}),
        "commits": sorted({r["commit"] for r in items}),
        "definition_url": items[0]["source_url"],
        "source_snapshot": "2026-09-29" if sid in sources else "2026-09-22/25",
    })

categories = []
for code, label in dict((p["primary_category_code"], p["primary_category_zh"]) for p in papers).items():
    members = [r for r in rows if r["category"] == code]
    categories.append({
        "id": code, "name": label, "all_paper_records": len(members),
        "benchmark_or_eval_resource_records": sum(r["benchmark_source_registered"] for r in members),
        "detailed_comparison_records": sum(r["detailed_comparison_id"] is not None for r in members),
        "task_source_paper_records": sum(r["source_records"] > 0 for r in members),
    })
stats = {
    "version": "survey-union-0.7", "date": "2026-09-29",
    "mission": "Collect prior benchmarks comprehensively, classify them as a survey, build their task union, then extend task definitions and rules.",
    "paper_records": len(rows), "benchmark_or_eval_resource_records": len(bench_rows),
    "existing_detailed_comparison_records": 68,
    "registered_sources_previously_outside_comparison": 75,
    "related_paper_records_separate": len(rows) - len(bench_rows),
    "resource_role_review_pending": sum(r["role"] == "role_review_pending" for r in rows),
    "total_source_records": len(bridges),
    "previous_source_records": len(inventory), "newly_extracted_source_records": len(additions),
    "source_snapshots": len(source_summaries),
    "source_repositories": len({r["repository"] for r in bridges}),
    "native_robot_task_candidates": sum(r["inventory_bucket"] == "native_task_candidates" for r in bridges),
    "human_activity_definitions": sum(r["inventory_bucket"] == "human_activity_definitions" for r in bridges),
    "records_by_bucket": dict(Counter(r["inventory_bucket"] for r in bridges)),
    "source_records_with_parsed_goals": sum(r.get("declared_goal_count", 0) > 0 for r in bridges),
    "benchmark_source_records_with_task_inventory": sum(r["source_records"] > 0 for r in bench_rows),
    "benchmark_source_records_awaiting_task_inventory": sum(r["source_records"] == 0 for r in bench_rows),
    "new_source_counts": dict(Counter(r["source_id"] for r in additions)),
    "coin_native_domain_counts": dict(Counter(r["native_domain"] for r in additions if r["source_id"] == "coin_video")),
    "crosstask_task_counts": crosstask_counts,
    "categories": categories,
    "complete_search_claimed": False,
    "all_task_lists_collected": False,
    "common_task_union_count": None,
    "source_record_count_is_common_task_count": False,
    "catalogue_requires_local_simulation": False,
    "pilot_role": "engineering_appendix_only",
    "independence": "Paper-level source records include dataset/benchmark versions and related resources;143 is not a disjoint dataset count.",
    "classification_scope": "Inherited survey annotations plus original-source task lists; source taxonomy, semantic task mapping and executed coverage are separate.",
    "runtime_scope": "No additional simulator trials or human-media downloads in this collection update.",
}
assert stats["native_robot_task_candidates"] == 2062
assert stats["human_activity_definitions"] == 263
assert stats["source_snapshots"] == 25

write_json("survey_registry.json", rows)
write_json("task_source_bridge.json", bridges)
write_json("source_additions.json", additions)
write_json("source_summaries.json", source_summaries)
write_json("union_statistics.json", stats)
write_csv("survey_registry.csv", rows, [
    "paper_id", "name", "year", "category", "category_name", "role",
    "benchmark_source_registered", "detailed_comparison_id", "declared_domains",
    "native_tasks", "scenes", "cases", "materials", "observation",
    "source_records", "native_units", "task_list_status", "source_url", "evidence_depth",
])
write_csv("task_source_bridge.csv", bridges, [
    "record_id", "source_id", "native_id", "title", "native_unit", "inventory_bucket",
    "paper_ids", "native_domain", "native_family", "definition_status",
    "source_url", "repository", "commit", "common_task_mapping", "runtime_validation",
])
write_csv("source_summaries.csv", source_summaries, [
    "source_id", "name", "paper_ids", "records", "native_units", "buckets",
    "repositories", "commits", "source_snapshot",
])
public_receipts = {
    "date": receipts["date"], "downloaded_human_media": False,
    "simulators_executed": False,
    "sources": [
        {"id": s["id"], "repository": s["repository"], "commit": s["commit"],
         "receipts": [{k: v for k, v in item.items() if k != "cache_file"} for item in s["receipts"]]}
        for s in receipts["sources"]
    ],
}
write_json("source_receipts.json", public_receipts)
shutil.copy2(ROOT / "UNION_FIRST_DESIGN_V0_7.md", PUBLIC / "UNION_FIRST_DESIGN_V0_7.md")

lines = [
    "# 來源聯集：目前分類、任務清單與補齊進度", "",
    "日期：2026-09-29。來源目錄與執行子集分開；本輪沒有新增模擬或下載人類影片。", "",
    f"完整250篇書目已接到同一總目錄。其中143條為既有標記／比較表支持的benchmark或含評測資源；68條有原詳細比較，75條先前未進該表。其餘107篇保留為相關文獻或角色待核來源，其中{stats['resource_role_review_pending']}篇仍待判定資源角色，不當作已確定沒有benchmark。這是paper-level來源條目，含版本和衍生關係。", "",
    f"原5,020條來源保留，新增VIMA17、ARNOLD8、COIN180、CrossTask83，共5,308條。當中2,062條是原生機器人任務候選、263條是人類程序活動定義；其他整合註冊／協定／配對另列。", "",
    "## Survey分布", "",
    "| 分支 | 全部書目 | Benchmark／評測資源 | 原詳細比較 | 有task來源的書目 |",
    "|---|---:|---:|---:|---:|",
]
for item in categories:
    lines.append("| " + " | ".join(str(item[k]) for k in [
        "name", "all_paper_records", "benchmark_or_eval_resource_records",
        "detailed_comparison_records", "task_source_paper_records",
    ]) + " |")
lines += ["", "分布描述本目錄；不同名稱或版本不保證資料彼此獨立。", "",
          "## 原生任務來源", "",
          "| 來源 | 定義／條目數 | 原生單位 | Snapshot |", "|---|---:|---|---|"]
for item in source_summaries:
    units = "; ".join(f"{k}: {v}" for k, v in item["native_units"].items())
    lines.append(f"| {item['name']} | {item['records']} | {units} | {item['source_snapshot']} |")
lines += ["", "## COIN作者原生領域", "",
          "| 原生domain | 活動數 |", "|---|---:|"]
for domain, count in sorted(stats["coin_native_domain_counts"].items()):
    lines.append(f"| {domain} | {count} |")
lines += [
    "", "此表完整保留COIN原生12域。它與本計畫舊12域不是同一套分類，也不代表這些人類活動已移植為機器人任務。", "",
    "## 尚待補齊", "",
    f"- 143條評測來源中，{stats['benchmark_source_records_with_task_inventory']}條已有可連結的固定task來源；{stats['benchmark_source_records_awaiting_task_inventory']}條尚待取得原生清單。已取得者的版本／subset仍須按原作核對。",
    "- 既有700個搜尋候選中588個尚待納入審閱；完整分頁、跨資料庫與引用追查繼續進行。",
    "- 全庫共同task／規則映射與跨來源重疊尚未完成。來源定義可以先收錄，執行與可解性另列。",
    "- 本輪四個新增來源只核驗靜態定義，不把影片、樣式、goal參數或重跑次數當成新增任務家族。",
    "", "完整條目、各欄來源、原生task IDs與缺失狀態可由CSV／JSON查回。", "",
]
text = "\n".join(lines)
(ROOT / "UNION_CATALOGUE_REPORT.md").write_text(text)
(PUBLIC / "UNION_CATALOGUE_REPORT.md").write_text(text)
validation = {
    "status": "passed", "survey_rows": len(rows), "registered_eval_sources": len(bench_rows),
    "all_previous_inventory_ids_preserved": {r["record_id"] for r in inventory}.issubset({r["record_id"] for r in bridges}),
    "unique_source_record_ids": len({r["record_id"] for r in bridges}),
    "all_paper_references_resolve": True, "all_original_comparison_papers_linked": True,
    "source_definition_count_checks": stats["new_source_counts"],
    "classification_or_runtime_validity_not_inferred_from_schema_pass": True,
}
write_json("catalogue_validation.json", validation)
print(json.dumps(stats, ensure_ascii=False, indent=2))
