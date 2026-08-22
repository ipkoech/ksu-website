"""Public media lookup endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query, Request
from sqlalchemy import and_, or_, select
from sqlalchemy.orm import selectinload

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ...deps import DbSession
from ...models import Media, MediaFolder, MediaLink
from ...services import MediaService
from ...services._base import ilike_any, paginate_query
from ...core.config import public_media_rate_limit

router = APIRouter()


def _public_media_link_filter(now: datetime):
    return (
        MediaLink.is_public.is_(True),
        or_(
            MediaLink.owner_scope_type != "club",
            MediaLink.owner_scope_type.is_(None),
            and_(
                MediaLink.is_published.is_(True),
                MediaLink.workflow_status == "published",
                MediaLink.archived_at.is_(None),
                or_(MediaLink.scheduled_publish_at.is_(None), MediaLink.scheduled_publish_at <= now),
                or_(MediaLink.expires_at.is_(None), MediaLink.expires_at >= now),
            ),
        ),
    )


def public_media_payload(media: Media) -> dict[str, object | None]:
    return {
        "id": str(media.id),
        "filename": media.filename,
        "original_filename": media.original_filename,
        "mime_type": media.mime_type,
        "file_size": media.file_size,
        "media_type": media.media_type,
        "url": media.url,
        "public_url": media.public_url,
        "cdn_url": media.cdn_url,
        "thumbnail_url": media.thumbnail_url,
        "alt_text": media.alt_text,
        "title": media.title,
        "description": media.description,
        "caption": media.caption,
        "tags": media.tags,
        "credit": media.credit,
        "width": media.width,
        "height": media.height,
        "duration": media.duration,
        "created_at": media.created_at.isoformat() if media.created_at else None,
        "updated_at": media.updated_at.isoformat() if media.updated_at else None,
    }


def public_media_link_payload(link: MediaLink) -> dict[str, object | None]:
    return {
        "id": str(link.id),
        "media_id": str(link.media_id),
        "entity_type": link.entity_type,
        "entity_id": str(link.entity_id),
        "role": link.role,
        "folder_id": str(link.folder_id) if link.folder_id else None,
        "display_order": link.display_order,
        "is_public": link.is_public,
        "created_at": link.created_at.isoformat() if link.created_at else None,
        "updated_at": link.updated_at.isoformat() if link.updated_at else None,
        "media": public_media_payload(link.media) if link.media else None,
    }


@router.get("")
@public_media_rate_limit
@cached_public(
    timeout=300,
    vary_on=("page", "per_page", "media_type", "collection", "search"),
)
async def list_public_media(
    request: Request,
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(24, ge=1, le=100),
    media_type: str | None = None,
    collection: str | None = Query(default=None, min_length=1, max_length=255),
    search: str | None = None,
):
    query = (
        select(Media)
        .where(Media.deleted_at.is_(None), Media.is_public.is_(True))
        .order_by(Media.created_at.desc())
    )
    if media_type:
        query = query.where(Media.media_type == media_type)
    if collection:
        query = query.join(MediaFolder, Media.folder_id == MediaFolder.id).where(
            MediaFolder.deleted_at.is_(None),
            MediaFolder.is_public.is_(True),
            MediaFolder.slug == collection,
        )
    if search:
        query = query.where(
            ilike_any(
                search,
                Media.title,
                Media.original_filename,
                Media.filename,
                Media.alt_text,
                Media.description,
                Media.caption,
            )
        )

    result = await paginate_query(db, query, page=page, per_page=per_page)
    return success(
        data=[public_media_payload(media) for media in result.items],
        meta=result.meta,
    )


@router.get("/links")
@public_media_rate_limit
@cached_public(timeout=300, vary_on=("entity_type", "entity_id", "role", "per_page"))
async def list_public_media_links(
    request: Request,
    db: DbSession,
    entity_type: str = Query(..., min_length=1, max_length=64),
    entity_id: uuid.UUID = Query(...),
    role: str | None = Query(default=None, max_length=64),
    per_page: int = Query(24, ge=1, le=100),
):
    now = datetime.now(timezone.utc)
    query = (
        select(MediaLink)
        .options(selectinload(MediaLink.media))
        .join(Media, MediaLink.media_id == Media.id)
        .where(
            MediaLink.deleted_at.is_(None),
            *_public_media_link_filter(now),
            Media.deleted_at.is_(None),
            Media.is_public.is_(True),
            MediaLink.entity_type == entity_type,
            MediaLink.entity_id == entity_id,
        )
        .order_by(MediaLink.display_order.asc(), MediaLink.created_at.asc())
        .limit(per_page)
    )
    if role:
        query = query.where(MediaLink.role == role)

    result = await db.execute(query)
    links = result.scalars().all()
    return success(data=[public_media_link_payload(link) for link in links])


@router.get("/{media_id}")
@public_media_rate_limit
@cached_public(timeout=300, vary_on=("media_id",))
async def get_public_media(request: Request, media_id: uuid.UUID, db: DbSession):
    media = await MediaService.get_by_id(db, media_id)
    if media is None or not media.is_public:
        raise HTTPException(status_code=404, detail="Media not found")

    return success(data=public_media_payload(media))
