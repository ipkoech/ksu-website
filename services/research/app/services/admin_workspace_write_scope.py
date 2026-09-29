"""Derive native mutation ownership targets without granting any authority.

The CRUD handlers feed every target to the existing require_scoped_record guard.
An omitted center is different from an explicit null: clearing ownership must
be authorized for the unassigned scope as well as for the stored center.
"""
from __future__ import annotations

from typing import Any


def create_scope_targets(resource: str, model: Any, data: Any) -> tuple[Any, ...]:
    """A newly allocated center cannot be authorized by an existing center ID."""
    if resource == "centers":
        return (None,)
    center_id = getattr(data, "center_id", None)
    if hasattr(model, "center_id") or center_id is not None:
        return (center_id,)
    return ()


def mutation_scope_targets(
    resource: str, model: Any, record: Any, data: Any = None,
) -> tuple[Any, ...]:
    """Return stored ownership first, followed by explicitly changed ownership.

    Call this after taking the record lock. The scope guard must be evaluated
    separately for each target, including None; a broad grant from one field
    must never be inferred from a scoped grant on another field.
    """
    if resource == "centers":
        return (record.id,)
    current = getattr(record, "center_id", None)
    if not hasattr(model, "center_id") and current is None:
        return ()
    targets = [current]
    if data is not None and "center_id" in data.model_fields_set:
        destination = data.center_id
        if destination != current:
            targets.append(destination)
    return tuple(targets)
