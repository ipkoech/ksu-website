import pytest

from ksu_common.auth import TokenPayload
from ksu_contracts.workspaces import ScopeChoice, Workspace, workspace_context


def actor(grants):
    return TokenPayload("real-user", "session", raw={"scope_grants": grants})


def test_nine_workspaces_and_self_profile_is_not_a_workspace():
    assert len(Workspace) == 9
    for workspace in Workspace:
        with pytest.raises(PermissionError):
            workspace_context(actor([]), workspace)


def test_selected_school_does_not_union_another_schools_capabilities():
    user = actor([
        {"scope_type": "school", "scope_id": "one", "permissions": ["school.profile.view"]},
        {"scope_type": "school", "scope_id": "two", "permissions": ["school.profile.manage"]},
    ])
    context = workspace_context(user, Workspace.SCHOOL, ScopeChoice(scope_type="school", scope_id="one"))
    assert context.capabilities == ["school.profile.view"]
    assert context.actor_id == "real-user"
    with pytest.raises(PermissionError):
        workspace_context(user, Workspace.SCHOOL, ScopeChoice(scope_type="school", scope_id="foreign"))


def test_platform_context_preserves_actual_actor():
    user = actor([{"scope_type": "global", "permissions": ["platform.admin"]}])
    for workspace in Workspace:
        assert workspace_context(user, workspace).actor_id == "real-user"


@pytest.mark.parametrize("scope_type, scope_id", [
    ("invented", "one"), ("school", None), ("global", "one"), ("club", "one"),
])
def test_platform_context_rejects_invalid_school_selection(scope_type, scope_id):
    user = actor([{"scope_type": "global", "permissions": ["platform.admin"]}])
    with pytest.raises(PermissionError, match="Invalid selected scope"):
        workspace_context(user, Workspace.SCHOOL, ScopeChoice(scope_type=scope_type, scope_id=scope_id))


@pytest.mark.parametrize("domain", ["innovation", "farm", "sustainability"])
def test_restricted_research_entry(domain):
    permission = "innovation.manage_ecosystem" if domain == "innovation" else f"{domain}.view"
    user = actor([{"scope_type": "research_domain", "scope_id": domain, "permissions": [permission]}])
    context = workspace_context(user, Workspace.RESEARCH, ScopeChoice(scope_type="research_domain", scope_id=domain))
    assert context.capabilities == [permission]
    assert context.sub_workspaces == [domain]


def test_unrelated_management_permission_does_not_grant_platform_entry():
    with pytest.raises(PermissionError):
        workspace_context(actor([{"scope_type": "global", "permissions": ["settings.manage"]}]), Workspace.WEB_MASTER)


def test_malformed_global_grant_does_not_grant_platform_authority():
    from ksu_contracts.workspaces import has_platform_authority
    assert not has_platform_authority(actor([{
        "scope_type": "global", "scope_id": "foreign", "permissions": ["platform.admin"],
    }]))
