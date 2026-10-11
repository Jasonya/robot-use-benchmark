"""Small bounded HTTP reader. Credentials are restricted to GitHub's API."""
from pathlib import Path
import datetime
import email.utils
import fcntl
import hashlib
import json
import os
import subprocess
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[2]
CACHE = ROOT / "audit/.cache/github_review"
_token = None
INTERVALS = {"github_search": 6.5, "github_api": 0.85, "github_raw": 1.0, "website": 1.0}


def bucket(url):
    parsed = urllib.parse.urlparse(url)
    if parsed.hostname == "api.github.com":
        return "github_search" if parsed.path.startswith("/search/") else "github_api"
    if parsed.hostname == "raw.githubusercontent.com":
        return "github_raw"
    return "website:" + (parsed.hostname or "unknown")


def edit_rate_state(callback):
    CACHE.mkdir(parents=True, exist_ok=True)
    state_path = CACHE / "rate_state.json"
    with (CACHE / "rate_state.lock").open("a+") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        state = json.loads(state_path.read_text()) if state_path.exists() else {}
        result = callback(state)
        state_path.write_text(json.dumps(state, indent=2) + "\n")
        return result


def reserve_request(url):
    """Pace across processes. Long server cooldowns return without sleeping."""
    key = bucket(url)
    now = time.time()
    interval = INTERVALS.get(key, INTERVALS["website"])
    def reserve(state):
        slot = state.setdefault(key, {})
        until = slot.get("cooldown_until", 0)
        if until > now:
            return {"deferred": True, "retry_at": until}
        scheduled = max(now, slot.get("last_reserved", 0) + interval)
        if scheduled - now > 50:
            return {"deferred": True, "retry_at": scheduled}
        slot["last_reserved"] = scheduled
        return {"deferred": False, "delay": scheduled - now}
    result = edit_rate_state(reserve)
    if not result["deferred"] and result["delay"] > 0:
        time.sleep(result["delay"])
        # Another worker may have received a limit while this slot was waiting.
        until = edit_rate_state(lambda state: state.get(key, {}).get("cooldown_until", 0))
        if until > time.time():
            return {"deferred": True, "retry_at": until}
    return result


def record_rate_limit(url, headers):
    key = bucket(url)
    now = time.time()
    def update(state):
        slot = state.setdefault(key, {})
        failures = slot.get("rate_limit_events", 0) + 1
        delay = min(900, 60 * (2 ** min(failures - 1, 4)))
        retry_after = headers.get("Retry-After")
        if retry_after:
            try:
                delay = max(delay, float(retry_after))
            except ValueError:
                try:
                    delay = max(delay, email.utils.parsedate_to_datetime(retry_after).timestamp() - now)
                except (TypeError, ValueError):
                    pass
        reset = headers.get("X-RateLimit-Reset")
        if reset and headers.get("X-RateLimit-Remaining") == "0":
            try:
                delay = max(delay, float(reset) - now)
            except ValueError:
                pass
        until = now + max(1, delay) + 2
        slot.update(cooldown_until=max(until, slot.get("cooldown_until", 0)),
                    rate_limit_events=failures)
        return slot["cooldown_until"]
    return edit_rate_state(update)


def get_token():
    global _token
    if _token is None:
        process = subprocess.run(
            ["git", "credential", "fill"],
            input="protocol=https\nhost=github.com\npath=Jasonya/robot-use-benchmark.git\n\n",
            capture_output=True, text=True, timeout=20,
            env={**os.environ, "GIT_TERMINAL_PROMPT": "0"},
        )
        values = dict(line.split("=", 1) for line in process.stdout.splitlines() if "=" in line)
        _token = values.get("password", "")
    return _token


class RestrictedRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        redirected = super().redirect_request(req, fp, code, msg, headers, newurl)
        if redirected and urllib.parse.urlparse(newurl).hostname != "api.github.com":
            redirected.remove_header("Authorization")
        return redirected


def fetch(url, limit=4 * 1024 * 1024, timeout=25, refresh=False):
    key = hashlib.sha256(url.encode()).hexdigest()
    store = CACHE / "http"
    store.mkdir(parents=True, exist_ok=True)
    receipt_path, body_path = store / f"{key}.json", store / f"{key}.body"
    if not refresh and receipt_path.exists():
        receipt = json.loads(receipt_path.read_text())
        retry_at = receipt.get("retry_at")
        if not retry_at or retry_at > time.time():
            return receipt, body_path.read_bytes() if body_path.exists() else b""
    reservation = reserve_request(url)
    if reservation["deferred"]:
        return {"requested_url": url, "status": "deferred_rate_limit",
                "retry_at": reservation["retry_at"], "request_sent": False}, b""
    headers = {"User-Agent": "Robot-use-benchmark-research-audit/0.1"}
    if urllib.parse.urlparse(url).hostname == "api.github.com":
        headers["Accept"] = "application/vnd.github+json"
        token = get_token()
        if token:
            headers["Authorization"] = "Bearer " + token
    receipt = {"requested_url": url, "retrieved_at": datetime.datetime.now(datetime.timezone.utc).isoformat()}
    body = b""
    try:
        request = urllib.request.Request(url, headers=headers)
        with urllib.request.build_opener(RestrictedRedirect()).open(request, timeout=timeout) as response:
            body = response.read(limit + 1)
            receipt.update(status=response.status, resolved_url=response.url,
                           content_type=response.headers.get("Content-Type", ""))
            if response.headers.get("X-RateLimit-Remaining") == "0":
                record_rate_limit(url, response.headers)
        if len(body) > limit:
            receipt["status"] = "over_size_limit"
            body = b""
    except urllib.error.HTTPError as error:
        receipt.update(status=error.code, error=str(error.reason))
        response_text = error.read(2048).decode("utf-8", errors="replace")
        limited = error.code == 429 or (
            error.code == 403 and
            (error.headers.get("X-RateLimit-Remaining") == "0" or "rate limit" in response_text.lower())
        )
        if limited:
            receipt.update(rate_limited=True, retry_at=record_rate_limit(url, error.headers),
                           retry_policy="defer_without_immediate_retry")
    except Exception as error:
        receipt.update(status="request_failed", error=f"{type(error).__name__}: {error}")
    if body:
        receipt.update(bytes=len(body), sha256=hashlib.sha256(body).hexdigest())
        body_path.write_bytes(body)
    receipt_path.write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n")
    return receipt, body
