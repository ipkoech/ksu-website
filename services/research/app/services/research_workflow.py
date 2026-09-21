"""Research editorial states adapted to each model's public visibility fields.

Boolean-only Farm, FocusArea and ImpactMetric models persist editorial_state.
Other models retain their existing status columns. Public visibility stays in
its original fields; publication changes are made by canonical commands.
Canonical creation and transition commands persist service-owned provenance.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Mapping

from fastapi import HTTPException, status as http_status

DRAFT = "draft"
PENDING = "pending"
PUBLISHED = "published"
REJECTED = "rejected"

#: Stable states exposed by the portal. Boolean-only models store these in
#: editorial_state while keeping their v1 visibility fields unchanged.
WORKFLOW_STATES: tuple[str, ...] = (DRAFT, PENDING, PUBLISHED, REJECTED)

#: Statuses that ``CRUDService.public_statuses`` treats as publicly visible.
#: A workflow state must map onto a value outside this set to stay hidden.
_PUBLIC_STATUS = "active"
_HIDDEN_STATUS = "draft"


@dataclass(frozen=True, slots=True)
class VisibilityAdapter:
    """How one model expresses "hidden" and "public" with its own columns."""

    #: Column flipped to gate visibility, or ``None`` when the model has none.
    boolean_field: str | None
    #: Status column used to gate visibility, or ``None``.
    status_field: str | None
    #: Value of ``status_field`` that reads as published.
    public_status: str = _PUBLIC_STATUS
    #: Value of ``status_field`` that reads as hidden.
    hidden_status: str = _HIDDEN_STATUS
    #: True when the model can record submit/review provenance.
    supports_audit: bool = False

    def is_public(self, record: Any) -> bool:
        if self.boolean_field is not None:
            if not bool(getattr(record, self.boolean_field, False)):
                return False
        if self.status_field is not None:
            current = getattr(record, self.status_field, None)
            if current in (self.hidden_status, PENDING, REJECTED):
                return False
        return True

    def hidden_values(self) -> dict[str, Any]:
        """Column values that hide a record from the public site."""
        values: dict[str, Any] = {}
        if self.boolean_field is not None:
            values[self.boolean_field] = False
        if self.status_field is not None:
            values[self.status_field] = self.hidden_status
        return values

    def public_values(self) -> dict[str, Any]:
        """Column values that publish a record."""
        values: dict[str, Any] = {}
        if self.boolean_field is not None:
            values[self.boolean_field] = True
        if self.status_field is not None:
            values[self.status_field] = self.public_status
        return values


#: Keyed by route resource key (the CRUD router's prefix), matching
#: ``research_domains.DOMAIN_DEFINITIONS``.
VISIBILITY_ADAPTERS: Mapping[str, VisibilityAdapter] = {
    # research_farms has is_public but no status column.
    "farms": VisibilityAdapter(boolean_field="is_public", status_field=None),
    # sustainabilities has status but no is_public column.
    "sustainability": VisibilityAdapter(
        boolean_field=None, status_field="status", public_status="active"
    ),
    # research_projects carries both.
    "projects": VisibilityAdapter(boolean_field="is_public", status_field="status"),
    # partners/stories/events gate on is_active plus status.
    "partners": VisibilityAdapter(boolean_field="is_active", status_field="status"),
    "stories": VisibilityAdapter(
        boolean_field="is_active", status_field="status", public_status="published"
    ),
    "events": VisibilityAdapter(boolean_field="is_active", status_field="status"),
    # focus_areas only has is_active.
    "focus-areas": VisibilityAdapter(boolean_field="is_active", status_field=None),
    "impact-metrics": VisibilityAdapter(boolean_field="is_active", status_field=None),
    # publications is the one model with real provenance columns.
    "publications": VisibilityAdapter(
        boolean_field="is_active",
        status_field="status",
        public_status="published",
        supports_audit=True,
    ),
}


def adapter_for(resource_key: str) -> VisibilityAdapter | None:
    return VISIBILITY_ADAPTERS.get(resource_key)


def workflow_audit_supported(resource_key: str) -> bool:
    """Whether canonical commands persist provenance for this resource.

    Historical rows and changes outside these commands may have no events.
    """
    return resource_key in {"farms", "sustainability", "projects", "partners", "stories",
                            "focus-areas", "publications", "impact-metrics"}


def workflow_state(resource_key: str, record: Any) -> str:
    """Report a stored record's workflow state in the portal's vocabulary."""
    if getattr(record, "editorial_state", None) in WORKFLOW_STATES:
        return record.editorial_state
    adapter = adapter_for(resource_key)
    if adapter is None:
        return PUBLISHED
    if adapter.status_field is not None:
        current = getattr(record, adapter.status_field, None)
        if current == PENDING:
            return PENDING
        if current == REJECTED:
            return REJECTED
    return PUBLISHED if adapter.is_public(record) else DRAFT


def apply_workflow_state(resource_key: str, record: Any, state: str) -> Any:
    """Write the columns that express ``state`` for this model."""
    if state not in WORKFLOW_STATES:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown workflow state '{state}'",
        )
    adapter = adapter_for(resource_key)
    if adapter is None:
        return record
    if hasattr(record, "editorial_state"):
        record.editorial_state = state

    if state == PUBLISHED:
        values = adapter.public_values()
    elif state == PENDING and adapter.status_field is not None:
        # PENDING is only distinguishable on models with a status column;
        # elsewhere it is stored as hidden, exactly like DRAFT.
        values = {**adapter.hidden_values(), adapter.status_field: PENDING}
    elif state == REJECTED and adapter.status_field is not None:
        values = {**adapter.hidden_values(), adapter.status_field: REJECTED}
    else:
        values = adapter.hidden_values()

    for field, value in values.items():
        if hasattr(record, field):
            setattr(record, field, value)
    return record


def hold_for_review(resource_key: str, payload: Any) -> Any:
    """Force a create payload into the pending state.

    Applied to non-admin creates so a new record never reaches the public site
    before somebody with review authority has seen it.
    """
    adapter = adapter_for(resource_key)
    if adapter is None:
        return payload

    values = adapter.hidden_values()
    if adapter.status_field is not None:
        values[adapter.status_field] = PENDING
    for field, value in values.items():
        if hasattr(payload, field):
            try:
                setattr(payload, field, value)
            except (AttributeError, ValueError):  # frozen/validated models
                continue
    return payload


def assert_publish_allowed(can_publish: bool) -> None:
    if not can_publish:
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="Publishing requires review authority",
        )


__all__ = [
    "DRAFT",
    "PENDING",
    "PUBLISHED",
    "REJECTED",
    "VISIBILITY_ADAPTERS",
    "WORKFLOW_STATES",
    "VisibilityAdapter",
    "adapter_for",
    "apply_workflow_state",
    "assert_publish_allowed",
    "hold_for_review",
    "workflow_audit_supported",
    "workflow_state",
]
