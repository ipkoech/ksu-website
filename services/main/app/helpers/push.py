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
    parsed = urlsplit(url)
    target = parsed.path or "/"
    if parsed.query:
        target = f"{target}?{parsed.query}"
    return f"{parsed.scheme}://{parsed.netloc}", target


async def _send_webhook_push(push_token: str, title: str, message: str) -> str:
    settings = get_settings()
    if not settings.PUSH_WEBHOOK_URL:
        raise RuntimeError("PUSH_WEBHOOK_URL is required when PUSH_PROVIDER=webhook")

    headers = {}
    if settings.PUSH_WEBHOOK_TOKEN:
        headers["Authorization"] = f"Bearer {settings.PUSH_WEBHOOK_TOKEN}"

    base_url, target = _webhook_target(settings.PUSH_WEBHOOK_URL)
    pool = get_integration_pool()
    if headers:
        response = await pool.request_authenticated(
            "push-webhook",
            base_url,
            "POST",
            target,
            auth_headers=headers,
            json={"token": push_token, "title": title, "message": message},
        )
    else:
        response = await pool.request(
            "push-webhook",
            base_url,
            "POST",
            target,
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
