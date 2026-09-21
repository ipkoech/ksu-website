import asyncio

import httpx
import pytest

from ksu_common.internal_client import PooledIntegrationClient
from ksu_common.reliability import RetryPolicy, TimeoutConfig


@pytest.mark.parametrize("method,headers,attempts", [
    ("GET", {}, 3),
    ("POST", {}, 1),
    ("POST", {"Idempotency-Key": "command-123"}, 3),
])
def test_safe_retries_reuse_connection_pool(method, headers, attempts):
    async def exercise():
        calls = []

        async def handler(request):
            calls.append(request)
            return httpx.Response(503)

        policy = RetryPolicy(attempts=3, initial_delay=0, max_delay=0, retry_statuses=frozenset({503}))
        async with PooledIntegrationClient(retry_policy=policy, transport=httpx.MockTransport(handler)) as pool:
            response = await pool.request("test", "https://example.edu", method, "/items", headers=headers)
            assert response.status_code == 503
            assert len(calls) == attempts
            assert pool.client_count == 1
        assert pool.is_closed

    asyncio.run(exercise())


def test_total_deadline_cancels_transport_and_releases_pool():
    async def exercise():
        cancelled = asyncio.Event()

        async def handler(_request):
            try:
                await asyncio.sleep(10)
                return httpx.Response(200)
            finally:
                cancelled.set()

        async with PooledIntegrationClient(
            timeout=TimeoutConfig(total=0.02), transport=httpx.MockTransport(handler),
        ) as pool:
            # The enclosing bound also makes a regression finish promptly.
            async with asyncio.timeout(1):
                with pytest.raises(httpx.TimeoutException):
                    await pool.request("test", "https://example.edu", "GET", "/items")
            assert cancelled.is_set()
        assert pool.is_closed

    asyncio.run(exercise())


def test_internal_credentials_cannot_be_sent_to_an_absolute_target():
    async def exercise():
        async with PooledIntegrationClient() as pool:
            with pytest.raises(ValueError, match="relative URL"):
                await pool.request_internal(
                    "test", "https://example.edu", "GET", "https://other.example/items", api_key="test-key",
                )
            assert pool.client_count == 0

    asyncio.run(exercise())
