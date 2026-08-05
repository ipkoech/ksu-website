from __future__ import annotations

from types import SimpleNamespace

import httpx
import pytest
from app.helpers import push, sms, social
from app.services import vice_chancellor_youtube as youtube


class _Pool:
    def __init__(self, responses: list[httpx.Response]) -> None:
        self.responses = responses
        self.calls: list[tuple[str, tuple[object, ...], dict[str, object]]] = []

    async def request(self, *args: object, **kwargs: object) -> httpx.Response:
        self.calls.append(("request", args, kwargs))
        return self.responses.pop(0)

    async def request_authenticated(
        self, *args: object, **kwargs: object
    ) -> httpx.Response:
        self.calls.append(("request_authenticated", args, kwargs))
        return self.responses.pop(0)


def _response(payload: dict[str, object]) -> httpx.Response:
    return httpx.Response(
        200,
        json=payload,
        request=httpx.Request("GET", "https://provider.example/request"),
    )


@pytest.mark.asyncio
async def test_sms_webhook_uses_authenticated_shared_pool(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    pool = _Pool([_response({"id": "sms-123"})])
    monkeypatch.setattr(sms, "get_integration_pool", lambda: pool)
    monkeypatch.setattr(
        sms,
        "get_settings",
        lambda: SimpleNamespace(
            SMS_WEBHOOK_URL="https://sms.example/hooks/delivery",
            SMS_WEBHOOK_TOKEN="sms-token",
        ),
    )

    reference = await sms._send_webhook_sms("+254700000000", "Hello")

    assert reference == "sms-123"
    name, args, kwargs = pool.calls[0]
    assert name == "request_authenticated"
    assert args == ("sms-webhook", "https://sms.example", "POST", "/hooks/delivery")
    assert kwargs["auth_headers"] == {"Authorization": "Bearer sms-token"}
    assert kwargs["json"] == {"to": "+254700000000", "message": "Hello"}


@pytest.mark.asyncio
async def test_push_webhook_uses_authenticated_shared_pool(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    pool = _Pool([_response({"message_id": "push-123"})])
    monkeypatch.setattr(push, "get_integration_pool", lambda: pool)
    monkeypatch.setattr(
        push,
        "get_settings",
        lambda: SimpleNamespace(
            PUSH_WEBHOOK_URL="https://push.example/v1/notifications",
            PUSH_WEBHOOK_TOKEN="push-token",
        ),
    )

    reference = await push._send_webhook_push("device-token", "Title", "Body")

    assert reference == "push-123"
    name, args, kwargs = pool.calls[0]
    assert name == "request_authenticated"
    assert args == ("push-webhook", "https://push.example", "POST", "/v1/notifications")
    assert kwargs["auth_headers"] == {"Authorization": "Bearer push-token"}
    assert kwargs["json"] == {
        "token": "device-token",
        "title": "Title",
        "message": "Body",
    }


@pytest.mark.asyncio
async def test_youtube_oembed_uses_shared_pool_for_read(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    pool = _Pool(
        [_response({"title": "VC welcome", "author_name": "Kisii University"})]
    )
    monkeypatch.setattr(youtube, "get_integration_pool", lambda: pool)
    reference = youtube.normalize_youtube_url("https://youtu.be/dQw4w9WgXcQ")

    metadata = await youtube.fetch_youtube_oembed(reference)

    assert metadata.title == "VC welcome"
    name, args, kwargs = pool.calls[0]
    assert name == "request"
    assert args == ("youtube-oembed", "https://www.youtube.com", "GET", "/oembed")
    assert kwargs["params"] == {"url": reference.canonical_url, "format": "json"}


@pytest.mark.asyncio
async def test_x_credential_check_uses_authenticated_shared_pool(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    pool = _Pool([_response({"data": {"id": "x-user"}})])
    monkeypatch.setattr(social, "get_integration_pool", lambda: pool)
    monkeypatch.setattr(
        social,
        "settings",
        social.settings.model_copy(update={"X_API_BASE_URL": "https://api.x.example"}),
    )
    account = SimpleNamespace(
        credentials={
            "access_token": "x-token",
            "scopes": ["tweet.write", "users.read"],
        },
        settings={},
        account_ref="x-user",
    )

    valid, reason = await social.XAdapter().validate_credentials(account)

    assert (valid, reason) == (True, None)
    name, args, kwargs = pool.calls[0]
    assert name == "request_authenticated"
    assert args == ("social-x", "https://api.x.example", "GET", "/2/users/me")
    assert kwargs["auth_headers"] == {"Authorization": "Bearer x-token"}
