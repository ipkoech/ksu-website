"""Shared audit log for editorial content workflow transitions."""

from __future__ import annotations

import uuid
from typing import Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from ksu_common.models.base import Base


CONTENT_WORKFLOW_STATUSES = (
    "draft", "submitted", "in_review", "changes_requested", "approved",
    "scheduled", "published", "unpublished", "rejected", "archived",
)
CONTENT_WORKFLOW_ACTIONS = (
    "submit", "start_review", "request_changes", "approve", "schedule",
    "publish", "unpublish", "reject", "archive", "edit_reset",
)


class ContentWorkflowLog(Base):
    """An immutable record of an editorial workflow transition."""

    __tablename__ = "content_workflow_logs"

    content_type: Mapped[str] = mapped_column(sa.String(64), nullable=False, index=True)
    content_id: Mapped[uuid.UUID] = mapped_column(sa.Uuid, nullable=False, index=True)
    from_status: Mapped[str] = mapped_column(sa.String(32), nullable=False)
    to_status: Mapped[str] = mapped_column(sa.String(32), nullable=False)
    action: Mapped[str] = mapped_column(sa.String(32), nullable=False)
    actor_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    comments: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    changed_fields: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    __table_args__ = (
        sa.CheckConstraint(
            "from_status IN ('draft', 'submitted', 'in_review', 'changes_requested', "
            "'approved', 'scheduled', 'published', 'unpublished', 'rejected', 'archived')",
            name="ck_content_workflow_logs_from_status",
        ),
        sa.CheckConstraint(
            "to_status IN ('draft', 'submitted', 'in_review', 'changes_requested', "
            "'approved', 'scheduled', 'published', 'unpublished', 'rejected', 'archived')",
            name="ck_content_workflow_logs_to_status",
        ),
        sa.CheckConstraint(
            "action IN ('submit', 'start_review', 'request_changes', 'approve', 'schedule', "
            "'publish', 'unpublish', 'reject', 'archive', 'edit_reset')",
            name="ck_content_workflow_logs_action",
        ),
        sa.Index("ix_content_workflow_logs_content_created", "content_type", "content_id", "created_at"),
    )
