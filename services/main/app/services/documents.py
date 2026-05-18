"""Document and policy services."""

from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ksu_common import PaginatedResult

from ..helpers.slug import unique_slug
from ..models import Document, Policy
from ._base import apply_updates, ilike_any, paginate_query


class PolicyService:
    @staticmethod
    async def get_by_id(db: AsyncSession, item_id: uuid.UUID, *, load_options: Sequence = ()) -> Policy | None:
        query = select(Policy).where(Policy.id == item_id)
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_slug(db: AsyncSession, slug: str, *, public_only: bool = True, load_options: Sequence = ()) -> Policy | None:
        query = select(Policy).where(Policy.slug == slug)
        if load_options:
            query = query.options(*load_options)
        if public_only:
            query = query.where(Policy.is_public.is_(True), Policy.status == "active")
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, **data) -> Policy:
        if not data.get("slug") and data.get("title"):
            data["slug"] = await unique_slug(db, Policy, data["title"])
        item = Policy(**data)
        db.add(item)
        await db.flush()
        return item

    @staticmethod
    async def update(db: AsyncSession, item: Policy, **data) -> Policy:
        if data.get("title") and not data.get("slug"):
            data["slug"] = await unique_slug(db, Policy, data["title"], exclude_id=item.id)
        apply_updates(item, **data)
        await db.flush()
        return item

    @staticmethod
    async def delete(db: AsyncSession, item: Policy) -> None:
        item.status = "archived"
        item.is_public = False
        await db.flush()

    @staticmethod
    async def list(
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        q: str | None = None,
        category: str | None = None,
        division_id: uuid.UUID | None = None,
        department_id: uuid.UUID | None = None,
        public_only: bool = True,
        status: str | None = None,
        load_options: Sequence = (),
    ) -> PaginatedResult:
        query = select(Policy).order_by(Policy.display_order.asc(), Policy.title.asc())
        if load_options:
            query = query.options(*load_options)
        if q:
            query = query.where(ilike_any(q, Policy.title, Policy.code, Policy.summary, Policy.content))
        if category:
            query = query.where(Policy.category == category)
        if division_id:
            query = query.where(Policy.division_id == division_id)
        if department_id:
            query = query.where(Policy.department_id == department_id)
        if public_only:
            query = query.where(Policy.is_public.is_(True), Policy.status == "active")
        elif status:
            query = query.where(Policy.status == status)
        return await paginate_query(db, query, page=page, per_page=per_page)


class DocumentService:
    @staticmethod
    async def get_by_id(db: AsyncSession, item_id: uuid.UUID, *, load_options: Sequence = ()) -> Document | None:
        query = select(Document).where(Document.id == item_id, Document.is_active.is_(True))
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_slug(db: AsyncSession, slug: str, *, public_only: bool = True, load_options: Sequence = ()) -> Document | None:
        query = select(Document).where(Document.slug == slug, Document.is_active.is_(True))
        if load_options:
            query = query.options(*load_options)
        if public_only:
            query = query.where(Document.is_public.is_(True))
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, **data) -> Document:
        if not data.get("slug") and data.get("title"):
            data["slug"] = await unique_slug(db, Document, data["title"])
        item = Document(**data)
        db.add(item)
        await db.flush()
        return item

    @staticmethod
    async def update(db: AsyncSession, item: Document, **data) -> Document:
        if data.get("title") and not data.get("slug"):
            data["slug"] = await unique_slug(db, Document, data["title"], exclude_id=item.id)
        apply_updates(item, **data)
        await db.flush()
        return item

    @staticmethod
    async def delete(db: AsyncSession, item: Document) -> None:
        item.is_active = False
        await db.flush()

    @staticmethod
    async def increment_download(db: AsyncSession, item: Document) -> Document:
        item.download_count += 1
        await db.flush()
        return item

    @staticmethod
    async def list(
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        q: str | None = None,
        document_type: str | None = None,
        category: str | None = None,
        scope_type: str | None = None,
        scope_id: uuid.UUID | None = None,
        public_only: bool = True,
        load_options: Sequence = (),
    ) -> PaginatedResult:
        query = select(Document).order_by(Document.display_order.asc(), Document.title.asc())
        if load_options:
            query = query.options(*load_options)
        if q:
            query = query.where(ilike_any(q, Document.title, Document.description, Document.category))
        if document_type:
            query = query.where(Document.document_type == document_type)
        if category:
            query = query.where(Document.category == category)
        if scope_type:
            query = query.where(Document.scope_type == scope_type)
        if scope_id:
            query = query.where(Document.scope_id == scope_id)
        if public_only:
            query = query.where(Document.is_active.is_(True), Document.is_public.is_(True))
        else:
            query = query.where(Document.is_active.is_(True))
        return await paginate_query(db, query, page=page, per_page=per_page)


__all__ = ["PolicyService", "DocumentService"]
