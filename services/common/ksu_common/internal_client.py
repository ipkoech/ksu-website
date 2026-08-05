"""Authenticated HTTP helpers for service-to-service calls."""

from __future__ import annotations

import hmac
from collections.abc import AsyncIterator, Callable
from contextlib import asynccontextmanager

import httpx
from fastapi import Header, HTTPException, status

INTERNAL_KEY_HEADER = "X-Internal-Key"
LEGACY_INTERNAL_KEY_HEADER = "X-Internal-API-Key"
DEFAULT_TIMEOUT_SECONDS = 5.0


def internal_headers(api_key: str | None) -> dict[str, str]:
    """Return the canonical header or fail closed when no key is configured."""
    if not api_key:
        raise RuntimeError(
            "Internal service authentication is not configured; refusing an unauthenticated request"
        )
    return {INTERNAL_KEY_HEADER: api_key}


def internal_key_guard(
    expected: Callable[[], str | None],
    *,
    allow_legacy_header: bool = True,
) -> Callable[..., object]:
    """Create a FastAPI dependency for constant-time internal-key validation."""

    async def _dependency(
        canonical: str | None = Header(default=None, alias=INTERNAL_KEY_HEADER),
        legacy: str | None = Header(default=None, alias=LEGACY_INTERNAL_KEY_HEADER),
    ) -> None:
        configured = expected()
        candidates = [canonical]
        if allow_legacy_header:
            candidates.append(legacy)
        if configured and any(candidate and hmac.compare_digest(candidate, configured) for candidate in candidates):
            return
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid internal key")

    return _dependency


@asynccontextmanager
async def internal_client(
    base_url: str,
    api_key: str | None,
    *,
    timeout: float = DEFAULT_TIMEOUT_SECONDS,
) -> AsyncIterator[httpx.AsyncClient]:
    """Yield an HTTP client with a mandatory internal authentication header."""
    async with httpx.AsyncClient(
        base_url=base_url.rstrip("/"),
        headers=internal_headers(api_key),
        timeout=timeout,
    ) as client:
        yield client
