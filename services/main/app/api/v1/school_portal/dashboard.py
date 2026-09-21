"""Operational School Portal dashboard endpoint."""

from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import Response, StreamingResponse
from ksu_common import rate_limit
from ksu_common.schemas.responses import SuccessResponse, success
from ksu_common.response_validation import allow_response_model_exemption

from ....clients.research import ResearchClient
from ....core.config import get_settings
from ....deps import DbSession
from ....schemas.school_portal_dashboard import (
    DashboardRange,
    SchoolPortalDashboardResponse,
)
from ....services.school_portal_context import CurrentSchoolContext
from ....services.school_portal_dashboard import SchoolPortalDashboardService

router = APIRouter()


@router.get(
    "/dashboard",
    response_model=SuccessResponse[SchoolPortalDashboardResponse],
)
@rate_limit(requests=120, window=60, prefix="main:school-dashboard")
async def get_school_dashboard(
    request: Request,
    db: DbSession,
    context: CurrentSchoolContext,
    range_value: DashboardRange = Query("30d", alias="range"),
):
    if "school.dashboard.view" not in context.permissions:
        raise HTTPException(
            status_code=403,
            detail="school.dashboard.view permission is required",
        )

    authorization = request.headers.get("Authorization")
    if not authorization and (token := request.cookies.get("ksu_access")):
        authorization = f"Bearer {token}"
    publications: dict[str, int] = {}
    if "school.publications.view" in context.permissions:
        try:
            payload = await ResearchClient(
                base_url=get_settings().RESEARCH_SERVICE_URL,
                authorization=authorization,
                request_id=request.headers.get("X-Request-ID"),
                selected_school=str(context.school.id),
            ).get_school_publication_summary()
            publications = {
                str(key): int(value)
                for key, value in (payload.get("data") or {}).items()
            }
        except Exception:
            publications = {}

    response = await SchoolPortalDashboardService.build(
        db,
        school=context.school,
        permissions=context.permissions,
        range_value=range_value,
        publication_statuses=publications,
    )
    return success(data=response.model_dump(mode="json"))


__all__ = ["get_school_dashboard", "router"]


@allow_response_model_exemption("stream", path="/api/v1/school-portal/reports/export")
@router.get("/reports/export", response_class=StreamingResponse)
async def export_school_report(
    request: Request,
    db: DbSession,
    context: CurrentSchoolContext,
    range_value: DashboardRange = Query("30d", alias="range"),
    format: str = Query("csv", pattern="^(csv|json)$"),
):
    """Export the same authorized dashboard aggregation used by the report builder."""
    if "school.dashboard.view" not in context.permissions:
        raise HTTPException(status_code=403, detail="school.dashboard.view permission is required")
    dashboard = await get_school_dashboard(request, db, context, range_value)
    payload = dashboard.data or {}
    if format == "json":
        import json
        return Response(content=json.dumps(payload, default=str), media_type="application/json")
    lines = ["metric,value,range"]
    for card in payload.get("summary_cards", []):
        label = str(card.get("label", card.get("key", ""))).replace('"', '""')
        lines.append(f'"{label}",{card.get("value", "")},{payload.get("range", range_value)}')
    return Response(content="\n".join(lines) + "\n", media_type="text/csv", headers={"Content-Disposition": f'attachment; filename="school-report-{range_value}.csv"'})
