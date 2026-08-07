"""Routes for LibraryInquiry, SupportTicket, and LibraryRegulation."""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ksu_common.auth import TokenPayload
from ksu_common.rbac import has_scope
from ksu_common.schemas.responses import success
from ksu_common.cache import cache_response, invalidate_prefix
from ksu_common.audit import audit_action
from ksu_common.field_selection import FieldSelection, FieldsQuery, FieldSelector
from ksu_common.rate_limit import rate_limit
from ksu_common.rate_limit import RateLimiter

from ...core.auth import get_optional_user, require_library_scope, requires_scope
from ...core.database import get_db
from ...models import (
    LibraryGuide,
    LibraryPolicyPage,
    LibraryRegulation,
    LibrarySpecialist,
    LibraryWorkflow,
    LibraryInquiry,
    SupportTicket,
)
from ...schemas import (
    LibraryGuideCreate,
    LibraryGuideOut,
    LibraryGuideUpdate,
    LibraryInquiryCreate,
    LibraryInquiryOut,
    LibraryInquiryReply,
    LibraryInquiryUpdate,
    LibraryPolicyPageCreate,
    LibraryPolicyPageOut,
    LibraryPolicyPageUpdate,
    LibraryRegulationCreate,
    LibraryRegulationOut,
    LibraryRegulationUpdate,
    LibrarySpecialistCreate,
    LibrarySpecialistOut,
    LibrarySpecialistUpdate,
    LibraryWorkflowCreate,
    LibraryWorkflowOut,
    LibraryWorkflowUpdate,
    SupportTicketCreate,
    SupportTicketOut,
    SupportTicketUpdate,
)
from ...services import engagement as svc

_LIBRARY_INQUIRY_EMAIL_LIMITER = RateLimiter(
    requests=10, window=3600, prefix="library:inquiries:email"
)
_LIBRARY_TICKET_EMAIL_LIMITER = RateLimiter(
    requests=10, window=3600, prefix="library:tickets:email"
)


async def _find_duplicate_inquiry(db: AsyncSession, data: LibraryInquiryCreate):
    result = await db.execute(
        select(LibraryInquiry)
        .where(
            LibraryInquiry.sender_email == str(data.sender_email).strip().lower(),
            LibraryInquiry.subject == data.subject,
            LibraryInquiry.message == data.message,
            LibraryInquiry.created_at >= datetime.now(timezone.utc) - timedelta(hours=24),
        )
        .order_by(LibraryInquiry.created_at.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()


async def _find_duplicate_ticket(db: AsyncSession, data: SupportTicketCreate):
    filters = [
        SupportTicket.subject == data.subject,
        SupportTicket.description == data.description,
        SupportTicket.created_at >= datetime.now(timezone.utc) - timedelta(hours=24),
    ]
    if data.requester_email:
        filters.append(SupportTicket.requester_email == str(data.requester_email).strip().lower())
    result = await db.execute(select(SupportTicket).where(*filters).order_by(SupportTicket.created_at.desc()).limit(1))
    return result.scalar_one_or_none()

# ── Library Inquiries (Ask Librarian) ─────────────────────────────────────────

inquiries_router = APIRouter(prefix="/library/inquiries", tags=["Library Inquiries"])


@inquiries_router.get("/")
@cache_response(
    timeout=60, vary_on=("library_id", "status", "page", "per_page", "include_total")
)
async def list_inquiries(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:read"))],
    library_id: Optional[uuid.UUID] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    include_total: bool = Query(True),
):
    require_library_scope(user, "library:read", library_id)
    result = await svc.list_inquiries(
        db,
        library_id=library_id,
        status=status,
        page=page,
        per_page=per_page,
        include_total=include_total,
    )
    return success(
        data=[LibraryInquiryOut.model_validate(i).model_dump() for i in result.items],
        meta=result.meta,
    )


@inquiries_router.get("/{inquiry_id}")
@cache_response(timeout=30, vary_on=())
async def get_inquiry(
    request: Request,
    inquiry_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:read"))],
):
    inquiry = await svc.get_inquiry(db, inquiry_id)
    require_library_scope(user, "library:read", inquiry.library_id)
    return success(data=LibraryInquiryOut.model_validate(inquiry).model_dump())


@inquiries_router.post("/")
@rate_limit(
    requests=5,
    window=300,
    by_user=False,
    prefix="library:inquiries:ip",
    max_body_bytes=32 * 1024,
)
@audit_action("inquiry.submit", target_type="LibraryInquiry", include_body=True)
async def submit_inquiry(
    request: Request,
    data: LibraryInquiryCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[Optional[TokenPayload], Depends(get_optional_user)],
):
    await _LIBRARY_INQUIRY_EMAIL_LIMITER.check(
        str(data.sender_email).strip().lower(),
        f"{request.method}:{request.url.path}:email",
    )
    duplicate = await _find_duplicate_inquiry(db, data)
    if duplicate is not None:
        return success(
            data=LibraryInquiryOut.model_validate(duplicate).model_dump(),
            message="Inquiry already submitted",
        )
    person_id = uuid.UUID(user.sub) if user else None
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    inquiry = await svc.submit_inquiry(
        db,
        data,
        person_id=person_id,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    return success(
        data=LibraryInquiryOut.model_validate(inquiry).model_dump(),
        message="Inquiry submitted",
    )


@inquiries_router.post("/{inquiry_id}/reply")
@audit_action(
    "inquiry.reply", target_type="LibraryInquiry", target_id_param="inquiry_id"
)
async def reply_to_inquiry(
    request: Request,
    inquiry_id: uuid.UUID,
    data: LibraryInquiryReply,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    existing = await svc.get_inquiry(db, inquiry_id)
    require_library_scope(user, "library:write", existing.library_id)
    inquiry = await svc.reply_to_inquiry(
        db,
        inquiry_id,
        data,
        replied_by_person_id=uuid.UUID(user.sub),
    )
    return success(data=LibraryInquiryOut.model_validate(inquiry).model_dump())


@inquiries_router.patch("/{inquiry_id}")
@audit_action(
    "inquiry.update", target_type="LibraryInquiry", target_id_param="inquiry_id"
)
async def update_inquiry(
    request: Request,
    inquiry_id: uuid.UUID,
    data: LibraryInquiryUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    existing = await svc.get_inquiry(db, inquiry_id)
    require_library_scope(user, "library:write", existing.library_id)
    inquiry = await svc.update_inquiry_status(db, inquiry_id, data)
    return success(data=LibraryInquiryOut.model_validate(inquiry).model_dump())


@inquiries_router.delete("/{inquiry_id}", status_code=204)
@audit_action(
    "inquiry.delete", target_type="LibraryInquiry", target_id_param="inquiry_id"
)
async def delete_inquiry(
    request: Request,
    inquiry_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:admin"))],
):
    existing = await svc.get_inquiry(db, inquiry_id)
    require_library_scope(user, "library:admin", existing.library_id)
    await svc.delete_inquiry(db, inquiry_id)


# ── Support Tickets ───────────────────────────────────────────────────────────

tickets_router = APIRouter(prefix="/library/tickets", tags=["Library Support Tickets"])


@tickets_router.get("/")
@cache_response(
    timeout=60,
    vary_on=("status", "category", "assigned_to", "page", "per_page", "include_total"),
)
async def list_tickets(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:read"))],
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    assigned_to: Optional[uuid.UUID] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    include_total: bool = Query(True),
):
    result = await svc.list_tickets(
        db,
        status=status,
        category=category,
        assigned_to=assigned_to,
        page=page,
        per_page=per_page,
        include_total=include_total,
    )
    return success(
        data=[SupportTicketOut.model_validate(t).model_dump() for t in result.items],
        meta=result.meta,
    )


@tickets_router.get("/{ticket_id}")
@cache_response(timeout=30, vary_on=())
async def get_ticket(
    request: Request,
    ticket_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:read"))],
):
    ticket = await svc.get_ticket(db, ticket_id)
    return success(data=SupportTicketOut.model_validate(ticket).model_dump())


@tickets_router.post("/")
@rate_limit(
    requests=5,
    window=300,
    by_user=False,
    prefix="library:tickets:ip",
    max_body_bytes=32 * 1024,
)
@audit_action("ticket.create", target_type="SupportTicket", include_body=True)
async def create_ticket(
    request: Request,
    data: SupportTicketCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[Optional[TokenPayload], Depends(get_optional_user)],
):
    if data.requester_email:
        await _LIBRARY_TICKET_EMAIL_LIMITER.check(
            str(data.requester_email).strip().lower(),
            f"{request.method}:{request.url.path}:email",
        )
    duplicate = await _find_duplicate_ticket(db, data)
    if duplicate is not None:
        return success(
            data=SupportTicketOut.model_validate(duplicate).model_dump(),
            message="Support ticket already submitted",
        )
    person_id = uuid.UUID(user.sub) if user else None
    ticket = await svc.create_ticket(db, data, person_id=person_id)
    return success(
        data=SupportTicketOut.model_validate(ticket).model_dump(),
        message="Ticket created",
    )


@tickets_router.patch("/{ticket_id}")
@audit_action("ticket.update", target_type="SupportTicket", target_id_param="ticket_id")
async def update_ticket(
    request: Request,
    ticket_id: uuid.UUID,
    data: SupportTicketUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    ticket = await svc.update_ticket(db, ticket_id, data)
    return success(data=SupportTicketOut.model_validate(ticket).model_dump())


@tickets_router.delete("/{ticket_id}", status_code=204)
@audit_action("ticket.delete", target_type="SupportTicket", target_id_param="ticket_id")
async def delete_ticket(
    request: Request,
    ticket_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:admin"))],
):
    await svc.delete_ticket(db, ticket_id)


# ── Library Regulations ───────────────────────────────────────────────────────

regulations_router = APIRouter(
    prefix="/library/regulations", tags=["Library Regulations"]
)


async def invalidate_public_library_cache() -> None:
    await invalidate_prefix("public")


@regulations_router.get("/")
async def list_regulations(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[Optional[TokenPayload], Depends(get_optional_user)],
    fields: Annotated[FieldSelection, Depends(FieldsQuery(always_include={"id"}))],
    library_id: Optional[uuid.UUID] = Query(None),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    include_total: bool = Query(True),
):
    is_writer = user is not None and has_scope(user.roles, "library:write")
    if is_writer:
        require_library_scope(user, "library:read", library_id)
    result = await svc.list_regulations(
        db,
        library_id=library_id,
        category=category,
        status=status,
        page=page,
        per_page=per_page,
        include_total=include_total,
        public_only=not is_writer,
    )
    selector = FieldSelector(LibraryRegulation, fields, always_include={"id"})
    data = [
        LibraryRegulationOut.model_validate(r).model_dump(mode="json")
        for r in result.items
    ]
    return success(
        data=selector.apply(data),
        meta=result.meta,
    )


@regulations_router.get("/{regulation_id}")
async def get_regulation(
    request: Request,
    regulation_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[Optional[TokenPayload], Depends(get_optional_user)],
    fields: Annotated[FieldSelection, Depends(FieldsQuery(always_include={"id"}))],
):
    is_writer = user is not None and has_scope(user.roles, "library:write")
    regulation = (
        await svc.get_regulation(db, regulation_id)
        if is_writer
        else await svc.get_public_regulation(db, regulation_id)
    )
    if is_writer:
        require_library_scope(user, "library:read", regulation.library_id)
    selector = FieldSelector(LibraryRegulation, fields, always_include={"id"})
    data = LibraryRegulationOut.model_validate(regulation).model_dump(mode="json")
    return success(data=selector.apply(data))


@regulations_router.post("/")
@audit_action("regulation.create", target_type="LibraryRegulation", include_body=True)
async def create_regulation(
    request: Request,
    data: LibraryRegulationCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    require_library_scope(user, "library:write", data.library_id)
    regulation = await svc.create_regulation(db, data)
    await invalidate_public_library_cache()
    return success(
        data=LibraryRegulationOut.model_validate(regulation).model_dump(),
        message="Regulation created",
    )


@regulations_router.patch("/{regulation_id}")
@audit_action(
    "regulation.update",
    target_type="LibraryRegulation",
    target_id_param="regulation_id",
)
async def update_regulation(
    request: Request,
    regulation_id: uuid.UUID,
    data: LibraryRegulationUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    existing = await svc.get_regulation(db, regulation_id)
    require_library_scope(user, "library:write", existing.library_id)
    if "library_id" in data.model_fields_set:
        require_library_scope(user, "library:write", data.library_id)
    regulation = await svc.update_regulation(db, regulation_id, data)
    await invalidate_public_library_cache()
    return success(data=LibraryRegulationOut.model_validate(regulation).model_dump())


@regulations_router.delete("/{regulation_id}", status_code=204)
@audit_action(
    "regulation.delete",
    target_type="LibraryRegulation",
    target_id_param="regulation_id",
)
async def delete_regulation(
    request: Request,
    regulation_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:admin"))],
):
    existing = await svc.get_regulation(db, regulation_id)
    require_library_scope(user, "library:admin", existing.library_id)
    await svc.delete_regulation(db, regulation_id)
    await invalidate_public_library_cache()


# ── Library Specialists ───────────────────────────────────────────────────────

specialists_router = APIRouter(
    prefix="/library/specialists", tags=["Library Specialists"]
)


@specialists_router.get("/")
async def list_specialists(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[Optional[TokenPayload], Depends(get_optional_user)],
    fields: Annotated[FieldSelection, Depends(FieldsQuery(always_include={"id"}))],
    library_id: Optional[uuid.UUID] = Query(None),
    subject: Optional[str] = Query(None),
    school: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    include_total: bool = Query(True),
):
    is_writer = user is not None and has_scope(user.roles, "library:write")
    if is_writer:
        require_library_scope(user, "library:read", library_id)
    result = await svc.list_specialists(
        db,
        library_id=library_id,
        subject=subject,
        school=school,
        department=department,
        page=page,
        per_page=per_page,
        include_total=include_total,
        public_only=not is_writer,
    )
    selector = FieldSelector(LibrarySpecialist, fields, always_include={"id"})
    data = [item.model_dump(mode="json") for item in result.items]
    return success(data=selector.apply(data), meta=result.meta)


@specialists_router.post("/")
@audit_action("specialist.create", target_type="LibrarySpecialist", include_body=True)
async def create_specialist(
    request: Request,
    data: LibrarySpecialistCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    require_library_scope(user, "library:write", data.library_id)
    specialist = await svc.create_specialist(db, data)
    await invalidate_public_library_cache()
    return success(
        data=LibrarySpecialistOut.model_validate(specialist).model_dump(),
        message="Specialist created",
    )


@specialists_router.patch("/{specialist_id}")
@audit_action(
    "specialist.update",
    target_type="LibrarySpecialist",
    target_id_param="specialist_id",
)
async def update_specialist(
    request: Request,
    specialist_id: uuid.UUID,
    data: LibrarySpecialistUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    existing = await svc.get_specialist(db, specialist_id)
    require_library_scope(user, "library:write", existing.library_id)
    if "library_id" in data.model_fields_set:
        require_library_scope(user, "library:write", data.library_id)
    specialist = await svc.update_specialist(db, specialist_id, data)
    await invalidate_public_library_cache()
    return success(data=LibrarySpecialistOut.model_validate(specialist).model_dump())


@specialists_router.delete("/{specialist_id}", status_code=204)
@audit_action(
    "specialist.delete",
    target_type="LibrarySpecialist",
    target_id_param="specialist_id",
)
async def delete_specialist(
    request: Request,
    specialist_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:admin"))],
):
    existing = await svc.get_specialist(db, specialist_id)
    require_library_scope(user, "library:admin", existing.library_id)
    await svc.delete_specialist(db, specialist_id)
    await invalidate_public_library_cache()


# ── Library Guides ────────────────────────────────────────────────────────────

guides_router = APIRouter(prefix="/library/guides", tags=["Library Guides"])


@guides_router.get("/")
async def list_guides(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[Optional[TokenPayload], Depends(get_optional_user)],
    fields: Annotated[FieldSelection, Depends(FieldsQuery(always_include={"id"}))],
    library_id: Optional[uuid.UUID] = Query(None),
    guide_type: Optional[str] = Query(None),
    subject: Optional[str] = Query(None),
    course_code: Optional[str] = Query(None),
    audience: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    include_total: bool = Query(True),
):
    is_writer = user is not None and has_scope(user.roles, "library:write")
    if is_writer:
        require_library_scope(user, "library:read", library_id)
    result = await svc.list_guides(
        db,
        library_id=library_id,
        guide_type=guide_type,
        subject=subject,
        course_code=course_code,
        audience=audience,
        page=page,
        per_page=per_page,
        include_total=include_total,
        public_only=not is_writer,
    )
    selector = FieldSelector(LibraryGuide, fields, always_include={"id"})
    data = [item.model_dump(mode="json") for item in result.items]
    return success(data=selector.apply(data), meta=result.meta)


@guides_router.get("/slug/{slug}")
async def get_guide_by_slug(
    request: Request,
    slug: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[Optional[TokenPayload], Depends(get_optional_user)],
    fields: Annotated[FieldSelection, Depends(FieldsQuery(always_include={"id"}))],
):
    is_writer = user is not None and has_scope(user.roles, "library:write")
    guide = await svc.get_guide_by_slug(db, slug, public_only=not is_writer)
    if is_writer:
        require_library_scope(user, "library:read", guide.library_id)
    selector = FieldSelector(LibraryGuide, fields, always_include={"id"})
    return success(data=selector.apply(svc._guide_out(guide).model_dump(mode="json")))


@guides_router.post("/")
@audit_action("guide.create", target_type="LibraryGuide", include_body=True)
async def create_guide(
    request: Request,
    data: LibraryGuideCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    require_library_scope(user, "library:write", data.library_id)
    guide = await svc.create_guide(db, data)
    await invalidate_public_library_cache()
    return success(
        data=LibraryGuideOut.model_validate(guide).model_dump(),
        message="Guide created",
    )


@guides_router.patch("/{guide_id}")
@audit_action("guide.update", target_type="LibraryGuide", target_id_param="guide_id")
async def update_guide(
    request: Request,
    guide_id: uuid.UUID,
    data: LibraryGuideUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    existing = await svc.get_guide(db, guide_id)
    require_library_scope(user, "library:write", existing.library_id)
    if "library_id" in data.model_fields_set:
        require_library_scope(user, "library:write", data.library_id)
    guide = await svc.update_guide(db, guide_id, data)
    await invalidate_public_library_cache()
    return success(data=LibraryGuideOut.model_validate(guide).model_dump())


@guides_router.delete("/{guide_id}", status_code=204)
@audit_action("guide.delete", target_type="LibraryGuide", target_id_param="guide_id")
async def delete_guide(
    request: Request,
    guide_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:admin"))],
):
    existing = await svc.get_guide(db, guide_id)
    require_library_scope(user, "library:admin", existing.library_id)
    await svc.delete_guide(db, guide_id)
    await invalidate_public_library_cache()


# ── Library Workflows ─────────────────────────────────────────────────────────

workflows_router = APIRouter(prefix="/library/workflows", tags=["Library Workflows"])


@workflows_router.get("/")
async def list_workflows(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[Optional[TokenPayload], Depends(get_optional_user)],
    fields: Annotated[FieldSelection, Depends(FieldsQuery(always_include={"id"}))],
    library_id: Optional[uuid.UUID] = Query(None),
    workflow_type: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    include_total: bool = Query(True),
):
    is_writer = user is not None and has_scope(user.roles, "library:write")
    if is_writer:
        require_library_scope(user, "library:read", library_id)
    result = await svc.list_workflows(
        db,
        library_id=library_id,
        workflow_type=workflow_type,
        page=page,
        per_page=per_page,
        include_total=include_total,
        public_only=not is_writer,
    )
    selector = FieldSelector(LibraryWorkflow, fields, always_include={"id"})
    data = [item.model_dump(mode="json") for item in result.items]
    return success(data=selector.apply(data), meta=result.meta)


@workflows_router.get("/slug/{slug}")
async def get_workflow_by_slug(
    request: Request,
    slug: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[Optional[TokenPayload], Depends(get_optional_user)],
    fields: Annotated[FieldSelection, Depends(FieldsQuery(always_include={"id"}))],
):
    is_writer = user is not None and has_scope(user.roles, "library:write")
    workflow = await svc.get_workflow_by_slug(db, slug, public_only=not is_writer)
    if is_writer:
        require_library_scope(user, "library:read", workflow.library_id)
    selector = FieldSelector(LibraryWorkflow, fields, always_include={"id"})
    return success(data=selector.apply(svc._workflow_out(workflow).model_dump(mode="json")))


@workflows_router.post("/")
@audit_action("workflow.create", target_type="LibraryWorkflow", include_body=True)
async def create_workflow(
    request: Request,
    data: LibraryWorkflowCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    require_library_scope(user, "library:write", data.library_id)
    workflow = await svc.create_workflow(db, data)
    await invalidate_public_library_cache()
    return success(
        data=LibraryWorkflowOut.model_validate(workflow).model_dump(),
        message="Workflow created",
    )


@workflows_router.patch("/{workflow_id}")
@audit_action(
    "workflow.update", target_type="LibraryWorkflow", target_id_param="workflow_id"
)
async def update_workflow(
    request: Request,
    workflow_id: uuid.UUID,
    data: LibraryWorkflowUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    existing = await svc.get_workflow(db, workflow_id)
    require_library_scope(user, "library:write", existing.library_id)
    if "library_id" in data.model_fields_set:
        require_library_scope(user, "library:write", data.library_id)
    workflow = await svc.update_workflow(db, workflow_id, data)
    await invalidate_public_library_cache()
    return success(data=LibraryWorkflowOut.model_validate(workflow).model_dump())


@workflows_router.delete("/{workflow_id}", status_code=204)
@audit_action(
    "workflow.delete", target_type="LibraryWorkflow", target_id_param="workflow_id"
)
async def delete_workflow(
    request: Request,
    workflow_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:admin"))],
):
    existing = await svc.get_workflow(db, workflow_id)
    require_library_scope(user, "library:admin", existing.library_id)
    await svc.delete_workflow(db, workflow_id)
    await invalidate_public_library_cache()


# ── Library Policies ──────────────────────────────────────────────────────────

policies_router = APIRouter(prefix="/library/policies", tags=["Library Policies"])


@policies_router.get("/")
async def list_policies(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[Optional[TokenPayload], Depends(get_optional_user)],
    fields: Annotated[FieldSelection, Depends(FieldsQuery(always_include={"id"}))],
    library_id: Optional[uuid.UUID] = Query(None),
    policy_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    include_total: bool = Query(True),
):
    is_writer = user is not None and has_scope(user.roles, "library:write")
    if is_writer:
        require_library_scope(user, "library:read", library_id)
    result = await svc.list_policies(
        db,
        library_id=library_id,
        policy_type=policy_type,
        status=status,
        page=page,
        per_page=per_page,
        include_total=include_total,
        public_only=not is_writer,
    )
    selector = FieldSelector(LibraryPolicyPage, fields, always_include={"id"})
    data = [item.model_dump(mode="json") for item in result.items]
    return success(data=selector.apply(data), meta=result.meta)


@policies_router.get("/slug/{slug}")
async def get_policy_by_slug(
    request: Request,
    slug: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[Optional[TokenPayload], Depends(get_optional_user)],
    fields: Annotated[FieldSelection, Depends(FieldsQuery(always_include={"id"}))],
):
    is_writer = user is not None and has_scope(user.roles, "library:write")
    policy = await svc.get_policy_by_slug(db, slug, public_only=not is_writer)
    if is_writer:
        require_library_scope(user, "library:read", policy.library_id)
    selector = FieldSelector(LibraryPolicyPage, fields, always_include={"id"})
    data = LibraryPolicyPageOut.model_validate(policy).model_dump(mode="json")
    return success(data=selector.apply(data))


@policies_router.post("/")
@audit_action("policy.create", target_type="LibraryPolicyPage", include_body=True)
async def create_policy(
    request: Request,
    data: LibraryPolicyPageCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    require_library_scope(user, "library:write", data.library_id)
    policy = await svc.create_policy(db, data)
    await invalidate_public_library_cache()
    return success(
        data=LibraryPolicyPageOut.model_validate(policy).model_dump(),
        message="Policy created",
    )


@policies_router.patch("/{policy_id}")
@audit_action(
    "policy.update", target_type="LibraryPolicyPage", target_id_param="policy_id"
)
async def update_policy(
    request: Request,
    policy_id: uuid.UUID,
    data: LibraryPolicyPageUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    existing = await svc.get_policy(db, policy_id)
    require_library_scope(user, "library:write", existing.library_id)
    if "library_id" in data.model_fields_set:
        require_library_scope(user, "library:write", data.library_id)
    policy = await svc.update_policy(db, policy_id, data)
    await invalidate_public_library_cache()
    return success(data=LibraryPolicyPageOut.model_validate(policy).model_dump())


@policies_router.delete("/{policy_id}", status_code=204)
@audit_action(
    "policy.delete", target_type="LibraryPolicyPage", target_id_param="policy_id"
)
async def delete_policy(
    request: Request,
    policy_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:admin"))],
):
    existing = await svc.get_policy(db, policy_id)
    require_library_scope(user, "library:admin", existing.library_id)
    await svc.delete_policy(db, policy_id)
    await invalidate_public_library_cache()


# ── Aggregate router ──────────────────────────────────────────────────────────

router = APIRouter()
router.include_router(inquiries_router)
router.include_router(tickets_router)
router.include_router(regulations_router)
router.include_router(specialists_router)
router.include_router(guides_router)
router.include_router(workflows_router)
router.include_router(policies_router)
