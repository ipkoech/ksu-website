from __future__ import annotations

import uuid

from ksu_common.auth import TokenPayload
from ksu_common.rbac import AuthorizationScope, authorize


def _token(*, roles: list[str] | None = None, permissions: list[str] | None = None) -> TokenPayload:
    return TokenPayload(
        sub=str(uuid.uuid4()),
        jti=str(uuid.uuid4()),
        roles=roles or [],
        raw={"permissions": permissions or []},
    )


def test_authorize_normalizes_role_aliases_and_permission_separators() -> None:
    decision = authorize(_token(roles=["SUPER_ADMIN"]), "view", "users")

    assert decision.allowed is True
    assert decision.reason == "allowed"
    assert decision.matched_permission == "admin:*"


def test_authorize_matches_resource_wildcards_for_known_permissions() -> None:
    decision = authorize(_token(permissions=["library:*"]), "write", "library")

    assert decision.allowed is True
    assert decision.matched_permission == "library:*"


def test_authorize_normalizes_legacy_permission_names_before_known_permission_checks() -> None:
    decision = authorize(_token(permissions=["settings:manage"]), "manage", "settings")

    assert decision.allowed is True
    assert decision.matched_permission == "settings:manage"


def test_authorize_denies_unknown_permissions_even_for_administrators() -> None:
    decision = authorize(_token(roles=["admin"]), "delete", "unrecognized_resource")

    assert decision.allowed is False
    assert decision.reason == "unknown_permission"
    assert decision.matched_permission is None


def test_authorize_denies_a_valid_permission_without_a_matching_grant() -> None:
    decision = authorize(_token(permissions=["research.view"]), "manage_projects", "research")

    assert decision.allowed is False
    assert decision.reason == "missing_permission"
    assert decision.matched_permission is None


def test_authorize_denies_an_unknown_scope_type() -> None:
    decision = authorize(
        _token(permissions=["library.write"]),
        "write",
        "library",
        AuthorizationScope(scope_type="unrecognized_scope", scope_id=uuid.uuid4()),
    )

    assert decision.allowed is False
    assert decision.reason == "unknown_scope"
