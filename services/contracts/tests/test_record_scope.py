import pytest

from ksu_contracts.rbac import AuthorizationScope, authorize_permission


@pytest.mark.parametrize("grants,allowed", [
    ([], False),
    (None, False),
    ([{"scope_type": "library", "scope_id": "other", "permissions": ["library.write"]}], False),
    ([{"scope_type": "library", "scope_id": "branch", "permissions": ["library.write"]}], True),
    ([{"scope_type": "global", "permissions": ["library.write"]}], True),
    ([{"scope_type": "university", "permissions": ["library.write"]}], True),
    ([{"scope_type": "global", "permissions": ["users.view"]}], False),
])
def test_explicit_record_grants(grants, allowed):
    subject = {"permissions": ["library.write"], "scope_grants": grants}
    decision = authorize_permission(subject, "library.write", AuthorizationScope("library", "branch"))
    assert decision.allowed is allowed


def test_mixed_global_and_local_grants_preserve_global_permission():
    subject = {"scope_grants": [
        {"scope_type": "library", "scope_id": "other", "permissions": ["library.write"]},
        {"scope_type": "global", "permissions": ["library.write"]},
    ]}
    assert authorize_permission(subject, "library.write", AuthorizationScope("library", "branch")).allowed


@pytest.mark.parametrize("value", [{"users.manage": False}, "users.manage", 1, True])
def test_malformed_permission_collections_cannot_grant_access(value):
    assert not authorize_permission({"permissions": value}, "users.manage").allowed
    assert not authorize_permission({"scopes": value}, "users.manage").allowed


@pytest.mark.parametrize("grants", [1, True, "global", {"scope_type": "global", "permissions": ["library.write"]}])
def test_malformed_scope_grants_deny_record_access_without_throwing(grants):
    subject = {"permissions": ["library.write"], "scope_grants": grants}
    assert not authorize_permission(subject, "library.write", AuthorizationScope("library", "branch")).allowed


def test_permission_mapping_inside_global_grant_is_not_a_permission_list():
    subject = {"scope_grants": [{"scope_type": "global", "permissions": {"library.write": False}}]}
    assert not authorize_permission(subject, "library.write", AuthorizationScope("library", "branch")).allowed


@pytest.mark.parametrize("scope_type", [None, "", "   ", False, 0, {}, [], "unknown"])
def test_invalid_scope_type_is_never_promoted_to_global(scope_type):
    subject = {"scope_grants": [{"scope_type": scope_type, "scope_id": "other",
                                 "permissions": ["library.write"]}]}
    assert not authorize_permission(subject, "library.write", AuthorizationScope("library", "branch")).allowed


def test_omitted_grant_scope_type_and_invalid_target_scope_deny_access():
    subject = {"scope_grants": [{"permissions": ["library.write"]}]}
    assert not authorize_permission(subject, "library.write", AuthorizationScope("library", "branch")).allowed
    global_subject = {"scope_grants": [{"scope_type": "global", "permissions": ["library.write"]}]}
    assert not authorize_permission(global_subject, "library.write", AuthorizationScope(None, "branch")).allowed
