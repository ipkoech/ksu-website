"""Unified public research search route."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from ksu_common.cache import cached_public
from ksu_common.rate_limit import rate_limit
from ksu_common.schemas.responses import success

from ...core.database import get_db
from ...schemas.search import ResearchSearchResponse, ResearchSearchSuccessResponse
from ...services.search import unified_research_search

router = APIRouter(tags=["Research Search"])


@router.get("/search", response_model=ResearchSearchSuccessResponse)
@rate_limit(requests=30, window=60, prefix="research:search:ip")
@cached_public(timeout=60, vary_on=("q", "types", "limit"))
async def search_research(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    q: str = Query(..., min_length=1),
    types: str | None = Query(
        default=None,
        description="Comma-separated result types, for example projects,publications,grants,innovations,resources.",
    ),
    limit: int = Query(default=60, ge=1, le=120),
):
    result = await unified_research_search(
        db,
        query=q,
        types=types,
        limit=limit,
    )
    return success(data=ResearchSearchResponse.model_validate(result).model_dump())
