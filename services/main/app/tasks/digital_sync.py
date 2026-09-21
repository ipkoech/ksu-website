"""Background tasks for external Digital Kisii synchronization."""

from __future__ import annotations

from typing import Any
import asyncio
import uuid
from datetime import datetime, timezone

from fastapi import HTTPException
from ksu_common.auth import TokenPayload
from sqlalchemy import select

from ksu_common.task_queue import run_worker_async

from ..core.config import get_settings
from ..core.database import AsyncSessionLocal
from ..services.digital_lecturers import DigitalLecturerSyncService
from ..models import IntegrationJob, School, Session
from ..services.integration_jobs import authorize_job, job_payload
from ..services.auth import _active_scope_grants
from ..services.user import UserService
from .celery_app import celery_app


async def _synchronize_lecturers() -> dict[str, Any]:
    async with AsyncSessionLocal() as db:
        result = await DigitalLecturerSyncService.sync(db, url=get_settings().DIGITAL_LECTURERS_URL)
        await db.commit()
        return result


async def _synchronize_programmes() -> dict[str, Any]:
    async with AsyncSessionLocal() as db:
        result = await DigitalLecturerSyncService.sync_programmes(db, url=get_settings().DIGITAL_PROGRAMMES_URL)
        await db.commit()
        return result


@celery_app.task(name="main.digital_sync.lecturers")
def synchronize_lecturers() -> dict[str, Any]:
    return run_worker_async(_synchronize_lecturers())


@celery_app.task(name="main.digital_sync.programmes")
def synchronize_programmes() -> dict[str, Any]:
    return run_worker_async(_synchronize_programmes())


async def _run_job(job_id):
    identifier = uuid.UUID(job_id)
    try:
        async with AsyncSessionLocal() as db:
            async with db.begin():
                job = await db.scalar(select(IntegrationJob).where(IntegrationJob.id == identifier,
                                      IntegrationJob.deleted_at.is_(None)).with_for_update())
                if job is None:
                    return {"status": "MISSING"}
                if not job.retryable or job.status == "SUCCESS" or job.attempts >= 4:
                    return job_payload(job)
                user = await UserService.get_by_id(db, job.actor_id)
                session = await db.scalar(select(Session).where(Session.user_id == job.actor_id,
                                          Session.jti == job.session_jti))
                if user is None or not user.is_active or session is None or not session.is_valid():
                    raise HTTPException(403, "Integration authorization expired")
                actor = TokenPayload(str(user.id), job.session_jti, raw={
                    "scope_grants": _active_scope_grants(user), "mfa_enabled": user.mfa_enabled is True,
                    "mfa_verified_at": session.mfa_verified_at.timestamp() if session.mfa_verified_at else None,
                })
                authorize_job(actor, job.integration, scope_type=job.scope_type, scope_id=job.scope_id)
                scoped_options = {}
                if job.scope_type == "school":
                    school = await db.scalar(select(School.id).where(School.id == job.scope_id,
                                             School.deleted_at.is_(None), School.is_active.is_(True)))
                    if school is None:
                        raise HTTPException(403, "School is inactive or missing")
                    scoped_options["school_id"] = school
                job.started_at = datetime.now(timezone.utc)
                job.attempts += 1
                async with asyncio.timeout(180):
                    if job.integration == "lecturers":
                        result = await DigitalLecturerSyncService.sync(db, url=get_settings().DIGITAL_LECTURERS_URL, **scoped_options)
                    else:
                        result = await DigitalLecturerSyncService.sync_programmes(db, url=get_settings().DIGITAL_PROGRAMMES_URL, **scoped_options)
                if result.get("errors"):
                    result["errors"] = [{**item, "error": "Record requires reconciliation"} for item in result["errors"]]
                job.result = result
                job.status = "SUCCESS"
                job.error = None
                job.finished_at = datetime.now(timezone.utc)
                job.retryable = False
                job.retry_history = [*(job.retry_history or []), {
                    "attempt": job.attempts, "status": "SUCCESS",
                    "finished_at": job.finished_at.isoformat(), "error": None,
                }]
                await db.flush()
                payload = job_payload(job)
            return payload
    except Exception as exc:
        # The business transaction rolled back. Persist only a safe failure in
        # its own transaction so retries remain observable and bounded.
        async with AsyncSessionLocal() as db:
            async with db.begin():
                job = await db.scalar(select(IntegrationJob).where(IntegrationJob.id == identifier).with_for_update())
                if job is None:
                    return {"status": "MISSING"}
                if not job.retryable or job.status == "SUCCESS" or job.attempts >= 4:
                    return job_payload(job)
                job.attempts += 1
                job.status = "FAILURE"
                job.error = "Integration authorization expired" if isinstance(exc, HTTPException) else "Synchronization failed; retry or reconcile the source"
                job.finished_at = datetime.now(timezone.utc)
                job.retryable = not isinstance(exc, HTTPException) and job.attempts < 4
                job.retry_history = [*(job.retry_history or []), {
                    "attempt": job.attempts, "status": "FAILURE",
                    "finished_at": job.finished_at.isoformat(), "error": job.error,
                }]
                terminal = not job.retryable
                payload = job_payload(job)
        if terminal:
            return payload
        raise RuntimeError("Integration synchronization failed") from None


async def _dispatch_pending_jobs() -> int:
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(IntegrationJob)
            .where(IntegrationJob.status == "PENDING", IntegrationJob.deleted_at.is_(None))
            .with_for_update(skip_locked=True).limit(50)
        )
        rows = list(result.scalars().all())
        identifiers = [str(item.id) for item in rows]
        for row in rows:
            row.status = "DISPATCHED"
        await db.commit()
    failed: set[str] = set()
    for identifier in identifiers:
        try:
            run_integration_job.delay(identifier)
        except Exception:  # noqa: BLE001 - broker failure is retried by reconciliation.
            failed.add(identifier)
    if failed:
        async with AsyncSessionLocal() as db:
            async with db.begin():
                result = await db.execute(select(IntegrationJob).where(IntegrationJob.id.in_(
                    [uuid.UUID(item) for item in failed],
                )).with_for_update())
                for row in result.scalars():
                    if row.status == "DISPATCHED":
                        row.status = "PENDING"
    return len(identifiers) - len(failed)


@celery_app.task(name="main.digital_sync.dispatch_pending", ignore_result=True)
def dispatch_pending_integration_jobs() -> int:
    return run_worker_async(_dispatch_pending_jobs())


@celery_app.task(name="main.digital_sync.run_job", bind=True, max_retries=3,
                 acks_late=True, reject_on_worker_lost=True)
def run_integration_job(self, job_id):
    try:
        return run_worker_async(_run_job(job_id))
    except Exception:
        raise self.retry(exc=RuntimeError("Integration synchronization failed"), countdown=30) from None
