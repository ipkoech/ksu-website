"""Dependency-light async SQLAlchemy runtime shared by every service."""

from __future__ import annotations

import asyncio
import json
from collections.abc import AsyncIterator, Iterator, Mapping, Sequence
from contextlib import asynccontextmanager, contextmanager
from contextvars import ContextVar
from dataclasses import dataclass, field
from time import perf_counter
from typing import Any

from fastapi import HTTPException
from sqlalchemy import event
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from .observability import Metrics, get_prometheus_registry

_query_count: ContextVar[int | None] = ContextVar("ksu_database_query_count", default=None)
_query_budget: ContextVar[int | None] = ContextVar("ksu_database_query_budget", default=None)


@dataclass
class QueryCountObservation:
    """Bounded per-context SQL execution count for request-level inspection."""

    count: int = 0


class DatabaseConcurrencyLimitExceeded(HTTPException):
    """Raised when a route cannot acquire its process-local database slot."""

    def __init__(self) -> None:
        super().__init__(
            status_code=503,
            detail="Database concurrency limit exceeded; please retry shortly.",
        )


class QueryBudgetExceeded(HTTPException):
    """Raised before a route exceeds its configured SQL execution budget."""

    def __init__(self, max_queries: int) -> None:
        super().__init__(
            status_code=429,
            detail=f"Database query budget of {max_queries} exceeded.",
        )


@contextmanager
def query_count_context() -> Iterator[QueryCountObservation]:
    """Count SQL executions in the current async/request context."""

    token = _query_count.set(0)
    observation = QueryCountObservation()
    try:
        yield observation
    finally:
        observation.count = _query_count.get() or 0
        _query_count.reset(token)


def current_query_count() -> int:
    """Return the current scoped SQL execution count, or zero outside a scope."""

    return _query_count.get() or 0


@contextmanager
def query_budget_context(max_queries: int) -> Iterator[QueryCountObservation]:
    """Limit SQL executions while retaining the existing query-count scope.

    When a request already has a :func:`query_count_context`, the budget uses
    that counter. Otherwise it creates a short-lived counter so the primitive
    is independently usable from a FastAPI dependency or middleware.
    """
    if max_queries < 1:
        raise ValueError("max_queries must be at least 1")

    count_token = None
    if _query_count.get() is None:
        count_token = _query_count.set(0)
    budget_token = _query_budget.set(max_queries)
    observation = QueryCountObservation()
    try:
        yield observation
    finally:
        observation.count = current_query_count()
        _query_budget.reset(budget_token)
        if count_token is not None:
            _query_count.reset(count_token)


def _record_query_count() -> None:
    count = _query_count.get()
    if count is not None:
        next_count = count + 1
        max_queries = _query_budget.get()
        if max_queries is not None and next_count > max_queries:
            raise QueryBudgetExceeded(max_queries)
        _query_count.set(next_count)


@dataclass
class DatabaseRequestBudget:
    """Injectable, process-local database limits for one FastAPI route.

    Create one instance during route setup and use ``dependency`` with
    ``Depends`` or ``limit`` from middleware. Limits are intentionally local
    to the process; database connection pools remain the cross-process guard.
    """

    max_concurrency: int = 16
    max_queries: int = 100
    acquire_timeout_seconds: float = 0.1
    _semaphore: asyncio.BoundedSemaphore = field(init=False, repr=False)

    def __post_init__(self) -> None:
        if self.max_concurrency < 1:
            raise ValueError("max_concurrency must be at least 1")
        if self.max_queries < 1:
            raise ValueError("max_queries must be at least 1")
        if self.acquire_timeout_seconds < 0:
            raise ValueError("acquire_timeout_seconds must be non-negative")
        self._semaphore = asyncio.BoundedSemaphore(self.max_concurrency)

    @asynccontextmanager
    async def limit(self) -> AsyncIterator[QueryCountObservation]:
        """Acquire a route slot and enforce its query budget for this scope."""
        if self.acquire_timeout_seconds == 0:
            if self._semaphore.locked():
                raise DatabaseConcurrencyLimitExceeded()
            await self._semaphore.acquire()
        else:
            try:
                await asyncio.wait_for(
                    self._semaphore.acquire(),
                    timeout=self.acquire_timeout_seconds,
                )
            except TimeoutError as exc:
                raise DatabaseConcurrencyLimitExceeded() from exc

        try:
            with query_budget_context(self.max_queries) as observation:
                yield observation
        finally:
            self._semaphore.release()

    async def dependency(self) -> AsyncIterator[QueryCountObservation]:
        """FastAPI-compatible async-generator dependency."""
        async with self.limit() as observation:
            yield observation


@dataclass(frozen=True)
class DatabaseBudgetRule:
    """A path-prefix database budget applied before route execution."""

    path_prefix: str
    max_concurrency: int
    max_queries: int
    acquire_timeout_seconds: float = 0.1


class DatabaseBudgetRegistry:
    """Resolve explicit per-route database budgets with a safe default."""

    def __init__(
        self,
        *,
        default: DatabaseRequestBudget | None = None,
        rules: Sequence[DatabaseBudgetRule] = (),
    ) -> None:
        self.default = default or DatabaseRequestBudget()
        normalized_rules = tuple(
            DatabaseBudgetRule(
                path_prefix=rule.path_prefix.rstrip("/") or "/",
                max_concurrency=rule.max_concurrency,
                max_queries=rule.max_queries,
                acquire_timeout_seconds=rule.acquire_timeout_seconds,
            )
            for rule in rules
        )
        if len({rule.path_prefix for rule in normalized_rules}) != len(normalized_rules):
            raise ValueError("database budget path_prefix values must be unique")
        self.rules = tuple(sorted(normalized_rules, key=lambda rule: len(rule.path_prefix), reverse=True))
        self._budgets = {
            rule.path_prefix: DatabaseRequestBudget(
                max_concurrency=rule.max_concurrency,
                max_queries=rule.max_queries,
                acquire_timeout_seconds=rule.acquire_timeout_seconds,
            )
            for rule in self.rules
        }

    def for_path(self, path: str) -> DatabaseRequestBudget:
        for rule in self.rules:
            if rule.path_prefix == "/" or path == rule.path_prefix or path.startswith(
                f"{rule.path_prefix}/"
            ):
                return self._budgets[rule.path_prefix]
        return self.default

    @classmethod
    def from_environment(cls) -> "DatabaseBudgetRegistry":
        """Build route budgets from bounded JSON deployment configuration."""
        import os

        default = DatabaseRequestBudget(
            max_concurrency=int(os.getenv("DB_DEFAULT_CONCURRENCY", "8")),
            max_queries=int(os.getenv("DB_DEFAULT_QUERY_BUDGET", "40")),
        )
        raw_rules = os.getenv("DB_ROUTE_BUDGETS", "").strip()
        if not raw_rules:
            return cls(default=default)
        try:
            values = json.loads(raw_rules)
        except json.JSONDecodeError as exc:
            raise ValueError("DB_ROUTE_BUDGETS must be valid JSON") from exc
        if not isinstance(values, list):
            raise ValueError("DB_ROUTE_BUDGETS must be a JSON list")
        rules = []
        for value in values:
            if not isinstance(value, dict):
                raise ValueError("each DB_ROUTE_BUDGETS item must be an object")
            prefix = str(value.get("path_prefix", "")).strip()
            if not prefix.startswith("/"):
                raise ValueError("database budget path_prefix must be absolute")
            rules.append(
                DatabaseBudgetRule(
                    path_prefix=prefix.rstrip("/") or "/",
                    max_concurrency=int(value.get("max_concurrency", 4)),
                    max_queries=int(value.get("max_queries", 20)),
                    acquire_timeout_seconds=float(value.get("acquire_timeout_seconds", 0.1)),
                )
            )
        return cls(default=default, rules=rules)


@dataclass(frozen=True)
class DatabaseConfig:
    """Engine options supplied by a service-owned settings object."""

    url: str
    echo: bool = False
    pool_pre_ping: bool = True
    pool_size: int | None = None
    max_overflow: int | None = None
    connect_args: Mapping[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class DatabasePoolStatus:
    """Current SQLAlchemy pool saturation state when the pool exposes counters."""

    supported: bool
    size: int | None = None
    checked_out: int | None = None
    overflow: int | None = None
    utilization: float | None = None


@dataclass(frozen=True)
class DatabaseRuntime:
    """An engine, session factory, and transactional request dependency."""

    engine: AsyncEngine | object
    session_factory: Any
    metrics: Metrics = field(default_factory=Metrics)
    pool_metric_tags: Mapping[str, str] = field(default_factory=dict)
    max_overflow: int | None = None

    async def session(self) -> AsyncIterator[AsyncSession]:
        async with self.session_factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise

    def pool_status(self) -> DatabasePoolStatus:
        """Read and export pool saturation without assuming QueuePool internals exist."""

        sync_engine = getattr(self.engine, "sync_engine", None)
        pool = getattr(sync_engine, "pool", None)
        size = _pool_counter(pool, "size")
        checked_out = _pool_counter(pool, "checkedout")
        overflow = _pool_counter(pool, "overflow")
        if size is None or checked_out is None or overflow is None:
            return DatabasePoolStatus(supported=False)

        max_overflow = _pool_max_overflow(pool, configured=self.max_overflow)
        capacity = size + max_overflow if max_overflow is not None else None
        utilization = checked_out / capacity if capacity and capacity > 0 else None
        status = DatabasePoolStatus(
            supported=True,
            size=size,
            checked_out=checked_out,
            overflow=overflow,
            utilization=utilization,
        )
        self.metrics.gauge("database.pool.size", float(size), tags=self.pool_metric_tags)
        self.metrics.gauge(
            "database.pool.checked_out", float(checked_out), tags=self.pool_metric_tags
        )
        self.metrics.gauge("database.pool.overflow", float(overflow), tags=self.pool_metric_tags)
        if utilization is not None:
            self.metrics.gauge(
                "database.pool.utilization", utilization, tags=self.pool_metric_tags
            )
        return status


def _pool_counter(pool: object | None, name: str) -> int | None:
    try:
        counter = getattr(pool, name, None)
        if not callable(counter):
            return None
        return int(counter())
    except (AttributeError, NotImplementedError, RuntimeError, TypeError, ValueError):
        return None


def _pool_max_overflow(pool: object | None, *, configured: int | None) -> int | None:
    try:
        value = getattr(pool, "_max_overflow", configured)
        normalized = int(value)
        return normalized if normalized >= 0 else None
    except (AttributeError, RuntimeError, TypeError, ValueError):
        return max(0, configured or 0)


def create_database_runtime(
    config: DatabaseConfig,
    *,
    metrics: Metrics | None = None,
) -> DatabaseRuntime:
    """Create an async engine and its transactional session dependency."""

    engine_options: dict[str, Any] = {
        "echo": config.echo,
        "pool_pre_ping": config.pool_pre_ping,
    }
    if config.pool_size is not None:
        engine_options["pool_size"] = config.pool_size
    if config.max_overflow is not None:
        engine_options["max_overflow"] = config.max_overflow
    if config.connect_args:
        engine_options["connect_args"] = dict(config.connect_args)

    engine = create_async_engine(config.url, **engine_options)
    metric_registry = metrics or Metrics(get_prometheus_registry())
    driver = config.url.partition("://")[0] or "unknown"
    metric_tags = {"driver": driver[:128]}

    sync_engine = getattr(engine, "sync_engine", None)
    if sync_engine is not None:
        def before_cursor_execute(
            _connection: Any,
            _cursor: Any,
            _statement: str,
            _parameters: Any,
            execution_context: Any,
            _executemany: bool,
        ) -> None:
            execution_context._ksu_query_started_at = perf_counter()
            _record_query_count()
            metric_registry.increment("database.query.count", tags=metric_tags)

        def after_cursor_execute(
            _connection: Any,
            _cursor: Any,
            _statement: str,
            _parameters: Any,
            execution_context: Any,
            _executemany: bool,
        ) -> None:
            started_at = getattr(execution_context, "_ksu_query_started_at", None)
            duration_ms = (
                (perf_counter() - started_at) * 1000
                if isinstance(started_at, (int, float))
                else 0.0
            )
            metric_registry.observe_latency(
                "database.query.latency_ms",
                duration_ms,
                tags=metric_tags,
            )

        event.listen(sync_engine, "before_cursor_execute", before_cursor_execute)
        event.listen(sync_engine, "after_cursor_execute", after_cursor_execute)

    session_factory = async_sessionmaker(
        bind=engine,
        expire_on_commit=False,
        autoflush=False,
    )
    runtime = DatabaseRuntime(
        engine=engine,
        session_factory=session_factory,
        metrics=metric_registry,
        pool_metric_tags=metric_tags,
        max_overflow=config.max_overflow,
    )
    pool = getattr(sync_engine, "pool", None)
    if runtime.pool_status().supported:
        event.listen(pool, "checkout", lambda *_args: runtime.pool_status())
        event.listen(pool, "checkin", lambda *_args: runtime.pool_status())
    return runtime
