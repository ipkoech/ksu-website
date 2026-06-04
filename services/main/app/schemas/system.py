"""System and integration schemas."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import Field

from .base import BaseReadSchema, BaseSchema, UrlStr


class SettingCreate(BaseSchema):
    key: str = Field(min_length=1, max_length=128)
    value: Any
    value_type: str = Field(min_length=1, max_length=32)
    category: str = Field(min_length=1, max_length=64)
    description: str | None = None
    is_public: bool = False


class SettingUpdate(BaseSchema):
    value: Any | None = None
    value_type: str | None = Field(default=None, max_length=32)
    category: str | None = Field(default=None, max_length=64)
    description: str | None = None
    is_public: bool | None = None


class SettingRead(BaseReadSchema):
    key: str
    value: Any
    value_type: str
    category: str
    description: str | None = None
    is_public: bool
    updated_by: dict[str, Any] | None = None
    updated_by_id: uuid.UUID | None = None


class ApiKeyCreate(BaseSchema):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    scopes: list[str]
    rate_limit: int = Field(default=1000, ge=1)
    expires_at: datetime | None = None


class ApiKeyUpdate(BaseSchema):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    scopes: list[str] | None = None
    rate_limit: int | None = Field(default=None, ge=1)
    expires_at: datetime | None = None
    is_active: bool | None = None


class ApiKeyRead(BaseReadSchema):
    name: str
    description: str | None = None
    scopes: list[str]
    rate_limit: int
    expires_at: datetime | None = None
    last_used_at: datetime | None = None
    is_active: bool
    created_by: dict[str, Any] | None = None
    created_by_id: uuid.UUID


class ApiKeyCreateResponse(BaseSchema):
    api_key: str
    record: ApiKeyRead


class WebhookCreate(BaseSchema):
    name: str = Field(min_length=1, max_length=255)
    url: UrlStr
    secret: str | None = Field(default=None, max_length=255)
    events: list[str]
    is_active: bool = True


class WebhookUpdate(BaseSchema):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    url: UrlStr | None = None
    secret: str | None = Field(default=None, max_length=255)
    events: list[str] | None = None
    is_active: bool | None = None
    last_status: int | None = None
    failure_count: int | None = Field(default=None, ge=0)


class WebhookRead(BaseReadSchema):
    name: str
    url: str
    secret: str | None = None
    events: list[str]
    is_active: bool
    last_triggered_at: datetime | None = None
    last_status: int | None = None
    failure_count: int
    created_by: dict[str, Any] | None = None
    created_by_id: uuid.UUID


__all__ = [
    "SettingCreate",
    "SettingUpdate",
    "SettingRead",
    "ApiKeyCreate",
    "ApiKeyUpdate",
    "ApiKeyRead",
    "ApiKeyCreateResponse",
    "WebhookCreate",
    "WebhookUpdate",
    "WebhookRead",
]
