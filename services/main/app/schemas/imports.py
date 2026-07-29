"""Bulk import schemas."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import Field

from .base import BaseSchema


ImportRowStatus = Literal["valid", "invalid", "duplicate"]
ImportCommitMode = Literal["partial", "all_or_nothing"]


class ImportColumnRead(BaseSchema):
    key: str
    label: str
    required: bool = False
    description: str | None = None
    sample: Any | None = None


class ImportResourceRead(BaseSchema):
    key: str
    label: str
    description: str
    scope: str
    accepted_formats: list[str] = Field(default_factory=lambda: ["csv", "json"])
    columns: list[ImportColumnRead]


class ImportPreviewRow(BaseSchema):
    row_number: int
    status: ImportRowStatus
    raw: dict[str, Any]
    payload: dict[str, Any] | None = None
    errors: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)


class ImportPreviewRead(BaseSchema):
    resource: str
    total_rows: int
    valid_rows: int
    invalid_rows: int
    duplicate_rows: int
    rows: list[ImportPreviewRow]


class ImportCommitRequest(BaseSchema):
    rows: list[dict[str, Any]] = Field(min_length=1)
    mode: ImportCommitMode = "partial"


class ImportCommitRowRead(BaseSchema):
    row_number: int
    status: Literal["created", "skipped", "failed"]
    id: str | None = None
    errors: list[str] = Field(default_factory=list)


class ImportCommitRead(BaseSchema):
    resource: str
    total_rows: int
    created_rows: int
    skipped_rows: int
    failed_rows: int
    rows: list[ImportCommitRowRead]


class ImportJobRead(BaseSchema):
    job_id: str
    status: str
    resource: str | None = None
    result: ImportCommitRead | None = None
    error: str | None = None
