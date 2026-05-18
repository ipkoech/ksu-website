"""Alumni services."""

from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ksu_common import PaginatedResult

from ..helpers.slug import unique_slug
from ..models import Alumni, AlumniAssociation, AlumniAssociationMember
from ._base import apply_updates, paginate_query


class AlumniService:
    @staticmethod
    async def get_by_id(db: AsyncSession, item_id: uuid.UUID, *, public_only: bool = True, load_options: Sequence = ()) -> Alumni | None:
        query = select(Alumni).options(selectinload(Alumni.association_memberships)).where(Alumni.id == item_id)
        if load_options:
            query = query.options(*load_options)
        if public_only:
            query = query.where(Alumni.is_public.is_(True), Alumni.is_verified.is_(True))
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, **data) -> Alumni:
        item = Alumni(**data)
        db.add(item)
        await db.flush()
        return item

    @staticmethod
    async def update(db: AsyncSession, item: Alumni, **data) -> Alumni:
        apply_updates(item, **data)
        await db.flush()
        return item

    @staticmethod
    async def delete(db: AsyncSession, item: Alumni) -> None:
        item.is_public = False
        item.is_verified = False
        await db.flush()

    @staticmethod
    async def list(
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        school_id: uuid.UUID | None = None,
        programme_id: uuid.UUID | None = None,
        graduation_year: int | None = None,
        mentor_only: bool = False,
        public_only: bool = True,
        load_options: Sequence = (),
    ) -> PaginatedResult:
        query = select(Alumni).order_by(Alumni.graduation_year.desc(), Alumni.created_at.desc())
        if load_options:
            query = query.options(*load_options)
        if school_id:
            query = query.where(Alumni.school_id == school_id)
        if programme_id:
            query = query.where(Alumni.programme_id == programme_id)
        if graduation_year:
            query = query.where(Alumni.graduation_year == graduation_year)
        if mentor_only:
            query = query.where(Alumni.is_mentor_available.is_(True))
        if public_only:
            query = query.where(Alumni.is_public.is_(True), Alumni.is_verified.is_(True))
        return await paginate_query(db, query, page=page, per_page=per_page)


class AlumniAssociationService:
    @staticmethod
    async def get_by_id(db: AsyncSession, item_id: uuid.UUID, *, load_options: Sequence = ()) -> AlumniAssociation | None:
        query = (
            select(AlumniAssociation)
            .options(selectinload(AlumniAssociation.members))
            .where(AlumniAssociation.id == item_id, AlumniAssociation.is_active.is_(True))
        )
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_slug(db: AsyncSession, slug: str, *, load_options: Sequence = ()) -> AlumniAssociation | None:
        query = (
            select(AlumniAssociation)
            .options(selectinload(AlumniAssociation.members))
            .where(AlumniAssociation.slug == slug, AlumniAssociation.is_active.is_(True))
        )
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, **data) -> AlumniAssociation:
        if not data.get("slug") and data.get("name"):
            data["slug"] = await unique_slug(db, AlumniAssociation, data["name"])
        item = AlumniAssociation(**data)
        db.add(item)
        await db.flush()
        return item

    @staticmethod
    async def update(db: AsyncSession, item: AlumniAssociation, **data) -> AlumniAssociation:
        if data.get("name") and not data.get("slug"):
            data["slug"] = await unique_slug(db, AlumniAssociation, data["name"], exclude_id=item.id)
        apply_updates(item, **data)
        await db.flush()
        return item

    @staticmethod
    async def delete(db: AsyncSession, item: AlumniAssociation) -> None:
        item.is_active = False
        await db.flush()

    @staticmethod
    async def list(
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        association_type: str | None = None,
        school_id: uuid.UUID | None = None,
        is_active: bool | None = True,
        load_options: Sequence = (),
    ) -> PaginatedResult:
        query = select(AlumniAssociation).options(selectinload(AlumniAssociation.members)).order_by(AlumniAssociation.name.asc())
        if load_options:
            query = query.options(*load_options)
        if association_type:
            query = query.where(AlumniAssociation.association_type == association_type)
        if school_id:
            query = query.where(AlumniAssociation.school_id == school_id)
        if is_active is not None:
            query = query.where(AlumniAssociation.is_active.is_(is_active))
        return await paginate_query(db, query, page=page, per_page=per_page)

    @staticmethod
    async def add_member(db: AsyncSession, association_id: uuid.UUID, **data) -> AlumniAssociationMember:
        result = await db.execute(
            select(AlumniAssociationMember).where(
                AlumniAssociationMember.association_id == association_id,
                AlumniAssociationMember.alumni_id == data["alumni_id"],
            )
        )
        item = result.scalar_one_or_none()
        payload = {"association_id": association_id, **data}
        if item is None:
            item = AlumniAssociationMember(**payload)
            db.add(item)
        else:
            apply_updates(item, **payload)
        await db.flush()
        return item

    @staticmethod
    async def remove_member(db: AsyncSession, association_id: uuid.UUID, alumni_id: uuid.UUID) -> None:
        result = await db.execute(
            select(AlumniAssociationMember).where(
                AlumniAssociationMember.association_id == association_id,
                AlumniAssociationMember.alumni_id == alumni_id,
            )
        )
        item = result.scalar_one_or_none()
        if item is not None:
            await db.delete(item)
            await db.flush()


__all__ = ["AlumniService", "AlumniAssociationService"]
