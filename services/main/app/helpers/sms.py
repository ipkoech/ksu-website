"""SMS delivery helper stubs."""

from __future__ import annotations


async def send_sms(phone_number: str, message: str) -> str:
    """Send an SMS and return a provider reference."""
    return f"sms:{phone_number}:{abs(hash(message)) % 10_000_000}"
