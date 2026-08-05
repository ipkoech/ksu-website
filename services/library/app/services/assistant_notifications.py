"""Notifications and recovery credentials for verified Library threads."""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from urllib.parse import quote

from ksu_common.internal_client import internal_client
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..core.config import Settings, get_settings
from ..models import LibraryConversation, LibraryConversationRecovery
from .assistant_identity import create_guest_token, hash_secret


def _now() -> datetime:
    return datetime.now(timezone.utc)


async def create_recovery_link(
    db: AsyncSession,
    conversation: LibraryConversation,
    *,
    settings: Settings | None = None,
) -> str:
    settings = settings or get_settings()
    token = create_guest_token()
    recovery = LibraryConversationRecovery(
        conversation_id=conversation.id,
        token_hash=hash_secret(token),
        expires_at=_now() + timedelta(days=settings.CONVERSATION_CONTINUATION_TTL_DAYS),
    )
    db.add(recovery)
    await db.flush()
    return token


async def send_reply_notification(
    *,
    email: str,
    token: str,
    settings: Settings,
) -> None:
    link = f"{settings.PUBLIC_APP_URL.rstrip('/')}/ask?recovery_token={quote(token)}"
    text = (
        "A librarian replied to your Kisii University Library conversation.\n\n"
        f"Continue securely: {link}\n\n"
        "This recovery link expires soon."
    )
    html = (
        "<p>A librarian replied to your Kisii University Library conversation.</p>"
        f'<p><a href="{link}">Open your Library conversation</a></p>'
        "<p>This recovery link expires soon.</p>"
    )
    async with internal_client(
        settings.MAIN_SERVICE_URL, settings.INTERNAL_API_KEY, timeout=10
    ) as client:
        response = await client.post(
            "/api/v1/internal/email/send",
            json={
                "to_email": email,
                "subject": "A librarian replied to your conversation",
                "text_body": text,
                "html_body": html,
            },
        )
        response.raise_for_status()


async def recover_conversation(
    db: AsyncSession,
    token: str,
) -> tuple[LibraryConversation, str]:
    recovery = (
        await db.execute(
            select(LibraryConversationRecovery)
            .options(selectinload(LibraryConversationRecovery.conversation).selectinload(LibraryConversation.messages))
            .where(
                LibraryConversationRecovery.token_hash == hash_secret(token),
                LibraryConversationRecovery.used_at.is_(None),
            )
        )
    ).scalar_one_or_none()
    now = _now()
    if recovery is None or recovery.expires_at <= now:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Recovery link expired or invalid")
    conversation = recovery.conversation
    if conversation.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    recovery.used_at = now
    continuation_token = create_guest_token()
    conversation.continuation_token_hash = hash_secret(continuation_token)
    settings = get_settings()
    conversation.continuation_expires_at = now + timedelta(days=settings.CONVERSATION_CONTINUATION_TTL_DAYS)
    await db.flush()
    return conversation, continuation_token
