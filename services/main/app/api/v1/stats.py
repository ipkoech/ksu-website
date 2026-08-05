"""Public display stats endpoints."""

import csv
import io
import json
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ...deps import CurrentUser, DbSession, require_scope, user_has_scope
from ...services.corporate_dashboard import (
    CONTENT_MODELS,
    SUPPORTED_OWNER_PORTALS,
    CorporateCommunicationDashboardService,
    build_dashboard_range,
)
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
    return False


def _corporate_dashboard_period(
    date_from: date | None,
    date_to: date | None,
    bucket: str,
):
    resolved_to = date_to or date.today()
    resolved_from = date_from or (resolved_to - timedelta(days=29))
    days = (resolved_to - resolved_from).days + 1
    if days < 1:
        raise HTTPException(status_code=422, detail="date_from must not be after date_to")
    if days > 366:
        raise HTTPException(status_code=422, detail="Dashboard date range cannot exceed 366 days")
    return build_dashboard_range(resolved_from, resolved_to, bucket)


def _authorize_corporate_dashboard(user: CurrentUser) -> None:
    required_scopes = PORTAL_STAT_SCOPES["corporate-communication"]
    if not _user_has_portal_stats_access(user, "corporate-communication", required_scopes):
        raise HTTPException(status_code=403, detail="Insufficient privileges")


async def _corporate_dashboard_data(
    db: DbSession,
    user: CurrentUser,
    *,
    date_from: date | None,
    date_to: date | None,
    compare: str,
    bucket: str,
    content_type: str | None,
    owner_portal: str | None,
):
    _authorize_corporate_dashboard(user)
    if content_type and content_type not in CONTENT_MODELS:
        raise HTTPException(status_code=422, detail="Unsupported dashboard content type")
    if owner_portal and owner_portal not in SUPPORTED_OWNER_PORTALS:
        raise HTTPException(status_code=422, detail="Unsupported dashboard owner portal")
    period = _corporate_dashboard_period(date_from, date_to, bucket)
    return await CorporateCommunicationDashboardService.build(
        db,
        period=period,
        compare=compare == "previous",
        content_type=content_type,
        owner_portal=owner_portal,
    )


@router.get("/portal/corporate-communication/dashboard")
async def get_corporate_communication_dashboard(
    db: DbSession,
    user: CurrentUser,
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    compare: str = Query("previous", pattern="^(previous|none)$"),
    bucket: str = Query("auto", pattern="^(auto|day|week|month)$"),
    content_type: str | None = Query(None),
    owner_portal: str | None = Query(None),
):
    dashboard = await _corporate_dashboard_data(
        db,
        user,
        date_from=date_from,
        date_to=date_to,
        compare=compare,
        bucket=bucket,
        content_type=content_type,
        owner_portal=owner_portal,
    )
    return success(data=dashboard.model_dump(mode="json"))


@router.get("/portal/corporate-communication/dashboard/export")
async def export_corporate_communication_dashboard(
    db: DbSession,
    user: CurrentUser,
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    compare: str = Query("previous", pattern="^(previous|none)$"),
    bucket: str = Query("auto", pattern="^(auto|day|week|month)$"),
    content_type: str | None = Query(None),
    owner_portal: str | None = Query(None),
):
    dashboard = await _corporate_dashboard_data(
        db,
        user,
        date_from=date_from,
        date_to=date_to,
        compare=compare,
        bucket=bucket,
        content_type=content_type,
        owner_portal=owner_portal,
    )
    data = dashboard.model_dump(mode="json")
    rows: list[dict[str, object]] = []
    for metric in data["activity"]["metrics"]:
        rows.append({"section": "activity", **metric})
    for item in data["snapshot"]["status_distribution"]:
        rows.append({"section": "status_distribution", **item})
    for item in data["workflow"]["backlog_aging"]:
        rows.append({"section": "backlog_aging", **item})
    for item in data["workflow"]["by_content_type"]:
        rows.append({"section": "content_type", **item})
    for item in data["workflow"]["by_owner_portal"]:
        rows.append({"section": "owner_portal", **item})
    for item in data["workflow"]["series"]:
        rows.append({
            "section": "workflow_series",
            "period": item["period"],
            "value": item["total"],
            "details": json.dumps(item["values"], sort_keys=True),
        })
    for item in data["publishing"]["series"]:
        rows.append({
            "section": "publishing_series",
            "period": item["period"],
            "value": item["total"],
            "details": json.dumps(item["values"], sort_keys=True),
        })
    for item in data["readiness"]["checks"]:
        rows.append({"section": "readiness", **item})
    for item in data["insights"]:
        rows.append({"section": "insight", **item})
    for item in data["attention_items"]:
        rows.append({
            "section": "attention",
            **item,
            "issue_codes": ",".join(item["issue_codes"]),
        })

    fieldnames = sorted({key for row in rows for key in row}) if rows else ["section", "value"]
    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=fieldnames, extrasaction="ignore")
    writer.writeheader()
    writer.writerows(rows)
    filename = f"corporate-communication-dashboard-{data['period']['date_from']}-{data['period']['date_to']}.csv"
    return Response(
        content=buffer.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
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
