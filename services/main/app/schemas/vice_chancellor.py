"""Schemas for the Meet the Vice Chancellor content studio."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Any

from pydantic import ConfigDict, Field, model_validator

from app.models.vice_chancellor import (
    VC_SECTIONS,
    VC_SPEECH_TYPES,
    VC_SPEECH_VIDEO_ROLES,
    VC_VIDEO_PROVIDERS,
)

from .base import BaseReadSchema, BaseSchema, SlugStr
from .content import RichContentRead, ScopedContentRead


class _StrictSchema(BaseSchema):
    model_config = ConfigDict(extra="forbid", from_attributes=True, str_strip_whitespace=True)


def _validate_window(start: datetime | None, end: datetime | None) -> None:
    if start and end and end < start:
        raise ValueError("visible_to must be greater than or equal to visible_from")


class VcHubUpdate(_StrictSchema):
    staff_assignment_id: uuid.UUID | None = None
    eyebrow: str | None = Field(default=None, min_length=1, max_length=128)
    title: str | None = Field(default=None, min_length=1, max_length=255)
    introduction: str | None = None
    welcome_title: str | None = Field(default=None, max_length=255)
    welcome_message: str | None = None
    hero_media_id: uuid.UUID | None = None
    welcome_video_id: uuid.UUID | None = None
    professional_profile_url: str | None = Field(default=None, min_length=1, max_length=1024)
    section_order: list[str] | None = None
    section_visibility: dict[str, bool] | None = None

    @model_validator(mode="after")
    def validate_sections(self):
        if self.section_order is not None:
            if len(self.section_order) != len(set(self.section_order)) or set(self.section_order) != set(VC_SECTIONS):
                raise ValueError(f"section_order must contain each supported section exactly once: {', '.join(VC_SECTIONS)}")
        if self.section_visibility is not None and not set(self.section_visibility).issubset(VC_SECTIONS):
            raise ValueError("section_visibility contains an unknown section")
        return self


class VcHubRead(ScopedContentRead):
    staff_assignment_id: uuid.UUID | None = None
    eyebrow: str
    title: str
    introduction: str | None = None
    welcome_title: str | None = None
    welcome_message: str | None = None
    hero_media_id: uuid.UUID | None = None
    welcome_video_id: uuid.UUID | None = None
    professional_profile_url: str
    section_order: list[str]
    section_visibility: dict[str, bool]


class VcVideoCreate(_StrictSchema):
    title: str = Field(min_length=1, max_length=255)
    slug: SlugStr
    summary: str | None = None
    transcript: str | None = None
    provider: str = Field(max_length=32)
    source_url: str | None = Field(default=None, max_length=1024)
    uploaded_media_id: uuid.UUID | None = None
    poster_media_id: uuid.UUID | None = None
    duration_seconds: int | None = Field(default=None, ge=0)
    recorded_at: datetime | None = None
    category: str | None = Field(default=None, max_length=96)
    is_featured: bool = False
    display_order: int = 100

    @model_validator(mode="after")
    def validate_provider_source(self):
        if self.provider not in VC_VIDEO_PROVIDERS:
            raise ValueError(f"provider must be one of: {', '.join(VC_VIDEO_PROVIDERS)}")
        if self.provider == "youtube":
            if not self.source_url:
                raise ValueError("source_url is required for YouTube videos")
            if self.uploaded_media_id:
                raise ValueError("uploaded_media_id is not allowed for YouTube videos")
        elif not self.uploaded_media_id:
            raise ValueError("uploaded_media_id is required for uploaded videos")
        elif self.source_url:
            raise ValueError("source_url is not allowed for uploaded videos")
        return self


class VcVideoUpdate(_StrictSchema):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    slug: SlugStr | None = None
    summary: str | None = None
    transcript: str | None = None
    source_url: str | None = Field(default=None, max_length=1024)
    uploaded_media_id: uuid.UUID | None = None
    poster_media_id: uuid.UUID | None = None
    duration_seconds: int | None = Field(default=None, ge=0)
    recorded_at: datetime | None = None
    category: str | None = Field(default=None, max_length=96)
    is_featured: bool | None = None
    display_order: int | None = None


class VcVideoRead(ScopedContentRead):
    title: str
    slug: str
    summary: str | None = None
    transcript: str | None = None
    provider: str
    source_url: str | None = None
    provider_video_id: str | None = None
    embed_url: str | None = None
    thumbnail_url: str | None = None
    poster_media_id: uuid.UUID | None = None
    uploaded_media_id: uuid.UUID | None = None
    duration_seconds: int | None = None
    recorded_at: datetime | None = None
    category: str | None = None
    is_featured: bool


class VcSpeechCreate(_StrictSchema):
    title: str = Field(min_length=1, max_length=255)
    slug: SlugStr
    summary: str | None = None
    plain_text: str | None = None
    rich_text: str | None = None
    structured_content: dict[str, Any] | None = None
    related_links: list[dict[str, Any]] | None = None
    featured_media_id: uuid.UUID | None = None
    meta_title: str | None = Field(default=None, max_length=255)
    meta_description: str | None = Field(default=None, max_length=500)
    keywords: dict[str, Any] | None = None
    speech_type: str = "speech"
    delivered_at: datetime | None = None
    venue: str | None = Field(default=None, max_length=255)
    occasion: str | None = Field(default=None, max_length=255)
    audience: str | None = Field(default=None, max_length=255)
    document_media_id: uuid.UUID | None = None
    is_featured: bool = False
    display_order: int = 100

    @model_validator(mode="after")
    def validate_speech_type(self):
        if self.speech_type not in VC_SPEECH_TYPES:
            raise ValueError(f"speech_type must be one of: {', '.join(VC_SPEECH_TYPES)}")
        return self


class VcSpeechUpdate(_StrictSchema):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    slug: SlugStr | None = None
    summary: str | None = None
    plain_text: str | None = None
    rich_text: str | None = None
    structured_content: dict[str, Any] | None = None
    related_links: list[dict[str, Any]] | None = None
    featured_media_id: uuid.UUID | None = None
    meta_title: str | None = Field(default=None, max_length=255)
    meta_description: str | None = Field(default=None, max_length=500)
    keywords: dict[str, Any] | None = None
    speech_type: str | None = None
    delivered_at: datetime | None = None
    venue: str | None = Field(default=None, max_length=255)
    occasion: str | None = Field(default=None, max_length=255)
    audience: str | None = Field(default=None, max_length=255)
    document_media_id: uuid.UUID | None = None
    is_featured: bool | None = None
    display_order: int | None = None

    @model_validator(mode="after")
    def validate_speech_type(self):
        if self.speech_type is not None and self.speech_type not in VC_SPEECH_TYPES:
            raise ValueError(f"speech_type must be one of: {', '.join(VC_SPEECH_TYPES)}")
        return self


class VcSpeechRead(RichContentRead):
    speech_type: str
    delivered_at: datetime | None = None
    venue: str | None = None
    occasion: str | None = None
    audience: str | None = None
    document_media_id: uuid.UUID | None = None
    is_featured: bool


class VcSpeechVideoCreate(_StrictSchema):
    video_id: uuid.UUID
    role: str = "related"
    display_order: int = 100

    @model_validator(mode="after")
    def validate_role(self):
        if self.role not in VC_SPEECH_VIDEO_ROLES:
            raise ValueError(f"role must be one of: {', '.join(VC_SPEECH_VIDEO_ROLES)}")
        return self


class VcSpeechVideoRead(BaseReadSchema):
    speech_id: uuid.UUID
    video_id: uuid.UUID
    role: str
    display_order: int


class VcGalleryAlbumCreate(_StrictSchema):
    title: str = Field(min_length=1, max_length=255)
    slug: SlugStr
    summary: str | None = None
    event_date: date | None = None
    location: str | None = Field(default=None, max_length=255)
    cover_media_id: uuid.UUID | None = None
    is_featured: bool = False
    display_order: int = 100
    meta_title: str | None = Field(default=None, max_length=255)
    meta_description: str | None = Field(default=None, max_length=500)
    keywords: dict[str, Any] | None = None


class VcGalleryAlbumUpdate(_StrictSchema):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    slug: SlugStr | None = None
    summary: str | None = None
    event_date: date | None = None
    location: str | None = Field(default=None, max_length=255)
    cover_media_id: uuid.UUID | None = None
    is_featured: bool | None = None
    display_order: int | None = None
    meta_title: str | None = Field(default=None, max_length=255)
    meta_description: str | None = Field(default=None, max_length=500)
    keywords: dict[str, Any] | None = None


class VcGalleryAlbumRead(ScopedContentRead):
    title: str
    slug: str
    summary: str | None = None
    event_date: date | None = None
    location: str | None = None
    cover_media_id: uuid.UUID | None = None
    is_featured: bool
    meta_title: str | None = None
    meta_description: str | None = None
    keywords: dict[str, Any] | None = None


class VcGalleryMediaCreate(_StrictSchema):
    media_id: uuid.UUID
    display_order: int = 100
    caption: str | None = None
    alt_text: str | None = Field(default=None, max_length=255)


class VcHubPlacementCreate(_StrictSchema):
    section: str
    news_id: uuid.UUID | None = None
    event_id: uuid.UUID | None = None
    speech_id: uuid.UUID | None = None
    video_id: uuid.UUID | None = None
    gallery_album_id: uuid.UUID | None = None
    editorial_label: str | None = Field(default=None, max_length=128)
    title_override: str | None = Field(default=None, max_length=255)
    summary_override: str | None = None
    poster_media_id: uuid.UUID | None = None
    is_featured: bool = False
    display_order: int = 100
    visible_from: datetime | None = None
    visible_to: datetime | None = None
    is_enabled: bool = True

    @model_validator(mode="after")
    def validate_source(self):
        mapping = {
            "activities": "news_id", "events": "event_id", "speeches": "speech_id",
            "videos": "video_id", "gallery": "gallery_album_id",
        }
        sources = [name for name in mapping.values() if getattr(self, name) is not None]
        if len(sources) != 1:
            raise ValueError("exactly one source is required")
        if self.section not in mapping or sources[0] != mapping[self.section]:
            raise ValueError("source does not match section")
        _validate_window(self.visible_from, self.visible_to)
        return self


class VcHubPlacementUpdate(_StrictSchema):
    editorial_label: str | None = Field(default=None, max_length=128)
    title_override: str | None = Field(default=None, max_length=255)
    summary_override: str | None = None
    poster_media_id: uuid.UUID | None = None
    is_featured: bool | None = None
    display_order: int | None = None
    visible_from: datetime | None = None
    visible_to: datetime | None = None
    is_enabled: bool | None = None

    @model_validator(mode="after")
    def validate_window(self):
        _validate_window(self.visible_from, self.visible_to)
        return self


class VcHubPlacementRead(BaseReadSchema):
    hub_id: uuid.UUID
    section: str
    news_id: uuid.UUID | None = None
    event_id: uuid.UUID | None = None
    speech_id: uuid.UUID | None = None
    video_id: uuid.UUID | None = None
    gallery_album_id: uuid.UUID | None = None
    editorial_label: str | None = None
    title_override: str | None = None
    summary_override: str | None = None
    poster_media_id: uuid.UUID | None = None
    is_featured: bool
    display_order: int
    visible_from: datetime | None = None
    visible_to: datetime | None = None
    is_enabled: bool


class VcReorderItem(_StrictSchema):
    id: uuid.UUID
    display_order: int


class VcReorderRequest(_StrictSchema):
    items: list[VcReorderItem] = Field(min_length=1)


class VcWorkflowAction(_StrictSchema):
    action: str | None = None
    reason: str | None = None
    note: str | None = None


class YouTubePreviewRequest(_StrictSchema):
    url: str = Field(min_length=1, max_length=1024)
