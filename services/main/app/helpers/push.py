"""Push notification delivery helpers."""

from __future__ import annotations

import hashlib

import httpx

from ..core.config import get_settings


def _development_reference(push_token: str, title: str, message: str) -> str:
    digest = hashlib.sha256(f"{push_token}:{title}:{message}".encode("utf-8")).hexdigest()[:16]
    return f"dev-push:{digest}"


async def _send_webhook_push(push_token: str, title: str, message: str) -> str:
    settings = get_settings()
    if not settings.PUSH_WEBHOOK_URL:
        raise RuntimeError("PUSH_WEBHOOK_URL is required when PUSH_PROVIDER=webhook")

    headers = {}
    if settings.PUSH_WEBHOOK_TOKEN:
        headers["Authorization"] = f"Bearer {settings.PUSH_WEBHOOK_TOKEN}"

    async with httpx.AsyncClient(timeout=httpx.Timeout(20.0, connect=5.0)) as client:
        response = await client.post(
            settings.PUSH_WEBHOOK_URL,
            json={"token": push_token, "title": title, "message": message},
            headers=headers,
        )
        response.raise_for_status()
        payload = response.json() if response.content else {}
        return str(payload.get("id") or payload.get("message_id") or payload.get("reference") or response.headers.get("x-request-id") or "webhook-push:sent")


async def _send_fcm_legacy_push(push_token: str, title: str, message: str) -> str:
    settings = get_settings()
    if not settings.FCM_SERVER_KEY:
        raise RuntimeError("FCM_SERVER_KEY is required when PUSH_PROVIDER=fcm_legacy")

    async with httpx.AsyncClient(timeout=httpx.Timeout(20.0, connect=5.0)) as client:
        response = await client.post(
            "https://fcm.googleapis.com/fcm/send",
            json={"to": push_token, "notification": {"title": title, "body": message}},
            headers={"Authorization": f"key={settings.FCM_SERVER_KEY}"},
        )
        response.raise_for_status()
        payload = response.json()
        results = payload.get("results") or []
        first = results[0] if results else {}
        return str(first.get("message_id") or payload.get("multicast_id") or "fcm-push:sent")


async def send_push(push_token: str, title: str, message: str) -> str:
    """Send a push notification and return a provider reference."""
    settings = get_settings()
    if settings.PUSH_PROVIDER == "webhook":
        return await _send_webhook_push(push_token, title, message)
    if settings.PUSH_PROVIDER == "fcm_legacy":
        return await _send_fcm_legacy_push(push_token, title, message)
    if settings.APP_ENV != "production":
        return _development_reference(push_token, title, message)
    raise RuntimeError("Push delivery is disabled. Configure PUSH_PROVIDER for production use.")
