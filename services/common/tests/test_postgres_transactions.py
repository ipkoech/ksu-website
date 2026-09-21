"""Opt-in real database checks; use a disposable database, never application data."""

import asyncio
import os
import uuid
from contextlib import asynccontextmanager

import pytest
from sqlalchemy import text

from ksu_common.database import DatabaseConfig, create_database_runtime

TEST_URL = os.environ.get("KSU_TEST_DATABASE_URL")
pytestmark = pytest.mark.skipif(not TEST_URL, reason="KSU_TEST_DATABASE_URL is required")


def test_query_budget_hook_blocks_sql_and_rolls_back_pending_write():
    from sqlalchemy import event
    from ksu_common.database import QueryBudgetExceeded, query_budget_context

    async def exercise():
        runtime = create_database_runtime(DatabaseConfig(url=TEST_URL, pool_size=1, max_overflow=0))
        table = "budget_probe_" + uuid.uuid4().hex
        transaction = asynccontextmanager(runtime.session)
        executed = []
        event.listen(runtime.engine.sync_engine, "after_cursor_execute",
                     lambda conn, cursor, statement, parameters, context, many: executed.append(statement))
        try:
            async with runtime.engine.begin() as connection:
                await connection.execute(text(f"CREATE TABLE {table} (id integer PRIMARY KEY)"))
            executed.clear()
            with pytest.raises(QueryBudgetExceeded):
                with query_budget_context(1):
                    async with transaction() as session:
                        await session.execute(text(f"INSERT INTO {table} VALUES (1)"))
                        with query_budget_context(100):
                            await session.execute(text(f"INSERT INTO {table} VALUES (2)"))
            assert len(executed) == 1
            assert runtime.pool_status().checked_out == 0
            async with transaction() as session:
                assert await session.scalar(text(f"SELECT count(*) FROM {table}")) == 0
                await session.execute(text(f"INSERT INTO {table} VALUES (3)"))
            async with transaction() as session:
                assert list((await session.scalars(text(f"SELECT id FROM {table}"))).all()) == [3]
        finally:
            async with runtime.engine.begin() as connection:
                await connection.execute(text(f"DROP TABLE IF EXISTS {table}"))
            await runtime.engine.dispose()

    asyncio.run(exercise())


def test_postgres_commit_constraint_failure_and_cancellation():
    async def exercise():
        runtime = create_database_runtime(DatabaseConfig(url=TEST_URL, pool_size=1, max_overflow=0))
        # Generated identifier is safe SQL and isolates concurrent test runs.
        table = "transaction_probe_" + uuid.uuid4().hex
        transaction = asynccontextmanager(runtime.session)
        try:
            async with runtime.engine.begin() as connection:
                await connection.execute(text(f"CREATE TABLE {table} (id integer PRIMARY KEY)"))
            async with transaction() as session:
                await session.execute(text(f"INSERT INTO {table} VALUES (1)"))
            for error in (ValueError("invalid operation"), asyncio.CancelledError()):
                with pytest.raises(type(error)):
                    async with transaction() as session:
                        await session.execute(text(f"INSERT INTO {table} VALUES (2)"))
                        raise error
            from sqlalchemy.exc import IntegrityError
            with pytest.raises(IntegrityError):
                async with transaction() as session:
                    await session.execute(text(f"INSERT INTO {table} VALUES (3)"))
                    await session.execute(text(f"INSERT INTO {table} VALUES (1)"))
            async with transaction() as session:
                rows = (await session.execute(text(f"SELECT id FROM {table} ORDER BY id"))).scalars().all()
                assert rows == [1]
        finally:
            async with runtime.engine.begin() as connection:
                await connection.execute(text(f"DROP TABLE IF EXISTS {table}"))
            await runtime.engine.dispose()

    asyncio.run(exercise())


def test_http_never_returns_success_for_deferred_constraint_failure(monkeypatch):
    from unittest.mock import AsyncMock
    from ksu_common import audit as audit_module
    import httpx
    from fastapi import Depends
    from fastapi.responses import JSONResponse

    from ksu_common.runtime import AuditOptions, CorsConfig, ServiceAppConfig, create_service_app

    monkeypatch.setenv("DB_DEFAULT_QUERY_BUDGET", "1")
    monkeypatch.delenv("DB_ROUTE_BUDGETS", raising=False)
    committed_log = AsyncMock()
    monkeypatch.setattr(audit_module._default_logger, "log", committed_log)

    async def exercise():
        runtime = create_database_runtime(DatabaseConfig(url=TEST_URL, pool_size=1, max_overflow=0))
        table = "http_probe_" + uuid.uuid4().hex
        audit_table = table + "_audit"

        async def dispatch(payload):
            async with runtime.session_factory.begin() as session:
                await session.execute(
                    text(f"INSERT INTO {audit_table} (status) VALUES (:status)"),
                    {"status": payload["status_code"]},
                )

        def register(app):
            @app.post("/rows", response_model=int)
            @audit_module.audit_action("row.create")
            async def insert(row_id: int, invalid_output: bool = False, extra_query: bool = False,
                             explicit_error: bool = False, raw_success: bool = False, db=Depends(runtime.session)):
                await db.execute(text(f"INSERT INTO {table} VALUES (:id)"), {"id": row_id})
                if raw_success:
                    return JSONResponse({"private_field": "must-not-escape"})
                if explicit_error:
                    return JSONResponse(status_code=409, content={"detail": "operation rejected"})
                if extra_query:
                    await db.execute(text("SELECT 1"))
                return "invalid" if invalid_output else row_id

        app = create_service_app(
            ServiceAppConfig(service_name="test", title="Test", version="1", environment="development"),
            cors=CorsConfig(origins=()), register_routes=register,
            audit=AuditOptions(
                session_factory=None, service_name="test", token_key="test", token_algorithm="HS256",
                token_issuer="test", token_audience="test", token_key_id="test",
                dispatch=dispatch, inline_fallback=False,
            ),
        )
        try:
            async with runtime.engine.begin() as connection:
                await connection.execute(text(
                    f"CREATE TABLE {table} (id integer PRIMARY KEY DEFERRABLE INITIALLY DEFERRED)"
                ))
                await connection.execute(text(f"CREATE TABLE {audit_table} (id serial PRIMARY KEY, status integer)"))
            transport = httpx.ASGITransport(app=app, raise_app_exceptions=False)
            async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
                assert (await client.post("/rows?row_id=1")).status_code == 200
                assert (await client.post("/rows?row_id=1")).status_code == 500
                assert (await client.post("/rows?row_id=2&invalid_output=true")).status_code == 500
                limited = await client.post("/rows?row_id=3&extra_query=true")
                assert limited.status_code == 429
                assert limited.json() == {"detail": "Database query budget of 1 exceeded."}
                rejected = await client.post("/rows?row_id=4&explicit_error=true")
                assert rejected.status_code == 409
                assert rejected.json() == {"detail": "operation rejected"}
                bypassed = await client.post("/rows?row_id=5&raw_success=true")
                assert bypassed.status_code == 500
                assert "must-not-escape" not in bypassed.text
                assert runtime.pool_status().checked_out == 0
                committed_log.assert_awaited_once()
                assert committed_log.call_args.args[0] == "row.create"
            async with runtime.engine.connect() as connection:
                assert (await connection.execute(text(f"SELECT id FROM {table}"))).scalars().all() == [1]
                assert list((await connection.scalars(text(f"SELECT status FROM {audit_table} ORDER BY id"))).all()) == [200, 500, 500, 429, 409, 500]
        finally:
            async with runtime.engine.begin() as connection:
                await connection.execute(text(f"DROP TABLE IF EXISTS {table}"))
                await connection.execute(text(f"DROP TABLE IF EXISTS {audit_table}"))
            await runtime.engine.dispose()

    asyncio.run(exercise())
