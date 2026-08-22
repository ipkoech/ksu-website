"""Regression coverage for role-assignment expiration enforcement."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

from app.deps import permissions_for_user
from app.security.role_assignments import is_role_assignment_current
from app.security.scopes import user_scoped_grants


NOW = datetime(2026, 8, 10, 12, 0, tzinfo=timezone.utc)


def _assignment(*, expires_at, is_active=True):
    permission = SimpleNamespace(name="users.edit", is_active=True)
    role_permission = SimpleNamespace(permission=permission)
    role = SimpleNamespace(
        name="system_admin",
        is_active=True,
        role_permissions=[role_permission],
        permissions=["users.edit"],
    )
    return SimpleNamespace(
        is_active=is_active,
        expires_at=expires_at,
        role=role,
        scope_type=None,
        scope_id=None,
    )


def _user(assignment):
    return SimpleNamespace(role_assignments=[assignment], person=None)


def test_role_assignment_lifecycle_handles_aware_and_naive_timestamps():
    assert is_role_assignment_current(_assignment(expires_at=None), now=NOW)
    assert is_role_assignment_current(_assignment(expires_at=NOW + timedelta(seconds=1)), now=NOW)
    assert not is_role_assignment_current(_assignment(expires_at=NOW), now=NOW)
    assert not is_role_assignment_current(_assignment(expires_at=NOW - timedelta(seconds=1)), now=NOW)
    assert not is_role_assignment_current(
        _assignment(expires_at=(NOW - timedelta(seconds=1)).replace(tzinfo=None)),
        now=NOW,
    )
    assert not is_role_assignment_current(_assignment(expires_at=None, is_active=False), now=NOW)


def test_expired_assignment_does_not_create_scoped_grants():
    user = _user(_assignment(expires_at=datetime.now(timezone.utc) - timedelta(minutes=1)))
    assert user_scoped_grants(user) == []


def test_expired_assignment_does_not_grant_main_route_permissions():
    user = _user(_assignment(expires_at=datetime.now(timezone.utc) - timedelta(minutes=1)))
    assert permissions_for_user(user) == set()


def test_future_assignment_remains_authorized():
    user = _user(_assignment(expires_at=datetime.now(timezone.utc) + timedelta(minutes=1)))
    assert permissions_for_user(user) == {"users.edit"}
    assert [grant.permissions for grant in user_scoped_grants(user)] == [frozenset({"users.edit"})]
