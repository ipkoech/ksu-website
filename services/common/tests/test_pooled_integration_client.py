import asyncio
import importlib

import httpx
import pytest
from ksu_common.internal_client import (
    PooledIntegrationClient,
    close_integration_pool,
    get_integration_pool,
    internal_headers,
)
from ksu_common.observability import Metrics
from ksu_common.reliability import (
    CircuitBreaker,
    CircuitOpenError,
    RetryPolicy,
    TimeoutConfig,
)


@pytest.mark.asyncio
async def test_pool_reuses_a_client_per_target_and_closes_clients() -> None:
    calls: list[httpx.Request] = []

    async def handler(request: httpx.Request) -> httpx.Response:
        calls.append(request)
        return httpx.Response(200, json={"ok": True})

    pool = PooledIntegrationClient(
        timeout=TimeoutConfig(total=2, maximum=3),
        transport=httpx.MockTransport(handler),
    )

    first = await pool.request("research", "https://research.example", "GET", "/health")
    second = await pool.request("research", "https://research.example", "GET", "/health")

    assert first.status_code == second.status_code == 200
    assert pool.client_count == 1
    client = pool.client_for("research")
    assert client is not None and not client.is_closed

    await pool.aclose()

    assert client.is_closed
    with pytest.raises(RuntimeError, match="closed"):
        await pool.request("research", "https://research.example", "GET", "/health")
    assert len(calls) == 2


@pytest.mark.asyncio
async def test_pool_applies_timeout_correlation_and_internal_auth() -> None:
    received: dict[str, str] = {}

    async def handler(request: httpx.Request) -> httpx.Response:
        received.update(request.headers)
        return httpx.Response(204)

    pool = PooledIntegrationClient(
        timeout=TimeoutConfig(total=2, maximum=3),
        transport=httpx.MockTransport(handler),
    )

    response = await pool.request_internal(
        "research",
        "https://research.example",
        "GET",
        "/private",
        api_key="secret-key",
        request_id="request-123",
        correlation_id="correlation-456",
    )

    assert response.status_code == 204
    assert received["x-internal-key"] == "secret-key"
    assert received["x-request-id"] == "request-123"
    assert received["x-correlation-id"] == "correlation-456"
    client = pool.client_for("research")
    assert client is not None
    assert client.timeout.read == 2
    await pool.aclose()


@pytest.mark.asyncio
async def test_pool_fails_closed_when_internal_auth_is_missing() -> None:
    pool = PooledIntegrationClient()

    with pytest.raises(RuntimeError, match="authentication"):
        await pool.request_internal(
            "research", "https://research.example", "GET", "/private", api_key=None
        )

    assert pool.client_count == 0
    await pool.aclose()


@pytest.mark.asyncio
async def test_pool_retries_only_idempotent_requests_or_idempotency_key() -> None:
    attempts: dict[str, int] = {"GET": 0, "POST": 0, "POST-key": 0}

    async def handler(request: httpx.Request) -> httpx.Response:
        key = "POST-key" if request.method == "POST" and "idempotency-key" in request.headers else request.method
        attempts[key] += 1
        return httpx.Response(503 if attempts[key] == 1 else 200)

    policy = RetryPolicy(
        attempts=2,
        initial_delay=0,
        max_delay=0,
        retry_statuses=frozenset({503}),
    )
    pool = PooledIntegrationClient(
        retry_policy=policy,
        transport=httpx.MockTransport(handler),
        sleep=lambda _delay: _no_sleep(),
    )

    assert (await pool.request("research", "https://research.example", "GET", "/safe")).status_code == 200
    assert (await pool.request("research", "https://research.example", "POST", "/unsafe")).status_code == 503
    assert (
        await pool.request(
            "research",
            "https://research.example",
            "POST",
            "/idempotent",
            headers={"Idempotency-Key": "request-1"},
        )
    ).status_code == 200

    assert attempts == {"GET": 2, "POST": 1, "POST-key": 2}
    await pool.aclose()


async def _no_sleep() -> None:
    return None


@pytest.mark.asyncio
async def test_pool_opens_circuit_and_emits_structured_failure_metrics() -> None:
    metrics: list[tuple[str, int, dict[str, str]]] = []

    class Sink:
        def increment(self, name: str, value: int, *, tags: dict[str, str]) -> None:
            metrics.append((name, value, tags))

        def observe_latency(self, _name: str, _duration: float, *, tags: dict[str, str]) -> None:
            return None

    async def handler(_request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("offline")

    pool = PooledIntegrationClient(
        metrics=Metrics(Sink()),
        retry_policy=RetryPolicy(attempts=1),
        circuit_breakers={
            "research": CircuitBreaker(
                failure_threshold=1,
                failure_exceptions=(httpx.ConnectError,),
            )
        },
        transport=httpx.MockTransport(handler),
    )

    with pytest.raises(httpx.ConnectError):
        await pool.request("research", "https://research.example", "GET", "/health")
    with pytest.raises(CircuitOpenError):
        await pool.request("research", "https://research.example", "GET", "/health")

    assert metrics == [
        (
            "integration.request.failure",
            1,
            {
                "integration": "research",
                "method": "GET",
                "status": "exception",
                "reason": "ConnectError",
            },
        ),
        (
            "integration.request.failure",
            1,
            {
                "integration": "research",
                "method": "GET",
                "status": "circuit_open",
                "reason": "CircuitOpenError",
            },
        ),
    ]
    await pool.aclose()


@pytest.mark.asyncio
@pytest.mark.parametrize("request_method", ["request_internal", "request_authenticated"])
async def test_target_bound_requests_reject_absolute_urls(request_method: str) -> None:
    calls = 0

    async def handler(_request: httpx.Request) -> httpx.Response:
        nonlocal calls
        calls += 1
        return httpx.Response(200)

    pool = PooledIntegrationClient(transport=httpx.MockTransport(handler))
    method = getattr(pool, request_method)
    kwargs = (
        {"api_key": "internal-key"}
        if request_method == "request_internal"
        else {"auth_headers": {"Authorization": "Bearer service-token"}}
    )

    with pytest.raises(ValueError, match="relative URL"):
        await method(
            "research",
            "https://research.example",
            "GET",
            "https://untrusted.example/private",
            **kwargs,
        )

    assert calls == 0
    await pool.aclose()


@pytest.mark.asyncio
async def test_authenticated_requests_require_recognized_nonblank_credentials() -> None:
    pool = PooledIntegrationClient()

    with pytest.raises(RuntimeError, match="recognized authentication"):
        await pool.request_authenticated(
            "research",
            "https://research.example",
            "GET",
            "/private",
            auth_headers={"X-Request-ID": "request-123"},
        )
    with pytest.raises(RuntimeError, match="recognized authentication"):
        await pool.request_authenticated(
            "research",
            "https://research.example",
            "GET",
            "/private",
            auth_headers={"Authorization": "   "},
        )

    assert internal_headers("  internal-key  ") == {"X-Internal-Key": "internal-key"}
    await pool.aclose()


@pytest.mark.asyncio
async def test_terminal_retryable_status_opens_circuit() -> None:
    calls = 0

    async def handler(_request: httpx.Request) -> httpx.Response:
        nonlocal calls
        calls += 1
        return httpx.Response(503)

    pool = PooledIntegrationClient(
        retry_policy=RetryPolicy(attempts=1, retry_statuses=frozenset({503})),
        circuit_breakers={"research": CircuitBreaker(failure_threshold=1)},
        transport=httpx.MockTransport(handler),
    )

    assert (
        await pool.request("research", "https://research.example", "GET", "/health")
    ).status_code == 503
    with pytest.raises(CircuitOpenError):
        await pool.request("research", "https://research.example", "GET", "/health")

    assert calls == 1
    await pool.aclose()


@pytest.mark.asyncio
async def test_blank_idempotency_key_does_not_enable_post_retries() -> None:
    calls = 0

    async def handler(_request: httpx.Request) -> httpx.Response:
        nonlocal calls
        calls += 1
        return httpx.Response(503)

    pool = PooledIntegrationClient(
        retry_policy=RetryPolicy(
            attempts=2,
            initial_delay=0,
            max_delay=0,
            retry_statuses=frozenset({503}),
        ),
        transport=httpx.MockTransport(handler),
        sleep=lambda _delay: _no_sleep(),
    )

    response = await pool.request(
        "research",
        "https://research.example",
        "POST",
        "/mutate",
        headers={"Idempotency-Key": "   "},
    )

    assert response.status_code == 503
    assert calls == 1
    await pool.aclose()


@pytest.mark.asyncio
async def test_pool_reserves_correlation_headers_from_callers() -> None:
    received: dict[str, str] = {}

    async def handler(request: httpx.Request) -> httpx.Response:
        received.update(request.headers)
        return httpx.Response(200)

    pool = PooledIntegrationClient(transport=httpx.MockTransport(handler))
    await pool.request(
        "research",
        "https://research.example",
        "GET",
        "/health",
        headers={"X-Request-ID": "forged", "X-Correlation-ID": "forged"},
        request_id="request-123",
        correlation_id="correlation-456",
    )

    assert received["x-request-id"] == "request-123"
    assert received["x-correlation-id"] == "correlation-456"
    await pool.aclose()


@pytest.mark.asyncio
async def test_pool_drains_active_requests_before_closing() -> None:
    started = asyncio.Event()
    release = asyncio.Event()

    async def handler(_request: httpx.Request) -> httpx.Response:
        started.set()
        await release.wait()
        return httpx.Response(200)

    pool = PooledIntegrationClient(transport=httpx.MockTransport(handler))
    active_request = asyncio.create_task(
        pool.request("research", "https://research.example", "GET", "/slow")
    )
    await started.wait()
    closing = asyncio.create_task(pool.aclose())
    await asyncio.sleep(0)

    with pytest.raises(RuntimeError, match="closing"):
        await pool.request("research", "https://research.example", "GET", "/new")

    release.set()
    assert (await active_request).status_code == 200
    await closing
    assert pool.client_count == 0


@pytest.mark.asyncio
async def test_pool_enforces_total_timeout_across_retries_and_backoff() -> None:
    clock = [0.0]
    calls = 0

    async def handler(_request: httpx.Request) -> httpx.Response:
        nonlocal calls
        calls += 1
        return httpx.Response(503)

    async def advance_clock(delay: float) -> None:
        clock[0] += delay

    pool = PooledIntegrationClient(
        timeout=TimeoutConfig(total=1, maximum=2),
        retry_policy=RetryPolicy(
            attempts=3,
            initial_delay=0.6,
            max_delay=0.6,
            jitter_ratio=0,
            retry_statuses=frozenset({503}),
        ),
        transport=httpx.MockTransport(handler),
        sleep=advance_clock,
        clock=lambda: clock[0],
    )

    with pytest.raises(httpx.TimeoutException, match="budget"):
        await pool.request("research", "https://research.example", "GET", "/health")

    assert calls == 2
    assert clock[0] == 0.6
    await pool.aclose()


@pytest.mark.asyncio
async def test_process_local_integration_pool_is_recreated_after_close() -> None:
    module = importlib.import_module("ksu_common.internal_client")
    await close_integration_pool()

    first = get_integration_pool()
    assert get_integration_pool() is first
    await close_integration_pool()

    second = get_integration_pool()
    assert second is not first
    assert module.get_integration_pool() is second
    await close_integration_pool()
