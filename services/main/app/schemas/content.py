"""Content schemas for news, blogs, announcements, events, and sliders."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import ConfigDict, Field, model_validator

from .base import BaseReadSchema, BaseSchema, SlugStr


class ScopedContentCreate(BaseSchema):
    model_config = ConfigDict(extra="forbid")

    scope_type: str | None = Field(default=None, max_length=32)
    scope_id: uuid.UUID | None = None
    is_main: bool = False
    valid_from: datetime | None = None
    valid_to: datetime | None = None
    display_order: int = 100

    @model_validator(mode="after")
    def validate_window(self):
        if self.valid_from and self.valid_to and self.valid_to < self.valid_from:
            raise ValueError("valid_to must be greater than or equal to valid_from")
        return self


class ScopedContentRead(BaseReadSchema):
    scope_type: str | None = None
    scope_id: uuid.UUID | None = None
    is_main: bool
    is_public: bool
    is_published: bool
    published_at: datetime | None = None
    valid_from: datetime | None = None
    valid_to: datetime | None = None
    archived_at: datetime | None = None
    status: str
    workflow_status: str
    owner_portal: str | None = None
    owner_scope_type: str | None = None
    owner_scope_id: uuid.UUID | None = None
    submitted_by_id: uuid.UUID | None = None
    submitted_at: datetime | None = None
    reviewed_by_id: uuid.UUID | None = None
    reviewed_at: datetime | None = None
    approved_by_id: uuid.UUID | None = None
    approved_at: datetime | None = None
    published_by_id: uuid.UUID | None = None
    scheduled_publish_at: datetime | None = None
    expires_at: datetime | None = None
    unpublished_by_id: uuid.UUID | None = None
    unpublished_at: datetime | None = None
    rejection_reason: str | None = None
    revision_notes: str | None = None
    display_order: int
    deleted_at: datetime | None = None


class ScopeSummary(BaseSchema):
    type: str
    id: uuid.UUID
    label: str
    status: str | None = None
    slug: str | None = None


class RichContentCreate(ScopedContentCreate):
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


class RichContentUpdate(BaseSchema):
    model_config = ConfigDict(extra="forbid")

    title: str | None = Field(default=None, min_length=1, max_length=255)
    slug: SlugStr | None = None
    summary: str | None = None
    plain_text: str | None = None
    rich_text: str | None = None
    structured_content: dict[str, Any] | None = None
    related_links: list[dict[str, Any]] | None = None
    featured_media_id: uuid.UUID | None = None
    scope_type: str | None = Field(default=None, max_length=32)
    scope_id: uuid.UUID | None = None
    is_main: bool | None = None
    valid_from: datetime | None = None
    valid_to: datetime | None = None
    display_order: int | None = None
    meta_title: str | None = Field(default=None, max_length=255)
    meta_description: str | None = Field(default=None, max_length=500)
    keywords: dict[str, Any] | None = None

    @model_validator(mode="after")
    def validate_window(self):
        if self.valid_from and self.valid_to and self.valid_to < self.valid_from:
            raise ValueError("valid_to must be greater than or equal to valid_from")
        return self



class RichContentRead(ScopedContentRead):
    title: str
    slug: str
    summary: str | None = None
    plain_text: str | None = None
    rich_text: str | None = None
    structured_content: dict[str, Any] | None = None
    related_links: list[dict[str, Any]] | None = None
    featured_media_id: uuid.UUID | None = None
    featured_media: dict[str, Any] | None = None
    author_user_id: uuid.UUID | None = None
    author: dict[str, Any] | None = None
    meta_title: str | None = None
    meta_description: str | None = None
    keywords: dict[str, Any] | None = None


class NewsCreate(RichContentCreate):
    is_featured: bool = False


class NewsUpdate(RichContentUpdate):
    is_featured: bool | None = None


class NewsRead(RichContentRead):
    author: dict[str, Any] | None = None
    featured_media: dict[str, Any] | None = None
    is_featured: bool


class BlogCreate(RichContentCreate):
    excerpt: str | None = None
    is_featured: bool = False


class BlogUpdate(RichContentUpdate):
    excerpt: str | None = None
    is_featured: bool | None = None


class BlogRead(RichContentRead):
    excerpt: str | None = None
    author: dict[str, Any] | None = None
    featured_media: dict[str, Any] | None = None
    is_featured: bool


class AnnouncementCreate(RichContentCreate):
    priority: str = Field(default="normal", max_length=32)
    category: str | None = Field(default=None, max_length=64)
    audience: str = Field(default="all", max_length=64)
    youtube_url: str | None = Field(default=None, max_length=512)


class AnnouncementUpdate(RichContentUpdate):
    priority: str | None = Field(default=None, max_length=32)
    category: str | None = Field(default=None, max_length=64)
    audience: str | None = Field(default=None, max_length=64)
    youtube_url: str | None = Field(default=None, max_length=512)


class AnnouncementRead(RichContentRead):
    priority: str
    category: str | None = None
    author: dict[str, Any] | None = None
    featured_media: dict[str, Any] | None = None
    audience: str
    youtube_url: str | None = None


class EventCreate(ScopedContentCreate):
    title: str = Field(min_length=1, max_length=255)
    slug: SlugStr
    summary: str | None = None
    plain_text: str | None = None
    rich_text: str | None = None
    structured_content: dict[str, Any] | None = None
    start_date: datetime
    end_date: datetime | None = None
    location: str | None = Field(default=None, max_length=255)
    is_virtual: bool = False
    meeting_link: str | None = Field(default=None, max_length=512)
    is_featured: bool = False
    featured_media_id: uuid.UUID | None = None
    related_links: list[dict[str, Any]] | None = None
    meta_title: str | None = Field(default=None, max_length=255)
    meta_description: str | None = Field(default=None, max_length=500)
    keywords: dict[str, Any] | None = None


class EventUpdate(BaseSchema):
    model_config = ConfigDict(extra="forbid")

    title: str | None = Field(default=None, min_length=1, max_length=255)
    slug: SlugStr | None = None
    summary: str | None = None
    plain_text: str | None = None
    rich_text: str | None = None
    structured_content: dict[str, Any] | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    location: str | None = Field(default=None, max_length=255)
    is_virtual: bool | None = None
    meeting_link: str | None = Field(default=None, max_length=512)
    is_featured: bool | None = None
    featured_media_id: uuid.UUID | None = None
    related_links: list[dict[str, Any]] | None = None
    scope_type: str | None = Field(default=None, max_length=32)
    scope_id: uuid.UUID | None = None
    is_main: bool | None = None
    valid_from: datetime | None = None
    valid_to: datetime | None = None
    display_order: int | None = None
    meta_title: str | None = Field(default=None, max_length=255)
    meta_description: str | None = Field(default=None, max_length=500)
    keywords: dict[str, Any] | None = None

    @model_validator(mode="after")
    def validate_window(self):
        if self.valid_from and self.valid_to and self.valid_to < self.valid_from:
            raise ValueError("valid_to must be greater than or equal to valid_from")
        return self



class EventRead(ScopedContentRead):
    title: str
    slug: str
    summary: str | None = None
    plain_text: str | None = None
    rich_text: str | None = None
    structured_content: dict[str, Any] | None = None
    start_date: datetime
    end_date: datetime | None = None
    location: str | None = None
    is_virtual: bool
    meeting_link: str | None = None
    is_featured: bool
    featured_media_id: uuid.UUID | None = None
    featured_media: dict[str, Any] | None = None
    author_user_id: uuid.UUID | None = None
    author: dict[str, Any] | None = None
    related_links: list[dict[str, Any]] | None = None
    meta_title: str | None = None
    meta_description: str | None = None
    keywords: dict[str, Any] | None = None
    scope: ScopeSummary | None = None


class SliderGroupCreate(BaseSchema):
    name: str = Field(min_length=1, max_length=255)
    slug: SlugStr
    location: str | None = Field(default=None, max_length=255)
    scope_type: str | None = Field(default=None, max_length=32)
    scope_id: uuid.UUID | None = None
    is_main: bool = False
    is_public: bool = True
    is_active: bool = True
    max_slides: int | None = None
    auto_play: bool = False
    auto_play_duration: int | None = None
    show_navigation_dots: bool = True
    show_arrows: bool = True
    transition_effect: str | None = Field(default=None, max_length=64)


class SliderGroupUpdate(BaseSchema):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    slug: SlugStr | None = None
    location: str | None = Field(default=None, max_length=255)
    scope_type: str | None = Field(default=None, max_length=32)
    scope_id: uuid.UUID | None = None
    is_main: bool | None = None
    is_public: bool | None = None
    is_active: bool | None = None
    max_slides: int | None = None
    auto_play: bool | None = None
    auto_play_duration: int | None = None
    show_navigation_dots: bool | None = None
    show_arrows: bool | None = None
    transition_effect: str | None = Field(default=None, max_length=64)


class SliderGroupRead(BaseReadSchema):
    name: str
    slug: str
    location: str | None = None
    scope_type: str | None = None
    scope_id: uuid.UUID | None = None
    is_main: bool
    is_public: bool
    is_active: bool
    max_slides: int | None = None
    auto_play: bool
    auto_play_duration: int | None = None
    show_navigation_dots: bool
    show_arrows: bool
    transition_effect: str | None = None
    sliders: list[dict[str, Any]] | None = None
    deleted_at: datetime | None = None


class SliderCreate(BaseSchema):
    model_config = ConfigDict(extra="forbid")

    slider_group_id: uuid.UUID | None = None
    title: str = Field(min_length=1, max_length=255)
    subtitle: str | None = Field(default=None, max_length=255)
    plain_text: str | None = None
    rich_text: str | None = None
    structured_content: dict[str, Any] | None = None
    desktop_media_id: uuid.UUID | None = None
    mobile_media_id: uuid.UUID | None = None
    external_url: str | None = Field(default=None, max_length=1024)
    link_text: str | None = Field(default=None, max_length=255)
    open_in_new_tab: bool = False
    scope_type: str | None = Field(default=None, max_length=32)
    scope_id: uuid.UUID | None = None
    is_main: bool = False
    is_active: bool = True
    start_datetime: datetime | None = None
    end_datetime: datetime | None = None
    display_order: int = 100

    @model_validator(mode="after")
    def validate_window(self):
        if self.start_datetime and self.end_datetime and self.end_datetime < self.start_datetime:
            raise ValueError("end_datetime must be greater than or equal to start_datetime")
        return self


class SliderUpdate(BaseSchema):
    model_config = ConfigDict(extra="forbid")

    slider_group_id: uuid.UUID | None = None
    title: str | None = Field(default=None, min_length=1, max_length=255)
    subtitle: str | None = Field(default=None, max_length=255)
    plain_text: str | None = None
    rich_text: str | None = None
    structured_content: dict[str, Any] | None = None
    desktop_media_id: uuid.UUID | None = None
    mobile_media_id: uuid.UUID | None = None
    external_url: str | None = Field(default=None, max_length=1024)
    link_text: str | None = Field(default=None, max_length=255)
    open_in_new_tab: bool | None = None
    scope_type: str | None = Field(default=None, max_length=32)
    scope_id: uuid.UUID | None = None
    is_main: bool | None = None
    is_active: bool | None = None
    start_datetime: datetime | None = None
    end_datetime: datetime | None = None
    display_order: int | None = None

    @model_validator(mode="after")
    def validate_window(self):
        if self.start_datetime and self.end_datetime and self.end_datetime < self.start_datetime:
            raise ValueError("end_datetime must be greater than or equal to start_datetime")
        return self


class SliderRead(BaseReadSchema):
    slider_group_id: uuid.UUID | None = None
    title: str
    subtitle: str | None = None
    plain_text: str | None = None
    rich_text: str | None = None
    structured_content: dict[str, Any] | None = None
    desktop_media_id: uuid.UUID | None = None
    desktop_media: dict[str, Any] | None = None
    mobile_media_id: uuid.UUID | None = None
    mobile_media: dict[str, Any] | None = None
    slider_group: dict[str, Any] | None = None
    external_url: str | None = None
    link_text: str | None = None
    open_in_new_tab: bool
    scope_type: str | None = None
    scope_id: uuid.UUID | None = None
    is_main: bool
    is_public: bool
    is_active: bool
    start_datetime: datetime | None = None
    end_datetime: datetime | None = None
    archived_at: datetime | None = None
    workflow_status: str
    owner_portal: str | None = None
    owner_scope_type: str | None = None
    owner_scope_id: uuid.UUID | None = None
    submitted_by_id: uuid.UUID | None = None
    submitted_at: datetime | None = None
    reviewed_by_id: uuid.UUID | None = None
    reviewed_at: datetime | None = None
    approved_by_id: uuid.UUID | None = None
    approved_at: datetime | None = None
    published_by_id: uuid.UUID | None = None
    published_at: datetime | None = None
    scheduled_publish_at: datetime | None = None
    expires_at: datetime | None = None
    unpublished_by_id: uuid.UUID | None = None
    unpublished_at: datetime | None = None
    rejection_reason: str | None = None
    revision_notes: str | None = None
    display_order: int
    deleted_at: datetime | None = None
