"""Content and support endpoints."""

from __future__ import annotations

import uuid
from typing import Annotated, Any

from fastapi import APIRouter
from fastapi import Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...models import PublicMedia
from ...schemas import (
    ResearchGuidelineCreate,
    ResearchGuidelineUpdate,
    ResearchResourceCreate,
    ResearchResourceUpdate,
    ResearchServiceCreate,
    ResearchServiceUpdate,
)
from ...services import GuidelineService, ResourceService, SupportService
from ._crud import build_crud_router

router = APIRouter()


DbSession = Annotated[AsyncSession, Depends(get_db)]


def _compact_url(value: Any) -> str:
    if not isinstance(value, str):
        return ""
    value = value.strip()
    return value if value else ""


def _media_ids(value: Any) -> list[uuid.UUID]:
    if not isinstance(value, list):
        return []
    media_ids: list[uuid.UUID] = []
    for item in value:
        try:
            media_ids.append(item if isinstance(item, uuid.UUID) else uuid.UUID(str(item)))
        except (TypeError, ValueError):
            continue
    return media_ids


async def _public_media_url(db: AsyncSession, media_ids: list[uuid.UUID]) -> str:
    if not media_ids:
        return ""
    result = await db.execute(
        select(PublicMedia).where(
            PublicMedia.id.in_(media_ids),
            PublicMedia.deleted_at.is_(None),
            PublicMedia.is_public.is_(True),
        )
    )
    media_by_id = {item.id: item for item in result.scalars().all()}
    for media_id in media_ids:
        media = media_by_id.get(media_id)
        if media is not None:
            return media.url
    return ""


async def _resolve_record_download_url(db: AsyncSession, item: Any, *, allow_access_url: bool = False) -> str:
    for field in ("document_url", "download_url", "file_url", "pdf_url", "url"):
        url = _compact_url(getattr(item, field, None))
        if url:
            return url

    document_id = getattr(item, "document_id", None)
    if document_id:
        url = await _public_media_url(db, [document_id])
        if url:
            return url

    for field in ("document_media_ids", "attachment_media_ids"):
        url = await _public_media_url(db, _media_ids(getattr(item, field, None)))
        if url:
            return url

    if allow_access_url:
        return _compact_url(getattr(item, "access_url", None))
    return ""


async def _public_record_by_id(db: AsyncSession, service: Any, item_id: uuid.UUID) -> Any:
    query = service.model.active_query().where(service.model.id == item_id)
    query = service._apply_public_visibility(query)
    result = await db.execute(query)
    return result.scalar_one_or_none()


@router.get("/resources/{item_id}/download")
async def download_resource(item_id: uuid.UUID, db: DbSession):
    item = await _public_record_by_id(db, ResourceService, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Research resource not found")
    url = await _resolve_record_download_url(db, item, allow_access_url=True)
    if not url:
        raise HTTPException(status_code=404, detail="Research resource download not found")
    return RedirectResponse(url=url, status_code=302)


@router.get("/guidelines/{item_id}/download")
async def download_guideline(item_id: uuid.UUID, db: DbSession):
    item = await _public_record_by_id(db, GuidelineService, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Research guideline not found")
    url = await _resolve_record_download_url(db, item)
    if not url:
        raise HTTPException(status_code=404, detail="Research guideline download not found")
    return RedirectResponse(url=url, status_code=302)


router.include_router(build_crud_router(prefix="/resources", tag="Research Resources", service=ResourceService, create_schema=ResearchResourceCreate, update_schema=ResearchResourceUpdate, write_scope="research.manage_resources"))
router.include_router(build_crud_router(prefix="/services", tag="Research Services", service=SupportService, create_schema=ResearchServiceCreate, update_schema=ResearchServiceUpdate, write_scope="research.manage_services"))
router.include_router(build_crud_router(prefix="/guidelines", tag="Research Guidelines", service=GuidelineService, create_schema=ResearchGuidelineCreate, update_schema=ResearchGuidelineUpdate, write_scope="research.manage_guidelines"))
