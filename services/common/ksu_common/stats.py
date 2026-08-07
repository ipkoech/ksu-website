"""Reusable database aggregate helpers."""

from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession


async def _count(db: AsyncSession, model, *conditions) -> int:
    """Count non-deleted model rows matching the supplied conditions."""
    result = await db.execute(
        select(func.count(model.id)).where(model.deleted_at.is_(None), *conditions)
    )
    return int(result.scalar_one() or 0)


count_active = _count

__all__ = ["count_active"]
