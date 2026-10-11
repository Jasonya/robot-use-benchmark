from concurrent.futures import ThreadPoolExecutor
import json
import re
from urllib.parse import urlparse
from network import CACHE
from fetch_projects import fetch_project, relevant


def main():
    papers = json.loads((CACHE / "project_candidates.json").read_text())
    jobs = {}
    for row in papers:
        pid = row["paper_id"]
        discovered = json.loads((CACHE / f"{pid}-discovery.json").read_text())
        urls = {link["url"] for link in discovered["candidates"]
                if link["page"] <= 3 and not link["repo"] and relevant(link["url"])}
        urls.update("https://" + url[7:] for url in row["early_project_links"] if url.startswith("http://") and relevant(url))
        if not row["early_repos"]:
            for project in row["projects"]:
                for link in project.get("other_links", []):
                    if re.search(r"code|github|documentation|download|benchmark|dataset", link["label"], re.I):
                        if "orcid" not in link["url"]:
                            urls.add(link["url"])
        urls = {url for url in urls if relevant(url)}
        # Avoid following dozens of unrelated projects from an author homepage.
        urls = sorted(urls, key=lambda url: (not bool(re.search(r"docs|download|benchmark", url, re.I)), len(url)))[:12]
        for url in urls:
            jobs.setdefault(url, []).append(pid)
    direct = {
        "P001": ["https://web.eecs.umich.edu/~fouhey/2017/VLOG/"],
        "P006": ["https://serre-lab.clps.brown.edu/resource/breakfast-actions-dataset/"],
        "P007": ["https://prior.allenai.org/projects/charades"],
        "P008": ["https://cbs.ic.gatech.edu/fpv/"],
        "P009": ["https://epic-kitchens.github.io/2018"],
        "P010": ["https://epic-kitchens.github.io/2020"],
        "P014": ["https://docs.ego-exo4d-data.org/"],
        "P195": ["https://jrome5.github.io/Learning-to-unfold-cloth.github.io/"],
    }
    for pid, urls in direct.items():
        for url in urls:
            jobs.setdefault(url, []).append(pid)
    result = []
    with ThreadPoolExecutor(max_workers=2) as pool:
        for record in pool.map(fetch_project, jobs):
            record["paper_ids"] = sorted(set(jobs[record["paper_link_url"]]))
            result.append(record)
    (CACHE / "enriched_projects.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    for record in result:
        if record["repository_links"]:
            print(json.dumps({"paper_ids": record["paper_ids"], "url": record["paper_link_url"],
                              "repos": list(dict.fromkeys(r["repo"] for r in record["repository_links"]))[:16]}, ensure_ascii=False))
    print(json.dumps({"extra_pages": len(result), "successful": sum(r["receipt"]["status"] == 200 for r in result)}))


if __name__ == "__main__":
    main()
