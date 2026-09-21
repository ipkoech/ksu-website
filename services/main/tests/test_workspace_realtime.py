import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock
from uuid import uuid4

import pytest
from app.api.v1 import realtime
from app.realtime.connection_manager import ConnectionManager, RealtimeConnection


@pytest.mark.asyncio
@pytest.mark.parametrize("token_type", ["access", "socket"])
async def test_realtime_admission_requires_live_originating_session(monkeypatch, token_type):
    user_id = uuid4()
    monkeypatch.setattr(realtime, "decode_token", lambda _: {
        "type": token_type, "sub": str(user_id), "jti": "access-session",
        "session_jti": "ticket-session",
    })
    load = AsyncMock(return_value=None)
    monkeypatch.setattr(realtime, "_load_live_user", load)
    assert await realtime._resolve_websocket_user("signed-token") is None
    load.assert_awaited_once_with(user_id, "ticket-session" if token_type == "socket" else "access-session")


@pytest.mark.asyncio
async def test_live_user_query_checks_session_revocation(monkeypatch):
    db = AsyncMock()
    db.execute.return_value = Mock(scalar_one_or_none=Mock(return_value=None))
    factory = Mock(return_value=SimpleNamespace())
    factory.return_value = AsyncMock()
    factory.return_value.__aenter__.return_value = db
    monkeypatch.setattr(realtime, "AsyncSessionLocal", factory)
    assert await realtime._load_live_user(uuid4(), "session") is None
    sql = str(db.execute.await_args.args[0])
    for predicate in ("sessions.jti", "sessions.revoked_at IS NULL", "sessions.is_active IS true",
                      "sessions.expires_at", "users.is_active IS true"):
        assert predicate in sql


@pytest.mark.asyncio
@pytest.mark.parametrize("failure", [False, RuntimeError("identity unavailable")])
async def test_queued_events_are_not_sent_after_access_loss(failure):
    manager = ConnectionManager()
    socket = AsyncMock()
    connection = RealtimeConnection(socket, uuid4(), "local", {"school:one"})
    connection.validate_access = AsyncMock(return_value=False, side_effect=failure if failure else None)
    connection.queue.put_nowait({"type": "event", "private": "record"})
    await asyncio.wait_for(manager._sender(connection), timeout=1)
    socket.send_json.assert_not_awaited()
    socket.close.assert_awaited_once_with(code=1008, reason="access_revoked")
