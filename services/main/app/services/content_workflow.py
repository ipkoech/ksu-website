"""Reusable state transitions for submitted public content."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from ..models import ContentWorkflowLog


ALLOWED_TRANSITIONS = {
    "draft": {"submit": "submitted", "archive": "archived"},
    "submitted": {"start_review": "in_review", "archive": "archived"},
    "in_review": {
        "request_changes": "changes_requested", "approve": "approved",
        "reject": "rejected", "archive": "archived",
    },
    "changes_requested": {"submit": "submitted", "archive": "archived"},
    "approved": {"schedule": "scheduled", "publish": "published", "archive": "archived"},
    "scheduled": {"publish": "published", "unpublish": "unpublished", "archive": "archived"},
    "published": {"unpublish": "unpublished", "archive": "archived"},
    "unpublished": {"submit": "submitted", "archive": "archived"},
    "rejected": {"submit": "submitted", "archive": "archived"},
    "archived": {},
}


class ContentWorkflowService:
    """Transition content that exposes the shared publication status fields."""

    @classmethod
    async def transition(
        cls,
        db: AsyncSession,
        content: Any,
        content_type: str,
        action: str,
        actor_id: uuid.UUID,
        *,
        comments: str | None = None,
        changed_fields: dict[str, Any] | None = None,
        scheduled_for: datetime | None = None,
    ) -> Any:
        from_status = content.status
        to_status = ALLOWED_TRANSITIONS.get(from_status, {}).get(action)
        if to_status is None:
            raise ValueError(f"Invalid workflow transition: {from_status} -> {action}")

        now = datetime.now(timezone.utc)
        content.status = to_status
        if hasattr(content, "updated_at"):
            content.updated_at = now
        if action == "schedule" and scheduled_for is not None and hasattr(content, "valid_from"):
            content.valid_from = scheduled_for
        if action == "publish":
            content.is_published = True
            content.is_public = True
            content.published_at = now
        elif action == "unpublish":
            content.is_published = False
        elif action == "archive":
            content.is_published = False
            content.archived_at = now

        db.add(ContentWorkflowLog(
            content_type=content_type,
            content_id=content.id,
            from_status=from_status,
            to_status=to_status,
            action=action,
            actor_id=actor_id,
            comments=comments,
            changed_fields=changed_fields,
        ))
        return content

    @classmethod
    async def submit_content(cls, db, content, content_type, actor_id, **kwargs):
        return await cls.transition(db, content, content_type, "submit", actor_id, **kwargs)

    @classmethod
    async def start_review(cls, db, content, content_type, actor_id, **kwargs):
        return await cls.transition(db, content, content_type, "start_review", actor_id, **kwargs)

    @classmethod
    async def request_changes(cls, db, content, content_type, actor_id, **kwargs):
        return await cls.transition(db, content, content_type, "request_changes", actor_id, **kwargs)

    @classmethod
    async def approve_content(cls, db, content, content_type, actor_id, **kwargs):
        return await cls.transition(db, content, content_type, "approve", actor_id, **kwargs)

    @classmethod
    async def schedule_content(cls, db, content, content_type, actor_id, **kwargs):
        return await cls.transition(db, content, content_type, "schedule", actor_id, **kwargs)

    @classmethod
    async def publish_content(cls, db, content, content_type, actor_id, **kwargs):
        return await cls.transition(db, content, content_type, "publish", actor_id, **kwargs)

    @classmethod
    async def unpublish_content(cls, db, content, content_type, actor_id, **kwargs):
        return await cls.transition(db, content, content_type, "unpublish", actor_id, **kwargs)

    @classmethod
    async def reject_content(cls, db, content, content_type, actor_id, **kwargs):
        return await cls.transition(db, content, content_type, "reject", actor_id, **kwargs)

    @classmethod
    async def archive_content(cls, db, content, content_type, actor_id, **kwargs):
        return await cls.transition(db, content, content_type, "archive", actor_id, **kwargs)
