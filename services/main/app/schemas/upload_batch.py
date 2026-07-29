"""School media upload batch contracts."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import ConfigDict, Field

from .base import BaseSchema
from .school_portal_content import SchoolContentImportRow


class UploadBatchFileRead(BaseSchema):
    id: uuid.UUID
    client_reference: str
    original_filename: str
    mime_type: str
    file_size: int
    bytes_received: int
    checksum_sha256: str | None = None
    target_entity_type: str | None = None
    target_entity_id: uuid.UUID | None = None
    target_role: str
    display_order: int
    status: str
    error: str | None = None
    attempts: int
    media_id: uuid.UUID | None = None


class UploadBatchRead(BaseSchema):
    id: uuid.UUID
    school_id: uuid.UUID
    status: str
    total_files: int
    completed_files: int
    failed_files: int
    total_bytes: int
    received_bytes: int
    expires_at: datetime
    completed_at: datetime | None = None
    files: list[UploadBatchFileRead] = Field(default_factory=list)


class SchoolContentMetadataImport(BaseSchema):
    model_config = ConfigDict(extra="forbid")

    batch_id: uuid.UUID | None = None
    rows: list[SchoolContentImportRow] = Field(min_length=1, max_length=1000)
