import asyncio
from types import SimpleNamespace
from uuid import uuid4

import httpx
import pytest

from app.services import media


def _response(body, status_code=200):
    return httpx.Response(status_code, json=body, request=httpx.Request("POST", "https://main.example.edu"))


def test_public_media_resolution_uses_bounded_batches(monkeypatch):
    identifiers = [uuid4() for _ in range(205)]
    calls = []

    async def request_internal(integration, base_url, method, path, **options):
        calls.append((integration, base_url, method, path, options))
        ids = options["json"]["ids"]
        return _response({
            "status": "success",
            "data": [{"id": identifier, "url": f"/media/{identifier}"} for identifier in ids],
        })

    pool = SimpleNamespace(request_internal=request_internal)
    monkeypatch.setattr(media, "get_integration_pool", lambda: pool)
    monkeypatch.setattr(
        media,
        "get_settings",
        lambda: SimpleNamespace(MAIN_SERVICE_URL="https://main.example.edu", MAIN_SERVICE_API_KEY="key"),
    )

    resolved = asyncio.run(media.resolve_public_media(identifiers + identifiers[:5]))

    assert len(resolved) == 205
    assert len(calls) == 3
    assert [len(call[4]["json"]["ids"]) for call in calls] == [100, 100, 5]
    assert all(
        call[2] == "POST" and call[3] == "/api/v1/internal/media/resolve"
        for call in calls
    )
    assert all(call[4]["api_key"] == "key" for call in calls)


def test_public_media_resolution_keeps_legacy_adapter_for_rolling_upgrade(monkeypatch):
    identifiers = [uuid4(), uuid4()]
    calls = []

    async def request_internal(_integration, _base_url, method, path, **options):
        calls.append((method, path, options))
        if method == "POST":
            return _response({"detail": "batch route unavailable"}, status_code=404)
        identifier = path.rsplit("/", 1)[-1]
        return _response({"id": identifier, "url": f"/media/{identifier}"})

    pool = SimpleNamespace(request_internal=request_internal)
    monkeypatch.setattr(media, "get_integration_pool", lambda: pool)
    monkeypatch.setattr(
        media,
        "get_settings",
        lambda: SimpleNamespace(MAIN_SERVICE_URL="https://main.example.edu", MAIN_SERVICE_API_KEY="key"),
    )

    resolved = asyncio.run(media.resolve_public_media(identifiers))

    assert set(resolved) == set(identifiers)
    assert calls[0][0:2] == ("POST", "/api/v1/internal/media/resolve")
    assert [call[0] for call in calls[1:]] == ["GET", "GET"]


def test_require_public_media_rejects_private_or_missing_references(monkeypatch):
    identifier = uuid4()

    async def resolve(_ids):
        return {}

    monkeypatch.setattr(media, "resolve_public_media", resolve)

    with pytest.raises(ValueError, match="unavailable or not public"):
        asyncio.run(media.require_public_media(identifier))
