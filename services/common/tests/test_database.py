from __future__ import annotations

import asyncio
from collections.abc import AsyncIterator
from types import SimpleNamespace

import pytest
import ksu_common.database as database_module
from ksu_common.database import (
    DatabaseBudgetRegistry,
    DatabaseBudgetRule,
    DatabaseConfig,
    DatabaseRuntime,
    create_database_runtime,
    current_query_count,
    query_count_context,
)
from ksu_common.observability import Metrics
from sqlalchemy.pool import NullPool


def test_database_budget_registry_uses_longest_matching_path(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("DB_DEFAULT_CONCURRENCY", "8")
    monkeypatch.setenv("DB_DEFAULT_QUERY_BUDGET", "40")
    monkeypatch.setenv(
        "DB_ROUTE_BUDGETS",
        '[{"path_prefix":"/api/v1","max_concurrency":6,"max_queries":30},'
        '{"path_prefix":"/api/v1/search","max_concurrency":2,"max_queries":10}]',
    )

    registry = DatabaseBudgetRegistry.from_environment()

    assert registry.for_path("/api/v1/search") is registry.for_path("/api/v1/search/foo")
    assert registry.for_path("/api/v1") is registry.for_path("/api/v1/other")
    assert registry.for_path("/api/v1/search").max_concurrency == 2
    assert registry.for_path("/api/v1/search").max_queries == 10
    assert registry.for_path("/api/v1/other").max_concurrency == 6
    assert registry.for_path("/unmatched").max_concurrency == 8
    assert registry.for_path("/unmatched").max_queries == 40


@pytest.mark.parametrize("raw", ["not-json", "{}", "[1]", '[{"path_prefix":"relative"}'])
def test_database_budget_registry_rejects_invalid_environment(
    monkeypatch: pytest.MonkeyPatch, raw: str
) -> None:
    monkeypatch.setenv("DB_ROUTE_BUDGETS", raw)

    with pytest.raises(ValueError):
        DatabaseBudgetRegistry.from_environment()


def test_database_budget_rule_normalizes_root_prefix() -> None:
    registry = DatabaseBudgetRegistry(
        rules=[DatabaseBudgetRule(path_prefix="/", max_concurrency=1, max_queries=1)]
    )

    assert registry.for_path("/anything").max_concurrency == 1


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
        "pool_recycle": 1800,
        "pool_size": 12,
        "max_overflow": 24,
        "connect_args": {"server_settings": {"search_path": "main,public"}},
    }
    assert captured["session_options"] == {
        "bind": engine,
        "expire_on_commit": False,
        "autoflush": False,
    }


def test_database_runtime_applies_configured_pool_recycle(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    captured: dict[str, object] = {}

    def fake_create_engine(url: str, **options: object) -> object:
        captured["options"] = options
        return object()

    monkeypatch.setattr("ksu_common.database.create_async_engine", fake_create_engine)
    monkeypatch.setattr("ksu_common.database.async_sessionmaker", lambda **_: object())

    create_database_runtime(
        DatabaseConfig(url="postgresql+asyncpg://db/service", pool_recycle=600)
    )

    # Connections must be retired before an idle proxy or firewall kills them.
    assert captured["options"]["pool_recycle"] == 600


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


def test_database_runtime_reports_queue_pool_saturation_metrics(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    class Pool:
        _max_overflow = 5

        def size(self) -> int:
            return 10

        def checkedout(self) -> int:
            return 6

        def overflow(self) -> int:
            return 2

    engine = SimpleNamespace(sync_engine=SimpleNamespace(pool=Pool()))
    gauges: list[tuple[str, float, dict[str, str]]] = []

    class Sink:
        def increment(self, _name: str, _value: int, *, tags: dict[str, str]) -> None:
            return None

        def observe_latency(
            self, _name: str, _duration_ms: float, *, tags: dict[str, str]
        ) -> None:
            return None

        def gauge(self, name: str, value: float, *, tags: dict[str, str]) -> None:
            gauges.append((name, value, tags))

    monkeypatch.setattr("ksu_common.database.create_async_engine", lambda *_args, **_kwargs: engine)
    monkeypatch.setattr("ksu_common.database.async_sessionmaker", lambda **_kwargs: object())
    monkeypatch.setattr("ksu_common.database.event.listen", lambda *_args, **_kwargs: None)

    runtime = create_database_runtime(
        DatabaseConfig(url="postgresql+asyncpg://db/service"),
        metrics=Metrics(Sink()),
    )

    status = runtime.pool_status()

    assert status.supported is True
    assert status.size == 10
    assert status.checked_out == 6
    assert status.overflow == 2
    assert status.utilization == pytest.approx(0.4)
    assert gauges[-4:] == [
        ("database.pool.size", 10.0, {"driver": "postgresql+asyncpg"}),
        ("database.pool.checked_out", 6.0, {"driver": "postgresql+asyncpg"}),
        ("database.pool.overflow", 2.0, {"driver": "postgresql+asyncpg"}),
        ("database.pool.utilization", 0.4, {"driver": "postgresql+asyncpg"}),
    ]


def test_database_runtime_ignores_null_pool_metrics(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    engine = SimpleNamespace(sync_engine=SimpleNamespace(pool=NullPool(lambda: None)))
    gauges: list[tuple[str, float, dict[str, str]]] = []

    class Sink:
        def increment(self, _name: str, _value: int, *, tags: dict[str, str]) -> None:
            return None

        def observe_latency(
            self, _name: str, _duration_ms: float, *, tags: dict[str, str]
        ) -> None:
            return None

        def gauge(self, name: str, value: float, *, tags: dict[str, str]) -> None:
            gauges.append((name, value, tags))

    monkeypatch.setattr("ksu_common.database.create_async_engine", lambda *_args, **_kwargs: engine)
    monkeypatch.setattr("ksu_common.database.async_sessionmaker", lambda **_kwargs: object())
    monkeypatch.setattr("ksu_common.database.event.listen", lambda *_args, **_kwargs: None)

    runtime = create_database_runtime(
        DatabaseConfig(url="sqlite+aiosqlite:///tmp/service.db"),
        metrics=Metrics(Sink()),
    )

    status = runtime.pool_status()

    assert status.supported is False
    assert status.size is None
    assert status.checked_out is None
    assert status.overflow is None
    assert status.utilization is None
    assert gauges == []


def test_database_runtime_omits_utilization_for_unbounded_overflow() -> None:
    class Pool:
        _max_overflow = -1

        def size(self) -> int:
            return 5

        def checkedout(self) -> int:
            return 7

        def overflow(self) -> int:
            return 2

    runtime = DatabaseRuntime(
        engine=SimpleNamespace(sync_engine=SimpleNamespace(pool=Pool())),
        session_factory=object(),
    )

    status = runtime.pool_status()

    assert status.supported is True
    assert status.size == 5
    assert status.checked_out == 7
    assert status.overflow == 2
    assert status.utilization is None


@pytest.mark.asyncio
async def test_session_dependency_commits_successful_work() -> None:
    session = _Session()
    runtime = DatabaseRuntime(engine=object(), session_factory=_SessionFactory(session))

    dependency: AsyncIterator[_Session] = runtime.session()
    assert await dependency.__anext__() is session
    with pytest.raises(StopAsyncIteration):
        await dependency.__anext__()

    assert session.commits == 1
    assert session.rollbacks == 0


@pytest.mark.asyncio
async def test_session_dependency_rolls_back_failed_work() -> None:
    session = _Session()
    runtime = DatabaseRuntime(engine=object(), session_factory=_SessionFactory(session))

    dependency: AsyncIterator[_Session] = runtime.session()
    assert await dependency.__anext__() is session
    with pytest.raises(RuntimeError, match="failed"):
        await dependency.athrow(RuntimeError("failed"))

    assert session.commits == 0
    assert session.rollbacks == 1


@pytest.mark.asyncio
async def test_database_request_budget_rejects_concurrent_route_work() -> None:
    budget = database_module.DatabaseRequestBudget(
        max_concurrency=1,
        max_queries=5,
        acquire_timeout_seconds=0.01,
    )
    entered = asyncio.Event()
    release = asyncio.Event()

    async def hold_budget() -> None:
        async with budget.limit():
            entered.set()
            await release.wait()

    holder = asyncio.create_task(hold_budget())
    await entered.wait()

    with pytest.raises(database_module.DatabaseConcurrencyLimitExceeded) as exc_info:
        async with budget.limit():
            pass

    assert exc_info.value.status_code == 503
    assert "database concurrency" in exc_info.value.detail.lower()
    release.set()
    await holder


def test_query_budget_raises_at_the_configured_query_boundary() -> None:
    with pytest.raises(database_module.QueryBudgetExceeded) as exc_info:
        with database_module.query_budget_context(max_queries=1) as observation:
            database_module._record_query_count()
            assert current_query_count() == 1
            database_module._record_query_count()

    assert exc_info.value.status_code == 429
    assert "query budget" in exc_info.value.detail
    assert observation.count == 1
    assert current_query_count() == 0


@pytest.mark.asyncio
async def test_database_request_budget_dependency_scopes_query_count() -> None:
    budget = database_module.DatabaseRequestBudget(max_concurrency=2, max_queries=2)
    dependency = budget.dependency()

    observation = await dependency.__anext__()
    database_module._record_query_count()
    database_module._record_query_count()
    with pytest.raises(StopAsyncIteration):
        await dependency.__anext__()

    assert observation.count == 2


@pytest.mark.asyncio
async def test_database_request_budget_zero_timeout_acquires_free_permit() -> None:
    budget = database_module.DatabaseRequestBudget(
        max_concurrency=1,
        max_queries=1,
        acquire_timeout_seconds=0,
    )

    async with budget.limit() as observation:
        assert observation.count == 0
