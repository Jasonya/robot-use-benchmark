"""Validate authored reviews against pinned local source bytes and compile a ledger.

This program never creates a review decision. Missing notes remain pending.
The local source cache is private; the public ledger carries hashes/permalinks.
"""
from collections import Counter, defaultdict
from pathlib import Path
import argparse
import hashlib
import json
import re
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[2]
CONTENT = ROOT / "content/github_review"
CACHE = ROOT / "audit/.cache/github_review"
ALLOWED_STATUSES = {
    "selected_core_source_sections_reviewed", "public_readme_only",
    "readme_only_public_release", "no_confirmed_code_repository",
    "identity_or_version_unresolved", "repository_unavailable",
    "website_only", "readme_only", "source_link_unavailable",
}


def load(path):
    return json.loads(path.read_text())


def sha(value):
    return hashlib.sha256(value).hexdigest()


def portable_references(value):
    """Keep evidence-cache references relative in the public reading ledger."""
    if isinstance(value, str):
        return value.replace(str(ROOT) + "/", "").replace(str(ROOT.parent) + "/", "")
    if isinstance(value, list):
        return [portable_references(item) for item in value]
    if isinstance(value, dict):
        return {key: portable_references(item) for key, item in value.items()}
    return value


def select_json_pointer(document, pointer):
    """Resolve an RFC 6901 locator without implying a full-file review."""
    if not isinstance(pointer, str) or (pointer and not pointer.startswith("/")):
        raise ValueError(f"Invalid JSON pointer: {pointer!r}")
    value = document
    if not pointer:
        return value
    for token in pointer[1:].split("/"):
        # Reject malformed escapes instead of silently accepting an ambiguous key.
        index = 0
        while index < len(token):
            if token[index] == "~":
                if index + 1 >= len(token) or token[index + 1] not in "01":
                    raise ValueError(f"Invalid JSON pointer escape: {pointer!r}")
                index += 2
            else:
                index += 1
        key = token.replace("~1", "/").replace("~0", "~")
        if isinstance(value, dict):
            if key not in value:
                raise ValueError(f"JSON pointer key not found: {pointer!r}")
            value = value[key]
        elif isinstance(value, list):
            if not key.isascii() or not key.isdigit() or (len(key) > 1 and key.startswith("0")):
                raise ValueError(f"Invalid JSON array index: {pointer!r}")
            index = int(key)
            if index >= len(value):
                raise ValueError(f"JSON pointer index out of range: {pointer!r}")
            value = value[index]
        else:
            raise ValueError(f"JSON pointer traverses a scalar: {pointer!r}")
    return value


def safe_local(value):
    path = Path(value)
    path = path.resolve() if path.is_absolute() else (ROOT / path).resolve()
    allowed = [
        (ROOT / "audit/.cache/github_review").resolve(),
        (ROOT / "audit/.cache/github_review_worker").resolve(),
        (ROOT / "audit/.cache/quantified-v0_9").resolve(),
    ]
    if not any(path == prefix or prefix in path.parents for prefix in allowed):
        raise ValueError(f"Source file outside declared audit caches: {value}")
    return path


def index_snapshots():
    snapshots = []
    for path in (CACHE / "repos").glob("*/manifest.json"):
        record = load(path)
        record["_manifest_path"] = path.relative_to(ROOT).as_posix()
        snapshots.append(record)
    return snapshots


def match_snapshot(entry, snapshots):
    repo = entry["repo"].lower()
    candidates = [r for r in snapshots
                  if repo in {r.get("requested_repo", "").lower(), r.get("resolved_repo", "").lower()}]
    if entry.get("commit"):
        candidates = [r for r in candidates if r.get("commit") == entry["commit"]]
    elif entry.get("ref"):
        candidates = [r for r in candidates if r.get("requested_ref") == entry["ref"]]
    else:
        candidates = [r for r in candidates if not r.get("requested_ref")]
    commits = {r.get("commit") for r in candidates if r.get("commit")}
    if len(commits) > 1:
        raise ValueError(f"Ambiguous source revision for {entry['repo']}/{entry['path']}")
    for snapshot in candidates:
        for file in snapshot.get("files", []):
            if file["path"] == entry["path"] and file.get("local_file"):
                return snapshot, file
    return None, None


def resolve_read(entry, note, snapshots):
    repo, path = entry["repo"], entry["path"]
    provider = entry.get("provider", "github")
    if provider not in {"github", "huggingface_dataset"}:
        raise ValueError(f"Unsupported source provider: {provider}")
    canonical_repo = repo.removeprefix("datasets/") if provider == "huggingface_dataset" else repo
    if not re.fullmatch(r"[\w.-]+/[\w.-]+", canonical_repo):
        raise ValueError(f"Invalid source repository: {repo}")
    if not path or path.startswith("/") or ".." in Path(path).parts:
        raise ValueError("Invalid repository file path")
    explicit = [f for f in note.get("source_files", [])
                if f.get("repo", "").lower() == repo.lower() and f.get("path") == path
                and (not entry.get("commit") or f.get("commit") == entry["commit"])]
    snapshot, record = match_snapshot(entry, snapshots) if provider == "github" else (None, None)
    if explicit:
        source = explicit[0]
        local_name = source.get("local_file") or source.get("local_path")
        if not local_name and record:
            local_name = record["local_file"]
        if not local_name:
            raise ValueError("Missing local bytes for explicitly cited source")
        local = safe_local(local_name)
        commit = source.get("commit") or entry.get("commit") or (snapshot or {}).get("commit")
        expected_sha = source.get("sha256") or (record or {}).get("sha256")
        resolved_repo = (snapshot or {}).get("resolved_repo", canonical_repo)
    elif record:
        local = safe_local(record["local_file"])
        commit = snapshot["commit"]
        expected_sha = record["sha256"]
        resolved_repo = snapshot.get("resolved_repo", repo)
    else:
        raise ValueError(f"Source bytes not found for {repo}/{path}")
    if not commit or not re.fullmatch(r"[0-9a-f]{40}", commit):
        raise ValueError("Missing exact source commit")
    data = local.read_bytes()
    actual_sha = sha(data)
    if expected_sha and expected_sha != actual_sha:
        raise ValueError(f"Source hash differs: {repo}/{path}")
    encoding = entry.get("text_encoding", "utf-8")
    if encoding not in {"utf-8", "utf-8-sig", "utf-16", "utf-16-le", "utf-16-be", "latin-1"}:
        raise ValueError(f"Unsupported declared text encoding: {encoding}")
    count = len(data.decode(encoding, errors="replace").splitlines())
    ranges = entry.get("ranges", [])
    pointers = entry.get("json_pointers", [])
    if not ranges and not pointers:
        raise ValueError("Missing recorded read range or JSON pointer")
    for interval in ranges:
        if len(interval) != 2 or any(type(x) is not int for x in interval) or not 1 <= interval[0] <= interval[1] <= count:
            raise ValueError(f"Read range {interval} outside {count} lines: {repo}/{path}")
    pointer_evidence = []
    if pointers:
        if not isinstance(pointers, list):
            raise ValueError("JSON pointers must be a list")
        document = json.loads(data)
        for pointer in pointers:
            selected = select_json_pointer(document, pointer)
            canonical = json.dumps(selected, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
            pointer_evidence.append({"pointer": pointer, "selected_value_sha256": sha(canonical.encode("utf-8"))})
    base = "https://github.com" if provider == "github" else "https://huggingface.co/datasets"
    url = f"{base}/{resolved_repo}/blob/{commit}/{quote(path, safe='/')}"
    return {
        "provider": provider,
        "repo": resolved_repo, "requested_repo": repo, "commit": commit,
        "ref": entry.get("ref"), "path": path, "ranges": ranges,
        "text_encoding": encoding,
        "json_pointers": pointers, "json_pointer_evidence": pointer_evidence,
        "read_scope": entry.get("scope", "Explicitly recorded sections only"),
        "line_count": count, "sha256": actual_sha,
        "url": url, "reading_url": url + (f"#L{ranges[0][0]}-L{ranges[0][1]}" if provider == "github" and ranges and encoding.startswith("utf-8") else ""),
        "why": entry.get("why", ""), "verification": "local_source_hash_and_recorded_locators_checked",
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--require-complete", action="store_true")
    args = parser.parse_args()
    bibliography = load(ROOT / "content/literature_snapshot.json") + load(ROOT / "content/literature_refresh/literature_additions.json")
    papers = {row["id"]: row for row in bibliography}
    bench_ids = {row["paper_id"] for p in (ROOT / "content/fulltext_review").glob("batch*.json") for row in load(p)}
    domains = {row["paper_id"]: row["domain_ids"] for row in load(ROOT / "content/fulltext_review/domain_assignments.json")["assignments"]}
    bindings = {row["paper_id"]: row for row in load(CONTENT / "repository_bindings.json")}
    snapshots = index_snapshots()
    notes, issues, review_hashes = {}, [], {}
    for file in sorted((CONTENT / "reviews").glob("P*.json")):
        try:
            raw = file.read_bytes()
            note = json.loads(raw)
            pid = note["paper_id"]
            if pid != file.stem or pid not in papers:
                raise ValueError("Unknown/mismatched paper ID")
            if pid in notes:
                raise ValueError("Duplicate paper review")
            if note.get("status") not in ALLOWED_STATUSES:
                raise ValueError(f"Unknown review status {note.get('status')}")
            for field in ["summary", "environment", "tasks", "data", "evaluation", "version_note"]:
                if not isinstance(note.get(field), str) or not note[field].strip():
                    raise ValueError(f"Missing authored {field}")
            standard = note["standardization"]
            for field in ["profile", "reuse", "transform", "missing"]:
                if not isinstance(standard.get(field), str) or not standard[field].strip():
                    raise ValueError(f"Missing standardization.{field}")
            if note.get("runtime_executed") is not False:
                raise ValueError("This source-only audit cannot assert runtime execution")
            reads = [resolve_read(entry, note, snapshots) for entry in note["reading_order"]]
            if note["status"] == "selected_core_source_sections_reviewed" and not reads:
                raise ValueError("Core review has no source evidence")
            if not reads and not note.get("discovery_evidence"):
                raise ValueError("Unavailable-code decision needs discovery evidence")
            public = portable_references({k: v for k, v in note.items()
                                         if k not in {"source_files", "reading_order", "source_manifest"}})
            public["reading_order"] = reads
            public["review_sha256"] = sha(raw)
            notes[pid] = public
            review_hashes[file.relative_to(ROOT).as_posix()] = sha(raw)
        except Exception as error:
            issues.append({"file": file.relative_to(ROOT).as_posix(), "error": str(error)})
    rows = []
    for paper in bibliography:
        pid = paper["id"]
        note = notes.get(pid)
        rows.append({
            "paper_id": pid, "name": paper["short_name"], "title": paper["title"], "year": paper["year"],
            "paper_url": paper["source_url"],
            "scope": "benchmark_or_data_source" if pid in bench_ids else "related_reference",
            "domain_ids": domains.get(pid, []),
            "status": note["status"] if note else "pending_review",
            "review": note,
            "repository_binding_review_sha256": bindings[pid].get("review_sha256"),
            "repository_bindings": bindings[pid]["repositories"] if bindings[pid].get("review_sha256") else [],
            "repository_candidates": bindings[pid].get("unreviewed_candidates", []) if bindings[pid].get("review_sha256") else bindings[pid]["repositories"],
        })
    readings = [r for note in notes.values() for r in note["reading_order"]]
    github_readings = [r for r in readings if r["provider"] == "github"]
    external_readings = [r for r in readings if r["provider"] != "github"]
    read_repos = {r["repo"].lower() for r in github_readings}
    read_versions = {(r["repo"].lower(), r["commit"]) for r in github_readings}
    read_files = {(r["provider"], r["repo"].lower(), r["commit"], r["path"]) for r in readings}
    stats = {
        "bibliography_records": len(rows), "benchmark_sources": len(bench_ids),
        "related_references": len(rows) - len(bench_ids),
        "authored_review_files": len(list((CONTENT / "reviews").glob("P*.json"))),
        "validated_review_records": len(notes), "pending_review_records": len(rows) - len(notes),
        "reviewed_benchmark_sources": sum(pid in bench_ids for pid in notes),
        "reviewed_related_references": sum(pid not in bench_ids for pid in notes),
        "review_statuses": dict(Counter(row["status"] for row in rows)),
        "reviewed_repositories": len(read_repos), "reviewed_repo_versions": len(read_versions),
        "verified_source_files": len(read_files),
        "reviewed_external_repositories": len({(r["provider"], r["repo"].lower()) for r in external_readings}),
        "reviewed_external_versions": len({(r["provider"], r["repo"].lower(), r["commit"]) for r in external_readings}),
        "verified_external_source_files": len({(r["provider"], r["repo"].lower(), r["commit"], r["path"]) for r in external_readings}),
        "snapshots_acquired": sum(r["status"] == "source_packet_acquired" for r in snapshots),
        "snapshot_file_receipts": sum(len(r.get("files", [])) for r in snapshots),
        "source_only_audit": True, "new_runtime_trials": 0,
    }
    manifest = {"version": "github-review-0.1", "statistics": stats, "rows": rows,
                "review_input_sha256": review_hashes,
                "input_files_sha256": {
                    "content/github_review/repository_bindings.json":
                        sha((CONTENT / "repository_bindings.json").read_bytes())
                }}
    report = {"status": "passed" if not issues else "needs_correction", "issues": issues,
              "statistics": stats, "scope": "Authored decisions and exact local source bytes/ranges; no runtime reproduction."}
    (CONTENT / "compiled_reviews.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    (CONTENT / "validation.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if issues or (args.require_complete and len(notes) != len(rows)):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
