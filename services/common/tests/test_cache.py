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

    async def get(self, key):
        return self.values.get(key)

    async def setex(self, key, timeout, value):
        self.values[key] = value


class _WriteFailRedis(_FakeRedis):
    async def setex(self, key, timeout, value):
        raise cache_module.redis.RedisError("cache write failed")


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
