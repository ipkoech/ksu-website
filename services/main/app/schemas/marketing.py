"""Marketing schemas."""

from __future__ import annotations

import uuid
from typing import Any
from datetime import datetime

from pydantic import Field

from .base import BaseReadSchema, BaseSchema, SlugStr, UrlStr


class NewsletterCreate(BaseSchema):
    title: str = Field(min_length=1, max_length=255)
    slug: SlugStr | None = None
    edition: str | None = Field(default=None, max_length=64)
    summary: str | None = None
    content: str | None = None
    published_at: datetime | None = None
    scheduled_send_at: datetime | None = None
    cover_image_id: uuid.UUID | None = None
    pdf_file_id: uuid.UUID | None = None
    status: str = Field(default="draft", max_length=32)
    is_public: bool = True


class NewsletterUpdate(BaseSchema):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    slug: SlugStr | None = None
    edition: str | None = Field(default=None, max_length=64)
    summary: str | None = None
    content: str | None = None
    published_at: datetime | None = None
    scheduled_send_at: datetime | None = None
    cover_image_id: uuid.UUID | None = None
    pdf_file_id: uuid.UUID | None = None
    status: str | None = Field(default=None, max_length=32)
    is_public: bool | None = None


class NewsletterRead(BaseReadSchema):
    title: str
    slug: str
    edition: str | None = None
    summary: str | None = None
    content: str | None = None
    published_at: datetime | None = None
    scheduled_send_at: datetime | None = None
    sent_at: datetime | None = None
    send_status: str
    send_error: str | None = None
    recipients_count: int | None = None
    sent_count: int | None = None
    cover_image_id: uuid.UUID | None = None
    pdf_file_id: uuid.UUID | None = None
    view_count: int
    status: str
    cover_image: dict[str, Any] | None = None
    pdf_file: dict[str, Any] | None = None
    updated_by_id: uuid.UUID | None = None
    updated_by: dict[str, Any] | None = None
    is_public: bool


class NewsletterScheduleRequest(BaseSchema):
    """Body for POST /newsletters/{id}/schedule."""

    scheduled_send_at: datetime


class NewsletterSubscriberCreate(BaseSchema):
    email: str
    name: str | None = Field(default=None, max_length=255)
    frequency: str = Field(default="all", max_length=32)
    categories: list[str] | None = None


class NewsletterSubscriberRead(BaseReadSchema):
    email: str
    name: str | None = None
    subscribed_at: datetime
    unsubscribed_at: datetime | None = None
    frequency: str
    categories: list[str] | None = None
    is_verified: bool
    status: str


class TestimonialCreate(BaseSchema):
    person_id: uuid.UUID | None = None
    name: str = Field(min_length=1, max_length=255)
    role: str | None = Field(default=None, max_length=255)
    quote: str = Field(min_length=1)
    full_story: str | None = None
    testimonial_type: str = Field(min_length=1, max_length=32)
    school_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    programme_id: uuid.UUID | None = None
    photo_id: uuid.UUID | None = None
    video_url: UrlStr | None = None
    is_featured: bool = False
    display_order: int = 100
    is_approved: bool = False
    is_public: bool = True


class TestimonialUpdate(BaseSchema):
    person_id: uuid.UUID | None = None
    name: str | None = Field(default=None, min_length=1, max_length=255)
    role: str | None = Field(default=None, max_length=255)
    quote: str | None = None
    full_story: str | None = None
    testimonial_type: str | None = Field(default=None, max_length=32)
    school_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    programme_id: uuid.UUID | None = None
    photo_id: uuid.UUID | None = None
    video_url: UrlStr | None = None
    is_featured: bool | None = None
    display_order: int | None = None
    is_approved: bool | None = None
    is_public: bool | None = None


class TestimonialRead(BaseReadSchema):
    person_id: uuid.UUID | None = None
    name: str
    role: str | None = None
    quote: str
    full_story: str | None = None
    testimonial_type: str
    school_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    programme_id: uuid.UUID | None = None
    photo_id: uuid.UUID | None = None
    video_url: str | None = None
    is_featured: bool
    display_order: int
    is_approved: bool
    department: dict[str, Any] | None = None
    person: dict[str, Any] | None = None
    photo: dict[str, Any] | None = None
    programme: dict[str, Any] | None = None
    school: dict[str, Any] | None = None
    updated_by_id: uuid.UUID | None = None
    updated_by: dict[str, Any] | None = None
    is_public: bool


class SocialMediaPostCreate(BaseSchema):
    source_type: str = Field(min_length=1, max_length=32)
    source_id: uuid.UUID | None = None
    title: str | None = Field(default=None, max_length=255)
    content: str = Field(min_length=1)
    media_ids: list[uuid.UUID] | None = None
    platforms: list[str]
    scheduled_at: datetime | None = None
    status: str = Field(default="draft", max_length=32)


class SocialMediaPostUpdate(BaseSchema):
    source_type: str | None = Field(default=None, max_length=32)
    source_id: uuid.UUID | None = None
    title: str | None = Field(default=None, max_length=255)
    content: str | None = None
    media_ids: list[uuid.UUID] | None = None
    platforms: list[str] | None = None
    scheduled_at: datetime | None = None
    posted_at: datetime | None = None
    platform_post_ids: dict | None = None
    status: str | None = Field(default=None, max_length=32)
    error_message: str | None = None


class SocialMediaPostRead(BaseReadSchema):
    source_type: str
    source_id: uuid.UUID | None = None
    title: str | None = None
    content: str
    media_ids: list[uuid.UUID] | None = None
    platforms: list[str]
    scheduled_at: datetime | None = None
    posted_at: datetime | None = None
    platform_post_ids: dict | None = None
    status: str
    error_message: str | None = None
    validation_summary: dict | None = None
    created_by: dict[str, Any] | None = None
    deliveries: list[dict[str, Any]] | None = None
    created_by_id: uuid.UUID


class SocialPlatformAccountCreate(BaseSchema):
    provider: str = Field(min_length=1, max_length=32)
    name: str = Field(min_length=1, max_length=255)
    account_ref: str = Field(min_length=1, max_length=255)
    credentials: dict
    settings: dict | None = None
    is_active: bool = True


class SocialPlatformAccountUpdate(BaseSchema):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    account_ref: str | None = Field(default=None, min_length=1, max_length=255)
    credentials: dict | None = None
    settings: dict | None = None
    is_active: bool | None = None


class SocialPlatformAccountRead(BaseReadSchema):
    provider: str
    name: str
    account_ref: str
    settings: dict | None = None
    is_active: bool
    last_validated_at: datetime | None = None
    last_used_at: datetime | None = None
    last_error: str | None = None
    created_by: dict[str, Any] | None = None
    deliveries: list[dict[str, Any]] | None = None
    created_by_id: uuid.UUID


class SocialMediaDeliveryRead(BaseReadSchema):
    social_post_id: uuid.UUID
    platform: str
    account_id: uuid.UUID | None = None
    status: str
    provider_post_id: str | None = None
    attempts: int
    last_attempted_at: datetime | None = None
    posted_at: datetime | None = None
    error_message: str | None = None
    validation_errors: list[dict] | None = None
    request_payload: dict | None = None
    account: dict[str, Any] | None = None
    social_post: dict[str, Any] | None = None
    response_payload: dict | None = None


__all__ = [
    "NewsletterCreate",
    "NewsletterUpdate",
    "NewsletterRead",
    "NewsletterScheduleRequest",
    "NewsletterSubscriberCreate",
    "NewsletterSubscriberRead",
    "TestimonialCreate",
    "TestimonialUpdate",
    "TestimonialRead",
    "SocialMediaPostCreate",
    "SocialMediaPostUpdate",
    "SocialMediaPostRead",
    "SocialPlatformAccountCreate",
    "SocialPlatformAccountUpdate",
    "SocialPlatformAccountRead",
    "SocialMediaDeliveryRead",
]
