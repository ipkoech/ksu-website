from unittest.mock import AsyncMock, Mock
from uuid import uuid4

import pytest
from ksu_common.auth import TokenPayload
from ksu_contracts.workspaces import ScopeChoice, Workspace, workspace_context

from app.security.workspace_scopes import active_workspace_actor


@pytest.mark.asyncio
async def test_context_filters_unavailable_scopes_without_mutating_identity_snapshot():
    available, inactive = uuid4(), uuid4()
    grants = [{"scope_type": "school", "scope_id": str(identifier),
               "permissions": ["school.profile.view"]} for identifier in (available, inactive)]
    user = TokenPayload("actor", "session", raw={"scope_grants": grants})
    db = Mock(scalars=AsyncMock(return_value=Mock(all=Mock(return_value=[available]))))
    filtered = await active_workspace_actor(db, user)
    context = workspace_context(filtered, Workspace.SCHOOL)
    assert [scope.scope_id for scope in context.scopes] == [str(available)]
    assert context.actor_id == user.sub and filtered.jti == user.jti
    assert user.raw["scope_grants"] == grants and len(grants) == 2
    db.scalars.assert_awaited_once()
    sql = str(db.scalars.call_args.args[0])
    assert "schools.is_active IS true" in sql and "schools.deleted_at IS NULL" in sql


@pytest.mark.asyncio
@pytest.mark.parametrize("selected_id", [str(uuid4()), "malformed"])
async def test_platform_cannot_select_unavailable_local_scope(selected_id):
    user = TokenPayload("actor", "session", raw={"scope_grants": [
        {"scope_type": "global", "permissions": ["platform.admin"]},
    ]})
    db = Mock(scalars=AsyncMock(return_value=Mock(all=Mock(return_value=[]))))
    with pytest.raises(PermissionError, match="inactive or unavailable"):
        await active_workspace_actor(db, user, ScopeChoice(scope_type="school", scope_id=selected_id))
