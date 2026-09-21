from __future__ import annotations

from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy import or_, select

from .celery_app import celery_app
from ..core.database import AsyncSessionLocal
from ..models import SocialPublication
from ..services.social import MockSocialProvider
from ksu_common.task_queue import run_worker_async


@celery_app.task(
    name="heri.publish_social_job",
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=300,
    max_retries=5,
)
def publish_social_job(job_id: str) -> str:
    """Queue seam for provider-backed publication."""
    UUID(job_id)
    return run_worker_async(_publish_social_job(job_id))


async def _publish_social_job(job_id: str) -> str:
    identifier = UUID(job_id)
    provider = MockSocialProvider()
    try:
        async with AsyncSessionLocal() as db:
            async with db.begin():
                row = await db.scalar(
                    select(SocialPublication).where(SocialPublication.id == identifier).with_for_update()
                )
                if row is None or row.status == "published":
                    return job_id
                result = await provider.publish(row.platform, row.caption, [])
                row.status = result.status
                row.external_post_id = result.external_post_id
                row.error_message = None
                return job_id
    except Exception as exc:
        async with AsyncSessionLocal() as db:
            async with db.begin():
                row = await db.scalar(
                    select(SocialPublication).where(SocialPublication.id == identifier).with_for_update()
                )
                if row is not None:
                    row.status = "failed"
                    row.retry_count = (row.retry_count or 0) + 1
                    row.error_message = str(exc)[:1000]
        raise


@celery_app.task(name="heri.publish_due_social_jobs", ignore_result=True)
def publish_due_social_jobs() -> None:
    run_worker_async(_publish_due_social_jobs())


async def _publish_due_social_jobs() -> None:
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(SocialPublication)
            .where(
                SocialPublication.status == "queued",
                or_(
                    SocialPublication.scheduled_at.is_(None),
                    SocialPublication.scheduled_at <= datetime.now(timezone.utc),
                ),
            )
            .with_for_update(skip_locked=True).limit(50)
        )
        rows = list(result.scalars().all())
        for row in rows:
            row.status = "publishing"
            try:
                publish_social_job.delay(str(row.id))
            except Exception:  # noqa: BLE001 - reconciliation retries queued rows.
                row.status = "queued"
        await db.commit()
