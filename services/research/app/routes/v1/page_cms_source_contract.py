"""Public Page CMS source contract backed by research-owned records."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query
from ksu_common.schemas.responses import success
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...schemas.page_cms_source_contract import PageCmsResearchSourceResolveRequest
from ...services.page_cms_source_contract import PageCmsResearchSourceService

router = APIRouter(prefix="/page-cms-sources", tags=["Page CMS Sources"])


@router.get("/{source_type}")
async def search_page_cms_sources(
    source_type: str,
    page: int = Query(1, ge=1, le=100),
    per_page: int = Query(20, ge=1, le=50),
    search: str | None = Query(default=None, max_length=255),
    center_id: uuid.UUID | None = None,
    db: AsyncSession = Depends(get_db),
):
    result = await PageCmsResearchSourceService.search(
        db,
        source_type=source_type,
        page=page,
        per_page=per_page,
        search=search,
        center_id=center_id,
    )
    return success(data=[item.model_dump(mode="json") for item in result.items], meta=result.meta)


@router.post("/{source_type}/resolve")
async def resolve_page_cms_sources(
    source_type: str,
    request: PageCmsResearchSourceResolveRequest,
    db: AsyncSession = Depends(get_db),
):
    summaries = await PageCmsResearchSourceService.resolve_many(
        db,
        source_type=source_type,
        ids=request.ids,
        center_id=request.center_id,
    )
    return success(data=[item.model_dump(mode="json") for item in summaries])
