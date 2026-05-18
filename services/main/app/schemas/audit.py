"""Audit log schemas."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from .base import BaseReadSchema


class AuditLogRead(BaseReadSchema):
    service_name: str
    action: str
    resource_type: str | None = None
    resource_id: str | None = None
    request_method: str
    request_path: str
    route_name: str | None = None
    status_code: int
    status: str
    user_id: uuid.UUID | None = None
    session_jti: str | None = None
    ip_address: str | None = None
    user_agent: str | None = None
    error_message: str | None = None
    details: dict[str, Any] | None = None
    changes: dict[str, Any] | None = None
    happened_at: datetime
    deleted_at: datetime | None = None
