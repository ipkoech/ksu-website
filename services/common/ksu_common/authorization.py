"""Canonical authorization interface backed by the shared RBAC evaluator."""

from __future__ import annotations

from .rbac import (
    AuthorizationDecision,
    AuthorizationScope,
    authorize,
    authorize_permission,
    requires_scope,
)


def authorize_exact_scope(
    subject: object,
    permission: str,
    scope: AuthorizationScope,
) -> AuthorizationDecision:
    """Evaluate a declared permission for a service-owned scope.

    The shared evaluator also permits applicable global and university-wide
    grants; this helper does not restrict a decision to an identical scoped
    grant.
    """
    return authorize_permission(subject, permission, scope)


__all__ = [
    "AuthorizationDecision",
    "AuthorizationScope",
    "authorize",
    "authorize_exact_scope",
    "authorize_permission",
    "requires_scope",
]
