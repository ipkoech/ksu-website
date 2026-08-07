"""Librarian inbox and same-thread reply endpoints."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from ksu_common.audit import audit_action
from ksu_common.auth import TokenPayload
from ...core.auth import requires_scope
from ksu_common.schemas.responses import success

from ...core.database import get_db
from ...schemas import (
    LibraryAssistantStaffAssignmentUpdate,
    LibraryAssistantStaffReplyCreate,
    LibraryAssistantStaffStatusUpdate,
)
from ...services import assistant_staff as svc

router = APIRouter(prefix="/library/assistant/staff", tags=["Library Assistant Staff"])


@router.get("/conversations")
async def list_conversations(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:read"))],
    status_filter: str | None = Query(None, alias="status"),
    context_id: uuid.UUID | None = Query(None),
    assigned_to: uuid.UUID | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
):
    data = await svc.list_staff_conversations(
        db,
        user,
        status_filter=status_filter,
        context_id=context_id,
        assigned_to=assigned_to,
        page=page,
        per_page=per_page,
    )
    return success(data=data)


@router.get("/conversations/{conversation_id}")
async def get_conversation(
    request: Request,
    conversation_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:read"))],
):
    conversation = await svc.get_staff_conversation(db, user, conversation_id)
    from ...services.assistant_conversations import _conversation_data

    return success(data=_conversation_data(conversation))


@router.post("/conversations/{conversation_id}/assign")
@audit_action("assistant_conversation.assign", target_type="LibraryConversation", target_id_param="conversation_id")
async def assign_conversation(
    request: Request,
    conversation_id: uuid.UUID,
    data: LibraryAssistantStaffAssignmentUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    return success(data=await svc.assign_conversation(db, user, conversation_id, data))


@router.patch("/conversations/{conversation_id}/status")
@audit_action("assistant_conversation.status", target_type="LibraryConversation", target_id_param="conversation_id")
async def update_status(
    request: Request,
    conversation_id: uuid.UUID,
    data: LibraryAssistantStaffStatusUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    return success(data=await svc.update_status(db, user, conversation_id, data))


@router.post("/conversations/{conversation_id}/reply")
@audit_action("assistant_conversation.reply", target_type="LibraryConversation", target_id_param="conversation_id")
async def reply_to_conversation(
    request: Request,
    conversation_id: uuid.UUID,
    data: LibraryAssistantStaffReplyCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(requires_scope("library:write"))],
):
    return success(
        data=await svc.reply_to_conversation(db, user, conversation_id, data),
        message="Librarian reply added to conversation",
    )
