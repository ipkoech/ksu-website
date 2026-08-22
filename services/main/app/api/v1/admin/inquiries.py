"""Central administration for non-school public inquiry conversations.

Access model: holders of ``support.manage_inquiries`` may include school-owned
threads, while
the ability to peek at school-owned threads via ``include_school_owned``.
Corporate Communication holders (``content.manage`` or
``support.manage_contacts``) get the same inbox and conversation actions but
are always confined to non-school-owned inquiries — mirroring how the school
portal confines its holders to their own school.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from ksu_common.schemas.responses import success

from ....deps import DbSession, get_current_active_user, user_has_scope
from ....models import User
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

#: Non-admin scopes that grant access to the central (non-school) inbox.
#: Kept in sync with the Corporate Communication portal registry and
#: ``corporate_portal_context`` — both real permissions seeded in seed_rbac.
CORPORATE_INQUIRY_SCOPES = ("content.manage", "support.manage_contacts")


@dataclass(frozen=True)
class InquiryActor:
    """Authenticated inquiry operator plus their authority level."""

    user: User
    is_admin: bool


async def get_inquiry_actor(
    user: Annotated[User, Depends(get_current_active_user)],
) -> InquiryActor:
    """Authorize central-inbox access for admins or corporate scope holders."""
    if user_has_scope(user, "support.manage_inquiries"):
        return InquiryActor(user=user, is_admin=True)
    if any(user_has_scope(user, scope) for scope in CORPORATE_INQUIRY_SCOPES):
        return InquiryActor(user=user, is_admin=False)
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Insufficient privileges to manage public inquiries",
    )


InquiryActorDep = Annotated[InquiryActor, Depends(get_inquiry_actor)]

router = APIRouter()

Page = Annotated[int, Query(ge=1)]
PerPage = Annotated[int, Query(ge=1, le=100)]


def _context(actor: InquiryActor, inquiry) -> InquiryActionContext:
    return InquiryActionContext(
        user=actor.user,
        scope_type=inquiry.owner_scope_type,
        scope_id=inquiry.owner_scope_id,
    )


def _school_visibility(actor: InquiryActor, include_school_owned: bool) -> bool:
    """Only full admins may widen the inbox to school-owned threads."""
    return include_school_owned and actor.is_admin


@router.get("")
async def list_inquiries(
    db: DbSession,
    actor: InquiryActorDep,
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
        include_school_owned=_school_visibility(actor, include_school_owned),
        search=search,
        created_from=created_from,
        created_to=created_to,
    )
    return success(data=result.items, meta=result.meta)


@router.get("/{inquiry_id}")
async def get_inquiry(
    inquiry_id: uuid.UUID,
    db: DbSession,
    actor: InquiryActorDep,
    include_school_owned: bool = False,
):
    return success(
        data=await ContactInquiryService.get_for_admin(
            db,
            inquiry_id,
            include_school_owned=_school_visibility(actor, include_school_owned),
        )
    )


@router.patch("/{inquiry_id}/assign")
async def assign_inquiry(
    inquiry_id: uuid.UUID,
    data: InquiryAssign,
    db: DbSession,
    actor: InquiryActorDep,
):
    inquiry = await ContactInquiryService.get_for_admin(db, inquiry_id)
    return success(
        data=await ContactInquiryService.assign(
            db,
            inquiry,
            _context(actor, inquiry),
            data.assigned_to_user_id,
        )
    )


@router.patch("/{inquiry_id}/status")
async def update_inquiry_status(
    inquiry_id: uuid.UUID,
    data: InquiryStatusUpdate,
    db: DbSession,
    _: InquiryActorDep,
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
    actor: InquiryActorDep,
):
    inquiry = await ContactInquiryService.get_for_admin(db, inquiry_id)
    return success(
        data=await ContactInquiryService.add_note(
            db,
            inquiry,
            _context(actor, inquiry),
            data.body,
        )
    )


@router.post("/{inquiry_id}/replies")
async def reply_to_inquiry(
    inquiry_id: uuid.UUID,
    data: InquiryReplyCreate,
    db: DbSession,
    actor: InquiryActorDep,
):
    inquiry = await ContactInquiryService.get_for_admin(db, inquiry_id)
    return success(
        data=await ContactInquiryService.reply(
            db,
            inquiry,
            _context(actor, inquiry),
            data,
        )
    )


@router.post("/{inquiry_id}/messages/{message_id}/retry")
async def retry_inquiry_reply(
    inquiry_id: uuid.UUID,
    message_id: uuid.UUID,
    db: DbSession,
    _: InquiryActorDep,
):
    inquiry = await ContactInquiryService.get_for_admin(db, inquiry_id)
    return success(
        data=await ContactInquiryService.retry_delivery(db, inquiry, message_id)
    )
