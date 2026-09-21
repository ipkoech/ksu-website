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

from app.models import Library, LibraryAssistantContext, LibraryConversation, LibraryConversationMessage, LibraryGuestSession
from app.schemas.assistant_chat import LibraryAssistantAnswerDraft, LibraryAssistantAnswerRequest
from app.services import assistant_conversations as svc
from app.services.assistant_identity import hash_secret
from app.models import LibraryConversationRecovery
from app.services.assistant_notifications import recover_conversation


@pytest.mark.asyncio
async def test_guest_answer_consumed_once_and_closed_continuation_cannot_generate(monkeypatch):
    url = os.environ.get("KSU_TEST_DATABASE_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_DATABASE_URL required")
    schema = "assistant_answers_" + uuid4().hex
    engine = create_async_engine(url, execution_options={"schema_translate_map": {"library": schema}})
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    token = "disposable-guest-token"
    continuation = "disposable-continuation-token"
    provider = SimpleNamespace(name="test", answer=AsyncMock(return_value=LibraryAssistantAnswerDraft(answer="Answer")))
    monkeypatch.setattr(svc, "_resolve_context", AsyncMock(return_value=None))
    request = LibraryAssistantAnswerRequest(message="Help with Library access")
    try:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"CREATE SCHEMA {schema}"))
            for model in (Library, LibraryAssistantContext, LibraryGuestSession, LibraryConversation, LibraryConversationMessage, LibraryConversationRecovery):
                await conn.run_sync(model.__table__.create)
        async with sessions.begin() as db:
            expires = datetime.now(timezone.utc) + timedelta(hours=1)
            await db.execute(sa.insert(LibraryGuestSession).values(session_hash=hash_secret(token), expires_at=expires))
            await db.execute(sa.insert(LibraryConversation).values(
                verified_email="disposable@example.invalid", status="closed", continuation_token_hash=hash_secret(continuation),
                continuation_expires_at=expires,
            ))
        async def answer():
            try:
                async with sessions.begin() as db:
                    await svc.answer_question(db, request, guest_token=token, provider=provider)
                return "answered"
            except HTTPException as exc:
                assert exc.status_code == 409
                return "consumed"
        results = await asyncio.wait_for(asyncio.gather(answer(), answer()), 10)
        assert sorted(results) == ["answered", "consumed"]
        assert provider.answer.await_count == 1
        recovery_token = "disposable-recovery-token"
        async with sessions.begin() as db:
            conversation_id = await db.scalar(sa.select(LibraryConversation.id))
            await db.execute(sa.insert(LibraryConversationRecovery).values(
                conversation_id=conversation_id, token_hash=hash_secret(recovery_token), expires_at=expires,
            ))
        async def recover():
            try:
                async with sessions.begin() as db:
                    _, rotated = await recover_conversation(db, recovery_token)
                return rotated
            except HTTPException as exc:
                assert exc.status_code == 401
                return None
        recovered = await asyncio.wait_for(asyncio.gather(recover(), recover()), 10)
        assert sum(token is not None for token in recovered) == 1
        async with sessions() as db:
            assert await db.scalar(sa.select(LibraryConversation.continuation_token_hash)) == hash_secret(next(token for token in recovered if token))
        async with sessions.begin() as db:
            with pytest.raises(HTTPException) as error:
                await svc.answer_question(db, request, continuation_token=continuation, provider=provider)
            assert error.value.status_code == 401
            with pytest.raises(HTTPException) as error:
                await svc.answer_question(db, request, continuation_token=next(token for token in recovered if token), provider=provider)
            assert error.value.status_code == 409
            assert await db.scalar(sa.select(sa.func.count()).select_from(LibraryConversationMessage)) == 0
        assert provider.answer.await_count == 1
    finally:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"DROP SCHEMA {schema} CASCADE"))
        await engine.dispose()
