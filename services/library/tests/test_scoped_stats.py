import os
from datetime import date, datetime, timedelta, timezone
from uuid import uuid4

import pytest
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from ksu_common.auth import TokenPayload

from app.core.auth import allowed_library_scope_ids
from app.models import Library, LibraryLoan, LibraryResource, LibraryStatistics, SupportTicket
from app.services import stats


def test_statistics_http_adapters_require_user_context_and_preserve_scope(monkeypatch):
    from unittest.mock import AsyncMock

    from fastapi import FastAPI
    from fastapi.testclient import TestClient

    from app.core.auth import get_current_user
    from app.routes.v1 import stats as routes
    from app.schemas.stats import PublicStatsResponse

    app = FastAPI()
    app.include_router(routes.router)
    app.dependency_overrides[routes.verify_internal_key] = lambda: None
    app.dependency_overrides[routes.get_db] = lambda: object()
    result = AsyncMock(return_value=PublicStatsResponse(scope="admin", title="Stats", stats=[]))
    monkeypatch.setattr(routes, "admin_library_stats", result)
    branch = str(uuid4())
    with TestClient(app) as client:
        assert client.get("/library/stats/internal/admin").status_code == 401
        result.assert_not_awaited()
        app.dependency_overrides[get_current_user] = lambda: TokenPayload("actor", "session", raw={
            "scope_grants": [{"scope_type": "library", "scope_id": branch, "permissions": ["library.read"]}],
        })
        for path in ("/library/stats/admin", "/library/stats/internal/admin"):
            response = client.get(path)
            assert response.status_code == 200, response.text
            assert response.headers["cache-control"] == "no-store"
            assert result.call_args.kwargs["scope_ids"] == {branch}


def test_platform_and_absent_report_scope():
    actor = TokenPayload("actor", "session", raw={"scope_grants": [
        {"scope_type": "global", "permissions": ["platform.admin"]},
    ]})
    assert allowed_library_scope_ids(actor, "library.read") is None
    assert allowed_library_scope_ids(TokenPayload("actor", "session"), "library.read") == set()
    branch = str(uuid4())
    mixed = TokenPayload("actor", "session", raw={"scope_grants": [
        {"scope_type": "library", "scope_id": branch, "permissions": ["library.read"]},
        {"permissions": ["library.read"]},
    ]})
    assert allowed_library_scope_ids(mixed, "library.read") == {branch}


@pytest.mark.asyncio
async def test_operational_statistics_exclude_foreign_branches_before_aggregation():
    url = os.environ.get("KSU_TEST_DATABASE_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_DATABASE_URL required")
    schema = "report_scope_" + uuid4().hex
    engine = create_async_engine(url, execution_options={"schema_translate_map": {"library": schema}})
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    branches, resources, loans = [uuid4(), uuid4()], [uuid4(), uuid4()], [uuid4(), uuid4()]
    models = [value for value in vars(stats).values() if isinstance(value, type) and hasattr(value, "__table__")]
    tables = {model.__table__ for model in models}
    try:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"CREATE SCHEMA {schema}"))
            for table in Library.metadata.sorted_tables:
                if table in tables:
                    await conn.run_sync(table.create)
        async with sessions.begin() as db:
            for index, branch in enumerate(branches):
                await db.execute(sa.insert(Library).values(id=branch, name=f"Branch {index}", slug=f"branch-{index}", is_public=index == 0))
                await db.execute(sa.insert(LibraryResource).values(
                    id=resources[index], library_id=branch, title="Resource", total_copies=10 + index, available_copies=4 + index,
                ))
                now = datetime.now(timezone.utc)
                await db.execute(sa.insert(LibraryLoan).values(
                    id=loans[index], resource_id=resources[index], borrower_person_id=uuid4(),
                    borrowed_at=now, due_at=now + timedelta(days=7),
                ))
                await db.execute(sa.insert(SupportTicket).values(
                    subject="Ticket", description="Details", target_entity_type="loan", target_entity_id=loans[index],
                ))
                await db.execute(sa.insert(LibraryStatistics).values(
                    library_id=branch, period_start=date(2026, 1 + index, 1), period_end=date(2026, 1 + index, 28),
                    total_books=100 + index,
                ))
        async with sessions() as db:
            own = {item.key: item.value for item in (await stats.admin_library_stats(db, scope_ids={str(branches[0])})).stats}
            both = {item.key: item.value for item in (await stats.admin_library_stats(db, scope_ids=set(map(str, branches)))).stats}
            empty = await stats.admin_library_stats(db, scope_ids=set())
            central = {item.key: item.value for item in (await stats.admin_library_stats(db, scope_ids=None)).stats}
            assert own["branches"] == own["loans"] == own["tickets"] == 1
            assert own["total_copies"] == 10 and own["snapshot_books"] == 100
            assert both["branches"] == both["loans"] == both["tickets"] == 2
            assert both["total_copies"] == 21 and both["snapshot_books"] == 101
            assert all(item.value == 0 for item in empty.stats)
            assert central == both
            public = {item.key: item.value for item in (await stats.public_library_stats(db)).stats}
            assert public["snapshot_books"] == 100
            assert public["library_resources"] == 1 and public["available_copies"] == 4
    finally:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"DROP SCHEMA {schema} CASCADE"))
        await engine.dispose()
