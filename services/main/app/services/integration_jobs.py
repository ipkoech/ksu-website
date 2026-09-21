"""Durable integration requests; no Celery result-backend authority."""

import uuid
from hashlib import sha256
from datetime import datetime, timezone

from fastapi import HTTPException
from ksu_common.assurance import require_recent_mfa
from ksu_contracts.rbac import AuthorizationScope, authorize_permission
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert

from ..models import IntegrationJob, OutboxEvent
from .domain_events import enqueue_celery_after_commit

INTEGRATION_PERMISSIONS = {"lecturers": "staff.manage_profiles", "programmes": "academic.manage_programmes"}


def authorize_job(actor, integration, *, owner_id=None, scope_type="global", scope_id=None):
    permission = INTEGRATION_PERMISSIONS.get(integration)
    if permission is None:
        raise HTTPException(404, "Integration not found")
    if scope_type == "school" and scope_id is not None:
        permission = f"school.integrations.{integration}.sync"
    elif scope_type != "global" or scope_id is not None:
        raise HTTPException(403, "Unsupported integration scope")
    if not authorize_permission(actor, permission, AuthorizationScope(scope_type, scope_id)).allowed:
        raise HTTPException(403, "Integration authority required for this scope")
    if owner_id is not None and str(owner_id) != actor.sub:
        if not authorize_permission(actor, "platform.admin", AuthorizationScope("global")).allowed:
            raise HTTPException(403, "Integration job belongs to another actor")
    require_recent_mfa(actor)


async def create_job(db, actor, integration, *, idempotency_key=None, request_id=None, scope_type="global", scope_id=None):
    authorize_job(actor, integration, scope_type=scope_type, scope_id=scope_id)
    if idempotency_key is not None and (not isinstance(idempotency_key, str) or not 1 <= len(idempotency_key) <= 128):
        raise HTTPException(422, "Invalid Idempotency-Key")
    if request_id is not None and (not isinstance(request_id, str) or not 1 <= len(request_id) <= 128):
        raise HTTPException(422, "Invalid request correlation ID")
    digest = sha256(idempotency_key.encode()).hexdigest() if idempotency_key is not None else None
    actor_id = uuid.UUID(actor.sub)
    job = await db.scalar(insert(IntegrationJob).values(
        id=uuid.uuid4(), actor_id=actor_id, session_jti=actor.jti,
        integration=integration, scope_type=scope_type, scope_id=scope_id, status="PENDING", attempts=0,
        idempotency_digest=digest, request_id=request_id,
    ).on_conflict_do_nothing(constraint="uq_integration_job_request").returning(IntegrationJob))
    if job is None:
        job = await db.scalar(select(IntegrationJob).where(
            IntegrationJob.actor_id == actor_id, IntegrationJob.integration == integration,
            IntegrationJob.idempotency_digest == digest,
        ))
        if job is None or job.deleted_at is not None or job.scope_type != scope_type or job.scope_id != scope_id:
            raise HTTPException(409, "Idempotency key conflicts with an existing command")
        return job
    event = OutboxEvent(id=uuid.uuid4(), event_type="integration.sync_requested", event_version=1,
                        occurred_at=datetime.now(timezone.utc), scope_type=scope_type, scope_id=scope_id,
                        actor_id=job.actor_id, resource_type="integration_job", resource_id=job.id,
                        payload={"args": [str(job.id)]}, delivery_status="pending", publish_attempts=0)
    db.add(event)
    await db.flush()
    enqueue_celery_after_commit(db, "main.outbox.publish_one", args=[str(event.id)], recoverable=True)
    return job


async def read_job(db, actor, integration, job_id):
    try:
        identifier = uuid.UUID(job_id)
    except ValueError as exc:
        raise HTTPException(404, "Integration job not found") from exc
    job = await db.scalar(select(IntegrationJob).where(IntegrationJob.id == identifier,
                          IntegrationJob.integration == integration, IntegrationJob.deleted_at.is_(None)))
    if job is None:
        raise HTTPException(404, "Integration job not found")
    authorize_job(actor, integration, owner_id=job.actor_id, scope_type=job.scope_type, scope_id=job.scope_id)
    return job


def job_payload(job):
    return {"job_id": str(job.id), "status": job.status, "result": job.result, "error": job.error,
            "attempts": job.attempts, "retryable": job.retryable, "history": job.retry_history or []}
