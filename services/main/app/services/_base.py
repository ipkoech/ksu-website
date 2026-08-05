"""Shared service-layer helpers."""

from __future__ import annotations

from typing import Any

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import InstrumentedAttribute

from ksu_common import PaginatedResult, paginate

from .change_tracking import current_audit_actor


def apply_updates(instance: Any, **data: Any) -> Any:
    """Apply provided update values to an ORM instance.

    Callers should pass data produced with exclude_unset=True when partial
    update semantics are needed. Explicit None values are intentional clears.
    """
    for key, value in data.items():
        setattr(instance, key, value)
    actor_id = current_audit_actor()
    if actor_id is not None and hasattr(instance, "updated_by_id"):
        instance.updated_by_id = actor_id
    return instance


async def paginate_query(
    db: AsyncSession,
    query,
    *,
    page: int = 1,
    per_page: int = 20,
) -> PaginatedResult:
    return await paginate(db, query, page=page, per_page=per_page)


def ilike_any(term: str, *columns: InstrumentedAttribute):
    pattern = f"%{term}%"
    return or_(*[column.ilike(pattern) for column in columns])


async def get_one_by(db: AsyncSession, model: type, **filters: Any):
    result = await db.execute(select(model).filter_by(**filters))
    return result.scalar_one_or_none()
