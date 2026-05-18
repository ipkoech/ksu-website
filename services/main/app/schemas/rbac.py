"""RBAC schemas for permissions, roles, and scoped user-role assignments."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import Field

from .base import BaseReadSchema, BaseSchema


class PermissionRead(BaseReadSchema):
    name: str
    description: str | None = None
    resource: str | None = None
    action: str | None = None
    is_active: bool


class RoleCreate(BaseSchema):
    name: str = Field(min_length=1, max_length=64)
    display_name: str | None = Field(default=None, max_length=128)
    description: str | None = Field(default=None, max_length=255)
    is_system: bool = False
    is_active: bool = True


class RoleUpdate(BaseSchema):
    display_name: str | None = Field(default=None, max_length=128)
    description: str | None = Field(default=None, max_length=255)
    is_system: bool | None = None
    is_active: bool | None = None


class RoleRead(BaseReadSchema):
    name: str
    display_name: str | None = None
    description: str | None = None
    is_system: bool
    is_active: bool
    permissions: list[str] = Field(default_factory=list)


class UserRoleCreate(BaseSchema):
    user_id: uuid.UUID
    role_id: uuid.UUID
    scope_type: str | None = Field(default=None, max_length=32)
    scope_id: uuid.UUID | None = None
    assigned_by_id: uuid.UUID | None = None
    expires_at: datetime | None = None
    note: str | None = Field(default=None, max_length=255)
    is_active: bool = True


class UserRoleRead(BaseReadSchema):
    user_id: uuid.UUID
    role_id: uuid.UUID
    role_name: str | None = None
    scope_type: str | None = None
    scope_id: uuid.UUID | None = None
    assigned_by_id: uuid.UUID | None = None
    assigned_at: datetime
    expires_at: datetime | None = None
    note: str | None = None
    is_active: bool
