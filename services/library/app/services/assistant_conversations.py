"""Answer generation and durable conversation operations."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import LibraryAssistantContext, LibraryConversation, LibraryConversationMessage
from ..schemas.assistant_chat import (
    LibraryAssistantAnswer,
    LibraryAssistantAnswerRequest,
    LibraryAssistantCitation,
)
from . import assistant_contexts
from .assistant_identity import (
    get_conversation_by_continuation,
    get_guest_session,
)
from .assistant_provider import (
    DeterministicLibraryAssistantProvider,
    LibraryAssistantProvider,
    get_assistant_provider,
)
from .assistant_retrieval import retrieve_approved_sources


def _now() -> datetime:
    return datetime.now(timezone.utc)


async def _resolve_context(
    db: AsyncSession,
    context_id: uuid.UUID | None,
) -> LibraryAssistantContext | None:
    if context_id is not None:
        return await assistant_contexts.get_context(db, context_id, public_only=True)
    public_contexts = await assistant_contexts.list_contexts(db, public_only=True)
    if not public_contexts:
        return None
    return await assistant_contexts.get_context(
        db, uuid.UUID(str(public_contexts[0]["id"])), public_only=True
    )


def _history(conversation: LibraryConversation | None) -> list[dict[str, str]]:
    if conversation is None:
        return []
    return [
        {"role": "assistant" if message.sender_type == "assistant" else "user", "content": message.content}
        for message in conversation.messages[-8:]
    ]


def _citation_data(sources: list[dict[str, Any]]) -> list[LibraryAssistantCitation]:
    return [
        LibraryAssistantCitation(
            source_type=source["source_type"],
            source_id=source["source_id"],
            title=source["title"],
            url=source.get("url"),
            snippet=source.get("snippet"),
        )
        for source in sources
    ]


def _message_data(message: LibraryConversationMessage) -> dict:
    return {
        "id": message.id,
        "conversation_id": message.conversation_id,
        "sender_type": message.sender_type,
        "content": message.content,
        "citations": message.citations or [],
        "metadata": message.message_metadata,
        "sender_person_id": message.sender_person_id,
        "created_at": message.created_at,
    }


def _conversation_data(conversation: LibraryConversation, *, include_messages: bool = True) -> dict:
    return {
        "id": conversation.id,
        "context_id": conversation.context_id,
        "verified_email": conversation.verified_email,
        "title": conversation.title,
        "status": conversation.status,
        "assigned_to_person_id": conversation.assigned_to_person_id,
        "last_message_at": conversation.last_message_at,
        "created_at": conversation.created_at,
        "updated_at": conversation.updated_at,
        "messages": [_message_data(message) for message in conversation.messages] if include_messages else [],
    }


async def _call_provider(
    provider: LibraryAssistantProvider,
    *,
    message: str,
    instructions: str,
    sources: list[dict[str, Any]],
    history: list[dict[str, str]],
    escalation_guidance: str | None,
):
    try:
        return await provider.answer(
            message=message,
            instructions=instructions,
            sources=sources,
            history=history,
            escalation_guidance=escalation_guidance,
        ), provider.name
    except Exception:
        fallback = DeterministicLibraryAssistantProvider()
        return await fallback.answer(
            message=message,
            instructions=instructions,
            sources=sources,
            history=history,
            escalation_guidance=escalation_guidance,
        ), "deterministic-fallback"


async def answer_question(
    db: AsyncSession,
    request: LibraryAssistantAnswerRequest,
    *,
    guest_token: str | None = None,
    continuation_token: str | None = None,
    provider: LibraryAssistantProvider | None = None,
) -> LibraryAssistantAnswer:
    conversation: LibraryConversation | None = None
    guest_session = None
    if continuation_token:
        conversation = await get_conversation_by_continuation(db, continuation_token)
        if request.conversation_id and request.conversation_id != conversation.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Conversation access denied")
        context_id = conversation.context_id
    else:
        if not guest_token:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Start a guest assistant session")
        guest_session = await get_guest_session(db, guest_token)
        if guest_session.answer_consumed_at is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Verify your email to continue this conversation")
        context_id = request.context_id

    context = await _resolve_context(db, context_id)
    sources = (
        await retrieve_approved_sources(
            db,
            context,
            query=request.message,
            page_context=request.page_context.model_dump(mode="json") if request.page_context else None,
        )
        if context is not None
        else []
    )
    draft, provider_name = await _call_provider(
        provider or get_assistant_provider(),
        message=request.message,
        instructions=context.instructions if context else "There is no published Library assistant context yet.",
        sources=sources,
        history=_history(conversation),
        escalation_guidance=context.escalation_guidance if context else None,
    )
    citations = _citation_data(sources)
    metadata = {"context_id": str(context.id) if context else None, "source_count": len(sources)}

    if guest_session is not None:
        guest_session.answer_consumed_at = _now()
        guest_session.context_id = context.id if context else None
        guest_session.page_context = request.page_context.model_dump(mode="json") if request.page_context else None
        guest_session.preview_messages = [
            {"sender_type": "user", "content": request.message, "citations": [], "metadata": {}},
            {
                "sender_type": "assistant",
                "content": draft.answer,
                "citations": [citation.model_dump(mode="json") for citation in citations],
                "metadata": metadata,
            },
        ]
        await db.flush()
        return LibraryAssistantAnswer(
            answer=draft.answer,
            citations=citations,
            suggested_questions=draft.suggested_questions,
            needs_verification=True,
            should_escalate=draft.should_escalate,
            provider=provider_name,
            metadata=metadata,
        )

    assert conversation is not None
    user_message = LibraryConversationMessage(
        conversation_id=conversation.id,
        sender_type="user",
        content=request.message,
        citations=[],
        message_metadata={"page_context": request.page_context.model_dump(mode="json") if request.page_context else None},
    )
    assistant_message = LibraryConversationMessage(
        conversation_id=conversation.id,
        sender_type="assistant",
        content=draft.answer,
        citations=[citation.model_dump(mode="json") for citation in citations],
        message_metadata=metadata,
    )
    db.add_all([user_message, assistant_message])
    conversation.context_id = context.id if context else conversation.context_id
    conversation.last_message_at = _now()
    if not conversation.title:
        conversation.title = request.message.strip()[:255]
    await db.flush()
    return LibraryAssistantAnswer(
        answer=draft.answer,
        citations=citations,
        suggested_questions=draft.suggested_questions,
        needs_verification=False,
        should_escalate=draft.should_escalate,
        conversation_id=conversation.id,
        user_message_id=user_message.id,
        assistant_message_id=assistant_message.id,
        provider=provider_name,
        metadata=metadata,
    )


async def get_owned_conversation(
    db: AsyncSession,
    conversation_id: uuid.UUID,
    continuation_token: str,
) -> LibraryConversation:
    conversation = await get_conversation_by_continuation(db, continuation_token)
    if conversation.id != conversation_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Conversation access denied")
    return conversation
