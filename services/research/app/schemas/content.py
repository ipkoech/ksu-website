"""Schemas for research content models."""

from __future__ import annotations

import uuid
from datetime import date, datetime, time

from pydantic import Field

from .base import BaseReadSchema, BaseSchema, EmailField, PhoneStr, SEOFieldsMixin, SlugMixin, SlugStr, StatusMixin, UrlStr


class ResearchNewsBase(BaseSchema, SlugMixin, SEOFieldsMixin):
    title: str = Field(max_length=500)
    news_type: str = Field(default="news", max_length=32)
    author_id: uuid.UUID | None = None
    author_name: str | None = Field(None, max_length=255)
    center_id: uuid.UUID | None = None
    project_id: uuid.UUID | None = None
    publication_id: uuid.UUID | None = None
    innovation_id: uuid.UUID | None = None
    summary: str | None = None
    content: str | None = None
    excerpt: str | None = Field(None, max_length=500)
    video_url: UrlStr | None = None
    tags: list[str] | None = None
    category: str | None = Field(None, max_length=64)
    published_at: datetime | None = None
    expires_at: datetime | None = None
    external_url: UrlStr | None = None
    source: str | None = Field(None, max_length=255)
    cover_image_url: UrlStr | None = None
    attachments: list[dict] | None = None
    status: str = Field(default="draft", max_length=32)


class ResearchNewsCreate(ResearchNewsBase, StatusMixin):
    is_pinned: bool = False


class ResearchNewsUpdate(BaseSchema):
    title: str | None = Field(None, max_length=500)
    slug: SlugStr | None = None
    category: str | None = None
    published_at: datetime | None = None
    status: str | None = None
    is_active: bool | None = None
    is_featured: bool | None = None
    is_pinned: bool | None = None
    display_order: int | None = None


class ResearchNewsRead(ResearchNewsBase, BaseReadSchema, StatusMixin):
    view_count: int
    is_pinned: bool


class ResearchNewsList(BaseReadSchema):
    title: str
    slug: str
    news_type: str
    category: str | None
    published_at: datetime | None
    view_count: int
    is_featured: bool
    is_pinned: bool


class ResearchArticleBase(BaseSchema, SlugMixin, SEOFieldsMixin):
    title: str = Field(max_length=500)
    article_type: str = Field(default="article", max_length=32)
    author_id: uuid.UUID | None = None
    author_name: str | None = Field(None, max_length=255)
    author_bio: str | None = None
    center_id: uuid.UUID | None = None
    project_id: uuid.UUID | None = None
    theme_id: uuid.UUID | None = None
    summary: str | None = None
    content: str | None = None
    excerpt: str | None = Field(None, max_length=500)
    cover_image_caption: str | None = Field(None, max_length=255)
    video_url: UrlStr | None = None
    tags: list[str] | None = None
    category: str | None = Field(None, max_length=64)
    reading_time_minutes: int | None = None
    published_at: datetime | None = None
    related_article_ids: list[uuid.UUID] | None = None
    cover_image_url: UrlStr | None = None
    photo_url: UrlStr | None = None
    attachments: list[dict] | None = None
    status: str = Field(default="draft", max_length=32)


class ResearchArticleCreate(ResearchArticleBase, StatusMixin):
    pass


class ResearchArticleUpdate(BaseSchema):
    title: str | None = Field(None, max_length=500)
    slug: SlugStr | None = None
    category: str | None = None
    published_at: datetime | None = None
    status: str | None = None
    is_active: bool | None = None
    is_featured: bool | None = None
    display_order: int | None = None


class ResearchArticleRead(ResearchArticleBase, BaseReadSchema, StatusMixin):
    view_count: int
    share_count: int


class ResearchArticleList(BaseReadSchema):
    title: str
    slug: str
    article_type: str
    category: str | None
    published_at: datetime | None
    view_count: int
    is_featured: bool


class ResearchEventBase(BaseSchema, SlugMixin, SEOFieldsMixin):
    title: str = Field(max_length=500)
    event_type: str = Field(default="seminar", max_length=32)
    center_id: uuid.UUID | None = None
    organizer_id: uuid.UUID | None = None
    organizer_name: str | None = Field(None, max_length=255)
    summary: str | None = None
    description: str | None = None
    objectives: str | None = None
    target_audience: str | None = None
    agenda: str | None = None
    speakers: list[dict] | None = None
    keynote_speaker: str | None = Field(None, max_length=255)
    start_date: date
    end_date: date | None = None
    start_time: time | None = None
    end_time: time | None = None
    timezone: str = Field(default="Africa/Nairobi", max_length=64)
    venue: str | None = Field(None, max_length=255)
    address: str | None = None
    room: str | None = Field(None, max_length=128)
    gps_latitude: float | None = None
    gps_longitude: float | None = None
    is_virtual: bool = False
    is_hybrid: bool = False
    meeting_url: UrlStr | None = None
    platform: str | None = Field(None, max_length=64)
    requires_registration: bool = False
    registration_url: UrlStr | None = None
    registration_deadline: datetime | None = None
    max_participants: int | None = None
    is_free: bool = True
    fee: str | None = Field(None, max_length=128)
    contact_name: str | None = Field(None, max_length=255)
    contact_email: EmailField | None = None
    contact_phone: PhoneStr | None = None
    recording_url: UrlStr | None = None
    tags: list[str] | None = None
    cover_image_url: UrlStr | None = None
    attachments: list[dict] | None = None
    status: str = Field(default="upcoming", max_length=32)


class ResearchEventCreate(ResearchEventBase, StatusMixin):
    pass


class ResearchEventUpdate(BaseSchema):
    title: str | None = Field(None, max_length=500)
    slug: SlugStr | None = None
    start_date: date | None = None
    end_date: date | None = None
    status: str | None = None
    is_active: bool | None = None
    is_featured: bool | None = None
    display_order: int | None = None


class ResearchEventRead(ResearchEventBase, BaseReadSchema, StatusMixin):
    current_registrations: int


class ResearchEventList(BaseReadSchema):
    title: str
    slug: str
    event_type: str
    start_date: date
    end_date: date | None
    venue: str | None
    status: str
    is_featured: bool


class ResearchSliderBase(BaseSchema, SlugMixin):
    title: str = Field(max_length=255)
    slider_type: str = Field(default="hero", max_length=32)
    placement: str = Field(default="homepage", max_length=64)
    subtitle: str | None = Field(None, max_length=255)
    description: str | None = None
    link_url: UrlStr | None = None
    link_text: str | None = Field(None, max_length=64)
    link_target: str = Field(default="_self", max_length=16)
    image_alt: str | None = Field(None, max_length=255)
    video_url: UrlStr | None = None
    overlay_color: str | None = Field(None, max_length=32)
    overlay_opacity: float | None = None
    text_color: str | None = Field(None, max_length=32)
    text_alignment: str = Field(default="center", max_length=16)
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    cover_image_url: UrlStr | None = None
    thumbnail_url: UrlStr | None = None


class ResearchSliderCreate(ResearchSliderBase):
    is_active: bool = True
    display_order: int = 100


class ResearchSliderUpdate(BaseSchema):
    title: str | None = Field(None, max_length=255)
    slug: SlugStr | None = None
    placement: str | None = None
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    is_active: bool | None = None
    display_order: int | None = None


class ResearchSliderRead(ResearchSliderBase, BaseReadSchema):
    is_active: bool
    display_order: int


class ResearchSliderList(BaseReadSchema):
    title: str
    slug: str
    slider_type: str
    placement: str
    is_active: bool
    display_order: int

