"""Public analytics ingestion endpoints."""

from __future__ import annotations

from fastapi import APIRouter, status

from ksu_common.schemas.responses import success

from ...deps import DbSession
from ...schemas import AnalyticsEventBatchCreate
from ...services import AnalyticsService

router = APIRouter()


@router.post("/events", status_code=status.HTTP_202_ACCEPTED)
async def ingest_events(payload: AnalyticsEventBatchCreate, db: DbSession):
    events = await AnalyticsService.ingest(db, payload.events)
    return success(data={"accepted": len(events)}, message="Analytics events accepted")
