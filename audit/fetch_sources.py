#!/usr/bin/env python3
"""Pin public upstream source trees for a read-only scale audit.

No third-party code is imported or executed. Raw caches stay outside the website.
Credentials, if available through Git's configured helper, are used only for the
GitHub API and are never printed or saved.
"""
import concurrent.futures
import datetime
import hashlib
import json
import os
from pathlib import Path
import subprocess
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parent
CACHE = ROOT / ".cache"
CACHE.mkdir(exist_ok=True)
CATALOGUE = json.loads((ROOT / "source_catalogue.json").read_text())
TOKEN = None
try:
    env = dict(os.environ)
    env["GIT_TERMINAL_PROMPT"] = "0"
    env["GIT_ASKPASS"] = "/usr/bin/false"
    p = subprocess.run(
        ["git", "credential", "fill"],
        input="protocol=https\nhost=github.com\n\n",
        text=True, capture_output=True, env=env, timeout=10,
    )
    cred = dict(line.split("=", 1) for line in p.stdout.splitlines() if "=" in line)
    TOKEN = cred.get("password")
except Exception:
    pass


def fetch(url, as_json=False):
    headers = {"User-Agent": "RobotUseScaleInventory", "Accept": "application/vnd.github+json"}
    if TOKEN and urllib.parse.urlparse(url).hostname == "api.github.com":
        headers["Authorization"] = "Bearer " + TOKEN
    for attempt in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=35) as response:
                data = response.read()
                return json.loads(data) if as_json else data.decode("utf-8", errors="replace")
        except urllib.error.HTTPError as ex:
            if ex.code not in [429, 500, 502, 503, 504] or attempt == 2:
                raise
        except (TimeoutError, urllib.error.URLError):
            if attempt == 2:
                raise
        time.sleep(1 + attempt)


def api(endpoint):
    return fetch("https://api.github.com" + endpoint, as_json=True)


def pin_source(spec):
    directory = CACHE / spec["id"]
    directory.mkdir(exist_ok=True)
    meta_path = directory / "metadata.json"
    tree_path = directory / "tree.json"
    if meta_path.exists() and tree_path.exists():
        saved = json.loads(meta_path.read_text())
        same_repo = saved.get("repo") == spec["repo"]
        same_ref = not spec.get("ref") or spec["ref"] in [saved.get("ref"), saved.get("commit")]
        if same_repo and same_ref:
            return {**saved, **spec}
    try:
        repo_info = api("/repos/" + spec["repo"])
        repo = repo_info["full_name"]
        ref = spec.get("ref", repo_info["default_branch"])
        commit = api("/repos/" + repo + "/commits/" + ref)["sha"]
        tree_root = commit
        prefix = ""
        if spec.get("subtree"):
            for part in spec["subtree"].split("/"):
                tree = api("/repos/" + repo + "/git/trees/" + tree_root)
                child = next(item for item in tree["tree"] if item["path"] == part and item["type"] == "tree")
                tree_root = child["sha"]
            prefix = spec["subtree"] + "/"
        tree = api("/repos/" + repo + "/git/trees/" + tree_root + "?recursive=1")
        if tree.get("truncated"):
            raise RuntimeError("Recursive tree was truncated; counts are not admissible")
        nodes = [{**node, "path": prefix + node["path"]} for node in tree["tree"]]
        tree_path.write_text(json.dumps({"sha": tree["sha"], "truncated": False, "tree": nodes}))
        metadata = {
            **spec, "resolved_repo": repo, "commit": commit, "tree_sha": tree["sha"],
            "tree_truncated": False, "as_of": "2026-09-22", "status": "source_tree_pinned",
            "tree_entries": len(nodes), "source_url": "https://github.com/" + repo + "/tree/" + commit,
            "code_execution": False, "assets_downloaded": False, "canonical_normalization": False,
        }
        meta_path.write_text(json.dumps(metadata, ensure_ascii=False, indent=2))
        return metadata
    except Exception as ex:
        return {**spec, "status": "source_discovery_unresolved", "error": str(ex)[:220], "as_of": "2026-09-22"}


def source_text(meta, file_path):
    directory = CACHE / meta["id"] / "files"
    directory.mkdir(exist_ok=True)
    target = directory / (hashlib.sha256((meta["commit"] + "::" + file_path).encode()).hexdigest() + ".txt")
    if target.exists():
        return target.read_text()
    url = f'https://raw.githubusercontent.com/{meta["resolved_repo"]}/{meta["commit"]}/{urllib.parse.quote(file_path, safe="/")}'
    text = fetch(url)
    target.write_text(text)
    return text


def load_tree(meta):
    return json.loads((CACHE / meta["id"] / "tree.json").read_text())["tree"]


def main():
    output = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        futures = {pool.submit(pin_source, spec): spec for spec in CATALOGUE}
        for future in concurrent.futures.as_completed(futures):
            value = future.result()
            output.append(value)
            print(json.dumps({k: value[k] for k in ["id", "work", "status", "tree_entries", "error"] if k in value}, ensure_ascii=False), flush=True)
    order = {spec["id"]: i for i, spec in enumerate(CATALOGUE)}
    output.sort(key=lambda row: order[row["id"]])
    (ROOT / "pinned_sources.json").write_text(json.dumps(output, ensure_ascii=False, indent=2))
    print(json.dumps({"sources": len(output), "pinned": sum(x["status"] == "source_tree_pinned" for x in output)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
