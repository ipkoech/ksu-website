import asyncio
from unittest.mock import AsyncMock

from starlette.requests import Request

from ksu_common import cache
from ksu_common.auth import TokenPayload


def test_private_cache_requires_identity_and_partitions_authority(monkeypatch):
    keys = []
    provider = AsyncMock(return_value=object())
    monkeypatch.setattr(cache, "get_redis", provider)

    async def capture(_client, key, _timeout, loader):
        keys.append(key)
        return await loader()

    monkeypatch.setattr(cache, "_cached_single_flight", capture)

    @cache.cache_response()
    async def endpoint(current_user=None):
        return {"value": "private"}

    async def exercise():
        assert await endpoint() == {"value": "private"}
        provider.assert_not_awaited()
        user = TokenPayload("person", "session", raw={"scope_grants": [{"scope_id": "one"}]})
        await endpoint(user)
        await endpoint(current_user=user)
        assert keys[0] == keys[1]
        user.raw["scope_grants"] = []
        await endpoint(user)
        assert keys[2] != keys[0]
        await endpoint(TokenPayload("different", "session"))
        assert keys[3] != keys[0]

    asyncio.run(exercise())


def test_same_path_in_different_services_has_distinct_cache_key(monkeypatch):
    request = Request({"type": "http", "method": "GET", "path": "/api/v1/items", "query_string": b"", "headers": []})
    monkeypatch.setenv("SERVICE_NAME", "main")
    main_key = cache._build_cache_key("public", request, ())
    monkeypatch.setenv("SERVICE_NAME", "research")
    assert cache._build_cache_key("public", request, ()) != main_key
    # Existing prefix invalidation remains compatible.
    assert main_key.startswith("cache:public:")
