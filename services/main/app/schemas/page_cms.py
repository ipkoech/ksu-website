"""Schemas for page composition sections and partnership spotlights."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import ConfigDict, Field, field_validator, model_validator

from app.models import (
    PAGE_SCOPE_TYPES,
    PAGE_SECTION_LAYOUT_VARIANTS,
    PAGE_SECTION_STATUSES,
    PARTNERSHIP_CTA_SOURCES,
    SECTION_ITEM_TYPES,
)

from .base import BaseReadSchema, BaseSchema

PAGE_SECTION_WORKFLOW_ACTIONS = ("submit", "approve", "request_changes", "publish", "archive", "unpublish")


def _validate_choice(value: str | None, allowed: tuple[str, ...], field_name: str) -> str | None:
    if value is None:
        return value
    if value not in allowed:
        allowed_values = ", ".join(allowed)
        raise ValueError(f"{field_name} must be one of: {allowed_values}")
    return value


def _validate_link_target(value: str | None, field_name: str) -> str | None:
    if value is None:
        return value
    if value.startswith(("http://", "https://", "/")):
        return value
    raise ValueError(f"{field_name} must start with http://, https://, or /")


class MediaRoleDefinitionRead(BaseSchema):
    label: str
    media_type: str
    required: bool = False
    multiple: bool = False


class SectionDefinitionRead(BaseSchema):
    key: str
    label: str
    description: str
    allowed_scopes: tuple[str, ...]
    min_items: int
    max_items: int
    allowed_item_types: tuple[str, ...]
    allowed_source_types: tuple[str, ...]
    media_roles: dict[str, MediaRoleDefinitionRead]
    settings_schema: dict[str, Any]
    required_fields: tuple[str, ...]


class SectionItemCreate(BaseSchema):
    page_section_id: uuid.UUID | None = None
    item_type: str = Field(default=SECTION_ITEM_TYPES[0], max_length=32)
    title: str | None = Field(default=None, max_length=255)
    subtitle: str | None = Field(default=None, max_length=255)
    body_text: str | None = None
    content: dict[str, Any] | None = None
    cta_label: str | None = Field(default=None, max_length=255)
    cta_url: str | None = Field(default=None, max_length=1024)
    cta_description: str | None = Field(default=None, max_length=255)
    media_caption: str | None = None
    media_alt_text: str | None = Field(default=None, max_length=255)
    video_provider: str | None = Field(default=None, max_length=64)
    video_url: str | None = Field(default=None, max_length=1024)
    video_duration_seconds: int | None = None
    display_order: int = 100
    is_enabled: bool = True

    @field_validator("item_type")
    @classmethod
    def validate_item_type(cls, value: str) -> str:
        return _validate_choice(value, SECTION_ITEM_TYPES, "item_type") or value

    @field_validator("cta_url")
    @classmethod
    def validate_cta_url(cls, value: str | None) -> str | None:
        return _validate_link_target(value, "cta_url")


class SectionItemUpdate(BaseSchema):
    page_section_id: uuid.UUID | None = None
    item_type: str | None = Field(default=None, max_length=32)
    title: str | None = Field(default=None, max_length=255)
    subtitle: str | None = Field(default=None, max_length=255)
    body_text: str | None = None
    content: dict[str, Any] | None = None
    cta_label: str | None = Field(default=None, max_length=255)
    cta_url: str | None = Field(default=None, max_length=1024)
    cta_description: str | None = Field(default=None, max_length=255)
    media_caption: str | None = None
    media_alt_text: str | None = Field(default=None, max_length=255)
    video_provider: str | None = Field(default=None, max_length=64)
    video_url: str | None = Field(default=None, max_length=1024)
    video_duration_seconds: int | None = None
    display_order: int | None = None
    is_enabled: bool | None = None

    @field_validator("item_type")
    @classmethod
    def validate_item_type(cls, value: str | None) -> str | None:
        return _validate_choice(value, SECTION_ITEM_TYPES, "item_type")

    @field_validator("cta_url")
    @classmethod
    def validate_cta_url(cls, value: str | None) -> str | None:
        return _validate_link_target(value, "cta_url")


class SectionItemRead(BaseReadSchema):
    page_section_id: uuid.UUID
    item_type: str
    title: str | None = None
    subtitle: str | None = None
    body_text: str | None = None
    content: dict[str, Any] | None = None
    cta_label: str | None = None
    cta_url: str | None = None
    cta_description: str | None = None
    media_caption: str | None = None
    media_alt_text: str | None = None
    video_provider: str | None = None
    video_url: str | None = None
    video_duration_seconds: int | None = None
    display_order: int
    is_enabled: bool


class PageSectionCreate(BaseSchema):
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        str_strip_whitespace=True,
        extra="forbid",
    )

    page_key: str = Field(min_length=1, max_length=64)
    scope_type: str = Field(default=PAGE_SCOPE_TYPES[0], max_length=32)
    scope_id: uuid.UUID | None = None
    section_key: str = Field(min_length=1, max_length=64)
    title: str | None = Field(default=None, max_length=255)
    subtitle: str | None = Field(default=None, max_length=255)
    description: str | None = None
    settings: dict[str, Any] | None = None
    display_order: int = 100
    is_enabled: bool = True
    layout_variant: str = Field(default=PAGE_SECTION_LAYOUT_VARIANTS[0], max_length=64)
    valid_from: datetime | None = None
    valid_to: datetime | None = None
    items: list[SectionItemCreate] = Field(default_factory=list)

    @field_validator("scope_type")
    @classmethod
    def validate_scope_type(cls, value: str) -> str:
        return _validate_choice(value, PAGE_SCOPE_TYPES, "scope_type") or value

    @field_validator("layout_variant")
    @classmethod
    def validate_layout_variant(cls, value: str) -> str:
        return _validate_choice(value, PAGE_SECTION_LAYOUT_VARIANTS, "layout_variant") or value

    @model_validator(mode="after")
    def validate_scope_and_window(self):
        if self.scope_type == "school" and self.scope_id is None:
            raise ValueError("scope_id is required when scope_type is school")
        if self.valid_from and self.valid_to and self.valid_to < self.valid_from:
            raise ValueError("valid_to must be greater than or equal to valid_from")
        return self


class PageSectionUpdate(BaseSchema):
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        str_strip_whitespace=True,
        extra="forbid",
    )

    page_key: str | None = Field(default=None, min_length=1, max_length=64)
    scope_type: str | None = Field(default=None, max_length=32)
    scope_id: uuid.UUID | None = None
    section_key: str | None = Field(default=None, min_length=1, max_length=64)
    title: str | None = Field(default=None, max_length=255)
    subtitle: str | None = Field(default=None, max_length=255)
    description: str | None = None
    settings: dict[str, Any] | None = None
    display_order: int | None = None
    is_enabled: bool | None = None
    layout_variant: str | None = Field(default=None, max_length=64)
    valid_from: datetime | None = None
    valid_to: datetime | None = None
    items: list[SectionItemUpdate] | None = None

    @field_validator("scope_type")
    @classmethod
    def validate_scope_type(cls, value: str | None) -> str | None:
        return _validate_choice(value, PAGE_SCOPE_TYPES, "scope_type")

    @field_validator("layout_variant")
    @classmethod
    def validate_layout_variant(cls, value: str | None) -> str | None:
        return _validate_choice(value, PAGE_SECTION_LAYOUT_VARIANTS, "layout_variant")

    @model_validator(mode="after")
    def validate_scope_and_window(self):
        if self.scope_type == "school" and self.scope_id is None:
            raise ValueError("scope_id is required when scope_type is school")
        if self.valid_from and self.valid_to and self.valid_to < self.valid_from:
            raise ValueError("valid_to must be greater than or equal to valid_from")
        return self


class PageSectionRead(BaseReadSchema):
    page_key: str
    scope_type: str
    scope_id: uuid.UUID | None = None
    section_key: str
    title: str | None = None
    subtitle: str | None = None
    description: str | None = None
    settings: dict[str, Any] | None = None
    display_order: int
    is_enabled: bool
    layout_variant: str
    status: str
    workflow_status: str = PAGE_SECTION_STATUSES[0]
    owner_portal: str | None = None
    owner_scope_type: str | None = None
    owner_scope_id: uuid.UUID | None = None
    valid_from: datetime | None = None
    valid_to: datetime | None = None
    scheduled_publish_at: datetime | None = None
    expires_at: datetime | None = None
    submitted_by_id: uuid.UUID | None = None
    submitted_at: datetime | None = None
    reviewed_by_id: uuid.UUID | None = None
    reviewed_at: datetime | None = None
    approved_at: datetime | None = None
    published_at: datetime | None = None
    unpublished_by_id: uuid.UUID | None = None
    unpublished_at: datetime | None = None
    rejection_reason: str | None = None
    revision_notes: str | None = None
    created_by_id: uuid.UUID | None = None
    updated_by_id: uuid.UUID | None = None
    approved_by_id: uuid.UUID | None = None
    published_by_id: uuid.UUID | None = None
    items: list[SectionItemRead] = Field(default_factory=list)
    created_by: dict[str, Any] | None = None
    updated_by: dict[str, Any] | None = None
    approved_by: dict[str, Any] | None = None
    published_by: dict[str, Any] | None = None


class PartnershipSpotlightCreate(BaseSchema):
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        str_strip_whitespace=True,
        extra="forbid",
    )

    source_type: str = Field(default="research_partner", max_length=64)
    source_id: uuid.UUID
    primary_cta_source: str = Field(default=PARTNERSHIP_CTA_SOURCES[0], max_length=32)
    primary_cta_label: str | None = Field(default=None, max_length=255)
    primary_cta_url: str | None = Field(default=None, max_length=1024)
    headline: str = Field(min_length=1, max_length=255)
    summary: str | None = None
    pillars: list[dict[str, Any]] | None = None
    opportunities: list[dict[str, Any]] | None = None
    is_enabled: bool = True
    valid_from: datetime | None = None
    valid_to: datetime | None = None

    @field_validator("source_type")
    @classmethod
    def validate_source_type(cls, value: str) -> str:
        if value != "research_partner":
            raise ValueError("source_type must be research_partner")
        return value

    @field_validator("primary_cta_source")
    @classmethod
    def validate_primary_cta_source(cls, value: str) -> str:
        return _validate_choice(value, PARTNERSHIP_CTA_SOURCES, "primary_cta_source") or value

    @field_validator("primary_cta_url")
    @classmethod
    def validate_primary_cta_url(cls, value: str | None) -> str | None:
        return _validate_link_target(value, "primary_cta_url")

    @model_validator(mode="after")
    def validate_window(self):
        if self.valid_from and self.valid_to and self.valid_to < self.valid_from:
            raise ValueError("valid_to must be greater than or equal to valid_from")
        return self


class PartnershipSpotlightUpdate(BaseSchema):
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        str_strip_whitespace=True,
        extra="forbid",
    )

    source_type: str | None = Field(default=None, max_length=64)
    source_id: uuid.UUID | None = None
    primary_cta_source: str | None = Field(default=None, max_length=32)
    primary_cta_label: str | None = Field(default=None, max_length=255)
    primary_cta_url: str | None = Field(default=None, max_length=1024)
    headline: str | None = Field(default=None, min_length=1, max_length=255)
    summary: str | None = None
    pillars: list[dict[str, Any]] | None = None
    opportunities: list[dict[str, Any]] | None = None
    is_enabled: bool | None = None
    valid_from: datetime | None = None
    valid_to: datetime | None = None

    @field_validator("source_type")
    @classmethod
    def validate_source_type(cls, value: str | None) -> str | None:
        if value is None:
            return value
        if value != "research_partner":
            raise ValueError("source_type must be research_partner")
        return value

    @field_validator("primary_cta_source")
    @classmethod
    def validate_primary_cta_source(cls, value: str | None) -> str | None:
        return _validate_choice(value, PARTNERSHIP_CTA_SOURCES, "primary_cta_source")

    @field_validator("primary_cta_url")
    @classmethod
    def validate_primary_cta_url(cls, value: str | None) -> str | None:
        return _validate_link_target(value, "primary_cta_url")

    @model_validator(mode="after")
    def validate_window(self):
        if self.valid_from and self.valid_to and self.valid_to < self.valid_from:
            raise ValueError("valid_to must be greater than or equal to valid_from")
        return self


class PartnershipSpotlightRead(BaseReadSchema):
    source_type: str
    source_id: uuid.UUID
    primary_cta_source: str
    primary_cta_label: str | None = None
    primary_cta_url: str | None = None
    headline: str
    summary: str | None = None
    pillars: list[dict[str, Any]] | None = None
    opportunities: list[dict[str, Any]] | None = None
    is_enabled: bool
    status: str
    workflow_status: str = PAGE_SECTION_STATUSES[0]
    owner_portal: str | None = None
    owner_scope_type: str | None = None
    owner_scope_id: uuid.UUID | None = None
    valid_from: datetime | None = None
    valid_to: datetime | None = None
    scheduled_publish_at: datetime | None = None
    expires_at: datetime | None = None
    submitted_by_id: uuid.UUID | None = None
    submitted_at: datetime | None = None
    reviewed_by_id: uuid.UUID | None = None
    reviewed_at: datetime | None = None
    approved_by_id: uuid.UUID | None = None
    approved_at: datetime | None = None
    published_by_id: uuid.UUID | None = None
    published_at: datetime | None = None
    unpublished_by_id: uuid.UUID | None = None
    unpublished_at: datetime | None = None
    rejection_reason: str | None = None
    revision_notes: str | None = None


class PageSectionWorkflowAction(BaseSchema):
    action: str = Field(min_length=1, max_length=64)
    note: str | None = None

    @field_validator("action")
    @classmethod
    def validate_action(cls, value: str) -> str:
        return _validate_choice(value, PAGE_SECTION_WORKFLOW_ACTIONS, "action") or value


class PageCompositionResponse(BaseSchema):
    page_key: str = Field(min_length=1, max_length=64)
    scope_type: str = Field(max_length=32)
    scope_id: uuid.UUID | None = None
    sections: list[PageSectionRead] = Field(default_factory=list)
    partnership_spotlights: list[PartnershipSpotlightRead] = Field(default_factory=list)


__all__ = [
    "PARTNERSHIP_CTA_SOURCES",
    "PAGE_SECTION_WORKFLOW_ACTIONS",
    "MediaRoleDefinitionRead",
    "SectionDefinitionRead",
    "SectionItemCreate",
    "SectionItemUpdate",
    "SectionItemRead",
    "PageSectionCreate",
    "PageSectionUpdate",
    "PageSectionRead",
    "PartnershipSpotlightCreate",
    "PartnershipSpotlightUpdate",
    "PartnershipSpotlightRead",
    "PageSectionWorkflowAction",
    "PageCompositionResponse",
]
