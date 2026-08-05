"""School-scoped inquiry inbox and conversation actions."""

import uuid
from datetime import date, datetime, time, timedelta, timezone

from fastapi import APIRouter, HTTPException, Query
from ksu_common.schemas.responses import success

from ....deps import DbSession
from ....schemas.contact_inquiry import (
    InquiryAssign,
    InquiryNoteCreate,
    InquiryReplyCreate,
    InquiryStatusUpdate,
)
from ....services.contact_inquiry import ContactInquiryService
from ....services.school_portal_context import CurrentSchoolContext

router = APIRouter()


def _require(context, permission: str) -> None:
    if permission not in context.permissions:
        raise HTTPException(status_code=403, detail=f"{permission} permission is required")


@router.get("/inquiries")
async def list_inquiries(
    db: DbSession,
    context: CurrentSchoolContext,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status_filter: str | None = Query(None, alias="status"),
    category: str | None = None,
    priority: str | None = None,
    assigned_to_user_id: uuid.UUID | None = None,
    created_from: date | None = None,
    created_to: date | None = None,
):
    _require(context, "school.inquiries.view")
    result = await ContactInquiryService.list_for_school(
        db,
        context.school.id,
        page=page,
        per_page=per_page,
        status=status_filter,
        category=category,
        priority=priority,
        assigned_to_user_id=assigned_to_user_id,
    )
    items = result.items
    if created_from:
        start = datetime.combine(created_from, time.min, tzinfo=timezone.utc)
        items = [item for item in items if item.created_at >= start]
    if created_to:
        end = datetime.combine(created_to + timedelta(days=1), time.min, tzinfo=timezone.utc)
        items = [item for item in items if item.created_at < end]
    return success(data=items, meta={**result.meta, "returned": len(items)})


@router.get("/inquiries/{inquiry_id}")
async def get_inquiry(
    inquiry_id: uuid.UUID,
    db: DbSession,
    context: CurrentSchoolContext,
):
    _require(context, "school.inquiries.view")
    return success(
        data=await ContactInquiryService.get_for_school(
            db,
            inquiry_id,
            context.school.id,
        )
    )


@router.patch("/inquiries/{inquiry_id}/assign")
async def assign_inquiry(
    inquiry_id: uuid.UUID,
    data: InquiryAssign,
    db: DbSession,
    context: CurrentSchoolContext,
):
    _require(context, "school.inquiries.manage")
    inquiry = await ContactInquiryService.get_for_school(db, inquiry_id, context.school.id)
    return success(
        data=await ContactInquiryService.assign(
            db,
            inquiry,
            context,
            data.assigned_to_user_id,
        )
    )


@router.patch("/inquiries/{inquiry_id}/status")
async def update_inquiry_status(
    inquiry_id: uuid.UUID,
    data: InquiryStatusUpdate,
    db: DbSession,
    context: CurrentSchoolContext,
):
    _require(context, "school.inquiries.manage")
    inquiry = await ContactInquiryService.get_for_school(db, inquiry_id, context.school.id)
    return success(
        data=await ContactInquiryService.update_status(db, inquiry, data.status)
    )


@router.post("/inquiries/{inquiry_id}/notes")
async def add_inquiry_note(
    inquiry_id: uuid.UUID,
    data: InquiryNoteCreate,
    db: DbSession,
    context: CurrentSchoolContext,
):
    _require(context, "school.inquiries.manage")
    inquiry = await ContactInquiryService.get_for_school(db, inquiry_id, context.school.id)
    return success(
        data=await ContactInquiryService.add_note(db, inquiry, context, data.body)
    )


@router.post("/inquiries/{inquiry_id}/replies")
async def reply_to_inquiry(
    inquiry_id: uuid.UUID,
    data: InquiryReplyCreate,
    db: DbSession,
    context: CurrentSchoolContext,
):
    _require(context, "school.inquiries.reply")
    inquiry = await ContactInquiryService.get_for_school(db, inquiry_id, context.school.id)
    return success(
        data=await ContactInquiryService.reply(db, inquiry, context, data)
    )


@router.post("/inquiries/{inquiry_id}/messages/{message_id}/retry")
async def retry_inquiry_reply(
    inquiry_id: uuid.UUID,
    message_id: uuid.UUID,
    db: DbSession,
    context: CurrentSchoolContext,
):
    _require(context, "school.inquiries.reply")
    inquiry = await ContactInquiryService.get_for_school(db, inquiry_id, context.school.id)
    return success(
        data=await ContactInquiryService.retry_delivery(
            db,
            inquiry,
            message_id,
        )
    )
