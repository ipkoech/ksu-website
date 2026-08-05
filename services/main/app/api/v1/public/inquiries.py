"""Rate-limited public school inquiry submission."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Header, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from ksu_common import rate_limit
from ksu_common.schemas.responses import error, success

from ....deps import DbSession
from ....schemas.contact_inquiry import PublicEntityInquiryCreate
from ....services.contact_inquiry import ContactInquiryService
from ....services.idempotency import acquire_command, complete_command
from ....services.public_inquiry_target import resolve_public_inquiry_target

router = APIRouter()
IdempotencyKey = Annotated[str, Header(alias="Idempotency-Key", min_length=8, max_length=255)]


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
    idempotency_key: IdempotencyKey,
):
    target = await resolve_public_inquiry_target(db, "school", school_slug)
    claim = await acquire_command(
        db,
        command_name="public.school_inquiry.create",
        scope=f"public:school:{target.entity_id}",
        idempotency_key=idempotency_key.strip(),
        request_payload={
            "sender_name": data.sender_name,
            "sender_email": str(data.sender_email),
            "sender_phone": data.sender_phone,
            "subject": data.subject,
            "message": data.message,
            "category": data.category,
            "consent_to_contact": data.consent_to_contact,
            "website": data.website,
            "source_page_url": data.source_page_url,
        },
    )
    if claim.kind == "replay":
        return JSONResponse(status_code=claim.record.status_code, content=claim.record.response_body)
    if claim.kind == "in_progress":
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content=error(
                "An inquiry with this Idempotency-Key is still being processed",
                code="idempotency_in_progress",
            ),
            headers={"Retry-After": "1"},
        )
    item = await ContactInquiryService.create_public(
        db,
        target=target,
        data=data,
        source_ip=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent"),
    )
    body = jsonable_encoder(success(
        data={
            "id": item.id,
            "reference_number": item.reference_number,
            "status": item.status,
            "target_entity_name": target.name,
        },
        message="Inquiry received",
    ))
    complete_command(claim.record, status_code=status.HTTP_201_CREATED, response_body=body)
    return JSONResponse(status_code=status.HTTP_201_CREATED, content=body)


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
