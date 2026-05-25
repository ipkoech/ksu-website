"""Public media lookup endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException

from ksu_common.schemas.responses import success

from ...deps import DbSession
from ...services import MediaService

router = APIRouter()


@router.get("/{media_id}")
async def get_public_media(media_id: uuid.UUID, db: DbSession):
    media = await MediaService.get_by_id(db, media_id)
    if media is None or not media.is_public:
        raise HTTPException(status_code=404, detail="Media not found")

    return success(
        data={
            "id": str(media.id),
            "filename": media.filename,
            "original_filename": media.original_filename,
            "mime_type": media.mime_type,
            "media_type": media.media_type,
            "url": media.url,
            "public_url": media.public_url,
            "cdn_url": media.cdn_url,
            "thumbnail_url": media.thumbnail_url,
            "alt_text": media.alt_text,
            "title": media.title,
        }
    )
