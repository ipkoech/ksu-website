"""Services for content publishing models."""

from __future__ import annotations

import math
import re
import secrets
import uuid
from datetime import datetime, timezone
from typing import Sequence

from sqlalchemy import or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ksu_common import PaginatedResult

from ..helpers.slug import unique_slug
from ..models import Announcement, Blog, Event, News, Role, Slider, SliderGroup, Story, StoryContributorAccountRequest, UserRole
from ._base import apply_updates, ilike_any, paginate_query
from .user import UserService


def calculate_story_reading_minutes(content: str | None) -> int:
    """Estimate story reading time using a 200-word-per-minute pace."""
    text = re.sub(r"<[^>]+>", " ", content or "")
    word_count = len(text.split())
    return max(1, math.ceil(word_count / 200))


def _apply_scope_filters(query, model, *, scope_type=None, scope_id=None, is_public=None, is_main=None):
    if scope_type is not None:
        query = query.where(model.scope_type == scope_type)
    if scope_id is not None:
        query = query.where(model.scope_id == scope_id)
    if is_public is not None and hasattr(model, "is_public"):
        query = query.where(model.is_public.is_(is_public))
    if is_main is not None and hasattr(model, "is_main"):
        query = query.where(model.is_main.is_(is_main))
    return query


def _active_window_filter(model, now: datetime):
    return (
        model.archived_at.is_(None),
        or_(model.valid_from.is_(None), model.valid_from <= now),
        or_(model.valid_to.is_(None), model.valid_to >= now),
    )


def _public_workflow_filter(model, now: datetime):
    return (
        model.is_public.is_(True),
        model.is_published.is_(True),
        model.workflow_status == "published",
        *_active_window_filter(model, now),
        or_(model.scheduled_publish_at.is_(None), model.scheduled_publish_at <= now),
        or_(model.expires_at.is_(None), model.expires_at >= now),
    )


def _apply_workflow_admin_filters(
    query, model, *, workflow_status=None, owner_portal=None, owner_scope_type=None,
    owner_scope_id=None, scheduled_from=None, scheduled_to=None,
):
    if workflow_status is not None:
        query = query.where(model.workflow_status == workflow_status)
    if owner_portal is not None:
        query = query.where(model.owner_portal == owner_portal)
    if owner_scope_type is not None:
        query = query.where(model.owner_scope_type == owner_scope_type)
    if owner_scope_id is not None:
        query = query.where(model.owner_scope_id == owner_scope_id)
    if scheduled_from is not None:
        query = query.where(model.scheduled_publish_at >= scheduled_from)
    if scheduled_to is not None:
        query = query.where(model.scheduled_publish_at <= scheduled_to)
    return query


async def _archive_expired_content(db: AsyncSession, model, now: datetime) -> None:
    await db.execute(
        update(model)
        .where(
            model.deleted_at.is_(None),
            model.archived_at.is_(None),
            model.valid_to.is_not(None),
            model.valid_to < now,
        )
        .values(
            archived_at=now,
            status="archived",
            workflow_status="archived",
            is_published=False,
            updated_at=now,
        )
    )
    await db.flush()


async def _archive_expired_sliders(db: AsyncSession, now: datetime) -> None:
    await db.execute(
        update(Slider)
        .where(
            Slider.deleted_at.is_(None),
            Slider.archived_at.is_(None),
            Slider.end_datetime.is_not(None),
            Slider.end_datetime < now,
        )
        .values(
            archived_at=now,
            is_active=False,
            workflow_status="archived",
            updated_at=now,
        )
    )
    await db.flush()


class _RichContentService:
    model = None

    @classmethod
    async def get_by_id(cls, db: AsyncSession, id: uuid.UUID, *, load_options: Sequence = ()):
        query = cls.model.active_query().where(cls.model.id == id)
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @classmethod
    async def get_by_slug(
        cls,
        db: AsyncSession,
        slug: str,
        *,
        public_only: bool = False,
        load_options: Sequence = (),
    ):
        now = datetime.now(timezone.utc)
        await _archive_expired_content(db, cls.model, now)
        query = cls.model.active_query().where(cls.model.slug == slug)
        if load_options:
            query = query.options(*load_options)
        if public_only:
            query = query.where(*_public_workflow_filter(cls.model, now))
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @classmethod
    async def create(cls, db: AsyncSession, **data):
        if not data.get("slug") and data.get("title"):
            data["slug"] = await unique_slug(db, cls.model, data["title"])
        instance = cls.model(**data)
        db.add(instance)
        await db.flush()
        return instance

    @classmethod
    async def update(cls, db: AsyncSession, instance, **data):
        if data.get("title") and not data.get("slug"):
            data["slug"] = await unique_slug(db, cls.model, data["title"], exclude_id=instance.id)
        apply_updates(instance, **data)
        await db.flush()
        return instance

    @classmethod
    async def publish(cls, db: AsyncSession, instance):
        instance.is_published = True
        instance.is_public = True
        instance.status = "published"
        instance.workflow_status = "published"
        if instance.published_at is None:
            instance.published_at = datetime.now(timezone.utc)
        await db.flush()
        return instance

    @classmethod
    async def unpublish(cls, db: AsyncSession, instance):
        instance.is_published = False
        instance.status = "draft"
        instance.workflow_status = "unpublished"
        await db.flush()
        return instance

    @classmethod
    async def list(
        cls,
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        scope_type: str | None = None,
        scope_id: uuid.UUID | None = None,
        is_public: bool | None = True,
        is_main: bool | None = None,
        is_published: bool | None = None,
        search: str | None = None,
        load_options: Sequence = (),
    ) -> PaginatedResult:
        now = datetime.now(timezone.utc)
        await _archive_expired_content(db, cls.model, now)
        query = cls.model.active_query().order_by(cls.model.published_at.desc().nullslast(), cls.model.created_at.desc())
        if load_options:
            query = query.options(*load_options)
        query = _apply_scope_filters(query, cls.model, scope_type=scope_type, scope_id=scope_id, is_public=is_public, is_main=is_main)
        query = query.where(*_public_workflow_filter(cls.model, now))
        if search:
            query = query.where(ilike_any(search, cls.model.title, cls.model.slug, cls.model.summary))
        return await paginate_query(db, query, page=page, per_page=per_page)

    @classmethod
    async def list_admin(
        cls,
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        scope_type: str | None = None,
        scope_id: uuid.UUID | None = None,
        is_main: bool | None = None,
        is_published: bool | None = None,
        status: str | None = None,
        workflow_status: str | None = None,
        owner_portal: str | None = None,
        owner_scope_type: str | None = None,
        owner_scope_id: uuid.UUID | None = None,
        scheduled_from: datetime | None = None,
        scheduled_to: datetime | None = None,
        search: str | None = None,
        load_options: Sequence = (),
    ) -> PaginatedResult:
        query = cls.model.active_query().order_by(cls.model.created_at.desc())
        if load_options:
            query = query.options(*load_options)
        query = _apply_scope_filters(
            query,
            cls.model,
            scope_type=scope_type,
            scope_id=scope_id,
            is_public=None,
            is_main=is_main,
        )
        if is_published is not None:
            query = query.where(cls.model.is_published.is_(is_published))
        if status:
            query = query.where(cls.model.status == status)
        query = _apply_workflow_admin_filters(
            query, cls.model, workflow_status=workflow_status, owner_portal=owner_portal,
            owner_scope_type=owner_scope_type, owner_scope_id=owner_scope_id,
            scheduled_from=scheduled_from, scheduled_to=scheduled_to,
        )
        if search:
            query = query.where(ilike_any(search, cls.model.title, cls.model.slug, cls.model.summary))
        return await paginate_query(db, query, page=page, per_page=per_page)

    @classmethod
    async def delete(cls, db: AsyncSession, instance):
        instance.soft_delete()
        await db.flush()


class NewsService(_RichContentService):
    model = News


class BlogService(_RichContentService):
    model = Blog


class StoryService(_RichContentService):
    model = Story

    @classmethod
    async def create(cls, db: AsyncSession, **data):
        if data.get("reading_minutes") is None:
            data["reading_minutes"] = calculate_story_reading_minutes(
                data.get("rich_text") or data.get("plain_text")
            )
        return await super().create(db, **data)

    @classmethod
    async def update(cls, db: AsyncSession, instance, **data):
        if "reading_minutes" not in data and (
            "rich_text" in data or "plain_text" in data
        ):
            data["reading_minutes"] = calculate_story_reading_minutes(
                data.get("rich_text") or data.get("plain_text")
            )
        return await super().update(db, instance, **data)

    @classmethod
    async def list(
        cls,
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        scope_type: str | None = None,
        scope_id: uuid.UUID | None = None,
        is_public: bool | None = True,
        is_main: bool | None = None,
        is_published: bool | None = None,
        search: str | None = None,
        story_type: str | None = None,
        category: str | None = None,
        is_featured: bool | None = None,
        load_options: Sequence = (),
    ) -> PaginatedResult:
        now = datetime.now(timezone.utc)
        await _archive_expired_content(db, cls.model, now)
        query = cls.model.active_query().order_by(cls.model.homepage_priority.asc(), cls.model.published_at.desc().nullslast(), cls.model.created_at.desc())
        if load_options:
            query = query.options(*load_options)
        query = _apply_scope_filters(query, cls.model, scope_type=scope_type, scope_id=scope_id, is_public=is_public, is_main=is_main)
        query = query.where(*_public_workflow_filter(cls.model, now))
        if story_type:
            query = query.where(cls.model.story_type == story_type)
        if category:
            query = query.where(cls.model.category == category)
        if is_featured is not None:
            query = query.where(cls.model.is_featured.is_(is_featured))
            if is_featured:
                query = query.where(or_(cls.model.featured_until.is_(None), cls.model.featured_until >= now))
        if search:
            query = query.where(ilike_any(search, cls.model.title, cls.model.slug, cls.model.summary, cls.model.plain_text))
        return await paginate_query(db, query, page=page, per_page=per_page)

    @classmethod
    async def list_admin(
        cls,
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        scope_type: str | None = None,
        scope_id: uuid.UUID | None = None,
        is_main: bool | None = None,
        is_published: bool | None = None,
        status: str | None = None,
        workflow_status: str | None = None,
        owner_portal: str | None = None,
        owner_scope_type: str | None = None,
        owner_scope_id: uuid.UUID | None = None,
        scheduled_from: datetime | None = None,
        scheduled_to: datetime | None = None,
        search: str | None = None,
        story_type: str | None = None,
        category: str | None = None,
        contributor_user_id: uuid.UUID | None = None,
        load_options: Sequence = (),
    ) -> PaginatedResult:
        query = cls.model.active_query().order_by(cls.model.updated_at.desc(), cls.model.created_at.desc())
        if load_options:
            query = query.options(*load_options)
        query = _apply_scope_filters(query, cls.model, scope_type=scope_type, scope_id=scope_id, is_public=None, is_main=is_main)
        if is_published is not None:
            query = query.where(cls.model.is_published.is_(is_published))
        if status:
            query = query.where(cls.model.status == status)
        query = _apply_workflow_admin_filters(
            query, cls.model, workflow_status=workflow_status, owner_portal=owner_portal,
            owner_scope_type=owner_scope_type, owner_scope_id=owner_scope_id,
            scheduled_from=scheduled_from, scheduled_to=scheduled_to,
        )
        if story_type:
            query = query.where(cls.model.story_type == story_type)
        if category:
            query = query.where(cls.model.category == category)
        if contributor_user_id:
            query = query.where(cls.model.contributor_user_id == contributor_user_id)
        if search:
            query = query.where(ilike_any(search, cls.model.title, cls.model.slug, cls.model.summary, cls.model.plain_text))
        return await paginate_query(db, query, page=page, per_page=per_page)


class StoryContributorAccountRequestService:
    @staticmethod
    async def create(db: AsyncSession, **data) -> StoryContributorAccountRequest:
        email = data["email"].lower().strip()
        result = await db.execute(
            StoryContributorAccountRequest.active_query().where(
                StoryContributorAccountRequest.email == email,
                StoryContributorAccountRequest.status.in_(("pending", "approved")),
            )
        )
        existing = result.scalar_one_or_none()
        if existing is not None:
            raise ValueError("A pending or approved contributor request already exists for this email")
        request = StoryContributorAccountRequest(
            **data,
            email=email,
            status="pending",
            verification_token=secrets.token_urlsafe(32),
        )
        db.add(request)
        await db.flush()
        return request

    @staticmethod
    async def get_by_id(db: AsyncSession, request_id: uuid.UUID) -> StoryContributorAccountRequest | None:
        result = await db.execute(StoryContributorAccountRequest.active_query().where(StoryContributorAccountRequest.id == request_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def list_admin(
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        status: str | None = None,
        search: str | None = None,
    ) -> PaginatedResult:
        query = StoryContributorAccountRequest.active_query().order_by(StoryContributorAccountRequest.created_at.desc())
        if status:
            query = query.where(StoryContributorAccountRequest.status == status)
        if search:
            query = query.where(ilike_any(search, StoryContributorAccountRequest.full_name, StoryContributorAccountRequest.email, StoryContributorAccountRequest.affiliation))
        return await paginate_query(db, query, page=page, per_page=per_page)

    @staticmethod
    async def approve(db: AsyncSession, request: StoryContributorAccountRequest, reviewer_id: uuid.UUID) -> StoryContributorAccountRequest:
        if request.status != "pending":
            raise ValueError("Only pending contributor requests can be approved")
        user = await UserService.get_by_email(db, request.email)
        if user is None:
            password = f"KsuStory{secrets.randbelow(900000) + 100000}!"
            user = await UserService.create(
                db,
                email=request.email,
                password=password,
                full_name=request.full_name,
                phone=request.phone,
                is_active=True,
                is_verified=False,
            )
        role_result = await db.execute(select(Role).where(Role.name == "story_contributor", Role.is_active.is_(True)))
        role = role_result.scalar_one_or_none()
        if role is not None:
            existing_assignment = await db.execute(
                select(UserRole).where(
                    UserRole.user_id == user.id,
                    UserRole.role_id == role.id,
                    UserRole.scope_type.is_(None),
                    UserRole.scope_id.is_(None),
                    UserRole.is_active.is_(True),
                )
            )
            if existing_assignment.scalar_one_or_none() is None:
                db.add(UserRole(user_id=user.id, role_id=role.id, assigned_by_id=reviewer_id))
        now = datetime.now(timezone.utc)
        request.status = "approved"
        request.reviewed_by_id = reviewer_id
        request.reviewed_at = now
        request.approved_user_id = user.id
        request.rejection_reason = None
        await db.flush()
        return request

    @staticmethod
    async def reject(
        db: AsyncSession,
        request: StoryContributorAccountRequest,
        reviewer_id: uuid.UUID,
        *,
        rejection_reason: str | None = None,
    ) -> StoryContributorAccountRequest:
        if request.status != "pending":
            raise ValueError("Only pending contributor requests can be rejected")
        request.status = "rejected"
        request.reviewed_by_id = reviewer_id
        request.reviewed_at = datetime.now(timezone.utc)
        request.rejection_reason = rejection_reason
        await db.flush()
        return request


class AnnouncementService(_RichContentService):
    model = Announcement


class EventService:
    @staticmethod
    async def get_by_id(db: AsyncSession, event_id: uuid.UUID, *, load_options: Sequence = ()) -> Event | None:
        query = Event.active_query().where(Event.id == event_id)
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_slug(db: AsyncSession, slug: str, *, public_only: bool = False, load_options: Sequence = ()) -> Event | None:
        now = datetime.now(timezone.utc)
        await _archive_expired_content(db, Event, now)
        query = Event.active_query().where(Event.slug == slug)
        if load_options:
            query = query.options(*load_options)
        if public_only:
            query = query.where(*_public_workflow_filter(Event, now))
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, **data) -> Event:
        if not data.get("slug") and data.get("title"):
            data["slug"] = await unique_slug(db, Event, data["title"])
        event = Event(**data)
        db.add(event)
        await db.flush()
        return event

    @staticmethod
    async def update(db: AsyncSession, event: Event, **data) -> Event:
        if data.get("title") and not data.get("slug"):
            data["slug"] = await unique_slug(db, Event, data["title"], exclude_id=event.id)
        apply_updates(event, **data)
        await db.flush()
        return event

    @staticmethod
    async def publish(db: AsyncSession, event: Event) -> Event:
        event.is_published = True
        event.is_public = True
        event.status = "published"
        event.workflow_status = "published"
        if event.published_at is None:
            event.published_at = datetime.now(timezone.utc)
        await db.flush()
        return event

    @staticmethod
    async def unpublish(db: AsyncSession, event: Event) -> Event:
        event.is_published = False
        event.status = "draft"
        event.workflow_status = "unpublished"
        await db.flush()
        return event

    @staticmethod
    async def list(
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        scope_type: str | None = None,
        scope_id: uuid.UUID | None = None,
        is_public: bool | None = True,
        is_main: bool | None = None,
        is_published: bool | None = None,
        upcoming: bool | None = None,
        search: str | None = None,
        load_options: Sequence = (),
    ) -> PaginatedResult:
        now = datetime.now(timezone.utc)
        await _archive_expired_content(db, Event, now)
        query = Event.active_query().order_by(Event.start_date.asc(), Event.display_order.asc())
        if load_options:
            query = query.options(*load_options)
        query = _apply_scope_filters(query, Event, scope_type=scope_type, scope_id=scope_id, is_public=is_public, is_main=is_main)
        query = query.where(*_public_workflow_filter(Event, now))
        if search:
            query = query.where(ilike_any(search, Event.title, Event.slug, Event.summary, Event.location))
        if upcoming is True:
            query = query.where(Event.start_date >= now)
        return await paginate_query(db, query, page=page, per_page=per_page)

    @staticmethod
    async def list_admin(
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        scope_type: str | None = None,
        scope_id: uuid.UUID | None = None,
        is_main: bool | None = None,
        is_published: bool | None = None,
        upcoming: bool | None = None,
        status: str | None = None,
        workflow_status: str | None = None,
        owner_portal: str | None = None,
        owner_scope_type: str | None = None,
        owner_scope_id: uuid.UUID | None = None,
        scheduled_from: datetime | None = None,
        scheduled_to: datetime | None = None,
        search: str | None = None,
        load_options: Sequence = (),
    ) -> PaginatedResult:
        now = datetime.now(timezone.utc)
        query = Event.active_query().order_by(Event.start_date.asc(), Event.display_order.asc())
        if load_options:
            query = query.options(*load_options)
        query = _apply_scope_filters(
            query,
            Event,
            scope_type=scope_type,
            scope_id=scope_id,
            is_public=None,
            is_main=is_main,
        )
        if is_published is not None:
            query = query.where(Event.is_published.is_(is_published))
        if status:
            query = query.where(Event.status == status)
        query = _apply_workflow_admin_filters(
            query, Event, workflow_status=workflow_status, owner_portal=owner_portal,
            owner_scope_type=owner_scope_type, owner_scope_id=owner_scope_id,
            scheduled_from=scheduled_from, scheduled_to=scheduled_to,
        )
        if search:
            query = query.where(ilike_any(search, Event.title, Event.slug, Event.summary, Event.location))
        if upcoming is True:
            query = query.where(Event.start_date >= now)
        return await paginate_query(db, query, page=page, per_page=per_page)

    @staticmethod
    async def delete(db: AsyncSession, event: Event):
        event.soft_delete()
        await db.flush()


class SliderGroupService:
    @staticmethod
    async def get_by_id(db: AsyncSession, group_id: uuid.UUID, *, load_options: Sequence = ()) -> SliderGroup | None:
        query = select(SliderGroup).options(selectinload(SliderGroup.sliders)).where(
                SliderGroup.id == group_id,
                SliderGroup.deleted_at.is_(None),
            )
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_slug(db: AsyncSession, slug: str, *, load_options: Sequence = ()) -> SliderGroup | None:
        now = datetime.now(timezone.utc)
        await _archive_expired_sliders(db, now)
        query = select(SliderGroup).options(selectinload(SliderGroup.sliders)).where(
                SliderGroup.slug == slug,
                SliderGroup.deleted_at.is_(None),
                SliderGroup.is_active.is_(True),
            )
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, **data) -> SliderGroup:
        if not data.get("slug") and data.get("name"):
            data["slug"] = await unique_slug(db, SliderGroup, data["name"])
        group = SliderGroup(**data)
        db.add(group)
        await db.flush()
        return group

    @staticmethod
    async def update(db: AsyncSession, group: SliderGroup, **data) -> SliderGroup:
        if data.get("name") and not data.get("slug"):
            data["slug"] = await unique_slug(db, SliderGroup, data["name"], exclude_id=group.id)
        apply_updates(group, **data)
        await db.flush()
        return group

    @staticmethod
    async def list(
        db: AsyncSession,
        *,
        scope_type: str | None = None,
        scope_id: uuid.UUID | None = None,
        is_public: bool | None = True,
        is_main: bool | None = None,
    ) -> list[SliderGroup]:
        now = datetime.now(timezone.utc)
        await _archive_expired_sliders(db, now)
        query = select(SliderGroup).options(selectinload(SliderGroup.sliders)).where(SliderGroup.deleted_at.is_(None))
        query = _apply_scope_filters(query, SliderGroup, scope_type=scope_type, scope_id=scope_id, is_public=is_public, is_main=is_main)
        query = query.where(SliderGroup.is_active.is_(True)).order_by(SliderGroup.name.asc())
        result = await db.execute(query)
        return list(result.scalars().unique().all())

    @staticmethod
    async def delete(db: AsyncSession, group: SliderGroup):
        group.soft_delete()
        await db.flush()


class SliderService:
    @staticmethod
    async def get_by_id(db: AsyncSession, slider_id: uuid.UUID, *, load_options: Sequence = ()) -> Slider | None:
        query = select(Slider).where(Slider.id == slider_id, Slider.deleted_at.is_(None))
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, **data) -> Slider:
        slider = Slider(**data)
        db.add(slider)
        await db.flush()
        return slider

    @staticmethod
    async def update(db: AsyncSession, slider: Slider, **data) -> Slider:
        apply_updates(slider, **data)
        await db.flush()
        return slider

    @staticmethod
    async def list(
        db: AsyncSession,
        *,
        slider_group_id: uuid.UUID | None = None,
        scope_type: str | None = None,
        scope_id: uuid.UUID | None = None,
        is_public: bool | None = True,
        is_main: bool | None = None,
        load_options: Sequence = (),
    ) -> list[Slider]:
        now = datetime.now(timezone.utc)
        await _archive_expired_sliders(db, now)
        query = select(Slider).where(
            Slider.deleted_at.is_(None), Slider.is_active.is_(True),
            Slider.is_public.is_(True), Slider.workflow_status == "published",
            or_(Slider.scheduled_publish_at.is_(None), Slider.scheduled_publish_at <= now),
            or_(Slider.expires_at.is_(None), Slider.expires_at >= now),
        )
        if load_options:
            query = query.options(*load_options)
        if slider_group_id:
            query = query.where(Slider.slider_group_id == slider_group_id)
        query = _apply_scope_filters(query, Slider, scope_type=scope_type, scope_id=scope_id, is_public=is_public, is_main=is_main)
        query = query.where(
            Slider.archived_at.is_(None),
            or_(Slider.start_datetime.is_(None), Slider.start_datetime <= now),
            or_(Slider.end_datetime.is_(None), Slider.end_datetime >= now),
        )
        query = query.order_by(Slider.display_order.asc(), Slider.created_at.desc())
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def list_admin(
        db: AsyncSession,
        *,
        slider_group_id: uuid.UUID | None = None,
        scope_type: str | None = None,
        scope_id: uuid.UUID | None = None,
        is_main: bool | None = None,
        status: str | None = None,
        load_options: Sequence = (),
    ) -> list[Slider]:
        query = select(Slider).where(Slider.deleted_at.is_(None))
        if load_options:
            query = query.options(*load_options)
        if slider_group_id:
            query = query.where(Slider.slider_group_id == slider_group_id)
        query = _apply_scope_filters(
            query,
            Slider,
            scope_type=scope_type,
            scope_id=scope_id,
            is_public=None,
            is_main=is_main,
        )
        if status == "active":
            query = query.where(Slider.is_active.is_(True), Slider.archived_at.is_(None))
        elif status == "inactive":
            query = query.where(Slider.is_active.is_(False))
        elif status == "archived":
            query = query.where(Slider.archived_at.is_not(None))
        query = query.order_by(Slider.display_order.asc(), Slider.created_at.desc())
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def delete(db: AsyncSession, slider: Slider):
        slider.soft_delete()
        await db.flush()
