import asyncio
from types import SimpleNamespace

import pytest

from ksu_common.cache import _build_function_cache_key
import ksu_common.cache as cache_module


async def sample_public_detail(slug, db=None, fields=None, include=None):
    return {"slug": slug, "fields": fields, "include": include}


def test_function_cache_key_varies_on_explicit_detail_parameters():
    base_key = _build_function_cache_key(
        "public",
        sample_public_detail,
        ("computer-science",),
        {"fields": "id,title", "include": "school:id,name"},
        ("slug", "fields", "include"),
    )
    changed_include_key = _build_function_cache_key(
        "public",
        sample_public_detail,
        ("computer-science",),
        {"fields": "id,title", "include": "department:id,name"},
        ("slug", "fields", "include"),
    )
    changed_slug_key = _build_function_cache_key(
        "public",
        sample_public_detail,
        ("software-engineering",),
        {"fields": "id,title", "include": "school:id,name"},
        ("slug", "fields", "include"),
    )

    assert base_key != changed_include_key
    assert base_key != changed_slug_key


def test_function_cache_key_ignores_infrastructure_arguments():
    db = SimpleNamespace(name="session")

    without_db = _build_function_cache_key(
        "public",
        sample_public_detail,
        ("computer-science",),
        {"fields": "id,title", "include": "school:id,name"},
        ("slug", "fields", "include"),
    )
    with_db = _build_function_cache_key(
        "public",
        sample_public_detail,
        ("computer-science",),
        {"db": db, "fields": "id,title", "include": "school:id,name"},
        ("slug", "fields", "include"),
    )

    assert without_db == with_db


class _FakeRedis:
    def __init__(self):
        self.values = {}
        self.locks = {}

    async def get(self, key):
        return self.values.get(key)

    async def setex(self, key, timeout, value):
        self.values[key] = value

    async def set(self, key, value, *, nx=False, px=None):
        if nx:
            if key in self.locks:
                return False
            self.locks[key] = value
            return True
        self.values[key] = value
        return True

    async def eval(self, _script, num_keys, *args):
        if num_keys == 2:
            cache_key, lock_key, value, _timeout, token = args
            if self.locks.get(lock_key) == token:
                self.values[cache_key] = value
                del self.locks[lock_key]
                return 1
            return 0

        lock_key, token, *renewal_ttl = args
        if self.locks.get(lock_key) != token:
            return 0
        if renewal_ttl:
            return 1
        del self.locks[lock_key]
        return 1


class _WriteFailRedis(_FakeRedis):
    async def eval(self, _script, num_keys, *args):
        if num_keys == 2:
            raise cache_module.redis.RedisError("cache write failed")
        return await super().eval(_script, num_keys, *args)


class _SingleFlightRedis(_FakeRedis):
    pass


class _LockFailRedis(_FakeRedis):
    async def set(self, *_args, **_kwargs):
        raise cache_module.redis.RedisError("cache lock unavailable")


class _ReadFailRedis(_FakeRedis):
    async def get(self, _key):
        raise cache_module.redis.RedisError("cache read unavailable")


class _PollReadFailRedis(_FakeRedis):
    def __init__(self):
        super().__init__()
        self.reads = 0

    async def get(self, _key):
        self.reads += 1
        if self.reads == 1:
            return None
        raise cache_module.redis.RedisError("cache poll unavailable")

    async def set(self, _key, _value, *, nx=False, px=None):
        if nx:
            return False
        return await super().set(_key, _value, nx=nx, px=px)


@pytest.mark.asyncio
async def test_cached_public_caches_json_serializable_list_responses(monkeypatch):
    redis = _FakeRedis()
    calls = 0

    async def endpoint(*, slug: str):
        nonlocal calls
        calls += 1
        return [{"slug": slug}]

    async def get_fake_redis():
        return redis

    monkeypatch.setattr(cache_module, "get_redis", get_fake_redis)
    cached_endpoint = cache_module.cached_public(timeout=60, vary_on=("slug",))(endpoint)

    first = await cached_endpoint(slug="computer-science")
    second = await cached_endpoint(slug="computer-science")

    assert first.headers["X-Cache"] == "MISS"
    assert second.headers["X-Cache"] == "HIT"
    assert second.body == b'[{"slug":"computer-science"}]'
    assert calls == 1


@pytest.mark.asyncio
async def test_cached_public_does_not_execute_endpoint_twice_when_cache_write_fails(monkeypatch):
    redis = _WriteFailRedis()
    calls = 0

    async def endpoint(*, slug: str):
        nonlocal calls
        calls += 1
        return {"slug": slug}

    async def get_fake_redis():
        return redis

    monkeypatch.setattr(cache_module, "get_redis", get_fake_redis)
    cached_endpoint = cache_module.cached_public(timeout=60, vary_on=("slug",))(endpoint)

    response = await cached_endpoint(slug="computer-science")

    assert response.headers["X-Cache"] == "MISS"
    assert calls == 1


@pytest.mark.asyncio
async def test_cached_public_coalesces_concurrent_cache_misses(monkeypatch):
    redis = _SingleFlightRedis()
    calls = 0
    loader_started = asyncio.Event()
    release_loader = asyncio.Event()

    async def endpoint(*, slug: str):
        nonlocal calls
        calls += 1
        loader_started.set()
        await release_loader.wait()
        return {"slug": slug}

    monkeypatch.setattr(cache_module, "get_redis", lambda: _async_value(redis))
    cached_endpoint = cache_module.cached_public(timeout=60, vary_on=("slug",))(endpoint)

    first = asyncio.create_task(cached_endpoint(slug="computer-science"))
    await loader_started.wait()
    second = asyncio.create_task(cached_endpoint(slug="computer-science"))
    await asyncio.sleep(0)
    release_loader.set()

    first_response, second_response = await asyncio.gather(first, second)

    assert calls == 1
    assert {first_response.headers["X-Cache"], second_response.headers["X-Cache"]} == {
        "MISS",
        "HIT",
    }
    assert first_response.body == second_response.body == b'{"slug":"computer-science"}'
    assert redis.locks == {}


@pytest.mark.asyncio
async def test_cache_response_coalesces_concurrent_cache_misses(monkeypatch):
    redis = _SingleFlightRedis()
    calls = 0
    loader_started = asyncio.Event()
    release_loader = asyncio.Event()
    user = SimpleNamespace(sub="student-1")

    async def endpoint(*, user, slug: str):
        nonlocal calls
        calls += 1
        loader_started.set()
        await release_loader.wait()
        return {"slug": slug, "user": user.sub}

    monkeypatch.setattr(cache_module, "get_redis", lambda: _async_value(redis))
    cached_endpoint = cache_module.cache_response(timeout=60, vary_on=("slug",))(endpoint)

    first = asyncio.create_task(cached_endpoint(user=user, slug="computer-science"))
    await loader_started.wait()
    second = asyncio.create_task(cached_endpoint(user=user, slug="computer-science"))
    await asyncio.sleep(0)
    release_loader.set()

    first_response, second_response = await asyncio.gather(first, second)

    assert calls == 1
    assert {first_response.headers["X-Cache"], second_response.headers["X-Cache"]} == {
        "MISS",
        "HIT",
    }
    assert first_response.body == second_response.body == b'{"slug":"computer-science","user":"student-1"}'
    assert redis.locks == {}


@pytest.mark.asyncio
async def test_cached_public_releases_single_flight_lock_after_loader_failure(monkeypatch):
    redis = _SingleFlightRedis()
    calls = 0
    loader_started = asyncio.Event()
    fail_loader = asyncio.Event()

    async def endpoint(*, slug: str):
        nonlocal calls
        calls += 1
        if calls == 1:
            loader_started.set()
            await fail_loader.wait()
            raise RuntimeError("loader failed")
        return {"slug": slug}

    monkeypatch.setattr(cache_module, "get_redis", lambda: _async_value(redis))
    cached_endpoint = cache_module.cached_public(timeout=60, vary_on=("slug",))(endpoint)

    failing_request = asyncio.create_task(cached_endpoint(slug="computer-science"))
    await loader_started.wait()
    waiting_request = asyncio.create_task(cached_endpoint(slug="computer-science"))
    await asyncio.sleep(0)
    assert not waiting_request.done()
    fail_loader.set()

    with pytest.raises(RuntimeError, match="loader failed"):
        await failing_request
    response = await waiting_request

    assert calls == 2
    assert response.headers["X-Cache"] == "MISS"
    assert redis.locks == {}


@pytest.mark.asyncio
async def test_cached_public_falls_back_when_single_flight_lock_is_unavailable(monkeypatch):
    redis = _LockFailRedis()
    calls = 0

    async def endpoint(*, slug: str):
        nonlocal calls
        calls += 1
        return {"slug": slug}

    monkeypatch.setattr(cache_module, "get_redis", lambda: _async_value(redis))
    cached_endpoint = cache_module.cached_public(timeout=60, vary_on=("slug",))(endpoint)

    first = await cached_endpoint(slug="computer-science")
    second = await cached_endpoint(slug="computer-science")

    assert first == second == {"slug": "computer-science"}
    assert calls == 2


@pytest.mark.asyncio
@pytest.mark.parametrize("decorator_name", ["cached_public", "cache_response"])
async def test_cache_decorators_fail_closed_in_production_when_redis_connect_fails(
    monkeypatch,
    decorator_name: str,
):
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("KSU_CACHE_REDIS_FAILURE_MODE", "fail_closed")
    calls = 0
    user = SimpleNamespace(sub="student-1")

    async def endpoint(*, slug: str, user=None):
        nonlocal calls
        calls += 1
        payload = {"slug": slug}
        if user is not None:
            payload["user"] = user.sub
        return payload

    async def fail_get_redis():
        raise cache_module.redis.RedisError("cache connect unavailable")

    monkeypatch.setattr(cache_module, "get_redis", fail_get_redis)
    decorator = getattr(cache_module, decorator_name)(timeout=60, vary_on=("slug",))
    cached_endpoint = decorator(endpoint)

    with pytest.raises(cache_module.HTTPException, match="cache-unavailable") as exc_info:
        if decorator_name == "cache_response":
            await cached_endpoint(user=user, slug="computer-science")
        else:
            await cached_endpoint(slug="computer-science")

    assert exc_info.value.status_code == 503
    assert calls == 0


@pytest.mark.asyncio
async def test_cached_public_fails_closed_in_production_when_redis_read_fails(monkeypatch):
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("KSU_CACHE_REDIS_FAILURE_MODE", "fail_closed")
    redis = _ReadFailRedis()
    calls = 0

    async def endpoint(*, slug: str):
        nonlocal calls
        calls += 1
        return {"slug": slug}

    monkeypatch.setattr(cache_module, "get_redis", lambda: _async_value(redis))
    cached_endpoint = cache_module.cached_public(timeout=60, vary_on=("slug",))(endpoint)

    with pytest.raises(cache_module.HTTPException, match="cache-unavailable") as exc_info:
        await cached_endpoint(slug="computer-science")

    assert exc_info.value.status_code == 503
    assert calls == 0


@pytest.mark.asyncio
async def test_cached_public_fails_closed_in_production_when_lock_set_fails(monkeypatch):
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("KSU_CACHE_REDIS_FAILURE_MODE", "fail_closed")
    redis = _LockFailRedis()
    calls = 0

    async def endpoint(*, slug: str):
        nonlocal calls
        calls += 1
        return {"slug": slug}

    monkeypatch.setattr(cache_module, "get_redis", lambda: _async_value(redis))
    cached_endpoint = cache_module.cached_public(timeout=60, vary_on=("slug",))(endpoint)

    with pytest.raises(cache_module.HTTPException, match="cache-unavailable") as exc_info:
        await cached_endpoint(slug="computer-science")

    assert exc_info.value.status_code == 503
    assert calls == 0


@pytest.mark.asyncio
async def test_cached_public_fails_closed_in_production_when_poll_read_fails(monkeypatch):
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("KSU_CACHE_REDIS_FAILURE_MODE", "fail_closed")
    redis = _PollReadFailRedis()
    calls = 0

    async def endpoint(*, slug: str):
        nonlocal calls
        calls += 1
        return {"slug": slug}

    monkeypatch.setattr(cache_module, "get_redis", lambda: _async_value(redis))
    cached_endpoint = cache_module.cached_public(timeout=60, vary_on=("slug",))(endpoint)

    with pytest.raises(cache_module.HTTPException, match="cache-unavailable") as exc_info:
        await cached_endpoint(slug="computer-science")

    assert exc_info.value.status_code == 503
    assert calls == 0


@pytest.mark.asyncio
@pytest.mark.parametrize("decorator_name", ["cached_public", "cache_response"])
async def test_cache_decorators_keep_uncached_fallback_in_development_when_redis_connect_fails(
    monkeypatch,
    decorator_name: str,
):
    monkeypatch.setenv("APP_ENV", "development")
    monkeypatch.setenv("KSU_CACHE_REDIS_FAILURE_MODE", "fallback")
    calls = 0
    user = SimpleNamespace(sub="student-1")

    async def endpoint(*, slug: str, user=None):
        nonlocal calls
        calls += 1
        payload = {"slug": slug}
        if user is not None:
            payload["user"] = user.sub
        return payload

    async def fail_get_redis():
        raise cache_module.redis.RedisError("cache connect unavailable")

    monkeypatch.setattr(cache_module, "get_redis", fail_get_redis)
    decorator = getattr(cache_module, decorator_name)(timeout=60, vary_on=("slug",))
    cached_endpoint = decorator(endpoint)

    if decorator_name == "cache_response":
        result = await cached_endpoint(user=user, slug="computer-science")
        assert result == {"slug": "computer-science", "user": "student-1"}
    else:
        result = await cached_endpoint(slug="computer-science")
        assert result == {"slug": "computer-science"}

    assert calls == 1


@pytest.mark.asyncio
async def test_cached_public_waiters_do_not_reload_after_one_second(monkeypatch):
    redis = _SingleFlightRedis()
    calls = 0
    loader_started = asyncio.Event()
    release_loader = asyncio.Event()

    async def endpoint(*, slug: str):
        nonlocal calls
        calls += 1
        loader_started.set()
        await release_loader.wait()
        return {"slug": slug}

    monkeypatch.setattr(cache_module, "get_redis", lambda: _async_value(redis))
    cached_endpoint = cache_module.cached_public(timeout=60, vary_on=("slug",))(endpoint)

    first = asyncio.create_task(cached_endpoint(slug="computer-science"))
    await loader_started.wait()
    second = asyncio.create_task(cached_endpoint(slug="computer-science"))
    await asyncio.sleep(1.1)

    assert calls == 1
    assert not second.done()
    release_loader.set()

    first_response, second_response = await asyncio.gather(first, second)
    assert first_response.body == second_response.body == b'{"slug":"computer-science"}'


@pytest.mark.asyncio
async def test_stale_loader_cannot_publish_over_new_lock_owner(monkeypatch):
    redis = _SingleFlightRedis()
    calls = 0
    first_loader_started = asyncio.Event()
    release_first_loader = asyncio.Event()

    async def endpoint(*, slug: str):
        nonlocal calls
        calls += 1
        if calls == 1:
            first_loader_started.set()
            await release_first_loader.wait()
            return {"slug": slug, "version": "old"}
        return {"slug": slug, "version": "new"}

    monkeypatch.setattr(cache_module, "get_redis", lambda: _async_value(redis))
    cached_endpoint = cache_module.cached_public(timeout=60, vary_on=("slug",))(endpoint)

    old_owner = asyncio.create_task(cached_endpoint(slug="computer-science"))
    await first_loader_started.wait()
    redis.locks.clear()
    new_owner = await cached_endpoint(slug="computer-science")
    release_first_loader.set()
    old_response = await old_owner
    cached_response = await cached_endpoint(slug="computer-science")

    assert calls == 2
    assert old_response.body == b'{"slug":"computer-science","version":"old"}'
    assert new_owner.body == b'{"slug":"computer-science","version":"new"}'
    assert cached_response.headers["X-Cache"] == "HIT"
    assert cached_response.body == b'{"slug":"computer-science","version":"new"}'


async def _async_value(value):
    return value
