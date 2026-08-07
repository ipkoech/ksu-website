"""Small, injectable reliability primitives for service adapters.

The module deliberately does not perform I/O.  Callers provide operations,
clocks, randomness, sleeping, and durable idempotency stores where needed.
"""

from __future__ import annotations

import asyncio
import copy
import math
import time
from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from typing import Any, Protocol, TypeVar

T = TypeVar("T")


def _require_finite(value: float, name: str) -> None:
    if not math.isfinite(value):
        raise ValueError(f"{name} must be finite")


@dataclass(frozen=True, slots=True)
class TimeoutConfig:
    """A bounded total timeout that transport adapters can translate as needed."""

    total: float = 5.0
    maximum: float = 30.0

    def __post_init__(self) -> None:
        _require_finite(self.total, "total")
        _require_finite(self.maximum, "maximum")
        if self.maximum <= 0:
            raise ValueError("maximum must be positive")
        if not 0 < self.total <= self.maximum:
            raise ValueError("total must be between zero and maximum")


@dataclass(frozen=True, slots=True)
class RetryPolicy:
    """Retry only explicitly identified transient failures."""

    attempts: int = 3
    initial_delay: float = 0.1
    max_delay: float = 2.0
    jitter_ratio: float = 0.1
    retry_exceptions: tuple[type[Exception], ...] = (TimeoutError, ConnectionError)
    retry_statuses: frozenset[int] = frozenset()

    def __post_init__(self) -> None:
        _require_finite(self.initial_delay, "initial_delay")
        _require_finite(self.max_delay, "max_delay")
        _require_finite(self.jitter_ratio, "jitter_ratio")
        if self.attempts < 1:
            raise ValueError("attempts must be at least one")
        if self.initial_delay < 0 or self.max_delay < 0:
            raise ValueError("retry delays cannot be negative")
        if self.initial_delay > self.max_delay:
            raise ValueError("initial_delay cannot exceed max_delay")
        if not 0 <= self.jitter_ratio <= 1:
            raise ValueError("jitter_ratio must be between zero and one")

    def delay_for(self, retry_number: int, random_value: float) -> float:
        """Return a bounded exponential delay for a one-based retry number."""
        base = min(self.max_delay, self.initial_delay * (2 ** (retry_number - 1)))
        jitter = base * self.jitter_ratio * ((2 * min(1.0, max(0.0, random_value))) - 1)
        return min(self.max_delay, max(0.0, base + jitter))




class CircuitOpenError(RuntimeError):
    """Raised before an operation when the circuit is currently open."""

    def __init__(self, retry_after: float) -> None:
        self.retry_after = retry_after
        super().__init__("circuit breaker is open")


class CircuitBreaker:
    """A compact circuit breaker with one half-open probe at a time."""

    def __init__(
        self,
        *,
        failure_threshold: int = 5,
        recovery_timeout: float = 30.0,
        failure_exceptions: tuple[type[Exception], ...] = (TimeoutError, ConnectionError),
        clock: Callable[[], float] = time.monotonic,
    ) -> None:
        if failure_threshold < 1:
            raise ValueError("failure_threshold must be at least one")
        _require_finite(recovery_timeout, "recovery_timeout")
        if recovery_timeout <= 0:
            raise ValueError("recovery_timeout must be positive")
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_exceptions = failure_exceptions
        self._clock = clock
        self._state = "closed"
        self._failures = 0
        self._opened_at: float | None = None
        self._half_open_in_flight = False
        self._lock = asyncio.Lock()

    @property
    def state(self) -> str:
        return self._state

    async def _allow_call(self) -> bool:
        async with self._lock:
            if self._state == "open":
                assert self._opened_at is not None
                elapsed = self._clock() - self._opened_at
                if elapsed < self.recovery_timeout:
                    raise CircuitOpenError(self.recovery_timeout - elapsed)
                self._state = "half_open"
            if self._state == "half_open":
                if self._half_open_in_flight:
                    raise CircuitOpenError(self.recovery_timeout)
                self._half_open_in_flight = True
                return True
        return False

    async def _release_half_open_probe(self) -> None:
        async with self._lock:
            if self._state == "half_open":
                self._half_open_in_flight = False

    async def _succeed(self) -> None:
        async with self._lock:
            self._state = "closed"
            self._failures = 0
            self._opened_at = None
            self._half_open_in_flight = False

    async def _fail(self) -> None:
        async with self._lock:
            self._half_open_in_flight = False
            self._failures += 1
            if self._state == "half_open" or self._failures >= self.failure_threshold:
                self._state = "open"
                self._opened_at = self._clock()

    async def call(self, operation: Callable[[], Awaitable[T]]) -> T:
        half_open_probe = await self._allow_call()
        try:
            result = await operation()
        except self.failure_exceptions:
            await self._fail()
            raise
        else:
            await self._succeed()
            return result
        finally:
            if half_open_probe:
                await self._release_half_open_probe()


@dataclass(frozen=True, slots=True)
class IdempotencyState:
    """The state and optional completed response for an idempotency key."""

    status: str
    response: Any = None

    @classmethod
    def pending(cls) -> IdempotencyState:
        return cls("pending")

    @classmethod
    def completed(cls, response: Any) -> IdempotencyState:
        return cls("completed", response)


class IdempotencyAlreadyCompletedError(RuntimeError):
    """Raised when a caller attempts to replace a completed response."""


class IdempotencyStore(Protocol):
    """Injectable durable-store contract for idempotent request handling."""

    async def claim(self, key: str) -> bool: ...

    async def get(self, key: str) -> IdempotencyState | None: ...

    async def complete(self, key: str, response: Any) -> None: ...


class InMemoryIdempotencyStore:
    """Lock-protected in-memory store for tests and local development only."""

    def __init__(self) -> None:
        self._entries: dict[str, IdempotencyState] = {}
        self._lock = asyncio.Lock()

    async def claim(self, key: str) -> bool:
        async with self._lock:
            if key in self._entries:
                return False
            self._entries[key] = IdempotencyState.pending()
            return True

    async def get(self, key: str) -> IdempotencyState | None:
        async with self._lock:
            state = self._entries.get(key)
            return copy.deepcopy(state) if state else None

    async def complete(self, key: str, response: Any) -> None:
        async with self._lock:
            state = self._entries.get(key)
            if state is None:
                raise KeyError("idempotency key must be claimed before completion")
            if state.status == "completed":
                raise IdempotencyAlreadyCompletedError("idempotency key is already completed")
            if state.status != "pending":
                raise RuntimeError("idempotency key is not pending")
            self._entries[key] = IdempotencyState.completed(copy.deepcopy(response))
