"""Research service Base class with schema set."""

from __future__ import annotations

from typing import TypeVar

from fastapi import HTTPException, status
from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import select
from sqlalchemy.sql import Select

from ksu_common.models.base import SoftDeleteMixin, TimestampMixin

SCHEMA = "research"
T = TypeVar("T", bound="Base")


class Base(TimestampMixin, SoftDeleteMixin, DeclarativeBase):
    """Research service Base — all tables go into the 'research' schema."""

    __abstract__ = True
    metadata = MetaData(schema=SCHEMA)

    @classmethod
    def active_query(cls: type[T]) -> Select:
        """Return a select() that filters out soft-deleted rows."""
        return select(cls).where(cls.deleted_at.is_(None))

    @classmethod
    async def get_or_raise(
        cls: type[T],
        db,
        item_id,
        *,
        error_message: str = "Record not found",
    ) -> T:
        """Fetch an active row by id or raise a 404."""
        item = await db.get(cls, item_id)
        if item is None or getattr(item, "deleted_at", None) is not None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=error_message)
        return item
