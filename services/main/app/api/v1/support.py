"""Support ticket endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession, require_scope
from ...models import SupportTicket
from ...schemas import SupportTicketCreate, SupportTicketUpdate
from ...services import SupportTicketService

router = APIRouter()


@router.get("/tickets")
async def list_tickets(
    db: DbSession,
    user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    scope_type: str | None = None,
    scope_id: uuid.UUID | None = None,
    status: str | None = None,
    mine: bool = True,
    fields: FieldSelection = FieldsDep,
):
    requester_user_id = user.id if mine else None
    selector = build_selector(SupportTicket, fields)
    result = await SupportTicketService.list(
        db,
        page=page,
        per_page=per_page,
        requester_user_id=requester_user_id,
        scope_type=scope_type,
        scope_id=scope_id,
        status=status,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/tickets/{ticket_id}")
async def get_ticket(ticket_id: uuid.UUID, db: DbSession, user: CurrentUser, fields: FieldSelection = FieldsDep):
    selector = build_selector(SupportTicket, fields)
    ticket = await SupportTicketService.get_by_id(db, ticket_id, load_options=selector.load_options)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Support ticket not found")
    if ticket.requester_user_id not in {None, user.id} and not user.has_role("admin"):
        raise HTTPException(status_code=403, detail="Insufficient privileges")
    return success(data=selector.apply(ticket))


@router.post("/tickets", status_code=status.HTTP_201_CREATED)
async def create_ticket(data: SupportTicketCreate, db: DbSession, user: CurrentUser):
    payload = data.model_dump()
    payload["requester_user_id"] = user.id
    payload.setdefault("requester_email", user.email)
    payload.setdefault("requester_name", user.full_name)
    ticket = await SupportTicketService.create(db, **payload)
    return success(data=ticket, message="Support ticket created")


@router.patch("/tickets/{ticket_id}", dependencies=[Depends(require_scope("admin:*"))])
async def update_ticket(ticket_id: uuid.UUID, data: SupportTicketUpdate, db: DbSession, _: CurrentUser):
    ticket = await SupportTicketService.get_by_id(db, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Support ticket not found")
    ticket = await SupportTicketService.update(db, ticket, **data.model_dump(exclude_unset=True))
    return success(data=ticket, message="Support ticket updated")
