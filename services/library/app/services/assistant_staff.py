"""Staff workflow operations for persistent Library assistant threads."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import attributes

from ksu_common.auth import TokenPayload

from ..core.auth import allowed_library_scope_ids, require_library_scope
from ..core.config import get_settings
from ..models import LibraryConversation, LibraryConversationMessage, LibraryStaff
from ..schemas.assistant import (
    LibraryAssistantStaffAssignmentUpdate,
    LibraryAssistantStaffReplyCreate,
    LibraryAssistantStaffStatusUpdate,
)
from .assistant_conversations import _conversation_data
from .assistant_notifications import create_recovery_link, send_reply_notification


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _require_open_conversation(conversation):
    if conversation.status in {"resolved", "closed"}:
        raise HTTPException(status_code=409, detail="Reopen the conversation before assigning or replying")


async def _get_conversation(db: AsyncSession, conversation_id: uuid.UUID, *, for_update=False, message_limit=100, message_offset=0) -> LibraryConversation:
    query = select(LibraryConversation).where(
        LibraryConversation.id == conversation_id, LibraryConversation.deleted_at.is_(None),
    )
    if for_update:
        query = query.with_for_update().execution_options(populate_existing=True)
    conversation = (
        await db.execute(query)
    ).scalars().unique().one_or_none()
    if conversation is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    await _load_bounded_messages(db, [conversation], limit=message_limit, offset=message_offset)
    return conversation


async def _load_bounded_messages(db: AsyncSession, conversations: list[LibraryConversation], *, limit: int = 100, offset: int = 0) -> None:
    """Load only the newest bounded message window for staff responses."""
    if not conversations:
        return
    limit = max(1, min(limit, 100))
    offset = max(0, min(offset, 1000))
    ids = [conversation.id for conversation in conversations]
    ranked = select(
        LibraryConversationMessage,
        func.row_number().over(
            partition_by=LibraryConversationMessage.conversation_id,
            order_by=(LibraryConversationMessage.created_at.desc(), LibraryConversationMessage.id.desc()),
        ).label("message_rank"),
    ).where(LibraryConversationMessage.conversation_id.in_(ids)).subquery()
    result = await db.execute(select(LibraryConversationMessage).join(
        ranked, LibraryConversationMessage.id == ranked.c.id,
    ).where(ranked.c.message_rank > offset, ranked.c.message_rank <= offset + limit).order_by(
        LibraryConversationMessage.conversation_id,
        LibraryConversationMessage.created_at,
        LibraryConversationMessage.id,
    ))
    grouped: dict[uuid.UUID, list[LibraryConversationMessage]] = {}
    for message in result.scalars():
        grouped.setdefault(message.conversation_id, []).append(message)
    for conversation in conversations:
        attributes.set_committed_value(conversation, "messages", grouped.get(conversation.id, []))


def _scope_filter(query, user: TokenPayload):
    scope_ids = allowed_library_scope_ids(user, "library.assistant.conversations.view")
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
        .where(LibraryConversation.deleted_at.is_(None))
    )
    query = _scope_filter(query, user)
    if status_filter:
        query = query.where(LibraryConversation.status == status_filter)
    if context_id:
        query = query.where(LibraryConversation.context_id == context_id)
    if assigned_to:
        query = query.where(LibraryConversation.assigned_to_person_id == assigned_to)
    query = query.order_by(LibraryConversation.updated_at.desc(), LibraryConversation.id.desc()).offset((page - 1) * per_page).limit(per_page)
    items = (await db.execute(query)).scalars().unique().all()
    await _load_bounded_messages(db, list(items))
    return [_conversation_data(item) for item in items]


async def get_staff_conversation(
    db: AsyncSession,
    user: TokenPayload,
    conversation_id: uuid.UUID,
    *,
    message_limit: int = 100,
    message_offset: int = 0,
) -> LibraryConversation:
    conversation = await _get_conversation(db, conversation_id, message_limit=message_limit, message_offset=message_offset)
    require_library_scope(user, "library.assistant.conversations.view", conversation.library_id)
    return conversation


async def assign_conversation(
    db: AsyncSession,
    user: TokenPayload,
    conversation_id: uuid.UUID,
    data: LibraryAssistantStaffAssignmentUpdate,
) -> dict:
    conversation = await _get_conversation(db, conversation_id, for_update=True)
    require_library_scope(user, "library.assistant.conversations.manage", conversation.library_id)
    require_library_scope(user, "library.assistant.conversations.view", conversation.library_id)
    _require_open_conversation(conversation)
    if data.assigned_to_person_id is not None:
        staff_query = select(LibraryStaff.id).where(
            LibraryStaff.person_id == data.assigned_to_person_id, LibraryStaff.is_active.is_(True),
            LibraryStaff.deleted_at.is_(None),
        )
        if conversation.library_id is not None:
            staff_query = staff_query.where(LibraryStaff.library_id == conversation.library_id)
        if await db.scalar(staff_query.limit(1)) is None:
            raise ValueError("Conversation assignee must be active staff in the same branch")
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
    conversation = await _get_conversation(db, conversation_id, for_update=True)
    require_library_scope(user, "library.assistant.conversations.manage", conversation.library_id)
    require_library_scope(user, "library.assistant.conversations.view", conversation.library_id)
    if data.status in {"assigned", "librarian_replied"} and data.status != conversation.status:
        raise HTTPException(status_code=409, detail="Use the assignment or reply command for this status")
    if conversation.status in {"resolved", "closed"} and data.status not in {"active", "awaiting_librarian", "resolved", "closed"}:
        raise HTTPException(status_code=409, detail="Reopen the conversation before changing its operational status")
    conversation.status = data.status
    await db.flush()
    return _conversation_data(conversation)


async def reply_to_conversation(
    db: AsyncSession,
    user: TokenPayload,
    conversation_id: uuid.UUID,
    data: LibraryAssistantStaffReplyCreate,
) -> dict:
    conversation = await _get_conversation(db, conversation_id, for_update=True)
    require_library_scope(user, "library.assistant.conversations.reply", conversation.library_id)
    require_library_scope(user, "library.assistant.conversations.view", conversation.library_id)
    _require_open_conversation(conversation)
    if not data.content.strip():
        raise ValueError("A librarian reply cannot be blank")
    person_id = uuid.UUID(user.raw["person_id"]) if user.raw.get("person_id") else None
    message = LibraryConversationMessage(
        conversation_id=conversation.id,
        sender_type="librarian",
        content=data.content.strip(),
        citations=[],
        message_metadata={"reply_source": "library_staff", "actor_user_id": user.sub},
        sender_person_id=person_id,
    )
    db.add(message)
    conversation.status = "librarian_replied"
    if conversation.assigned_to_person_id is None and person_id is not None:
        staff_query = select(LibraryStaff.id).where(
            LibraryStaff.person_id == person_id, LibraryStaff.is_active.is_(True),
            LibraryStaff.deleted_at.is_(None),
        )
        if conversation.library_id is not None:
            staff_query = staff_query.where(LibraryStaff.library_id == conversation.library_id)
        if await db.scalar(staff_query.limit(1)) is not None:
            conversation.assigned_to_person_id = person_id
    conversation.last_message_at = _now()
    await db.flush()
    conversation.messages.append(message)
    if conversation.verified_email:
        recovery_token = await create_recovery_link(db, conversation)
        await send_reply_notification(db, email=conversation.verified_email, token=recovery_token, settings=get_settings())
    return _conversation_data(conversation)
