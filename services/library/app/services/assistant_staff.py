"""Staff workflow operations for persistent Library assistant threads."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ksu_common.auth import TokenPayload

from ..core.auth import allowed_library_scope_ids, require_library_scope
from ..core.config import get_settings
from ..models import LibraryConversation, LibraryConversationMessage
from ..schemas.assistant import (
    LibraryAssistantStaffAssignmentUpdate,
    LibraryAssistantStaffReplyCreate,
    LibraryAssistantStaffStatusUpdate,
)
from .assistant_conversations import _conversation_data
from .assistant_notifications import create_recovery_link, send_reply_notification


def _now() -> datetime:
    return datetime.now(timezone.utc)


async def _get_conversation(db: AsyncSession, conversation_id: uuid.UUID) -> LibraryConversation:
    conversation = (
        await db.execute(
            select(LibraryConversation)
            .options(selectinload(LibraryConversation.messages))
            .where(
                LibraryConversation.id == conversation_id,
                LibraryConversation.deleted_at.is_(None),
            )
        )
    ).scalars().unique().one_or_none()
    if conversation is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    return conversation


def _scope_filter(query, user: TokenPayload):
    scope_ids = allowed_library_scope_ids(user, "library.read")
    if scope_ids is not None:
        query = query.where(
            LibraryConversation.library_id.in_([uuid.UUID(value) for value in scope_ids])
        )
    return query


async def list_staff_conversations(
    db: AsyncSession,
    user: TokenPayload,
    *,
    status_filter: str | None = None,
    context_id: uuid.UUID | None = None,
    assigned_to: uuid.UUID | None = None,
    page: int = 1,
    per_page: int = 50,
) -> list[dict]:
    query = (
        select(LibraryConversation)
        .options(selectinload(LibraryConversation.messages))
        .where(LibraryConversation.deleted_at.is_(None))
    )
    query = _scope_filter(query, user)
    if status_filter:
        query = query.where(LibraryConversation.status == status_filter)
    if context_id:
        query = query.where(LibraryConversation.context_id == context_id)
    if assigned_to:
        query = query.where(LibraryConversation.assigned_to_person_id == assigned_to)
    query = query.order_by(LibraryConversation.updated_at.desc()).offset((page - 1) * per_page).limit(per_page)
    items = (await db.execute(query)).scalars().unique().all()
    return [_conversation_data(item) for item in items]


async def get_staff_conversation(
    db: AsyncSession,
    user: TokenPayload,
    conversation_id: uuid.UUID,
) -> LibraryConversation:
    conversation = await _get_conversation(db, conversation_id)
    require_library_scope(user, "library.read", conversation.library_id)
    return conversation


async def assign_conversation(
    db: AsyncSession,
    user: TokenPayload,
    conversation_id: uuid.UUID,
    data: LibraryAssistantStaffAssignmentUpdate,
) -> dict:
    conversation = await _get_conversation(db, conversation_id)
    require_library_scope(user, "library.write", conversation.library_id)
    conversation.assigned_to_person_id = data.assigned_to_person_id
    conversation.status = "assigned" if data.assigned_to_person_id else "awaiting_librarian"
    await db.flush()
    return _conversation_data(conversation)


async def update_status(
    db: AsyncSession,
    user: TokenPayload,
    conversation_id: uuid.UUID,
    data: LibraryAssistantStaffStatusUpdate,
) -> dict:
    conversation = await _get_conversation(db, conversation_id)
    require_library_scope(user, "library.write", conversation.library_id)
    conversation.status = data.status
    await db.flush()
    return _conversation_data(conversation)


async def reply_to_conversation(
    db: AsyncSession,
    user: TokenPayload,
    conversation_id: uuid.UUID,
    data: LibraryAssistantStaffReplyCreate,
) -> dict:
    conversation = await _get_conversation(db, conversation_id)
    require_library_scope(user, "library.write", conversation.library_id)
    message = LibraryConversationMessage(
        conversation_id=conversation.id,
        sender_type="librarian",
        content=data.content.strip(),
        citations=[],
        message_metadata={"reply_source": "library_staff"},
        sender_person_id=uuid.UUID(user.sub),
    )
    db.add(message)
    conversation.status = "librarian_replied"
    conversation.assigned_to_person_id = conversation.assigned_to_person_id or uuid.UUID(user.sub)
    conversation.last_message_at = _now()
    await db.flush()
    conversation.messages.append(message)
    if conversation.verified_email:
        try:
            recovery_token = await create_recovery_link(db, conversation)
            await send_reply_notification(
                email=conversation.verified_email,
                token=recovery_token,
                settings=get_settings(),
            )
        except Exception:
            # A mail-provider outage must not discard a librarian's reply.
            pass
    return _conversation_data(conversation)
