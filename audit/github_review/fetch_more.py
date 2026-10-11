"""Acquire explicitly chosen follow-up files from an already pinned repo."""
import argparse
import hashlib
import json
from urllib.parse import quote
from network import CACHE, ROOT, fetch
from snapshot_repositories import classify_file


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("repo")
    parser.add_argument("paths", nargs="+")
    parser.add_argument("--ref")
    args = parser.parse_args()
    suffix = "--ref-" + hashlib.sha256(args.ref.encode()).hexdigest()[:12] if args.ref else ""
    folder = CACHE / "repos" / (args.repo.replace("/", "__") + suffix)
    manifest = json.loads((folder / "manifest.json").read_text())
    tree = {r["path"]: r for r in json.loads((folder / "tree.json").read_text())["tree"]}
    existing = {r["path"]: r for r in manifest["files"]}
    for name in args.paths:
        if name in existing and existing[name].get("local_file"):
            print(json.dumps({"path": name, "status": "already_acquired"}))
            continue
        item = tree.get(name)
        if not item:
            print(json.dumps({"path": name, "status": "not_in_pinned_tree"}))
            continue
        repo, commit = manifest["resolved_repo"], manifest["commit"]
        url = f"https://raw.githubusercontent.com/{repo}/{commit}/{quote(name, safe='/')}"
        receipt, body = fetch(url, limit=3 * 1024 * 1024)
        role = (classify_file(item) or ("explicit_followup", 0))[0]
        row = {"path": name, "suggested_role": role, "git_blob_sha": item["sha"], "receipt": receipt,
               "selection_basis": "explicit_followup",
               "permalink": f"https://github.com/{repo}/blob/{commit}/{quote(name, safe='/')}"}
        if body and receipt["status"] == 200:
            target = folder / "files" / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(body)
            row.update(local_file=target.relative_to(ROOT).as_posix(), lines=len(body.splitlines()),
                       sha256=hashlib.sha256(body).hexdigest())
        existing[name] = row
        print(json.dumps({"path": name, "status": receipt["status"], "lines": row.get("lines")}))
    manifest["files"] = list(existing.values())
    (folder / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    main()
