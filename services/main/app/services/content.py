"""Services for content publishing models."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Sequence

from sqlalchemy import or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ksu_common import PaginatedResult

from ..helpers.slug import unique_slug
from ..models import Announcement, Blog, Event, News, Slider, SliderGroup
from ._base import apply_updates, paginate_query


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
            updated_at=now,
        )
    )
    await db.flush()


class _RichContentService:
    model = None

    @classmethod
    async def get_by_id(cls, db: AsyncSession, id: uuid.UUID):
        query = cls.model.active_query().where(cls.model.id == id)
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
            query = query.where(cls.model.is_public.is_(True))
            query = query.where(*_active_window_filter(cls.model, now))
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
        load_options: Sequence = (),
    ) -> PaginatedResult:
        now = datetime.now(timezone.utc)
        await _archive_expired_content(db, cls.model, now)
        query = cls.model.active_query().order_by(cls.model.published_at.desc().nullslast(), cls.model.created_at.desc())
        if load_options:
            query = query.options(*load_options)
        query = _apply_scope_filters(query, cls.model, scope_type=scope_type, scope_id=scope_id, is_public=is_public, is_main=is_main)
        if is_published is not None:
            query = query.where(cls.model.is_published.is_(is_published))
        query = query.where(*_active_window_filter(cls.model, now))
        return await paginate_query(db, query, page=page, per_page=per_page)

    @classmethod
    async def delete(cls, db: AsyncSession, instance):
        instance.soft_delete()
        await db.flush()


class NewsService(_RichContentService):
    model = News


class BlogService(_RichContentService):
    model = Blog


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
            query = query.where(Event.is_public.is_(True))
            query = query.where(*_active_window_filter(Event, now))
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
        load_options: Sequence = (),
    ) -> PaginatedResult:
        now = datetime.now(timezone.utc)
        await _archive_expired_content(db, Event, now)
        query = Event.active_query().order_by(Event.start_date.asc(), Event.display_order.asc())
        if load_options:
            query = query.options(*load_options)
        query = _apply_scope_filters(query, Event, scope_type=scope_type, scope_id=scope_id, is_public=is_public, is_main=is_main)
        if is_published is not None:
            query = query.where(Event.is_published.is_(is_published))
        query = query.where(*_active_window_filter(Event, now))
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
    async def get_by_id(db: AsyncSession, slider_id: uuid.UUID) -> Slider | None:
        result = await db.execute(select(Slider).where(Slider.id == slider_id, Slider.deleted_at.is_(None)))
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
    ) -> list[Slider]:
        now = datetime.now(timezone.utc)
        await _archive_expired_sliders(db, now)
        query = select(Slider).where(Slider.deleted_at.is_(None), Slider.is_active.is_(True))
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
    async def delete(db: AsyncSession, slider: Slider):
        slider.soft_delete()
        await db.flush()
