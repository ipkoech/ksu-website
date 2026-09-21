from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock
from uuid import uuid4

import pytest
from fastapi import HTTPException
from ksu_common.auth import TokenPayload

from app.schemas.assistant import LibraryAssistantStaffAssignmentUpdate, LibraryAssistantStaffReplyCreate, LibraryAssistantStaffStatusUpdate
from app.services import assistant_staff as svc


@pytest.mark.asyncio
@pytest.mark.parametrize("linked, staff", [(False, False), (True, False), (True, True)])
async def test_reply_preserves_account_identity_without_inventing_person_assignment(monkeypatch, linked, staff):
    branch, account, person = uuid4(), uuid4(), uuid4()
    conversation = SimpleNamespace(id=uuid4(), library_id=branch, status="active",
                                   assigned_to_person_id=None, messages=[], verified_email=None)
    monkeypatch.setattr(svc, "_get_conversation", AsyncMock(return_value=conversation))
    monkeypatch.setattr(svc, "_conversation_data", lambda value: {})
    actor = TokenPayload(str(account), "session", raw={
        "person_id": str(person) if linked else None,
        "scope_grants": [{"scope_type": "library", "scope_id": str(branch), "permissions": [
            "library.assistant.conversations.view", "library.assistant.conversations.reply",
        ]}],
    })
    db = SimpleNamespace(add=Mock(), flush=AsyncMock(), scalar=AsyncMock(return_value=uuid4() if staff else None))
    await svc.reply_to_conversation(db, actor, conversation.id, LibraryAssistantStaffReplyCreate(content="Reply"))
    message = db.add.call_args.args[0]
    assert message.sender_person_id == (person if linked else None)
    assert message.message_metadata["actor_user_id"] == str(account)
    assert conversation.assigned_to_person_id == (person if linked and staff else None)


@pytest.mark.asyncio
@pytest.mark.parametrize("permissions, own, allowed", [
    (["library.read", "library.write"], True, False),
    (["library.assistant.conversations.manage"], True, False),
    (["library.assistant.conversations.view", "library.assistant.conversations.manage"], False, False),
    (["library.assistant.conversations.view", "library.assistant.conversations.manage"], True, True),
])
async def test_assignment_requires_private_view_and_management_in_current_branch(monkeypatch, permissions, own, allowed):
    branch = uuid4()
    conversation = SimpleNamespace(library_id=branch, status="active", assigned_to_person_id=None)
    loader = AsyncMock(return_value=conversation)
    monkeypatch.setattr(svc, "_get_conversation", loader)
    monkeypatch.setattr(svc, "_conversation_data", lambda value: {"status": value.status})
    actor = TokenPayload(str(uuid4()), "session", raw={"scope_grants": [{
        "scope_type": "library", "scope_id": str(branch if own else uuid4()), "permissions": permissions,
    }]})
    db = SimpleNamespace(flush=AsyncMock(), scalar=AsyncMock(return_value=None))
    if allowed:
        with pytest.raises(ValueError, match="active staff"):
            await svc.assign_conversation(db, actor, uuid4(), LibraryAssistantStaffAssignmentUpdate(assigned_to_person_id=uuid4()))
        result = await svc.assign_conversation(db, actor, uuid4(), LibraryAssistantStaffAssignmentUpdate())
        assert result["status"] == "awaiting_librarian"
    else:
        with pytest.raises(HTTPException) as error:
            await svc.assign_conversation(db, actor, uuid4(), LibraryAssistantStaffAssignmentUpdate())
        assert error.value.status_code == 403 and conversation.status == "active"
    assert loader.call_args.kwargs["for_update"] is True


@pytest.mark.asyncio
@pytest.mark.parametrize("current, command, value, allowed", [
    ("active", "status", "librarian_replied", False),
    ("active", "status", "assigned", False),
    ("closed", "reply", "Reply", False),
    ("resolved", "assign", None, False),
    ("active", "reply", "   ", False),
    ("closed", "status", "active", True),
])
async def test_staff_workflow_commands_preserve_status_evidence(monkeypatch, current, command, value, allowed):
    branch = uuid4()
    conversation = SimpleNamespace(library_id=branch, status=current, assigned_to_person_id=None)
    monkeypatch.setattr(svc, "_get_conversation", AsyncMock(return_value=conversation))
    monkeypatch.setattr(svc, "_conversation_data", lambda record: {"status": record.status})
    actor = TokenPayload(str(uuid4()), "session", raw={"scope_grants": [{
        "scope_type": "library", "scope_id": str(branch), "permissions": [
            f"library.assistant.conversations.{action}" for action in ("view", "manage", "reply")],
    }]})
    db = SimpleNamespace(flush=AsyncMock())
    async def invoke():
        if command == "status":
            return await svc.update_status(db, actor, uuid4(), LibraryAssistantStaffStatusUpdate(status=value))
        if command == "reply":
            return await svc.reply_to_conversation(db, actor, uuid4(), LibraryAssistantStaffReplyCreate(content=value))
        return await svc.assign_conversation(db, actor, uuid4(), LibraryAssistantStaffAssignmentUpdate())
    if allowed:
        assert await invoke() == {"status": value}
    else:
        with pytest.raises((HTTPException, ValueError)):
            await invoke()
        assert conversation.status == current
        db.flush.assert_not_awaited()
