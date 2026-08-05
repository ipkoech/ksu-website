from __future__ import annotations

from uuid import UUID

from .celery_app import celery_app


@celery_app.task(name="heri.publish_social_job")
def publish_social_job(job_id: str) -> str:
    """Queue seam for provider-backed publication."""
    UUID(job_id)
    return job_id
