"""Beat tasks that move scheduled/expiring content through the workflow."""
from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select

from ..api.v1.content_workflow import CONTENT_MODELS
from ..core.database import AsyncSessionLocal
from ..services.content_workflow import ContentWorkflowService
from .celery_app import celery_app


def _has_column(model: Any, name: str) -> bool:
    return hasattr(model, name)


async def publish_due_content(db, *, now: datetime | None = None) -> int:
    """Promote scheduled records whose publish time has passed. Returns count."""
    now = now or datetime.now(timezone.utc)
    promoted = 0
    for content_type, model in CONTENT_MODELS.items():
        if not (_has_column(model, "workflow_status") and _has_column(model, "scheduled_publish_at")):
            continue
        conditions = [
            model.workflow_status == "scheduled",
            model.scheduled_publish_at.is_not(None),
            model.scheduled_publish_at <= now,
        ]
        if _has_column(model, "deleted_at"):
            conditions.append(model.deleted_at.is_(None))
        rows = (await db.execute(select(model).where(*conditions))).scalars().all()
        for record in rows:
            # Direct stamped transition: scheduled -> published, actor=None (system).
            record.status = "published"
            record.workflow_status = "published"
            record.is_published = True
            if _has_column(record, "is_public"):
                record.is_public = True
            record.published_at = now
            db.add(ContentWorkflowService.build_log(
                content_type=content_type,
                content_id=record.id,
                from_status="scheduled",
                to_status="published",
                action="system_publish",
                actor_id=None,
                comments="Published automatically at the scheduled time.",
            ))
            promoted += 1
    await db.commit()
    return promoted


async def expire_due_content(db, *, now: datetime | None = None) -> int:
    """Unpublish published records whose expiry time has passed. Returns count."""
    now = now or datetime.now(timezone.utc)
    expired = 0
    for content_type, model in CONTENT_MODELS.items():
        if not (_has_column(model, "workflow_status") and _has_column(model, "expires_at")):
            continue
        conditions = [
            model.workflow_status == "published",
            model.expires_at.is_not(None),
            model.expires_at <= now,
        ]
        if _has_column(model, "deleted_at"):
            conditions.append(model.deleted_at.is_(None))
        rows = (await db.execute(select(model).where(*conditions))).scalars().all()
        for record in rows:
            # Direct stamped transition: published -> unpublished, actor=None (system).
            record.status = "unpublished"
            record.workflow_status = "unpublished"
            record.is_published = False
            if _has_column(record, "is_public"):
                record.is_public = False
            if _has_column(record, "unpublished_at"):
                record.unpublished_at = now
            db.add(ContentWorkflowService.build_log(
                content_type=content_type,
                content_id=record.id,
                from_status="published",
                to_status="unpublished",
                action="system_expire",
                actor_id=None,
                comments="Unpublished automatically — expiry date reached.",
            ))
            expired += 1
    await db.commit()
    return expired


@celery_app.task(name="main.content.publish_due")
def publish_due() -> int:
    async def _run() -> int:
        async with AsyncSessionLocal() as db:
            return await publish_due_content(db)

    return asyncio.run(_run())


@celery_app.task(name="main.content.expire_due")
def expire_due() -> int:
    async def _run() -> int:
        async with AsyncSessionLocal() as db:
            return await expire_due_content(db)

    return asyncio.run(_run())


__all__ = [
    "expire_due",
    "expire_due_content",
    "publish_due",
    "publish_due_content",
]
