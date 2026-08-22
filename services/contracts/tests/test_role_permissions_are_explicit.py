"""Canonical roles must never acquire ambiguous wildcard authority."""

from ksu_contracts.rbac import authorize_permission, normalize_permission
from ksu_contracts.roles import ALL_PERMISSIONS, ROLE_DEFINITIONS


def _is_wildcard(permission: str) -> bool:
    return permission == "*" or permission.endswith(":*") or permission.endswith(".*")


def test_permission_catalogue_contains_no_wildcards():
    assert not [permission for permission in ALL_PERMISSIONS if _is_wildcard(permission)]


def test_permission_catalogue_uses_unique_dotted_names():
    assert len(ALL_PERMISSIONS) == len(set(ALL_PERMISSIONS))
    assert not [permission for permission in ALL_PERMISSIONS if ":" in permission]


def test_legacy_permission_aliases_only_grant_their_canonical_permission():
    assert normalize_permission("users:read") == "users.view"
    assert authorize_permission({"permissions": ["users:read"]}, "users.view").allowed
    assert not authorize_permission({"permissions": ["users:read"]}, "users.delete").allowed


def test_every_role_uses_only_explicit_catalogued_permissions():
    catalogue = set(ALL_PERMISSIONS)
    for role_name, definition in ROLE_DEFINITIONS.items():
        assert definition.scopes, f"{role_name} must have at least one permission"
        assert not [permission for permission in definition.scopes if _is_wildcard(permission)]
        assert set(definition.scopes) <= catalogue


def test_admin_is_limited_while_super_admin_is_explicitly_complete():
    assert set(ROLE_DEFINITIONS["super-admin"].scopes) == set(ALL_PERMISSIONS)
    assert set(ROLE_DEFINITIONS["admin"].scopes) < set(ALL_PERMISSIONS)
