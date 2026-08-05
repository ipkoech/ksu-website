"""Dependency-light async SQLAlchemy runtime shared by every service."""

from __future__ import annotations

from collections.abc import AsyncIterator, Mapping
from dataclasses import dataclass, field
from typing import Any

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)


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

    async def session(self) -> AsyncIterator[AsyncSession]:
        async with self.session_factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise


def create_database_runtime(config: DatabaseConfig) -> DatabaseRuntime:
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
    session_factory = async_sessionmaker(
        bind=engine,
        expire_on_commit=False,
        autoflush=False,
    )
    return DatabaseRuntime(engine=engine, session_factory=session_factory)
