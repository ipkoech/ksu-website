"""Notification schemas."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import Field, model_validator

from .base import BaseReadSchema, BaseSchema


class NotificationTemplateCreate(BaseSchema):
    code: str = Field(min_length=1, max_length=64)
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    title_template: str = Field(min_length=1)
    subject_template: str | None = None
    message_template: str = Field(min_length=1)
    channels: list[str] = Field(default_factory=lambda: ["in_app"])
    variables: list[str] | None = None
    is_active: bool = True


class NotificationTemplateUpdate(BaseSchema):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    title_template: str | None = None
    subject_template: str | None = None
    message_template: str | None = None
    channels: list[str] | None = None
    variables: list[str] | None = None
    is_active: bool | None = None


class NotificationTemplateRead(BaseReadSchema):
    code: str
    name: str
    description: str | None = None
    title_template: str
    subject_template: str | None = None
    message_template: str
    channels: list[str]
    variables: list[str] | None = None
    is_active: bool
    notifications: list[dict[str, Any]] | None = None
    deleted_at: datetime | None = None


class NotificationDeliveryRead(BaseReadSchema):
    notification_id: uuid.UUID
    channel: str
    recipient: str | None = None
    status: str
    provider_message_id: str | None = None
    error_message: str | None = None
    attempts: int
    scheduled_for: datetime | None = None
    sent_at: datetime | None = None
    delivered_at: datetime | None = None
    failed_at: datetime | None = None
    next_retry_at: datetime | None = None
    dead_lettered_at: datetime | None = None
    dead_letter_reason: str | None = None
    expires_at: datetime | None = None
    metadata: dict[str, Any] | None = Field(default=None, validation_alias="extra_metadata", serialization_alias="metadata")
    notification: dict[str, Any] | None = None
    deleted_at: datetime | None = None


class NotificationCreate(BaseSchema):
    user_id: uuid.UUID
    template_id: uuid.UUID | None = None
    title: str = Field(min_length=1, max_length=255)
    subject: str | None = Field(default=None, max_length=255)
    message: str
    notification_type: str = Field(default="info", max_length=50)
    priority: str = Field(default="normal", max_length=32)
    action_url: str | None = Field(default=None, max_length=500)
    scope_type: str | None = Field(default=None, max_length=32)
    scope_id: uuid.UUID | None = None
    channels: list[str] = Field(default_factory=lambda: ["in_app"])
    payload: dict[str, Any] | None = None
    expires_at: datetime | None = None


class NotificationBroadcastCreate(BaseSchema):
    user_ids: list[uuid.UUID] = Field(default_factory=list)
    role_names: list[str] = Field(default_factory=list)
    audience_scope_type: str | None = Field(default=None, max_length=32)
    audience_scope_id: uuid.UUID | None = None
    template_code: str | None = Field(default=None, max_length=64)
    template_context: dict[str, Any] | None = None
    title: str | None = Field(default=None, max_length=255)
    subject: str | None = Field(default=None, max_length=255)
    message: str | None = None
    notification_type: str = Field(default="info", max_length=50)
    priority: str = Field(default="normal", max_length=32)
    action_url: str | None = Field(default=None, max_length=500)
    scope_type: str | None = Field(default=None, max_length=32)
    scope_id: uuid.UUID | None = None
    channels: list[str] = Field(default_factory=lambda: ["in_app"])
    payload: dict[str, Any] | None = None
    expires_at: datetime | None = None

    @model_validator(mode="after")
    def validate_payload(self):
        if not self.user_ids and not self.role_names and not (self.audience_scope_type and self.audience_scope_id):
            raise ValueError("At least one audience selector is required")
        if not self.template_code and not (self.title and self.message):
            raise ValueError("Either template_code or both title and message are required")
        return self


class NotificationUpdate(BaseSchema):
    is_read: bool | None = None
    read_at: datetime | None = None
    archived_at: datetime | None = None


class NotificationRead(BaseReadSchema):
    user_id: uuid.UUID
    template_id: uuid.UUID | None = None
    title: str
    subject: str | None = None
    message: str
    notification_type: str
    priority: str
    action_url: str | None = None
    scope_type: str | None = None
    scope_id: uuid.UUID | None = None
    channels: list[str]
    payload: dict[str, Any] | None = None
    is_read: bool
    read_at: datetime | None = None
    expires_at: datetime | None = None
    dispatched_at: datetime | None = None
    archived_at: datetime | None = None
    deliveries: list[NotificationDeliveryRead] = Field(default_factory=list)
    template: dict[str, Any] | None = None
    user: dict[str, Any] | None = None
    deleted_at: datetime | None = None
