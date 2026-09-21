"""Audit redelivery against PostgreSQL using an isolated generated schema."""

import asyncio
import os
import uuid

import pytest
from sqlalchemy import event, func, select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.models import AuditLog
from ksu_common.audit import persist_audit_batch, persist_audit_payload

TEST_URL = os.environ.get("KSU_TEST_DATABASE_URL")
pytestmark = pytest.mark.skipif(not TEST_URL, reason="disposable KSU_TEST_DATABASE_URL required")


def test_concurrent_duplicate_audit_deliveries_create_one_row():
    async def exercise():
        schema = "audit_probe_" + uuid.uuid4().hex
        engine = create_async_engine(TEST_URL, execution_options={"schema_translate_map": {"main": schema}})
        factory = async_sessionmaker(engine, expire_on_commit=False)
        payload = {
            "id": str(uuid.uuid4()), "service_name": "main", "action": "test",
            "request_method": "POST", "request_path": "/test", "status_code": 200,
        }
        try:
            async with engine.begin() as connection:
                await connection.execute(text(f"CREATE SCHEMA {schema}"))
                await connection.run_sync(AuditLog.__table__.create)
            await asyncio.gather(*(
                persist_audit_payload(factory, payload, AuditLog, strict=True) for _ in range(2)
            ))
            await persist_audit_payload(factory, payload, AuditLog, strict=True)
            async with factory() as db:
                assert await db.scalar(select(func.count()).select_from(AuditLog)) == 1

            statements = []
            def count_statement(_connection, _cursor, statement, _parameters, _context, _many):
                statements.append(statement)

            event.listen(engine.sync_engine, "before_cursor_execute", count_statement)
            batch = [{**payload, "id": str(uuid.uuid4())} for _ in range(100)]
            assert await persist_audit_batch(factory, batch, AuditLog) == 100
            assert len(statements) == 1
            statements.clear()
            assert await persist_audit_batch(factory, batch, AuditLog) == 0
            assert len(statements) == 1
            with pytest.raises(ValueError, match="between 1 and 100"):
                await persist_audit_batch(factory, batch + [payload], AuditLog)
            bad = [{**payload, "id": str(uuid.uuid4())}, {**payload, "id": str(uuid.uuid4()), "action": None}]
            with pytest.raises(IntegrityError):
                await persist_audit_batch(factory, bad, AuditLog)
            async with factory() as db:
                assert await db.scalar(select(func.count()).select_from(AuditLog)) == 101
        finally:
            async with engine.begin() as connection:
                await connection.execute(text(f"DROP SCHEMA IF EXISTS {schema} CASCADE"))
            await engine.dispose()

    asyncio.run(exercise())
