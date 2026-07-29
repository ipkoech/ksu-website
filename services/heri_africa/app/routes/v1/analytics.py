from __future__ import annotations

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...models.analytics import AnalyticsEvent
from ...schemas.analytics import AnalyticsEventPayload

router = APIRouter(tags=["HERI Analytics"])


@router.post("/analytics/events", status_code=status.HTTP_202_ACCEPTED)
async def track_event(payload: AnalyticsEventPayload, request: Request, db: AsyncSession = Depends(get_db)):
    properties = {**payload.properties, "source_ip": request.client.host if request.client else None}
    db.add(AnalyticsEvent(event_name=payload.event_name, path=payload.path, session_id=payload.session_id, properties=properties))
    return {"status": "accepted"}
