"""Shared CRUD service helpers for Research models."""

from __future__ import annotations

import uuid
from typing import Any, Generic, TypeVar

from sqlalchemy import extract, or_, select
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
            if value is None or not hasattr(cls.model, key):
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
