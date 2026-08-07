"""Async-compatible pagination helpers."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, TypeVar

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import Select

T = TypeVar("T")


@dataclass
class PaginatedResult:
    items: list[Any]
    meta: dict[str, int]

    @property
    def total(self) -> int | None:
        return self.meta.get("total")

    @property
    def pages(self) -> int | None:
        return self.meta.get("pages")

    @property
    def page(self) -> int:
        return self.meta["page"]

    @property
    def per_page(self) -> int:
        return self.meta["per_page"]


async def paginate(
    db: AsyncSession,
    query: Select,
    *,
    page: int = 1,
    per_page: int = 20,
    max_per_page: int = 100,
    include_total: bool = True,
) -> PaginatedResult:
    """Execute a SQLAlchemy 2.0 select with async pagination."""
    page = max(1, page)
    per_page = max(1, min(max_per_page, per_page))

    result = await db.execute(query.offset((page - 1) * per_page).limit(per_page))
    items = result.scalars().all()

    meta: dict[str, int] = {"page": page, "per_page": per_page}
    if include_total:
        count_result = await db.execute(select(func.count()).select_from(query.subquery()))
        total = count_result.scalar_one()
        pages = (total + per_page - 1) // per_page if per_page else 0
        meta["total"] = total
        meta["pages"] = pages

    return PaginatedResult(
        items=list(items),
        meta=meta,
    )


