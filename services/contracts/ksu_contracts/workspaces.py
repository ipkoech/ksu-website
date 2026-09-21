"""Versioned operational views; identities and domain records remain canonical."""

from enum import StrEnum

from pydantic import BaseModel, Field

from .rbac import AuthorizationScope, authorize_permission
from .roles import ALL_PERMISSIONS


class Workspace(StrEnum):
    WEB_MASTER = "web-master"
    COMMUNICATIONS = "communications-admin"
    SCHOOL = "school-admin"
    DEPARTMENT = "department-admin"
    CONTRIBUTOR = "story-contributor"
    LIBRARY = "library-admin"
    RESEARCH = "research-admin"
    HERI = "heri-admin"
    CLUB = "club-admin"


# Available surfaces, not role grants. Every capability is checked against
# current assignments separately. Self-profile remains outside this catalog.
PREFIXES = {
    Workspace.WEB_MASTER: ("users.", "roles.", "permissions.", "sessions.", "security.",
                           "settings.", "analytics.", "audit.", "api_keys.", "webhooks.",
                           "governance.", "administration.", "admissions.", "academic.manage_calendar"),
    Workspace.COMMUNICATIONS: ("content.", "about.", "media.", "marketing.", "newsletter.",
                              "newsletters.", "social.", "navigation.", "page_cms.",
                              "vc.", "vice_chancellor.", "admissions.", "academic.manage_calendar"),
    Workspace.SCHOOL: ("school.",),
    Workspace.DEPARTMENT: ("academic.", "office.", "administration.", "staff.", "media."),
    Workspace.CONTRIBUTOR: ("stories.view_own", "stories.update_own", "stories.submit", "media.upload"),
    Workspace.LIBRARY: ("library.",),
    Workspace.RESEARCH: ("research.", "research_theme.", "research_program.", "publications.",
                         "funding.", "innovation.", "farm.", "sustainability.", "donations.", "partnerships."),
    Workspace.HERI: ("heri.",),
    Workspace.CLUB: ("clubs.view", "clubs.manage_own", "clubs.content_submit",
                     "clubs.events_manage", "clubs.stories_manage", "media.upload"),
}

WORKSPACE_SCOPE_TYPES = {
    Workspace.WEB_MASTER: {"global", "university"},
    Workspace.COMMUNICATIONS: {"global", "university"},
    Workspace.SCHOOL: {"school", "global", "university"},
    Workspace.DEPARTMENT: {"department", "global", "university"},
    Workspace.CONTRIBUTOR: {"self", "global", "university"},
    Workspace.LIBRARY: {"library", "global", "university"},
    Workspace.RESEARCH: {"research", "research_domain", "global", "university"},
    Workspace.HERI: {"heri", "global", "university"},
    Workspace.CLUB: {"club", "global", "university"},
}


class ScopeChoice(BaseModel):
    scope_type: str
    scope_id: str | None = None


class WorkspaceContext(BaseModel):
    workspace: Workspace
    actor_id: str
    scopes: list[ScopeChoice]
    selected_scope: ScopeChoice | None = None
    capabilities: list[str]
    sub_workspaces: list[str] = Field(default_factory=list)
    reporting_capabilities: list[str] = Field(default_factory=list)
    platform_authority: bool = False
    selection_required: bool = False


def has_platform_authority(actor) -> bool:
    return authorize_permission(actor, "platform.admin", AuthorizationScope("global")).allowed


def workspace_context(actor, workspace: Workspace, selected: ScopeChoice | None = None) -> WorkspaceContext:
    if selected and (
        selected.scope_type not in WORKSPACE_SCOPE_TYPES[workspace]
        or (selected.scope_type == "research_domain" and selected.scope_id not in {"innovation", "farm", "sustainability"})
        or (selected.scope_type == "self" and selected.scope_id != actor.sub)
        or (selected.scope_type not in {"global", "university"} and not selected.scope_id)
        or (selected.scope_type in {"global", "university"} and selected.scope_id is not None)
    ):
        raise PermissionError("Invalid selected scope")
    platform = has_platform_authority(actor)
    if workspace == Workspace.WEB_MASTER and not platform:
        raise PermissionError("Workspace is not assigned")
    surface = [name for name in ALL_PERMISSIONS if name.startswith(PREFIXES[workspace])]
    if selected and selected.scope_type == "research_domain":
        surface = [name for name in surface if name.startswith(selected.scope_id + ".")]
    grants = actor.raw.get("scope_grants", [])
    scopes: dict[tuple[str, str | None], ScopeChoice] = {}
    for grant in grants:
        scope_type = grant.get("scope_type")
        scope_id = str(grant["scope_id"]) if grant.get("scope_id") else None
        if scope_type not in WORKSPACE_SCOPE_TYPES[workspace] or (scope_type not in {"global", "university"} and scope_id is None):
            continue
        if scope_type == "research_domain" and scope_id not in {"innovation", "farm", "sustainability"}:
            continue
        if scope_type == "self" and scope_id != actor.sub:
            continue
        if scope_type in {"global", "university"} and scope_id is not None:
            continue
        if platform or any(authorize_permission(grant.get("permissions", []), name).allowed for name in surface):
            scopes[(scope_type, scope_id)] = ScopeChoice(scope_type=scope_type, scope_id=scope_id)
    if selected and not platform and (selected.scope_type, selected.scope_id) not in scopes:
        raise PermissionError("Selected scope is not assigned")
    targets = [selected] if selected else list(scopes.values())
    capabilities = [name for name in surface if platform or any(
        (scope.scope_type != "research_domain" or name.startswith(scope.scope_id + "."))
        and authorize_permission(actor, name, AuthorizationScope(scope.scope_type, scope.scope_id)).allowed
        for scope in targets
    )]
    if not scopes or not capabilities:
        raise PermissionError("Workspace is not assigned")
    return WorkspaceContext(
        workspace=workspace, actor_id=actor.sub, scopes=list(scopes.values()),
        selected_scope=selected, capabilities=capabilities, platform_authority=platform,
        sub_workspaces=[domain for domain in ("innovation", "farm", "sustainability")
                        if workspace == Workspace.RESEARCH and any(name.startswith(domain + ".") for name in capabilities)],
        reporting_capabilities=[name for name in capabilities if any(part in name for part in ("report", "export", "analytics"))],
        selection_required=selected is None and len(scopes) > 1,
    )
