"""Pin public repositories and acquire bounded source-reading packets.

The complete recursive tree (when GitHub returns one) and selected text files
are preserved. This is not a full asset download, code execution, or review.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path
import re
from urllib.parse import quote

from network import CACHE, ROOT, fetch, get_token

TEXT_SUFFIXES = {".md", ".rst", ".txt", ".py", ".json", ".jsonl", ".yaml", ".yml",
                 ".toml", ".sh", ".cfg", ".ini", ".ipynb", ".csv", ".bddl", ".xml", ".urdf"}
SKIP = re.compile(r"(^|/)(node_modules|\.git|vendor|third_party|third-party|external|externals|build|dist|site-packages|\.venv|images|videos|weights|checkpoints|wandb)(/|$)", re.I)


def safe_repo(repo):
    if not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", repo):
        raise ValueError(f"Invalid repo name: {repo}")
    return repo.replace("/", "__")


def classify_file(item):
    path = item["path"]
    lower = path.lower()
    basename = Path(lower).name
    if item["type"] != "blob" or item.get("size", 0) > 700_000 or SKIP.search(path):
        return None
    suffix = Path(lower).suffix
    if suffix not in TEXT_SUFFIXES and basename not in {"license", "licence", "makefile"}:
        return None
    depth = lower.count("/")
    if re.match(r"readme(?:\.[a-z]+)?$", basename):
        return ("overview", 120 - depth * 8)
    if basename in {"pyproject.toml", "setup.py", "requirements.txt", "environment.yml", "citation.cff", "license", "license.md", "license.txt"}:
        return ("setup", 90 - depth * 10)
    if re.search(r"(eval|metric|success|condition|scor|benchmark|challenge)", lower):
        score = 60 - depth * 2
        if re.search(r"(^|/)(evaluate|evaluation|eval|metrics|conditions|success|score)(\.py|/|_)", lower):
            score += 25
        if suffix == ".py":
            score += 12
        if re.search(r"(train|policy|video|image|render|plot)", basename):
            score -= 12
        return ("evaluation", score)
    if re.search(r"(task|env|scene|goal|spec|predicate|schema|registr)", lower):
        score = 65 - depth * 2
        if basename in {"task.py", "tasks.py", "base.py", "base_env.py", "env.py", "task_registry.py", "__init__.py", "task_suite.py", "spec.py"}:
            score += 25
        if suffix in {".py", ".json", ".yaml", ".bddl"}:
            score += 10
        return ("task_environment", score)
    if re.search(r"(dataset|data_loader|dataloader|annotation|split|download|episode|trajectory|format)", lower):
        score = 70 - depth * 2
        if suffix == ".py":
            score += 12
        if re.search(r"(download|dataset|format)", basename):
            score += 15
        return ("data", score)
    if re.search(r"(demo|example|quickstart|getting_started|tutorial)", lower):
        return ("usage", 55 - depth * 3)
    return ("other", 20 - depth)


def choose_files(tree):
    groups = {}
    for item in tree:
        classified = classify_file(item)
        if classified:
            role, score = classified
            groups.setdefault(role, []).append((score, item))
    limits = {"overview": 2, "setup": 2, "evaluation": 5, "task_environment": 6, "data": 5, "usage": 2}
    chosen = []
    for role, limit in limits.items():
        for score, item in sorted(groups.get(role, []), key=lambda pair: (-pair[0], len(pair[1]["path"]), pair[1]["path"]))[:limit]:
            chosen.append({**item, "suggested_role": role, "selection_score": score})
    if len(chosen) < 6:
        selected = {r["path"] for r in chosen}
        for score, item in sorted(groups.get("other", []), key=lambda pair: (-pair[0], pair[1]["path"]))[:6 - len(chosen)]:
            if item["path"] not in selected:
                chosen.append({**item, "suggested_role": "other", "selection_score": score})
    return chosen, {role: len(items) for role, items in groups.items()}


def snapshot(repo, ref=None):
    suffix = "--ref-" + hashlib.sha256(ref.encode()).hexdigest()[:12] if ref else ""
    folder = CACHE / "repos" / (safe_repo(repo) + suffix)
    folder.mkdir(parents=True, exist_ok=True)
    manifest_path = folder / "manifest.json"
    if manifest_path.exists():
        existing = json.loads(manifest_path.read_text())
        if existing.get("status") != "retrieval_deferred":
            return existing
    report = {"requested_repo": repo, "requested_ref": ref, "status": "pending", "files": [], "review_status": "not_reviewed"}
    metadata_receipt, body = fetch(f"https://api.github.com/repos/{repo}")
    report["metadata_receipt"] = metadata_receipt
    if metadata_receipt["status"] != 200:
        report["status"] = "retrieval_deferred" if metadata_receipt.get("rate_limited") or metadata_receipt["status"] == "deferred_rate_limit" else "repository_unavailable"
    else:
        metadata = json.loads(body)
        report["resolved_repo"] = metadata["full_name"]
        report["metadata"] = {k: metadata.get(k) for k in ["html_url", "description", "homepage", "default_branch", "archived", "size", "created_at", "pushed_at", "license", "fork", "private"]}
        if metadata.get("private"):
            report["status"] = "not_public_not_collected"
        else:
            resolved = metadata["full_name"]
            if ref and re.fullmatch(r"[0-9a-f]{40}", ref):
                commit_receipt, body = {"status": 200, "basis": "explicit_commit"}, json.dumps({"object": {"sha": ref}}).encode()
            elif ref:
                commit_receipt, body = fetch(f"https://api.github.com/repos/{resolved}/git/ref/tags/{quote(ref, safe='')}")
                if commit_receipt["status"] != 200:
                    commit_receipt, body = fetch(f"https://api.github.com/repos/{resolved}/git/ref/heads/{quote(ref, safe='')}")
            else:
                commit_receipt, body = fetch(f"https://api.github.com/repos/{resolved}/git/ref/heads/{quote(metadata['default_branch'], safe='')}")
            report["commit_receipt"] = commit_receipt
            if commit_receipt["status"] != 200:
                report["status"] = "retrieval_deferred" if commit_receipt.get("rate_limited") or commit_receipt["status"] == "deferred_rate_limit" else "commit_unavailable_or_empty"
            else:
                commit_object = json.loads(body)["object"]
                if commit_object.get("type") == "tag":
                    tag_receipt, tag_body = fetch(f"https://api.github.com/repos/{resolved}/git/tags/{commit_object['sha']}")
                    if tag_receipt["status"] != 200:
                        raise ValueError(f"Could not resolve annotated tag for {repo} {ref}")
                    commit_object = json.loads(tag_body)["object"]
                commit_sha = commit_object["sha"]
                report["commit"] = commit_sha
                detail_receipt, detail_body = fetch(f"https://api.github.com/repos/{resolved}/git/commits/{commit_sha}")
                if detail_receipt["status"] == 200:
                    report["commit_date"] = json.loads(detail_body)["committer"]["date"]
                tree_receipt, body = fetch(f"https://api.github.com/repos/{resolved}/git/trees/{commit_sha}?recursive=1", limit=28 * 1024 * 1024)
                report["tree_receipt"] = tree_receipt
                if tree_receipt["status"] != 200:
                    report["status"] = "retrieval_deferred" if tree_receipt.get("rate_limited") or tree_receipt["status"] == "deferred_rate_limit" else "tree_unavailable"
                else:
                    tree_data = json.loads(body)
                    (folder / "tree.json").write_text(json.dumps(tree_data, ensure_ascii=False, indent=2) + "\n")
                    report["tree_truncated"] = tree_data.get("truncated", False)
                    report["tree_entries"] = len(tree_data["tree"])
                    chosen, groups = choose_files(tree_data["tree"])
                    report["text_file_candidates_by_role"] = groups
                    for item in chosen:
                        raw_url = f"https://raw.githubusercontent.com/{resolved}/{commit_sha}/{quote(item['path'], safe='/')}"
                        receipt, data = fetch(raw_url, limit=750_000)
                        file_report = {"path": item["path"], "suggested_role": item["suggested_role"],
                                       "git_blob_sha": item["sha"], "receipt": receipt,
                                       "permalink": f"https://github.com/{resolved}/blob/{commit_sha}/{quote(item['path'], safe='/')}"}
                        if receipt["status"] == 200:
                            text = data.decode("utf-8", errors="replace")
                            target = folder / "files" / item["path"]
                            target.parent.mkdir(parents=True, exist_ok=True)
                            target.write_bytes(data)
                            file_report.update(local_file=target.relative_to(ROOT).as_posix(),
                                               lines=len(text.splitlines()), sha256=hashlib.sha256(data).hexdigest())
                        report["files"].append(file_report)
                    report["status"] = "source_packet_acquired"
    manifest_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    return report


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--repos", nargs="*")
    parser.add_argument("--ref")
    args = parser.parse_args()
    bindings = json.loads((ROOT / "content/github_review/repository_bindings.json").read_text())
    repos = args.repos or sorted({r["requested_repo"] for source in bindings for r in source["repositories"]}, key=str.lower)
    # Initialize once before worker threads; never write credentials to disk.
    get_token()
    reports = []
    with ThreadPoolExecutor(max_workers=1) as pool:
        for report in pool.map(lambda repo: snapshot(repo, args.ref), repos):
            reports.append(report)
            print(json.dumps({"repo": report["requested_repo"], "resolved": report.get("resolved_repo"),
                              "status": report["status"], "files": len(report["files"]),
                              "tree_truncated": report.get("tree_truncated")}), flush=True)
    (CACHE / "snapshot_batch.json").write_text(json.dumps(reports, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    main()
