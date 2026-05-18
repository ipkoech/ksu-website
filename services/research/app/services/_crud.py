"""Shared CRUD service helpers for Research models."""

from __future__ import annotations

import uuid
from typing import Any, Generic, TypeVar

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from ksu_common import PaginatedResult, paginate

M = TypeVar("M")


class CRUDService(Generic[M]):
    model: type[M]
    search_fields: tuple[str, ...] = ()
    slug_field: str = "slug"
    default_order: tuple[str, ...] = ("display_order", "created_at")

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
    def _apply_order(cls, query):
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
    ) -> PaginatedResult:
        query = cls.model.active_query()
        query = cls._apply_search(query, search)
        query = cls._apply_filters(query, filters)
        query = cls._apply_order(query)
        return await paginate(db, query, page=page, per_page=per_page)

    @classmethod
    async def get_by_id(cls, db: AsyncSession, item_id: uuid.UUID) -> M | None:
        result = await db.execute(cls.model.active_query().where(cls.model.id == item_id))
        return result.scalar_one_or_none()

    @classmethod
    async def get_by_slug(cls, db: AsyncSession, slug: str) -> M | None:
        if not hasattr(cls.model, cls.slug_field):
            return None
        result = await db.execute(
            cls.model.active_query().where(getattr(cls.model, cls.slug_field) == slug)
        )
        return result.scalar_one_or_none()

    @classmethod
    async def create(cls, db: AsyncSession, data, *, actor_id: str | uuid.UUID | None = None) -> M:
        payload = data.model_dump(exclude_unset=True) if hasattr(data, "model_dump") else dict(data)
        item = cls.model(**payload)
        db.add(item)
        await db.flush()
        await db.refresh(item)
        return item

    @classmethod
    async def update(cls, db: AsyncSession, item: M, data, *, actor_id: str | uuid.UUID | None = None) -> M:
        payload = data.model_dump(exclude_unset=True) if hasattr(data, "model_dump") else dict(data)
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
):
    class _Service(CRUDService):
        pass

    _Service.model = model
    _Service.search_fields = tuple(search_fields)
    _Service.default_order = default_order
    return _Service

