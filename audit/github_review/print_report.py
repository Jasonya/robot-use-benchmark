"""Print our authored atlas from the local website, with traceable input hashes."""
import hashlib
import html
import json
import os
import re
import subprocess
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin

ROOT = Path(__file__).resolve().parents[2]
BASE = os.environ.get(
    "ROBOT_TEST_URL", "http://127.0.0.1:8808/robot-use-benchmark/"
).rstrip("/")
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PUBLIC_BASE = json.loads((ROOT / "site.config.json").read_text())["siteUrl"].rstrip("/")
EXPECTED = {f"P{i:03}" for i in range(1, 251)}
INPUTS = [
    "content/github_review/compiled_reviews.json",
    "content/github_review/validation.json",
    "benchmark/collection/REPO_TO_STANDARD.md",
    "scripts/github-review.mjs",
    "scripts/build.mjs",
    "site.config.json",
    "static/assets/github-review.css",
    "static/assets/site.css",
    "static/assets/survey-union.css",
    "static/assets/counting.css",
    "static/assets/coverage.css",
    "static/assets/site.js",
    "docs/downloads/github-review/atlas-summary.json",
]


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    validation = json.loads((ROOT / INPUTS[1]).read_text())
    assert validation["status"] == "passed"
    assert validation["statistics"]["validated_review_records"] == 250
    assert validation["statistics"]["pending_review_records"] == 0
    inputs = {name: sha(ROOT / name) for name in INPUTS}
    assets = []
    preview = ROOT / ".preview"
    preview.mkdir(exist_ok=True)
    for locale in ["zh-hant", "zh-hans"]:
        html_path = ROOT / f"docs/{locale}/github-report.html"
        text = html_path.read_text()
        assert text.count('class="github-report-entry"') == 250
        for section in ["report-whole", "report-distribution", "report-plan",
                        "report-standard", "report-papers"]:
            assert f'id="{section}"' in text
        # Keep in-document destinations local; other relative anchors must work
        # after somebody downloads this PDF away from our preview server.
        def public_anchor(match):
            href = html.unescape(match[2])
            if href.startswith("#"):
                return match[0]
            href = urljoin(f"{PUBLIC_BASE}/{locale}/github-report.html", href)
            return match[1] + html.escape(href, quote=True) + match[3]
        printable = re.sub(r'(<a\b[^>]*\bhref=")([^"]*)(")', public_anchor, text)
        print_route = ROOT / f"docs/{locale}/.atlas-print-{os.getpid()}.html"
        print_route.write_text(printable)
        (preview / f"atlas-{locale}-print.html").write_text(printable)
        target = ROOT / f"static/downloads/github-review/robot-use-source-atlas-{locale}.pdf"
        target.parent.mkdir(parents=True, exist_ok=True)
        temporary = preview / f"atlas-{locale}-{os.getpid()}.pdf"
        command = [
            CHROME, "--headless=new", "--disable-gpu",
            "--disable-background-networking", "--disable-component-update",
            "--no-first-run", "--no-default-browser-check",
            f"--user-data-dir={preview}/print-atlas-{locale}-{os.getpid()}",
            "--no-pdf-header-footer", f"--print-to-pdf={temporary}",
            f"{BASE}/{locale}/{print_route.name}",
        ]
        print(json.dumps({"locale": locale, "stage": "printing"}), flush=True)
        with (preview / f"print-atlas-{locale}.log").open("w") as log:
            process = subprocess.Popen(
                command, stdout=log, stderr=log, start_new_session=True
            )
            try:
                deadline = time.monotonic() + 120
                while time.monotonic() < deadline:
                    if temporary.exists() and temporary.stat().st_size > 100000:
                        with temporary.open("rb") as stream:
                            stream.seek(-30, 2)
                            if b"%%EOF" in stream.read():
                                break
                    if process.poll() is not None:
                        raise RuntimeError(f"Chrome exited before printing {locale}")
                    time.sleep(0.25)
                else:
                    raise RuntimeError(f"PDF print timed out: {locale}")
            finally:
                if process.poll() is None:
                    process.terminate()
                    try:
                        process.wait(timeout=3)
                    except subprocess.TimeoutExpired:
                        process.kill()
                        process.wait(timeout=3)
                print_route.unlink(missing_ok=True)
        temporary.replace(target)
        extracted = preview / f"atlas-{locale}.txt"
        subprocess.run(["pdftotext", "-layout", str(target), str(extracted)],
                       check=True, capture_output=True)
        content = extracted.read_text()
        assert b"127.0.0.1" not in target.read_bytes(), "Local preview URL in PDF."
        urls = subprocess.run(["pdfinfo", "-url", str(target)], check=True,
                              capture_output=True, text=True).stdout
        (preview / f"atlas-{locale}-urls.txt").write_text(urls)
        assert not re.search(r"127\.0\.0\.1|localhost|\.atlas-print-", urls), "Temporary URL in PDF annotations."
        assert EXPECTED <= set(re.findall(r"\bP\d{3}\b", content))
        for phrase in (["共同結構", "原文數量", "CALVIN", "OpenEQA"] if locale == "zh-hant"
                       else ["共同结构", "原文数量", "CALVIN", "OpenEQA"]):
            assert phrase in content, f"Missing report content: {phrase}"
        assert "跳至主要內容" not in content and "跳至主要内容" not in content
        info = subprocess.run(["pdfinfo", str(target)], check=True,
                              capture_output=True, text=True).stdout
        pages = int(re.search(r"Pages:\s+(\d+)", info)[1])
        assert pages >= 250, "Expected complete per-paper sections, not only the index."
        record = {
            "locale": locale, "file": target.name, "pages": pages,
            "bytes": target.stat().st_size, "sha256": sha(target),
            "source_html_sha256": sha(html_path),
            "printed_html_sha256": hashlib.sha256(printable.encode()).hexdigest(),
            "public_link_base": PUBLIC_BASE,
            "public_url_annotations_checked": True,
            "all_250_paper_ids_present": True,
            "html_paper_sections": 250,
            "overview_structure_examples_present": True,
        }
        assets.append(record)
        print(json.dumps(record), flush=True)
    # Reading or printing must not alter source inputs.
    assert inputs == {name: sha(ROOT / name) for name in INPUTS}
    report = {
        "version": "github-source-atlas-1.0",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "scope": "Authored source audit, scope counts, distribution, standardization and all250 per-paper records; not copies of upstream papers.",
        "input_files_sha256": inputs,
        "assets": assets,
    }
    (ROOT / "content/github_review/report_assets.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    )


if __name__ == "__main__":
    main()
