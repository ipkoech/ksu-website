from __future__ import annotations

import pytest
from ksu_common.reliability import (
    CircuitBreaker,
    CircuitOpenError,
    IdempotencyState,
    InMemoryIdempotencyStore,
    RetryPolicy,
    TimeoutConfig,
    retry_async,
)


def test_timeout_config_rejects_values_outside_its_bound() -> None:
    with pytest.raises(ValueError, match="must be between"):
        TimeoutConfig(total=31, maximum=30)

    with pytest.raises(ValueError, match="must be between"):
        TimeoutConfig(total=0, maximum=30)


@pytest.mark.asyncio
async def test_retry_async_retries_only_configured_transient_exception() -> None:
    attempts = 0
    delays: list[float] = []

    async def operation() -> str:
        nonlocal attempts
        attempts += 1
        if attempts < 3:
            raise TimeoutError("temporary")
        return "ok"

    async def sleep(delay: float) -> None:
        delays.append(delay)

    result = await retry_async(
        operation,
        policy=RetryPolicy(
            attempts=3,
            initial_delay=0.5,
            max_delay=0.75,
            retry_exceptions=(TimeoutError,),
        ),
        sleep=sleep,
        random_value=lambda: 0.5,
    )

    assert result == "ok"
    assert attempts == 3
    assert delays == [0.5, 0.75]


@pytest.mark.asyncio
async def test_retry_async_does_not_retry_unconfigured_exception() -> None:
    attempts = 0

    async def operation() -> None:
        nonlocal attempts
        attempts += 1
        raise ValueError("permanent")

    with pytest.raises(ValueError, match="permanent"):
        await retry_async(
            operation,
            policy=RetryPolicy(attempts=3, retry_exceptions=(TimeoutError,)),
        )

    assert attempts == 1


@pytest.mark.asyncio
async def test_retry_async_retries_only_configured_response_statuses() -> None:
    statuses = iter([503, 200])
    delays: list[float] = []

    async def operation() -> int:
        return next(statuses)

    async def sleep(delay: float) -> None:
        delays.append(delay)

    result = await retry_async(
        operation,
        policy=RetryPolicy(attempts=2, retry_statuses=frozenset({503})),
        status_getter=lambda status: status,
        sleep=sleep,
        random_value=lambda: 0.5,
    )

    assert result == 200
    assert delays == [0.1]


@pytest.mark.asyncio
async def test_circuit_breaker_opens_then_recovers_after_reset_timeout() -> None:
    now = 0.0

    def clock() -> float:
        return now

    breaker = CircuitBreaker(failure_threshold=2, recovery_timeout=5, clock=clock)

    async def fail() -> None:
        raise TimeoutError("down")

    with pytest.raises(TimeoutError):
        await breaker.call(fail)
    with pytest.raises(TimeoutError):
        await breaker.call(fail)
    with pytest.raises(CircuitOpenError):
        await breaker.call(fail)

    now = 5.0

    async def succeed() -> str:
        return "recovered"

    assert await breaker.call(succeed) == "recovered"
    assert breaker.state == "closed"


@pytest.mark.asyncio
async def test_in_memory_idempotency_store_claim_get_and_complete() -> None:
    store = InMemoryIdempotencyStore()

    assert await store.claim("request-1") is True
    assert await store.claim("request-1") is False
    assert await store.get("request-1") == IdempotencyState.pending()

    await store.complete("request-1", {"resource_id": "42"})

    assert await store.get("request-1") == IdempotencyState.completed({"resource_id": "42"})


@pytest.mark.asyncio
async def test_in_memory_idempotency_store_rejects_completion_without_claim() -> None:
    store = InMemoryIdempotencyStore()

    with pytest.raises(KeyError, match="must be claimed"):
        await store.complete("unknown", {"ok": True})
