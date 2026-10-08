"""Losslessly wrap the existing reviewed snapshots in one catalog contract.

No simulator, LLM, remote download, semantic merge, or dataset-media access is
performed. A successful run validates this metadata import only.
"""
from __future__ import annotations

import argparse
from collections import Counter
import gzip
import hashlib
import json
from pathlib import Path
import sqlite3
import sys
import time

from jsonschema import Draft202012Validator

HERE = Path(__file__).resolve().parent
VERSION = "collection-catalog-0.1"
KINDS = ("domain", "source", "environment", "task", "evaluator", "case")
METHODS = {
    "標準答案比對": "answer", "答案或標籤比對": "answer",
    "數值誤差與相似度": "distance", "数值誤差與相似度": "distance",
    "環境狀態與過程檢查": "state_process",
    "人工或模型評審": "judge", "人類或模型判讀": "judge",
}
CASE_PAPERS = {"partnr": ["P143"], "openeqa": ["P038"]}
EVALUATOR_PAPERS = {**CASE_PAPERS, "calvin": ["P065"]}


def encoded(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True,
                      separators=(",", ":"), allow_nan=False).encode("utf-8")


def digest(value):
    return hashlib.sha256(value if isinstance(value, bytes) else encoded(value)).hexdigest()


def file_hash(path):
    h = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def stable_id(kind, identity):
    return kind + ":" + digest({"entity_type": kind, "identity": identity})


def wrap(kind, namespace, native_id, revision, native, data, provenance,
         source_refs=(), partition=""):
    if not revision:
        raise ValueError(f"Unpinned identity: {namespace}/{native_id}")
    identity = {"namespace": namespace, "native_id": str(native_id),
                "revision": revision, "partition": partition}
    return {
        "schema_version": VERSION, "entity_type": kind,
        "id": stable_id(kind, identity), "identity": identity,
        "source_refs": list(source_refs), "provenance": provenance,
        "data": data, "native": native, "native_sha256": digest(native),
        "release_tier": "catalog", "evaluation_release_eligible": False,
    }


def validate_record(row, validator):
    validator.validate(row)
    if row["id"] != stable_id(row["entity_type"], row["identity"]):
        raise ValueError("Identity digest mismatch")
    if row["native_sha256"] != digest(row["native"]):
        raise ValueError("Native payload changed")
    if row["entity_type"] != "domain" and not row["source_refs"] and row["entity_type"] != "source":
        raise ValueError("Missing reviewed source relation")
    if row["entity_type"] == "case":
        d = row["data"]
        if d["case_kind"] == "robot_episode":
            if not d["environment_ref"] or d["task_ref"] is not None:
                raise ValueError("Robot source goal reference must not masquerade as a canonical task")
            if d["task_link_kind"] != "native_goal_program_not_canonical_task":
                raise ValueError("Invalid native goal relation")
            if d["environment_link_status"] != "native_scene_id_resolved":
                raise ValueError("Missing robot scene relation")
        elif not d["task_ref"] or d["environment_ref"] is not None:
            raise ValueError("QA type or observation-context relation is inconsistent")


def record_links(row):
    links = [(row["id"], "source", ref) for ref in row["source_refs"]]
    d = row["data"]
    links += [(row["id"], "domain", ref) for ref in d.get("domain_refs", [])]
    for key in ("environment_ref", "task_ref", "evaluator_ref"):
        if d.get(key):
            links.append((row["id"], key, d[key]))
    return links


def make_database(connection):
    connection.executescript("""
    PRAGMA foreign_keys=ON;
    CREATE TABLE records(
      id TEXT PRIMARY KEY, entity_type TEXT NOT NULL, namespace TEXT NOT NULL,
      native_id TEXT NOT NULL, revision TEXT NOT NULL, partition TEXT NOT NULL,
      payload TEXT NOT NULL,
      UNIQUE(entity_type,namespace,native_id,revision,partition));
    CREATE TABLE links(
      origin_id TEXT NOT NULL REFERENCES records(id),
      relation TEXT NOT NULL,
      target_id TEXT NOT NULL REFERENCES records(id),
      PRIMARY KEY(origin_id,relation,target_id));
    CREATE INDEX records_kind ON records(entity_type);
    CREATE INDEX links_target ON links(target_id);
    """)


def insert_record(connection, row):
    i = row["identity"]
    connection.execute("INSERT INTO records VALUES(?,?,?,?,?,?,?)", (
        row["id"], row["entity_type"], i["namespace"], i["native_id"],
        i["revision"], i["partition"], encoded(row).decode("utf-8")))
    connection.executemany("INSERT INTO links VALUES(?,?,?)", record_links(row))


class Inputs:
    def __init__(self, root):
        self.root, self.manifest = root, {}

    def pin(self, name):
        if name not in self.manifest:
            path = self.root / name
            self.manifest[name] = {"path": name, "sha256": file_hash(path),
                                   "bytes": path.stat().st_size}
        return self.manifest[name]

    def read(self, name):
        self.pin(name)
        return json.loads((self.root / name).read_text())

    def origin(self, name, locator):
        return {"snapshot_path": name, "snapshot_sha256": self.pin(name)["sha256"],
                "locator": locator, "adapter_version": "existing-snapshot-0.1"}


def iter_records(inputs):
    codebook_path = "content/fulltext_review/codebook.json"
    codebook = inputs.read(codebook_path)
    domain_ids = {}
    for index, native in enumerate(codebook["domains"]):
        row = wrap("domain", "survey-domain", native["id"],
                   codebook["classification_version"], native, {
                       "name": native["name"], "definition": native["definition"],
                       "taxonomy_version": codebook["classification_version"],
                       "scope_kind": native["scope_kind"],
                   }, inputs.origin(codebook_path, f"/domains/{index}"))
        domain_ids[native["id"]] = row["id"]
        yield row

    assignment_path = "content/fulltext_review/domain_assignments.json"
    coding = inputs.read(assignment_path)
    if coding["version"] != codebook["classification_version"]:
        raise ValueError("Domain taxonomy and decisions have different versions")
    assignments = {a["paper_id"]: a for a in coding["assignments"]}
    receipts = {r["paper_id"]: r for r in inputs.read("content/fulltext_review/acquisition_receipts.json")}
    bibliography = inputs.read("content/literature_snapshot.json") + inputs.read(
        "content/literature_refresh/literature_additions.json")
    papers = {p["id"]: p for p in bibliography}
    source_ids = {}
    for batch in sorted((inputs.root / "content/fulltext_review").glob("batch*.json")):
        name = batch.relative_to(inputs.root).as_posix()
        for index, native in enumerate(inputs.read(name)):
            pid = native["paper_id"]
            assignment, receipt = assignments[pid], receipts[pid]
            if not (native["reviewed_pdf_sha256"] == assignment["source_pdf_sha256"] == receipt["pdf_sha256"]):
                raise ValueError(f"Source review or classification revision drift: {pid}")
            all_pages = (native["pages_read"]
                         + [p for e in native["evidence"] for p in e["pages"]]
                         + [p for c in native["native_counts"] for p in c["pages"]])
            if any(not isinstance(page, int) or not 1 <= page <= receipt["pages"] for page in all_pages):
                raise ValueError(f"Review page outside source PDF: {pid}")
            supported_domains = set()
            for evidence in assignment["evidence"]:
                evidence_receipt = receipts[evidence["paper_id"]]
                if evidence["source_pdf_sha256"] != evidence_receipt["pdf_sha256"]:
                    raise ValueError(f"Classification evidence drift: {pid}")
                if any(not 1 <= page <= evidence_receipt["pages"] for page in evidence["pages"]):
                    raise ValueError(f"Classification page outside source PDF: {pid}")
                supported_domains.update(evidence["domain_ids"])
            if not set(assignment["domain_ids"]).issubset(supported_domains):
                raise ValueError(f"Unsupported domain decision: {pid}")
            row = wrap("source", "reviewed-source", pid,
                       receipt.get("reviewed_version") or f"sha256:{receipt['pdf_sha256']}",
                       native, {
                           "name": papers[pid]["short_name"], "paper_id": pid,
                           "title": papers[pid]["title"], "source_url": papers[pid]["source_url"],
                           "reviewed_pdf_url": receipt.get("reviewed_pdf_url") or receipt["pdf_url"],
                           "reviewed_pdf_sha256": receipt["pdf_sha256"],
                           "reviewed_pdf_pages": receipt["pages"],
                           "domain_refs": [domain_ids[d] for d in assignment["domain_ids"]],
                           "domain_assignment": assignment,
                           "evaluation_methods": sorted({METHODS[m] for m in native["evaluation_types"]}),
                           "native_counts": native["native_counts"],
                           "review_scope": native["scope_read"], "pages_read": native["pages_read"],
                           "resources_status": "dataset_media_and_assets_not_verified_by_this_import",
                       }, inputs.origin(name, f"/{index}"))
            if pid in source_ids:
                raise ValueError(f"Duplicate source review: {pid}")
            source_ids[pid] = row["id"]
            yield row
    if set(source_ids) != set(assignments):
        raise ValueError("Source review and domain decision populations differ")

    environment_ids = {}
    name = "content/quantified/environment_registry.json"
    for index, native in enumerate(inputs.read(name)):
        row = wrap("environment", native["source_id"], native["native_id"],
                   native["source_version"], native, {
                       "environment_kind": "simulation_scene_definition",
                       "native_unit": native["count_unit"],
                       "definition_ref": native["source_url"],
                       "canonical_environment_id": None,
                       "mapping_status": "cross_source_equivalence_pending",
                       "asset_status": "full_asset_closure_not_verified",
                       "runtime_status": "not_run_by_this_import",
                   }, inputs.origin(name, f"/{index}"), [source_ids[p] for p in native["paper_ids"]])
        if native["environment_id"] in environment_ids:
            raise ValueError("Environment alias needs version-specific resolution")
        environment_ids[native["environment_id"]] = row["id"]
        yield row

    task_ids = {}
    task_inputs = (
        ("content/quantified/task_registry.json", "robot_task_definition"),
        ("content/quantified/information_task_types.json", "information_task_type"),
        ("content/survey_union/source_additions.json", "human_activity_definition"),
    )
    for name, kind in task_inputs:
        for index, native in enumerate(inputs.read(name)):
            if kind == "human_activity_definition" and native["inventory_bucket"] != "human_activity_definitions":
                continue
            row = wrap("task", native["source_id"], native["native_id"],
                       native["commit"], native, {
                           "title": native["title"], "task_kind": kind,
                           "native_unit": native["native_unit"], "definition_ref": native["source_url"],
                           "domain_refs": [], "domain_mapping_status": "task_level_review_pending",
                           "canonical_task_id": None, "mapping_status": "cross_source_equivalence_pending",
                           "goal_program_status": "native_reference_preserved_formal_alignment_pending",
                       }, inputs.origin(name, f"/{index}"), [source_ids[p] for p in native["paper_ids"]])
            if native["record_id"] in task_ids:
                raise ValueError("Task alias needs version-specific resolution")
            task_ids[native["record_id"]] = row["id"]
            yield row

    evaluator_ids = {}
    name = "content/quantified/evaluator_registry.json"
    for index, native in enumerate(inputs.read(name)):
        # An evaluator may depend on several repositories. Pin the complete
        # sorted set of source URLs and file hashes, not just one repo commit.
        revision = "source-files-sha256:" + digest(sorted(
            native["source_files"], key=lambda f: (f["source_url"], f["sha256"])))
        row = wrap("evaluator", native["source_id"], native["id"], revision,
                   native, {
                       "methods": native["methods"], "source_files": native["source_files"],
                       "implementation_status": "source_indexed_not_executed_by_this_import",
                   }, inputs.origin(name, f"/{index}"),
                   [source_ids[p] for p in EVALUATOR_PAPERS[native["source_id"]]])
        evaluator_ids[native["id"]] = row["id"]
        yield row

    name = "content/quantified/case_registry.jsonl.gz"
    inputs.pin(name)
    with gzip.open(inputs.root / name, "rt", encoding="utf-8") as stream:
        for index, line in enumerate(stream, 1):
            native = json.loads(line)
            if native["complete_local_inputs"] or native["runtime_verified"]:
                raise ValueError("Input scope changed; review adapter before importing evaluation claims")
            robot = native["case_kind"] == "robot_episode"
            row = wrap("case", native["source_id"], native["native_id"],
                       native["source_version"], native, {
                           "case_kind": native["case_kind"], "native_split": native["native_split"],
                           "unified_split": None,
                           "environment_ref": environment_ids[native["environment_id"]] if robot else None,
                           "environment_link_status": "native_scene_id_resolved" if robot else "observation_context_only_interactive_scene_unbound",
                           "task_ref": None if robot else task_ids[native["task_ref"]],
                           "task_link_kind": "native_goal_program_not_canonical_task" if robot else "information_task_type",
                           "native_task_ref": native["task_ref"], "observation_ref": native["observation_ref"],
                           "evaluator_ref": evaluator_ids[native["evaluator_ref"]],
                           "input_sha256": native["input_sha256"], "label_sha256": native["label_sha256"],
                           "source_record_sha256": native["source_record_sha256"],
                           "native_definition_check": native["definition_check"],
                           "input_status": "not_complete_in_imported_snapshot",
                           "protocol_status": "not_frozen_by_this_import",
                           "leakage_audit_status": "cross_source_audit_pending",
                           "runtime_status": "not_run_by_this_import",
                       }, inputs.origin(name, f"jsonl:line:{index}"),
                       [source_ids[p] for p in CASE_PAPERS[native["source_id"]]],
                       partition=native["native_split"])
            yield row


def write_json(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2, allow_nan=False) + "\n")


def run(root, out):
    if out.exists() and any(out.iterdir()):
        raise ValueError("Choose a new empty output directory; snapshots are immutable")
    out.mkdir(parents=True, exist_ok=True)
    schema = json.loads((HERE / "catalog_record.schema.json").read_text())
    Draft202012Validator.check_schema(schema)
    validator = Draft202012Validator(schema)
    inputs = Inputs(root)
    connection = sqlite3.connect(out / "catalog.sqlite")
    make_database(connection)
    handles = {}
    counts, task_kinds, splits = Counter(), Counter(), Counter()
    input_source_coverage = {kind: set() for kind in ("environment", "task", "case")}
    namespace_coverage = {kind: set() for kind in ("environment", "task", "case")}
    examples, source_units = {}, 0
    try:
        for kind in KINDS:
            handles[kind] = gzip.GzipFile(filename="", mode="wb", mtime=0,
                                         fileobj=(out / f"{kind}s.jsonl.gz").open("wb"))
        for row in iter_records(inputs):
            validate_record(row, validator)
            insert_record(connection, row)
            kind = row["entity_type"]
            handles[kind].write(encoded(row) + b"\n")
            counts[kind] += 1
            if kind == "source":
                source_units += len(row["data"]["native_counts"])
            if kind in input_source_coverage:
                input_source_coverage[kind].update(row["source_refs"])
                namespace_coverage[kind].add(row["identity"]["namespace"])
            if kind == "task":
                task_kinds[row["data"]["task_kind"]] += 1
            if kind == "case":
                splits[(row["identity"]["namespace"], row["data"]["case_kind"],
                        row["data"]["native_split"])] += 1
                if counts[kind] % 25000 == 0:
                    print(f"Validated {counts[kind]:,} case metadata records", flush=True)
            key = kind + ":" + (row["data"].get("task_kind") or row["data"].get("case_kind") or "")
            if key not in examples:
                examples[key] = row
        connection.commit()
        foreign_key_issues = connection.execute("PRAGMA foreign_key_check").fetchall()
        if foreign_key_issues:
            raise ValueError(f"Unresolved foreign keys: {foreign_key_issues[:3]}")
        integrity = connection.execute("PRAGMA integrity_check").fetchone()[0]
        if integrity != "ok":
            raise ValueError(f"SQLite integrity: {integrity}")
        link_count = connection.execute("SELECT COUNT(*) FROM links").fetchone()[0]
        source_domains = connection.execute(
            "SELECT COUNT(*) FROM links WHERE relation='domain'").fetchone()[0]
    except Exception as error:
        connection.rollback()
        write_json(out / "FAILED.json", {"error": str(error), "release_eligible": False})
        raise
    finally:
        for handle in handles.values():
            # GzipFile deliberately leaves a caller-supplied underlying file open.
            raw_handle = handle.fileobj
            handle.close()
            raw_handle.close()
        connection.close()
    # The compressed products are decompressed again, not merely trusted from
    # their in-memory construction. Check native payload preservation and counts.
    roundtrip = Counter()
    for kind in KINDS:
        with gzip.open(out / f"{kind}s.jsonl.gz", "rt", encoding="utf-8") as stream:
            for line in stream:
                row = json.loads(line)
                if digest(row["native"]) != row["native_sha256"]:
                    raise ValueError("Export round-trip changed a native record")
                roundtrip[kind] += 1
    if roundtrip != counts:
        raise ValueError("Export counts differ from inserted records")
    # Detect inputs edited while the import was running.
    for item in inputs.manifest.values():
        if file_hash(root / item["path"]) != item["sha256"]:
            raise ValueError(f"Input changed during import: {item['path']}")
    manifest = list(sorted(inputs.manifest.values(), key=lambda item: item["path"]))
    write_json(out / "input_manifest.json", manifest)
    write_json(out / "examples.json", list(examples.values()))
    report = {
        "schema_version": VERSION, "adapter_version": "existing-snapshot-0.1",
        "classification_version": inputs.read("content/fulltext_review/codebook.json")["classification_version"],
        "scope": "Existing source-definition and case-metadata snapshots only; no new dataset payload or model execution.",
        "counts": dict(counts), "task_kinds": dict(task_kinds),
        "case_splits": [{"source_namespace": s, "kind": k, "native_split": p, "count": n}
                        for (s, k, p), n in sorted(splits.items())],
        "source_native_quantity_records": source_units,
        "source_domain_links": source_domains, "all_resolved_reference_links": link_count,
        "source_coverage": {
            kind: {"reviewed_sources_with_entries": len(ids), "reviewed_source_denominator": counts["source"],
                   "applicable_source_denominator": None,
                   "definition": "Presence within the reviewed corpus, not complete extraction. Applicability needs the source acquisition matrix.",
                   "native_namespaces": sorted(namespace_coverage[kind])}
            for kind, ids in input_source_coverage.items()
        },
        "canonical_task_union_count": None,
        "canonical_environment_union_count": None,
        "task_level_domain_mapping_count_in_this_import": 0,
        "evaluation_release_eligible_cases_in_this_import": 0,
        "new_downloaded_dataset_payloads": 0, "new_model_trials": 0,
        "validation": {
            "schema_valid_records": sum(counts.values()),
            "native_payload_roundtrip_records": sum(roundtrip.values()),
            "unique_identity_check": "passed", "foreign_key_check": "passed",
            "input_hash_stability": "passed", "sqlite_integrity": integrity,
            "semantic_alignment": "not_performed",
            "media_and_simulator_assets": "not_verified",
            "cross_source_split_leakage": "not_audited",
            "runtime_and_evaluator_reproduction": "not_performed",
        },
        "input_manifest_sha256": digest(manifest),
        "adapter_sha256": file_hash(HERE / "run_snapshot.py"),
        "schema_sha256": file_hash(HERE / "catalog_record.schema.json"),
        "outputs": {
            name: {"sha256": file_hash(out / name), "bytes": (out / name).stat().st_size}
            for name in [*(f"{kind}s.jsonl.gz" for kind in KINDS), "examples.json"]
        },
    }
    write_json(out / "report.json", report)
    # A release marker is written only after every verification above succeeds.
    write_json(out / "SUCCESS.json", {"tier": "catalog", "report_sha256": file_hash(out / "report.json")})
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=HERE.parents[1],
                        help="Website repository root containing content/")
    parser.add_argument("--out", type=Path, required=True, help="New empty output directory")
    args = parser.parse_args()
    start = time.monotonic()
    report = run(args.root.resolve(), args.out.resolve())
    print(json.dumps({"counts": report["counts"], "task_kinds": report["task_kinds"],
                      "elapsed_seconds": round(time.monotonic() - start, 2),
                      "evaluation_release_eligible_cases": 0}, ensure_ascii=False))


if __name__ == "__main__":
    try:
        main()
    except (ValueError, KeyError, sqlite3.IntegrityError) as error:
        print(f"Import failed: {error}", file=sys.stderr)
        raise SystemExit(1)
