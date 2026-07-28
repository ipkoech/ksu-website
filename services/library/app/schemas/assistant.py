"""Schemas for librarian-managed Library AI assistant contexts."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


AssistantContextStatus = Literal["draft", "active", "archived"]

ALLOWED_ASSISTANT_SOURCE_TYPES = {
    "branch", "catalog", "database", "download", "external_link", "guide",
    "specialist", "service", "staff", "workflow", "policy", "regulation",
}


class LibraryAssistantSourceCreate(BaseModel):
    source_type: str = Field(min_length=1, max_length=64)
    source_id: uuid.UUID
    title: str = Field(min_length=1, max_length=255)
    public_url: str | None = Field(default=None, max_length=1000)
    sort_order: int = 0

    @field_validator("source_type")
    @classmethod
    def validate_source_type(cls, value: str) -> str:
        normalized = value.strip().lower()
        if normalized not in ALLOWED_ASSISTANT_SOURCE_TYPES:
            raise ValueError("source_type is not supported by the Library assistant")
        return normalized


class LibraryAssistantContextCreate(BaseModel):
    library_id: uuid.UUID | None = None
    name: str = Field(min_length=2, max_length=255)
    slug: str = Field(min_length=2, max_length=160, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    description: str | None = None
    audience: str | None = Field(default=None, max_length=255)
    instructions: str = Field(min_length=20, max_length=12000)
    allowed_source_types: list[str] = Field(default_factory=list)
    suggested_prompts: list[dict] = Field(default_factory=list, max_length=12)
    escalation_guidance: str | None = None
    sort_order: int = 0
    sources: list[LibraryAssistantSourceCreate] = Field(default_factory=list, max_length=100)

    @field_validator("allowed_source_types")
    @classmethod
    def validate_allowed_source_types(cls, values: list[str]) -> list[str]:
        normalized = [value.strip().lower() for value in values]
        unsupported = set(normalized) - ALLOWED_ASSISTANT_SOURCE_TYPES
        if unsupported:
            raise ValueError(f"Unsupported assistant source types: {sorted(unsupported)}")
        return list(dict.fromkeys(normalized))


class LibraryAssistantContextUpdate(BaseModel):
    library_id: uuid.UUID | None = None
    name: str | None = Field(default=None, min_length=2, max_length=255)
    description: str | None = None
    audience: str | None = Field(default=None, max_length=255)
    instructions: str | None = Field(default=None, min_length=20, max_length=12000)
    allowed_source_types: list[str] | None = None
    suggested_prompts: list[dict] | None = Field(default=None, max_length=12)
    escalation_guidance: str | None = None
    sort_order: int | None = None
    sources: list[LibraryAssistantSourceCreate] | None = Field(default=None, max_length=100)

    @field_validator("allowed_source_types")
    @classmethod
    def validate_allowed_source_types(cls, values: list[str] | None) -> list[str] | None:
        if values is None:
            return values
        normalized = [value.strip().lower() for value in values]
        unsupported = set(normalized) - ALLOWED_ASSISTANT_SOURCE_TYPES
        if unsupported:
            raise ValueError(f"Unsupported assistant source types: {sorted(unsupported)}")
        return list(dict.fromkeys(normalized))


class LibraryAssistantSourceOut(LibraryAssistantSourceCreate):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    context_id: uuid.UUID
    is_approved: bool
    approved_by_person_id: uuid.UUID | None = None
    approved_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


class LibraryAssistantContextOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    library_id: uuid.UUID | None = None
    name: str
    slug: str
    description: str | None = None
    audience: str | None = None
    instructions: str | None = None
    allowed_source_types: list[str]
    suggested_prompts: list[dict]
    escalation_guidance: str | None = None
    status: AssistantContextStatus
    is_public: bool
    published_at: datetime | None = None
    sort_order: int
    sources: list[LibraryAssistantSourceOut] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime


class LibraryAssistantContextPublicOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    library_id: uuid.UUID | None = None
    name: str
    slug: str
    description: str | None = None
    audience: str | None = None
    suggested_prompts: list[dict]
    escalation_guidance: str | None = None
    sources: list[LibraryAssistantSourceOut] = Field(default_factory=list)
