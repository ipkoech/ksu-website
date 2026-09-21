import time
from uuid import uuid4

import pytest
from fastapi import HTTPException
from ksu_common.auth import TokenPayload

from app.core.auth import require_library_transfer


@pytest.mark.parametrize("permissions, target_grant, assurance, allowed", [
    (["library.write"], True, True, False),
    (["library.transfer"], False, True, False),
    (["library.transfer"], True, False, False),
    (["library.transfer"], True, True, True),
])
def test_transfer_requires_both_scopes_and_recent_assurance(permissions, target_grant, assurance, allowed):
    source, target = uuid4(), uuid4()
    grants = [{"scope_type": "library", "scope_id": str(source), "permissions": permissions}]
    if target_grant:
        grants.append({"scope_type": "library", "scope_id": str(target), "permissions": permissions})
    user = TokenPayload("real-actor", "session", raw={
        "scope_grants": grants, "mfa_enabled": assurance, "mfa_verified_at": time.time(),
    })
    if allowed:
        require_library_transfer(user, source, target)
        assert user.sub == "real-actor"
    else:
        with pytest.raises(HTTPException) as error:
            require_library_transfer(user, source, target)
        assert error.value.status_code == 403


def test_same_owner_is_not_a_transfer_and_central_requires_global_authority():
    branch = uuid4()
    user = TokenPayload("actor", "session", raw={"scope_grants": [{
        "scope_type": "library", "scope_id": str(branch), "permissions": ["library.transfer"],
    }], "mfa_enabled": True, "mfa_verified_at": time.time()})
    require_library_transfer(user, branch, branch)
    with pytest.raises(HTTPException):
        require_library_transfer(user, branch, None)
