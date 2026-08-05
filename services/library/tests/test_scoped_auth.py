import uuid

import pytest
from fastapi import HTTPException
from ksu_common.auth import TokenPayload

from app.core.auth import (
    allowed_library_scope_ids,
    can_access_library_scope,
    require_library_scope,
)


def _payload(*, grants: list[dict] | None = None) -> TokenPayload:
    raw = {
        "permissions": ["library:write", "library:admin", "library:read"],
        "scopes": [],
    }
    if grants is not None:
        raw["scope_grants"] = grants
    return TokenPayload(sub=str(uuid.uuid4()), jti=str(uuid.uuid4()), roles=[], raw=raw)


def test_flat_token_keeps_backwards_compatible_library_access():
    library_id = uuid.uuid4()

    user = _payload()

    assert can_access_library_scope(user, "library:write", library_id) is True
    require_library_scope(user, "library:write", library_id)
    assert allowed_library_scope_ids(user, "library:write") is None


def test_matching_library_grant_allows_branch_record():
    library_id = uuid.uuid4()
    user = _payload(
        grants=[
            {
                "scope_type": "library",
                "scope_id": str(library_id),
                "permissions": ["library:write"],
            }
        ]
    )

    assert can_access_library_scope(user, "library:write", library_id) is True
    assert allowed_library_scope_ids(user, "library:write") == {str(library_id)}


def test_write_grant_does_not_imply_read_permission():
    library_id = uuid.uuid4()
    other_library_id = uuid.uuid4()
    user = _payload(
        grants=[
            {
                "scope_type": "library",
                "scope_id": str(library_id),
                "permissions": ["library:write"],
            }
        ]
    )

    assert can_access_library_scope(user, "library:read", library_id) is False
    assert can_access_library_scope(user, "library:read", other_library_id) is False
    assert allowed_library_scope_ids(user, "library:read") == set()


def test_other_library_grant_rejects_branch_record():
    user = _payload(
        grants=[
            {
                "scope_type": "library",
                "scope_id": str(uuid.uuid4()),
                "permissions": ["library:write"],
            }
        ]
    )

    with pytest.raises(HTTPException) as exc:
        require_library_scope(user, "library:write", uuid.uuid4())

    assert exc.value.status_code == 403


def test_scoped_library_grant_does_not_allow_global_record():
    user = _payload(
        grants=[
            {
                "scope_type": "library",
                "scope_id": str(uuid.uuid4()),
                "permissions": ["library:write"],
            }
        ]
    )

    assert can_access_library_scope(user, "library:write", None) is False


def test_global_grant_allows_any_library_record():
    user = _payload(
        grants=[
            {
                "scope_type": "global",
                "scope_id": None,
                "permissions": ["library:*"],
            }
        ]
    )

    assert can_access_library_scope(user, "library:admin", uuid.uuid4()) is True
    assert can_access_library_scope(user, "library:write", None) is True
    assert allowed_library_scope_ids(user, "library:write") is None
