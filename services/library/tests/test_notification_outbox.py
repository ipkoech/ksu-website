import asyncio
import importlib.util
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest
import sqlalchemy as sa
from alembic.migration import MigrationContext
from alembic.operations import Operations
from cryptography.fernet import Fernet
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.models.notification import notification_outbox as table
from app.services.notification_outbox import _claim, deliver_pending, enqueue_notification


@pytest.mark.asyncio
async def test_notifications_are_committed_encrypted_leased_and_retried(monkeypatch):
    url = os.environ.get("KSU_TEST_DATABASE_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_DATABASE_URL required")
    schema = "notification_test_" + uuid4().hex
    engine = create_async_engine(url, execution_options={"schema_translate_map": {"library": schema}})
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    settings = SimpleNamespace(NOTIFICATION_ENCRYPTION_KEY=Fernet.generate_key().decode())
    payload = {"to_email": "disposable@example.invalid", "text_body": "synthetic-secret-token"}
    expiry = datetime.now(timezone.utc) + timedelta(hours=1)
    send = AsyncMock()
    try:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"CREATE SCHEMA {schema}"))
            path = Path(__file__).parents[1] / "migrations/versions/20260907_0012_notification_outbox.py"
            spec = importlib.util.spec_from_file_location("notification_migration", path)
            migration = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(migration)
            def upgrade(sync):
                monkeypatch.setattr(migration, "op", Operations(MigrationContext.configure(sync)))
                migration.upgrade()
            await conn.run_sync(upgrade)
        async with sessions() as db:
            await enqueue_notification(db, payload, expires_at=expiry, settings=settings)
            await db.rollback()
        assert await deliver_pending(sessions, settings=settings, send=send) == 0
        send.assert_not_awaited()
        async with sessions.begin() as db:
            identifier = await enqueue_notification(db, payload, expires_at=expiry, settings=settings)
            encrypted = await db.scalar(sa.select(table.c.encrypted_payload))
            assert "synthetic-secret-token" not in encrypted and "disposable@" not in encrypted
        results = await asyncio.gather(*(deliver_pending(sessions, settings=settings, send=send) for _ in range(2)))
        assert sum(results) == 1 and send.await_count == 1
        assert send.call_args.args[:2] == (payload, identifier)
        async with sessions() as db:
            assert await db.scalar(sa.select(table.c.encrypted_payload)) is None
        async with sessions.begin() as db:
            retry_id = await enqueue_notification(db, payload, expires_at=expiry, settings=settings)
        failing = AsyncMock(side_effect=RuntimeError("secret-provider-error"))
        assert await deliver_pending(sessions, settings=settings, send=failing) == 0
        async with sessions.begin() as db:
            row = (await db.execute(sa.select(table).where(table.c.id == retry_id))).mappings().one()
            assert row["attempts"] == 1 and row["failure_code"] == "delivery_failed" and row["status"] == "pending"
            await db.execute(sa.update(table).where(table.c.id == retry_id).values(available_at=sa.func.now()))
            old_claim = await _claim(db)
        async with sessions.begin() as db:
            await db.execute(sa.update(table).where(table.c.id == retry_id).values(available_at=sa.func.now()))
            new_claim = await _claim(db)
            assert new_claim["claim_token"] != old_claim["claim_token"]
            result = await db.execute(sa.update(table).where(table.c.id == retry_id, table.c.claim_token == old_claim["claim_token"]).values(status="delivered"))
            assert result.rowcount == 0
            await db.execute(sa.update(table).where(table.c.id == retry_id).values(available_at=sa.func.now(), attempts=4))
        await deliver_pending(sessions, settings=settings, send=failing)
        async with sessions() as db:
            row = (await db.execute(sa.select(table).where(table.c.id == retry_id))).mappings().one()
            assert row["status"] == "failed" and row["attempts"] == 5 and row["encrypted_payload"] is None
    finally:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"DROP SCHEMA {schema} CASCADE"))
        await engine.dispose()
