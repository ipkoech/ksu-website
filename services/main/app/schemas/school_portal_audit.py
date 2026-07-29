"""Structured audit metadata for School Portal mutations."""

from __future__ import annotations

import uuid
from typing import Any

from pydantic import Field

from .base import BaseSchema


class SchoolPortalAuditCreate(BaseSchema):
    school_id: uuid.UUID
    action: str = Field(min_length=1, max_length=128)
    resource_type: str = Field(min_length=1, max_length=64)
    resource_id: uuid.UUID | str
    actor_id: uuid.UUID
    changed_fields: dict[str, Any] = Field(default_factory=dict)
    request_id: str | None = Field(default=None, max_length=128)
    request_method: str = Field(default="POST", min_length=1, max_length=16)
    request_path: str = Field(
        default="/api/v1/school-portal",
        min_length=1,
        max_length=512,
    )
    ip_address: str | None = Field(default=None, max_length=45)
    user_agent: str | None = Field(default=None, max_length=512)
    details: dict[str, Any] = Field(default_factory=dict)


__all__ = ["SchoolPortalAuditCreate"]
