"""Find passages to read in primary PDF texts; does NOT mark a paper reviewed."""
from __future__ import annotations
import argparse
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CACHE = ROOT / "audit/.cache/fulltext_review"

PATTERNS = {
    "definition": re.compile(r"\b(?:our benchmark|our dataset|we (?:introduce|propose|present|collect)|benchmark (?:contains|consists|comprises)|dataset (?:contains|consists|comprises))\b", re.I),
    "scale": re.compile(r"\b\d[\d,.\s]*\s*(?:[KM]\b|thousand|million|tasks?\b|scenes?\b|environments?\b|houses?\b|rooms?\b|episodes?\b|questions?\b|videos?\b|trajectories\b|activities\b|categories\b|sequences\b)", re.I),
    "evaluation": re.compile(r"\b(?:success (?:rate|criteria|condition)|evaluation (?:metric|protocol)|metrics? (?:include|are|we)|accuracy|mean average precision|mAP\b|F1\b|ADE\b|FDE\b|SPL\b|IoU\b|human evaluation|LLM.judge)\b", re.I),
    "split": re.compile(r"\b(?:train(?:ing)? (?:and|/)|train.{0,12}val|test set|test split|evaluation set|unseen (?:tasks|scenes|objects)|held.out)\b", re.I),
    "lineage": re.compile(r"\b(?:based on|built on|derived from|subset of|reuse|re-use|adapted from|extend)\b.{0,120}\b(?:dataset|benchmark|Ego4D|EPIC|LIBERO|Meta.World|RoboCasa|RLBench|Habitat|BEHAVIOR|VirtualHome|ManiSkill)", re.I),
}


def normalize(s):
    return re.sub(r"\s+", " ", s).strip()


def blocks(pid):
    folder = CACHE / pid
    readable = folder / "readable.txt"
    if not readable.exists():
        subprocess.run(["/opt/homebrew/bin/pdftotext", str(folder / "paper.pdf"),
                        str(readable)], check=True, capture_output=True)
    pages = readable.read_text(errors="replace").split("\f")
    results = []
    for page, text in enumerate(pages, 1):
        for block in re.split(r"\n\s*\n", text):
            block = normalize(block)
            if len(block) < 100 or len(block) > 18000:
                continue
            # Bibliographic blocks are navigation material, not evidence.
            if len(re.findall(r"\[\d+\]", block)) > 7 and len(re.findall(r"\d{4}", block)) > 7:
                continue
            results.append({"page": page, "text": block})
    return pages, results


def packet(pid, limit=5200):
    receipt = json.loads((CACHE / pid / "receipt.json").read_text())
    pages, candidates = blocks(pid)
    chosen = []
    seen = set()
    for category, pattern in PATTERNS.items():
        ranked = []
        for item in candidates:
            text = item["text"]
            matches = list(pattern.finditer(text))
            if not matches:
                continue
            score = len(matches) + (2 if re.search(r"\bour\b|\bwe\b", text, re.I) else 0)
            score -= 5 if re.search(r"related work|previous works?|prior works?", text[:100], re.I) else 0
            ranked.append((score, item, matches[0].start()))
        for _, item, position in sorted(ranked, key=lambda r: r[0], reverse=True)[:6]:
            key = (item["page"], item["text"][:130])
            if key in seen:
                continue
            seen.add(key)
            text = item["text"]
            if len(text) > 1100:
                begin = max(0, position - 300)
                text = text[begin:begin + 1100]
            chosen.append({"category": category, "page": item["page"], "text": text})
            break
    header = normalize(pages[0])[:650]
    return {"paper_id": pid, "name": receipt["name"], "expected_title": receipt["expected_title"],
            "pdf_url": receipt["pdf_url"], "pages": receipt["pages"],
            "first_page": header, "passages_to_review": chosen,
            "note": "Automatically located passages; interpretation and reading status require explicit authored review."}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("ids", nargs="+")
    args = parser.parse_args()
    for pid in args.ids:
        print(json.dumps(packet(pid), ensure_ascii=False))
