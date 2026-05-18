"""Exchange programme services."""

from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ksu_common import PaginatedResult

from ..helpers.slug import unique_slug
from ..models import ExchangeProgramme
from ._base import apply_updates, ilike_any, paginate_query


class ExchangeProgrammeService:
    @staticmethod
    async def get_by_id(db: AsyncSession, item_id: uuid.UUID, *, load_options: Sequence = ()) -> ExchangeProgramme | None:
        query = select(ExchangeProgramme).where(ExchangeProgramme.id == item_id, ExchangeProgramme.is_active.is_(True))
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_slug(db: AsyncSession, slug: str, *, load_options: Sequence = ()) -> ExchangeProgramme | None:
        query = select(ExchangeProgramme).where(ExchangeProgramme.slug == slug, ExchangeProgramme.is_active.is_(True))
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, **data) -> ExchangeProgramme:
        if not data.get("slug") and data.get("name"):
            data["slug"] = await unique_slug(db, ExchangeProgramme, data["name"])
        item = ExchangeProgramme(**data)
        db.add(item)
        await db.flush()
        return item

    @staticmethod
    async def update(db: AsyncSession, item: ExchangeProgramme, **data) -> ExchangeProgramme:
        if data.get("name") and not data.get("slug"):
            data["slug"] = await unique_slug(db, ExchangeProgramme, data["name"], exclude_id=item.id)
        apply_updates(item, **data)
        await db.flush()
        return item

    @staticmethod
    async def delete(db: AsyncSession, item: ExchangeProgramme) -> None:
        item.is_active = False
        item.is_accepting_applications = False
        await db.flush()

    @staticmethod
    async def list(
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        q: str | None = None,
        programme_type: str | None = None,
        school_id: uuid.UUID | None = None,
        accepting_only: bool = False,
        is_active: bool | None = True,
        load_options: Sequence = (),
    ) -> PaginatedResult:
        query = select(ExchangeProgramme).order_by(ExchangeProgramme.application_deadline.asc().nullslast(), ExchangeProgramme.name.asc())
        if load_options:
            query = query.options(*load_options)
        if q:
            query = query.where(ilike_any(q, ExchangeProgramme.name, ExchangeProgramme.partner_institution, ExchangeProgramme.about, ExchangeProgramme.partner_country))
        if programme_type:
            query = query.where(ExchangeProgramme.programme_type == programme_type)
        if school_id:
            query = query.where(ExchangeProgramme.school_id == school_id)
        if accepting_only:
            query = query.where(ExchangeProgramme.is_accepting_applications.is_(True))
        if is_active is not None:
            query = query.where(ExchangeProgramme.is_active.is_(is_active))
        return await paginate_query(db, query, page=page, per_page=per_page)


__all__ = ["ExchangeProgrammeService"]
