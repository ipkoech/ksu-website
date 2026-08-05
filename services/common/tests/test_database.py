from __future__ import annotations

from collections.abc import AsyncIterator
from types import SimpleNamespace

import pytest

from ksu_common.database import (
    DatabaseConfig,
    DatabaseRuntime,
    current_query_count,
    create_database_runtime,
    query_count_context,
)
from ksu_common.observability import Metrics


class _Session:
    def __init__(self) -> None:
        self.commits = 0
        self.rollbacks = 0

    async def commit(self) -> None:
        self.commits += 1

    async def rollback(self) -> None:
        self.rollbacks += 1


class _SessionContext:
    def __init__(self, session: _Session) -> None:
        self.session = session

    async def __aenter__(self) -> _Session:
        return self.session

    async def __aexit__(self, *_args: object) -> None:
        return None


class _SessionFactory:
    def __init__(self, session: _Session) -> None:
        self.session = session

    def __call__(self) -> _SessionContext:
        return _SessionContext(self.session)


def test_database_runtime_preserves_service_engine_options(monkeypatch: pytest.MonkeyPatch) -> None:
    engine = object()
    captured: dict[str, object] = {}

    def fake_create_engine(url: str, **options: object) -> object:
        captured["url"] = url
        captured["options"] = options
        return engine

    def fake_sessionmaker(**options: object) -> object:
        captured["session_options"] = options
        return object()

    monkeypatch.setattr("ksu_common.database.create_async_engine", fake_create_engine)
    monkeypatch.setattr("ksu_common.database.async_sessionmaker", fake_sessionmaker)

    runtime = create_database_runtime(
        DatabaseConfig(
            url="postgresql+asyncpg://db/service",
            echo=True,
            pool_size=12,
            max_overflow=24,
            connect_args={"server_settings": {"search_path": "main,public"}},
        )
    )

    assert runtime.engine is engine
    assert captured["url"] == "postgresql+asyncpg://db/service"
    assert captured["options"] == {
        "echo": True,
        "pool_pre_ping": True,
        "pool_size": 12,
        "max_overflow": 24,
        "connect_args": {"server_settings": {"search_path": "main,public"}},
    }
    assert captured["session_options"] == {
        "bind": engine,
        "expire_on_commit": False,
        "autoflush": False,
    }


def test_database_runtime_instruments_query_count_and_latency(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    engine = SimpleNamespace(sync_engine=object())
    listeners: dict[str, object] = {}
    records: list[tuple[str, object, dict[str, str]]] = []

    class Sink:
        def increment(self, name: str, value: int, *, tags: dict[str, str]) -> None:
            records.append((name, value, tags))

        def observe_latency(
            self, name: str, duration_ms: float, *, tags: dict[str, str]
        ) -> None:
            records.append((name, duration_ms, tags))

    def fake_create_engine(_url: str, **_options: object) -> object:
        return engine

    def fake_sessionmaker(**_options: object) -> object:
        return object()

    def fake_listen(_target: object, name: str, listener: object, **_options: object) -> None:
        listeners[name] = listener

    monkeypatch.setattr("ksu_common.database.create_async_engine", fake_create_engine)
    monkeypatch.setattr("ksu_common.database.async_sessionmaker", fake_sessionmaker)
    monkeypatch.setattr("ksu_common.database.event.listen", fake_listen)

    create_database_runtime(
        DatabaseConfig(url="postgresql+asyncpg://db/service"),
        metrics=Metrics(Sink()),
    )

    execution_context = SimpleNamespace()
    with query_count_context() as observation:
        listeners["before_cursor_execute"](
            object(), object(), "SELECT 1", (), execution_context, False
        )
        listeners["after_cursor_execute"](
            object(), object(), "SELECT 1", (), execution_context, False
        )
        assert current_query_count() == 1

    assert observation.count == 1

    assert records[0] == (
        "database.query.count",
        1,
        {"driver": "postgresql+asyncpg"},
    )
    assert records[1][0] == "database.query.latency_ms"
    assert records[1][2] == {"driver": "postgresql+asyncpg"}
    assert current_query_count() == 0


@pytest.mark.asyncio
async def test_session_dependency_commits_successful_work() -> None:
    session = _Session()
    runtime = DatabaseRuntime(engine=object(), session_factory=_SessionFactory(session))

    dependency: AsyncIterator[_Session] = runtime.session()
    assert await anext(dependency) is session
    with pytest.raises(StopAsyncIteration):
        await anext(dependency)

    assert session.commits == 1
    assert session.rollbacks == 0


@pytest.mark.asyncio
async def test_session_dependency_rolls_back_failed_work() -> None:
    session = _Session()
    runtime = DatabaseRuntime(engine=object(), session_factory=_SessionFactory(session))

    dependency: AsyncIterator[_Session] = runtime.session()
    assert await anext(dependency) is session
    with pytest.raises(RuntimeError, match="failed"):
        await dependency.athrow(RuntimeError("failed"))

    assert session.commits == 0
    assert session.rollbacks == 1
