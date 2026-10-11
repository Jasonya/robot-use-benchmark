"""Print bounded source excerpts for deliberate per-repository review."""
import argparse
import ast
import hashlib
import json
from pathlib import Path
import re

from network import CACHE, ROOT

IMPORTANT = re.compile(r"(evaluat|^eval$|metric|success|reward|score|__getitem__|load.*data|read.*data|register|termination|reset|step|compute|download|split|^ap$|^f1$|^miou$|recall)", re.I)


def excerpt(file, maximum=80):
    path = ROOT / file["local_file"]
    text = path.read_text(errors="replace")
    lines = text.splitlines()
    spans = []
    if path.suffix == ".py":
        try:
            tree = ast.parse(text)
            nodes = [n for n in ast.walk(tree) if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))]
            ranked = sorted(nodes, key=lambda n: (
                0 if re.search(r"success|reward|evaluat|^eval$|metric|score|__getitem__|^ap$|^f1$|^miou$|recall", n.name, re.I) else
                1 if IMPORTANT.search(n.name) else 2, n.lineno))
            for node in ranked[:2]:
                if node.end_lineno - node.lineno > maximum:
                    spans.append((node.lineno, node.lineno + maximum // 2))
                    spans.append((node.end_lineno - maximum // 2, node.end_lineno))
                else:
                    spans.append((node.lineno, node.end_lineno))
            if not spans:
                spans = [(1, min(len(lines), maximum))]
        except SyntaxError:
            spans = [(1, min(len(lines), maximum))]
    else:
        spans = [(1, min(len(lines), maximum))]
    unique = []
    used = set()
    characters = 0
    for start, end in spans:
        for i in range(max(1, start), min(len(lines), end) + 1):
            if i not in used:
                line = f"{i}: {lines[i-1][:1200]}"
                if characters + len(line) > 11500:
                    break
                unique.append(line)
                characters += len(line) + 1
                used.add(i)
    actual = []
    for index in sorted(used):
        if actual and index == actual[-1][1] + 1:
            actual[-1][1] = index
        else:
            actual.append([index, index])
    return "\n".join(unique), actual


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("repos", nargs="+")
    parser.add_argument("--max-code-files", type=int, default=3)
    parser.add_argument("--readme-lines", type=int, default=90)
    parser.add_argument("--files", nargs="*")
    parser.add_argument("--ref")
    args = parser.parse_args()
    for repo in args.repos:
        suffix = "--ref-" + hashlib.sha256(args.ref.encode()).hexdigest()[:12] if args.ref else ""
        folder = CACHE / "repos" / (repo.replace("/", "__") + suffix)
        manifest = json.loads((folder / "manifest.json").read_text())
        print(json.dumps({"repo": repo, "resolved": manifest.get("resolved_repo"), "commit": manifest.get("commit"),
                          "status": manifest["status"], "metadata": manifest.get("metadata"),
                          "tree_entries": manifest.get("tree_entries"), "truncated": manifest.get("tree_truncated")}, ensure_ascii=False))
        files = [f for f in manifest["files"] if f.get("local_file")]
        print("ACQUIRED FILES " + json.dumps([{"path": f["path"], "role": f["suggested_role"], "lines": f["lines"]} for f in files]))
        readmes = [f for f in files if f["suggested_role"] == "overview"]
        viewed = []
        for file in readmes[:1] if args.readme_lines else []:
            lines = (ROOT / file["local_file"]).read_text(errors="replace").splitlines()
            count = min(len(lines), args.readme_lines)
            print(f"READ {file['path']} L1-L{count} SHA256={file['sha256']}")
            body = []
            characters = 0
            for i, line in enumerate(lines[:count]):
                shown = f"{i+1}: {line[:1200]}"
                if characters + len(shown) > 14000:
                    break
                body.append(shown)
                characters += len(shown) + 1
            print("\n".join(body))
            viewed.append({"path": file["path"], "ranges": [[1, len(body)]], "sha256": file["sha256"]})
        chosen = []
        for role in ["evaluation", "data", "task_environment"]:
            candidates = [f for f in files if f["suggested_role"] == role]
            if candidates:
                # Prefer substantive code over a one-line registration/import.
                candidates.sort(key=lambda f: (f["lines"] < 12, f["path"].endswith("__init__.py"), -min(f["lines"], 80)))
                chosen.append(candidates[0])
        if not chosen:
            chosen = [f for f in files if f not in readmes and Path(f["path"]).suffix in {".py", ".pyx", ".json", ".yaml"}][:args.max_code_files]
        if args.files:
            chosen = [f for f in files if f["path"] in args.files]
        for file in chosen[:args.max_code_files] if not args.files else chosen:
            text, spans = excerpt(file)
            print(f"READ {file['path']} RANGES={spans} SHA256={file['sha256']}")
            print(text)
            viewed.append({"path": file["path"], "ranges": spans, "sha256": file["sha256"]})
        # Record what was presented, not whether the assistant reviewed it.
        out = folder / "presented_excerpts.json"
        previous = json.loads(out.read_text()).get("files", []) if out.exists() else []
        merged = previous + [r for r in viewed if r not in previous]
        out.write_text(json.dumps({"scope": "excerpts_presented_not_a_review_decision",
                                  "line_display_limit_characters": 1200, "files": merged}, indent=2) + "\n")


if __name__ == "__main__":
    main()
