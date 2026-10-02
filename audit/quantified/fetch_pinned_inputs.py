"""Recover the exact public source inputs recorded for the numeric inventory."""
import concurrent.futures
import hashlib
import json
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CACHE = ROOT / "audit/.cache/quantified-v0_9"
RECEIPTS = ROOT / "content/quantified/source_receipts.json"


def fetch(row):
    name = row["id"]
    if not re.fullmatch(r"[A-Za-z0-9_.-]+", name):
        raise ValueError(f"Unsafe receipt ID: {name}")
    target = CACHE / name
    if name in {"partnr-hf", "hssd-hf", "rcasa-tree", "calvin-tree",
                "calvin-env-tree", "behavior-scenes"}:
        return name, "frozen_discovery_fields_or_not_required_for_rebuild"
    if target.exists() and hashlib.sha256(target.read_bytes()).hexdigest() == row["sha256"]:
        return name, "cached"
    request = urllib.request.Request(row["url"], headers={"User-Agent": "robot-use-numeric-inventory"})
    with urllib.request.urlopen(request, timeout=45) as response:
        data = response.read()
    actual = hashlib.sha256(data).hexdigest()
    if actual != row["sha256"]:
        raise ValueError(f"{name}: source changed; expected {row['sha256']}, received {actual}. Review its version before updating counts.")
    temporary = target.with_suffix(target.suffix + ".tmp")
    temporary.write_bytes(data)
    temporary.replace(target)
    return name, "fetched"


def main():
    CACHE.mkdir(parents=True, exist_ok=True)
    rows = json.loads(RECEIPTS.read_text())
    # Identical receipt IDs are retained once; the latest recorded receipt wins.
    rows = list({r["id"]: r for r in rows}.values())
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        for name, status in pool.map(fetch, rows):
            print(status, name, flush=True)
    (CACHE / "fetch_receipts.json").write_text(json.dumps(rows, indent=2))
    pins = json.loads((ROOT / "content/quantified/source_pins.json").read_text())
    (CACHE / "source_pins.json").write_text(json.dumps({k: pins[k] for k in [
        "robocasa", "partnr", "alfred", "openeqa", "calvin"]}, indent=2))


if __name__ == "__main__":
    main()
