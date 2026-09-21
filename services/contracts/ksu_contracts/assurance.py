"""Versioned privileged-operation assurance catalog."""

from ksu_common.assurance import require_recent_mfa

from .rbac import normalize_permission

PRIVILEGED_RESOURCES = frozenset({
    "users", "roles", "permissions", "sessions", "audit", "settings",
    "api_keys", "webhooks", "integrations",
})
PRIVILEGED_ACTIONS = frozenset({"approve", "publish", "unpublish", "schedule", "transfer", "approve_funding"})


def require_operation_assurance(subject, permission):
    resource, _, action = normalize_permission(permission).rpartition(".")
    if resource in PRIVILEGED_RESOURCES or resource.endswith((".settings", ".integrations")) or action in PRIVILEGED_ACTIONS:
        require_recent_mfa(subject)
