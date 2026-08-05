"""Guest-session, email-verification, and conversation promotion services."""

from __future__ import annotations

import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any
from urllib.parse import quote

from fastapi import HTTPException, status
from ksu_common.internal_client import get_integration_pool
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..core.config import Settings, get_settings
from ..models import (
    LibraryConversation,
    LibraryConversationMessage,
    LibraryEmailVerification,
    LibraryGuestSession,
)
from ..schemas.assistant_identity import (
    LibraryAssistantVerificationConfirm,
    LibraryAssistantVerificationRequest,
)

GUEST_SESSION_COOKIE = "ksu_library_guest_session"
CONTINUATION_COOKIE = "ksu_library_conversation"


def hash_secret(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def create_guest_token() -> str:
    return secrets.token_urlsafe(32)


def create_verification_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _safe_datetime(value: Any) -> datetime:
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        return datetime.fromisoformat(value)
    return _now()


async def create_guest_session(
    db: AsyncSession,
    *,
    settings: Settings | None = None,
) -> tuple[LibraryGuestSession, str]:
    settings = settings or get_settings()
    token = create_guest_token()
    session = LibraryGuestSession(
        session_hash=hash_secret(token),
        preview_messages=[],
        expires_at=_now() + timedelta(minutes=settings.GUEST_SESSION_TTL_MINUTES),
    )
    db.add(session)
    await db.flush()
    return session, token


async def get_guest_session(
    db: AsyncSession,
    token: str,
) -> LibraryGuestSession:
    session = (
        await db.execute(
            select(LibraryGuestSession).where(
                LibraryGuestSession.session_hash == hash_secret(token),
                LibraryGuestSession.deleted_at.is_(None),
            )
        )
    ).scalar_one_or_none()
    if session is None or session.expires_at <= _now():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Guest session expired")
    return session


async def request_verification(
    db: AsyncSession,
    guest_session: LibraryGuestSession,
    data: LibraryAssistantVerificationRequest,
    *,
    settings: Settings | None = None,
) -> None:
    settings = settings or get_settings()
    now = _now()
    email = str(data.email).strip().lower()
    existing = (
        await db.execute(
            select(LibraryEmailVerification)
            .where(
                LibraryEmailVerification.guest_session_id == guest_session.id,
                LibraryEmailVerification.verified_at.is_(None),
            )
            .order_by(LibraryEmailVerification.created_at.desc())
            .limit(1)
        )
    ).scalar_one_or_none()
    if existing and existing.last_sent_at:
        elapsed = (now - existing.last_sent_at).total_seconds()
        if elapsed < settings.EMAIL_VERIFICATION_RESEND_SECONDS:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Please wait before requesting another verification email",
            )

    token = secrets.token_urlsafe(32)
    code = create_verification_code()
    verification = existing or LibraryEmailVerification(
        guest_session_id=guest_session.id,
        attempt_count=0,
        resend_count=0,
    )
    verification.email = email
    verification.token_hash = hash_secret(token)
    verification.code_hash = hash_secret(code)
    verification.expires_at = now + timedelta(minutes=settings.EMAIL_VERIFICATION_TTL_MINUTES)
    verification.last_sent_at = now
    verification.resend_count = (verification.resend_count or 0) + 1
    db.add(verification)
    await db.flush()
    await send_verification_email(
        email=email,
        token=token,
        code=code,
        settings=settings,
    )


async def send_verification_email(
    *,
    email: str,
    token: str,
    code: str,
    settings: Settings,
) -> None:
    link = f"{settings.PUBLIC_APP_URL.rstrip('/')}/ask?verification_token={quote(token)}"
    text = (
        "Continue your Kisii University Library conversation.\n\n"
        f"Open this secure link: {link}\n\n"
        f"Or enter this six-digit code: {code}\n\n"
        "The link and code expire soon and can only be used once."
    )
    html = (
        "<p>Continue your Kisii University Library conversation.</p>"
        f'<p><a href="{link}">Continue the conversation</a></p>'
        f"<p>Or enter this six-digit code: <strong>{code}</strong></p>"
        "<p>This link and code expire soon and can only be used once.</p>"
    )
    response = await get_integration_pool().request_internal(
        "main-library-verification-email",
        settings.MAIN_SERVICE_URL.rstrip("/"),
        "POST",
        "/api/v1/internal/email/send",
        api_key=settings.INTERNAL_API_KEY,
        timeout=10,
        json={"to_email": email, "subject": "Continue your Library conversation", "text_body": text, "html_body": html},
    )
    response.raise_for_status()


async def confirm_verification(
    db: AsyncSession,
    guest_session: LibraryGuestSession,
    data: LibraryAssistantVerificationConfirm,
    *,
    settings: Settings | None = None,
) -> tuple[LibraryConversation, str]:
    settings = settings or get_settings()
    verification = (
        await db.execute(
            select(LibraryEmailVerification).where(
                LibraryEmailVerification.guest_session_id == guest_session.id,
                LibraryEmailVerification.verified_at.is_(None),
            ).order_by(LibraryEmailVerification.created_at.desc()).limit(1)
        )
    ).scalar_one_or_none()
    now = _now()
    if verification is None or verification.expires_at <= now:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Verification expired or invalid")
    if verification.attempt_count >= settings.EMAIL_VERIFICATION_MAX_ATTEMPTS:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many verification attempts")

    candidate = data.token or data.code or ""
    expected_hash = verification.token_hash if data.token else verification.code_hash
    if not hmac.compare_digest(hash_secret(candidate), expected_hash):
        verification.attempt_count += 1
        await db.flush()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Verification expired or invalid")

    continuation_token = create_guest_token()
    conversation = LibraryConversation(
        context_id=guest_session.context_id,
        page_context=guest_session.page_context,
        guest_session_id=guest_session.id,
        verified_email=verification.email,
        status="active",
        continuation_token_hash=hash_secret(continuation_token),
        continuation_expires_at=now + timedelta(days=settings.CONVERSATION_CONTINUATION_TTL_DAYS),
    )
    db.add(conversation)
    await db.flush()
    for item in guest_session.preview_messages or []:
        db.add(
            LibraryConversationMessage(
                conversation_id=conversation.id,
                sender_type=item.get("sender_type", "system"),
                content=item.get("content", ""),
                citations=item.get("citations", []),
                message_metadata=item.get("metadata"),
            )
        )
    verification.verified_at = now
    verification.conversation_id = conversation.id
    guest_session.expires_at = now + timedelta(days=settings.CONVERSATION_CONTINUATION_TTL_DAYS)
    await db.flush()
    return conversation, continuation_token


async def get_conversation_by_continuation(
    db: AsyncSession,
    token: str,
) -> LibraryConversation:
    conversation = (
        await db.execute(
            select(LibraryConversation)
            .options(selectinload(LibraryConversation.messages))
            .where(
                LibraryConversation.continuation_token_hash == hash_secret(token),
                LibraryConversation.deleted_at.is_(None),
            )
        )
    ).scalars().unique().one_or_none()
    if conversation is None or not conversation.continuation_expires_at or conversation.continuation_expires_at <= _now():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Conversation access expired")
    return conversation
