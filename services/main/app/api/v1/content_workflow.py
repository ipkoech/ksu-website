"""Shared review and publication workflow endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import select

from ksu_common.schemas.responses import success

from ...deps import CurrentUser, DbSession, permissions_for_user
from ...models import Announcement, Blog, ContentWorkflowLog, Event, News
from ...schemas.content_workflow import ContentWorkflowActionRequest
from ...services.content_workflow import ContentWorkflowService

router = APIRouter()

CONTENT_MODELS = {"news": News, "blogs": Blog, "announcements": Announcement, "events": Event}
REVIEW_ACTIONS = {"start_review", "request_changes", "approve", "reject"}
PUBLISH_ACTIONS = {"schedule", "publish", "unpublish"}


def authorize_content_workflow_action(user, content, action: str, permissions: set[str]) -> None:
    owner_id = getattr(content, "author_user_id", None)
    if action == "edit":
        if content.status == "submitted" and "content.edit_submitted" in permissions:
            return
        if owner_id == user.id and "content.edit" in permissions:
            return
        raise HTTPException(status_code=403, detail="Insufficient privileges")
    if action in PUBLISH_ACTIONS:
        if owner_id == user.id or "content.publish" not in permissions:
            raise HTTPException(status_code=403, detail="Content owners cannot publish")
        return
    if action == "submit" and owner_id == user.id:
        return
    required = "content.review" if action in REVIEW_ACTIONS else "content.submit" if action == "submit" else "content.archive"
    if required not in permissions and "content.manage" not in permissions:
        raise HTTPException(status_code=403, detail="Insufficient privileges")


async def _get_content_or_404(db: DbSession, content_type: str, content_id: uuid.UUID):
    model = CONTENT_MODELS.get(content_type)
    if model is None:
        raise HTTPException(status_code=404, detail="Unsupported content type")
    item = await model.get_by_id(db, content_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Content not found")
    return item


@router.post("/{content_type}/{content_id}/{action}")
async def run_content_workflow_action(
    content_type: str,
    content_id: uuid.UUID,
    action: str,
    data: ContentWorkflowActionRequest,
    db: DbSession,
    user: CurrentUser,
):
    content = await _get_content_or_404(db, content_type, content_id)
    permissions = permissions_for_user(user)
    authorize_content_workflow_action(user, content, action, permissions)
    try:
        content = await ContentWorkflowService.transition(
            db, content, content_type, action, user.id,
            comments=data.comments, changed_fields=data.changed_fields, scheduled_for=data.scheduled_for,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    await db.flush()
    await db.refresh(content)
    return success(data=content, message="Content workflow updated")


@router.get("/{content_type}/{content_id}/logs")
async def list_content_workflow_logs(
    content_type: str,
    content_id: uuid.UUID,
    db: DbSession,
    user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
):
    content = await _get_content_or_404(db, content_type, content_id)
    authorize_content_workflow_action(user, content, "edit", permissions_for_user(user))
    result = await db.execute(
        select(ContentWorkflowLog)
        .where(ContentWorkflowLog.content_type == content_type, ContentWorkflowLog.content_id == content_id)
        .order_by(ContentWorkflowLog.created_at.desc())
        .offset((page - 1) * per_page).limit(per_page)
    )
    return success(data=result.scalars().all())
