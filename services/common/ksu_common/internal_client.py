"""Service-to-service authentication and HTTP client helpers.

Every KSU service both calls and serves internal endpoints. Before this module each
service hand-rolled the header name, the comparison and the client construction,
which drifted into three spellings of the same header and two status codes. Senders
use :func:`internal_headers` or :func:`internal_client`; receivers use
:func:`internal_key_guard`.
"""

from __future__ import annotations

import hmac
from collections.abc import AsyncIterator, Callable
from contextlib import asynccontextmanager

import httpx
from fastapi import Header, HTTPException, status

#: The canonical header carrying the shared internal API key.
INTERNAL_KEY_HEADER = "X-Internal-Key"

#: Accepted during migration only. Remove once every caller sends the canonical
#: header — research and library previously verified this spelling instead.
LEGACY_INTERNAL_KEY_HEADER = "X-Internal-API-Key"

DEFAULT_TIMEOUT_SECONDS = 5.0


def internal_headers(api_key: str | None) -> dict[str, str]:
    """Build auth headers for an internal call.

    Raises when the key is missing rather than returning an empty mapping, so a
    misconfigured service fails loudly instead of silently calling unauthenticated.
    """
    if not api_key:
        raise RuntimeError(
            "INTERNAL_API_KEY is not configured; refusing to make an unauthenticated "
            "service-to-service request"
        )
    return {INTERNAL_KEY_HEADER: api_key}


def internal_key_guard(
    expected: Callable[[], str | None],
    *,
    allow_legacy_header: bool = True,
) -> Callable[..., object]:
    """FastAPI dependency verifying the internal API key.

    ``expected`` is a callable so the key is read per request and settings can be
    reloaded in tests. Comparison is constant-time, and a missing or unconfigured
    expected key denies the request.
    """

    async def _dependency(
        canonical: str | None = Header(default=None, alias=INTERNAL_KEY_HEADER),
        legacy: str | None = Header(default=None, alias=LEGACY_INTERNAL_KEY_HEADER),
    ) -> None:
        denied = HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid internal key",
        )

        configured = expected()
        if not configured:
            raise denied

        candidates = [canonical]
        if allow_legacy_header:
            candidates.append(legacy)

        for candidate in candidates:
            if candidate and hmac.compare_digest(candidate, configured):
                return

        raise denied

    return _dependency


@asynccontextmanager
async def internal_client(
    base_url: str,
    api_key: str | None,
    *,
    timeout: float = DEFAULT_TIMEOUT_SECONDS,
) -> AsyncIterator[httpx.AsyncClient]:
    """An httpx client pre-configured for internal calls to another KSU service."""
    async with httpx.AsyncClient(
        base_url=base_url.rstrip("/"),
        headers=internal_headers(api_key),
        timeout=timeout,
    ) as client:
        yield client
