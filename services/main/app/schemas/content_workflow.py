"""Schemas for shared editorial workflow actions and audit history."""

from __future__ import annotations

from datetime import datetime
from typing import Any
import uuid

from pydantic import Field, field_validator

from ..models.content_workflow import CONTENT_WORKFLOW_ACTIONS
from .base import BaseReadSchema, BaseSchema


class ContentWorkflowActionRequest(BaseSchema):
    comments: str | None = Field(default=None, max_length=5000)
    changed_fields: dict[str, Any] | None = None
    scheduled_for: datetime | None = None


class ContentWorkflowLogRead(BaseReadSchema):
    content_type: str
    content_id: uuid.UUID
    from_status: str
    to_status: str
    action: str
    actor_id: uuid.UUID | None = None
    comments: str | None = None
    changed_fields: dict[str, Any] | None = None


class ContentWorkflowPreviewRead(BaseSchema):
    rich_text: str | None = None
    plain_text: str | None = None
    structured_content: dict[str, Any] | None = None
    related_links: list[dict[str, Any]] = Field(default_factory=list)
    seo: dict[str, Any] = Field(default_factory=dict)


class ContentWorkflowContributorRead(BaseSchema):
    name: str | None = None
    email: str | None = None
    affiliation: str | None = None
    show_name: bool | None = None
    consent_to_publish: bool | None = None
    source_type: str | None = None


class ContentWorkflowQueueItemRead(BaseSchema):
    id: uuid.UUID
    content_type: str
    content_type_label: str
    title: str
    summary: str | None = None
    status: str
    source_portal: str
    source_label: str
    owner_label: str
    submitted_by_label: str
    submitted_at: datetime | None = None
    reviewer_label: str
    scheduled_publish_at: datetime | None = None
    publication_target: str
    preview_path: str | None = None
    edit_path: str
    workflow_action_path: str
    preview: ContentWorkflowPreviewRead
    contributor: ContentWorkflowContributorRead | None = None


class ContentWorkflowRecordSnapshot(BaseSchema):
    """Bounded common result for heterogeneous workflow records."""

    id: uuid.UUID
    status: str | None = None
    workflow_status: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class ContentWorkflowAction(BaseSchema):
    action: str

    @field_validator("action")
    @classmethod
    def validate_action(cls, value: str) -> str:
        if value not in CONTENT_WORKFLOW_ACTIONS:
            raise ValueError(f"action must be one of: {', '.join(CONTENT_WORKFLOW_ACTIONS)}")
        return value
