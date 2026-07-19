"""Central administration for non-school public inquiry conversations."""

from __future__ import annotations

import uuid
from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from ksu_common.schemas.responses import success

from ....deps import CurrentUser, DbSession, require_scope
from ....schemas.contact_inquiry import (
    InquiryAssign,
    InquiryNoteCreate,
    InquiryReplyCreate,
    InquiryStatusUpdate,
)
from ....services.contact_inquiry import (
    ContactInquiryService,
    InquiryActionContext,
)

router = APIRouter(dependencies=[Depends(require_scope("admin:*"))])

Page = Annotated[int, Query(ge=1)]
PerPage = Annotated[int, Query(ge=1, le=100)]


def _context(user, inquiry) -> InquiryActionContext:
    return InquiryActionContext(
        user=user,
        scope_type=inquiry.owner_scope_type,
        scope_id=inquiry.owner_scope_id,
    )


@router.get("")
async def list_inquiries(
    db: DbSession,
    _: CurrentUser,
    page: Page = 1,
    per_page: PerPage = 20,
    status_filter: Annotated[str | None, Query(alias="status")] = None,
    category: str | None = None,
    priority: str | None = None,
    assigned_to_user_id: uuid.UUID | None = None,
    target_entity_type: str | None = None,
    owner_scope_type: str | None = None,
    owner_scope_id: uuid.UUID | None = None,
    include_school_owned: bool = False,
    search: Annotated[str | None, Query(max_length=255)] = None,
    created_from: date | None = None,
    created_to: date | None = None,
):
    result = await ContactInquiryService.list_for_admin(
        db,
        page=page,
        per_page=per_page,
        status=status_filter,
        category=category,
        priority=priority,
        assigned_to_user_id=assigned_to_user_id,
        target_entity_type=target_entity_type,
        owner_scope_type=owner_scope_type,
        owner_scope_id=owner_scope_id,
        include_school_owned=include_school_owned,
        search=search,
        created_from=created_from,
        created_to=created_to,
    )
    return success(data=result.items, meta=result.meta)


@router.get("/{inquiry_id}")
async def get_inquiry(
    inquiry_id: uuid.UUID,
    db: DbSession,
    _: CurrentUser,
    include_school_owned: bool = False,
):
    return success(
        data=await ContactInquiryService.get_for_admin(
            db,
            inquiry_id,
            include_school_owned=include_school_owned,
        )
    )


@router.patch("/{inquiry_id}/assign")
async def assign_inquiry(
    inquiry_id: uuid.UUID,
    data: InquiryAssign,
    db: DbSession,
    user: CurrentUser,
):
    inquiry = await ContactInquiryService.get_for_admin(db, inquiry_id)
    return success(
        data=await ContactInquiryService.assign(
            db,
            inquiry,
            _context(user, inquiry),
            data.assigned_to_user_id,
        )
    )


@router.patch("/{inquiry_id}/status")
async def update_inquiry_status(
    inquiry_id: uuid.UUID,
    data: InquiryStatusUpdate,
    db: DbSession,
    _: CurrentUser,
):
    inquiry = await ContactInquiryService.get_for_admin(db, inquiry_id)
    return success(
        data=await ContactInquiryService.update_status(db, inquiry, data.status)
    )


@router.post("/{inquiry_id}/notes")
async def add_inquiry_note(
    inquiry_id: uuid.UUID,
    data: InquiryNoteCreate,
    db: DbSession,
    user: CurrentUser,
):
    inquiry = await ContactInquiryService.get_for_admin(db, inquiry_id)
    return success(
        data=await ContactInquiryService.add_note(
            db,
            inquiry,
            _context(user, inquiry),
            data.body,
        )
    )


@router.post("/{inquiry_id}/replies")
async def reply_to_inquiry(
    inquiry_id: uuid.UUID,
    data: InquiryReplyCreate,
    db: DbSession,
    user: CurrentUser,
):
    inquiry = await ContactInquiryService.get_for_admin(db, inquiry_id)
    return success(
        data=await ContactInquiryService.reply(
            db,
            inquiry,
            _context(user, inquiry),
            data,
        )
    )


@router.post("/{inquiry_id}/messages/{message_id}/retry")
async def retry_inquiry_reply(
    inquiry_id: uuid.UUID,
    message_id: uuid.UUID,
    db: DbSession,
    _: CurrentUser,
):
    inquiry = await ContactInquiryService.get_for_admin(db, inquiry_id)
    return success(
        data=await ContactInquiryService.retry_delivery(db, inquiry, message_id)
    )
