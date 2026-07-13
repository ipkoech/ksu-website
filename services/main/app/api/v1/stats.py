"""Public display stats endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ...deps import CurrentUser, DbSession, require_scope, user_has_scope
from ...services.stats import PORTAL_ALIASES, admin_stats, portal_stats, public_stats

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


PORTAL_STAT_SCOPES = {
    "admin": ("governance.view", "administration.view", "office.view"),
    "corporate-communication": (
        "content.view",
        "content.review",
        "content.publish",
        "media.view",
        "media.manage",
        "homepage.view",
        "homepage.manage",
        "partnership_spotlights.manage",
        "clubs.view",
        "clubs.content_submit",
        "clubs.manage_own",
    ),
    "schools": ("academic.view",),
    "departments": ("academic.view",),
    "research": (
        "research.view",
        "research.view_projects",
        "publications.view",
        "publications.submit",
        "publications.review",
        "publications.approve",
        "publications.manage",
    ),
}


@router.get("/portal/{portal}")
async def get_portal_stats(
    portal: str,
    db: DbSession,
    user: CurrentUser,
):
    portal = PORTAL_ALIASES.get(portal, portal)
    required_scopes = PORTAL_STAT_SCOPES.get(portal)
    if required_scopes is None:
        raise HTTPException(status_code=404, detail="Portal stats not found")
    if not any(user_has_scope(user, scope) for scope in required_scopes):
        raise HTTPException(status_code=403, detail="Insufficient privileges")

    result = await portal_stats(db, portal)
    if result is None:
        raise HTTPException(status_code=404, detail="Portal stats not found")
    return success(data=result.model_dump())
