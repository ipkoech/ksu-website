"""Bulk workflow transitions with per-item results."""

from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, HTTPException, status
from pydantic import Field

from ksu_common.schemas.responses import success

from ...deps import CurrentUser, DbSession
from ...schemas.base import BaseSchema
from ...schemas.content_workflow import ContentWorkflowActionRequest
from .content_workflow import run_content_workflow_action

router = APIRouter()

BULK_WORKFLOW_ACTIONS = {"submit", "approve", "publish", "unpublish", "archive"}
MAX_BULK_ITEMS = 50


class BulkWorkflowItem(BaseSchema):
    content_type: str
    content_id: uuid.UUID


class BulkWorkflowRequest(BaseSchema):
    action: str
    comments: str | None = Field(default=None, max_length=5000)
    items: list[BulkWorkflowItem] = Field(min_length=1, max_length=MAX_BULK_ITEMS)


@router.post("/bulk")
async def run_bulk_content_workflow_action(data: BulkWorkflowRequest, db: DbSession, user: CurrentUser):
    """Apply one workflow action to many records, reporting per-item outcomes.

    Authorization and transition failures never fail the whole request; each
    item reports its own ``{content_id, ok, error}`` result.
    """
    if data.action not in BULK_WORKFLOW_ACTIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported bulk action; allowed: {', '.join(sorted(BULK_WORKFLOW_ACTIONS))}",
        )

    results: list[dict[str, Any]] = []
    for item in data.items:
        try:
            await run_content_workflow_action(
                content_type=item.content_type,
                content_id=item.content_id,
                action=data.action,
                data=ContentWorkflowActionRequest(comments=data.comments),
                db=db,
                user=user,
            )
        except HTTPException as exc:
            results.append({"content_id": str(item.content_id), "ok": False, "error": str(exc.detail)})
        else:
            results.append({"content_id": str(item.content_id), "ok": True, "error": None})

    return success(data=results, message="Bulk workflow action completed")
