from __future__ import annotations

import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock

import httpx
import pytest
from app.services import assistant_identity, assistant_notifications, media


def _response(payload: object) -> httpx.Response:
    return httpx.Response(
        200,
        json=payload,
        request=httpx.Request("GET", "http://main.test/request"),
    )


class _Pool:
    def __init__(self, responses: list[httpx.Response]) -> None:
        self.responses = responses
        self.calls: list[tuple[str, tuple[object, ...], dict[str, object]]] = []

    async def request_internal(self, *args: object, **kwargs: object) -> httpx.Response:
        self.calls.append(("request_internal", args, kwargs))
        return self.responses.pop(0)


@pytest.mark.asyncio
async def test_library_internal_integrations_use_the_shared_pool(monkeypatch: pytest.MonkeyPatch) -> None:
    media_id = uuid.uuid4()
    pool = _Pool([
        _response({"data": {"url": "/uploads/cover.jpg"}}),
        _response({"status": "success"}),
        _response({"status": "success"}),
    ])
    settings = SimpleNamespace(
        MAIN_SERVICE_URL="http://main.test/",
        INTERNAL_API_KEY="main-key",
        PUBLIC_APP_URL="http://portal.test/",
    )
    for module in (media, assistant_identity, assistant_notifications):
        monkeypatch.setattr(module, "get_integration_pool", lambda: pool)

    monkeypatch.setattr(media, "get_settings", lambda: settings)
    resolved = await media.resolve_public_media([media_id])
    await assistant_identity.send_verification_email(
        email="reader@example.test", token="token", code="123456", settings=settings
    )
    await assistant_notifications.send_reply_notification(
        email="reader@example.test", token="token", settings=settings
    )

    assert resolved == {media_id: {"url": "/uploads/cover.jpg"}}
    media_call, verification_call, reply_call = pool.calls
    assert media_call[1][:4] == ("main-public-media", "http://main.test", "GET", f"/api/v1/internal/media/{media_id}")
    assert verification_call[1][:4] == ("main-library-verification-email", "http://main.test", "POST", "/api/v1/internal/email/send")
    assert reply_call[1][:4] == ("main-library-reply-notification", "http://main.test", "POST", "/api/v1/internal/email/send")
    assert all(call[2]["api_key"] == "main-key" for call in pool.calls)


@pytest.mark.asyncio
async def test_library_lifespan_closes_shared_integration_pool(monkeypatch: pytest.MonkeyPatch) -> None:
    from app import main

    close_pool = AsyncMock()
    monkeypatch.setattr(main, "close_integration_pool", close_pool)

    async with main.lifespan(SimpleNamespace()):
        pass

    close_pool.assert_awaited_once()
