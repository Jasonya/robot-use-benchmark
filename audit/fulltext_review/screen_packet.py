"""Navigation excerpts for inclusion screening, never automatic review labels."""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
for pid in sys.argv[1:]:
    folder = ROOT / "audit/.cache/fulltext_review" / pid
    receipt = json.loads((folder / "receipt.json").read_text())
    readable = folder / "readable.txt"
    if not readable.exists():
        subprocess.run(["pdftotext", str(folder / "paper.pdf"), str(readable)], check=True, capture_output=True)
    pages = readable.read_text(errors="replace").split("\f")
    front = re.sub(r"\s+", " ", pages[0])
    abstract = re.search(r"\bAbstract\b(.+?)(?:\b1[ .]\s*Introduction|$)", front, re.I)
    print(f"\n{pid} | {receipt['name']} | {receipt['pages']} PDF pages")
    print("p1:", (abstract.group(1) if abstract else front)[:1400])
    candidates = []
    for n, page in enumerate(pages[:min(12, len(pages))], 1):
        if re.match(r"\s*References\b", page):
            break
        text = re.sub(r"\s+", " ", page)
        for match in re.finditer(
            r"\b(?:We (?:introduce|collect|construct|curate|evaluate|benchmark)|"
            r"Datasets?\.|Evaluation (?:protocol|setup)|Experimental setup|"
            r"Benchmark (?:construction|dataset)|Our dataset|Our benchmark)\b", text, re.I
        ):
            if n == 1:
                continue
            excerpt = text[max(0, match.start()-40):match.start()+1100]
            score = 3 * bool(re.search(r"\b(?:dataset|benchmark)\b", excerpt, re.I))
            score += 3 * bool(re.search(r"\b(?:collect|introduce|curate|construct)\b", excerpt, re.I))
            score += bool(re.search(r"\d", excerpt))
            candidates.append((score, n, match.start(), excerpt))
    picked = sorted(candidates, key=lambda x: (-x[0], x[1], x[2]))
    if picked:
        score, n, _, excerpt = picked[0]
        print(f"p{n} contribution/setup:", excerpt)
    # Ensure an actual evaluation-context excerpt can also be screened.
    evals = [x for x in candidates if re.search(r"\b(?:evaluate|evaluation|experimental)\b", x[3], re.I)
             and (not picked or x[1] != picked[0][1])]
    if evals:
        _, n, _, excerpt = sorted(evals, key=lambda x: x[1])[0]
        print(f"p{n} evaluation:", excerpt[:750])
