"""Operational School Portal dashboard endpoint."""

from fastapi import APIRouter, HTTPException, Query, Request
from ksu_common import rate_limit
from ksu_common.schemas.responses import SuccessResponse, success

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
