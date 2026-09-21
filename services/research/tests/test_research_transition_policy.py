from types import SimpleNamespace
import time
from unittest.mock import AsyncMock, Mock
from uuid import uuid4

import pytest
from fastapi import HTTPException
from ksu_common.auth import TokenPayload

from app.models import Partner
from app.routes.v1 import workflow


@pytest.mark.asyncio
@pytest.mark.parametrize("permissions,kind,current,target,expected", [
    (["farm.view"], "community", "draft", "pending", 403),
    (["farm.submit"], "community", "draft", "pending", None),
    (["farm.review"], "community", "pending", "published", 403),
    (["farm.publish"], "community", "pending", "published", 403),
    (["farm.review", "farm.publish"], "community", "pending", "published", None),
    (["farm.review", "farm.publish"], "community", "active", "published", 409),
    (["farm.review", "farm.publish", "sustainability.view"], "sustainability", "pending", "published", 403),
    (["farm.review"], "community", "active", "rejected", 403),
    (["farm.publish"], "community", "active", "rejected", None),
])
async def test_canonical_transition_checks_action_state_and_locked_record(monkeypatch, permissions, kind, current, target, expected):
    record = Partner(id=uuid4(), name="Partner", partner_type=kind, status=current, is_active=current == "active")
    monkeypatch.setattr(workflow, "_resolve_service", lambda resource: SimpleNamespace(model=Partner))
    db = AsyncMock()
    db.add = Mock()
    db.execute.return_value = SimpleNamespace(scalar_one_or_none=lambda: record)
    actor = TokenPayload("real-user", "session", raw={"mfa_enabled": True, "mfa_verified_at": time.time(), "scope_grants": [
        {"scope_type": "global", "permissions": permissions},
    ]})
    if expected:
        with pytest.raises(HTTPException) as error:
            await workflow._transition(db, actor, "partners", record.id, target, require_review_authority=target != "pending")
        assert error.value.status_code == expected
        assert record.status == current
        db.flush.assert_not_awaited()
        db.add.assert_not_called()
    else:
        await workflow._transition(db, actor, "partners", record.id, target, require_review_authority=target != "pending")
        assert workflow.workflow_state("partners", record) == target
        db.flush.assert_awaited_once()
        event = db.add.call_args.args[0]
        assert event.actor_id == actor.sub
        assert event.resource_id == record.id
        assert event.target_state == target
    assert "FOR UPDATE" in str(db.execute.call_args.args[0])


@pytest.mark.asyncio
@pytest.mark.parametrize("current,target", [("pending", "published"), ("active", "rejected")])
async def test_direct_command_requires_step_up_before_changing_public_visibility(monkeypatch, current, target):
    record = Partner(id=uuid4(), name="Partner", partner_type="community", status=current, is_active=current == "active")
    monkeypatch.setattr(workflow, "_resolve_service", lambda _: SimpleNamespace(model=Partner))
    actor = TokenPayload("publisher", "session", raw={"scope_grants": [
        {"scope_type": "global", "permissions": ["farm.review", "farm.publish"]},
    ]})
    db = AsyncMock()
    db.add = Mock()
    db.execute.return_value = SimpleNamespace(scalar_one_or_none=lambda: record)
    with pytest.raises(HTTPException) as denied:
        await workflow._transition(db, actor, "partners", record.id, target, require_review_authority=True)
    assert denied.value.status_code == 403
    assert record.status == current
    db.add.assert_not_called()
    db.flush.assert_not_awaited()
