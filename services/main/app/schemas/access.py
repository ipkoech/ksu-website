"""Schemas for authenticated portal access contracts."""

from __future__ import annotations

import uuid

from .base import BaseSchema


class PortalAccessRead(BaseSchema):
    key: str
    label: str
    service: str
    href: str
    scope_type: str
    scope_id: uuid.UUID | None = None
    scope_label: str
    permissions: list[str]
    source: str = "role"
    locked_scope: bool = True


class PortalAccessResponse(BaseSchema):
    portals: list[PortalAccessRead]

