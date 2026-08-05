from __future__ import annotations

import uuid

from ksu_common.auth import TokenPayload
from ksu_common.rbac import authorize_permission


def _token(role: str) -> TokenPayload:
    return TokenPayload(sub=str(uuid.uuid4()), jti=str(uuid.uuid4()), roles=[role], raw={})


def test_heri_roles_are_evaluated_by_shared_explicit_permissions() -> None:
    assert authorize_permission(_token("heri-editor"), "heri.content.write").allowed
    assert authorize_permission(_token("heri-publisher"), "heri.content.publish").allowed
    assert authorize_permission(_token("heri-viewer"), "heri.analytics.read").allowed


def test_heri_role_does_not_infer_undeclared_transition_permission() -> None:
    decision = authorize_permission(_token("heri-editor"), "heri.content.publish")

    assert decision.allowed is False
    assert decision.reason == "missing_permission"
