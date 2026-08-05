"""Services for official public-site page snapshots."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from ksu_common import PaginatedResult

from ..helpers.slug import unique_slug
from ..models import PublicSitePage
from ._base import apply_updates, ilike_any, paginate_query


class PublicSitePageService:
    model = PublicSitePage

    @staticmethod
    async def get_by_id(db: AsyncSession, page_id, *, load_options=()) -> PublicSitePage | None:
        query = PublicSitePage.active_query().where(PublicSitePage.id == page_id)
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_slug(
        db: AsyncSession,
        slug: str,
        *,
        public_only: bool = True,
        load_options=(),
    ) -> PublicSitePage | None:
        query = PublicSitePage.active_query().where(PublicSitePage.slug == slug)
        if public_only:
            query = query.where(PublicSitePage.is_public.is_(True), PublicSitePage.status == "published")
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def list(
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        page_type: str | None = None,
        search: str | None = None,
        is_public: bool | None = True,
        status: str | None = "published",
        load_options=(),
    ) -> PaginatedResult:
        query = PublicSitePage.active_query().order_by(PublicSitePage.display_order.asc(), PublicSitePage.path.asc())
        if page_type:
            query = query.where(PublicSitePage.page_type == page_type)
        if search:
            query = query.where(ilike_any(search, PublicSitePage.title, PublicSitePage.path, PublicSitePage.summary, PublicSitePage.plain_text))
        if is_public is not None:
            query = query.where(PublicSitePage.is_public.is_(is_public))
        if status is not None:
            query = query.where(PublicSitePage.status == status)
        if load_options:
            query = query.options(*load_options)
        return await paginate_query(db, query, page=page, per_page=per_page)

    @staticmethod
    async def create(db: AsyncSession, **data) -> PublicSitePage:
        if not data.get("slug"):
            data["slug"] = await unique_slug(db, PublicSitePage, data["title"])
        item = PublicSitePage(**data)
        db.add(item)
        await db.flush()
        return item

    @staticmethod
    async def update(db: AsyncSession, item: PublicSitePage, **data) -> PublicSitePage:
        apply_updates(item, **data)
        await db.flush()
        return item


__all__ = ["PublicSitePageService"]
