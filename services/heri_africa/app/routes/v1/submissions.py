import hashlib
import json

from fastapi import APIRouter, Depends, HTTPException, Request, status
from ksu_common.rate_limit import RateLimiter, rate_limit
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...models.submissions import Submission
from ...schemas.submissions import (
    ContactSubmission,
    NewsletterSubmission,
    NetworkSubmission,
    PartnershipSubmission,
)
from ...models.content import Event
from pydantic import BaseModel, EmailStr, Field

router = APIRouter(tags=["HERI Submissions"])

_SUBMISSION_EMAIL_LIMITERS = {
    "contact": RateLimiter(requests=10, window=3600, prefix="heri:contact:email"),
    "partnership": RateLimiter(requests=10, window=3600, prefix="heri:partnership:email"),
    "network": RateLimiter(requests=10, window=3600, prefix="heri:network:email"),
    "newsletter": RateLimiter(requests=5, window=3600, prefix="heri:newsletter:email"),
    "event_registration": RateLimiter(
        requests=10,
        window=3600,
        prefix="heri:event-registration:email",
    ),
}


class EventRegistration(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    email: EmailStr
    organisation: str | None = Field(default=None, max_length=255)
    country: str | None = Field(default=None, max_length=120)
    accessibility_requirements: str | None = Field(default=None, max_length=2000)
    consent: bool


async def _find_duplicate(
    kind: str,
    email: str,
    idempotency_key: str,
    db: AsyncSession,
) -> Submission | None:
    result = await db.execute(
        select(Submission)
        .where(Submission.kind == kind, Submission.email == email)
        .order_by(Submission.created_at.desc())
        .limit(10)
    )
    for existing in result.scalars().all():
        if (existing.payload or {}).get("idempotency_key") == idempotency_key:
            return existing
    return None


def _submission_idempotency_key(
    kind: str,
    payload_data: dict,
    request: Request,
    *,
    event_id: str | None = None,
) -> str:
    supplied = request.headers.get("Idempotency-Key", "").strip()
    if supplied:
        if len(supplied) > 128:
            raise HTTPException(status_code=400, detail="Idempotency-Key is too long")
        return supplied
    canonical = json.dumps(
        {"kind": kind, "event_id": event_id, "payload": payload_data},
        sort_keys=True,
        separators=(",", ":"),
    )
    return hashlib.sha256(canonical.encode()).hexdigest()


async def _save_submission(
    kind: str,
    payload: object,
    db: AsyncSession,
    request: Request,
    *,
    event_id: str | None = None,
) -> dict[str, str]:
    data = payload.model_dump(mode="json")
    if not data.pop("consent", False):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Consent is required")
    name = data.get("name") or data.get("contact_person") or data.get("email", "subscriber")
    email = str(data["email"]).strip().lower()
    await _SUBMISSION_EMAIL_LIMITERS[kind].check(email, f"POST:/heri/submissions/{kind}/email")
    idempotency_key = _submission_idempotency_key(
        kind,
        data,
        request,
        event_id=event_id,
    )
    if await _find_duplicate(kind, email, idempotency_key, db):
        return {"status": "duplicate", "message": "This submission was already received."}
    data["idempotency_key"] = idempotency_key
    if event_id is not None:
        data["event_id"] = event_id
    db.add(
        Submission(
            kind=kind,
            name=name,
            email=email,
            organisation=data.get("organisation"),
            country=data.get("country"),
            message=data.get("message") or data.get("proposed_collaboration") or "",
            payload={**data, "source_ip": request.client.host if request.client else None},
        )
    )
    return {"status": "received", "message": "Thank you. The HERI Africa team will respond soon."}


@router.post("/contact", status_code=status.HTTP_202_ACCEPTED)
@rate_limit(requests=5, window=300, prefix="heri:contact:ip", max_body_bytes=32 * 1024)
async def contact(payload: ContactSubmission, request: Request, db: AsyncSession = Depends(get_db)):
    return await _save_submission("contact", payload, db, request)


@router.post("/partnership-applications", status_code=status.HTTP_202_ACCEPTED)
@rate_limit(
    requests=5,
    window=3600,
    prefix="heri:partnership:ip",
    max_body_bytes=32 * 1024,
)
async def partnership(payload: PartnershipSubmission, request: Request, db: AsyncSession = Depends(get_db)):
    return await _save_submission("partnership", payload, db, request)


@router.post("/network-applications", status_code=status.HTTP_202_ACCEPTED)
@rate_limit(requests=5, window=3600, prefix="heri:network:ip", max_body_bytes=32 * 1024)
async def network(payload: NetworkSubmission, request: Request, db: AsyncSession = Depends(get_db)):
    return await _save_submission("network", payload, db, request)


@router.post("/newsletter/subscribe", status_code=status.HTTP_202_ACCEPTED)
@rate_limit(
    requests=3,
    window=3600,
    prefix="heri:newsletter:ip",
    max_body_bytes=8 * 1024,
)
async def newsletter(payload: NewsletterSubmission, request: Request, db: AsyncSession = Depends(get_db)):
    return await _save_submission("newsletter", payload, db, request)


@router.post("/events/{event_id}/register", status_code=status.HTTP_202_ACCEPTED)
@rate_limit(
    requests=5,
    window=3600,
    prefix="heri:event-registration:ip",
    max_body_bytes=16 * 1024,
)
async def register_event(event_id: str, payload: EventRegistration, request: Request, db: AsyncSession = Depends(get_db)):
    if await db.get(Event, event_id) is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return await _save_submission("event_registration", payload, db, request, event_id=event_id)
