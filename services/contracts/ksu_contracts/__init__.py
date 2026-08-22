"""Versioned contracts shared by KSU services but excluded from the kernel."""

from .rbac import (
    AuthorizationDecision,
    AuthorizationScope,
    authorize,
    authorize_permission,
    build_scope_dependency,
    get_role_scopes,
    has_scope,
    normalize_permission,
)
from .roles import ALL_PERMISSIONS, ROLE_DEFINITIONS, RoleDefinition, normalize_role_name

__all__ = [
    "ALL_PERMISSIONS",
    "ROLE_DEFINITIONS",
    "AuthorizationDecision",
    "AuthorizationScope",
    "RoleDefinition",
    "authorize",
    "authorize_permission",
    "build_scope_dependency",
    "get_role_scopes",
    "has_scope",
    "normalize_permission",
    "normalize_role_name",
]
