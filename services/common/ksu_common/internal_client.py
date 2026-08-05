"""Authenticated HTTP helpers for service-to-service calls."""

from __future__ import annotations

import asyncio
import hmac
import random
from collections.abc import AsyncIterator, Awaitable, Callable, Mapping
from contextlib import asynccontextmanager
from dataclasses import replace
from typing import Any, Self

import httpx
from fastapi import Header, HTTPException, status

from .observability import Metrics, correlation_headers
from .reliability import CircuitBreaker, RetryPolicy, TimeoutConfig, retry_async

INTERNAL_KEY_HEADER = "X-Internal-Key"
LEGACY_INTERNAL_KEY_HEADER = "X-Internal-API-Key"
DEFAULT_TIMEOUT_SECONDS = 5.0
_RETRYABLE_STATUS_CODES = frozenset({408, 429, 500, 502, 503, 504})
_RETRYABLE_METHODS = frozenset({"GET", "HEAD", "OPTIONS", "TRACE", "PUT", "DELETE"})


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

    resolved_headers = dict(headers or {})
    resolved_headers.update(_require_auth_headers(auth_headers))
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


def _require_auth_headers(auth_headers: Mapping[str, str]) -> dict[str, str]:
    """Copy required auth headers, rejecting empty credentials early."""

    resolved = {str(key): str(value) for key, value in auth_headers.items() if value}
    if not resolved:
        raise RuntimeError("outbound authentication headers are required")
    return resolved


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


class PooledIntegrationClient:
    """Reusable, explicit-lifecycle client pool for outbound integrations.

    The pool knows only transport concerns.  Services retain responsibility for
    provider credentials, resource paths, payloads, and business decisions.
    """

    def __init__(
        self,
        *,
        timeout: TimeoutConfig | None = None,
        retry_policy: RetryPolicy | None = None,
        metrics: Metrics | None = None,
        circuit_breakers: Mapping[str, CircuitBreaker] | None = None,
        circuit_breaker_factory: Callable[[str], CircuitBreaker] | None = None,
        sleep: Callable[[float], Awaitable[None]] = asyncio.sleep,
        random_value: Callable[[], float] = random.random,
        **client_options: Any,
    ) -> None:
        self._timeout = timeout or TimeoutConfig()
        self._retry_policy = retry_policy or RetryPolicy(
            retry_exceptions=(httpx.TimeoutException, httpx.NetworkError),
            retry_statuses=_RETRYABLE_STATUS_CODES,
        )
        self._metrics = metrics or Metrics()
        self._breakers = dict(circuit_breakers or {})
        self._breaker_factory = circuit_breaker_factory or self._default_breaker
        self._sleep = sleep
        self._random_value = random_value
        self._client_options = client_options
        self._clients: dict[str, httpx.AsyncClient] = {}
        self._target_urls: dict[str, str] = {}
        self._lock = asyncio.Lock()
        self._closed = False

    @staticmethod
    def _default_breaker(_integration: str) -> CircuitBreaker:
        return CircuitBreaker(
            failure_exceptions=(httpx.TimeoutException, httpx.NetworkError),
        )

    @property
    def client_count(self) -> int:
        """Number of live per-integration clients held by this pool."""

        return len(self._clients)

    def client_for(self, integration: str) -> httpx.AsyncClient | None:
        """Return a pooled client for inspection; callers must not close it."""

        return self._clients.get(integration)

    async def __aenter__(self) -> Self:
        return self

    async def __aexit__(self, *_args: object) -> None:
        await self.aclose()

    async def aclose(self) -> None:
        """Close all pooled connections. The pool cannot be reused afterwards."""

        async with self._lock:
            if self._closed:
                return
            self._closed = True
            clients = list(self._clients.values())
            self._clients.clear()
            self._target_urls.clear()
        await asyncio.gather(*(client.aclose() for client in clients))

    async def request_internal(
        self,
        integration: str,
        base_url: str,
        method: str,
        url: str,
        *,
        api_key: str | None,
        headers: Mapping[str, str] | None = None,
        **request_options: Any,
    ) -> httpx.Response:
        """Send an internal request with the mandatory canonical key header."""

        resolved_headers = dict(headers or {})
        resolved_headers.update(internal_headers(api_key))
        return await self.request_authenticated(
            integration,
            base_url,
            method,
            url,
            auth_headers=resolved_headers,
            **request_options,
        )

    async def request_authenticated(
        self,
        integration: str,
        base_url: str,
        method: str,
        url: str,
        *,
        auth_headers: Mapping[str, str],
        headers: Mapping[str, str] | None = None,
        **request_options: Any,
    ) -> httpx.Response:
        """Send an authenticated request, refusing an empty auth configuration."""

        resolved_headers = dict(headers or {})
        resolved_headers.update(_require_auth_headers(auth_headers))
        return await self.request(
            integration,
            base_url,
            method,
            url,
            headers=resolved_headers,
            **request_options,
        )

    async def request(
        self,
        integration: str,
        base_url: str,
        method: str,
        url: str,
        *,
        headers: Mapping[str, str] | None = None,
        request_id: str | None = None,
        correlation_id: str | None = None,
        retry_policy: RetryPolicy | None = None,
        **request_options: Any,
    ) -> httpx.Response:
        """Send one outbound request with safe retry and circuit-breaker policy."""

        normalized_method = method.upper()
        resolved_headers = correlation_headers(
            request_id=request_id,
            correlation_id=correlation_id,
        )
        resolved_headers.update(headers or {})
        policy = self._policy_for_request(normalized_method, resolved_headers, retry_policy)
        client = await self._client_for(integration, base_url)
        breaker = self._breakers.setdefault(integration, self._breaker_factory(integration))

        async def send() -> httpx.Response:
            return await client.request(
                normalized_method,
                url,
                headers=resolved_headers,
                **request_options,
            )

        try:
            response = await breaker.call(
                lambda: retry_async(
                    send,
                    policy=policy,
                    status_getter=lambda result: result.status_code,
                    sleep=self._sleep,
                    random_value=self._random_value,
                )
            )
        except Exception as exc:
            self._record_failure(
                integration,
                normalized_method,
                status="circuit_open" if type(exc).__name__ == "CircuitOpenError" else "exception",
                reason=type(exc).__name__,
            )
            raise

        if response.status_code >= 400:
            self._record_failure(
                integration,
                normalized_method,
                status=str(response.status_code),
                reason="http_status",
            )
        return response

    async def _client_for(self, integration: str, base_url: str) -> httpx.AsyncClient:
        normalized_url = base_url.rstrip("/")
        if not integration:
            raise ValueError("integration must not be empty")
        if not normalized_url:
            raise ValueError("base_url must not be empty")

        async with self._lock:
            if self._closed:
                raise RuntimeError("outbound integration pool is closed")
            existing = self._clients.get(integration)
            if existing is not None:
                if self._target_urls[integration] != normalized_url:
                    raise ValueError("an integration target cannot use multiple base URLs in one pool")
                return existing
            client = httpx.AsyncClient(
                base_url=normalized_url,
                timeout=httpx.Timeout(self._timeout.total),
                follow_redirects=False,
                **self._client_options,
            )
            self._clients[integration] = client
            self._target_urls[integration] = normalized_url
            return client

    def _policy_for_request(
        self,
        method: str,
        headers: Mapping[str, str],
        override: RetryPolicy | None,
    ) -> RetryPolicy:
        policy = override or self._retry_policy
        has_idempotency_key = bool(httpx.Headers(headers).get("Idempotency-Key"))
        if method in _RETRYABLE_METHODS or has_idempotency_key:
            return policy
        return replace(policy, attempts=1)

    def _record_failure(
        self,
        integration: str,
        method: str,
        *,
        status: str,
        reason: str,
    ) -> None:
        self._metrics.increment(
            "integration.request.failure",
            tags={
                "integration": integration,
                "method": method,
                "status": status,
                "reason": reason,
            },
        )
