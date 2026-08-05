"""Authenticated HTTP helpers for service-to-service calls."""

from __future__ import annotations

import hmac
from collections.abc import AsyncIterator, Callable, Mapping
from contextlib import asynccontextmanager
from typing import Any

import httpx
from fastapi import Header, HTTPException, status

from .observability import correlation_headers

INTERNAL_KEY_HEADER = "X-Internal-Key"
LEGACY_INTERNAL_KEY_HEADER = "X-Internal-API-Key"
DEFAULT_TIMEOUT_SECONDS = 5.0


def _client_timeout(
    timeout: float | httpx.Timeout,
    connect_timeout: float | None,
) -> httpx.Timeout:
    if isinstance(timeout, httpx.Timeout):
        return timeout
    return httpx.Timeout(timeout, connect=connect_timeout or timeout)


def create_outbound_client(
    *,
    base_url: str | None = None,
    timeout: float | httpx.Timeout = DEFAULT_TIMEOUT_SECONDS,
    connect_timeout: float | None = None,
    headers: Mapping[str, str] | None = None,
    request_id: str | None = None,
    correlation_id: str | None = None,
    follow_redirects: bool = False,
    **client_options: Any,
) -> httpx.AsyncClient:
    """Create a bounded client with automatic request correlation."""

    resolved_headers = correlation_headers(
        request_id=request_id,
        correlation_id=correlation_id,
    )
    resolved_headers.update(headers or {})
    options: dict[str, Any] = {
        "headers": resolved_headers,
        "timeout": _client_timeout(timeout, connect_timeout),
        "follow_redirects": follow_redirects,
        **client_options,
    }
    if base_url is not None:
        options["base_url"] = base_url.rstrip("/")
    return httpx.AsyncClient(**options)


@asynccontextmanager
async def outbound_client(
    *,
    base_url: str | None = None,
    timeout: float | httpx.Timeout = DEFAULT_TIMEOUT_SECONDS,
    connect_timeout: float | None = None,
    headers: Mapping[str, str] | None = None,
    request_id: str | None = None,
    correlation_id: str | None = None,
    follow_redirects: bool = False,
    **client_options: Any,
) -> AsyncIterator[httpx.AsyncClient]:
    """Yield a bounded outbound client and close it after the operation."""

    async with create_outbound_client(
        base_url=base_url,
        timeout=timeout,
        connect_timeout=connect_timeout,
        headers=headers,
        request_id=request_id,
        correlation_id=correlation_id,
        follow_redirects=follow_redirects,
        **client_options,
    ) as client:
        yield client


@asynccontextmanager
async def authenticated_client(
    base_url: str,
    *,
    auth_headers: Mapping[str, str],
    timeout: float | httpx.Timeout = DEFAULT_TIMEOUT_SECONDS,
    connect_timeout: float | None = None,
    headers: Mapping[str, str] | None = None,
    **client_options: Any,
) -> AsyncIterator[httpx.AsyncClient]:
    """Yield a bounded client that fails closed without authentication headers."""

    if not auth_headers:
        raise RuntimeError("outbound authentication headers are required")
    resolved_headers = dict(headers or {})
    resolved_headers.update(auth_headers)
    async with outbound_client(
        base_url=base_url,
        timeout=timeout,
        connect_timeout=connect_timeout,
        headers=resolved_headers,
        **client_options,
    ) as client:
        yield client


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
    timeout: float | httpx.Timeout = DEFAULT_TIMEOUT_SECONDS,
    connect_timeout: float | None = None,
    headers: Mapping[str, str] | None = None,
) -> AsyncIterator[httpx.AsyncClient]:
    """Yield an HTTP client with a mandatory internal authentication header."""
    async with authenticated_client(
        base_url,
        auth_headers=internal_headers(api_key),
        headers=headers,
        timeout=timeout,
        connect_timeout=connect_timeout,
    ) as client:
        yield client
