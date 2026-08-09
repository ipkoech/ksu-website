"""Authenticated HTTP helpers for service-to-service calls."""

from __future__ import annotations

import asyncio
import hmac
import random
import time
from collections.abc import AsyncIterator, Awaitable, Callable, Mapping
from contextlib import asynccontextmanager
from dataclasses import replace
from typing import Any, Self

import httpx
from fastapi import Header, HTTPException, status

from .observability import Metrics, correlation_headers
from .reliability import CircuitBreaker, RetryPolicy, TimeoutConfig

INTERNAL_KEY_HEADER = "X-Internal-Key"
LEGACY_INTERNAL_KEY_HEADER = "X-Internal-API-Key"
DEFAULT_TIMEOUT_SECONDS = 5.0
_RETRYABLE_STATUS_CODES = frozenset({408, 429, 500, 502, 503, 504})
_RETRYABLE_METHODS = frozenset({"GET", "HEAD", "OPTIONS", "TRACE", "PUT", "DELETE"})
_AUTHENTICATION_HEADERS = frozenset(
    {
        "authorization",
        "proxy-authorization",
        "x-internal-key",
        "x-internal-api-key",
        "x-api-key",
        "api-key",
        "x-auth-token",
        "x-access-token",
        "x-client-secret",
    }
)
_CORRELATION_HEADERS = frozenset({"x-request-id", "x-correlation-id"})


class _RetryableStatusError(Exception):
    """Turns a terminal retryable response into a circuit-breaker failure."""

    def __init__(self, response: httpx.Response) -> None:
        self.response = response
        super().__init__(f"retryable integration response: {response.status_code}")


class _TimeoutBudgetExceeded(httpx.TimeoutException):
    """Raised when retries or backoff would exceed an integration deadline."""


class IntegrationResponseTooLargeError(RuntimeError):
    """Raised after stopping an integration response at its configured byte limit."""


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

    resolved_headers = _with_reserved_correlation_headers(
        headers,
        request_id=request_id,
        correlation_id=correlation_id,
    )
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
    normalized_key = api_key.strip() if isinstance(api_key, str) else ""
    if not normalized_key:
        raise RuntimeError(
            "Internal service authentication is not configured; refusing an unauthenticated request"
        )
    return {INTERNAL_KEY_HEADER: normalized_key}


def _require_auth_headers(auth_headers: Mapping[str, str]) -> dict[str, str]:
    """Copy headers only when they contain a recognized nonblank credential."""

    resolved = {
        str(key): str(value).strip()
        for key, value in auth_headers.items()
        if str(value).strip()
    }
    if not any(key.strip().lower() in _AUTHENTICATION_HEADERS for key in resolved):
        raise RuntimeError("recognized authentication headers are required")
    return resolved


def _with_reserved_correlation_headers(
    headers: Mapping[str, str] | None,
    *,
    request_id: str | None,
    correlation_id: str | None,
) -> dict[str, str]:
    """Apply trusted correlation context after discarding caller-supplied IDs."""

    resolved = {
        str(key): str(value)
        for key, value in (headers or {}).items()
        if str(key).lower() not in _CORRELATION_HEADERS
    }
    resolved.update(correlation_headers(request_id=request_id, correlation_id=correlation_id))
    return resolved


def _require_relative_target(url: str) -> None:
    """Prevent target-bound authentication from being redirected to another origin."""

    parsed = httpx.URL(url)
    if parsed.scheme or parsed.host or url.startswith("//"):
        raise ValueError("authenticated integration requests require a relative URL")


def _bounded_timeout(remaining: float, requested: float | httpx.Timeout | None) -> httpx.Timeout:
    """Keep optional per-request limits inside the pool's total deadline."""

    if requested is None:
        return httpx.Timeout(remaining)
    configured = httpx.Timeout(requested)

    def bounded(value: float | None) -> float:
        return remaining if value is None else min(float(value), remaining)

    return httpx.Timeout(
        connect=bounded(configured.connect),
        read=bounded(configured.read),
        write=bounded(configured.write),
        pool=bounded(configured.pool),
    )


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
        clock: Callable[[], float] = time.monotonic,
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
        self._clock = clock
        self._client_options = client_options
        self._clients: dict[str, httpx.AsyncClient] = {}
        self._target_urls: dict[str, str] = {}
        self._lock = asyncio.Lock()
        self._closed = False
        self._closing = False
        self._active_requests = 0
        self._drained = asyncio.Event()
        self._drained.set()
        self._close_task: asyncio.Task[None] | None = None

    @staticmethod
    def _default_breaker(_integration: str) -> CircuitBreaker:
        return CircuitBreaker(
            failure_exceptions=(httpx.TimeoutException, httpx.NetworkError),
        )

    @property
    def client_count(self) -> int:
        """Number of live per-integration clients held by this pool."""

        return len(self._clients)

    @property
    def is_closed(self) -> bool:
        """Whether all pooled clients have been closed permanently."""

        return self._closed

    @property
    def is_closing(self) -> bool:
        """Whether shutdown has begun and new requests are rejected."""

        return self._closing and not self._closed

    def client_for(self, integration: str) -> httpx.AsyncClient | None:
        """Return a pooled client for inspection; callers must not close it."""

        return self._clients.get(integration)

    async def __aenter__(self) -> Self:
        return self

    async def __aexit__(self, *_args: object) -> None:
        await self.aclose()

    async def aclose(self) -> None:
        """Drain active requests, then close pooled connections permanently."""

        async with self._lock:
            if self._closed:
                return
            if self._close_task is None:
                self._closing = True
                self._close_task = asyncio.create_task(self._drain_and_close())
            close_task = self._close_task

        await asyncio.shield(close_task)

    async def _drain_and_close(self) -> None:
        await self._drained.wait()
        async with self._lock:
            clients = list(self._clients.values())
            self._clients.clear()
            self._target_urls.clear()
            self._closed = True
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

        _require_relative_target(url)
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

        _require_relative_target(url)
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
        max_response_bytes: int | None = None,
        **request_options: Any,
    ) -> httpx.Response:
        """Send one outbound request with safe retry and circuit-breaker policy."""

        await self._begin_request()
        try:
            return await self._request_with_lifecycle(
                integration,
                base_url,
                method,
                url,
                headers=headers,
                request_id=request_id,
                correlation_id=correlation_id,
                retry_policy=retry_policy,
                max_response_bytes=max_response_bytes,
                **request_options,
            )
        finally:
            await self._end_request()

    async def _request_with_lifecycle(
        self,
        integration: str,
        base_url: str,
        method: str,
        url: str,
        *,
        headers: Mapping[str, str] | None,
        request_id: str | None,
        correlation_id: str | None,
        retry_policy: RetryPolicy | None,
        max_response_bytes: int | None,
        **request_options: Any,
    ) -> httpx.Response:
        normalized_method = method.upper()
        resolved_headers = _with_reserved_correlation_headers(
            headers,
            request_id=request_id,
            correlation_id=correlation_id,
        )
        policy = self._policy_for_request(normalized_method, resolved_headers, retry_policy)
        client = await self._client_for(integration, base_url)
        breaker = self._breaker_for(integration)
        deadline = self._clock() + self._timeout.total
        supplied_timeout = request_options.pop("timeout", None)

        async def send(remaining: float) -> httpx.Response:
            timeout = _bounded_timeout(remaining, supplied_timeout)
            if max_response_bytes is None:
                return await client.request(
                    normalized_method, url, headers=resolved_headers,
                    timeout=timeout, **request_options,
                )
            if max_response_bytes < 1:
                raise ValueError("max_response_bytes must be positive")
            request = client.build_request(
                normalized_method, url, headers=resolved_headers,
                timeout=timeout, **request_options,
            )
            response = await client.send(request, stream=True)
            content = bytearray()
            try:
                async for chunk in response.aiter_bytes():
                    content.extend(chunk)
                    if len(content) > max_response_bytes:
                        raise IntegrationResponseTooLargeError(
                            f"integration response exceeded {max_response_bytes} bytes"
                        )
            finally:
                await response.aclose()
            response._content = bytes(content)
            return response

        try:
            response = await breaker.call(
                lambda: self._request_with_budget(
                    send,
                    policy=policy,
                    deadline=deadline,
                )
            )
        except _RetryableStatusError as exc:
            response = exc.response
            self._record_failure(
                integration,
                normalized_method,
                status=str(response.status_code),
                reason="http_status",
            )
            return response
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

    async def _request_with_budget(
        self,
        send: Callable[[float], Awaitable[httpx.Response]],
        *,
        policy: RetryPolicy,
        deadline: float,
    ) -> httpx.Response:
        """Retry only while there is enough end-to-end time remaining."""

        for attempt in range(1, policy.attempts + 1):
            remaining = deadline - self._clock()
            if remaining <= 0:
                raise _TimeoutBudgetExceeded("integration request timeout budget exhausted")
            try:
                response = await send(remaining)
            except _TimeoutBudgetExceeded:
                raise
            except Exception as exc:
                if not isinstance(exc, policy.retry_exceptions) or attempt == policy.attempts:
                    raise
            else:
                if self._clock() > deadline:
                    raise _TimeoutBudgetExceeded("integration request timeout budget exhausted")
                if response.status_code not in policy.retry_statuses or attempt == policy.attempts:
                    if response.status_code in policy.retry_statuses:
                        raise _RetryableStatusError(response)
                    return response

            delay = policy.delay_for(attempt, self._random_value())
            if delay >= deadline - self._clock():
                raise _TimeoutBudgetExceeded("integration request timeout budget exhausted")
            await self._sleep(delay)

        raise RuntimeError("unreachable integration retry state")

    async def _begin_request(self) -> None:
        async with self._lock:
            if self._closed:
                raise RuntimeError("outbound integration pool is closed")
            if self._closing:
                raise RuntimeError("outbound integration pool is closing")
            self._active_requests += 1
            self._drained.clear()

    async def _end_request(self) -> None:
        async with self._lock:
            self._active_requests -= 1
            if self._active_requests == 0:
                self._drained.set()

    def _breaker_for(self, integration: str) -> CircuitBreaker:
        breaker = self._breakers.setdefault(integration, self._breaker_factory(integration))
        if not any(
            issubclass(_RetryableStatusError, exception)
            for exception in breaker.failure_exceptions
        ):
            breaker.failure_exceptions = (*breaker.failure_exceptions, _RetryableStatusError)
        return breaker

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
        idempotency_key = httpx.Headers(headers).get("Idempotency-Key")
        has_idempotency_key = bool(idempotency_key and idempotency_key.strip())
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


_process_integration_pool: PooledIntegrationClient | None = None


def get_integration_pool() -> PooledIntegrationClient:
    """Return the process-local pool for use from a service lifespan."""

    global _process_integration_pool
    if (
        _process_integration_pool is None
        or _process_integration_pool.is_closed
        or _process_integration_pool.is_closing
    ):
        _process_integration_pool = PooledIntegrationClient()
    return _process_integration_pool


async def close_integration_pool() -> None:
    """Close and forget the process-local integration pool during shutdown."""

    global _process_integration_pool
    pool = _process_integration_pool
    _process_integration_pool = None
    if pool is not None:
        await pool.aclose()
