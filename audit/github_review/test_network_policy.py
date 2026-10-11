"""Verify rate-limit behavior without making network requests."""
import io
from pathlib import Path
import tempfile
import time
import unittest
from unittest.mock import MagicMock, patch
from urllib.error import HTTPError

import network


class RatePolicyTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.cache = patch.object(network, "CACHE", Path(self.temp.name))
        self.cache.start()
        self.credentials = patch.object(network, "get_token", return_value="")
        self.credentials.start()

    def tearDown(self):
        self.credentials.stop()
        self.cache.stop()
        self.temp.cleanup()

    def test_429_defers_other_requests_until_retry_after(self):
        url = "https://api.github.com/repos/example/one"
        error = HTTPError(url, 429, "Too many requests", {"Retry-After": "120"}, io.BytesIO(b"limit"))
        opener = MagicMock()
        opener.open.side_effect = error
        with patch("network.urllib.request.build_opener", return_value=opener):
            receipt, body = network.fetch(url)
            self.assertEqual(receipt["status"], 429)
            self.assertGreater(receipt["retry_at"], time.time() + 119)
            second, _ = network.fetch("https://api.github.com/repos/example/two")
            self.assertEqual(second["status"], "deferred_rate_limit")
            self.assertFalse(second["request_sent"])
            self.assertEqual(opener.open.call_count, 1)

    def test_exhausted_403_uses_reset_timestamp(self):
        url = "https://api.github.com/repos/example/one"
        reset = int(time.time()) + 300
        error = HTTPError(url, 403, "Forbidden",
                          {"X-RateLimit-Remaining": "0", "X-RateLimit-Reset": str(reset)},
                          io.BytesIO(b'{"message":"API rate limit exceeded"}'))
        opener = MagicMock()
        opener.open.side_effect = error
        with patch("network.urllib.request.build_opener", return_value=opener):
            receipt, _ = network.fetch(url)
        self.assertTrue(receipt["rate_limited"])
        self.assertGreaterEqual(receipt["retry_at"], reset)

    def test_ordinary_forbidden_is_not_reported_as_rate_limit(self):
        url = "https://example.org/private"
        error = HTTPError(url, 403, "Forbidden", {}, io.BytesIO(b"Access denied"))
        opener = MagicMock()
        opener.open.side_effect = error
        with patch("network.urllib.request.build_opener", return_value=opener):
            receipt, _ = network.fetch(url)
        self.assertEqual(receipt["status"], 403)
        self.assertNotIn("rate_limited", receipt)

    def test_cached_success_requires_no_new_request(self):
        url = "https://raw.githubusercontent.com/example/repo/pin/README.md"
        response = MagicMock()
        response.__enter__.return_value = response
        response.read.return_value = b"source snapshot"
        response.status, response.url, response.headers = 200, url, {}
        opener = MagicMock()
        opener.open.return_value = response
        with patch("network.urllib.request.build_opener", return_value=opener):
            first, _ = network.fetch(url)
            second, body = network.fetch(url)
        self.assertEqual(first["sha256"], second["sha256"])
        self.assertEqual(body, b"source snapshot")
        self.assertEqual(opener.open.call_count, 1)


if __name__ == "__main__":
    unittest.main()
