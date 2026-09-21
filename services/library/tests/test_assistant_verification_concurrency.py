import asyncio
import os
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest
import sqlalchemy as sa
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.models import Library, LibraryAssistantContext, LibraryConversation, LibraryConversationMessage, LibraryEmailVerification, LibraryGuestSession
from app.schemas.assistant_identity import LibraryAssistantVerificationConfirm
from app.services import assistant_identity as svc


@pytest.mark.asyncio
async def test_verification_serializes_promotion_and_preserves_branch(monkeypatch):
    url = os.environ.get("KSU_TEST_DATABASE_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_DATABASE_URL required")
    schema = "assistant_verify_" + uuid4().hex
    engine = create_async_engine(url, execution_options={"schema_translate_map": {"library": schema}})
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    guest_id, branch_id, context_id = uuid4(), uuid4(), uuid4()
    limiter = SimpleNamespace(check=AsyncMock())
    monkeypatch.setattr(svc, "RateLimiter", lambda **kwargs: limiter)
    settings = SimpleNamespace(EMAIL_VERIFICATION_MAX_ATTEMPTS=5, EMAIL_VERIFICATION_TTL_MINUTES=10,
                               CONVERSATION_CONTINUATION_TTL_DAYS=7)
    try:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"CREATE SCHEMA {schema}"))
            for model in (Library, LibraryAssistantContext, LibraryGuestSession, LibraryConversation, LibraryConversationMessage, LibraryEmailVerification):
                await conn.run_sync(model.__table__.create)
        async with sessions.begin() as db:
            expires = datetime.now(timezone.utc) + timedelta(hours=1)
            await db.execute(sa.insert(Library).values(id=branch_id, name="Branch", slug="branch"))
            await db.execute(sa.insert(LibraryAssistantContext).values(id=context_id, library_id=branch_id, name="Context", slug="context"))
            await db.execute(sa.insert(LibraryGuestSession).values(id=guest_id, session_hash=svc.hash_secret("guest"), expires_at=expires, context_id=context_id))
            await db.execute(sa.insert(LibraryEmailVerification).values(
                guest_session_id=guest_id, email="disposable@example.invalid", expires_at=expires,
                token_hash=svc.hash_secret("verification-token"), code_hash=svc.hash_secret("123456"),
            ))
        async def confirm(code):
            try:
                async with sessions.begin() as db:
                    guest = await svc.get_guest_session(db, "guest")
                    conversation, _ = await svc.confirm_verification(db, guest, LibraryAssistantVerificationConfirm(code=code), settings=settings)
                    assert conversation.library_id == branch_id
                return "verified"
            except HTTPException as exc:
                return exc.status_code
        assert await confirm("000000") == 400
        # The limiter invocation is external to the rolled-back verification transaction.
        limiter.check.assert_awaited_once_with(str(guest_id), "confirm")
        results = await asyncio.wait_for(asyncio.gather(confirm("123456"), confirm("123456")), 10)
        assert results.count("verified") == 1 and results.count(409) == 1
        assert limiter.check.await_count == 3
        async with sessions() as db:
            assert await db.scalar(sa.select(sa.func.count()).select_from(LibraryConversation)) == 1
    finally:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"DROP SCHEMA {schema} CASCADE"))
        await engine.dispose()
