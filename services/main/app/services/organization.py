"""Organization services."""

from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ksu_common import PaginatedResult

from ..helpers.slug import unique_slug
from ..models import Division, Wing
from ._base import apply_updates, paginate_query


class DivisionService:
    """Division CRUD with wings."""

    @staticmethod
    async def get_by_id(db: AsyncSession, division_id: uuid.UUID, *, load_options: Sequence = ()) -> Division | None:
        query = select(Division).where(Division.id == division_id, Division.is_active.is_(True))
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_slug(db: AsyncSession, slug: str, *, load_options: Sequence = ()) -> Division | None:
        query = select(Division).where(Division.slug == slug, Division.is_active.is_(True))
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, **data) -> Division:
        if not data.get("slug") and data.get("name"):
            data["slug"] = await unique_slug(db, Division, data["name"])
        division = Division(**data)
        db.add(division)
        await db.flush()
        return division

    @staticmethod
    async def update(db: AsyncSession, division: Division, **data) -> Division:
        if data.get("name") and not data.get("slug"):
            data["slug"] = await unique_slug(db, Division, data["name"], exclude_id=division.id)
        apply_updates(division, **data)
        await db.flush()
        return division

    @staticmethod
    async def list(
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        is_active: bool | None = True,
        load_options: Sequence = (),
    ) -> PaginatedResult:
        query = select(Division).order_by(Division.display_order.asc(), Division.name.asc())
        if load_options:
            query = query.options(*load_options)
        if is_active is not None:
            query = query.where(Division.is_active.is_(is_active))
        return await paginate_query(db, query, page=page, per_page=per_page)

    @staticmethod
    async def get_with_wings(db: AsyncSession, division_id: uuid.UUID, *, load_options: Sequence = ()) -> Division | None:
        query = (
            select(Division)
            .options(selectinload(Division.wings).selectinload(Wing.departments))
            .where(Division.id == division_id, Division.is_active.is_(True))
        )
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def soft_delete(db: AsyncSession, division: Division) -> None:
        division.soft_delete()
        await db.flush()


class WingService:
    """Wing CRUD under divisions."""

    @staticmethod
    async def get_by_id(db: AsyncSession, wing_id: uuid.UUID, *, load_options: Sequence = ()) -> Wing | None:
        query = select(Wing).where(Wing.id == wing_id, Wing.is_active.is_(True))
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, division_id: uuid.UUID, **data) -> Wing:
        if not data.get("slug") and data.get("name"):
            data["slug"] = await unique_slug(db, Wing, data["name"])
        wing = Wing(division_id=division_id, **data)
        db.add(wing)
        await db.flush()
        return wing

    @staticmethod
    async def update(db: AsyncSession, wing: Wing, **data) -> Wing:
        if data.get("name") and not data.get("slug"):
            data["slug"] = await unique_slug(db, Wing, data["name"], exclude_id=wing.id)
        apply_updates(wing, **data)
        await db.flush()
        return wing

    @staticmethod
    async def list_by_division(
        db: AsyncSession,
        division_id: uuid.UUID,
        is_active: bool | None = True,
        load_options: Sequence = (),
    ) -> list[Wing]:
        query = select(Wing).where(Wing.division_id == division_id)
        if load_options:
            query = query.options(*load_options)
        if is_active is not None:
            query = query.where(Wing.is_active.is_(is_active))
        result = await db.execute(query.order_by(Wing.display_order.asc(), Wing.name.asc()))
        return list(result.scalars().all())
