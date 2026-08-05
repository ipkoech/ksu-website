"""Research admin analytics dashboard endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ksu_common.auth import TokenPayload
from ksu_common.schemas.responses import success

from ...core.auth import require_scope
from ...core.database import get_db
from ...schemas.analytics import ResearchDashboardAnalyticsSuccessResponse
from ...services.analytics import ResearchAnalyticsService

router = APIRouter(tags=["Research Analytics"], dependencies=[Depends(require_scope("research.view"))])


@router.get("/analytics/dashboard", response_model=ResearchDashboardAnalyticsSuccessResponse)
async def get_research_dashboard_analytics(
    db: AsyncSession = Depends(get_db),
    user: TokenPayload = Depends(require_scope("research.view")),
):
    result = await ResearchAnalyticsService.dashboard(db)
    return success(data=result.model_dump(mode="json"))
