from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status
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


class EventRegistration(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    email: EmailStr
    organisation: str | None = None
    country: str | None = None
    accessibility_requirements: str | None = None
    consent: bool


async def _save_submission(kind: str, payload: object, db: AsyncSession, request: Request) -> dict[str, str]:
    data = payload.model_dump(mode="json")
    if not data.pop("consent", False):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Consent is required")
    name = data.get("name") or data.get("contact_person") or data.get("email", "subscriber")
    db.add(
        Submission(
            kind=kind,
            name=name,
            email=data["email"],
            organisation=data.get("organisation"),
            country=data.get("country"),
            message=data.get("message") or data.get("proposed_collaboration") or "",
            payload={**data, "source_ip": request.client.host if request.client else None},
        )
    )
    return {"status": "received", "message": "Thank you. The HERI Africa team will respond soon."}


@router.post("/contact", status_code=status.HTTP_202_ACCEPTED)
async def contact(payload: ContactSubmission, request: Request, db: AsyncSession = Depends(get_db)):
    return await _save_submission("contact", payload, db, request)


@router.post("/partnership-applications", status_code=status.HTTP_202_ACCEPTED)
async def partnership(payload: PartnershipSubmission, request: Request, db: AsyncSession = Depends(get_db)):
    return await _save_submission("partnership", payload, db, request)


@router.post("/network-applications", status_code=status.HTTP_202_ACCEPTED)
async def network(payload: NetworkSubmission, request: Request, db: AsyncSession = Depends(get_db)):
    return await _save_submission("network", payload, db, request)


@router.post("/newsletter/subscribe", status_code=status.HTTP_202_ACCEPTED)
async def newsletter(payload: NewsletterSubmission, request: Request, db: AsyncSession = Depends(get_db)):
    return await _save_submission("newsletter", payload, db, request)


@router.post("/events/{event_id}/register", status_code=status.HTTP_202_ACCEPTED)
async def register_event(event_id: str, payload: EventRegistration, request: Request, db: AsyncSession = Depends(get_db)):
    if await db.get(Event, event_id) is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return await _save_submission("event_registration", payload, db, request)
