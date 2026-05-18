"""Generic async repository with auto soft-delete filtering.

Usage:
    from ksu_common.repository import BaseRepository

    class LibraryRepository(BaseRepository[Library]):
        pass

    repo = LibraryRepository(db, Library)
    libraries = await repo.list(page=1, per_page=20)
    library = await repo.get(library_id)
    library = await repo.create(name="Main Library", code="MAIN")
    library = await repo.update(library_id, name="Updated Name")
    await repo.delete(library_id)  # soft-delete
"""

from __future__ import annotations

import uuid
from typing import Any, Generic, Sequence, TypeVar

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import Select

from .models.base import Base
from .pagination import PaginatedResult

T = TypeVar("T", bound=Base)


class BaseRepository(Generic[T]):
    """Generic repository with built-in soft-delete filtering."""

    def __init__(self, db: AsyncSession, model: type[T]):
        self._db = db
        self._model = model

    @property
    def _has_soft_delete(self) -> bool:
        return hasattr(self._model, "deleted_at")

    def _base_query(self, include_deleted: bool = False) -> Select:
        """Get base query with optional soft-delete filter."""
        query = select(self._model)
        if self._has_soft_delete and not include_deleted:
            query = query.where(self._model.deleted_at.is_(None))
        return query

    async def get(
        self,
        id: uuid.UUID,
        *,
        include_deleted: bool = False,
    ) -> T | None:
        """Get a single entity by ID."""
        query = self._base_query(include_deleted).where(self._model.id == id)
        result = await self._db.execute(query)
        return result.scalar_one_or_none()

    async def get_or_raise(
        self,
        id: uuid.UUID,
        *,
        error_message: str | None = None,
    ) -> T:
        """Get entity by ID or raise ValueError."""
        entity = await self.get(id)
        if entity is None:
            raise ValueError(error_message or f"{self._model.__name__} not found")
        return entity

    async def list(
        self,
        *,
        page: int = 1,
        per_page: int = 20,
        order_by: Any | None = None,
        include_deleted: bool = False,
        **filters: Any,
    ) -> PaginatedResult:
        """List entities with pagination and optional filters."""
        query = self._base_query(include_deleted)

        for key, value in filters.items():
            if value is not None and hasattr(self._model, key):
                query = query.where(getattr(self._model, key) == value)

        if order_by is not None:
            query = query.order_by(order_by)
        elif hasattr(self._model, "created_at"):
            query = query.order_by(self._model.created_at.desc())

        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self._db.execute(count_query)
        total = total_result.scalar_one()

        pages = (total + per_page - 1) // per_page if per_page else 0
        offset = (page - 1) * per_page

        result = await self._db.execute(query.offset(offset).limit(per_page))
        items = result.scalars().all()

        return PaginatedResult(
            items=list(items),
            meta={"page": page, "per_page": per_page, "total": total, "pages": pages},
        )

    async def all(
        self,
        *,
        include_deleted: bool = False,
        order_by: Any | None = None,
        **filters: Any,
    ) -> Sequence[T]:
        """Get all entities matching filters (no pagination)."""
        query = self._base_query(include_deleted)

        for key, value in filters.items():
            if value is not None and hasattr(self._model, key):
                query = query.where(getattr(self._model, key) == value)

        if order_by is not None:
            query = query.order_by(order_by)

        result = await self._db.execute(query)
        return result.scalars().all()

    async def count(
        self,
        *,
        include_deleted: bool = False,
        **filters: Any,
    ) -> int:
        """Count entities matching filters."""
        query = self._base_query(include_deleted)

        for key, value in filters.items():
            if value is not None and hasattr(self._model, key):
                query = query.where(getattr(self._model, key) == value)

        count_query = select(func.count()).select_from(query.subquery())
        result = await self._db.execute(count_query)
        return result.scalar_one()

    async def exists(self, id: uuid.UUID) -> bool:
        """Check if non-deleted entity exists."""
        return await self.get(id) is not None

    async def create(self, **data: Any) -> T:
        """Create a new entity."""
        entity = self._model(**data)
        self._db.add(entity)
        await self._db.commit()
        await self._db.refresh(entity)
        return entity

    async def update(self, id: uuid.UUID, **data: Any) -> T:
        """Update an existing entity."""
        entity = await self.get_or_raise(id)

        for key, value in data.items():
            if hasattr(entity, key):
                setattr(entity, key, value)

        await self._db.commit()
        await self._db.refresh(entity)
        return entity

    async def delete(self, id: uuid.UUID, *, hard: bool = False) -> None:
        """Delete an entity (soft-delete by default)."""
        entity = await self.get_or_raise(id)

        if hard or not self._has_soft_delete:
            await self._db.delete(entity)
        else:
            entity.soft_delete()

        await self._db.commit()

    async def restore(self, id: uuid.UUID) -> T:
        """Restore a soft-deleted entity."""
        entity = await self.get(id, include_deleted=True)
        if entity is None:
            raise ValueError(f"{self._model.__name__} not found")

        if self._has_soft_delete:
            entity.restore()
            await self._db.commit()
            await self._db.refresh(entity)

        return entity

    async def bulk_create(self, items: Sequence[dict[str, Any]]) -> Sequence[T]:
        """Create multiple entities."""
        entities = [self._model(**data) for data in items]
        self._db.add_all(entities)
        await self._db.commit()
        for entity in entities:
            await self._db.refresh(entity)
        return entities

    async def bulk_delete(
        self,
        ids: Sequence[uuid.UUID],
        *,
        hard: bool = False,
    ) -> int:
        """Delete multiple entities. Returns count deleted."""
        count = 0
        for id in ids:
            try:
                await self.delete(id, hard=hard)
                count += 1
            except ValueError:
                pass
        return count
