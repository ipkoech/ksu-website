"""SMS delivery helpers."""

from __future__ import annotations

import base64
import hashlib

import httpx

from ..core.config import get_settings


def _development_reference(phone_number: str, message: str) -> str:
    digest = hashlib.sha256(f"{phone_number}:{message}".encode("utf-8")).hexdigest()[:16]
    return f"dev-sms:{digest}"


async def _send_webhook_sms(phone_number: str, message: str) -> str:
    settings = get_settings()
    if not settings.SMS_WEBHOOK_URL:
        raise RuntimeError("SMS_WEBHOOK_URL is required when SMS_PROVIDER=webhook")

    headers = {}
    if settings.SMS_WEBHOOK_TOKEN:
        headers["Authorization"] = f"Bearer {settings.SMS_WEBHOOK_TOKEN}"

    async with httpx.AsyncClient(timeout=httpx.Timeout(20.0, connect=5.0)) as client:
        response = await client.post(
            settings.SMS_WEBHOOK_URL,
            json={"to": phone_number, "message": message},
            headers=headers,
        )
        response.raise_for_status()
        payload = response.json() if response.content else {}
        return str(payload.get("id") or payload.get("message_id") or payload.get("reference") or response.headers.get("x-request-id") or "webhook-sms:sent")


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

    auth = base64.b64encode(f"{settings.TWILIO_ACCOUNT_SID}:{settings.TWILIO_AUTH_TOKEN}".encode("utf-8")).decode("ascii")
    async with httpx.AsyncClient(timeout=httpx.Timeout(20.0, connect=5.0)) as client:
        response = await client.post(
            f"https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}/Messages.json",
            data={"To": phone_number, "From": settings.TWILIO_FROM_NUMBER, "Body": message},
            headers={"Authorization": f"Basic {auth}"},
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
    raise RuntimeError("SMS delivery is disabled. Configure SMS_PROVIDER for production use.")
