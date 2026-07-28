"""Grounded answer and persistent history endpoints for the Library assistant."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from ksu_common.schemas.responses import success

from ...core.config import get_settings
from ...core.database import get_db
from ...schemas import LibraryAssistantAnswerRequest
from ...services import assistant_conversations as conversations
from ...services import assistant_identity as identity

router = APIRouter(prefix="/library/assistant", tags=["Library Assistant Chat"])


def _set_cookie(response: Response, name: str, value: str, max_age: int) -> None:
    settings = get_settings()
    response.set_cookie(
        name,
        value,
        max_age=max_age,
        httponly=True,
        secure=settings.APP_ENV.lower() not in {"development", "dev", "local", "test", "testing"},
        samesite="lax",
        path="/",
    )


@router.post("/answer")
async def answer_question(
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
    data: LibraryAssistantAnswerRequest,
    guest_token: str | None = Cookie(None, alias=identity.GUEST_SESSION_COOKIE),
    continuation_token: str | None = Cookie(None, alias=identity.CONTINUATION_COOKIE),
):
    if not guest_token and not continuation_token:
        _, guest_token = await identity.create_guest_session(db)
        _set_cookie(
            response,
            identity.GUEST_SESSION_COOKIE,
            guest_token,
            get_settings().GUEST_SESSION_TTL_MINUTES * 60,
        )
    answer = await conversations.answer_question(
        db,
        data,
        guest_token=guest_token,
        continuation_token=continuation_token,
    )
    return success(data=answer.model_dump(mode="json"))


@router.get("/conversations")
async def list_conversations(
    db: Annotated[AsyncSession, Depends(get_db)],
    continuation_token: str | None = Cookie(None, alias=identity.CONTINUATION_COOKIE),
):
    if not continuation_token:
        return success(data=[])
    conversation = await identity.get_conversation_by_continuation(db, continuation_token)
    return success(data=[conversations._conversation_data(conversation, include_messages=False)])


@router.get("/conversations/{conversation_id}")
async def get_conversation(
    conversation_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    continuation_token: str | None = Cookie(None, alias=identity.CONTINUATION_COOKIE),
):
    if not continuation_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Conversation access denied")
    conversation = await conversations.get_owned_conversation(db, conversation_id, continuation_token)
    return success(data=conversations._conversation_data(conversation))


@router.get("/conversations/{conversation_id}/messages")
async def list_messages(
    conversation_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    continuation_token: str | None = Cookie(None, alias=identity.CONTINUATION_COOKIE),
):
    if not continuation_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Conversation access denied")
    conversation = await conversations.get_owned_conversation(db, conversation_id, continuation_token)
    return success(data=[conversations._message_data(message) for message in conversation.messages])


@router.post("/conversations/{conversation_id}/continue")
async def continue_conversation(
    conversation_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    data: LibraryAssistantAnswerRequest,
    continuation_token: str | None = Cookie(None, alias=identity.CONTINUATION_COOKIE),
):
    if not continuation_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Conversation access denied")
    data = data.model_copy(update={"conversation_id": conversation_id})
    answer = await conversations.answer_question(
        db,
        data,
        continuation_token=continuation_token,
    )
    return success(data=answer.model_dump(mode="json"))
