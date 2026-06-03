"""Public media lookup endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ksu_common.schemas.responses import success

from ...deps import DbSession
from ...models import Media, MediaLink
from ...services import MediaService
from ...services._base import ilike_any, paginate_query

router = APIRouter()


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
async def list_public_media(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(24, ge=1, le=100),
    media_type: str | None = None,
    search: str | None = None,
):
    query = (
        select(Media)
        .where(Media.deleted_at.is_(None), Media.is_public.is_(True))
        .order_by(Media.created_at.desc())
    )
    if media_type:
        query = query.where(Media.media_type == media_type)
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
async def list_public_media_links(
    db: DbSession,
    entity_type: str = Query(..., min_length=1, max_length=64),
    entity_id: uuid.UUID = Query(...),
    role: str | None = Query(default=None, max_length=64),
    per_page: int = Query(24, ge=1, le=100),
):
    query = (
        select(MediaLink)
        .options(selectinload(MediaLink.media))
        .join(Media, MediaLink.media_id == Media.id)
        .where(
            MediaLink.deleted_at.is_(None),
            MediaLink.is_public.is_(True),
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
async def get_public_media(media_id: uuid.UUID, db: DbSession):
    media = await MediaService.get_by_id(db, media_id)
    if media is None or not media.is_public:
        raise HTTPException(status_code=404, detail="Media not found")

    return success(data=public_media_payload(media))
