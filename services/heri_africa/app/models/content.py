from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, JSON, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class PublicationStatus(str, enum.Enum):
    DRAFT = "draft"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    SCHEDULED = "scheduled"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class SubmissionStatus(str, enum.Enum):
    NEW = "new"
    REVIEWING = "reviewing"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    RESPONDED = "responded"
    APPROVED = "approved"
    REJECTED = "rejected"
    CLOSED = "closed"
    SPAM = "spam"


class UUIDMixin:
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)


class SiteSettings(UUIDMixin, Base):
    __tablename__ = "site_settings"
    name: Mapped[str] = mapped_column(String(160), default="HERI Africa")
    tagline: Mapped[str | None] = mapped_column(String(255))
    contact: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    social_links: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    seo_defaults: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)


class Page(UUIDMixin, Base):
    __tablename__ = "pages"
    slug: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    status: Mapped[PublicationStatus] = mapped_column(Enum(PublicationStatus), default=PublicationStatus.DRAFT, index=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    seo_title: Mapped[str | None] = mapped_column(String(255))
    seo_description: Mapped[str | None] = mapped_column(Text)


class PageSection(UUIDMixin, Base):
    __tablename__ = "page_sections"
    page_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("heri.pages.id", ondelete="CASCADE"), index=True)
    section_type: Mapped[str] = mapped_column(String(80))
    position: Mapped[int] = mapped_column(Integer, default=0)
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True)
    configuration: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)


class NewsArticle(UUIDMixin, Base):
    __tablename__ = "news_articles"
    slug: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    excerpt: Mapped[str | None] = mapped_column(Text)
    body: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[PublicationStatus] = mapped_column(Enum(PublicationStatus), default=PublicationStatus.DRAFT, index=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    featured_image_url: Mapped[str | None] = mapped_column(String(500))
    seo: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)


class ResearchTheme(UUIDMixin, Base):
    __tablename__ = "research_themes"
    slug: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[PublicationStatus] = mapped_column(Enum(PublicationStatus), default=PublicationStatus.PUBLISHED, index=True)


class ResearchProject(UUIDMixin, Base):
    __tablename__ = "research_projects"
    slug: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    summary: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[PublicationStatus] = mapped_column(Enum(PublicationStatus), default=PublicationStatus.DRAFT, index=True)
    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    theme_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("heri.research_themes.id"))


class ResearchPublication(UUIDMixin, Base):
    __tablename__ = "research_publications"
    slug: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    abstract: Mapped[str | None] = mapped_column(Text)
    citation: Mapped[str | None] = mapped_column(Text)
    status: Mapped[PublicationStatus] = mapped_column(Enum(PublicationStatus), default=PublicationStatus.DRAFT, index=True)
    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    resource_url: Mapped[str | None] = mapped_column(String(500))


class Event(UUIDMixin, Base):
    __tablename__ = "events"
    slug: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    summary: Mapped[str] = mapped_column(Text, default="")
    description: Mapped[str] = mapped_column(Text, default="")
    starts_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    ends_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    location: Mapped[str | None] = mapped_column(String(255))
    registration_url: Mapped[str | None] = mapped_column(String(500))
    status: Mapped[PublicationStatus] = mapped_column(Enum(PublicationStatus), default=PublicationStatus.DRAFT, index=True)
    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)


class Opportunity(UUIDMixin, Base):
    __tablename__ = "opportunities"
    slug: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    summary: Mapped[str] = mapped_column(Text, default="")
    application_url: Mapped[str | None] = mapped_column(String(500))
    closing_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    status: Mapped[PublicationStatus] = mapped_column(Enum(PublicationStatus), default=PublicationStatus.DRAFT, index=True)
    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)


class NavigationItem(UUIDMixin, Base):
    __tablename__ = "navigation_items"
    label: Mapped[str] = mapped_column(String(120))
    href: Mapped[str] = mapped_column(String(500))
    position: Mapped[int] = mapped_column(Integer, default=0, index=True)
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True)


class HeroSlide(UUIDMixin, Base):
    __tablename__ = "hero_slides"
    eyebrow: Mapped[str] = mapped_column(String(160), default="")
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    image_url: Mapped[str] = mapped_column(String(500))
    mobile_image_url: Mapped[str | None] = mapped_column(String(500))
    button_label: Mapped[str] = mapped_column(String(120), default="Explore our work")
    button_href: Mapped[str] = mapped_column(String(500), default="/our-work")
    position: Mapped[int] = mapped_column(Integer, default=0, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)


class FooterLink(UUIDMixin, Base):
    __tablename__ = "footer_links"
    column: Mapped[str] = mapped_column(String(120), index=True)
    label: Mapped[str] = mapped_column(String(120))
    href: Mapped[str] = mapped_column(String(500))
    position: Mapped[int] = mapped_column(Integer, default=0)
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True)


class ContentRevision(UUIDMixin, Base):
    __tablename__ = "content_revisions"
    entity_type: Mapped[str] = mapped_column(String(120), index=True)
    entity_id: Mapped[str] = mapped_column(String(80), index=True)
    version: Mapped[int] = mapped_column(Integer)
    snapshot: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    author_id: Mapped[str | None] = mapped_column(String(80))
    note: Mapped[str | None] = mapped_column(Text)
