"""Public analytics ingestion endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Request, status

from ksu_common import rate_limit
from ksu_common.schemas.responses import success

from ...core.config import get_settings
from ...deps import DbSession
from ...schemas import AnalyticsEventBatchCreate
from ...services import AnalyticsService

router = APIRouter()
settings = get_settings()


@router.post("/events", status_code=status.HTTP_202_ACCEPTED)
@rate_limit(
    requests=settings.ANALYTICS_RATE_LIMIT_COUNT,
    window=settings.ANALYTICS_RATE_LIMIT_WINDOW_SECONDS,
    prefix="main:analytics:ip",
    max_body_bytes=64 * 1024,
)
async def ingest_events(request: Request, payload: AnalyticsEventBatchCreate, db: DbSession):
    events = await AnalyticsService.ingest(db, payload.events)
    return success(data={"accepted": len(events)}, message="Analytics events accepted")
