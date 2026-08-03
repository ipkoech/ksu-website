"""Field-level before/after snapshots for audited content writes."""

from __future__ import annotations

from contextvars import ContextVar, Token
from typing import Any

TRACKED_SKIP = {"updated_at", "created_at", "plain_text"}

_AUDIT_CONTEXT: ContextVar[dict[str, Any] | None] = ContextVar("audit_context", default=None)


def diff_fields(record: Any, payload: dict[str, Any]) -> dict[str, dict[str, Any]]:
    """Return {field: {"from": old, "to": new}} for fields the payload changes."""
    changes: dict[str, dict[str, Any]] = {}
    for field, new_value in payload.items():
        if field in TRACKED_SKIP or not hasattr(record, field):
            continue
        old_value = getattr(record, field)
        if old_value != new_value:
            changes[field] = {"from": _jsonable(old_value), "to": _jsonable(new_value)}
    return changes


def _jsonable(value: Any) -> Any:
    if hasattr(value, "isoformat"):
        return value.isoformat()
    if isinstance(value, (dict, list, str, int, float, bool)) or value is None:
        return value
    return str(value)


def begin_audit_context() -> Token:
    """Open a request-scoped audit context; the middleware owns its lifecycle."""
    return _AUDIT_CONTEXT.set({"changes": {}})


def reset_audit_context(token: Token) -> None:
    """Close the audit context opened by begin_audit_context."""
    _AUDIT_CONTEXT.reset(token)


def record_audit_changes(changes: dict[str, dict[str, Any]]) -> None:
    """Merge field diffs into the active audit context (no-op without one)."""
    context = _AUDIT_CONTEXT.get()
    if context is not None and changes:
        context["changes"].update(changes)


def collected_audit_changes() -> dict[str, dict[str, Any]] | None:
    """Return the diffs recorded during the current request, if any."""
    context = _AUDIT_CONTEXT.get()
    if context is None or not context["changes"]:
        return None
    return context["changes"]


def track_update(record: Any, payload: dict[str, Any]) -> dict[str, dict[str, Any]]:
    """Diff an update payload against a record and stash it for the audit trail."""
    changes = diff_fields(record, payload)
    record_audit_changes(changes)
    return changes
