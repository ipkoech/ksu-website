from __future__ import annotations

from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, model_validator


class AnalyticsAcceptedResponse(BaseModel):
    status: str = "accepted"
    duplicate: bool | None = None


class SubmissionResponse(BaseModel):
    """Stable validation shape for the legacy JSONResponse success/error bodies."""

    status: str | None = None
    message: str | None = None
    code: str | None = None
    detail: str | None = None


class PartnerSyncResponse(BaseModel):
    created: int
    updated: int
    total: int
    deactivated: int = 0


class MediaAssetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    file_name: str
    mime_type: str
    file_size: int
    file_hash: str | None = None
    storage_path: str
    public_url: str | None = None
    alt_text: str
    caption: str | None = None
    credit: str | None = None
    width: int | None = None
    height: int | None = None
    focal_x: float | None = None
    focal_y: float | None = None


class DynamicResourceResponse(BaseModel):
    """JSON object adapter for the legacy resource registry endpoint."""

    model_config = ConfigDict(extra="allow", from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def serialize_record(cls, value: object) -> object:
        if isinstance(value, dict):
            return value
        table = getattr(value, "__table__", None)
        columns = getattr(table, "columns", ())
        if columns:
            return {column.name: getattr(value, column.name) for column in columns}
        return value


class AuditRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    action: str
    entity_type: str
    entity_id: str
    actor_id: str | None = None
    previous_value: dict[str, Any] | None = None
    new_value: dict[str, Any] | None = None
    ip_address: str | None = None
    user_agent: str | None = None
