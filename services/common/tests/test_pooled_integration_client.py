import httpx
import pytest
from ksu_common.internal_client import PooledIntegrationClient
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
