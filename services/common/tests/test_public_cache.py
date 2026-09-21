import asyncio
from unittest.mock import AsyncMock

import pytest
from fastapi import Request
from fastapi.testclient import TestClient

from ksu_common import cache
from ksu_common.runtime import CorsConfig, ServiceAppConfig, create_service_app


@pytest.mark.parametrize("credentials", [
    {"Authorization": "Bearer test"},
    {"Cookie": "ksu_access=test"},
    {"Cookie": "access_token=test"},
    {"Cookie": "ksu_refresh=test"},
])
def test_authenticated_public_route_cannot_read_or_fill_anonymous_cache(monkeypatch, credentials):
    entries = {}
    calls = []
    monkeypatch.setattr(cache, "get_redis", AsyncMock(return_value=object()))

    async def cached(_client, key, _timeout, loader):
        if key not in entries:
            entries[key] = await loader()
        return entries[key]

    monkeypatch.setattr(cache, "_cached_single_flight", cached)

    def register(app):
        @app.get("/items")
        @cache.cached_public(vary_on=("page",))
        async def items(request: Request, fields: str = "name") -> dict[str, str]:
            private = bool(request.headers.get("authorization") or request.headers.get("cookie"))
            calls.append(private)
            return {"view": "private" if private else "public", "fields": fields}

    app = create_service_app(
        ServiceAppConfig(service_name="test", title="Test", version="1", environment="development"),
        cors=CorsConfig(origins=()), register_routes=register,
    )
    with TestClient(app) as client:
        assert client.get("/items", headers=credentials).json()["view"] == "private"
        assert not entries
        assert client.get("/items").json()["view"] == "public"
        assert client.get("/items", headers=credentials).json()["view"] == "private"
        assert client.get("/items?fields=id").json()["fields"] == "id"
        assert client.get("/items").json()["fields"] == "name"
    assert calls == [True, False, True, False]


def test_invalidation_batches_large_key_sets(monkeypatch):
    client = AsyncMock()

    async def scan_iter(**_kwargs):
        for index in range(600):
            yield f"cache:public:{index}"

    client.scan_iter = scan_iter
    client.delete.side_effect = lambda *keys: len(keys)
    monkeypatch.setattr(cache, "get_redis", AsyncMock(return_value=client))
    assert asyncio.run(cache.invalidate_prefix("public")) == 600
    assert [len(call.args) for call in client.delete.await_args_list] == [256, 256, 88]
