from __future__ import annotations

from collections.abc import AsyncIterator

import pytest

from ksu_common.database import DatabaseConfig, DatabaseRuntime, create_database_runtime


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
