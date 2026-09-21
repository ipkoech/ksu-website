import os
from uuid import uuid4

import pytest
import sqlalchemy as sa
from ksu_common.auth import TokenPayload
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.models import Library, LibraryAssistantContext, LibraryConversation, LibraryConversationMessage, LibraryGuestSession
from app.services.assistant_staff import get_staff_conversation, list_staff_conversations


@pytest.mark.asyncio
async def test_staff_reads_bound_messages_per_conversation():
    url = os.environ.get("KSU_TEST_DATABASE_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_DATABASE_URL required")
    schema = "assistant_bound_" + uuid4().hex
    engine = create_async_engine(url, execution_options={"schema_translate_map": {"library": schema}})
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    branch, context, conversation = uuid4(), uuid4(), uuid4()
    actor = TokenPayload(str(uuid4()), "session", raw={"scope_grants": [
        {"scope_type": "global", "permissions": ["library.assistant.conversations.view"]},
    ]})
    try:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"CREATE SCHEMA {schema}"))
            for model in (Library, LibraryAssistantContext, LibraryGuestSession, LibraryConversation, LibraryConversationMessage):
                await conn.run_sync(model.__table__.create)
        async with sessions.begin() as db:
            db.add(Library(id=branch, name="Branch", slug="branch"))
            await db.flush()
            db.add(LibraryAssistantContext(id=context, library_id=branch, name="Context", slug="context", status="published", is_public=True))
            await db.flush()
            db.add(LibraryConversation(id=conversation, context_id=context, library_id=branch, status="active", verified_email="staff@example.org"))
            for number in range(105):
                db.add(LibraryConversationMessage(conversation_id=conversation, sender_type="user", content=str(number)))
        async with sessions() as db:
            record = await get_staff_conversation(db, actor, conversation)
            assert len(record.messages) == 100
            assert {message.content for message in record.messages}.issubset({str(number) for number in range(105)})
            older = await get_staff_conversation(db, actor, conversation, message_limit=10, message_offset=95)
            assert len(older.messages) == 10
            assert {message.content for message in older.messages}.issubset({str(number) for number in range(105)})
            listed = await list_staff_conversations(db, actor, page=1, per_page=10)
            assert len(listed) == 1
            assert len(listed[0]["messages"]) == 100
    finally:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"DROP SCHEMA IF EXISTS {schema} CASCADE"))
        await engine.dispose()
