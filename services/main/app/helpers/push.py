"""Push notification delivery helpers."""

from __future__ import annotations

import hashlib
from urllib.parse import urlsplit

from ksu_common.internal_client import get_integration_pool

from ..core.config import get_settings


def _development_reference(push_token: str, title: str, message: str) -> str:
    digest = hashlib.sha256(f"{push_token}:{title}:{message}".encode()).hexdigest()[:16]
    return f"dev-push:{digest}"


def _webhook_target(url: str) -> tuple[str, str]:
    try:
        parsed = urlsplit(url)
        port = parsed.port
    except ValueError as exc:
        raise ValueError("PUSH_WEBHOOK_URL must be a valid absolute HTTP(S) URL") from exc
    if (
        parsed.scheme not in {"http", "https"}
        or not parsed.hostname
        or parsed.username is not None
        or parsed.password is not None
        or parsed.fragment
    ):
        raise ValueError(
            "PUSH_WEBHOOK_URL must be an absolute HTTP(S) URL without credentials or a fragment"
        )
    target = parsed.path or "/"
    if parsed.query:
        target = f"{target}?{parsed.query}"
    host = parsed.hostname
    if ":" in host and not host.startswith("["):
        host = f"[{host}]"
    return f"{parsed.scheme}://{host}{f':{port}' if port else ''}", target


async def _send_webhook_push(push_token: str, title: str, message: str) -> str:
    settings = get_settings()
    if not settings.PUSH_WEBHOOK_URL:
        raise RuntimeError("PUSH_WEBHOOK_URL is required when PUSH_PROVIDER=webhook")

    token = (settings.PUSH_WEBHOOK_TOKEN or "").strip()
    if not token:
        raise RuntimeError("PUSH_WEBHOOK_TOKEN is required when PUSH_PROVIDER=webhook")

    base_url, target = _webhook_target(settings.PUSH_WEBHOOK_URL)
    response = await get_integration_pool().request_authenticated(
        "push-webhook",
        base_url,
        "POST",
        target,
        auth_headers={"Authorization": f"Bearer {token}"},
        json={"token": push_token, "title": title, "message": message},
    )
    response.raise_for_status()
    payload = response.json() if response.content else {}
    return str(
        payload.get("id")
        or payload.get("message_id")
        or payload.get("reference")
        or response.headers.get("x-request-id")
        or "webhook-push:sent"
    )


async def _send_fcm_legacy_push(push_token: str, title: str, message: str) -> str:
    settings = get_settings()
    if not settings.FCM_SERVER_KEY:
        raise RuntimeError("FCM_SERVER_KEY is required when PUSH_PROVIDER=fcm_legacy")

    response = await get_integration_pool().request_authenticated(
        "fcm-legacy-push",
        "https://fcm.googleapis.com",
        "POST",
        "/fcm/send",
        auth_headers={"Authorization": f"key={settings.FCM_SERVER_KEY}"},
        json={"to": push_token, "notification": {"title": title, "body": message}},
    )
    response.raise_for_status()
    payload = response.json()
    results = payload.get("results") or []
    first = results[0] if results else {}
    return str(
        first.get("message_id") or payload.get("multicast_id") or "fcm-push:sent"
    )


async def send_push(push_token: str, title: str, message: str) -> str:
    """Send a push notification and return a provider reference."""
    settings = get_settings()
    if settings.PUSH_PROVIDER == "webhook":
        return await _send_webhook_push(push_token, title, message)
    if settings.PUSH_PROVIDER == "fcm_legacy":
        return await _send_fcm_legacy_push(push_token, title, message)
    if settings.APP_ENV != "production":
        return _development_reference(push_token, title, message)
    raise RuntimeError(
        "Push delivery is disabled. Configure PUSH_PROVIDER for production use."
    )
