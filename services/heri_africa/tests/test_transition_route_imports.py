from __future__ import annotations

from ksu_common.rbac import authorize_permission as shared_authorize_permission

from app.routes.v1 import admin_content


def test_transition_route_uses_the_shared_authorization_evaluator() -> None:
    assert admin_content.authorize_permission is shared_authorize_permission
