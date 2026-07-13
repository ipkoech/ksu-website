"""Read-only Page CMS source contract for public research content."""

from __future__ import annotations

import uuid
from collections.abc import Iterable
from typing import Any

import sqlalchemy as sa
from ksu_common.pagination import PaginatedResult, paginate
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import PublicMedia, Publication, ResearchProject
from ..schemas.page_cms_source_contract import PageCmsResearchSourceSummary

SUPPORTED_PAGE_CMS_RESEARCH_SOURCE_TYPES = frozenset({"research_project", "publication"})
MAX_PAGE_CMS_SOURCE_IDS = 100
PROJECT_PUBLIC_STATUSES = ("approved", "ongoing", "completed")


def _source_model(source_type: str):
    if source_type == "research_project":
        return ResearchProject
    if source_type == "publication":
        return Publication
    raise ValueError(f"Unsupported Page CMS research source type: {source_type}")


def _safe_thumbnail_url(media: PublicMedia | None) -> str | None:
    if media is None:
        return None
    value = media.thumbnail_url or media.url
    if not value:
        return None
    if value.startswith(("http://", "https://", "/")):
        return value
    path = "/".join(part for part in value.replace("\\", "/").split("/") if part and part not in {".", ".."})
    return f"/uploads/{path}" if path else None


class PageCmsResearchSourceService:
    """Expose only public projects and publications needed by Page CMS."""

    @classmethod
    async def search(
        cls,
        db: AsyncSession,
        *,
        source_type: str,
        page: int = 1,
        per_page: int = 20,
        search: str | None = None,
        center_id: uuid.UUID | None = None,
    ) -> PaginatedResult:
        model = _source_model(source_type)
        query = cls._public_query(model, source_type, search=search, center_id=center_id)
        result = await paginate(db, query, page=page, per_page=per_page, max_per_page=50)
        return PaginatedResult(
            items=await cls._summaries(db, source_type, result.items),
            meta=result.meta,
        )

    @classmethod
    async def resolve_many(
        cls,
        db: AsyncSession,
        *,
        source_type: str,
        ids: list[uuid.UUID],
        center_id: uuid.UUID | None = None,
    ) -> list[PageCmsResearchSourceSummary]:
        if len(ids) > MAX_PAGE_CMS_SOURCE_IDS:
            raise ValueError(f"Page CMS source resolution accepts at most {MAX_PAGE_CMS_SOURCE_IDS} ids")
        records = await cls._load_records(db, source_type=source_type, ids=ids, center_id=center_id)
        summaries = await cls._summaries(db, source_type, records)
        by_id = {summary.id: summary for summary in summaries}
        return [by_id[item_id] for item_id in ids if item_id in by_id]

    @classmethod
    async def _load_records(
        cls,
        db: AsyncSession,
        *,
        source_type: str,
        ids: list[uuid.UUID],
        center_id: uuid.UUID | None,
    ) -> list[Any]:
        if not ids:
            return []
        model = _source_model(source_type)
        query = cls._public_query(model, source_type, search=None, center_id=center_id).where(model.id.in_(ids))
        result = await db.execute(query)
        return list(result.scalars().all())

    @classmethod
    def _public_query(cls, model, source_type: str, *, search: str | None, center_id: uuid.UUID | None):
        query = model.active_query().where(model.is_active.is_(True))
        if source_type == "research_project":
            query = query.where(
                ResearchProject.is_public.is_(True),
                ResearchProject.status.in_(PROJECT_PUBLIC_STATUSES),
            )
            if search:
                pattern = f"%{search.strip()}%"
                query = query.where(
                    sa.or_(
                        ResearchProject.title.ilike(pattern),
                        ResearchProject.code.ilike(pattern),
                        ResearchProject.summary.ilike(pattern),
                        ResearchProject.abstract.ilike(pattern),
                    )
                )
            query = query.order_by(ResearchProject.title.asc(), ResearchProject.id.asc())
        else:
            query = query.where(Publication.status == "published")
            if search:
                pattern = f"%{search.strip()}%"
                query = query.where(
                    sa.or_(
                        Publication.title.ilike(pattern),
                        Publication.journal_name.ilike(pattern),
                        Publication.publisher.ilike(pattern),
                        Publication.abstract.ilike(pattern),
                    )
                )
            query = query.order_by(Publication.publication_date.desc().nullslast(), Publication.title.asc(), Publication.id.asc())
        if center_id is not None:
            query = query.where(model.center_id == center_id)
        return query

    @classmethod
    async def _summaries(
        cls,
        db: AsyncSession,
        source_type: str,
        records: Iterable[Any],
    ) -> list[PageCmsResearchSourceSummary]:
        records = list(records)
        media_by_id = await cls._public_media_by_id(
            db,
            [record.cover_image_id for record in records if record.cover_image_id is not None],
        )
        return [cls._summary(source_type, record, media_by_id.get(record.cover_image_id)) for record in records]

    @staticmethod
    async def _public_media_by_id(db: AsyncSession, media_ids: list[uuid.UUID]) -> dict[uuid.UUID, PublicMedia]:
        if not media_ids:
            return {}
        result = await db.execute(
            select(PublicMedia).where(
                PublicMedia.id.in_(set(media_ids)),
                PublicMedia.deleted_at.is_(None),
                PublicMedia.is_public.is_(True),
            )
        )
        return {media.id: media for media in result.scalars().all()}

    @staticmethod
    def _summary(
        source_type: str,
        record: ResearchProject | Publication,
        media: PublicMedia | None,
    ) -> PageCmsResearchSourceSummary:
        if source_type == "research_project":
            project = record
            secondary_parts = [part for part in (project.code, project.project_type.replace("_", " ").title()) if part]
            return PageCmsResearchSourceSummary(
                id=project.id,
                source_type="research_project",
                label=project.title,
                secondary_label=" | ".join(secondary_parts) or None,
                status=project.status,
                published_at=project.start_date,
                thumbnail_url=_safe_thumbnail_url(media),
                metadata={"project_type": project.project_type, "progress_percentage": project.progress_percentage},
            )

        publication = record
        return PageCmsResearchSourceSummary(
            id=publication.id,
            source_type="publication",
            label=publication.title,
            secondary_label=publication.journal_name or publication.publication_type.replace("_", " ").title(),
            status=publication.status,
            published_at=publication.publication_date,
            thumbnail_url=_safe_thumbnail_url(media),
            metadata={
                "publication_type": publication.publication_type,
                "journal_name": publication.journal_name,
                "year": publication.year,
                "is_open_access": publication.is_open_access,
            },
        )

    @staticmethod
    def summary_schema() -> dict[str, Any]:
        return PageCmsResearchSourceSummary.model_json_schema()


__all__ = [
    "MAX_PAGE_CMS_SOURCE_IDS",
    "PageCmsResearchSourceService",
    "SUPPORTED_PAGE_CMS_RESEARCH_SOURCE_TYPES",
]
