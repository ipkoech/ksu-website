import hashlib
import json

from fastapi import APIRouter, Depends, HTTPException, Request, status
from ksu_common.rate_limit import RateLimiter, rate_limit
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...models.analytics import AnalyticsEvent
from ...schemas.analytics import AnalyticsEventPayload

router = APIRouter(tags=["HERI Analytics"])
_ANALYTICS_SESSION_LIMITER = RateLimiter(requests=120, window=60, prefix="heri:analytics:session")


def _event_identity(payload: AnalyticsEventPayload, request: Request) -> str:
    supplied = request.headers.get("Idempotency-Key", "").strip()
    if supplied:
        if len(supplied) > 128:
            raise HTTPException(status_code=400, detail="Idempotency-Key is too long")
        return supplied
    return hashlib.sha256(
        json.dumps(
            {
                "event_name": payload.event_name,
                "path": payload.path,
                "session_id": payload.session_id,
            },
            sort_keys=True,
            separators=(",", ":"),
        ).encode()
    ).hexdigest()


async def _event_is_duplicate(payload: AnalyticsEventPayload, request: Request, db: AsyncSession) -> bool:
    identity = _event_identity(payload, request)
    result = await db.execute(
        select(AnalyticsEvent)
        .where(AnalyticsEvent.event_name == payload.event_name)
        .order_by(AnalyticsEvent.created_at.desc())
        .limit(20)
    )
    return any((event.properties or {}).get("idempotency_key") == identity for event in result.scalars().all())


@router.post("/analytics/events", status_code=status.HTTP_202_ACCEPTED)
@rate_limit(requests=120, window=60, prefix="heri:analytics:ip", max_body_bytes=32 * 1024)
async def track_event(payload: AnalyticsEventPayload, request: Request, db: AsyncSession = Depends(get_db)):
    session_identifier = payload.session_id or (request.client.host if request.client else "unknown")
    await _ANALYTICS_SESSION_LIMITER.check(
        session_identifier,
        f"{request.method}:{request.url.path}:session",
    )
    if await _event_is_duplicate(payload, request, db):
        return {"status": "accepted", "duplicate": True}
    event_identity = _event_identity(payload, request)
    properties = {
        **payload.properties,
        "source_ip": request.client.host if request.client else None,
        "idempotency_key": event_identity,
    }
    db.add(AnalyticsEvent(event_name=payload.event_name, path=payload.path, session_id=payload.session_id, properties=properties))
    return {"status": "accepted"}
