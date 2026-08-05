"""SMS delivery helpers."""

from __future__ import annotations

import base64
import hashlib
from urllib.parse import urlsplit

from ksu_common.internal_client import get_integration_pool

from ..core.config import get_settings


def _development_reference(phone_number: str, message: str) -> str:
    digest = hashlib.sha256(f"{phone_number}:{message}".encode()).hexdigest()[:16]
    return f"dev-sms:{digest}"


def _webhook_target(url: str) -> tuple[str, str]:
    parsed = urlsplit(url)
    target = parsed.path or "/"
    if parsed.query:
        target = f"{target}?{parsed.query}"
    return f"{parsed.scheme}://{parsed.netloc}", target


async def _send_webhook_sms(phone_number: str, message: str) -> str:
    settings = get_settings()
    if not settings.SMS_WEBHOOK_URL:
        raise RuntimeError("SMS_WEBHOOK_URL is required when SMS_PROVIDER=webhook")

    headers = {}
    if settings.SMS_WEBHOOK_TOKEN:
        headers["Authorization"] = f"Bearer {settings.SMS_WEBHOOK_TOKEN}"

    base_url, target = _webhook_target(settings.SMS_WEBHOOK_URL)
    pool = get_integration_pool()
    if headers:
        response = await pool.request_authenticated(
            "sms-webhook",
            base_url,
            "POST",
            target,
            auth_headers=headers,
            json={"to": phone_number, "message": message},
        )
    else:
        response = await pool.request(
            "sms-webhook",
            base_url,
            "POST",
            target,
            json={"to": phone_number, "message": message},
        )
    response.raise_for_status()
    payload = response.json() if response.content else {}
    return str(
        payload.get("id")
        or payload.get("message_id")
        or payload.get("reference")
        or response.headers.get("x-request-id")
        or "webhook-sms:sent"
    )


async def _send_twilio_sms(phone_number: str, message: str) -> str:
    settings = get_settings()
    missing = [
        name
        for name, value in {
            "TWILIO_ACCOUNT_SID": settings.TWILIO_ACCOUNT_SID,
            "TWILIO_AUTH_TOKEN": settings.TWILIO_AUTH_TOKEN,
            "TWILIO_FROM_NUMBER": settings.TWILIO_FROM_NUMBER,
        }.items()
        if not value
    ]
    if missing:
        raise RuntimeError(f"Missing Twilio SMS settings: {', '.join(missing)}")

    auth = base64.b64encode(
        f"{settings.TWILIO_ACCOUNT_SID}:{settings.TWILIO_AUTH_TOKEN}".encode()
    ).decode("ascii")
    response = await get_integration_pool().request_authenticated(
        "twilio-sms",
        "https://api.twilio.com",
        "POST",
        f"/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}/Messages.json",
        auth_headers={"Authorization": f"Basic {auth}"},
        data={"To": phone_number, "From": settings.TWILIO_FROM_NUMBER, "Body": message},
    )
    response.raise_for_status()
    payload = response.json()
    return str(payload.get("sid") or "twilio-sms:sent")


async def send_sms(phone_number: str, message: str) -> str:
    """Send an SMS and return a provider reference."""
    settings = get_settings()
    if settings.SMS_PROVIDER == "webhook":
        return await _send_webhook_sms(phone_number, message)
    if settings.SMS_PROVIDER == "twilio":
        return await _send_twilio_sms(phone_number, message)
    if settings.APP_ENV != "production":
        return _development_reference(phone_number, message)
    raise RuntimeError(
        "SMS delivery is disabled. Configure SMS_PROVIDER for production use."
    )
