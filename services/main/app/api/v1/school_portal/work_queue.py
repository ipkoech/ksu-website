"""Backend-derived school follow-up queue."""

from fastapi import APIRouter, HTTPException, Query, Request
from ksu_common.schemas.responses import SuccessResponse, success

from ....deps import DbSession
from ....schemas.school_portal_dashboard import DashboardRange, SchoolWorkQueueResponse
from ....services.school_portal_context import CurrentSchoolContext
from .dashboard import get_school_dashboard

router = APIRouter()


@router.get("/work-queue", response_model=SuccessResponse[SchoolWorkQueueResponse])
async def list_school_work_queue(
    request: Request,
    db: DbSession,
    context: CurrentSchoolContext,
    range_value: DashboardRange = Query("30d", alias="range"),
):
    """Return actionable items backed by school dashboard records and PBAC."""
    if "school.dashboard.view" not in context.permissions:
        raise HTTPException(status_code=403, detail="school.dashboard.view permission is required")
    dashboard = await get_school_dashboard(request, db, context, range_value)
    payload = dashboard.data or {}
    items = [
        {
            "id": item["key"],
            "title": item["label"],
            "count": item["count"],
            "priority": item["severity"],
            "status": "open",
            "href": item["href"],
            "source": "dashboard_attention",
        }
        for item in payload.get("attention_items", [])
    ]
    return success(data={"range": payload.get("range", range_value), "generated_at": payload.get("generated_at"), "items": items})


__all__ = ["list_school_work_queue", "router"]
