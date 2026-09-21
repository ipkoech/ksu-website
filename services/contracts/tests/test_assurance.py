import time

import pytest
from fastapi import HTTPException
from ksu_common.auth import TokenPayload

from ksu_contracts.assurance import require_operation_assurance
from ksu_contracts.rbac import build_scope_dependency


@pytest.mark.parametrize("permission", ["users.view", "roles.manage", "content.publish", "heri.settings.read"])
def test_privileged_operation_requires_assurance_even_for_global_authority(permission):
    actor = TokenPayload("real-actor", "session", raw={"scope_grants": [
        {"scope_type": "global", "permissions": ["platform.admin"]},
    ]})
    with pytest.raises(HTTPException):
        require_operation_assurance(actor, permission)
    actor.raw.update(mfa_enabled=True, mfa_verified_at=time.time())
    require_operation_assurance(actor, permission)
    assert actor.sub == "real-actor"


def test_permission_dependency_denies_password_only_publisher():
    actor = TokenPayload("actor", "session", raw={"scope_grants": [
        {"scope_type": "global", "permissions": ["content.publish"]},
    ]})
    dependency = build_scope_dependency(lambda: actor)("content.publish")
    with pytest.raises(HTTPException) as denied:
        dependency(actor)
    assert denied.value.headers["X-Authentication-Action"] == "enroll"
    actor.raw.update(mfa_enabled=True, mfa_verified_at=time.time())
    assert dependency(actor) is actor


def test_ordinary_edit_retains_assignment_only_authentication():
    require_operation_assurance(TokenPayload("actor", "session"), "stories.edit")
