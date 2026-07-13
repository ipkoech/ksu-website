"""Public display stats endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ...deps import CurrentUser, DbSession, require_scope, user_has_scope
from ...services.portal_access import build_portal_access_records
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
        "content.manage",
        "content.manage_pages",
        "content.manage_news",
        "content.manage_events",
        "content.manage_blogs",
        "content.manage_announcements",
        "content.manage_categories",
        "content.review",
        "content.edit_submitted",
        "content.approve",
        "content.publish",
        "content.schedule",
        "content.unpublish",
        "media.view",
        "media.manage",
        "media.upload",
        "homepage.view",
        "homepage.manage",
        "homepage.publish",
        "marketing.view",
        "partnership_spotlights.manage",
        "clubs.view",
        "clubs.content_submit",
        "clubs.manage_own",
        "clubs.events_manage",
        "clubs.stories_manage",
        "page_sections.view",
        "page_sections.manage",
        "page_sections.create",
        "page_sections.update",
        "page_sections.delete",
        "page_sections.review",
        "page_sections.publish",
        "marketing.manage_sliders",
        "marketing.manage_testimonials",
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
    "library": (
        "library.view",
        "library:read",
        "library.manage_resources",
        "library.manage_services",
        "library.manage_collections",
        "library.manage_staff",
        "library.manage_loans",
    ),
}


def _user_has_portal_stats_access(user: CurrentUser, portal: str, required_scopes: tuple[str, ...]) -> bool:
    if any(user_has_scope(user, scope) for scope in required_scopes):
        return True
    return any(
        record.key == portal
        for record in build_portal_access_records(user, scope_labels={})
    )


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
    if not _user_has_portal_stats_access(user, portal, required_scopes):
        raise HTTPException(status_code=403, detail="Insufficient privileges")

    result = await portal_stats(db, portal)
    if result is None:
        raise HTTPException(status_code=404, detail="Portal stats not found")
    return success(data=result.model_dump())
