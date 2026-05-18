"""University info service."""

from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..helpers.slug import unique_slug
from ..models import UniversityInfo
from ._base import apply_updates


class UniversityInfoService:
    @staticmethod
    async def get_by_id(db: AsyncSession, item_id: uuid.UUID, *, load_options: Sequence = ()) -> UniversityInfo | None:
        query = select(UniversityInfo).where(UniversityInfo.id == item_id, UniversityInfo.is_active.is_(True))
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_slug(db: AsyncSession, slug: str, *, public_only: bool = True, load_options: Sequence = ()) -> UniversityInfo | None:
        query = select(UniversityInfo).where(UniversityInfo.slug == slug, UniversityInfo.is_active.is_(True))
        if load_options:
            query = query.options(*load_options)
        if public_only:
            query = query.where(UniversityInfo.is_public.is_(True))
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_current(db: AsyncSession, *, public_only: bool = True, load_options: Sequence = ()) -> UniversityInfo | None:
        query = select(UniversityInfo).where(UniversityInfo.is_active.is_(True)).order_by(UniversityInfo.created_at.desc())
        if load_options:
            query = query.options(*load_options)
        if public_only:
            query = query.where(UniversityInfo.is_public.is_(True))
        result = await db.execute(query)
        return result.scalars().first()

    @staticmethod
    async def create(db: AsyncSession, **data) -> UniversityInfo:
        existing = await UniversityInfoService.get_current(db, public_only=False)
        if existing is not None:
            raise ValueError("An active university info record already exists")
        if not data.get("slug") and data.get("name"):
            data["slug"] = await unique_slug(db, UniversityInfo, data["name"])
        if data.get("additional_head_messages") is not None:
            data["additional_head_messages"] = [item.model_dump() if hasattr(item, "model_dump") else item for item in data["additional_head_messages"]]
        item = UniversityInfo(**data)
        db.add(item)
        await db.flush()
        return item

    @staticmethod
    async def update(db: AsyncSession, item: UniversityInfo, **data) -> UniversityInfo:
        if data.get("name") and not data.get("slug"):
            data["slug"] = await unique_slug(db, UniversityInfo, data["name"], exclude_id=item.id)
        if data.get("additional_head_messages") is not None:
            data["additional_head_messages"] = [msg.model_dump() if hasattr(msg, "model_dump") else msg for msg in data["additional_head_messages"]]
        apply_updates(item, **data)
        await db.flush()
        return item

    @staticmethod
    async def delete(db: AsyncSession, item: UniversityInfo) -> None:
        item.is_active = False
        item.is_public = False
        await db.flush()


__all__ = ["UniversityInfoService"]
