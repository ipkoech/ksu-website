"""School Portal publication request contracts."""

from __future__ import annotations

import uuid
from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class _SchoolPublicationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")


class SchoolPublicationCreate(_SchoolPublicationRequest):
    title: str = Field(max_length=1000)
    slug: str | None = Field(None, max_length=128)
    publication_type: str = Field("journal_article", max_length=32)
    department_id: uuid.UUID | None = None
    project_id: uuid.UUID | None = None
    center_id: uuid.UUID | None = None
    journal_id: uuid.UUID | None = None
    abstract: str | None = None
    keywords: list[str] | None = None
    journal_name: str | None = Field(None, max_length=500)
    publisher: str | None = Field(None, max_length=255)
    publication_date: date | None = None
    year: int | None = None
    doi: str | None = Field(None, max_length=128)
    url: str | None = Field(None, max_length=512)
    pdf_url: str | None = Field(None, max_length=512)
    is_open_access: bool = False
    funding_acknowledgment: str | None = None
    grant_numbers: list[str] | None = None
    cover_image_url: str | None = Field(None, max_length=512)


class SchoolPublicationUpdate(_SchoolPublicationRequest):
    title: str | None = Field(None, max_length=1000)
    slug: str | None = Field(None, max_length=128)
    publication_type: str | None = Field(None, max_length=32)
    department_id: uuid.UUID | None = None
    project_id: uuid.UUID | None = None
    center_id: uuid.UUID | None = None
    journal_id: uuid.UUID | None = None
    abstract: str | None = None
    keywords: list[str] | None = None
    journal_name: str | None = Field(None, max_length=500)
    publisher: str | None = Field(None, max_length=255)
    publication_date: date | None = None
    year: int | None = None
    doi: str | None = Field(None, max_length=128)
    url: str | None = Field(None, max_length=512)
    pdf_url: str | None = Field(None, max_length=512)
    is_open_access: bool | None = None
    funding_acknowledgment: str | None = None
    grant_numbers: list[str] | None = None
    cover_image_url: str | None = Field(None, max_length=512)
