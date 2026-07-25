"""Public school and department content read model."""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Literal

import sqlalchemy as sa
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..helpers.storage import get_media_public_url
from ..models import Department, Document, Event, Media, MediaLink, News, School

EntityType = Literal["school", "department"]
ContentType = Literal["all", "news", "events", "gallery", "downloads"]


@dataclass(frozen=True)
class ResolvedEntityScope:
    entity: School | Department
    entity_type: EntityType
    scope_pairs: tuple[tuple[str, uuid.UUID], ...]


def _scope_filter(model: type, pairs: tuple[tuple[str, uuid.UUID], ...]):
    return sa.or_(
        *(
            sa.and_(model.scope_type == scope_type, model.scope_id == scope_id)
            for scope_type, scope_id in pairs
        )
    )


def _iso(value: datetime | None) -> str | None:
    return value.isoformat() if value else None


def _matches_search(record: dict[str, Any], search: str | None) -> bool:
    if not search:
        return True
    term = search.strip().lower()
    if not term:
        return True
    return any(
        term in str(record.get(key) or "").lower()
        for key in ("title", "summary", "description", "caption", "alt_text", "original_filename")
    )


class PublicEntityContentService:
    """Build field-filterable public content envelopes for an entity."""

    @staticmethod
    async def resolve_scope(
        db: AsyncSession,
        entity_type: EntityType,
        entity_id: uuid.UUID,
    ) -> ResolvedEntityScope | None:
        if entity_type == "school":
            result = await db.execute(
                select(School).where(
                    School.id == entity_id,
                    School.deleted_at.is_(None),
                    School.is_active.is_(True),
                    School.is_public.is_(True),
                )
            )
            school = result.scalar_one_or_none()
            if school is None:
                return None
            departments_result = await db.execute(
                select(Department.id).where(
                    Department.school_id == school.id,
                    Department.deleted_at.is_(None),
                    Department.is_active.is_(True),
                    Department.is_public.is_(True),
                )
            )
            department_ids = list(departments_result.scalars().all())
            pairs = (("school", school.id), *(("department", item) for item in department_ids))
            return ResolvedEntityScope(school, "school", pairs)

        result = await db.execute(
            select(Department).where(
                Department.id == entity_id,
                Department.deleted_at.is_(None),
                Department.is_active.is_(True),
                Department.is_public.is_(True),
            )
        )
        department = result.scalar_one_or_none()
        if department is None:
            return None
        return ResolvedEntityScope(department, "department", (("department", department.id),))

    @staticmethod
    async def _news(db: AsyncSession, scope: ResolvedEntityScope) -> list[dict[str, Any]]:
        now = datetime.now(timezone.utc)
        result = await db.execute(
            select(News)
            .options(selectinload(News.featured_media))
            .where(
                News.deleted_at.is_(None),
                News.is_public.is_(True),
                News.is_published.is_(True),
                News.archived_at.is_(None),
                sa.or_(News.valid_from.is_(None), News.valid_from <= now),
                sa.or_(News.valid_to.is_(None), News.valid_to >= now),
                sa.or_(News.scheduled_publish_at.is_(None), News.scheduled_publish_at <= now),
                sa.or_(News.expires_at.is_(None), News.expires_at >= now),
                _scope_filter(News, scope.scope_pairs),
            )
        )
        return [
            {
                "id": str(item.id),
                "record_type": "news",
                "title": item.title,
                "slug": item.slug,
                "summary": item.summary,
                "featured_media_id": str(item.featured_media_id) if item.featured_media_id else None,
                "featured_media_url": get_media_public_url(item.featured_media),
                "scope_type": item.scope_type,
                "scope_id": str(item.scope_id) if item.scope_id else None,
                "published_at": _iso(item.published_at),
                "created_at": _iso(item.created_at),
                "updated_at": _iso(item.updated_at),
            }
            for item in result.scalars().unique().all()
        ]

    @staticmethod
    async def _events(db: AsyncSession, scope: ResolvedEntityScope) -> list[dict[str, Any]]:
        now = datetime.now(timezone.utc)
        result = await db.execute(
            select(Event)
            .options(selectinload(Event.featured_media))
            .where(
                Event.deleted_at.is_(None),
                Event.is_public.is_(True),
                Event.is_published.is_(True),
                Event.archived_at.is_(None),
                sa.or_(Event.valid_from.is_(None), Event.valid_from <= now),
                sa.or_(Event.valid_to.is_(None), Event.valid_to >= now),
                sa.or_(Event.scheduled_publish_at.is_(None), Event.scheduled_publish_at <= now),
                sa.or_(Event.expires_at.is_(None), Event.expires_at >= now),
                _scope_filter(Event, scope.scope_pairs),
            )
        )
        return [
            {
                "id": str(item.id),
                "record_type": "event",
                "title": item.title,
                "slug": item.slug,
                "summary": item.summary,
                "featured_media_id": str(item.featured_media_id) if item.featured_media_id else None,
                "featured_media_url": get_media_public_url(item.featured_media),
                "scope_type": item.scope_type,
                "scope_id": str(item.scope_id) if item.scope_id else None,
                "start_date": _iso(item.start_date),
                "end_date": _iso(item.end_date),
                "location": item.location,
                "is_virtual": item.is_virtual,
                "published_at": _iso(item.published_at),
                "created_at": _iso(item.created_at),
                "updated_at": _iso(item.updated_at),
            }
            for item in result.scalars().unique().all()
        ]

    @staticmethod
    async def _gallery(db: AsyncSession, scope: ResolvedEntityScope) -> list[dict[str, Any]]:
        link_scope = sa.or_(
            *(
                sa.and_(MediaLink.entity_type == scope_type, MediaLink.entity_id == scope_id)
                for scope_type, scope_id in scope.scope_pairs
            )
        )
        result = await db.execute(
            select(MediaLink)
            .options(selectinload(MediaLink.media))
            .join(Media, MediaLink.media_id == Media.id)
            .where(
                MediaLink.deleted_at.is_(None),
                MediaLink.is_public.is_(True),
                MediaLink.role == "gallery",
                link_scope,
                Media.deleted_at.is_(None),
                Media.is_public.is_(True),
                sa.or_(
                    Media.media_type.in_(("image", "video")),
                    Media.mime_type.like("image/%"),
                    Media.mime_type.like("video/%"),
                ),
            )
        )
        records = []
        for link in result.scalars().unique().all():
            item = link.media
            records.append(
                {
                    "id": str(item.id),
                    "record_type": "gallery",
                    "title": item.title,
                    "filename": item.filename,
                    "original_filename": item.original_filename,
                    "mime_type": item.mime_type,
                    "media_type": item.media_type,
                    "public_url": get_media_public_url(item),
                    "url": get_media_public_url(item),
                    "thumbnail_url": item.thumbnail_url,
                    "alt_text": item.alt_text,
                    "description": item.description,
                    "caption": item.caption,
                    "credit": item.credit,
                    "width": item.width,
                    "height": item.height,
                    "duration": item.duration,
                    "scope_type": link.entity_type,
                    "scope_id": str(link.entity_id),
                    "display_order": link.display_order,
                    "created_at": _iso(item.created_at),
                    "updated_at": _iso(item.updated_at),
                }
            )
        return records

    @staticmethod
    async def _downloads(db: AsyncSession, scope: ResolvedEntityScope) -> list[dict[str, Any]]:
        result = await db.execute(
            select(Document)
            .options(selectinload(Document.file))
            .where(
                Document.deleted_at.is_(None),
                Document.is_active.is_(True),
                Document.is_public.is_(True),
                Document.requires_login.is_(False),
                _scope_filter(Document, scope.scope_pairs),
            )
        )
        return [
            {
                "id": str(item.id),
                "record_type": "download",
                "title": item.title,
                "slug": item.slug,
                "document_type": item.document_type,
                "category": item.category,
                "description": item.description,
                "file_id": str(item.file_id),
                "file_url": get_media_public_url(item.file),
                "version": item.version,
                "download_count": item.download_count,
                "scope_type": item.scope_type,
                "scope_id": str(item.scope_id) if item.scope_id else None,
                "display_order": item.display_order,
                "created_at": _iso(item.created_at),
                "updated_at": _iso(item.updated_at),
            }
            for item in result.scalars().unique().all()
        ]

    @staticmethod
    def _record_date(record: dict[str, Any]) -> datetime:
        raw = record.get("published_at") or record.get("start_date") or record.get("created_at")
        if not raw:
            return datetime.min.replace(tzinfo=timezone.utc)
        try:
            parsed = datetime.fromisoformat(str(raw))
            return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
        except ValueError:
            return datetime.min.replace(tzinfo=timezone.utc)

    @classmethod
    async def list(
        cls,
        db: AsyncSession,
        scope: ResolvedEntityScope,
        *,
        content_type: ContentType,
        page: int,
        per_page: int,
        search: str | None,
    ) -> tuple[list[dict[str, Any]], dict[str, int]]:
        loaders = {
            "news": cls._news,
            "events": cls._events,
            "gallery": cls._gallery,
            "downloads": cls._downloads,
        }
        selected = list(loaders) if content_type == "all" else [content_type]
        records: list[dict[str, Any]] = []
        for key in selected:
            records.extend(await loaders[key](db, scope))

        unique = {
            (str(item["record_type"]), str(item["id"])): item
            for item in records
            if _matches_search(item, search)
        }
        ordered = sorted(
            unique.values(),
            key=lambda item: (cls._record_date(item), str(item["id"])),
            reverse=True,
        )
        total = len(ordered)
        start = (page - 1) * per_page
        pages = (total + per_page - 1) // per_page if total else 0
        return ordered[start : start + per_page], {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": pages,
        }


__all__ = ["ContentType", "EntityType", "PublicEntityContentService", "ResolvedEntityScope"]
