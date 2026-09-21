from copy import deepcopy
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock
from uuid import uuid4

import pytest
from fastapi import HTTPException
from ksu_common.auth import TokenPayload
from ksu_contracts.workspaces import ScopeChoice, Workspace
from app.services import workspace_access as visits


@pytest.mark.asyncio
async def test_switch_and_exit_preserve_identity_and_other_context(monkeypatch):
    actor = TokenPayload(str(uuid4()), "login-session", raw={"scope_grants": [
        {"scope_type": "library", "scope_id": scope, "permissions": [permission]}
        for scope, permission in [("one", "library.read"), ("two", "library.write")]
    ]})
    before = deepcopy(actor.raw)
    db = Mock(execute=AsyncMock())
    audit = AsyncMock()
    monkeypatch.setattr(visits, "capture_request_audit", audit)
    request = SimpleNamespace(method="POST", url=SimpleNamespace(path="/workspaces"), state=SimpleNamespace())
    first = await visits.visit_workspace(db, actor, Workspace.LIBRARY,
        visits.WorkspaceVisit(scope=ScopeChoice(scope_type="library", scope_id="one")), request)
    second = await visits.visit_workspace(db, actor, Workspace.LIBRARY,
        visits.WorkspaceVisit(scope=ScopeChoice(scope_type="library", scope_id="two"), previous_visit_id=first.visit_id), request)
    await visits.visit_workspace(db, actor, Workspace.LIBRARY,
        visits.WorkspaceVisit(scope=second.context.selected_scope, visit_id=second.visit_id), request, exiting=True)
    assert set(first.context.capabilities) == {"library.read", "library.view"}
    assert second.context.capabilities == ["library.write"]
    assert actor.raw == before and actor.jti == "login-session"
    assert db.execute.await_count == 2
    assert [call.args[1]["action"] for call in audit.await_args_list] == ["workspace.enter", "workspace.switch", "workspace.exit"]
    assert all(call.args[1]["user_id"] == actor.sub for call in audit.await_args_list)


@pytest.mark.asyncio
@pytest.mark.parametrize("scope", [None, "foreign"])
async def test_denied_selection_is_audited_without_saving_preference(monkeypatch, scope):
    actor = TokenPayload(str(uuid4()), "session", raw={"scope_grants": [
        {"scope_type": "library", "scope_id": value, "permissions": ["library.read"]}
        for value in ("one", "two")
    ]})
    db = Mock(execute=AsyncMock())
    audit = AsyncMock()
    monkeypatch.setattr(visits, "dispatch_audit", audit)
    request = SimpleNamespace(method="POST", url=SimpleNamespace(path="/workspaces"), state=SimpleNamespace())
    with pytest.raises(HTTPException) as error:
        await visits.visit_workspace(db, actor, Workspace.LIBRARY,
            visits.WorkspaceVisit(scope=ScopeChoice(scope_type="library", scope_id=scope) if scope else None), request)
    assert error.value.status_code == 403
    assert audit.await_args.args[0]["details"]["outcome"] == "denied"
    db.execute.assert_not_awaited()


@pytest.mark.asyncio
async def test_stale_preference_cannot_restore_access():
    db = Mock(scalar=AsyncMock(return_value={"workspace": "library-admin", "scope": {
        "scope_type": "library", "scope_id": "revoked"}}))
    actor = TokenPayload(str(uuid4()), "session", raw={"scope_grants": []})
    assert await visits.preferred_workspace(db, actor) is None


@pytest.mark.parametrize("permission", ["users.create", "users.edit", "roles.manage", "permissions.manage", "school.team.roles"])
def test_provisioning_requires_explicit_platform_authority(permission):
    from app.deps import require_account_authority
    actor = TokenPayload(str(uuid4()), "session", raw={"scope_grants": [
        {"scope_type": "global", "permissions": [permission]},
    ]})
    with pytest.raises(HTTPException):
        require_account_authority(actor, permission)
    actor.raw["scope_grants"][0]["permissions"].append("platform.admin")
    require_account_authority(actor, permission)


@pytest.mark.asyncio
async def test_school_role_provisioning_accepts_multiple_explicit_assignments():
    from app.services.user import UserService
    db = Mock(execute=AsyncMock())
    user_id = uuid4()
    role = SimpleNamespace(name="school_admin")
    for school_id in (uuid4(), uuid4()):
        await UserService.validate_school_administration_assignment(
            db, user_id=user_id, role=role, scope_type="school", scope_id=school_id)
    with pytest.raises(ValueError):
        await UserService.validate_school_administration_assignment(
            db, user_id=user_id, role=role, scope_type="school", scope_id=None)
