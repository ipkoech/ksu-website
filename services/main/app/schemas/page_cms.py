"""Schemas for page composition sections and partnership spotlights."""

from __future__ import annotations

import uuid
from collections.abc import Mapping
from datetime import datetime
from html import unescape
from html.parser import HTMLParser
from typing import Any

from pydantic import ConfigDict, Field, field_validator, model_validator

from app.models import (
    PAGE_SCOPE_TYPES,
    PAGE_SECTION_LAYOUT_VARIANTS,
    PAGE_SECTION_STATUSES,
    PARTNERSHIP_CTA_SOURCES,
    SECTION_ITEM_TYPES,
)
from app.models.page_cms import SECTION_ITEM_REFERENCE_CONTENT_FIELDS, SECTION_ITEM_SOURCE_TYPES

from .base import BaseReadSchema, BaseSchema

PAGE_SECTION_WORKFLOW_ACTIONS = ("submit", "approve", "request_changes", "publish", "archive", "unpublish")
EDITORIAL_OVERRIDE_FIELDS = ("title", "subtitle", "summary", "cta_label", "cta_url", "badge", "image_media_id")


class _DisplayTextParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self.suppressed_depth = 0

    def handle_starttag(self, tag: str, attrs) -> None:
        if tag.lower() in {"script", "style"}:
            self.suppressed_depth += 1

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() in {"script", "style"} and self.suppressed_depth:
            self.suppressed_depth -= 1

    def handle_data(self, data: str) -> None:
        if not self.suppressed_depth:
            self.parts.append(data)


def _plain_display_text(value: str) -> str:
    parser = _DisplayTextParser()
    parser.feed(unescape(value))
    parser.close()
    return " ".join("".join(parser.parts).split())


def _sanitize_source_metadata(value: Any) -> Any:
    if isinstance(value, dict):
        return {
            key: _sanitize_source_metadata(item)
            for key, item in value.items()
            if key != "id" and not key.endswith("_id")
        }
    if isinstance(value, list):
        return [_sanitize_source_metadata(item) for item in value]
    if isinstance(value, str):
        return _plain_display_text(value)[:1000]
    return value


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
    if value == "":
        return value
    if value.startswith(("http://", "https://", "/")):
        return value
    raise ValueError(f"{field_name} must start with http://, https://, or /")


def _validate_editorial_overrides(value: dict[str, Any] | None) -> dict[str, Any] | None:
    if value is None:
        return value
    unsupported_fields = set(value) - set(EDITORIAL_OVERRIDE_FIELDS)
    if unsupported_fields:
        fields = ", ".join(sorted(unsupported_fields))
        raise ValueError(f"editorial_overrides contains unsupported fields: {fields}")
    return value


def _is_empty_reference_content(value: Any) -> bool:
    return value is None or value == "" or value == {} or value == 0


def validate_section_item_state(state: Mapping[str, Any]) -> None:
    """Validate a complete section-item state, including merged PATCH values."""
    item_type = state.get("item_type")
    source_type = state.get("source_type")
    source_id = state.get("source_id")

    if (source_type is None) != (source_id is None):
        raise ValueError("source_type and source_id must be provided together")
    if source_type is not None and item_type != "reference":
        raise ValueError("source references require item_type to be reference")

    if item_type != "reference":
        return

    populated_fields = [
        field
        for field in SECTION_ITEM_REFERENCE_CONTENT_FIELDS
        if not _is_empty_reference_content(state.get(field))
    ]
    if populated_fields:
        fields = ", ".join(populated_fields)
        raise ValueError(f"reference items cannot populate generic fields: {fields}")


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
    source_type: str | None = Field(default=None, max_length=64)
    source_id: uuid.UUID | None = None
    editorial_overrides: dict[str, Any] | None = None
    display_order: int = 100
    is_enabled: bool = True

    @field_validator("item_type")
    @classmethod
    def validate_item_type(cls, value: str) -> str:
        return _validate_choice(value, SECTION_ITEM_TYPES, "item_type") or value

    @field_validator("source_type")
    @classmethod
    def validate_source_type(cls, value: str | None) -> str | None:
        return _validate_choice(value, SECTION_ITEM_SOURCE_TYPES, "source_type")

    @field_validator("editorial_overrides")
    @classmethod
    def validate_editorial_overrides(cls, value: dict[str, Any] | None) -> dict[str, Any] | None:
        return _validate_editorial_overrides(value)

    @field_validator("cta_url")
    @classmethod
    def validate_cta_url(cls, value: str | None) -> str | None:
        return _validate_link_target(value, "cta_url")

    @model_validator(mode="after")
    def validate_source_reference(self):
        validate_section_item_state(self.model_dump())
        return self


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
    source_type: str | None = Field(default=None, max_length=64)
    source_id: uuid.UUID | None = None
    editorial_overrides: dict[str, Any] | None = None
    display_order: int | None = None
    is_enabled: bool | None = None

    @field_validator("item_type")
    @classmethod
    def validate_item_type(cls, value: str | None) -> str | None:
        return _validate_choice(value, SECTION_ITEM_TYPES, "item_type")

    @field_validator("source_type")
    @classmethod
    def validate_source_type(cls, value: str | None) -> str | None:
        return _validate_choice(value, SECTION_ITEM_SOURCE_TYPES, "source_type")

    @field_validator("editorial_overrides")
    @classmethod
    def validate_editorial_overrides(cls, value: dict[str, Any] | None) -> dict[str, Any] | None:
        return _validate_editorial_overrides(value)

    @field_validator("cta_url")
    @classmethod
    def validate_cta_url(cls, value: str | None) -> str | None:
        return _validate_link_target(value, "cta_url")

    @model_validator(mode="after")
    def validate_source_reference(self):
        source_type_supplied = "source_type" in self.model_fields_set
        source_id_supplied = "source_id" in self.model_fields_set
        if source_type_supplied != source_id_supplied:
            raise ValueError("source_type and source_id must be updated together")
        if self.source_type is not None and self.item_type not in (None, "reference"):
            raise ValueError("source references require item_type to be reference")
        if self.item_type == "reference":
            validate_section_item_state(self.model_dump(exclude_unset=True))
        return self


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
    source_type: str | None = None
    source_id: uuid.UUID | None = None
    editorial_overrides: dict[str, Any] | None = None
    display_order: int
    revision: int
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
    revision: int
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


class PageCmsSourceSummary(BaseSchema):
    """Stable, compact representation of a record selectable by Page CMS."""

    id: uuid.UUID
    source_type: str = Field(max_length=64)
    label: str = Field(min_length=1, max_length=255)
    secondary_label: str | None = Field(default=None, max_length=500)
    status: str = Field(max_length=64)
    published_at: datetime | None = None
    thumbnail_url: str | None = Field(default=None, max_length=1024)
    metadata: dict[str, Any] = Field(default_factory=dict)
    selectable: bool = True

    @field_validator("label", "secondary_label", "status", mode="before")
    @classmethod
    def normalize_display_text(cls, value: Any, info):
        if value is None:
            return None
        limits = {"label": 255, "secondary_label": 500, "status": 64}
        normalized = _plain_display_text(str(value))[:limits[info.field_name]].strip()
        return normalized or None

    @field_validator("thumbnail_url")
    @classmethod
    def validate_thumbnail_url(cls, value: str | None) -> str | None:
        if value is None:
            return None
        if not value.startswith(("/", "https://", "http://")):
            raise ValueError("thumbnail_url must be an HTTP(S) or root-relative URL")
        return value

    @field_validator("metadata", mode="before")
    @classmethod
    def sanitize_metadata(cls, value: Any) -> dict[str, Any]:
        return _sanitize_source_metadata(value if isinstance(value, dict) else {})


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
    "PageCmsSourceSummary",
]
