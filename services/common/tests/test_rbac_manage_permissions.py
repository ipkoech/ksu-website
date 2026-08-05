from __future__ import annotations

import uuid

import pytest

from ksu_common.auth import TokenPayload
from ksu_common.rbac import authorize


def _token(*, permissions: list[str]) -> TokenPayload:
    return TokenPayload(
        sub=str(uuid.uuid4()),
        jti=str(uuid.uuid4()),
        roles=[],
        raw={"permissions": permissions},
    )


@pytest.mark.parametrize("action", ["review", "publish", "upload", "send", "delete"])
def test_manage_permission_does_not_grant_unrelated_actions(action: str) -> None:
    decision = authorize(_token(permissions=["heri.content.manage"]), action, "heri.content")

    assert decision.allowed is False
    assert decision.reason == "missing_permission"


def test_manage_permission_grants_the_exact_manage_action() -> None:
    decision = authorize(_token(permissions=["heri.content.manage"]), "manage", "heri.content")

    assert decision.allowed is True
    assert decision.matched_permission == "heri.content.manage"
