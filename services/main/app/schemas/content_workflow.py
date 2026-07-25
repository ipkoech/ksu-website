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


class ContentWorkflowAction(BaseSchema):
    action: str

    @field_validator("action")
    @classmethod
    def validate_action(cls, value: str) -> str:
        if value not in CONTENT_WORKFLOW_ACTIONS:
            raise ValueError(f"action must be one of: {', '.join(CONTENT_WORKFLOW_ACTIONS)}")
        return value
