"""Read additional official task definitions; do not run simulators or fetch media."""
from __future__ import annotations

import concurrent.futures
import hashlib
import json
from pathlib import Path
import urllib.request

ROOT = Path(__file__).resolve().parent
CACHE = ROOT / ".cache"
CACHE.mkdir(parents=True, exist_ok=True)
HEADERS = {"User-Agent": "RobotUseSurvey/0.7 (public benchmark task inventory)"}
PINS = json.loads((ROOT / "source_pins.json").read_text()) if (ROOT / "source_pins.json").exists() else {}


def fetch(url, path):
    request = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(request, timeout=60) as response:
        data = response.read()
        status = response.status
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)
    return {
        "url": url, "status": status, "bytes": len(data),
        "sha256": hashlib.sha256(data).hexdigest(),
        "cache_file": str(path.relative_to(ROOT)), "retrieved_on": "2026-09-29",
    }


def repository(spec):
    sid, repo = spec
    info_file = CACHE / sid / "repository.json"
    receipts = [fetch(f"https://api.github.com/repos/{repo}", info_file)]
    info = json.loads(info_file.read_text())
    commit_file = CACHE / sid / "commit.json"
    receipts.append(fetch(
        f"https://api.github.com/repos/{repo}/commits/{PINS.get(sid, {}).get('commit', info['default_branch'])}",
        commit_file,
    ))
    commit = json.loads(commit_file.read_text())["sha"]
    tree_file = CACHE / sid / "tree.json"
    receipts.append(fetch(
        f"https://api.github.com/repos/{repo}/git/trees/{commit}?recursive=1",
        tree_file,
    ))
    tree = json.loads(tree_file.read_text())
    assert not tree.get("truncated")
    paths = [item["path"] for item in tree["tree"] if item["type"] == "blob"]
    selected = [
        name for name in paths
        if name.lower() in {"readme.md", "license", "license.md", "license.txt"}
        or sid == "vima" and (
            name == "vima_bench/tasks/__init__.py"
            or name.startswith("vima_bench/tasks/task_suite/") and name.endswith(".py")
        )
        or sid == "arnold" and (
            name.startswith("tasks/") and name.endswith(".py")
            or name.startswith("configs/tasks/") and name.endswith((".yaml", ".yml"))
        )
        or sid == "coin_video" and name in {"COIN.json", "taxonomy.xlsx"}
    ]
    for name in selected:
        receipts.append(fetch(
            f"https://raw.githubusercontent.com/{repo}/{commit}/{name}",
            CACHE / sid / "files" / name,
        ))
    return {
        "id": sid, "repository": repo, "commit": commit,
        "default_branch": info["default_branch"], "paths": paths,
        "selected_paths": selected, "receipts": receipts,
    }


specs = [
    ("vima", "vimalabs/VIMABench"),
    ("arnold", "arnold-benchmark/arnold"),
    ("coin_video", "coin-dataset/annotations"),
    ("crosstask", "DmZhukov/CrossTask"),
]
results, errors = [], []
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
    futures = {pool.submit(repository, spec): spec for spec in specs}
    for future in concurrent.futures.as_completed(futures):
        spec = futures[future]
        try:
            result = future.result()
            results.append(result)
            print(json.dumps({
                "source": spec[0], "commit": result["commit"],
                "downloaded_definition_files": result["selected_paths"],
            }), flush=True)
        except Exception as error:
            errors.append({"source": spec[0], "error": str(error)})
            print(json.dumps(errors[-1]), flush=True)
if not any(r["id"] == "crosstask" for r in results):
    raise RuntimeError("CrossTask official README was not available")
archive = fetch(
    "https://www.di.ens.fr/~dzhukov/crosstask/crosstask_release.zip",
    CACHE / "crosstask" / "crosstask_release.zip",
)
if PINS.get("crosstask", {}).get("archive_sha256"):
    assert archive["sha256"] == PINS["crosstask"]["archive_sha256"], "CrossTask archive version changed"
next(r for r in results if r["id"] == "crosstask")["receipts"].append(archive)
out = {"date": "2026-09-29", "sources": sorted(results, key=lambda r: r["id"]),
       "errors": errors, "downloaded_human_media": False,
       "simulators_executed": False}
(ROOT / "source_addition_receipts.json").write_text(
    json.dumps(out, ensure_ascii=False, indent=2) + "\n"
)
if errors:
    raise RuntimeError("Some official task-source downloads failed; receipts retained")
