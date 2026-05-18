"""Pydantic v2 schemas for ElectronicResource, ElectronicResourceGuide."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator


# ── ElectronicResourceGuide ───────────────────────────────────────────────────


class ElectronicResourceGuideBase(BaseModel):
    title: str
    summary: Optional[str] = None
    access_steps: Optional[list[dict]] = None
    search_tips: Optional[str] = None
    recommended_subjects: Optional[list[str]] = None
    guide_type: str = "html"
    media_id: Optional[uuid.UUID] = None
    is_active: bool = True
    sort_order: int = 0

    @field_validator("guide_type")
    @classmethod
    def validate_guide_type(cls, v: str) -> str:
        allowed = {"pdf", "video", "html"}
        if v not in allowed:
            raise ValueError(f"guide_type must be one of {allowed}")
        return v


class ElectronicResourceGuideCreate(ElectronicResourceGuideBase):
    pass


class ElectronicResourceGuideUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    access_steps: Optional[list[dict]] = None
    search_tips: Optional[str] = None
    recommended_subjects: Optional[list[str]] = None
    guide_type: Optional[str] = None
    media_id: Optional[uuid.UUID] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class ElectronicResourceGuideOut(ElectronicResourceGuideBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    electronic_resource_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


# ── ElectronicResource ────────────────────────────────────────────────────────


class ElectronicResourceBase(BaseModel):
    library_id: Optional[uuid.UUID] = None
    name: str
    slug: str
    provider: Optional[str] = None
    description: Optional[str] = None
    access_url: str
    section_letter: str
    resource_type: str = "database"
    subjects: Optional[list[str]] = None
    coverage_dates: Optional[str] = None
    simultaneous_users: Optional[str] = None
    access_level: str = "all"
    access_type: str = "both"
    requires_vpn: bool = False
    requires_registration: bool = False
    is_active: bool = True
    is_featured: bool = False
    sort_order: int = 0
    logo_image_id: Optional[uuid.UUID] = None
    notes: Optional[str] = None

    @field_validator("section_letter")
    @classmethod
    def validate_section_letter(cls, v: str) -> str:
        v = v.upper()
        if len(v) != 1 or not v.isalpha():
            raise ValueError("section_letter must be a single A-Z letter")
        return v

    @field_validator("resource_type")
    @classmethod
    def validate_resource_type(cls, v: str) -> str:
        allowed = {
            "database",
            "ebook_platform",
            "ejournal_aggregator",
            "news",
            "reference",
            "other",
        }
        if v not in allowed:
            raise ValueError(f"resource_type must be one of {allowed}")
        return v

    @field_validator("access_level")
    @classmethod
    def validate_access_level(cls, v: str) -> str:
        allowed = {"all", "staff", "students", "postgraduate", "academic_staff"}
        if v not in allowed:
            raise ValueError(f"access_level must be one of {allowed}")
        return v

    @field_validator("access_type")
    @classmethod
    def validate_access_type(cls, v: str) -> str:
        allowed = {"on_campus", "off_campus", "both"}
        if v not in allowed:
            raise ValueError(f"access_type must be one of {allowed}")
        return v


class ElectronicResourceCreate(ElectronicResourceBase):
    pass


class ElectronicResourceUpdate(BaseModel):
    library_id: Optional[uuid.UUID] = None
    name: Optional[str] = None
    provider: Optional[str] = None
    description: Optional[str] = None
    access_url: Optional[str] = None
    section_letter: Optional[str] = None
    resource_type: Optional[str] = None
    subjects: Optional[list[str]] = None
    coverage_dates: Optional[str] = None
    simultaneous_users: Optional[str] = None
    access_level: Optional[str] = None
    access_type: Optional[str] = None
    requires_vpn: Optional[bool] = None
    requires_registration: Optional[bool] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    sort_order: Optional[int] = None
    logo_image_id: Optional[uuid.UUID] = None
    notes: Optional[str] = None


class ElectronicResourceOut(ElectronicResourceBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


class ElectronicResourceDetail(ElectronicResourceOut):
    guides: list[ElectronicResourceGuideOut] = []


# ── Publication search ────────────────────────────────────────────────────────


class PublicationSearchQuery(BaseModel):
    q: str
    author: Optional[str] = None
    year: Optional[int] = None
    source: Optional[str] = (
        None  # "all" | "internal" | "crossref" | "openalex" | "pubmed" | "doaj"
    )
    page: int = 1
    per_page: int = 20

    @field_validator("source")
    @classmethod
    def validate_source(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return "all"
        allowed = {"all", "internal", "crossref", "openalex", "pubmed", "doaj"}
        if v not in allowed:
            raise ValueError(f"source must be one of {allowed}")
        return v


class PublicationResult(BaseModel):
    source: str
    external_id: Optional[str] = None
    internal_publication_id: Optional[uuid.UUID] = None
    title: str
    authors: list[str] = []
    journal: Optional[str] = None
    year: Optional[int] = None
    doi: Optional[str] = None
    url: Optional[str] = None
    abstract: Optional[str] = None
    is_open_access: Optional[bool] = None


class CitationRequest(BaseModel):
    publication: PublicationResult
    # "apa7" | "mla9" | "chicago17" | "harvard" | "vancouver"
    style: str = "apa7"

    @field_validator("style")
    @classmethod
    def validate_style(cls, v: str) -> str:
        allowed = {"apa7", "mla9", "chicago17", "harvard", "vancouver"}
        if v not in allowed:
            raise ValueError(f"style must be one of {allowed}")
        return v


class CitationOut(BaseModel):
    style: str
    formatted: str
