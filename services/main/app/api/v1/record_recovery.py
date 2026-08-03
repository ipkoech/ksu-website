"""Restore endpoints for archived and soft-deleted records."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from ksu_common.schemas.responses import success

from ._scoped import require_scoped_record
from ...deps import CurrentUser, DbSession, user_has_scope
from ...models import ContentWorkflowLog, Media
from .announcements import ANNOUNCEMENT_MANAGE_PERMISSIONS
from .content_workflow import CONTENT_MODELS
from .events import EVENT_MANAGE_PERMISSIONS
from .media import MEDIA_LINK_MANAGE_PERMISSIONS
from .news import NEWS_MANAGE_PERMISSIONS
from .sliders import SLIDER_ADMIN_SCOPE

router = APIRouter()

RECOVERY_MODELS: dict[str, type] = {
    "news": CONTENT_MODELS["news"],
    "blogs": CONTENT_MODELS["blogs"],
    "announcements": CONTENT_MODELS["announcements"],
    "events": CONTENT_MODELS["events"],
    "stories": CONTENT_MODELS["stories"],
    "sliders": CONTENT_MODELS["sliders"],
    "media": Media,
}

# Content types whose routers authorize per-record scope ownership.
SCOPED_RECOVERY_PERMISSIONS: dict[str, list[str]] = {
    "news": NEWS_MANAGE_PERMISSIONS,
    "announcements": ANNOUNCEMENT_MANAGE_PERMISSIONS,
    "events": EVENT_MANAGE_PERMISSIONS,
}

# Content types whose routers gate management behind a flat scope.
FLAT_RECOVERY_PERMISSIONS: dict[str, list[str]] = {
    "blogs": ["content.manage_news"],
    "stories": ["content.manage_stories"],
    "sliders": [SLIDER_ADMIN_SCOPE],
    "media": MEDIA_LINK_MANAGE_PERMISSIONS,
}


async def _authorize_recovery(db: DbSession, user: CurrentUser, content_type: str, record) -> None:
    scoped_permissions = SCOPED_RECOVERY_PERMISSIONS.get(content_type)
    if scoped_permissions is not None:
        await require_scoped_record(
            db,
            user,
            scoped_permissions,
            getattr(record, "scope_type", None),
            getattr(record, "scope_id", None),
            resource_name=content_type,
        )
        return
    if not any(user_has_scope(user, scope) for scope in FLAT_RECOVERY_PERMISSIONS[content_type]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient privileges",
        )


@router.post("/{content_type}/{record_id}/restore")
async def restore_record(content_type: str, record_id: uuid.UUID, db: DbSession, user: CurrentUser):
    model = RECOVERY_MODELS.get(content_type)
    if model is None:
        raise HTTPException(status_code=404, detail="Unknown record type")

    result = await db.execute(select(model).where(model.id == record_id))
    record = result.scalar_one_or_none()
    if record is None:
        raise HTTPException(status_code=404, detail="Record not found")

    await _authorize_recovery(db, user, content_type, record)

    was_deleted = record.deleted_at is not None
    if was_deleted:
        record.restore()
        message = "Record restored"
    if getattr(record, "workflow_status", None) == "archived" or getattr(record, "archived_at", None) is not None:
        record.workflow_status = "draft"
        if hasattr(record, "status"):
            record.status = "draft"
        if hasattr(record, "archived_at"):
            record.archived_at = None
        if hasattr(record, "is_published"):
            record.is_published = False
        if hasattr(record, "is_public"):
            record.is_public = False
        db.add(ContentWorkflowLog(
            content_type=content_type,
            content_id=record.id,
            from_status="archived",
            to_status="draft",
            action="edit_reset",
            actor_id=user.id,
            comments="Restored from archive",
        ))
        message = "Record restored from archive"
    elif not was_deleted:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Record is neither archived nor deleted",
        )

    await db.flush()
    return success(data=record, message=message)
