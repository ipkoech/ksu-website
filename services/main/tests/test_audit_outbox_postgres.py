import asyncio
import importlib.util
import os
from pathlib import Path
import uuid
from unittest.mock import AsyncMock, patch

import httpx
import pytest
import sqlalchemy as sa
from fastapi import Depends
from alembic.migration import MigrationContext
from alembic.operations import Operations
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.exc import DBAPIError

from app.models import AuditLog, audit_outbox
from ksu_common.audit_outbox import capture_audit, drain_audit_batch, has_retained_audit_failure, oldest_pending_audit_age
from ksu_common.audit import insert_audit_batch
from ksu_common.database import DatabaseRuntime
from ksu_common.runtime import AuditOptions, CorsConfig, ServiceAppConfig, create_service_app

TEST_URL = os.environ.get("KSU_TEST_DATABASE_URL")
pytestmark = pytest.mark.skipif(not TEST_URL, reason="disposable KSU_TEST_DATABASE_URL required")


def test_durable_capture_and_concurrent_batch_drain():
    async def exercise():
        schema = "audit_outbox_probe_" + uuid.uuid4().hex
        engine = create_async_engine(TEST_URL, execution_options={"schema_translate_map": {"main": schema}})
        factory = async_sessionmaker(engine, expire_on_commit=False)
        path = Path(__file__).parents[1] / "migrations/versions/20260905_0910_add_audit_outbox.py"
        spec = importlib.util.spec_from_file_location("audit_outbox_migration", path)
        migration = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(migration)
        recovery_spec = importlib.util.spec_from_file_location(
            "audit_recovery_migration", path.with_name("20260905_0920_audit_outbox_recovery.py"),
        )
        recovery = importlib.util.module_from_spec(recovery_spec)
        recovery_spec.loader.exec_module(recovery)
        probe_spec = importlib.util.spec_from_file_location(
            "audit_probe_migration", path.with_name("20260905_0930_audit_failure_probe.py"),
        )
        probe = importlib.util.module_from_spec(probe_spec)
        probe_spec.loader.exec_module(probe)

        def migrate(connection, action):
            connection.execute(sa.text(f"SET LOCAL search_path TO {schema}"))
            with Operations.context(MigrationContext.configure(connection)):
                if action == "upgrade":
                    migration.upgrade()
                    recovery.upgrade()
                    probe.upgrade()
                else:
                    probe.downgrade()
                    recovery.downgrade()
                    migration.downgrade()

        def payload():
            return {"id": str(uuid.uuid4()), "service_name": "main", "action": "test",
                    "request_method": "POST", "request_path": "/test", "status_code": 200}

        try:
            async with engine.begin() as connection:
                await connection.execute(sa.text(f"CREATE SCHEMA {schema}"))
                await connection.run_sync(migrate, "upgrade")
                await connection.run_sync(AuditLog.__table__.create)
            async with factory() as db:
                await capture_audit(db, audit_outbox, payload())
                await db.rollback()
                assert await db.scalar(sa.select(sa.func.count()).select_from(audit_outbox)) == 0
                assert await oldest_pending_audit_age(db, audit_outbox) == 0
                assert not await has_retained_audit_failure(db, audit_outbox)
            async with factory.begin() as db:
                events = [payload() for _ in range(101)]
                events[0]["details"] = {"api_key": "must-not-persist", "label": "kept"}
                events[1]["details"] = {"document": "x" * 100000}
                events[2]["changes"] = {}
                events[2]["changes"]["cycle"] = events[2]["changes"]
                events[3]["details"] = {"text": "invalid\x00text"}
                events[4]["details"] = {"text": "\ud800"}
                for event in events:
                    await capture_audit(db, audit_outbox, event)
                await capture_audit(db, audit_outbox, events[0])
                staged = await db.scalar(sa.select(audit_outbox.c.payload).where(
                    audit_outbox.c.id == uuid.UUID(events[0]["id"]),
                ))
                assert staged["details"] == {"label": "kept"}
                for index, field, reason in [(1, "details", "size_limit"), (2, "changes", "cycle"),
                                             (3, "details", "invalid_text"), (4, "details", "invalid_text")]:
                    bounded = await db.scalar(sa.select(audit_outbox.c.payload).where(
                        audit_outbox.c.id == uuid.UUID(events[index]["id"]),
                    ))
                    assert bounded[field] == {"audit_metadata_omitted": {"reason": reason}}
                    assert bounded["action"] == "test"
                assert len(events[1]["details"]["document"]) == 100000
                await db.execute(sa.update(audit_outbox).where(audit_outbox.c.id == uuid.UUID(events[0]["id"]))
                                 .values(captured_at=sa.func.now() - sa.text("interval '3 minutes'")))
                assert await oldest_pending_audit_age(db, audit_outbox) >= 180

            with pytest.raises(RuntimeError, match="drain pending"):
                async with engine.begin() as connection:
                    await connection.run_sync(migrate, "downgrade")

            inserted = asyncio.Event()

            async def pause_after_destination_insert(*args, **kwargs):
                result = await insert_audit_batch(*args, **kwargs)
                inserted.set()
                await asyncio.Event().wait()
                return result

            async def interrupted_drain():
                async with factory.begin() as db:
                    await drain_audit_batch(db, audit_outbox, AuditLog)

            with patch("ksu_common.audit_outbox.insert_audit_batch", pause_after_destination_insert):
                pending_task = asyncio.create_task(interrupted_drain())
                try:
                    await asyncio.wait_for(inserted.wait(), timeout=5)
                finally:
                    pending_task.cancel()
                    with pytest.raises(asyncio.CancelledError):
                        await pending_task
            async with factory() as db:
                assert await db.scalar(sa.select(sa.func.count()).select_from(audit_outbox)) == 101
                assert await db.scalar(sa.select(sa.func.count()).select_from(AuditLog)) == 0
                assert not await has_retained_audit_failure(db, audit_outbox)

            async with factory() as db:
                assert await drain_audit_batch(db, audit_outbox, AuditLog) == 100
                await db.rollback()
                assert await db.scalar(sa.select(sa.func.count()).select_from(audit_outbox)) == 101
                assert await db.scalar(sa.select(sa.func.count()).select_from(AuditLog)) == 0

            # Keep the first claimant's locks open while a second drains the
            # remainder: SKIP LOCKED must avoid both duplicates and blocking.
            async with factory.begin() as first:
                assert await drain_audit_batch(first, audit_outbox, AuditLog) == 100
                async with asyncio.timeout(5):
                    async with factory.begin() as second:
                        assert await drain_audit_batch(second, audit_outbox, AuditLog) == 1
            async with factory.begin() as db:
                assert await drain_audit_batch(db, audit_outbox, AuditLog) == 0
                assert await db.scalar(sa.select(sa.func.count()).select_from(AuditLog)) == 101
                for index, field, reason in [(1, "details", "size_limit"), (2, "changes", "cycle"),
                                             (3, "details", "invalid_text"), (4, "details", "invalid_text")]:
                    saved = await db.scalar(sa.select(getattr(AuditLog, field)).where(
                        AuditLog.id == uuid.UUID(events[index]["id"]),
                    ))
                    assert saved == {"audit_metadata_omitted": {"reason": reason}}
                # A replayed source event is safely consumed without a duplicate.
                await capture_audit(db, audit_outbox, events[0])
                assert await drain_audit_batch(db, audit_outbox, AuditLog) == 1
                assert await db.scalar(sa.select(sa.func.count()).select_from(AuditLog)) == 101
            # Exercise the actual HTTP capture boundary and Main's drain worker
            # against PostgreSQL, including a failure only detected at commit.
            async with engine.begin() as connection:
                await connection.execute(sa.text(
                    f"CREATE TABLE {schema}.business (id int PRIMARY KEY DEFERRABLE INITIALLY DEFERRED)"
                ))
            runtime = DatabaseRuntime(engine, factory)

            def register(app):
                @app.post("/business", response_model=int)
                async def mutation(row_id: int, db=Depends(runtime.session)):
                    await db.execute(sa.text(f"INSERT INTO {schema}.business VALUES (:id)"), {"id": row_id})
                    return row_id

            from app.tasks.audit import _drain_pending, capture_request_audit, dispatch_audit
            dispatch = AsyncMock()
            app = create_service_app(
                ServiceAppConfig(service_name="test", title="Test", version="1", environment="development"),
                cors=CorsConfig(origins=()), register_routes=register,
                audit=AuditOptions(
                    session_factory=factory, service_name="main", token_key="test",
                    token_algorithm="HS256", token_issuer="test", token_audience="test",
                    token_key_id="test", capture=capture_request_audit, dispatch=dispatch,
                ),
            )
            async with httpx.AsyncClient(
                transport=httpx.ASGITransport(app=app, raise_app_exceptions=False), base_url="http://test",
            ) as client:
                assert (await client.post("/business?row_id=1")).status_code == 200
                dispatch.assert_not_awaited()
                assert (await client.post("/business?row_id=1")).status_code == 500
                dispatch.assert_awaited_once()
                assert dispatch.call_args.args[0]["status_code"] == 500
            async with factory() as db:
                assert await db.scalar(sa.select(sa.func.count()).select_from(audit_outbox)) == 1
            with patch("app.tasks.audit.AsyncSessionLocal", factory):
                with patch("app.tasks.audit.persist_audit.delay", side_effect=AssertionError("broker must not be used")):
                    await dispatch_audit(dispatch.call_args.args[0])
                    # Stable-ID retries of independent capture must be a no-op.
                    await dispatch_audit(dispatch.call_args.args[0])
                assert await _drain_pending() == 2
                assert await _drain_pending() == 0
                async with factory.begin() as db:
                    await capture_audit(db, audit_outbox, payload())
                async with engine.begin() as lock_connection:
                    await lock_connection.execute(sa.text(f"LOCK TABLE {schema}.audit_logs IN ACCESS EXCLUSIVE MODE"))
                    async with asyncio.timeout(3):
                        with pytest.raises(DBAPIError) as locked:
                            await _drain_pending()
                    assert locked.value.orig.sqlstate == "55P03"
                async with factory() as db:
                    assert await db.scalar(sa.select(sa.func.count()).select_from(audit_outbox)) == 1
                    assert not await has_retained_audit_failure(db, audit_outbox)
                assert await _drain_pending() == 1
            # A malformed event is retained, does not hold up healthy neighbors,
            # and can be repaired and retried with its original event ID.
            bad = dict(payload(), action=None)
            async with factory.begin() as db:
                await capture_audit(db, audit_outbox, bad)
                await capture_audit(db, audit_outbox, payload())
                await capture_audit(db, audit_outbox, payload())
            async with factory() as db:
                assert await drain_audit_batch(db, audit_outbox, AuditLog) == 2
                await db.rollback()
                assert await db.scalar(sa.select(sa.func.count()).select_from(audit_outbox)) == 3
                assert await db.scalar(sa.select(sa.func.count()).select_from(audit_outbox).where(
                    audit_outbox.c.failed_at.is_not(None),
                )) == 0
            async with factory.begin() as db:
                assert await drain_audit_batch(db, audit_outbox, AuditLog) == 2
                assert await drain_audit_batch(db, audit_outbox, AuditLog) == 0
                retained = (await db.execute(sa.select(audit_outbox))).one()
                assert retained.payload == bad
                assert retained.failed_at is not None
                assert retained.failure_code == "IntegrityError"
                assert await has_retained_audit_failure(db, audit_outbox)
            with pytest.raises(RuntimeError, match="repair retained"):
                async with engine.begin() as connection:
                    await connection.run_sync(migrate, "downgrade")
            async with factory.begin() as db:
                await db.execute(sa.update(audit_outbox).where(audit_outbox.c.id == uuid.UUID(bad["id"]))
                                 .values(payload=dict(bad, action="repaired"), failed_at=None, failure_code=None))
                assert await drain_audit_batch(db, audit_outbox, AuditLog) == 1
                assert await db.scalar(sa.select(AuditLog.action).where(AuditLog.id == uuid.UUID(bad["id"]))) == "repaired"
                assert not await has_retained_audit_failure(db, audit_outbox)
            # Corrupted/legacy JSON must not block the queue or change event
            # identity. Insert directly to exercise recovery beyond capture.
            corrupt = [[], None, {}, dict(payload(), id="invalid"), payload()]
            records = [{"id": uuid.uuid4(), "payload": value} for value in corrupt]
            healthy = payload()
            async with factory.begin() as db:
                await db.execute(sa.insert(audit_outbox), records)
                await capture_audit(db, audit_outbox, healthy)
            async with factory.begin() as db:
                assert await drain_audit_batch(db, audit_outbox, AuditLog) == 1
                assert await drain_audit_batch(db, audit_outbox, AuditLog) == 0
                retained = (await db.execute(sa.select(audit_outbox))).all()
                assert {row.id for row in retained} == {row["id"] for row in records}
                assert all(row.failed_at is not None and row.failure_code == "ValueError" for row in retained)
                for row in retained:
                    assert row.payload == next(record["payload"] for record in records if record["id"] == row.id)
                assert await db.scalar(sa.select(AuditLog.id).where(AuditLog.id == uuid.UUID(healthy["id"])))
                assert await db.scalar(sa.select(AuditLog.id).where(AuditLog.id == uuid.UUID(corrupt[-1]["id"]))) is None
                for record in records:
                    await db.execute(sa.update(audit_outbox).where(audit_outbox.c.id == record["id"])
                                     .values(payload=dict(payload(), id=str(record["id"])),
                                             failed_at=None, failure_code=None))
                assert await drain_audit_batch(db, audit_outbox, AuditLog) == len(records)
            async with engine.begin() as connection:
                await connection.run_sync(migrate, "downgrade")
        finally:
            async with engine.begin() as connection:
                await connection.execute(sa.text(f"DROP SCHEMA IF EXISTS {schema} CASCADE"))
            await engine.dispose()

    asyncio.run(exercise())
