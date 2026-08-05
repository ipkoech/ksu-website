"""Rate-limited public school inquiry submission."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Header, Request, status
from fastapi.responses import JSONResponse
from ksu_common import rate_limit
from ksu_common.rate_limit import RateLimiter
from ksu_common.schemas.responses import error, success

from ....deps import DbSession
from ....schemas.contact_inquiry import PublicEntityInquiryCreate
from ....services.contact_inquiry import ContactInquiryService
from ....services.idempotency import acquire_json_command, complete_json_command
from ....services.public_inquiry_target import resolve_public_inquiry_target

router = APIRouter()
_INQUIRY_EMAIL_LIMITER = RateLimiter(requests=10, window=3600, prefix="main:public-inquiries:email")
IdempotencyKey = Annotated[str, Header(alias="Idempotency-Key", min_length=8, max_length=255)]


async def _enforce_email_limit(request: Request, data: PublicEntityInquiryCreate) -> None:
    email = str(data.sender_email).strip().lower()
    await _INQUIRY_EMAIL_LIMITER.check(email, f"{request.method}:{request.url.path}:email")


def _request_payload(data: PublicEntityInquiryCreate) -> dict[str, object]:
    return {
        "sender_name": data.sender_name,
        "sender_email": str(data.sender_email),
        "sender_phone": data.sender_phone,
        "subject": data.subject,
        "message": data.message,
        "category": data.category,
        "consent_to_contact": data.consent_to_contact,
        "website": data.website,
        "source_page_url": data.source_page_url,
    }


@router.post(
    "/schools/{school_slug}/inquiries",
    status_code=status.HTTP_201_CREATED,
)
@rate_limit(
    requests=5,
    window=300,
    prefix="main:school-inquiries:ip",
    max_body_bytes=32 * 1024,
)
async def create_public_school_inquiry(
    school_slug: str,
    request: Request,
    data: PublicEntityInquiryCreate,
    db: DbSession,
    idempotency_key: IdempotencyKey,
):
    target = await resolve_public_inquiry_target(db, "school", school_slug)
    claim = await acquire_json_command(
        db,
        command_name="public.school_inquiry.create",
        scope=f"public:school:{target.entity_id}",
        idempotency_key=idempotency_key.strip(),
        request_payload=_request_payload(data),
        in_progress_body=error(
            "An inquiry with this Idempotency-Key is still being processed",
            code="idempotency_in_progress",
        ),
        key_reuse_body=error(
            "This Idempotency-Key was already used for a different inquiry payload",
            code="idempotency_key_reused",
        ),
    )
    if isinstance(claim, JSONResponse):
        return claim
    await _enforce_email_limit(request, data)
    item = await ContactInquiryService.create_public(
        db,
        target=target,
        data=data,
        source_ip=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent"),
    )
    return complete_json_command(
        claim.record,
        status_code=status.HTTP_201_CREATED,
        response_body=success(
            data={
                "id": item.id,
                "reference_number": item.reference_number,
                "status": item.status,
                "target_entity_name": target.name,
            },
            message="Inquiry received",
        ),
    )


@router.post("/entities/{entity_type}/{entity_slug}/inquiries", status_code=status.HTTP_201_CREATED)
@rate_limit(
    requests=5,
    window=300,
    prefix="main:entity-inquiries:ip",
    max_body_bytes=32 * 1024,
)
async def create_public_entity_inquiry(
    entity_type: str,
    entity_slug: str,
    request: Request,
    data: PublicEntityInquiryCreate,
    db: DbSession,
    idempotency_key: IdempotencyKey,
):
    target = await resolve_public_inquiry_target(db, entity_type, entity_slug)
    claim = await acquire_json_command(
        db,
        command_name="public.entity_inquiry.create",
        scope=f"public:{target.entity_type}:{target.entity_id}",
        idempotency_key=idempotency_key.strip(),
        request_payload=_request_payload(data),
        in_progress_body=error(
            "An inquiry with this Idempotency-Key is still being processed",
            code="idempotency_in_progress",
        ),
        key_reuse_body=error(
            "This Idempotency-Key was already used for a different inquiry payload",
            code="idempotency_key_reused",
        ),
    )
    if isinstance(claim, JSONResponse):
        return claim
    await _enforce_email_limit(request, data)
    item = await ContactInquiryService.create_public(
        db,
        target=target,
        data=data,
        source_ip=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent"),
    )
    return complete_json_command(
        claim.record,
        status_code=status.HTTP_201_CREATED,
        response_body=success(
            data={
                "id": item.id,
                "reference_number": item.reference_number,
                "status": item.status,
                "target_entity_name": target.name,
            },
            message="Inquiry received",
        ),
    )
