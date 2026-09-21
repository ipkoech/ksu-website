"""Public display stats endpoint."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from ksu_common.auth import TokenPayload

from ksu_common.cache import cached_public
from ksu_common.internal_client import internal_key_guard
from ...core.auth import allowed_library_scope_ids, requires_scope
from ksu_common.schemas.responses import SuccessResponse, success

from ...core.database import get_db
from ...core.config import get_settings
from ...services.stats import admin_library_stats, public_library_stats
from ...schemas.stats import PublicStatsResponse

router = APIRouter(prefix="/library/stats", tags=["Stats"])
verify_internal_key = internal_key_guard(
    lambda: get_settings().INTERNAL_API_KEY,
    allow_legacy_header=False,
)


@router.get("", response_model=SuccessResponse[PublicStatsResponse])
@cached_public(timeout=300, vary_on=())
async def get_public_stats(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    result = await public_library_stats(db)
    return success(data=result.model_dump())


@router.get("/admin", response_model=SuccessResponse[PublicStatsResponse])
async def get_admin_stats(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
    user: TokenPayload = Depends(requires_scope("library.read")),
):
    response.headers["Cache-Control"] = "no-store"
    result = await admin_library_stats(db, scope_ids=allowed_library_scope_ids(user, "library.read"))
    return success(data=result.model_dump())


@router.get("/internal/admin", response_model=SuccessResponse[PublicStatsResponse], dependencies=[Depends(verify_internal_key)])
async def get_internal_admin_stats(
    response: Response,
    db: AsyncSession = Depends(get_db),
    user: TokenPayload = Depends(requires_scope("library.read")),
):
    """Return admin counters to an authenticated sibling service."""
    response.headers["Cache-Control"] = "no-store"
    result = await admin_library_stats(db, scope_ids=allowed_library_scope_ids(user, "library.read"))
    return success(data=result.model_dump())
