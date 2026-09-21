import asyncio
import json
import os
import uuid

import pytest
from redis.asyncio import Redis

from ksu_common import cache


def test_invalidation_fences_an_inflight_loader(monkeypatch):
    url = os.environ.get("KSU_TEST_REDIS_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_REDIS_URL required")

    async def exercise():
        client = Redis.from_url(url)
        prefix = "race_probe_" + uuid.uuid4().hex
        key = f"cache:{prefix}:value"
        started, release = asyncio.Event(), asyncio.Event()

        async def provider():
            return client

        async def old_loader():
            started.set()
            await release.wait()
            return {"version": "old"}

        async def new_loader():
            return {"version": "new"}

        monkeypatch.setattr(cache, "get_redis", provider)
        old = asyncio.create_task(cache._cached_single_flight(client, key, 60, old_loader))
        try:
            await asyncio.wait_for(started.wait(), 3)
            assert await cache.invalidate_prefix(prefix) == 1
            await cache._cached_single_flight(client, key, 60, new_loader)
            release.set()
            await asyncio.wait_for(old, 3)
            assert json.loads(await client.get(key)) == {"version": "new"}
            assert await client.get(key + ":single-flight") is None
        finally:
            release.set()
            if not old.done():
                old.cancel()
            await asyncio.gather(old, return_exceptions=True)
            await client.delete(key, key + ":single-flight")
            await client.aclose()

    asyncio.run(exercise())


def test_cancelled_refresh_releases_lock_and_waiters_share_one_reload():
    url = os.environ.get("KSU_TEST_REDIS_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_REDIS_URL required")

    async def exercise():
        client = Redis.from_url(url)
        key = "cache:cancel_probe_" + uuid.uuid4().hex
        started = asyncio.Event()
        reloads = 0

        async def cancelled_loader():
            started.set()
            await asyncio.Event().wait()

        async def fresh_loader():
            nonlocal reloads
            reloads += 1
            await asyncio.sleep(0.05)
            return {"version": "fresh"}

        task = asyncio.create_task(cache._cached_single_flight(client, key, 60, cancelled_loader))
        waiters = []
        try:
            await asyncio.wait_for(started.wait(), 3)
            task.cancel()
            with pytest.raises(asyncio.CancelledError):
                await task
            assert await client.get(key + ":single-flight") is None
            assert await client.get(key) is None
            waiters = [asyncio.create_task(cache._cached_single_flight(client, key, 60, fresh_loader))
                       for _ in range(20)]
            await asyncio.wait_for(asyncio.gather(*waiters), 5)
            assert reloads == 1
            assert json.loads(await client.get(key)) == {"version": "fresh"}
            assert await client.get(key + ":single-flight") is None
        finally:
            for pending in [task, *waiters]:
                if not pending.done():
                    pending.cancel()
            await asyncio.gather(task, *waiters, return_exceptions=True)
            await client.delete(key, key + ":single-flight")
            await client.aclose()

    asyncio.run(exercise())
