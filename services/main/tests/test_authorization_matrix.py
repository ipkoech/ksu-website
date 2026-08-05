from __future__ import annotations

import asyncio
import uuid
from types import SimpleNamespace

from app.security.scopes import authorize_scope


def _permission(name: str) -> SimpleNamespace:
    return SimpleNamespace(name=name, is_active=True)


def _user(*, permissions: list[str], scope_type: str | None = None, scope_id: uuid.UUID | None = None) -> SimpleNamespace:
    role = SimpleNamespace(
        is_active=True,
        role_permissions=[SimpleNamespace(permission=_permission(name)) for name in permissions],
        permissions=[],
    )
    assignment = SimpleNamespace(role=role, is_active=True, scope_type=scope_type, scope_id=scope_id)
    return SimpleNamespace(role_assignments=[assignment], person=SimpleNamespace(assignments=[]))


def _decision(user: SimpleNamespace, target_scope_id: uuid.UUID) -> object:
    return asyncio.run(
        authorize_scope(
            None,
            user,
            "staff.manage_assignments",
            "wing",
            target_scope_id,
        )
    )


def test_main_sensitive_scope_matrix_denies_missing_permission() -> None:
    decision = _decision(_user(permissions=[]), uuid.uuid4())

    assert decision.allowed is False
    assert decision.reason == "missing_permission"


def test_main_sensitive_scope_matrix_denies_wrong_scope() -> None:
    decision = _decision(
        _user(
            permissions=["staff.manage_assignments"],
            scope_type="wing",
            scope_id=uuid.uuid4(),
        ),
        uuid.uuid4(),
    )

    assert decision.allowed is False
    assert decision.reason == "scope_mismatch"


def test_main_sensitive_scope_matrix_allows_matching_scope() -> None:
    wing_id = uuid.uuid4()
    decision = _decision(
        _user(
            permissions=["staff.manage_assignments"],
            scope_type="wing",
            scope_id=wing_id,
        ),
        wing_id,
    )

    assert decision.allowed is True
    assert decision.matched_permission == "staff.manage_assignments"


def test_main_sensitive_scope_matrix_allows_administrator_override() -> None:
    decision = _decision(_user(permissions=["admin:*"]), uuid.uuid4())

    assert decision.allowed is True
    assert decision.matched_permission == "admin:*"
