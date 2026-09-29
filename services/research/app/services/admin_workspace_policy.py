"""Fail-closed composition of existing, signed Research ownership decisions.

This module does not grant permissions: callers supply decisions made by the
shared RBAC and Research domain policies. Invalid ownership columns never turn
into unrestricted reads.
"""
from collections.abc import Callable, Iterable, Mapping
from typing import Any


def merge_read_filters(
    decisions: Iterable[Mapping[str, Any]], columns: set[str],
) -> dict[str, Any]:
    alternatives: list[dict[str, Any]] = []
    for decision in decisions:
        if not decision:
            return {}
        for candidate in decision.get("__domain_any__", []):
            if not isinstance(candidate, Mapping) or not candidate:
                continue
            if not set(candidate).issubset(columns):
                continue
            if any(value is None for value in candidate.values()):
                continue
            normalized = dict(candidate)
            if normalized not in alternatives:
                alternatives.append(normalized)
    if not alternatives:
        raise PermissionError("No supported ownership grant for this resource")
    return {"__domain_any__": alternatives}


def editorial_actions(state: str | None, *, edit: bool, submit: bool,
                      review: bool, publish: bool, history: bool) -> dict[str, bool]:
    """Presentation of the canonical transition rules; commands reauthorize."""
    return {
        "edit": edit and state not in {"pending", "published"},
        "submit": submit and state in {"draft", "rejected"},
        "approve": review and publish and state == "pending",
        "reject": review and state == "pending",
        "unpublish": publish and state == "published",
        "history": history and state is not None,
    }


def direct_read_decisions(grants: Iterable[object], permissions: tuple[str, ...],
                          authorize: Callable[[dict, str], bool]) -> list[dict]:
    """Bind a read permission and ownership to the same signed grant."""
    decisions = []
    for grant in grants:
        if not isinstance(grant, dict):
            continue
        if not any(authorize(grant, permission) for permission in permissions):
            continue
        if grant.get("scope_type") in {"global", "university"}:
            decisions.append({})
        elif grant.get("scope_type") == "research" and grant.get("scope_id"):
            decisions.append({"__domain_any__": [{"center_id": str(grant["scope_id"])}]})
    return decisions
