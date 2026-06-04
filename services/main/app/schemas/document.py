"""Document and policy schemas."""

from __future__ import annotations

import uuid
from typing import Any
from datetime import date, datetime

from pydantic import Field

from .base import BaseReadSchema, BaseSchema, SlugStr


class PolicyCreate(BaseSchema):
    title: str = Field(min_length=1, max_length=255)
    slug: SlugStr | None = None
    code: str | None = Field(default=None, max_length=64)
    category: str = Field(min_length=1, max_length=32)
    summary: str | None = None
    content: str | None = None
    division_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    version: str | None = Field(default=None, max_length=32)
    effective_date: date | None = None
    review_date: date | None = None
    supersedes_id: uuid.UUID | None = None
    approved_by_id: uuid.UUID | None = None
    approved_at: datetime | None = None
    pdf_file_id: uuid.UUID | None = None
    is_public: bool = True
    status: str = Field(default="draft", max_length=32)
    display_order: int = 100


class PolicyUpdate(BaseSchema):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    slug: SlugStr | None = None
    code: str | None = Field(default=None, max_length=64)
    category: str | None = Field(default=None, max_length=32)
    summary: str | None = None
    content: str | None = None
    division_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    version: str | None = Field(default=None, max_length=32)
    effective_date: date | None = None
    review_date: date | None = None
    supersedes_id: uuid.UUID | None = None
    approved_by_id: uuid.UUID | None = None
    approved_at: datetime | None = None
    pdf_file_id: uuid.UUID | None = None
    is_public: bool | None = None
    status: str | None = Field(default=None, max_length=32)
    display_order: int | None = None


class PolicyRead(BaseReadSchema):
    title: str
    slug: str
    code: str | None = None
    category: str
    summary: str | None = None
    content: str | None = None
    division_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    version: str | None = None
    effective_date: date | None = None
    review_date: date | None = None
    supersedes_id: uuid.UUID | None = None
    approved_by_id: uuid.UUID | None = None
    approved_at: datetime | None = None
    pdf_file_id: uuid.UUID | None = None
    is_public: bool
    status: str
    approved_by: dict[str, Any] | None = None
    department: dict[str, Any] | None = None
    division: dict[str, Any] | None = None
    pdf_file: dict[str, Any] | None = None
    supersedes: dict[str, Any] | None = None
    display_order: int


class DocumentCreate(BaseSchema):
    title: str = Field(min_length=1, max_length=255)
    slug: SlugStr | None = None
    document_type: str = Field(min_length=1, max_length=32)
    category: str | None = Field(default=None, max_length=64)
    description: str | None = None
    scope_type: str | None = Field(default=None, max_length=32)
    scope_id: uuid.UUID | None = None
    file_id: uuid.UUID
    version: str | None = Field(default=None, max_length=32)
    is_public: bool = True
    requires_login: bool = False
    is_active: bool = True
    display_order: int = 100


class DocumentUpdate(BaseSchema):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    slug: SlugStr | None = None
    document_type: str | None = Field(default=None, max_length=32)
    category: str | None = Field(default=None, max_length=64)
    description: str | None = None
    scope_type: str | None = Field(default=None, max_length=32)
    scope_id: uuid.UUID | None = None
    file_id: uuid.UUID | None = None
    version: str | None = Field(default=None, max_length=32)
    is_public: bool | None = None
    requires_login: bool | None = None
    is_active: bool | None = None
    display_order: int | None = None


class DocumentRead(BaseReadSchema):
    title: str
    slug: str
    document_type: str
    category: str | None = None
    description: str | None = None
    scope_type: str | None = None
    scope_id: uuid.UUID | None = None
    file_id: uuid.UUID
    version: str | None = None
    is_public: bool
    requires_login: bool
    download_count: int
    is_active: bool
    file: dict[str, Any] | None = None
    display_order: int


__all__ = [
    "PolicyCreate",
    "PolicyUpdate",
    "PolicyRead",
    "DocumentCreate",
    "DocumentUpdate",
    "DocumentRead",
]
