"""Rate-limited public school inquiry submission."""

from __future__ import annotations

from fastapi import APIRouter, Request, status
from ksu_common import rate_limit
from ksu_common.schemas.responses import success

from ....deps import DbSession
from ....schemas.contact_inquiry import PublicEntityInquiryCreate
from ....services.contact_inquiry import ContactInquiryService
from ....services.public_inquiry_target import resolve_public_inquiry_target

router = APIRouter()


@router.post(
    "/schools/{school_slug}/inquiries",
    status_code=status.HTTP_201_CREATED,
)
@rate_limit(requests=5, window=300, prefix="main:school-inquiries")
async def create_public_school_inquiry(
    school_slug: str,
    request: Request,
    data: PublicEntityInquiryCreate,
    db: DbSession,
):
    target = await resolve_public_inquiry_target(db, "school", school_slug)
    item = await ContactInquiryService.create_public(
        db,
        target=target,
        data=data,
        source_ip=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent"),
    )
    return success(
        data={
            "id": item.id,
            "reference_number": item.reference_number,
            "status": item.status,
            "target_entity_name": target.name,
        },
        message="Inquiry received",
    )


@router.post("/entities/{entity_type}/{entity_slug}/inquiries", status_code=status.HTTP_201_CREATED)
@rate_limit(requests=5, window=300, prefix="main:entity-inquiries")
async def create_public_entity_inquiry(
    entity_type: str,
    entity_slug: str,
    request: Request,
    data: PublicEntityInquiryCreate,
    db: DbSession,
):
    target = await resolve_public_inquiry_target(db, entity_type, entity_slug)
    item = await ContactInquiryService.create_public(
        db,
        target=target,
        data=data,
        source_ip=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent"),
    )
    return success(
        data={
            "id": item.id,
            "reference_number": item.reference_number,
            "status": item.status,
            "target_entity_name": target.name,
        },
        message="Inquiry received",
    )
