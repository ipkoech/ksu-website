import asyncio
import importlib.util
import os
import time
from pathlib import Path
from datetime import datetime, timezone
from unittest.mock import AsyncMock, Mock
from uuid import uuid4

import pytest
import sqlalchemy as sa
from fastapi import HTTPException
from alembic.migration import MigrationContext
from alembic.operations import Operations
from ksu_common.auth import TokenPayload
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.orm import noload

from app.models import IntegrationJob, OutboxEvent, Session, User
from app.services import integration_jobs
from app.tasks import digital_sync


@pytest.mark.asyncio
async def test_durable_job_transaction_authority_replay_and_safe_failure(monkeypatch):
    url = os.environ.get("KSU_TEST_DATABASE_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_DATABASE_URL required")
    schema = "integration_" + uuid4().hex
    engine = create_async_engine(url, pool_size=2, max_overflow=0,
                                 connect_args={"server_settings": {"search_path": f"{schema},public"}})
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    actor_id = uuid4()
    school_id = uuid4()
    grants = [{"scope_type": "global", "permissions": ["academic.manage_programmes"]}]
    actor = TokenPayload(str(actor_id), "job-session", raw={"scope_grants": grants,
                         "mfa_enabled": True, "mfa_verified_at": time.time()})
    dispatch = Mock()
    monkeypatch.setattr(integration_jobs, "enqueue_celery_after_commit", dispatch)
    monkeypatch.setattr(digital_sync, "AsyncSessionLocal", sessions)
    monkeypatch.setattr(digital_sync, "_active_scope_grants", lambda _: grants)

    async def load_user(db, identifier):
        return await db.get(User, identifier, options=(noload("*"),))
    monkeypatch.setattr(digital_sync.UserService, "get_by_id", load_user)
    synchronize = AsyncMock(return_value={"updated": 1, "errors": []})
    monkeypatch.setattr(digital_sync.DigitalLecturerSyncService, "sync_programmes", synchronize)
    try:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"CREATE SCHEMA {schema}"))
            await conn.execute(sa.text("CREATE TABLE schools (id uuid PRIMARY KEY, is_active boolean, deleted_at timestamptz)"))
            await conn.execute(sa.text("INSERT INTO schools VALUES (:id, true, NULL)"), {"id": school_id})
            for model in (User, Session, OutboxEvent):
                await conn.run_sync(model.__table__.create)
            path = Path(__file__).parents[1] / "migrations/versions/20260907_0013_integration_jobs.py"
            spec = importlib.util.spec_from_file_location("integration_migration", path)
            migration = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(migration)

            def upgrade(sync):
                monkeypatch.setattr(migration, "op", Operations(MigrationContext.configure(sync)))
                migration.upgrade()
            await conn.run_sync(upgrade)
            path = Path(__file__).parents[1] / "migrations/versions/20260907_0014_integration_replay.py"
            spec = importlib.util.spec_from_file_location("integration_replay_migration", path)
            migration = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(migration)
            await conn.run_sync(upgrade)
            path = Path(__file__).parents[1] / "migrations/versions/20260907_0017_integration_attempt_history.py"
            spec = importlib.util.spec_from_file_location("integration_attempt_migration", path)
            migration = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(migration)
            await conn.run_sync(upgrade)
            await conn.execute(sa.insert(User).values(id=actor_id, email="jobs@example.test", password_hash="synthetic",
                                                     full_name="Unchanged", mfa_enabled=True))
            await conn.execute(sa.insert(Session).values(id=uuid4(), user_id=actor_id, jti=actor.jti,
                                                        token_type="refresh", is_active=True,
                                                        mfa_verified_at=datetime.now(timezone.utc)))
        with pytest.raises(RuntimeError):
            async with sessions.begin() as db:
                await integration_jobs.create_job(db, actor, "programmes")
                raise RuntimeError("rollback")
        async with sessions() as db:
            assert await db.scalar(sa.select(sa.func.count()).select_from(IntegrationJob)) == 0
            assert await db.scalar(sa.select(sa.func.count()).select_from(OutboxEvent)) == 0
        async def trigger():
            async with sessions.begin() as db:
                return await integration_jobs.create_job(db, actor, "programmes", idempotency_key="stable-command", request_id="original-request")
        jobs = await asyncio.gather(trigger(), trigger())
        job = jobs[0]
        job_id = str(job.id)
        assert jobs[1].id == job.id
        async with sessions() as db:
            assert await db.scalar(sa.select(sa.func.count()).select_from(IntegrationJob)) == 1
            assert await db.scalar(sa.select(sa.func.count()).select_from(OutboxEvent)) == 1
            assert job.request_id == "original-request"
            assert job.idempotency_digest != "stable-command"
            event = await db.scalar(sa.select(OutboxEvent))
            assert event.resource_id == job.id and event.actor_id == actor_id
            foreign = TokenPayload(str(uuid4()), "other", raw=actor.raw)
            with pytest.raises(HTTPException) as denied:
                await integration_jobs.read_job(db, foreign, "programmes", job_id)
            assert denied.value.status_code == 403
            with pytest.raises(HTTPException) as missing:
                await integration_jobs.read_job(db, actor, "lecturers", job_id)
            assert missing.value.status_code == 404
        results = await asyncio.gather(digital_sync._run_job(job_id), digital_sync._run_job(job_id))
        assert all(result["status"] == "SUCCESS" for result in results)
        assert all(result["attempts"] == 1 and len(result["history"]) == 1 and not result["retryable"] for result in results)
        synchronize.assert_awaited_once()
        grants.append({"scope_type": "school", "scope_id": str(school_id), "permissions": ["school.integrations.programmes.sync"]})
        async with sessions.begin() as db:
            scoped = await integration_jobs.create_job(db, actor, "programmes", scope_type="school", scope_id=school_id)
            scoped_id = str(scoped.id)
        assert (await digital_sync._run_job(scoped_id))["status"] == "SUCCESS"
        assert synchronize.call_args.kwargs["school_id"] == school_id
        grants.append({"scope_type": "school", "scope_id": str(school_id), "permissions": ["school.integrations.lecturers.sync"]})
        lecturer_sync = AsyncMock(return_value={"updated": 1, "errors": []})
        monkeypatch.setattr(digital_sync.DigitalLecturerSyncService, "sync", lecturer_sync)
        async with sessions.begin() as db:
            lecturer_job = await integration_jobs.create_job(db, actor, "lecturers", scope_type="school", scope_id=school_id)
        assert (await digital_sync._run_job(str(lecturer_job.id)))["status"] == "SUCCESS"
        assert lecturer_sync.call_args.kwargs["school_id"] == school_id
        async with sessions.begin() as db:
            inactive = await integration_jobs.create_job(db, actor, "programmes", scope_type="school", scope_id=school_id)
            inactive_id = str(inactive.id)
            await db.execute(sa.text("UPDATE schools SET is_active=false"))
        calls = synchronize.await_count
        inactive_result = await digital_sync._run_job(inactive_id)
        assert inactive_result["status"] == "FAILURE"
        assert inactive_result["attempts"] == 1 and not inactive_result["retryable"]
        assert synchronize.await_count == calls
        async with sessions.begin() as db:
            failed = await integration_jobs.create_job(db, actor, "programmes")
            failed_id = str(failed.id)

        async def fail(db, **_):
            await db.execute(sa.update(User).where(User.id == actor_id).values(full_name="Must rollback"))
            raise ValueError("secret upstream diagnostic")
        monkeypatch.setattr(digital_sync.DigitalLecturerSyncService, "sync_programmes", fail)
        with pytest.raises(RuntimeError):
            await digital_sync._run_job(failed_id)
        async with sessions() as db:
            failed = await db.get(IntegrationJob, failed.id)
            assert failed.status == "FAILURE" and failed.attempts == 1
            assert "secret" not in failed.error
            assert await db.scalar(sa.select(User.full_name)) == "Unchanged"
        async with sessions.begin() as db:
            await db.execute(sa.update(Session).values(is_active=False))
        result = await digital_sync._run_job(failed_id)
        assert result["status"] == "FAILURE" and result["error"] == "Integration authorization expired"
        assert result["attempts"] == 2 and not result["retryable"]
        assert len(result["history"]) == 2
        assert "secret" not in str(result["history"])
        assert await digital_sync._run_job(failed_id) == result
    finally:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"DROP SCHEMA {schema} CASCADE"))
        await engine.dispose()


@pytest.mark.asyncio
async def test_job_outbox_dispatch_does_not_publish_results_to_public_event_stream(monkeypatch):
    from app.tasks import outbox

    event = OutboxEvent(id=uuid4(), event_type="integration.sync_requested", event_version=1,
                        occurred_at=datetime.now(timezone.utc), scope_type="global", scope_id=None,
                        actor_id=uuid4(), resource_type="integration_job", resource_id=uuid4(),
                        payload={"args": [str(uuid4())]})
    monkeypatch.setattr(outbox, "_claim_event", AsyncMock(return_value=event))
    finish = AsyncMock(return_value=True)
    monkeypatch.setattr(outbox, "_finish_claim", finish)
    dispatch = Mock()
    monkeypatch.setattr(outbox.celery_app, "send_task", dispatch)
    redis = AsyncMock()
    monkeypatch.setattr(outbox, "get_redis", redis)
    assert await outbox._publish_one(event.id) == "published"
    dispatch.assert_called_once_with("main.digital_sync.run_job", args=event.payload["args"])
    redis.assert_not_awaited()


def test_worker_retries_infrastructure_failure_without_exposing_connection_details(monkeypatch):
    def infrastructure_failure(coroutine):
        coroutine.close()
        raise ConnectionError("sensitive connection detail")
    monkeypatch.setattr(digital_sync, "run_worker_async", infrastructure_failure)
    retry = Mock(side_effect=RuntimeError("retry requested"))
    monkeypatch.setattr(digital_sync.run_integration_job, "retry", retry)
    with pytest.raises(RuntimeError, match="retry requested"):
        digital_sync.run_integration_job.run(str(uuid4()))
    assert str(retry.call_args.kwargs["exc"]) == "Integration synchronization failed"
    assert retry.call_args.kwargs["countdown"] == 30
    assert digital_sync.run_integration_job.max_retries == 3
