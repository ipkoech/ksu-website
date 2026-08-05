"""Secure recovery links for returning Library assistant users."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession

from ksu_common.schemas.responses import success

from ...core.config import get_settings
from ...core.database import get_db
from ...services.assistant_conversations import _conversation_data
from ...services import assistant_notifications as notifications
from ...services import assistant_identity as identity

router = APIRouter(prefix="/library/assistant", tags=["Library Assistant Recovery"])


@router.get("/recovery/confirm")
async def confirm_recovery(
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
    token: str = Query(..., min_length=20, max_length=256),
):
    conversation, continuation_token = await notifications.recover_conversation(db, token)
    settings = get_settings()
    response.set_cookie(
        identity.CONTINUATION_COOKIE,
        continuation_token,
        max_age=settings.CONVERSATION_CONTINUATION_TTL_DAYS * 86400,
        httponly=True,
        secure=settings.APP_ENV.lower() not in {"development", "dev", "local", "test", "testing"},
        samesite="lax",
        path="/",
    )
    return success(data={"conversation": _conversation_data(conversation)})
