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

router = APIRouter(tags=["HERI Submissions"])


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
