"""Guest sessions and email verification for Library assistant continuation."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, Query, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession

from ksu_common.schemas.responses import success

from ...core.config import get_settings
from ...core.database import get_db
from ...schemas import (
    LibraryAssistantVerificationConfirm,
    LibraryAssistantVerificationRequest,
    LibraryAssistantVerificationResponse,
)
from ...services import assistant_identity as identity

router = APIRouter(prefix="/library/assistant", tags=["Library Assistant Identity"])


def _secure_cookie() -> bool:
    return get_settings().APP_ENV.lower() not in {"development", "dev", "local", "test", "testing"}


def _set_cookie(response: Response, name: str, value: str, max_age: int) -> None:
    response.set_cookie(
        name,
        value,
        max_age=max_age,
        httponly=True,
        secure=_secure_cookie(),
        samesite="lax",
        path="/",
    )


@router.post("/guest/session")
async def create_guest_session(
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    session, token = await identity.create_guest_session(db)
    max_age = get_settings().GUEST_SESSION_TTL_MINUTES * 60
    _set_cookie(response, identity.GUEST_SESSION_COOKIE, token, max_age)
    return success(data={"guest_session_id": str(session.id), "expires_at": session.expires_at})


@router.post("/verification/request")
async def request_verification(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    data: LibraryAssistantVerificationRequest,
    guest_token: str | None = Cookie(None, alias=identity.GUEST_SESSION_COOKIE),
):
    if not guest_token:
        return success(
            data=LibraryAssistantVerificationResponse(
                accepted=False,
                message="Start an assistant conversation before requesting verification.",
            ).model_dump()
        )
    guest_session = await identity.get_guest_session(db, guest_token)
    try:
        await identity.request_verification(db, guest_session, data)
    except Exception:
        # Keep the public response generic; rate limits and operational failures are
        # still recorded by the service logs and surfaced to retry-capable clients.
        return success(
            data=LibraryAssistantVerificationResponse(
                accepted=True,
                message="If the address can receive Library messages, a link and code are on their way.",
            ).model_dump()
        )
    return success(
        data=LibraryAssistantVerificationResponse(
            accepted=True,
            message="If the address can receive Library messages, a link and code are on their way.",
        ).model_dump()
    )


@router.post("/verification/confirm")
async def confirm_verification(
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
    data: LibraryAssistantVerificationConfirm,
    guest_token: str | None = Cookie(None, alias=identity.GUEST_SESSION_COOKIE),
):
    if not guest_token:
        return success(
            data=LibraryAssistantVerificationResponse(
                accepted=False,
                message="The verification session is no longer available.",
            ).model_dump()
        )
    guest_session = await identity.get_guest_session(db, guest_token)
    conversation, continuation_token = await identity.confirm_verification(db, guest_session, data)
    _set_cookie(
        response,
        identity.CONTINUATION_COOKIE,
        continuation_token,
        get_settings().CONVERSATION_CONTINUATION_TTL_DAYS * 86400,
    )
    return success(
        data=LibraryAssistantVerificationResponse(
            accepted=True,
            conversation_id=str(conversation.id),
            message="Your Library conversation is now saved and can be continued.",
        ).model_dump()
    )


@router.get("/verification/confirm")
async def confirm_verification_link(
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
    token: str = Query(..., min_length=20, max_length=256),
    guest_token: str | None = Cookie(None, alias=identity.GUEST_SESSION_COOKIE),
):
    data = LibraryAssistantVerificationConfirm(token=token)
    return await confirm_verification(response, db, data, guest_token)
