"""Dependency-light async SQLAlchemy runtime shared by every service."""

from __future__ import annotations

from collections.abc import AsyncIterator, Iterator, Mapping
from contextlib import contextmanager
from contextvars import ContextVar
from dataclasses import dataclass, field
from time import perf_counter
from typing import Any

from sqlalchemy import event
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from .observability import Metrics

_query_count: ContextVar[int | None] = ContextVar("ksu_database_query_count", default=None)


@dataclass
class QueryCountObservation:
    """Bounded per-context SQL execution count for request-level inspection."""

    count: int = 0


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


def _record_query_count() -> None:
    count = _query_count.get()
    if count is not None:
        _query_count.set(count + 1)


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
class DatabaseRuntime:
    """An engine, session factory, and transactional request dependency."""

    engine: AsyncEngine | object
    session_factory: Any
    metrics: Metrics = field(default_factory=Metrics)

    async def session(self) -> AsyncIterator[AsyncSession]:
        async with self.session_factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise


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
    metric_registry = metrics or Metrics()
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
            setattr(execution_context, "_ksu_query_started_at", perf_counter())
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
    return DatabaseRuntime(
        engine=engine,
        session_factory=session_factory,
        metrics=metric_registry,
    )
