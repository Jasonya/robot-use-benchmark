"""Acquire primary full texts for a paper-by-paper benchmark review.

Acquisition is not a reading or validation claim. Files stay in audit/.cache.
"""
from __future__ import annotations
import concurrent.futures
import argparse
import hashlib
import html
import json
import re
import subprocess
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin

ROOT = Path(__file__).resolve().parents[2]
CACHE = ROOT / "audit/.cache/fulltext_review"
OUT = ROOT / "content/fulltext_review"
USER_AGENT = "Robot-use-benchmark-literature-review/0.10"


def fetch(url):
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=35) as response:
        payload = response.read(110 * 1024 * 1024)
        return payload, response.url, response.headers.get("content-type", "")


def candidate_pdf_urls(row):
    url = row["source_url"]
    arxiv = re.search(r"arxiv\.org/(?:abs|html|pdf)/(\d{4}\.\d{4,5}(?:v\d+)?)", url)
    if arxiv:
        return [f"https://arxiv.org/pdf/{arxiv.group(1)}"]
    if "openaccess.thecvf.com/" in url:
        return [url.replace("/html/", "/papers/").replace("_paper.html", "_paper.pdf")]
    if re.search(r"\.pdf(?:[?#]|$)", url, re.I):
        return [url]
    body, _, _ = fetch(url)
    landing = body.decode("utf-8", "replace")
    links = re.findall(r'<a\b[^>]*href=["\']([^"\']+)["\']', landing, re.I)
    candidates = [urljoin(url, html.unescape(x)) for x in links if ".pdf" in x.lower()]
    for link in links:
        match = re.search(r"arxiv\.org/abs/(\d{4}\.\d{4,5}(?:v\d+)?)", link)
        if match:
            candidates.append(f"https://arxiv.org/pdf/{match.group(1)}")
    return list(dict.fromkeys(candidates))


def acquire(row):
    pid = row["paper_id"]
    folder = CACHE / pid
    folder.mkdir(parents=True, exist_ok=True)
    receipt_path = folder / "receipt.json"
    if receipt_path.exists():
        old = json.loads(receipt_path.read_text())
        if old.get("acquisition_status") == "pdf_text_extracted":
            return old
    failures = []
    try:
        urls = candidate_pdf_urls(row)
    except Exception as error:
        urls = []
        failures.append({"url": row["source_url"], "error": str(error)})
    for url in urls[:3]:
        try:
            body, resolved, content_type = fetch(url)
            if not body.startswith(b"%PDF-"):
                raise ValueError(f"Not a PDF ({content_type})")
            pdf = folder / "paper.pdf"
            pdf.write_bytes(body)
            subprocess.run(["/opt/homebrew/bin/pdftotext", "-layout", str(pdf),
                            str(folder / "paper.txt")], check=True,
                           capture_output=True, timeout=50)
            text = (folder / "paper.txt").read_text(errors="replace")
            pages = text.split("\f")
            if pages and not pages[-1].strip():
                pages.pop()
            if len(text.strip()) < 1200:
                raise ValueError("Insufficient extracted text; visual/source follow-up needed")
            (folder / "pages.json").write_text(json.dumps(
                [{"page": i + 1, "text": value} for i, value in enumerate(pages)],
                ensure_ascii=False))
            metadata = subprocess.run(["/opt/homebrew/bin/pdfinfo", str(pdf)],
                                      capture_output=True, text=True, timeout=15)
            receipt = {
                "paper_id": pid, "name": row["name"], "expected_title": row["title"],
                "source_url": row["source_url"], "pdf_url": resolved,
                "retrieved_at": datetime.now(timezone.utc).isoformat(),
                "pdf_sha256": hashlib.sha256(body).hexdigest(),
                "text_sha256": hashlib.sha256(text.encode()).hexdigest(),
                "pdf_bytes": len(body), "pages": len(pages), "text_characters": len(text),
                "pdf_metadata": metadata.stdout[:1800],
                "first_page_preview": pages[0][:1700],
                "acquisition_status": "pdf_text_extracted",
                "reading_status": "not_reviewed_in_this_pass",
                "note": "Downloading/extracting is not paper review; reading evidence must be authored separately."
            }
            receipt_path.write_text(json.dumps(receipt, ensure_ascii=False, indent=2))
            return receipt
        except Exception as error:
            failures.append({"url": url, "error": str(error)})
        time.sleep(0.4)
    receipt = {
        "paper_id": pid, "name": row["name"], "expected_title": row["title"],
        "source_url": row["source_url"],
        "acquisition_status": "primary_fulltext_followup_required",
        "reading_status": "not_reviewed_in_this_pass", "failures": failures
    }
    receipt_path.write_text(json.dumps(receipt, ensure_ascii=False, indent=2))
    return receipt


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--all", action="store_true", help="Acquire the full bibliography for inclusion screening.")
    args = parser.parse_args()
    CACHE.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    registry = json.loads((ROOT / "content/survey_union/survey_registry.json").read_text())
    included = registry if args.all else [r for r in registry if r["benchmark_source_registered"]]
    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        jobs = {pool.submit(acquire, row): row for row in included}
        for future in concurrent.futures.as_completed(jobs):
            result = future.result()
            results.append(result)
            print(json.dumps({k: result.get(k) for k in [
                "paper_id", "name", "acquisition_status", "pages", "text_characters"]},
                ensure_ascii=False), flush=True)
    results.sort(key=lambda r: r["paper_id"])
    for receipt in results:
        if receipt.get("acquisition_status") != "pdf_text_extracted":
            continue
        arxiv = re.search(r"arxiv\.org/(?:abs|pdf)/(\d{4}\.\d{4,5})", receipt["source_url"])
        if arxiv:
            text = (CACHE / receipt["paper_id"] / "paper.txt").read_text()[:15000]
            revision = re.search(re.escape(arxiv[1]) + r"v\d+", text)
            receipt["reviewed_version"] = revision[0] if revision else None
            receipt["reviewed_pdf_url"] = f"https://arxiv.org/pdf/{revision[0]}" if revision else receipt["pdf_url"]
        else:
            receipt["reviewed_pdf_url"] = receipt["pdf_url"]
    # No copied paper text in the public receipt.
    public = [{k: v for k, v in r.items() if k not in ["first_page_preview", "pdf_metadata"]}
              for r in results]
    (OUT / "acquisition_receipts.json").write_text(json.dumps(public, ensure_ascii=False, indent=2) + "\n")
    summary = {
        "date": datetime.now(timezone.utc).isoformat(),
        "registered_sources": sum(r["benchmark_source_registered"] for r in registry),
        "acquisition_scope": "full_bibliography" if args.all else "registered_sources",
        "papers_in_acquisition_scope": len(included),
        "fulltext_extracted": sum(r["acquisition_status"] == "pdf_text_extracted" for r in results),
        "followup_required": sum(r["acquisition_status"] != "pdf_text_extracted" for r in results),
        "read_count_not_inferred_from_downloads": True
    }
    (OUT / "acquisition_summary.json").write_text(json.dumps(summary, indent=2) + "\n")
    print(json.dumps(summary), flush=True)


if __name__ == "__main__":
    main()
