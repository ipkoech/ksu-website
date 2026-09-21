import asyncio

import httpx
import pytest

from ksu_common.internal_client import PooledIntegrationClient, retry_after_seconds
from ksu_common.reliability import RetryPolicy


@pytest.mark.parametrize("header,expected", [("2", 2.0), ("60", None), ("garbage", 0.1)])
def test_retry_after_wait_or_return_without_early_retry(header, expected):
    async def exercise():
        calls, sleeps = [], []

        async def handler(request):
            calls.append(request)
            return httpx.Response(429, headers={"Retry-After": header}) if len(calls) == 1 else httpx.Response(200)

        async def sleep(delay):
            sleeps.append(delay)

        async with PooledIntegrationClient(
            transport=httpx.MockTransport(handler), sleep=sleep,
            retry_policy=RetryPolicy(retry_statuses=frozenset({429}), jitter_ratio=0),
        ) as pool:
            response = await pool.request("audit", "https://main.example.edu", "POST", "/audit",
                                          headers={"Idempotency-Key": "stable-event"})
        if expected is None:
            assert response.status_code == 429 and len(calls) == 1 and sleeps == []
            assert response.headers["Retry-After"] == header
        else:
            assert response.status_code == 200 and len(calls) == 2
            assert sleeps == [expected]

    asyncio.run(exercise())


def test_http_date_and_invalid_advisories(monkeypatch):
    monkeypatch.setattr("ksu_common.internal_client.time.time", lambda: 0)
    assert retry_after_seconds("Thu, 01 Jan 1970 00:00:03 GMT") == 3
    assert retry_after_seconds("Wed, 31 Dec 1969 23:59:59 GMT") == 0
    assert retry_after_seconds("-2") is None
    assert retry_after_seconds(None) is None
