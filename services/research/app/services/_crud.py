"""Shared CRUD service helpers for Research models."""

from __future__ import annotations

import uuid
from datetime import date, datetime, timezone
from typing import Any, Generic, TypeVar

import sqlalchemy as sa
from sqlalchemy import extract, or_
from sqlalchemy.ext.asyncio import AsyncSession

from ksu_common import PaginatedResult, paginate

from .references import MainReferenceValidator

M = TypeVar("M")


class CRUDService(Generic[M]):
    model: type[M]
    search_fields: tuple[str, ...] = ()
    slug_field: str = "slug"
    default_order: tuple[str, ...] = ("display_order", "created_at")
    reference_fields: dict[str, str] = {}
    public_statuses: tuple[str, ...] = (
        "published",
        "active",
        "available",
        "open",
        "ongoing",
        "upcoming",
        "approved",
        "completed",
        "closed",
        "awarded",
        "building",
    )

    @classmethod
    def _apply_search(cls, query, search: str | None):
        if not search or not cls.search_fields:
            return query
        pattern = f"%{search}%"
        columns = [getattr(cls.model, field) for field in cls.search_fields if hasattr(cls.model, field)]
        if columns:
            query = query.where(or_(*[column.ilike(pattern) for column in columns]))
        return query

    @classmethod
    def _apply_filters(cls, query, filters: dict[str, Any] | None = None):
        for key, value in (filters or {}).items():
            if value is None:
                continue
            if key == "has_grant" and hasattr(cls.model, "grant_id"):
                query = query.where(getattr(cls.model, "grant_id").is_not(None) if value else getattr(cls.model, "grant_id").is_(None))
                continue
            if key == "missing_pi" and hasattr(cls.model, "pi_id"):
                query = query.where(getattr(cls.model, "pi_id").is_(None) if value else getattr(cls.model, "pi_id").is_not(None))
                continue
            if key == "start_date_from" and hasattr(cls.model, "start_date"):
                query = query.where(getattr(cls.model, "start_date") >= value)
                continue
            if key == "end_date_to" and hasattr(cls.model, "end_date"):
                query = query.where(getattr(cls.model, "end_date") <= value)
                continue
            if key == "focus_area_id" and getattr(cls.model, "__tablename__", None) == "research_projects":
                from ..models import project_focus_areas

                query = query.join(
                    project_focus_areas,
                    getattr(cls.model, "id") == project_focus_areas.c.project_id,
                ).where(project_focus_areas.c.focus_area_id == value)
                continue
            if not hasattr(cls.model, key):
                continue
            query = query.where(getattr(cls.model, key) == value)
        return query

    @classmethod
    def _apply_year(cls, query, year: int | None = None):
        if year is None:
            return query
        if hasattr(cls.model, "year"):
            return query.where(getattr(cls.model, "year") == year)
        for field in ("start_date", "publication_date", "created_at"):
            if hasattr(cls.model, field):
                return query.where(extract("year", getattr(cls.model, field)) == year)
        return query

    @classmethod
    def _apply_order(cls, query, sort: str | None = None, order: str | None = None):
        if sort and hasattr(cls.model, sort):
            column = getattr(cls.model, sort)
            return query.order_by(column.asc() if order == "asc" else column.desc())

        order_columns = []
        for name in cls.default_order:
            if hasattr(cls.model, name):
                column = getattr(cls.model, name)
                if name == "created_at":
                    column = column.desc()
                else:
                    column = column.asc()
                order_columns.append(column)
        if order_columns:
            query = query.order_by(*order_columns)
        return query

    @classmethod
    def _apply_public_visibility(cls, query):
        """Apply the public website visibility contract for models that expose those fields."""
        now = datetime.now(timezone.utc)
        today = date.today()

        def temporal_value(column):
            try:
                column_type = column.property.columns[0].type
            except (AttributeError, IndexError):
                return now
            return now if isinstance(column_type, sa.DateTime) else today

        if hasattr(cls.model, "is_public"):
            query = query.where(getattr(cls.model, "is_public").is_(True))
        if hasattr(cls.model, "is_active"):
            query = query.where(getattr(cls.model, "is_active").is_(True))
        if hasattr(cls.model, "status"):
            query = query.where(getattr(cls.model, "status").in_(cls.public_statuses))
        if hasattr(cls.model, "published_at"):
            published_at = getattr(cls.model, "published_at")
            query = query.where(or_(published_at.is_(None), published_at <= temporal_value(published_at)))
        if hasattr(cls.model, "starts_at"):
            starts_at = getattr(cls.model, "starts_at")
            query = query.where(or_(starts_at.is_(None), starts_at <= now))
        if hasattr(cls.model, "ends_at"):
            ends_at = getattr(cls.model, "ends_at")
            query = query.where(or_(ends_at.is_(None), ends_at >= now))
        if hasattr(cls.model, "expires_at"):
            expires_at = getattr(cls.model, "expires_at")
            query = query.where(or_(expires_at.is_(None), expires_at >= now))
        if hasattr(cls.model, "publish_date"):
            publish_date = getattr(cls.model, "publish_date")
            query = query.where(or_(publish_date.is_(None), publish_date <= temporal_value(publish_date)))
        if hasattr(cls.model, "expiry_date"):
            expiry_date = getattr(cls.model, "expiry_date")
            query = query.where(or_(expiry_date.is_(None), expiry_date >= temporal_value(expiry_date)))
        return query

    @classmethod
    async def list(
        cls,
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        search: str | None = None,
        filters: dict[str, Any] | None = None,
        year: int | None = None,
        sort: str | None = None,
        order: str | None = None,
        load_options: tuple[Any, ...] | list[Any] = (),
    ) -> PaginatedResult:
        query = cls.model.active_query()
        if load_options:
            query = query.options(*load_options)
        query = cls._apply_search(query, search)
        query = cls._apply_filters(query, filters)
        query = cls._apply_year(query, year)
        query = cls._apply_order(query, sort=sort, order=order)
        return await paginate(db, query, page=page, per_page=per_page)

    @classmethod
    async def list_public(
        cls,
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        search: str | None = None,
        filters: dict[str, Any] | None = None,
        year: int | None = None,
        sort: str | None = None,
        order: str | None = None,
        load_options: tuple[Any, ...] | list[Any] = (),
    ) -> PaginatedResult:
        query = cls.model.active_query()
        if load_options:
            query = query.options(*load_options)
        query = cls._apply_public_visibility(query)
        query = cls._apply_search(query, search)
        query = cls._apply_filters(query, filters)
        query = cls._apply_year(query, year)
        query = cls._apply_order(query, sort=sort, order=order)
        return await paginate(db, query, page=page, per_page=per_page)

    @classmethod
    async def get_by_id(
        cls,
        db: AsyncSession,
        item_id: uuid.UUID,
        *,
        load_options: tuple[Any, ...] | list[Any] = (),
    ) -> M | None:
        query = cls.model.active_query().where(cls.model.id == item_id)
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
        load_options: tuple[Any, ...] | list[Any] = (),
    ) -> M | None:
        if not hasattr(cls.model, cls.slug_field):
            return None
        query = cls.model.active_query().where(getattr(cls.model, cls.slug_field) == slug)
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @classmethod
    async def get_public_by_slug(
        cls,
        db: AsyncSession,
        slug: str,
        *,
        load_options: tuple[Any, ...] | list[Any] = (),
    ) -> M | None:
        if not hasattr(cls.model, cls.slug_field):
            return None
        query = cls.model.active_query().where(getattr(cls.model, cls.slug_field) == slug)
        if load_options:
            query = query.options(*load_options)
        query = cls._apply_public_visibility(query)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @classmethod
    async def create(cls, db: AsyncSession, data, *, actor_id: str | uuid.UUID | None = None) -> M:
        payload = data.model_dump(exclude_unset=True) if hasattr(data, "model_dump") else dict(data)
        await MainReferenceValidator.validate(payload, cls.reference_fields)
        item = cls.model(**payload)
        db.add(item)
        await db.flush()
        await db.refresh(item)
        return item

    @classmethod
    async def update(cls, db: AsyncSession, item: M, data, *, actor_id: str | uuid.UUID | None = None) -> M:
        payload = data.model_dump(exclude_unset=True) if hasattr(data, "model_dump") else dict(data)
        await MainReferenceValidator.validate(payload, cls.reference_fields)
        for key, value in payload.items():
            setattr(item, key, value)
        await db.flush()
        await db.refresh(item)
        return item

    @classmethod
    async def soft_delete(cls, db: AsyncSession, item: M, *, actor_id: str | uuid.UUID | None = None) -> None:
        item.soft_delete()
        await db.flush()


def build_simple_service(
    model: type,
    *search_fields: str,
    default_order: tuple[str, ...] = ("display_order", "created_at"),
    reference_fields: dict[str, str] | None = None,
):
    class _Service(CRUDService):
        pass

    _Service.model = model
    _Service.search_fields = tuple(search_fields)
    _Service.default_order = default_order
    _Service.reference_fields = reference_fields or {}
    return _Service
