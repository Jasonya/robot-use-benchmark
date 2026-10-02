"""Build counted registries from pinned, locally acquired source definitions.

This script does not run simulators, invoke a model judge, or copy question/
instruction text into public artifacts. Source bodies stay in audit/.cache.
"""
from __future__ import annotations

import ast
import csv
import gzip
import hashlib
import io
import json
import re
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CACHE = ROOT / "audit/.cache/quantified-v0_9"
OUT = ROOT / "content/quantified"
DATE = "2026-10-02"
VERSION = "numbers-0.9"


def load(name):
    frozen_file = OUT / "frozen_discovery_fields.json"
    if frozen_file.exists():
        frozen = json.loads(frozen_file.read_text())
        if name in frozen:
            return frozen[name]
    return json.loads((CACHE / name).read_text())


def digest(value):
    if not isinstance(value, bytes):
        value = json.dumps(value, ensure_ascii=False, sort_keys=True,
                           separators=(",", ":"), allow_nan=False).encode()
    return hashlib.sha256(value).hexdigest()


def write_json(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def write_csv(name, rows, keys):
    with (OUT / name).open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=keys, extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            writer.writerow({k: json.dumps(v, ensure_ascii=False) if isinstance(v, (dict, list))
                             else v for k, v in row.items() if k in keys})


def episode_stream(path):
    """Incrementally decode objects in the top-level episodes array."""
    decoder = json.JSONDecoder()
    with gzip.open(path, "rt", encoding="utf-8") as stream:
        buffer = stream.read(1 << 20)
        match = re.search(r'"episodes"\s*:\s*\[', buffer)
        if not match:
            raise ValueError(f"Missing top-level episodes array in {path}")
        offset = match.end()
        while True:
            while offset < len(buffer) and buffer[offset] in " \t\r\n,":
                offset += 1
            if offset < len(buffer) and buffer[offset] == "]":
                tail = buffer[offset + 1:] + stream.read()
                if tail.strip() != "}":
                    raise ValueError(f"Unexpected episode-array trailer in {path}")
                return
            try:
                episode, end = decoder.raw_decode(buffer, offset)
            except json.JSONDecodeError:
                extra = stream.read(1 << 20)
                if not extra:
                    raise ValueError(f"Truncated JSON episode in {path}")
                buffer = buffer[offset:] + extra
                offset = 0
                continue
            if not isinstance(episode, dict):
                raise ValueError(f"Non-object episode in {path}")
            yield episode
            offset = end
            if offset > (1 << 20):
                buffer = buffer[offset:]
                offset = 0


class SceneTable(HTMLParser):
    def __init__(self):
        super().__init__()
        self.table_depth = 0
        self.tokens = []

    def handle_starttag(self, tag, attrs):
        if tag == "table":
            self.table_depth += 1

    def handle_endtag(self, tag):
        if tag == "table":
            self.table_depth -= 1

    def handle_data(self, text):
        if self.table_depth and text.strip():
            self.tokens.append(text.strip())


def literal(node):
    if isinstance(node, ast.Constant):
        return node.value
    if isinstance(node, (ast.List, ast.Tuple)):
        return [literal(x) for x in node.elts]
    if isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
        args = [literal(x) for x in node.args]
        if node.func.id == "range":
            return list(range(*args))
        if node.func.id == "list" and len(args) == 1:
            return list(args[0])
    raise ValueError("Unsupported source expression; no arbitrary code is evaluated")


def validate_episode(episode, scene_ids):
    errors = []
    if not str(episode.get("episode_id", "")):
        errors.append("missing_episode_id")
    if not str(episode.get("instruction", "")).strip():
        errors.append("missing_instruction")
    if episode.get("scene_id") not in scene_ids:
        errors.append("scene_not_in_pinned_environment_registry")
    for key in ["scene_dataset_config", "rigid_objs", "start_position",
                "start_rotation", "evaluation_propositions",
                "evaluation_constraints", "evaluation_proposition_dependencies"]:
        if key not in episode:
            errors.append("missing_" + key)
    props = episode.get("evaluation_propositions")
    if not isinstance(props, list) or not props:
        errors.append("missing_goal_program")
        return errors
    n = len(props)
    if not all(isinstance(p, dict) and p.get("function_name") and
               isinstance(p.get("args"), dict) for p in props):
        errors.append("malformed_proposition")
    for constraint in episode.get("evaluation_constraints", []):
        args = constraint.get("args", {})
        indices = args.get("proposition_indices", [])
        if any(not isinstance(x, int) or not 0 <= x < n for x in indices):
            errors.append("constraint_index_out_of_range")
        for edge in args.get("dag_edges", []):
            if len(edge) != 2 or any(not isinstance(x, int) or not 0 <= x < n for x in edge):
                errors.append("temporal_edge_out_of_range")
    for dependency in episode.get("evaluation_proposition_dependencies", []):
        for key in ["proposition_indices", "depends_on"]:
            if any(not isinstance(x, int) or not 0 <= x < n
                   for x in dependency.get(key, [])):
                errors.append("dependency_index_out_of_range")
    return sorted(set(errors))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    pins = load("source_pins.json")
    receipts = load("fetch_receipts.json")
    by_receipt = {r["id"]: r for r in receipts}
    partnr_info = load("partnr-hf")
    hssd_info = load("hssd-hf")
    survey = json.loads((ROOT / "content/survey_union/survey_registry.json").read_text())
    papers = {r["name"]: r["paper_id"] for r in survey}
    environments = []

    def env(namespace, native_id, url, source_version, definition_sha, **extra):
        environments.append({
            "environment_id": f"{namespace}::{native_id}",
            "native_id": native_id, "source_id": namespace,
            "source_url": url, "source_version": source_version,
            "definition_sha256": definition_sha,
            "count_unit": "source_named_scene_definition",
            "asset_status": "source_reference_identified_not_full_asset_closure",
            "runtime_verified_by_this_import": False,
            "cross_source_geometric_equivalence": "not_claimed",
            **extra
        })

    if (OUT / "frozen_discovery_fields.json").exists():
        behavior_ids = load("behavior-scene-ids")
    else:
        parser = SceneTable()
        parser.feed((CACHE / "behavior-scenes").read_text())
        behavior_ids = [s for s in parser.tokens if re.fullmatch(r"[A-Za-z0-9]+(?:_[A-Za-z0-9]+)+", s)]
    assert len(behavior_ids) == len(set(behavior_ids)) == 50
    receipt = by_receipt["behavior-scenes"]
    for name in behavior_ids:
        env("behavior", name, receipt["url"], f"page-sha256:{receipt['sha256']}",
            receipt["sha256"], definition_locator=f"scene table / {name}",
            paper_ids=["P100"])

    layout_rows = [r for r in load("rcasa-tree")["tree"]
                   if re.search(r"kitchen_layouts/(train|test)/layout\d+\.yaml$", r["path"])]
    assert len(layout_rows) == 60
    for row in layout_rows:
        name = Path(row["path"]).stem
        receipt = by_receipt["rcasa-" + Path(row["path"]).name]
        env("robocasa", name, receipt["url"], pins["robocasa"]["commit"],
            receipt["sha256"], native_split=row["path"].split("/")[-2],
            definition_locator=row["path"], paper_ids=["P070", "P071"],
            reuse_rule="RoboCasa / RoboCasa365 same layout ID is counted once; style IDs are excluded")

    scenes = {}
    tree = ast.parse((CACHE / "alfred-constants").read_text())
    for node in tree.body:
        if isinstance(node, ast.Assign) and len(node.targets) == 1:
            target = node.targets[0]
            if isinstance(target, ast.Name) and target.id in ["TRAIN_SCENE_NUMBERS", "TEST_SCENE_NUMBERS"]:
                scenes[target.id] = literal(node.value)
        elif isinstance(node, ast.Expr) and isinstance(node.value, ast.Call):
            call = node.value
            if (isinstance(call.func, ast.Attribute) and call.func.attr == "extend"
                    and isinstance(call.func.value, ast.Name) and call.func.value.id in scenes):
                scenes[call.func.value.id].extend(literal(call.args[0]))
    assert len(set(scenes["TRAIN_SCENE_NUMBERS"] + scenes["TEST_SCENE_NUMBERS"])) == 120
    receipt = by_receipt["alfred-constants"]
    for native_split, key in [("source_train", "TRAIN_SCENE_NUMBERS"), ("source_test", "TEST_SCENE_NUMBERS")]:
        for n in scenes[key]:
            env("ai2thor_alfred", f"FloorPlan{n}", receipt["url"],
                pins["alfred"]["commit"], receipt["sha256"],
                native_split=native_split, definition_locator=f"gen/constants.py::{key}",
                paper_ids=["P096"],
                reuse_rule="Same AI2-THOR FloorPlan reference is not recounted for TEACh or another adapter")

    calvin_env_commit = "1431a46bd36bde5903fb6345e68b5ccc30def666"
    for name in "ABCD":
        receipt = by_receipt["calvin-scene-" + name]
        env("calvin", f"scene_{name}", receipt["url"], calvin_env_commit,
            receipt["sha256"], paper_ids=[papers["CALVIN"]],
            definition_locator=f"conf/scene/calvin_scene_{name}.yaml",
            aliases=["calvin_scene_D_eval"] if name == "D" else [],
            reuse_rule="D_eval is an evaluation configuration of D, not a fifth counted layout")

    hssd_paths = [r["rfilename"] for r in hssd_info["siblings"]
                  if r["rfilename"].endswith(".scene_instance.json")]
    assert len(hssd_paths) == 50
    hssd_ids = set()
    for file in hssd_paths:
        name = Path(file).name.removesuffix(".scene_instance.json")
        receipt = by_receipt["hssd-" + Path(file).name]
        scene = json.loads((CACHE / receipt["id"]).read_text())
        assert isinstance(scene.get("stage_instance"), dict)
        hssd_ids.add(name)
        env("hssd_partnr", name, receipt["url"], hssd_info["sha"],
            receipt["sha256"], paper_ids=["P143"], definition_locator=file,
            stage_reference=scene["stage_instance"].get("template_name"),
            reuse_rule="HSSD base scene identity is preserved; filtered object configurations are not new layout IDs")

    assert len(environments) == len({e["environment_id"] for e in environments}) == 284
    write_json("environment_registry.json", environments)
    write_csv("environment_registry.csv", environments, [
        "environment_id", "source_id", "native_id", "source_version", "source_url",
        "definition_locator", "definition_sha256", "native_split", "reuse_rule", "asset_status"
    ])

    bridge = json.loads((ROOT / "content/survey_union/task_source_bridge.json").read_text())
    tasks = [dict(r) for r in bridge if r["inventory_bucket"] == "native_task_candidates"]
    calvin_additions = []
    task_lines = (CACHE / "calvin-tasks").read_text().splitlines()
    for line_no, line in enumerate(task_lines, 1):
        match = re.match(r"^  ([a-z][a-z0-9_]+):\s*(\[.*)", line)
        if not match:
            continue
        native_id, definition = match.groups()
        record = {
            "record_id": f"calvin::{native_id}", "source_id": "calvin",
            "native_id": native_id, "title": native_id.replace("_", " "),
            "native_unit": "native_task_definition",
            "inventory_bucket": "native_task_candidates",
            "paper_ids": [papers["CALVIN"]],
            "source_url": by_receipt["calvin-tasks"]["url"],
            "repository": "mees/calvin", "commit": pins["calvin"]["commit"],
            "definition_path": "calvin_models/conf/callbacks/rollout/tasks/new_playtable_tasks.yaml",
            "definition_line": line_no,
            "checker_signature_name": re.search(r"\[\s*(\w+)", definition).group(1),
            "definition_status": "source_goal_checker_signature_parsed",
            "definition_sha256": by_receipt["calvin-tasks"]["sha256"],
            "checker_source_url": by_receipt["calvin-checker"]["url"],
            "common_task_mapping": "unresolved",
            "runtime_validation": "not_executed",
            "collection_snapshot": DATE, "new_authored_task": False
        }
        tasks.append(record)
        calvin_additions.append(record)
    assert len(calvin_additions) == 34
    assert len(tasks) == len({r["record_id"] for r in tasks}) == 2096
    for task in tasks:
        task["domain_assignment"] = {
            "status": "unbound_or_cross_context",
            "domain_ids": [],
            "source_support_paper_ids": task["paper_ids"],
            "note": "Source native task is collected; no task-level application-domain binding is inferred from its name."
        }
        task["identity_relation"] = "source_identity_known_cross_source_equivalence_unresolved"
    write_json("task_registry.json", tasks)
    write_json("source_additions.json", calvin_additions)
    write_csv("task_registry.csv", tasks, [
        "record_id", "source_id", "native_id", "native_unit", "paper_ids",
        "source_url", "commit", "definition_path", "definition_status",
        "domain_assignment", "identity_relation"
    ])

    # The small validation file checks that streaming parsing retains every row
    # in the same order as Python's independent whole-document JSON decoder.
    val_plain = json.loads(gzip.decompress((CACHE / "partnr-val").read_bytes()))
    assert [digest(e) for e in episode_stream(CACHE / "partnr-val")] == [
        digest(e) for e in val_plain["episodes"]]
    del val_plain

    case_keys = [
        "case_id", "source_id", "native_id", "native_split", "case_kind",
        "environment_id", "observation_ref", "task_ref", "source_url", "source_version",
        "native_locator", "input_sha256", "label_sha256", "source_record_sha256",
        "evaluator_ref", "definition_check", "complete_local_inputs", "runtime_verified"
    ]
    native_ids = set()
    counts = Counter()
    errors = []
    scenes_by_split = {}
    examples = []
    program_names = Counter()
    case_outputs = {}
    with (OUT / "case_registry.jsonl.gz").open("wb") as jraw, (OUT / "case_registry.csv.gz").open("wb") as craw:
        with gzip.GzipFile(fileobj=jraw, mode="wb", filename="", mtime=0) as jgz, gzip.GzipFile(fileobj=craw, mode="wb", filename="", mtime=0) as cgz:
            with io.TextIOWrapper(jgz, encoding="utf-8") as jstream, io.TextIOWrapper(cgz, encoding="utf-8-sig", newline="") as cstream:
                writer = csv.DictWriter(cstream, fieldnames=case_keys)
                writer.writeheader()

                def emit(row):
                    if row["case_id"] in native_ids:
                        raise ValueError("Duplicate counted case ID: " + row["case_id"])
                    native_ids.add(row["case_id"])
                    counts[(row["source_id"], row["native_split"], row["case_kind"])] += 1
                    jstream.write(json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n")
                    writer.writerow(row)
                    if len(examples) < 6 or (row["source_id"] == "openeqa" and len(examples) < 12):
                        examples.append(row)

                for split in ["train", "val"]:
                    scene_ids = set()
                    receipt = by_receipt["partnr-" + split]
                    for index, episode in enumerate(episode_stream(CACHE / receipt["id"])):
                        validation_errors = validate_episode(episode, hssd_ids)
                        if validation_errors:
                            errors.append({"source": "partnr", "split": split,
                                           "native_id": str(episode.get("episode_id")),
                                           "errors": validation_errors})
                        scene_ids.add(episode["scene_id"])
                        for prop in episode["evaluation_propositions"]:
                            program_names[prop["function_name"]] += 1
                        inputs = {k: episode.get(k) for k in [
                            "instruction", "scene_id", "scene_dataset_config",
                            "start_position", "start_rotation", "rigid_objs", "ao_states", "object_states"]}
                        labels = {k: episode.get(k) for k in [
                            "evaluation_propositions", "evaluation_constraints",
                            "evaluation_proposition_dependencies"]}
                        emit({
                            "case_id": f"partnr::{split}::{episode['episode_id']}",
                            "source_id": "partnr", "native_id": str(episode["episode_id"]),
                            "native_split": split, "case_kind": "robot_episode",
                            "environment_id": f"hssd_partnr::{episode['scene_id']}",
                            "observation_ref": "runtime_sensors_defined_by_native_Habitat_contract",
                            "task_ref": f"/episodes/{index}/evaluation_propositions",
                            "source_url": receipt["url"], "source_version": partnr_info["sha"],
                            "native_locator": f"/episodes/{index}",
                            "input_sha256": digest(inputs), "label_sha256": digest(labels),
                            "source_record_sha256": digest(episode),
                            "evaluator_ref": "partnr-native-proposition-and-constraint-checks",
                            "definition_check": "passed" if not validation_errors else "needs_review",
                            "complete_local_inputs": False, "runtime_verified": False
                        })
                        if (index + 1) % 20000 == 0:
                            print(f"parsed PARTNR {split}: {index + 1:,}", flush=True)
                    scenes_by_split[split] = sorted(scene_ids)

                questions = load("openeqa-questions")
                categories = Counter()
                histories = set()
                for index, question in enumerate(questions):
                    assert all(question.get(k) for k in [
                        "question_id", "question", "answer", "category", "episode_history"])
                    categories[question["category"]] += 1
                    histories.add(question["episode_history"])
                    emit({
                        "case_id": f"openeqa::{question['question_id']}",
                        "source_id": "openeqa", "native_id": question["question_id"],
                        "native_split": "native_benchmark_unsplit", "case_kind": "qa",
                        "environment_id": "",
                        "observation_ref": question["episode_history"],
                        "task_ref": "openeqa::" + question["category"].replace(" ", "_"),
                        "source_url": by_receipt["openeqa-questions"]["url"],
                        "source_version": pins["openeqa"]["commit"],
                        "native_locator": f"/{index}",
                        "input_sha256": digest({k: question[k] for k in ["question", "episode_history"]}),
                        "label_sha256": digest({k: question.get(k) for k in ["answer", "extra_answers"]}),
                        "source_record_sha256": digest(question),
                        "evaluator_ref": "openeqa-native-llm-match",
                        "definition_check": "passed",
                        "complete_local_inputs": False, "runtime_verified": False
                    })

    for name in ["case_registry.jsonl.gz", "case_registry.csv.gz"]:
        payload = (OUT / name).read_bytes()
        case_outputs[name] = {"bytes": len(payload), "sha256": digest(payload)}
    write_json("case_examples.json", examples)
    write_json("case_validation_issues.json", errors)
    assert sum(counts.values()) == len(native_ids)
    assert counts[("partnr", "train", "robot_episode")] == 111652
    assert counts[("partnr", "val", "robot_episode")] == 1000
    assert counts[("openeqa", "native_benchmark_unsplit", "qa")] == 1636
    assert len(native_ids) == 114288

    comparisons = json.loads((ROOT / "content/benchmark_comparison/benchmark_matrix.json").read_text())
    taxonomy = json.loads((ROOT / "content/taxonomy.json").read_text())
    by_work = {r["detailed_comparison_id"]: r for r in survey if r["detailed_comparison_id"]}
    domain_registry = []
    for did, definition in taxonomy["application_contexts"].items():
        direct, adjacent = [], []
        for row in comparisons["rows"]:
            if row["group"] == "ours":
                continue
            mapped = row.get("domain_map", {}).get(did)
            if mapped in ["direct", "partial"]:
                target = direct if mapped == "direct" else adjacent
                target.append(by_work[row["id"]]["paper_id"])
        domain_registry.append({
            "domain_id": did, **definition, "explicit_source_ids": direct,
            "adjacent_source_ids": adjacent,
            "support_level": "source_overview" if direct else "adjacent_pending",
            "task_binding_complete": False
        })
    write_json("domain_registry.json", domain_registry)
    source_domain_assignments = []
    for source in survey:
        if not source["benchmark_source_registered"]:
            continue
        domains = [d["domain_id"] for d in domain_registry if source["paper_id"] in d["explicit_source_ids"]]
        adjacent = [d["domain_id"] for d in domain_registry if source["paper_id"] in d["adjacent_source_ids"]]
        source_domain_assignments.append({
            "paper_id": source["paper_id"], "name": source["name"],
            "domain_ids": domains, "adjacent_domain_ids": adjacent,
            "status": "source_overview_mapped" if domains else "cross_domain_or_unresolved",
            "source_url": source["source_url"]
        })
    write_json("source_domain_assignments.json", source_domain_assignments)

    information_tasks = [{
        "record_id": "openeqa::" + category.replace(" ", "_"),
        "source_id": "openeqa", "native_id": category.replace(" ", "_"),
        "title": category, "native_unit": "information_task_schema",
        "inventory_bucket": "information_task_definitions",
        "paper_ids": ["P038"], "source_url": by_receipt["openeqa-questions"]["url"],
        "repository": "facebookresearch/open-eqa", "commit": pins["openeqa"]["commit"],
        "definition_path": "data/open-eqa-v0.json",
        "definition_status": "native_question_category_extracted",
        "definition_sha256": by_receipt["openeqa-questions"]["sha256"],
        "native_case_records": count,
        "common_task_mapping": "unresolved", "runtime_validation": "not_executed",
        "collection_snapshot": DATE, "new_authored_task": False,
        "domain_assignment": {"status": "cross_context_unbound", "domain_ids": [],
                              "source_support_paper_ids": ["P038"]},
        "identity_relation": "native_information_category_not_a_robot_workflow"
    } for category, count in categories.items()]
    write_json("information_task_types.json", information_tasks)
    write_json("source_additions.json", calvin_additions + information_tasks)

    summary = {
        "version": VERSION, "date": DATE,
        "scope": "Counted source definitions and case metadata; no source inputs are relabeled as completed runtime evaluation.",
        "domains": len(domain_registry),
        "source_named_environment_definitions": len(environments),
        "environment_counts": dict(Counter(e["source_id"] for e in environments)),
        "robot_task_source_definitions": len(tasks),
        "previous_robot_task_source_definitions": 2062,
        "new_calvin_task_definitions": len(calvin_additions),
        "source_task_and_information_records": len(tasks) + len(information_tasks),
        "human_activity_definitions_separate": 263,
        "openeqa_information_categories_separate": len(categories),
        "case_definition_records": len(native_ids),
        "case_definitions_by_source_split": [
            {"source_id": src, "native_split": split, "case_kind": kind, "count": n}
            for (src, split, kind), n in counts.items()],
        "case_definition_checks_passed": len(native_ids) - len(errors),
        "case_definition_checks_flagged": len(errors),
        "new_case_complete_local_input_count": 0,
        "new_case_runtime_trials": 0,
        "partnr_scene_ids_by_split": scenes_by_split,
        "partnr_used_scene_count": len(set().union(*map(set, scenes_by_split.values()))),
        "openeqa_question_categories": dict(categories),
        "openeqa_observation_history_ids": len(histories),
        "observation_history_ids_are_interactive_environments": False,
        "partnr_predicate_occurrences": dict(program_names),
        "files": case_outputs,
        "counting_notes": [
            "Environment counts are source-named scene definitions; whole-corpus geometric deduplication and full asset closure are not claimed.",
            "Tasks are source-native definitions, not completed cross-source canonical specifications.",
            "Case counts retain native split and case kind; all records have input/label references and hashes, but source media and 3D assets are not fully acquired.",
            "PARTNR mini, train_2k, ci and train_132k_unverified files are excluded; the public pinned repo has no test.json.gz.",
            "OpenEQA is counted once per question_id, not once per evaluation mode or video frame."
        ],
        "excluded_aliases_or_non_cases": [
            {"item": "calvin_scene_D_eval", "reason": "evaluation configuration of D, not an additional layout"},
            {"item": "RoboCasa kitchen_styles", "reason": "appearance/configuration variation; not a new layout"},
            {"item": "PARTNR train_mini / train_2k / val_mini", "reason": "subsets of counted source files"},
            {"item": "PARTNR train_132k_unverified", "reason": "unverified source pool, not added to the selected train file"},
            {"item": "ALFRED oct21 split index", "reason": "instruction pointers only in this import; full task/label bodies not acquired"},
            {"item": "OpenEQA 152 history IDs", "reason": "observation input identifiers, not counted as robot scene definitions"}
        ]
    }
    predicate_names = {
        n.name for n in ast.walk(ast.parse((CACHE / "partnr-predicates").read_text()))
        if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))
    }
    assert set(program_names).issubset(predicate_names)
    summary["predicate_names_resolve_to_source"] = True
    def evaluator_source(key):
        entry = by_receipt[key]
        return {"source_url": entry["url"], "sha256": entry["sha256"]}
    write_json("evaluator_registry.json", [
        {"id": "partnr-native-proposition-and-constraint-checks", "source_id": "partnr",
         "methods": ["state_process"], "source_files": [evaluator_source(k) for k in [
             "partnr-measures", "partnr-evaluation-functions", "partnr-predicates"]],
         "predicate_names": sorted(program_names), "source_names_checked": True,
         "local_model_evaluation_run": False},
        {"id": "openeqa-native-llm-match", "source_id": "openeqa", "methods": ["judge"],
         "source_files": [evaluator_source("openeqa-eval")], "requires_external_judge": True,
         "local_model_evaluation_run": False},
        {"id": "calvin-native-task-checks", "source_id": "calvin", "methods": ["state_process"],
         "source_files": [evaluator_source("calvin-checker"), evaluator_source("calvin-tasks")],
         "local_model_evaluation_run": False}
    ])
    write_json("inventory_summary.json", summary)
    write_json("source_receipts.json", receipts)
    write_json("source_pins.json", {
        **pins,
        "calvin_env": {"repo": "mees/calvin_env", "commit": calvin_env_commit},
        "partnr_episodes": {"repo": "ai-habitat/partnr_episodes", "commit": partnr_info["sha"],
                           "license": partnr_info["cardData"]["license"]},
        "hssd_partnr": {"repo": "hssd/hssd-hab", "commit": hssd_info["sha"],
                        "license": hssd_info["cardData"]["license"]}
    })
    print(json.dumps({k: summary[k] for k in [
        "domains", "source_named_environment_definitions", "environment_counts",
        "robot_task_source_definitions", "case_definition_records",
        "case_definition_checks_passed", "case_definition_checks_flagged",
        "partnr_used_scene_count", "openeqa_observation_history_ids", "files"]},
        ensure_ascii=False, indent=2), flush=True)


if __name__ == "__main__":
    main()
