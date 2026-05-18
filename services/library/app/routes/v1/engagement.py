"""Routes for LibraryInquiry, SupportTicket, and LibraryRegulation."""

from __future__ import annotations

import uuid
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from ksu_common.auth import TokenPayload, get_current_user, get_optional_user
from ksu_common.rbac import requires_scope
from ksu_common.schemas.responses import success
from ksu_common.cache import cached_public, cache_response
from ksu_common.audit import audit_action
from ksu_common.rate_limit import rate_limit

from ...core.database import get_db
from ...schemas import (
    LibraryInquiryCreate,
    LibraryInquiryOut,
    LibraryInquiryReply,
    LibraryInquiryUpdate,
    LibraryRegulationCreate,
    LibraryRegulationOut,
    LibraryRegulationUpdate,
    SupportTicketCreate,
    SupportTicketOut,
    SupportTicketUpdate,
)
from ...services import engagement as svc

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
    return success(data=LibraryInquiryOut.model_validate(inquiry).model_dump())


@inquiries_router.post("/")
@rate_limit(requests=5, window=60, by_user=False)
@audit_action("inquiry.submit", target_type="LibraryInquiry", include_body=True)
async def submit_inquiry(
    request: Request,
    data: LibraryInquiryCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[Optional[TokenPayload], Depends(get_optional_user)],
):
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
@rate_limit(requests=5, window=60, by_user=False)
@audit_action("ticket.create", target_type="SupportTicket", include_body=True)
async def create_ticket(
    request: Request,
    data: SupportTicketCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[Optional[TokenPayload], Depends(get_optional_user)],
):
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


@regulations_router.get("/")
@cached_public(
    timeout=3600,
    vary_on=("library_id", "category", "status", "page", "per_page", "include_total"),
)
async def list_regulations(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    library_id: Optional[uuid.UUID] = Query(None),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    include_total: bool = Query(True),
):
    result = await svc.list_regulations(
        db,
        library_id=library_id,
        category=category,
        status=status,
        page=page,
        per_page=per_page,
        include_total=include_total,
    )
    return success(
        data=[
            LibraryRegulationOut.model_validate(r).model_dump() for r in result.items
        ],
        meta=result.meta,
    )


@regulations_router.get("/{regulation_id}")
@cached_public(timeout=3600, vary_on=())
async def get_regulation(
    request: Request,
    regulation_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    regulation = await svc.get_regulation(db, regulation_id)
    return success(data=LibraryRegulationOut.model_validate(regulation).model_dump())


@regulations_router.post("/")
@audit_action("regulation.create", target_type="LibraryRegulation", include_body=True)
async def create_regulation(
    request: Request,
    data: LibraryRegulationCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    regulation = await svc.create_regulation(db, data)
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
    regulation = await svc.update_regulation(db, regulation_id, data)
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
    await svc.delete_regulation(db, regulation_id)


# ── Aggregate router ──────────────────────────────────────────────────────────

router = APIRouter()
router.include_router(inquiries_router)
router.include_router(tickets_router)
router.include_router(regulations_router)
