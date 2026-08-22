"""Review workflow actions for Research Portal records.

Managers submit records for review; reviewers approve, reject, or publish them.
The state is stored in whichever visibility columns the model already has (see
``services/research_workflow.py``), so no schema change was required.

The review queue lives at ``GET /research-workflow/queue``.
"""

from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Body, Depends, HTTPException, Query, status
from ksu_common.schemas.responses import success
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.auth import get_current_user
from ...core.database import get_db
from ...schemas.base import JsonObject, SuccessEnvelope
from ...services.research_domains import (
    DOMAIN_DEFINITIONS,
    assert_record_in_domain,
    resolve_domain_filters,
)
from ...services.research_portal_context import build_research_portal_context
from ...services.research_workflow import (
    PENDING,
    PUBLISHED,
    REJECTED,
    VISIBILITY_ADAPTERS,
    apply_workflow_state,
    workflow_audit_supported,
    workflow_state,
)

router = APIRouter(prefix="/research-workflow", tags=["Research Workflow"])


class WorkflowActionNote(BaseModel):
    """Optional reviewer note.

    Stored only for models that carry provenance columns; see
    :func:`workflow_audit_supported`.
    """

    note: str | None = Field(default=None, max_length=2000)


#: Route resource key -> the CRUD service that owns that table. Keys match
#: ``VISIBILITY_ADAPTERS`` and the CRUD routers' prefixes.
_SERVICE_NAMES: dict[str, str] = {
    "farms": "FarmService",
    "sustainability": "SustainabilityService",
    "projects": "ProjectService",
    "partners": "PartnerService",
    "stories": "StoryService",
    "focus-areas": "FocusAreaService",
    "publications": "PublicationService",
}


def _resolve_service(resource_key: str):
    """Look up the CRUD service backing a workflow resource."""
    name = _SERVICE_NAMES.get(resource_key)
    if name is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unknown workflow resource '{resource_key}'",
        )
    from ... import services as research_services

    service = getattr(research_services, name, None)
    if service is None:  # pragma: no cover - guards a rename
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Service '{name}' is not registered",
        )
    return service


def _serialize(resource_key: str, record: Any) -> dict:
    return {
        "id": str(getattr(record, "id", "")),
        "resource": resource_key,
        "title": (
            getattr(record, "title", None)
            or getattr(record, "name", None)
            or str(getattr(record, "id", ""))
        ),
        "workflow_state": workflow_state(resource_key, record),
        "audit_supported": workflow_audit_supported(resource_key),
        "updated_at": getattr(record, "updated_at", None),
    }


async def _load(db: AsyncSession, resource_key: str, item_id: uuid.UUID):
    service = _resolve_service(resource_key)
    record = await service.get_by_id(db, item_id)
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")
    return service, record


async def _transition(
    db: AsyncSession,
    user,
    resource_key: str,
    item_id: uuid.UUID,
    target_state: str,
    *,
    require_review_authority: bool,
):
    if resource_key not in VISIBILITY_ADAPTERS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"'{resource_key}' has no review workflow",
        )
    service, record = await _load(db, resource_key, item_id)

    # The record must sit inside the caller's own domain workspace.
    assert_record_in_domain(user, resource_key, record)

    context = build_research_portal_context(user)
    if require_review_authority and not (context.can_review or context.can_publish):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This action requires review authority",
        )

    apply_workflow_state(resource_key, record, target_state)
    await db.flush()
    await db.refresh(record)
    return _serialize(resource_key, record)


@router.post(
    "/{resource_key}/{item_id}/submit",
    response_model=SuccessEnvelope[JsonObject],
)
async def submit_for_review(
    resource_key: str,
    item_id: uuid.UUID,
    data: WorkflowActionNote | None = Body(default=None),
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    """Move a draft into the review queue. Available to the record's owner."""
    payload = await _transition(
        db, user, resource_key, item_id, PENDING, require_review_authority=False
    )
    return success(data=payload, message="Submitted for review")


@router.post(
    "/{resource_key}/{item_id}/approve",
    response_model=SuccessEnvelope[JsonObject],
)
async def approve(
    resource_key: str,
    item_id: uuid.UUID,
    data: WorkflowActionNote | None = Body(default=None),
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    """Approve and publish a pending record."""
    payload = await _transition(
        db, user, resource_key, item_id, PUBLISHED, require_review_authority=True
    )
    return success(data=payload, message="Approved and published")


@router.post(
    "/{resource_key}/{item_id}/reject",
    response_model=SuccessEnvelope[JsonObject],
)
async def reject(
    resource_key: str,
    item_id: uuid.UUID,
    data: WorkflowActionNote | None = Body(default=None),
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    """Send a pending record back to its author."""
    payload = await _transition(
        db, user, resource_key, item_id, REJECTED, require_review_authority=True
    )
    return success(data=payload, message="Returned to the author")


@router.post(
    "/{resource_key}/{item_id}/unpublish",
    response_model=SuccessEnvelope[JsonObject],
)
async def unpublish(
    resource_key: str,
    item_id: uuid.UUID,
    data: WorkflowActionNote | None = Body(default=None),
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    """Take a live record off the public site."""
    payload = await _transition(
        db, user, resource_key, item_id, REJECTED, require_review_authority=True
    )
    return success(data=payload, message="Removed from the public site")


@router.get("/queue", response_model=SuccessEnvelope[JsonObject])
async def review_queue(
    resource: str | None = Query(default=None),
    per_page: int = Query(default=25, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    """List records awaiting review across the caller's domains."""
    context = build_research_portal_context(user)
    if not (context.can_review or context.can_publish):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Reviewing requires review authority",
        )

    resource_keys = (
        [resource]
        if resource
        else [
            key
            for key, adapter in VISIBILITY_ADAPTERS.items()
            if adapter.status_field is not None
        ]
    )

    items: list[dict] = []
    for key in resource_keys:
        adapter = VISIBILITY_ADAPTERS.get(key)
        if adapter is None or adapter.status_field is None:
            continue
        try:
            service = _resolve_service(key)
        except HTTPException:
            continue
        filters = {adapter.status_field: PENDING}
        # Narrow to the caller's own domain slice of the shared table.
        try:
            filters.update(resolve_domain_filters(user, key))
        except HTTPException:
            continue
        result = await service.list(db, page=1, per_page=per_page, filters=filters)
        items.extend(_serialize(key, record) for record in result.items)

    return success(
        data={
            "items": items,
            "total": len(items),
            "domains": context.domains,
            # Honest signal: most research models cannot record who submitted
            # or reviewed a record, so the UI must not imply a history exists.
            "audit_supported": {
                key: workflow_audit_supported(key) for key in resource_keys
            },
        }
    )


__all__ = ["router"]
