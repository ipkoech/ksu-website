"""Public display stats endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ...deps import CurrentUser, DbSession, require_scope
from ...services.stats import admin_stats, public_stats

router = APIRouter()


@router.get("")
@cached_public(timeout=300, vary_on=("scope", "slug"))
async def get_public_stats(
    request: Request,
    db: DbSession,
    scope: str = Query("homepage", pattern="^(homepage|university|school|department)$"),
    slug: str | None = Query(None, min_length=1),
):
    result = await public_stats(db, scope=scope, slug=slug)
    if result is None:
        raise HTTPException(status_code=404, detail="Stats scope not found")
    return success(data=result.model_dump())


@router.get("/admin", dependencies=[Depends(require_scope("analytics:read"))])
async def get_admin_stats(
    db: DbSession,
    _: CurrentUser,
):
    result = await admin_stats(db)
    return success(data=result.model_dump())
