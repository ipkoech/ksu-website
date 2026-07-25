"""Reusable state transitions for submitted public content."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from ..models import ContentWorkflowLog


ALLOWED_TRANSITIONS = {
    "draft": {"submit": "submitted", "archive": "archived"},
    "submitted": {"start_review": "in_review", "withdraw": "draft", "archive": "archived"},
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

    @staticmethod
    def owner_metadata_for_scope(
        scope_type: str | None,
        scope_id: uuid.UUID | None,
        *,
        is_main: bool = False,
    ) -> dict[str, Any]:
        portal_by_scope = {
            "school": "schools",
            "department": "departments",
            "research": "research",
            "research-project": "research",
            "library": "library",
            "club": "student-clubs",
        }
        owner_portal = "main" if is_main else portal_by_scope.get(scope_type, scope_type or "main")
        return {
            "owner_portal": owner_portal,
            "owner_scope_type": scope_type if scope_id is not None else None,
            "owner_scope_id": scope_id,
        }

    @staticmethod
    def authoring_create_payload(
        payload: dict[str, Any],
        *,
        actor_id: uuid.UUID,
        owner_portal: str,
        owner_scope_type: str | None,
        owner_scope_id: uuid.UUID | None,
    ) -> dict[str, Any]:
        """Apply server-owned initial workflow metadata to authored content."""
        return {
            **payload,
            "status": "draft",
            "workflow_status": "draft",
            "is_public": False,
            "is_published": False,
            "author_user_id": actor_id,
            "owner_portal": owner_portal,
            "owner_scope_type": owner_scope_type,
            "owner_scope_id": owner_scope_id,
        }

    @classmethod
    async def reset_after_authoring_edit(
        cls,
        db: AsyncSession,
        content: Any,
        content_type: str,
        actor_id: uuid.UUID,
        *,
        changed_fields: dict[str, Any] | None = None,
    ) -> bool:
        """Demote reviewed or public content so edits require a fresh review."""
        from_status = getattr(content, "workflow_status", None) or getattr(content, "status", "draft")
        if from_status == "draft":
            return False

        content.status = "draft"
        content.workflow_status = "draft"
        for field, value in (
            ("is_public", False),
            ("is_published", False),
            ("submitted_by_id", None),
            ("submitted_at", None),
            ("reviewed_by_id", None),
            ("reviewed_at", None),
            ("approved_by_id", None),
            ("approved_at", None),
            ("published_by_id", None),
            ("published_at", None),
            ("scheduled_publish_at", None),
            ("unpublished_by_id", None),
            ("unpublished_at", None),
            ("rejection_reason", None),
            ("revision_notes", None),
        ):
            if hasattr(content, field):
                setattr(content, field, value)

        db.add(ContentWorkflowLog(
            content_type=content_type,
            content_id=content.id,
            from_status=from_status,
            to_status="draft",
            action="edit_reset",
            actor_id=actor_id,
            changed_fields=changed_fields,
        ))
        return True

    @classmethod
    async def apply_edit_policy(
        cls,
        db: AsyncSession,
        content: Any,
        content_type: str,
        actor_id: uuid.UUID,
        *,
        actor_kind: str,
        changed_fields: dict[str, Any] | None = None,
    ) -> bool:
        """Apply role-aware edits without corrupting editorial state.

        Authors may edit only drafts and change-requested records. CoCMS
        reviewers may correct a record only while it remains in review.
        """
        current = getattr(content, "workflow_status", None) or getattr(content, "status", "draft")
        allowed = {
            "author": {"draft", "changes_requested"},
            "reviewer": {"in_review"},
        }
        if actor_kind not in allowed or current not in allowed[actor_kind]:
            raise ValueError(f"{actor_kind} cannot edit content in {current} state")
        if actor_kind == "reviewer" and changed_fields:
            db.add(ContentWorkflowLog(
                content_type=content_type,
                content_id=content.id,
                from_status=current,
                to_status=current,
                action="review_edit",
                actor_id=actor_id,
                changed_fields=changed_fields,
            ))
        return False

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
        from_status = getattr(content, "workflow_status", None) or content.status
        to_status = ALLOWED_TRANSITIONS.get(from_status, {}).get(action)
        if to_status is None:
            raise ValueError(f"Invalid workflow transition: {from_status} -> {action}")

        now = datetime.now(timezone.utc)
        if action == "schedule":
            if scheduled_for is None:
                raise ValueError("scheduled_for is required when scheduling content")
            comparable_schedule = scheduled_for
            if comparable_schedule.tzinfo is None:
                comparable_schedule = comparable_schedule.replace(tzinfo=timezone.utc)
            if comparable_schedule <= now:
                raise ValueError("scheduled_for must be in the future")
            scheduled_for = comparable_schedule

        content.status = to_status
        content.workflow_status = to_status
        if hasattr(content, "updated_at"):
            content.updated_at = now
        if action == "submit":
            content.submitted_by_id = actor_id
            content.submitted_at = now
        elif action == "withdraw":
            content.submitted_by_id = None
            content.submitted_at = None
        elif action == "start_review":
            content.reviewed_by_id = actor_id
            content.reviewed_at = now
        elif action == "request_changes":
            content.revision_notes = comments
        elif action == "approve":
            content.approved_by_id = actor_id
            content.approved_at = now
        elif action == "reject":
            content.rejection_reason = comments
        if action == "schedule":
            content.scheduled_publish_at = scheduled_for
            if hasattr(content, "valid_from"):
                content.valid_from = scheduled_for
        if action == "publish":
            content.is_published = True
            content.is_public = True
            content.published_at = now
            content.published_by_id = actor_id
        elif action == "unpublish":
            content.is_published = False
            if hasattr(content, "is_public"):
                content.is_public = False
            content.unpublished_by_id = actor_id
            content.unpublished_at = now
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
