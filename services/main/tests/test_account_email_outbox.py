from __future__ import annotations

from unittest.mock import AsyncMock, Mock

import pytest

from app.services import user as user_service


@pytest.mark.asyncio
async def test_user_creation_enqueues_invite_email_after_flush(monkeypatch):
    db = Mock()
    db.flush = AsyncMock()
    db.refresh = AsyncMock()
    monkeypatch.setattr(user_service.UserService, "get_by_email", AsyncMock(return_value=None))
    monkeypatch.setattr(user_service.UserService, "get_by_id", AsyncMock(return_value=None))
    monkeypatch.setattr(user_service, "hash_password", lambda value: f"hashed:{value}")
    enqueue = Mock()
    monkeypatch.setattr(user_service, "enqueue_email_event", enqueue)

    created = await user_service.UserService.create(
        db,
        email="Invite@Example.test",
        password="TempPass1",
        full_name="Invited User",
    )

    assert created.email == "invite@example.test"
    assert created.password_hash == "hashed:TempPass1"
    db.flush.assert_awaited_once_with()
    enqueue.assert_called_once()
    assert enqueue.call_args.kwargs["event_type"] == "auth.account_created_email"
    assert enqueue.call_args.kwargs["payload"]["args"][2] == "TempPass1"


@pytest.mark.asyncio
async def test_user_creation_returns_eagerly_reloaded_user_for_snapshot_serialization(monkeypatch):
    db = Mock()
    db.flush = AsyncMock()
    db.refresh = AsyncMock()
    monkeypatch.setattr(user_service.UserService, "get_by_email", AsyncMock(return_value=None))
    hydrated = object()
    reload_user = AsyncMock(return_value=hydrated)
    monkeypatch.setattr(user_service.UserService, "get_by_id", reload_user)
    monkeypatch.setattr(user_service, "hash_password", lambda value: f"hashed:{value}")
    monkeypatch.setattr(user_service, "enqueue_email_event", Mock())

    created = await user_service.UserService.create(
        db,
        email="Reload@Example.test",
        password="TempPass1",
        full_name="Reloaded User",
    )

    assert created is hydrated
    reload_user.assert_awaited_once()
