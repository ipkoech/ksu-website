"""Shared lifecycle checks for role assignments."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any


def is_role_assignment_current(
    assignment: Any,
    *,
    now: datetime | None = None,
) -> bool:
    """Return whether an assignment is enabled and has not expired.

    PostgreSQL normally returns aware timestamps for ``timezone=True`` columns,
    but SQLite fixtures and historical rows can contain naive UTC values. Treat
    those consistently as UTC instead of raising during authorization.
    """
    if not getattr(assignment, "is_active", True):
        return False

    expires_at = getattr(assignment, "expires_at", None)
    if expires_at is None:
        return True
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    current_time = now or datetime.now(timezone.utc)
    if current_time.tzinfo is None:
        current_time = current_time.replace(tzinfo=timezone.utc)
    return expires_at > current_time


__all__ = ["is_role_assignment_current"]
