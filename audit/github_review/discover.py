"""Extract repository/project candidates from the already pinned paper PDFs.

Candidates are not official-repository decisions and do not imply code review.
"""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import hashlib
import json
import re
import subprocess
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]
CACHE = ROOT / "audit/.cache/github_review"
OUT = ROOT / "content/github_review"
PDFS = ROOT / "audit/.cache/fulltext_review"


def read(path):
    return json.loads(path.read_text())


def repo_name(url):
    match = re.match(r"https?://(?:www\.)?github\.com/([^/\s]+)/([^/#?\s]+)", url, re.I)
    if not match:
        return None
    owner, name = match.groups()
    if owner.lower() in {"orgs", "users", "search", "topics", "settings", "features", "collections"}:
        return None
    return f"{owner}/{name.removesuffix('.git').rstrip('.,;:')}"


def extract(paper):
    pid = paper["id"]
    pdf = PDFS / pid / "paper.pdf"
    result = subprocess.run(["pdfinfo", "-url", str(pdf)], capture_output=True, text=True, check=True)
    links = []
    for line in result.stdout.splitlines():
        match = re.match(r"\s*(\d+)\s+\S+\s+(\S+)", line)
        if not match:
            continue
        page, url = int(match[1]), match[2]
        if not url.startswith(("http://", "https://")):
            continue
        links.append({"url": url, "page": page, "basis": "pinned_pdf_hyperlink",
                      "repo": repo_name(url)})
    pages = read(PDFS / pid / "pages.json")
    contexts = []
    for page in pages:
        text = page["text"]
        lines = text.splitlines()
        for i, line in enumerate(lines):
            if re.search(r"(github|code.{0,45}(availab|releas)|(?:project|dataset).{0,20}(page|website)|(?:availab|releas).{0,45}code)", line, re.I):
                context = "\n".join(lines[max(0, i - 2):i + 4]).strip()
                if context:
                    contexts.append({"page": page["page"], "text": context[:1300]})
        for match in re.finditer(r"https?://[^\s<>\]\)]+", text):
            url = match.group().rstrip(".,;")
            if not any(l["url"] == url and l["page"] == page["page"] for l in links):
                links.append({"url": url, "page": page["page"], "basis": "pdf_extracted_text",
                              "repo": repo_name(url)})
    first_pages = [p for p in pages if p["page"] <= 2]
    return {
        "paper_id": pid, "name": paper["short_name"], "title": paper["title"],
        "paper_url": paper["source_url"], "year": paper["year"],
        "pdf_sha256": hashlib.sha256(pdf.read_bytes()).hexdigest(),
        "candidates": links, "code_contexts": contexts,
        "opening_text": "\n".join(p["text"] for p in first_pages),
        "decision_status": "candidate_extraction_only",
    }


def main():
    CACHE.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    papers = read(ROOT / "content/literature_snapshot.json") + read(ROOT / "content/literature_refresh/literature_additions.json")
    reviewed = {row["paper_id"] for f in (ROOT / "content/fulltext_review").glob("batch*.json") for row in read(f)}
    with ThreadPoolExecutor(max_workers=12) as pool:
        rows = list(pool.map(extract, papers))
    existing = {}
    for filename in ["content/scale_first/source_catalogue.json", "content/survey_union/source_summaries.json"]:
        for source in read(ROOT / filename):
            repos = source.get("repositories", [source.get("repo")])
            for pid in source.get("paper_ids", []):
                for repo in repos:
                    if repo:
                        existing.setdefault(pid, []).append({
                            "repo": repo, "basis": "previous_pinned_inventory",
                            "record_file": filename,
                            "commit": source.get("ref") or next(iter(source.get("commits", [])), None),
                        })
    for row in rows:
        row["scope"] = "benchmark_or_data_source" if row["paper_id"] in reviewed else "related_reference"
        row["previous_repositories"] = existing.get(row["paper_id"], [])
        (CACHE / f"{row['paper_id']}-discovery.json").write_text(json.dumps(row, ensure_ascii=False, indent=2) + "\n")
    public = [{k: v for k, v in r.items() if k not in {"opening_text", "code_contexts"}} for r in rows]
    (OUT / "discovery.json").write_text(json.dumps(public, ensure_ascii=False, indent=2) + "\n")
    overview = []
    for row in rows:
        direct = list(dict.fromkeys(l["repo"] for l in row["candidates"] if l["repo"] and l["page"] <= 3))
        projects = list(dict.fromkeys(l["url"] for l in row["candidates"]
                                    if l["page"] <= 2 and not l["repo"]
                                    and urlparse(l["url"]).hostname not in {"arxiv.org", "doi.org", "openaccess.thecvf.com", "creativecommons.org"}))
        prior = list(dict.fromkeys(r["repo"] for r in row["previous_repositories"]))
        overview.append({"paper_id": row["paper_id"], "name": row["name"], "scope": row["scope"],
                         "early_repos": direct, "early_project_links": projects,
                         "previous_repos": prior, "all_repo_candidates": list(dict.fromkeys(l["repo"] for l in row["candidates"] if l["repo"]))})
    (CACHE / "candidate_overview.json").write_text(json.dumps(overview, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"papers": len(rows), "benchmark_sources": len(reviewed),
                     "papers_with_early_repo": sum(bool(r["early_repos"]) for r in overview),
                     "papers_with_project_link": sum(bool(r["early_project_links"]) for r in overview),
                     "status": "discovery_only_not_reviewed"}, indent=2))


if __name__ == "__main__":
    main()
