import asyncio
import os
import uuid

import pytest
from redis.asyncio import Redis

from ksu_common.rate_limit import RateLimiter


def test_concurrent_limiters_share_atomic_budget_and_expire():
    url = os.environ.get("KSU_TEST_REDIS_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_REDIS_URL required")

    async def exercise():
        clients = [Redis.from_url(url) for _ in range(2)]
        prefix = "limiter_probe_" + uuid.uuid4().hex

        async def first():
            return clients[0]

        async def second():
            return clients[1]

        limiters = [RateLimiter(requests=10, window=60, prefix=prefix, redis_provider=p)
                    for p in (first, second)]
        keys = [limiters[0]._make_key("caller", path) for path in ("/items", "/other")]
        try:
            results = await asyncio.gather(*[
                limiters[i % 2].is_allowed("caller", "/items") for i in range(100)
            ])
            assert sum(allowed for allowed, _, _ in results) == 10
            assert await clients[0].zcard(keys[0]) == 10
            assert 0 < await clients[0].ttl(keys[0]) <= 60
            assert all(remaining == 0 and 1 <= retry <= 60
                       for allowed, remaining, retry in results if not allowed)
            assert (await limiters[1].is_allowed("caller", "/other"))[0]
            # Expire only this test's random key to exercise a new window
            # without waiting a minute or changing the production clock.
            await clients[0].pexpire(keys[0], 1)
            await asyncio.sleep(0.02)
            assert await limiters[0].is_allowed("caller", "/items") == (True, 9, 0)
        finally:
            await clients[0].delete(*keys)
            for client in clients:
                await client.aclose()

    asyncio.run(exercise())
