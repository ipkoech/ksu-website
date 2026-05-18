"""Push notification helper stubs."""

from __future__ import annotations


async def send_push(push_token: str, title: str, message: str) -> str:
    """Send a push notification and return a provider reference."""
    return f"push:{push_token}:{abs(hash((title, message))) % 10_000_000}"
