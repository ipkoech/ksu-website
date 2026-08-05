"""Celery tasks for scheduled social media publishing."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import selectinload
from ksu_common.task_queue import run_worker_async

from ..core.database import AsyncSessionLocal
from ..helpers import get_social_adapter
from ..models import Media, SocialMediaDelivery, SocialMediaPost
from ..services import SocialPlatformAccountService
from .celery_app import celery_app


async def _publish_social_post(post_id: str, *, dry_run: bool = False) -> None:
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(SocialMediaPost)
            .options(selectinload(SocialMediaPost.deliveries))
            .where(SocialMediaPost.id == uuid.UUID(post_id), SocialMediaPost.deleted_at.is_(None))
        )
        post = result.scalar_one_or_none()
        if post is None:
            return

        media: list[Media] = []
        if post.media_ids:
            media_result = await db.execute(
                select(Media).where(Media.id.in_(post.media_ids), Media.deleted_at.is_(None))
            )
            media = media_result.scalars().all()

        overall_success = True
        platform_post_ids = dict(post.platform_post_ids or {})
        for platform in post.platforms or []:
            delivery = next((item for item in post.deliveries if item.platform == platform), None)
            if delivery is None:
                delivery = SocialMediaDelivery(
                    social_post=post,
                    platform=platform,
                    status="scheduled",
                    validation_errors=(post.validation_summary or {}).get(platform),
                )
                db.add(delivery)
                await db.flush()

            delivery.attempts += 1
            delivery.last_attempted_at = datetime.now(timezone.utc)
            if delivery.validation_errors:
                delivery.status = "failed"
                delivery.error_message = "Validation errors must be resolved before publishing"
                overall_success = False
                continue

            account = await SocialPlatformAccountService.get_active_for_provider(db, platform)
            if account is None:
                delivery.status = "failed"
                delivery.error_message = f"No active account configured for {platform}"
                overall_success = False
                continue

            adapter = get_social_adapter(platform)
            publish_fn = getattr(adapter, "_safe_publish", adapter.publish)
            result = await publish_fn(
                account=account,
                content=post.content,
                title=post.title,
                media=media,
                dry_run=dry_run,
            )
            account.last_used_at = datetime.now(timezone.utc)
            delivery.account = account
            delivery.request_payload = {
                "title": post.title,
                "content": post.content,
                "media_ids": [str(item.id) for item in media],
                "dry_run": dry_run,
            }
            delivery.response_payload = result.raw_response
            if result.success:
                delivery.status = "posted" if not dry_run else "validated"
                delivery.provider_post_id = result.provider_post_id
                delivery.posted_at = result.posted_at or datetime.now(timezone.utc)
                delivery.error_message = None
                platform_post_ids[platform] = result.provider_post_id
            else:
                delivery.status = "failed"
                delivery.error_message = result.error_message
                overall_success = False

        post.platform_post_ids = platform_post_ids or None
        post.posted_at = datetime.now(timezone.utc) if overall_success and not dry_run else post.posted_at
        post.status = "published" if overall_success and not dry_run else ("validated" if dry_run and overall_success else "failed")
        if not overall_success:
            post.error_message = "One or more platform deliveries failed"
        else:
            post.error_message = None
        await db.commit()


@celery_app.task(name="main.social.queue_publish")
def queue_social_post_publish(post_id: str, dry_run: bool = False) -> None:
    run_worker_async(_publish_social_post(post_id, dry_run=dry_run))


@celery_app.task(name="main.social.publish_due")
def publish_due_social_posts() -> int:
    async def _publish_due() -> int:
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(SocialMediaPost.id)
                .where(
                    SocialMediaPost.deleted_at.is_(None),
                    SocialMediaPost.status == "scheduled",
                    SocialMediaPost.scheduled_at.is_not(None),
                    SocialMediaPost.scheduled_at <= datetime.now(timezone.utc),
                )
                .order_by(SocialMediaPost.scheduled_at.asc())
            )
            post_ids = [str(item) for item in result.scalars().all()]
        for post_id in post_ids:
            queue_social_post_publish.delay(post_id)
        return len(post_ids)

    return run_worker_async(_publish_due())


__all__ = [
    "publish_due_social_posts",
    "queue_social_post_publish",
]
