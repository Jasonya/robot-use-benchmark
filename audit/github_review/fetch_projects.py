from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from pathlib import Path
import hashlib
import json
import re
from urllib.parse import urljoin, urlparse

from discover import repo_name
from network import CACHE, ROOT, fetch

EXCLUDED = {"www.google.com", "google.com", "www.youtube.com", "youtube.com", "orcid.org",
            "www.researchgate.net", "twitter.com", "x.com", "ieeexplore.ieee.org",
            "www.wikihow.com", "pypi.org", "hub.docker.com", "github.com",
            "www.modelscope.cn", "huggingface.co", "eval.ai", "competitions.codalab.org"}


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.current = None
        self.text = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "a" and attrs.get("href"):
            self.current = {"href": attrs["href"], "label": ""}

    def handle_data(self, value):
        value = value.strip()
        if value:
            self.text.append(value)
            if self.current:
                self.current["label"] += " " + value

    def handle_endtag(self, tag):
        if tag == "a" and self.current:
            self.links.append(self.current)
            self.current = None


def relevant(url):
    parsed = urlparse(url)
    host = (parsed.hostname or "").lower()
    return parsed.scheme in {"http", "https"} and "." in host and host not in EXCLUDED and not re.search(r"\.(pdf|mp4|png|jpg|zip|tar|gz)$", parsed.path, re.I)


def fetch_project(url):
    receipt, body = fetch(url, limit=3 * 1024 * 1024)
    if receipt.get("status") != 200 and url.startswith("http://"):
        receipt2, body2 = fetch("https://" + url[len("http://"):], limit=3 * 1024 * 1024)
        if receipt2.get("status") == 200:
            receipt, body = receipt2, body2
    row = {"paper_link_url": url, "receipt": receipt, "repository_links": [], "other_links": []}
    if body and "pdf" not in receipt.get("content_type", "").lower():
        parser = Links()
        text = body.decode("utf-8", errors="replace")
        parser.feed(text)
        resolved = receipt.get("resolved_url", url)
        links = parser.links
        for raw in re.findall(r"https?://github\.com/[^\"<>\s\\]+", text):
            if not any(l["href"] == raw for l in links):
                links.append({"href": raw.rstrip(".,);"), "label": "URL in page source"})
        for link in links:
            target = urljoin(resolved, link["href"])
            repo = repo_name(target)
            if repo:
                item = {"url": target, "repo": repo, "label": link["label"].strip()}
                if item not in row["repository_links"]:
                    row["repository_links"].append(item)
            elif relevant(target):
                row["other_links"].append({"url": target, "label": link["label"].strip()})
        text_path = CACHE / "projects" / (hashlib.sha256(url.encode()).hexdigest() + ".txt")
        text_path.parent.mkdir(parents=True, exist_ok=True)
        text_path.write_text("\n".join(parser.text))
        row["text_cache"] = text_path.relative_to(ROOT).as_posix()
    return row


def main():
    papers = json.loads((CACHE / "candidate_overview.json").read_text())
    jobs = sorted({url for paper in papers for url in paper["early_project_links"] if relevant(url)})
    with ThreadPoolExecutor(max_workers=2) as pool:
        projects = list(pool.map(fetch_project, jobs))
    by_url = {p["paper_link_url"]: p for p in projects}
    rows = []
    for paper in papers:
        projects = [by_url[url] for url in paper["early_project_links"] if url in by_url]
        rows.append({**paper, "projects": projects})
    (CACHE / "project_candidates.json").write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"pages_checked": len(jobs), "successful_pages": sum(r["receipt"]["status"] == 200 for r in by_url.values()),
                     "papers_with_project_repo_links": sum(any(p["repository_links"] for p in r["projects"]) for r in rows),
                     "status": "candidate_collection_only"}, indent=2))


if __name__ == "__main__":
    main()
