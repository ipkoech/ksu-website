"""Unified public library search route."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from ksu_common.cache import cached_public
from ksu_common.schemas.responses import success

from ...core.database import get_db
from ...schemas.search import LibrarySearchResponse
from ...services.search import unified_search
from ._rate_limits import public_catalog_rate_limit

router = APIRouter(prefix="/library/search", tags=["Library Search"])


@router.get("")
@public_catalog_rate_limit
@cached_public(timeout=60, vary_on=("q", "types", "library_id", "limit"))
async def search_library(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    q: str = Query(..., min_length=1),
    types: str | None = Query(
        default=None,
        description="Comma-separated result types: branch,catalog,database,download,external_link,regulation,service,staff",
    ),
    library_id: uuid.UUID | None = Query(default=None),
    limit: int = Query(default=40, ge=1, le=100),
):
    result = await unified_search(
        db,
        query=q,
        types=types,
        library_id=library_id,
        limit=limit,
    )
    return success(data=LibrarySearchResponse.model_validate(result).model_dump())
