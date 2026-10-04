"""Print the authored report from a local preview; never redistribute source PDFs."""
import hashlib
import json
import os
import re
import subprocess
import time
from datetime import datetime, timezone
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
base=os.environ.get("ROBOT_TEST_URL","http://127.0.0.1:8798/robot-use-benchmark/").rstrip("/")
chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
records=[]
expected={f"P{i:03d}" for i in range(1,251)}
md=(ROOT/"docs/downloads/source-review/SOURCE_REVIEW.md").read_bytes()
for locale in ["zh-hant","zh-hans"]:
    target=ROOT/f"static/downloads/source-review/source-review-{locale}.pdf"
    temporary=ROOT/f".preview/printing-{locale}-{os.getpid()}.pdf"
    target.parent.mkdir(parents=True,exist_ok=True)
    args=[chrome,"--headless=new","--disable-gpu","--disable-background-networking",
          "--no-first-run","--no-default-browser-check",
          f"--user-data-dir={ROOT}/.preview/print-review-final-{locale}-{os.getpid()}",
          "--no-pdf-header-footer",f"--print-to-pdf={temporary}",
          f"{base}/{locale}/source-report.html"]
    with (ROOT/f".preview/print-review-final-{locale}.log").open("w") as log:
        process=subprocess.Popen(args,stdout=log,stderr=log,start_new_session=True)
        try:
            deadline=time.monotonic()+55
            while time.monotonic()<deadline:
                if temporary.exists() and temporary.stat().st_size>100000:
                    with temporary.open("rb") as pdf:
                        pdf.seek(-30,2)
                        if b"%%EOF" in pdf.read():
                            break
                if process.poll() is not None:
                    raise RuntimeError(f"Chrome exited before printing {locale}")
                time.sleep(.25)
            else:
                raise RuntimeError(f"PDF print timed out: {locale}")
        finally:
            if process.poll() is None:
                process.terminate()
                try: process.wait(timeout=3)
                except subprocess.TimeoutExpired: process.kill(); process.wait(timeout=3)
    temporary.replace(target)
    text=ROOT/f".preview/report-final-{locale}.txt"
    subprocess.run(["pdftotext",str(target),str(text)],check=True,capture_output=True)
    content=text.read_text()
    present=set(re.findall(r"\bP\d{3}\b",content))
    assert expected<=present, f"Missing paper IDs in {locale}: {sorted(expected-present)}"
    assert "跳至主要內容" not in content and "跳至主要内容" not in content
    info=subprocess.run(["pdfinfo",str(target)],check=True,capture_output=True,text=True).stdout
    pages=int(re.search(r"Pages:\s+(\d+)",info)[1])
    record={"locale":locale,"file":target.name,"pages":pages,"bytes":target.stat().st_size,
            "sha256":hashlib.sha256(target.read_bytes()).hexdigest(),
            "source_markdown_sha256":hashlib.sha256(md).hexdigest(),
            "all_250_paper_ids_present":True}
    records.append(record)
    print(json.dumps(record),flush=True)
(ROOT/"content/fulltext_review/report_assets.json").write_text(json.dumps({
    "version":json.loads((ROOT/"content/fulltext_review/codebook.json").read_text())["version"],
    "generated_at":datetime.now(timezone.utc).isoformat(),
    "scope":"Authored primary-section notes, screening, distribution and integration plan; not copies of original papers.",
    "assets":records},ensure_ascii=False,indent=2)+"\n")
