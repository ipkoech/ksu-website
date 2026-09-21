"""Exercise real outbox claims in a generated schema of a disposable database."""

import asyncio
import os
import uuid
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, Mock

import pytest
from sqlalchemy import text, update
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.models import OutboxEvent
from app.tasks import outbox

TEST_URL = os.environ.get("KSU_TEST_DATABASE_URL")
pytestmark = pytest.mark.skipif(not TEST_URL, reason="disposable KSU_TEST_DATABASE_URL required")


def test_claim_fencing_retry_duplicate_delivery_and_exhaustion(monkeypatch):
    async def exercise():
        schema = "outbox_probe_" + uuid.uuid4().hex
        engine = create_async_engine(TEST_URL, execution_options={"schema_translate_map": {None: schema}})
        factory = async_sessionmaker(engine, expire_on_commit=False)
        monkeypatch.setattr(outbox, "AsyncSessionLocal", factory)
        redis = AsyncMock()
        redis.xadd.return_value = "123-0"
        monkeypatch.setattr(outbox, "get_redis", AsyncMock(return_value=redis))
        monkeypatch.setattr(outbox.celery_app, "send_task", Mock())
        try:
            async with engine.begin() as connection:
                await connection.execute(text(f"CREATE SCHEMA {schema}"))
                await connection.execute(text(f"CREATE TABLE {schema}.users (id uuid PRIMARY KEY)"))
                await connection.run_sync(OutboxEvent.__table__.create)
            async with factory.begin() as db:
                record = OutboxEvent(
                    event_type="test.created", event_version=1,
                    occurred_at=datetime.now(timezone.utc), scope_type="global",
                    resource_type="test", resource_id=uuid.uuid4(), payload={},
                )
                db.add(record)
                await db.flush()
                event_id = record.id

            claims = await asyncio.gather(outbox._claim_event(event_id), outbox._claim_event(event_id))
            assert sum(claim is not None for claim in claims) == 1
            first = next(claim for claim in claims if claim is not None)
            assert first.publish_attempts == 1
            async with factory.begin() as db:
                await db.execute(update(OutboxEvent).where(OutboxEvent.id == event_id).values(
                    updated_at=datetime.now(timezone.utc) - timedelta(minutes=6),
                ))
            second = await outbox._claim_event(event_id)
            assert second.publish_attempts == 2
            assert not await outbox._finish_claim(first)
            assert not await outbox._finish_claim(first, error="late failure")
            assert await outbox._finish_claim(second, error="ConnectionError")
            assert await outbox._claim_event(event_id) is None
            async with factory.begin() as db:
                await db.execute(update(OutboxEvent).where(OutboxEvent.id == event_id).values(
                    next_attempt_at=datetime.now(timezone.utc) - timedelta(seconds=1),
                ))
            assert await outbox._publish_one(event_id) == "published"
            assert await outbox._publish_one(event_id) == "skipped"
            redis.xadd.assert_awaited_once()
            redis.publish.assert_awaited_once()

            async with factory.begin() as db:
                email_event = OutboxEvent(
                    event_type="auth.password_reset_email", event_version=1,
                    occurred_at=datetime.now(timezone.utc), scope_type="main",
                    resource_type="auth_email", resource_id=uuid.uuid4(),
                    payload={"args": ["user@example.test", "opaque-token", "web"]},
                )
                db.add(email_event)
                await db.flush()
                email_event_id = email_event.id
            outbox.celery_app.send_task.reset_mock()
            assert await outbox._publish_one(email_event_id) == "published"
            outbox.celery_app.send_task.assert_called_once_with(
                "main.email.send_password_reset",
                args=["user@example.test", "opaque-token", "web"],
            )
            redis.xadd.assert_awaited_once()
            async with factory() as db:
                assert await db.scalar(
                    OutboxEvent.__table__.select()
                    .with_only_columns(OutboxEvent.__table__.c.payload)
                    .where(OutboxEvent.__table__.c.id == email_event_id)
                ) == {}

            async with factory.begin() as db:
                account_event = OutboxEvent(
                    event_type="auth.account_created_email", event_version=1,
                    occurred_at=datetime.now(timezone.utc), scope_type="main",
                    resource_type="auth_email", resource_id=uuid.uuid4(),
                    payload={"args": ["new@example.test", "New User", "TempPass1"]},
                )
                db.add(account_event)
                await db.flush()
                account_event_id = account_event.id
            outbox.celery_app.send_task.reset_mock()
            assert await outbox._publish_one(account_event_id) == "published"
            outbox.celery_app.send_task.assert_called_once_with(
                "main.email.send_account_created",
                args=["new@example.test", "New User", "TempPass1"],
            )
            async with factory() as db:
                assert await db.scalar(
                    OutboxEvent.__table__.select()
                    .with_only_columns(OutboxEvent.__table__.c.payload)
                    .where(OutboxEvent.__table__.c.id == account_event_id)
                ) == {}

            async with factory.begin() as db:
                await db.execute(update(OutboxEvent).where(OutboxEvent.id == event_id).values(
                    delivery_status="publishing", published_at=None,
                    publish_attempts=outbox.MAX_PUBLISH_ATTEMPTS,
                    updated_at=datetime.now(timezone.utc) - timedelta(minutes=6),
                ))
            assert await outbox._claim_event(event_id) is None
            async with factory() as db:
                exhausted = await db.get(OutboxEvent, event_id)
                assert exhausted.delivery_status == "dead_letter"
                assert exhausted.dead_lettered_at is not None
                assert exhausted.publish_attempts == outbox.MAX_PUBLISH_ATTEMPTS
        finally:
            async with engine.begin() as connection:
                await connection.execute(text(f"DROP SCHEMA IF EXISTS {schema} CASCADE"))
            await engine.dispose()

    asyncio.run(exercise())
