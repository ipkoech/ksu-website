from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy import Select, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.content import PublicationStatus


def is_public_record(record: Any, now: datetime | None = None) -> bool:
    now = now or datetime.now(timezone.utc)
    if getattr(record, "deleted_at", None) is not None:
        return False
    if record.status is PublicationStatus.PUBLISHED:
        return True
    return record.status is PublicationStatus.SCHEDULED and record.scheduled_at is not None and record.scheduled_at <= now


class PublicService:
    @staticmethod
    def public_query(model: type[Any]) -> Select:
        conditions = [model.deleted_at.is_(None)]
        if hasattr(model, "status"):
            now = datetime.now(timezone.utc)
            conditions.append(or_(model.status == PublicationStatus.PUBLISHED, (model.status == PublicationStatus.SCHEDULED) & (model.scheduled_at <= now)))
        if hasattr(model, "is_active"):
            conditions.append(model.is_active.is_(True))
        return select(model).where(*conditions)

    async def list(self, db: AsyncSession, model: type[Any], *, limit: int = 20, offset: int = 0) -> list[Any]:
        result = await db.execute(self.public_query(model).order_by(model.created_at.desc()).limit(limit).offset(offset))
        return list(result.scalars().all())

    async def by_slug(self, db: AsyncSession, model: type[Any], slug: str) -> Any | None:
        result = await db.execute(self.public_query(model).where(model.slug == slug))
        return result.scalar_one_or_none()
