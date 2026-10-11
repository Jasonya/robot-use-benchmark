"""Fetch selected source text at a known exact commit, without scanning a repo."""
import argparse
import hashlib
import json
import re
from pathlib import PurePosixPath
from urllib.parse import quote

from network import CACHE, ROOT, fetch


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("repo")
    parser.add_argument("commit")
    parser.add_argument("paths", nargs="+")
    args = parser.parse_args()
    if not re.fullmatch(r"[\w.-]+/[\w.-]+", args.repo):
        parser.error("Expected owner/repository")
    if not re.fullmatch(r"[0-9a-f]{40}", args.commit):
        parser.error("An exact 40-character commit is required")
    folder = CACHE / "explicit" / args.repo.replace("/", "__") / args.commit
    folder.mkdir(parents=True, exist_ok=True)
    manifest = folder / "sources.json"
    rows = json.loads(manifest.read_text()) if manifest.exists() else []
    indexed = {row["path"]: row for row in rows}
    for path in args.paths:
        if path.startswith("/") or ".." in PurePosixPath(path).parts:
            parser.error("Invalid repository path")
        url = f"https://raw.githubusercontent.com/{args.repo}/{args.commit}/{quote(path, safe='/')}"
        receipt, data = fetch(url, limit=3 * 1024 * 1024)
        row = {"repo": args.repo, "commit": args.commit, "path": path, "url": url, "receipt": receipt}
        if receipt["status"] == 200 and data is not None:
            local = folder / "files" / path
            local.parent.mkdir(parents=True, exist_ok=True)
            local.write_bytes(data)
            row.update(local_file=local.relative_to(ROOT).as_posix(),
                       sha256=hashlib.sha256(data).hexdigest(), lines=len(data.splitlines()))
        indexed[path] = row
        manifest.write_text(json.dumps(list(indexed.values()), ensure_ascii=False, indent=2) + "\n")
        print(json.dumps({"path": path, "status": receipt["status"], "lines": row.get("lines")}))


if __name__ == "__main__":
    main()
