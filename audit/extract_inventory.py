#!/usr/bin/env python3
"""Extract native source records without importing any upstream simulator code.

The output is a source inventory, not a canonical semantic-task count and not a
claim of working assets, reproducible resets, or completed robot experiments.
"""
import ast
import collections
import concurrent.futures
import csv
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
import urllib.parse

from fetch_sources import ROOT, load_tree, source_text

SOURCES = json.loads((ROOT / "pinned_sources.json").read_text())
RECORDS = []
SOURCE_REPORTS = []
ERRORS = []

UNIT_ZH = {
    "activity_definition_directory": "活動定義目錄",
    "native_task_id": "原生任務 ID",
    "native_task_registration": "任務註冊項",
    "native_task_class": "任務類別實作",
    "native_task_module": "任務模組",
    "native_task_schema": "任務 schema",
    "task_scene_entrypoint": "任務場景入口",
    "demo_entrypoint": "示範程式入口",
    "video_task_schema": "影片任務 schema",
    "human_sim_task_mapping": "人類／模擬任務映射",
    "integration_registration_group": "整合框架註冊組",
    "generator_configuration": "生成／協作設定",
    "evaluation_protocol": "評測協定入口",
}
ROLE_ZH = {
    "native_benchmark": "原生 benchmark",
    "extension_with_shared_ancestry": "含共享來源的擴展",
    "protocol_and_generated_episodes": "協定／生成資料",
    "integration_hub": "整合框架",
    "video_task_pairing": "影片與任務配對",
    "integration_and_native_tasks": "整合與原生任務",
}
PRIMARY_UNITS = {
    "activity_definition_directory", "native_task_id", "native_task_registration",
    "native_task_class", "native_task_module", "native_task_schema", "task_scene_entrypoint",
}


def url(meta, file):
    return f'https://github.com/{meta["resolved_repo"]}/blob/{meta["commit"]}/{urllib.parse.quote(file, safe="/")}'


def paths(meta):
    return [node["path"] for node in load_tree(meta) if node["type"] == "blob"]


def literal(value, default=None):
    try:
        return ast.literal_eval(value)
    except (ValueError, TypeError, SyntaxError):
        return default


def symbol(node):
    if isinstance(node, ast.Name):
        return node.id
    if isinstance(node, ast.Attribute):
        return symbol(node.value) + "." + node.attr
    if isinstance(node, ast.Call):
        return symbol(node.func)
    return ""


def assignments(tree):
    result = {}
    for node in tree.body:
        if isinstance(node, (ast.Assign, ast.AnnAssign)):
            targets = node.targets if isinstance(node, ast.Assign) else [node.target]
            for target in targets:
                if isinstance(target, ast.Name):
                    result[target.id] = node.value
    return result


def dict_entries(value, assigns=None):
    if isinstance(value, ast.Name) and assigns and value.id in assigns:
        return dict_entries(assigns[value.id], assigns)
    if isinstance(value, ast.Dict):
        return [(literal(k), v) for k, v in zip(value.keys, value.values) if isinstance(literal(k), str)]
    if isinstance(value, ast.Call) and symbol(value.func).split(".")[-1] in ["dict", "OrderedDict"]:
        entries = [(kw.arg, kw.value) for kw in value.keywords if kw.arg]
        if value.args:
            arg = value.args[0]
            if isinstance(arg, (ast.List, ast.Tuple)):
                for pair in arg.elts:
                    if isinstance(pair, (ast.Tuple, ast.List)) and len(pair.elts) == 2:
                        key = literal(pair.elts[0])
                        if isinstance(key, str):
                            entries.append((key, pair.elts[1]))
            elif isinstance(arg, ast.Dict):
                entries.extend(dict_entries(arg, assigns))
        return entries
    return []


def read_ast(meta, file):
    return ast.parse(source_text(meta, file), filename=file)


def parallel_texts(meta, files):
    files = sorted(set(files))
    results = {}
    if not files:
        return results
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        futures = {pool.submit(source_text, meta, file): file for file in files}
        for count, future in enumerate(concurrent.futures.as_completed(futures), 1):
            file = futures[future]
            try:
                results[file] = future.result()
            except Exception as ex:
                ERRORS.append({"source": meta["id"], "path": file, "stage": "fetch", "error": str(ex)[:200]})
            if len(files) > 40 and count % 50 == 0:
                print(json.dumps({"source": meta["id"], "files_read": count, "total": len(files)}), flush=True)
    return results


def add(meta, native_id, unit, file, title=None, aliases=None, asset_refs=None,
        definition_paths=None, provenance=None, note="", native_metadata=None):
    native_id = str(native_id)
    uid = meta["id"] + "::" + native_id
    kind = (
        "integration_or_protocol" if meta["role"] in ["integration_hub", "protocol_and_generated_episodes"]
        else "video_pairing" if meta["role"] == "video_task_pairing"
        else "documented_examples" if unit == "demo_entrypoint"
        else "native_task_candidates"
    )
    record = {
        "record_id": uid,
        "anchor_id": "native-" + hashlib.sha256(uid.encode()).hexdigest()[:16],
        "source_id": meta["id"], "source_work": meta["work"],
        "source_role": meta["role"], "source_role_zh": ROLE_ZH[meta["role"]],
        "native_id": native_id, "title": title or native_id.replace("_", " "),
        "native_unit": unit, "native_unit_zh": UNIT_ZH[unit],
        "inventory_bucket": kind,
        "repository": meta["resolved_repo"], "commit": meta["commit"],
        "definition_path": file, "definition_paths": definition_paths or [file],
        "source_url": url(meta, file),
        "native_aliases_or_variants": aliases or [],
        "asset_reference_paths": asset_refs or [],
        "asset_reference_status": "references_only_not_downloaded" if asset_refs else "not_audited",
        "lineage": provenance or [],
        "native_metadata": native_metadata or {},
        "extraction_note": note,
        "evidence_status": "static_source_inventory_only",
        "canonical_task_spec_id": None,
        "canonical_status": "not_normalized_or_cross_work_deduplicated",
        "scenario_instance_status": "not_instantiated",
        "runtime_validation": "not_executed",
        "official_scoring_allowed": False,
        "paper_ids": meta["paper_ids"],
    }
    RECORDS.append(record)


def extract_bddl(meta):
    groups = collections.defaultdict(list)
    for file in paths(meta):
        if "/activity_definitions/" in file and file.endswith(".bddl"):
            tail = file.split("/activity_definitions/", 1)[1]
            if "/" in tail:
                groups[tail.split("/", 1)[0]].append(file)
    for activity, files in sorted(groups.items()):
        add(meta, activity, "activity_definition_directory", sorted(files)[0],
            definition_paths=sorted(files), native_metadata={"bddl_definition_files": len(files)},
            note="Counted a native activity directory, not each problem file and not an instantiated or canonical task.")


def extract_libero(meta):
    file = "libero/libero/benchmark/libero_suite_task_map.py"
    mapping = literal(assignments(read_ast(meta, file))["libero_task_map"])
    available = set(paths(meta))
    for suite, tasks in mapping.items():
        for task in tasks:
            definition = f"libero/libero/bddl_files/{suite}/{task}.bddl"
            add(meta, task, "native_task_id", definition if definition in available else file,
                native_metadata={"suite": suite, "definition_file_present": definition in available},
                note="Native suite task ID; variations, resets, and runtime evaluator were not executed.")


def extract_robocasa(meta):
    registry = "robocasa/utils/dataset_registry.py"
    table_file = "docs/composite_tasks/task_attributes.json"
    attrs = json.loads(source_text(meta, table_file)).get("tasks", [])
    descriptions = {item["name"]: item for item in attrs}
    assigns = assignments(read_ast(meta, registry))
    subsets = collections.defaultdict(list)
    for key in ["ATOMIC_TASK_DATASETS", "COMPOSITE_TASK_DATASETS"]:
        for name, value in dict_entries(assigns[key], assigns):
            subsets[name].append(key)
    for name in sorted(set(subsets) | set(descriptions)):
        native_sets = subsets.get(name, [])
        item = descriptions.get(name, {})
        definition_file = registry if native_sets else table_file
        add(meta, name, "native_task_id", definition_file,
            native_metadata={"registry_sets": native_sets, "documented_activity": item.get("activity"),
                             "author_subtask_count": item.get("num_subtasks"),
                             "author_mobile_requirement": item.get("moma_required"),
                             "task_catalogue_present": bool(item),
                             "dataset_registry_present": bool(native_sets),
                             "description_sha256": hashlib.sha256(item.get("description", "").encode()).hexdigest()},
            note="Official task catalogue ID, with dataset-registry membership recorded separately. A dataset subset is not the whole task bank; stage count is not measured difficulty.")
    return {"task_catalogue_entries": len(descriptions), "dataset_registry_task_ids": len(subsets),
            "catalogue_without_dataset_registry_entry": len(set(descriptions) - set(subsets)),
            "catalogue_and_dataset_registry_are_different_scopes": True}


def extract_rlbench(meta):
    available = set(paths(meta))
    files = [p for p in available if p.startswith("rlbench/tasks/") and p.endswith(".py") and not PurePosixPath(p).name.startswith("_")]
    for file, text in sorted(parallel_texts(meta, files).items()):
        tree = ast.parse(text)
        classes = [n for n in tree.body if isinstance(n, ast.ClassDef) and any(symbol(base).split(".")[-1] == "Task" for base in n.bases)]
        for node in classes:
            task_id = PurePosixPath(file).stem
            scene = f"rlbench/task_ttms/{task_id}.ttm"
            add(meta, task_id, "native_task_class", file,
                title=node.name, asset_refs=[scene] if scene in available else [],
                native_metadata={"class": node.name, "methods": [x.name for x in node.body if isinstance(x, (ast.FunctionDef, ast.AsyncFunctionDef))]},
                note="Task subclass statically found; TTM reference presence does not prove the asset was downloaded or the task is solvable.")


def dictionary_source(meta, file, variable, unit="native_task_id"):
    assigns = assignments(read_ast(meta, file))
    entries = dict_entries(assigns[variable], assigns)
    for name, value in entries:
        add(meta, name, unit, file, native_metadata={"registry_variable": variable, "native_class_expression": symbol(value)},
            note="Only keys of this authoritative dictionary are counted; observation aliases and resets are not separately added.")


def extract_metaworld(meta):
    dictionary_source(meta, "metaworld/env_dict.py", "ENV_CLS_MAP")


def extract_softgym(meta):
    dictionary_source(meta, "softgym/registered_env.py", "SOFTGYM_ENVS")


def extract_ravens(meta):
    start = len(RECORDS)
    dictionary_source(meta, "ravens/tasks/__init__.py", "names")
    for row in RECORDS[start:]:
        custom = row["native_id"].startswith(("cloth", "bag", "cable-")) or row["native_id"] in ["insertion-goal", "hanoi-generalize"]
        row["lineage"] = [{
            "source": "Ravens / Transporter",
            "relation": "extension_or_inherited_task_requires_reconciliation",
            "basis": "Official task dictionary imports original and added tasks",
            "custom_name_hint": custom,
            "semantic_equivalence_verified": False,
        }]


def registered_classes(meta, files, decorator_name, unit, scope_filter=None):
    dynamic = []
    collisions = collections.defaultdict(list)
    result_count = 0
    for file, text in sorted(parallel_texts(meta, files).items()):
        try:
            tree = ast.parse(text)
        except SyntaxError as ex:
            ERRORS.append({"source": meta["id"], "path": file, "stage": "parse", "error": str(ex)[:200]})
            continue
        for node in ast.walk(tree):
            if not isinstance(node, ast.ClassDef):
                continue
            for decorator in node.decorator_list:
                if not isinstance(decorator, ast.Call) or symbol(decorator.func).split(".")[-1] != decorator_name:
                    continue
                ids = [literal(arg) for arg in decorator.args]
                ids = [value for value in ids if isinstance(value, str)]
                if not ids:
                    dynamic.append({"path": file, "class": node.name, "line": node.lineno})
                    continue
                primary = ids[0]
                collisions[primary].append(file)
                lineage = []
                if meta["id"] == "roboverse":
                    components = PurePosixPath(file).parts
                    group = components[components.index("tasks") + 1] if "tasks" in components else "unknown"
                    upstream = {
                        "libero": "LIBERO", "libero_90": "LIBERO", "rlbench": "RLBench",
                        "maniskill": "ManiSkill", "metaworld": "Meta-World", "robocasa": "RoboCasa",
                        "simpler_env": "SIMPLER", "arnold": "ARNOLD", "beyondmimic": "BeyondMimic",
                    }.get(group)
                    if upstream:
                        lineage.append({"source": upstream, "relation": "integration_namespace",
                                        "basis": "Official integration directory and registration namespace",
                                        "semantic_equivalence_verified": False})
                else:
                    group = "/".join(PurePosixPath(file).parts[3:5])
                assigned = []
                for statement in node.body:
                    if isinstance(statement, (ast.Assign, ast.AnnAssign)):
                        targets = statement.targets if isinstance(statement, ast.Assign) else [statement.target]
                        assigned.extend(target.id for target in targets if isinstance(target, ast.Name))
                methods = [statement.name for statement in node.body if isinstance(statement, (ast.FunctionDef, ast.AsyncFunctionDef))]
                reviewed_expansion = file in {
                    "roboverse_pack/tasks/maniskill/pick_single_egad.py",
                    "roboverse_pack/tasks/maniskill/peg_insertion_side.py",
                }
                config_only = reviewed_expansion and bool(assigned) and not methods and set(assigned) <= {"scenario", "traj_filepath"}
                add(meta, primary, unit, file, aliases=ids[1:], provenance=lineage,
                    native_metadata={"class": node.name, "registration_line": decorator.lineno,
                                     "source_task_group": group,
                                     "base_classes": [symbol(x) for x in node.bases],
                                     "class_assigned_fields": assigned,
                                     "class_method_overrides": methods,
                                     "configuration_only_derived_class": config_only,
                                     "reviewed_parameterization_file": reviewed_expansion,
                                     "scope_group": scope_filter(file) if scope_filter else "pending"},
                    note="Literal registration read without importing the module. Additional names on the same registration are aliases, not additional records.")
                result_count += 1
    return {"dynamic_registrations": dynamic, "registration_name_collisions": {k: v for k, v in collisions.items() if len(v) > 1}, "literal_groups": result_count}


def extract_maniskill(meta):
    files = [p for p in paths(meta) if p.startswith("mani_skill/envs/tasks/") and p.endswith(".py")]
    return registered_classes(meta, files, "register_env", "native_task_registration",
                              scope_filter=lambda p: "auxiliary_control" if "/control/" in p else "robot_task_candidate")


def extract_maniskill2(meta):
    files = [p for p in paths(meta) if p.startswith("mani_skill2/envs/") and p.endswith(".py")]
    before = len(RECORDS)
    result = registered_classes(meta, files, "register_env", "native_task_registration",
                                scope_filter=lambda p: "soft_material_candidate" if "/mpm/" in p else "robot_task_candidate")
    for row in RECORDS[before:]:
        row["lineage"].append({"source": "ManiSkill version family", "relation": "cross_version_task_reconciliation_required",
                               "semantic_equivalence_verified": False})
        row["extraction_note"] += " Older and newer task IDs must be reconciled; neither all-new nor all-duplicate is assumed."
    return result


def extract_vlabench(meta):
    files = [p for p in paths(meta) if p.startswith("VLABench/tasks/hierarchical_tasks/") and p.endswith(".py")]
    return registered_classes(meta, files, "add_task", "native_task_registration")


def extract_robotwin(meta):
    available = set(paths(meta))
    candidates = [p for p in available if p.startswith("description/task_instruction/") and p.endswith(".json")]
    for instructions in sorted(candidates):
        name = PurePosixPath(instructions).stem
        module = f"envs/{name}.py"
        if module not in available:
            ERRORS.append({"source": meta["id"], "path": instructions, "stage": "module_pairing", "error": "Instruction entry lacks matching envs module"})
            continue
        add(meta, name, "native_task_module", module, definition_paths=[module, instructions],
            note="Paired native task module and task-instruction JSON; benchmark versions and randomization are not extra tasks.")


def extract_garmentlab(meta):
    for file in paths(meta):
        if file.startswith("demo/") and file.endswith(".py"):
            add(meta, PurePosixPath(file).stem.strip(), "demo_entrypoint", file,
                note="Demonstration entrypoint only. It is not counted as an audited task specification or as the paper's complete task bank.")


def extract_dexgarment(meta):
    for file in paths(meta):
        if file.startswith("Env_StandAlone/") and file.endswith("_Env.py"):
            add(meta, PurePosixPath(file).stem, "task_scene_entrypoint", file,
                note="Standalone task-scene entrypoint. Garment-type changes may be parameter variants; canonical task count remains unknown.")


def extract_alfred(meta):
    file = "gen/constants.py"
    goals = literal(assignments(read_ast(meta, file))["GOALS"])
    for goal in goals:
        add(meta, goal, "native_task_schema", file,
            note="Native goal schema; object bindings, scene IDs, demonstrations, and episodes are not added as separate task schemas.")


def extract_teach(meta):
    files = [p for p in paths(meta) if p.startswith("src/teach/meta_data_files/task_definitions/") and p.endswith(".json")]
    for file, text in sorted(parallel_texts(meta, files).items()):
        data = json.loads(text)
        if "task_id" not in data or "task_name" not in data:
            ERRORS.append({"source": meta["id"], "path": file, "stage": "schema", "error": "No native task_id/task_name"})
            continue
        add(meta, str(data["task_id"]) + "__" + data["task_name"], "native_task_schema", file,
            title=data["task_name"], native_metadata={"task_id": data["task_id"], "task_nparams": data.get("task_nparams")},
            provenance=[{"source": "AI2-THOR / ALFRED-related environment lineage",
                         "relation": "environment_and_task_schema_relationship_requires_review",
                         "semantic_equivalence_verified": False}],
            note="Versioned task-definition JSON, not a dialogue/episode count.")


def extract_partnr(meta):
    files = [p for p in paths(meta) if p.startswith("habitat_llm/conf/habitat_conf/task/") and p.endswith(".yaml")]
    for file in sorted(files):
        add(meta, PurePosixPath(file).stem, "generator_configuration", file,
            note="Protocol/configuration entrypoint only; PARTNR generated episodes require their own semantic and source-lineage audit.")


def extract_roboverse(meta):
    files = [p for p in paths(meta) if p.startswith("roboverse_pack/tasks/") and p.endswith(".py")]
    return registered_classes(meta, files, "register_task", "integration_registration_group")


def extract_eai(meta):
    files = [p for p in paths(meta) if p.endswith("task_state_LTL_formula_accurate.json") or p.endswith("task_to_demo.json")]
    for file in sorted(files):
        name = "/".join(PurePosixPath(file).parts[1:])
        add(meta, name, "evaluation_protocol", file,
            provenance=[{"source": "BEHAVIOR / VirtualHome",
                         "relation": "evaluation_host_and_derived_task_data",
                         "semantic_equivalence_verified": False}],
            note="Protocol/resource mapping file, not an independent set of new tasks or demonstrations.")


def extract_watchact(meta):
    file = "README.md"
    text = source_text(meta, file)
    start = text.find("The 14 tasks")
    tail = text[start:start + 3500]
    names = []
    for line in tail.splitlines():
        if line.lstrip().startswith("|"):
            names.extend(re.findall(r"`([^`]+)`", line))
    names = [name for name in names if re.fullmatch(r"[A-Za-z][A-Za-z0-9_-]+", name)]
    for name in dict.fromkeys(names):
        add(meta, name, "video_task_schema", file,
            provenance=[{"source": "LIBERO", "relation": "environment_dependency",
                         "basis": "Official README describes custom BDDL tasks in LIBERO",
                         "semantic_equivalence_verified": False}],
            note="Cognitive evaluation schema listed in official README. These 14 schemas are not automatically 14 canonical physical tasks; per-instance JSONL/BDDL and video pairing require data-manifest audit.")
    return {"readme_listed_tasks": len(set(names)), "external_dataset": "https://huggingface.co/datasets/BaiqiL/WatchAct"}


def extract_imitator(meta):
    file = "examples/baselines/lerobot_dataset/task_mapping.json"
    mapping = json.loads(source_text(meta, file))["task_mappings"]
    for entry in mapping:
        native_id = entry["human_task_id"]
        sim_ids = entry.get("sim_task_id", [])
        add(meta, native_id, "human_sim_task_mapping", file,
            title=sim_ids[0] if sim_ids else native_id,
            aliases=sim_ids, native_metadata={"human_task_id": native_id, "sim_task_ids": sim_ids,
                                            "robot_task_ids": entry.get("robot_task_id", [])},
            provenance=[{"source": "ManiSkill", "relation": "framework_fork",
                         "semantic_equivalence_verified": False}],
            note="One declared human/base-task mapping; L0–L3 simulation IDs are retained as variants, not added to this count.")


def extract_robodojo(meta):
    available = set(paths(meta))
    files = [p for p in available if p.startswith("task/RoboDojo/tasks/") and p.endswith(".py") and not PurePosixPath(p).name.startswith("_")]
    for file in sorted(files):
        name = PurePosixPath(file).stem
        configuration = "task/RoboDojo/config/" + name + ".yml"
        if configuration not in available:
            continue
        add(meta, name, "native_task_module", file, definition_paths=[file, configuration],
            native_metadata={"named_randomization_variant": name.endswith("_random")},
            note="Native task module with corresponding config. Simulation scope, random variants and shared deployment ancestry need reconciliation.")


EXTRACTORS = {
    "bddl": extract_bddl, "libero": extract_libero, "robocasa": extract_robocasa,
    "rlbench": extract_rlbench, "metaworld": extract_metaworld, "softgym": extract_softgym,
    "ravens": extract_ravens, "maniskill": extract_maniskill, "maniskill2": extract_maniskill2, "vlabench": extract_vlabench,
    "robotwin": extract_robotwin, "garmentlab": extract_garmentlab, "dexgarment": extract_dexgarment,
    "alfred": extract_alfred, "teach": extract_teach, "partnr": extract_partnr,
    "roboverse": extract_roboverse, "eai": extract_eai, "watchact": extract_watchact,
    "imitator": extract_imitator, "robodojo": extract_robodojo,
}


def main():
    for meta in SOURCES:
        before = len(RECORDS)
        before_errors = len(ERRORS)
        details = {}
        try:
            if meta["status"] != "source_tree_pinned":
                raise RuntimeError("Source tree not pinned")
            details = EXTRACTORS[meta["extractor"]](meta) or {}
            status = "static_extraction_complete_for_declared_rule"
        except Exception as ex:
            status = "extraction_partial_or_unresolved"
            ERRORS.append({"source": meta["id"], "stage": "extract", "error": str(ex)[:250]})
        rows = RECORDS[before:]
        report = {
            **{k: meta[k] for k in ["id", "work", "repo", "role", "scope", "paper_ids"]},
            "resolved_repo": meta.get("resolved_repo"), "commit": meta.get("commit"),
            "status": status, "record_count": len(rows),
            "counts_by_unit": dict(collections.Counter(row["native_unit"] for row in rows)),
            "counts_by_bucket": dict(collections.Counter(row["inventory_bucket"] for row in rows)),
            "records_with_asset_file_references": sum(bool(row["asset_reference_paths"]) for row in rows),
            "error_count": len(ERRORS) - before_errors, "extraction_details": details,
            "canonical_task_count": None, "runtime_verified_tasks": 0,
        }
        SOURCE_REPORTS.append(report)
        print(json.dumps({k: report[k] for k in ["id", "record_count", "counts_by_unit", "status", "error_count"]}, ensure_ascii=False), flush=True)
    # A registration collision is preserved as separate source declarations,
    # rather than silently throwing one away or declaring semantic equivalence.
    collisions = collections.Counter(row["record_id"] for row in RECORDS)
    for row in RECORDS:
        if collisions[row["record_id"]] > 1:
            original = row["record_id"]
            row["record_id"] += "::" + hashlib.sha256(row["definition_path"].encode()).hexdigest()[:10]
            row["anchor_id"] = "native-" + hashlib.sha256(row["record_id"].encode()).hexdigest()[:16]
            row["native_metadata"]["registration_collision_key"] = original
            row["extraction_note"] += " Registration collision is retained for review; these records are not independent task claims."
    ids = [row["record_id"] for row in RECORDS]
    if len(ids) != len(set(ids)):
        raise RuntimeError("Unresolved duplicate record IDs")
    stats = {
        "as_of": "2026-09-22",
        "source_snapshots_pinned": sum(m["status"] == "source_tree_pinned" for m in SOURCES),
        "source_repositories_pinned": len({m["resolved_repo"] for m in SOURCES if m["status"] == "source_tree_pinned"}),
        "source_records": len(RECORDS),
        "counts_by_source": {r["id"]: r["record_count"] for r in SOURCE_REPORTS},
        "counts_by_unit": dict(collections.Counter(r["native_unit"] for r in RECORDS)),
        "counts_by_bucket": dict(collections.Counter(r["inventory_bucket"] for r in RECORDS)),
        "records_with_asset_file_references": sum(bool(row["asset_reference_paths"]) for row in RECORDS),
        "configuration_only_derived_registrations_in_reviewed_files": sum(row["native_metadata"].get("configuration_only_derived_class", False) for row in RECORDS),
        "reviewed_parameterization_file_registrations": sum(row["native_metadata"].get("reviewed_parameterization_file", False) for row in RECORDS),
        "canonical_task_specs": None, "validated_instances": 0, "validated_cases": 0,
        "simulator_rollouts": 0, "source_files_executed": 0,
        "error_count": len(ERRORS),
        "qualification": "Heterogeneous static source records. Their sum is neither the canonical task count nor demonstrated coverage. Integration aliases, scene entrypoints, task schemas and protocol configs stay separately typed.",
    }
    (ROOT / "native_source_inventory.json").write_text(json.dumps(RECORDS, ensure_ascii=False, indent=2))
    fields = [
        "record_id", "source_work", "source_role", "native_id", "native_unit", "inventory_bucket",
        "repository", "commit", "definition_path", "source_url", "native_aliases_or_variants",
        "asset_reference_paths", "lineage", "canonical_status", "runtime_validation", "extraction_note",
    ]
    with (ROOT / "native_source_inventory.csv").open("w", encoding="utf-8-sig", newline="") as fp:
        writer = csv.DictWriter(fp, fieldnames=fields)
        writer.writeheader()
        for row in RECORDS:
            writer.writerow({k: json.dumps(row[k], ensure_ascii=False) if isinstance(row[k], (list, dict)) else row[k] for k in fields})
    (ROOT / "source_extraction_report.json").write_text(json.dumps(SOURCE_REPORTS, ensure_ascii=False, indent=2))
    (ROOT / "inventory_statistics.json").write_text(json.dumps(stats, ensure_ascii=False, indent=2))
    (ROOT / "extraction_issues.json").write_text(json.dumps(ERRORS, ensure_ascii=False, indent=2))
    print(json.dumps(stats, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
