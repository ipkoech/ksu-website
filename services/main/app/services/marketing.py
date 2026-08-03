"""Marketing services."""

from __future__ import annotations

import secrets
import uuid
from datetime import datetime, timezone
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ksu_common import PaginatedResult

from ..helpers import build_validation_summary, get_social_adapter, normalize_platforms
from ..models import Media
from ..helpers.slug import unique_slug
from ..models import (
    Newsletter,
    NewsletterSubscriber,
    SocialMediaDelivery,
    SocialMediaPost,
    SocialPlatformAccount,
    Testimonial,
)
from ._base import apply_updates, ilike_any, paginate_query


class NewsletterService:
    @staticmethod
    async def get_by_id(db: AsyncSession, item_id: uuid.UUID, *, load_options: Sequence = ()) -> Newsletter | None:
        query = select(Newsletter).where(Newsletter.id == item_id)
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_slug(db: AsyncSession, slug: str, *, public_only: bool = True, load_options: Sequence = ()) -> Newsletter | None:
        query = select(Newsletter).where(Newsletter.slug == slug)
        if public_only:
            query = query.where(Newsletter.is_public.is_(True), Newsletter.status == "published")
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, **data) -> Newsletter:
        if not data.get("slug") and data.get("title"):
            data["slug"] = await unique_slug(db, Newsletter, data["title"])
        item = Newsletter(**data)
        db.add(item)
        await db.flush()
        return item

    @staticmethod
    async def update(db: AsyncSession, item: Newsletter, **data) -> Newsletter:
        if data.get("title") and not data.get("slug"):
            data["slug"] = await unique_slug(db, Newsletter, data["title"], exclude_id=item.id)
        apply_updates(item, **data)
        await db.flush()
        return item

    @staticmethod
    async def delete(db: AsyncSession, item: Newsletter) -> None:
        item.status = "archived"
        item.is_public = False
        await db.flush()

    @staticmethod
    async def list(
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        q: str | None = None,
        status: str | None = None,
        public_only: bool = True,
        load_options: Sequence = (),
    ) -> PaginatedResult:
        query = select(Newsletter).order_by(Newsletter.published_at.desc().nullslast(), Newsletter.title.asc())
        if load_options:
            query = query.options(*load_options)
        if public_only:
            query = query.where(Newsletter.is_public.is_(True), Newsletter.status == "published")
        elif status:
            query = query.where(Newsletter.status == status)
        if q:
            query = query.where(ilike_any(q, Newsletter.title, Newsletter.summary, Newsletter.content))
        return await paginate_query(db, query, page=page, per_page=per_page)


class NewsletterSubscriberService:
    @staticmethod
    async def subscribe(db: AsyncSession, *, email: str, name: str | None = None, frequency: str = "all", categories: list[str] | None = None) -> NewsletterSubscriber:
        normalized = email.strip().lower()
        result = await db.execute(select(NewsletterSubscriber).where(NewsletterSubscriber.email == normalized))
        item = result.scalar_one_or_none()
        token = secrets.token_urlsafe(24)
        if item is None:
            item = NewsletterSubscriber(
                email=normalized,
                name=name,
                frequency=frequency,
                categories=categories,
                verification_token=token,
                status="active",
                unsubscribed_at=None,
            )
            db.add(item)
        else:
            item.name = name or item.name
            item.frequency = frequency
            item.categories = categories
            item.verification_token = token
            item.status = "active"
            item.unsubscribed_at = None
        await db.flush()
        return item

    @staticmethod
    async def unsubscribe(db: AsyncSession, email: str) -> NewsletterSubscriber | None:
        normalized = email.strip().lower()
        result = await db.execute(select(NewsletterSubscriber).where(NewsletterSubscriber.email == normalized))
        item = result.scalar_one_or_none()
        if item is None:
            return None
        item.status = "unsubscribed"
        item.unsubscribed_at = datetime.now(timezone.utc)
        await db.flush()
        return item

    @staticmethod
    async def list(
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        status: str | None = None,
    ) -> PaginatedResult:
        query = select(NewsletterSubscriber).order_by(NewsletterSubscriber.subscribed_at.desc())
        if status:
            query = query.where(NewsletterSubscriber.status == status)
        return await paginate_query(db, query, page=page, per_page=per_page)


class TestimonialService:
    @staticmethod
    async def get_by_id(db: AsyncSession, item_id: uuid.UUID, *, public_only: bool = True, load_options: Sequence = ()) -> Testimonial | None:
        query = select(Testimonial).where(Testimonial.id == item_id)
        if public_only:
            query = query.where(Testimonial.is_public.is_(True), Testimonial.is_approved.is_(True))
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, **data) -> Testimonial:
        item = Testimonial(**data)
        db.add(item)
        await db.flush()
        return item

    @staticmethod
    async def update(db: AsyncSession, item: Testimonial, **data) -> Testimonial:
        apply_updates(item, **data)
        await db.flush()
        return item

    @staticmethod
    async def delete(db: AsyncSession, item: Testimonial) -> None:
        item.is_public = False
        item.is_approved = False
        await db.flush()

    @staticmethod
    async def list(
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        testimonial_type: str | None = None,
        school_id: uuid.UUID | None = None,
        department_id: uuid.UUID | None = None,
        programme_id: uuid.UUID | None = None,
        featured_only: bool = False,
        public_only: bool = True,
        load_options: Sequence = (),
    ) -> PaginatedResult:
        query = select(Testimonial).order_by(Testimonial.display_order.asc(), Testimonial.created_at.desc())
        if load_options:
            query = query.options(*load_options)
        if testimonial_type:
            query = query.where(Testimonial.testimonial_type == testimonial_type)
        if school_id:
            query = query.where(Testimonial.school_id == school_id)
        if department_id:
            query = query.where(Testimonial.department_id == department_id)
        if programme_id:
            query = query.where(Testimonial.programme_id == programme_id)
        if featured_only:
            query = query.where(Testimonial.is_featured.is_(True))
        if public_only:
            query = query.where(Testimonial.is_public.is_(True), Testimonial.is_approved.is_(True))
        return await paginate_query(db, query, page=page, per_page=per_page)


class SocialMediaPostService:
    @staticmethod
    async def _load_media(db: AsyncSession, media_ids: list[uuid.UUID | str] | None) -> list[Media]:
        if not media_ids:
            return []
        normalized_ids = [item if isinstance(item, uuid.UUID) else uuid.UUID(item) for item in media_ids]
        result = await db.execute(select(Media).where(Media.id.in_(normalized_ids), Media.deleted_at.is_(None)))
        media = result.scalars().all()
        found_ids = {item.id for item in media}
        missing = [str(item) for item in normalized_ids if item not in found_ids]
        if missing:
            raise ValueError(f"Media not found: {', '.join(missing)}")
        return media

    @staticmethod
    async def _sync_deliveries(db: AsyncSession, item: SocialMediaPost) -> None:
        existing = {delivery.platform: delivery for delivery in item.deliveries}
        desired = set(item.platforms or [])
        for platform in desired:
            if platform not in existing:
                db.add(
                    SocialMediaDelivery(
                        social_post=item,
                        platform=platform,
                        status="scheduled" if item.status == "scheduled" else "draft",
                        validation_errors=(item.validation_summary or {}).get(platform),
                    )
                )
        for platform, delivery in list(existing.items()):
            if platform not in desired:
                await db.delete(delivery)

    @staticmethod
    async def _prepare_payload(
        db: AsyncSession,
        *,
        content: str,
        title: str | None,
        media_ids: list[uuid.UUID] | None,
        platforms: list[str],
    ) -> tuple[list[Media], dict]:
        media = await SocialMediaPostService._load_media(db, media_ids)
        summary = build_validation_summary(platforms, content=content, media=media)
        return media, summary

    @staticmethod
    async def get_by_id(db: AsyncSession, item_id: uuid.UUID, *, load_options: Sequence = ()) -> SocialMediaPost | None:
        query = (
            select(SocialMediaPost)
            .options(selectinload(SocialMediaPost.deliveries))
            .where(SocialMediaPost.id == item_id, SocialMediaPost.deleted_at.is_(None))
        )
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, *, created_by_id: uuid.UUID, **data) -> SocialMediaPost:
        data["platforms"] = normalize_platforms(data.get("platforms") or [])
        if data.get("media_ids") is not None:
            data["media_ids"] = [str(item) for item in data["media_ids"]]
        media, summary = await SocialMediaPostService._prepare_payload(
            db,
            content=data["content"],
            title=data.get("title"),
            media_ids=data.get("media_ids"),
            platforms=data["platforms"],
        )
        data["validation_summary"] = summary
        if data.get("status") == "published":
            raise ValueError("Use publish workflow to mark a social post as published")
        if data.get("scheduled_at") and data.get("status") == "draft":
            data["status"] = "scheduled"
        item = SocialMediaPost(created_by_id=created_by_id, **data)
        db.add(item)
        await db.flush()
        await db.refresh(item, attribute_names=["deliveries"])
        await SocialMediaPostService._sync_deliveries(db, item)
        await db.flush()
        if item.status == "scheduled":
            from ..tasks.social_posts import queue_social_post_publish

            queue_social_post_publish.delay(str(item.id))
        return item

    @staticmethod
    async def update(db: AsyncSession, item: SocialMediaPost, **data) -> SocialMediaPost:
        next_platforms = normalize_platforms(data["platforms"]) if data.get("platforms") is not None else list(item.platforms or [])
        next_content = data.get("content", item.content)
        next_title = data.get("title", item.title)
        next_media_ids = data.get("media_ids", item.media_ids)
        if data.get("media_ids") is not None:
            data["media_ids"] = [str(media_id) for media_id in data["media_ids"]]
            next_media_ids = data["media_ids"]
        _, summary = await SocialMediaPostService._prepare_payload(
            db,
            content=next_content,
            title=next_title,
            media_ids=next_media_ids,
            platforms=next_platforms,
        )
        data["platforms"] = next_platforms
        data["validation_summary"] = summary
        if data.get("status") == "published":
            raise ValueError("Use publish workflow to mark a social post as published")
        if data.get("scheduled_at") and data.get("status") == "draft":
            data["status"] = "scheduled"
        apply_updates(item, **data)
        await db.flush()
        await db.refresh(item, attribute_names=["deliveries"])
        await SocialMediaPostService._sync_deliveries(db, item)
        await db.flush()
        if item.status == "scheduled":
            from ..tasks.social_posts import queue_social_post_publish

            queue_social_post_publish.delay(str(item.id))
        return item

    @staticmethod
    async def delete(db: AsyncSession, item: SocialMediaPost) -> None:
        # Soft delete: keep the post and its SocialMediaDelivery rows as an
        # audit trail of what was actually sent to each platform.
        item.soft_delete()
        await db.flush()

    @staticmethod
    async def list(
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        status: str | None = None,
        source_type: str | None = None,
        load_options: Sequence = (),
    ) -> PaginatedResult:
        query = (
            select(SocialMediaPost)
            .where(SocialMediaPost.deleted_at.is_(None))
            .order_by(SocialMediaPost.scheduled_at.desc().nullslast(), SocialMediaPost.created_at.desc())
        )
        if load_options:
            query = query.options(*load_options)
        if status:
            query = query.where(SocialMediaPost.status == status)
        if source_type:
            query = query.where(SocialMediaPost.source_type == source_type)
        return await paginate_query(db, query, page=page, per_page=per_page)

    @staticmethod
    async def list_deliveries(db: AsyncSession, social_post_id: uuid.UUID, *, load_options: Sequence = ()) -> list[SocialMediaDelivery]:
        query = (
            select(SocialMediaDelivery)
            .where(SocialMediaDelivery.social_post_id == social_post_id)
            .order_by(SocialMediaDelivery.platform.asc())
        )
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def publish_now(db: AsyncSession, item: SocialMediaPost) -> SocialMediaPost:
        item.status = "scheduled"
        if item.scheduled_at is None:
            item.scheduled_at = datetime.now(timezone.utc)
        await db.flush()
        from ..tasks.social_posts import queue_social_post_publish

        queue_social_post_publish.delay(str(item.id))
        return item

    @staticmethod
    async def validate(db: AsyncSession, item: SocialMediaPost) -> dict:
        media = await SocialMediaPostService._load_media(db, item.media_ids)
        summary = build_validation_summary(item.platforms or [], content=item.content, media=media)
        item.validation_summary = summary
        for delivery in item.deliveries:
            delivery.validation_errors = summary.get(delivery.platform)
        await db.flush()
        return summary


class SocialPlatformAccountService:
    @staticmethod
    async def get_by_id(db: AsyncSession, item_id: uuid.UUID, *, load_options: Sequence = ()) -> SocialPlatformAccount | None:
        query = select(SocialPlatformAccount).where(SocialPlatformAccount.id == item_id)
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def list(
        db: AsyncSession,
        *,
        provider: str | None = None,
        active_only: bool = False,
        load_options: Sequence = (),
    ) -> list[SocialPlatformAccount]:
        query = select(SocialPlatformAccount).order_by(SocialPlatformAccount.provider.asc(), SocialPlatformAccount.name.asc())
        if load_options:
            query = query.options(*load_options)
        if provider:
            query = query.where(SocialPlatformAccount.provider == provider.strip().lower())
        if active_only:
            query = query.where(SocialPlatformAccount.is_active.is_(True))
        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def get_active_for_provider(db: AsyncSession, provider: str) -> SocialPlatformAccount | None:
        result = await db.execute(
            select(SocialPlatformAccount)
            .where(
                SocialPlatformAccount.provider == provider,
                SocialPlatformAccount.is_active.is_(True),
            )
            .order_by(SocialPlatformAccount.updated_at.desc())
        )
        return result.scalars().first()

    @staticmethod
    async def create(db: AsyncSession, *, created_by_id: uuid.UUID, **data) -> SocialPlatformAccount:
        data["provider"] = normalize_platforms([data["provider"]])[0]
        item = SocialPlatformAccount(created_by_id=created_by_id, **data)
        db.add(item)
        await db.flush()
        return item

    @staticmethod
    async def update(db: AsyncSession, item: SocialPlatformAccount, **data) -> SocialPlatformAccount:
        if data.get("provider") is not None:
            data["provider"] = normalize_platforms([data["provider"]])[0]
        apply_updates(item, **data)
        await db.flush()
        return item

    @staticmethod
    async def delete(db: AsyncSession, item: SocialPlatformAccount) -> None:
        item.is_active = False
        await db.flush()

    @staticmethod
    async def validate_credentials(db: AsyncSession, item: SocialPlatformAccount) -> tuple[bool, str | None]:
        adapter = get_social_adapter(item.provider)
        ok, error = await adapter.validate_credentials(item)
        item.last_validated_at = datetime.now(timezone.utc)
        item.last_error = error
        await db.flush()
        return ok, error


__all__ = [
    "NewsletterService",
    "NewsletterSubscriberService",
    "TestimonialService",
    "SocialMediaPostService",
    "SocialPlatformAccountService",
]
