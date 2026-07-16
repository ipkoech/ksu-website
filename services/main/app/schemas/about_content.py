"""Schemas for About KSU, history milestones, and institutional facts."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Any, Literal

from pydantic import ConfigDict, Field, model_validator

from .base import BaseReadSchema, BaseSchema, SlugStr


def _valid_link(value: str | None) -> bool:
    return value is None or value.startswith(("/", "https://"))


class StrictContentSchema(BaseSchema):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True, str_strip_whitespace=True, extra="forbid")


class AboutPageContentCreate(StrictContentSchema):
    university_info_id: uuid.UUID
    hero_eyebrow: str | None = Field(default=None, max_length=255)
    hero_headline: str | None = Field(default=None, max_length=255)
    hero_introduction: str | None = None
    identity_heading: str | None = Field(default=None, max_length=255)
    identity_narrative: str | None = None
    mandate_introduction: str | None = None
    video_title: str | None = Field(default=None, max_length=255)
    video_url: str | None = Field(default=None, max_length=1024)
    video_transcript_url: str | None = Field(default=None, max_length=1024)
    virtual_tour_type: Literal["embed", "video"] | None = None
    virtual_tour_title: str | None = Field(default=None, max_length=255)
    virtual_tour_provider: str | None = Field(default=None, max_length=64)
    virtual_tour_url: str | None = Field(default=None, max_length=1024)
    virtual_tour_accessibility_url: str | None = Field(default=None, max_length=1024)
    hero_media_id: uuid.UUID | None = None
    identity_media_id: uuid.UUID | None = None
    video_poster_media_id: uuid.UUID | None = None
    virtual_tour_media_id: uuid.UUID | None = None
    virtual_tour_poster_media_id: uuid.UUID | None = None
    old_campus_media_id: uuid.UUID | None = None
    modern_campus_media_id: uuid.UUID | None = None
    history_document_id: uuid.UUID | None = None
    section_settings: dict[str, Any] | None = None
    is_enabled: bool = True

    @model_validator(mode="after")
    def validate_media_pairs(self):
        if bool(self.old_campus_media_id) != bool(self.modern_campus_media_id):
            raise ValueError("old and modern campus media must be supplied together")
        if self.video_url and not self.video_transcript_url:
            raise ValueError("video transcript URL is required")
        for value in (
            self.video_url,
            self.video_transcript_url,
            self.virtual_tour_url,
            self.virtual_tour_accessibility_url,
        ):
            if not _valid_link(value):
                raise ValueError("URLs must be internal paths or HTTPS")
        return self


class AboutPageContentUpdate(AboutPageContentCreate):
    university_info_id: uuid.UUID | None = None


class AboutPageContentRead(BaseReadSchema, AboutPageContentCreate):
    status: str
    workflow_status: str
    published_at: datetime | None = None


class HistoryMilestoneCreate(StrictContentSchema):
    about_page_content_id: uuid.UUID
    slug: SlugStr
    year_label: str = Field(min_length=1, max_length=32)
    event_date: date | None = None
    title: str = Field(min_length=1, max_length=255)
    summary: str = Field(min_length=1)
    expanded_body: str | None = None
    image_id: uuid.UUID | None = None
    image_alt_text: str | None = Field(default=None, max_length=255)
    source_title: str | None = Field(default=None, max_length=255)
    source_url: str | None = Field(default=None, max_length=1024)
    source_document_id: uuid.UUID | None = None
    display_order: int = 100
    is_featured: bool = False
    is_public: bool = True
    is_enabled: bool = True

    @model_validator(mode="after")
    def validate_urls(self):
        if not _valid_link(self.source_url):
            raise ValueError("source URL must be an internal path or HTTPS")
        return self


class HistoryMilestoneUpdate(StrictContentSchema):
    year_label: str | None = Field(default=None, max_length=32)
    event_date: date | None = None
    title: str | None = Field(default=None, min_length=1, max_length=255)
    summary: str | None = None
    expanded_body: str | None = None
    image_id: uuid.UUID | None = None
    image_alt_text: str | None = Field(default=None, max_length=255)
    source_title: str | None = Field(default=None, max_length=255)
    source_url: str | None = Field(default=None, max_length=1024)
    source_document_id: uuid.UUID | None = None
    display_order: int | None = None
    is_featured: bool | None = None
    is_public: bool | None = None
    is_enabled: bool | None = None


class HistoryMilestoneRead(BaseReadSchema, HistoryMilestoneCreate):
    status: str
    workflow_status: str
    published_at: datetime | None = None
    image: dict[str, Any] | None = None
    source_document: dict[str, Any] | None = None


class FactEditionCreate(StrictContentSchema):
    reporting_year: int = Field(ge=1965, le=2100)
    title: str = Field(min_length=1, max_length=255)
    introduction: str | None = None
    methodology_note: str | None = None
    verified_on: date | None = None
    source_document_id: uuid.UUID | None = None
    is_current: bool = False
    is_enabled: bool = True


class FactEditionUpdate(StrictContentSchema):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    introduction: str | None = None
    methodology_note: str | None = None
    verified_on: date | None = None
    source_document_id: uuid.UUID | None = None
    is_current: bool | None = None
    is_enabled: bool | None = None


class FactGroupCreate(StrictContentSchema):
    fact_edition_id: uuid.UUID | None = None
    slug: SlugStr
    heading: str = Field(min_length=1, max_length=255)
    summary: str | None = None
    image_id: uuid.UUID | None = None
    image_alt_text: str | None = Field(default=None, max_length=255)
    display_order: int = 100
    is_enabled: bool = True


class FactGroupUpdate(StrictContentSchema):
    heading: str | None = Field(default=None, min_length=1, max_length=255)
    summary: str | None = None
    image_id: uuid.UUID | None = None
    image_alt_text: str | None = Field(default=None, max_length=255)
    display_order: int | None = None
    is_enabled: bool | None = None


class FactItemCreate(StrictContentSchema):
    fact_group_id: uuid.UUID
    fact_kind: Literal["evergreen", "annual"]
    label: str = Field(min_length=1, max_length=255)
    display_value: str = Field(min_length=1, max_length=255)
    numeric_value: Decimal | None = None
    prefix: str | None = Field(default=None, max_length=32)
    suffix: str | None = Field(default=None, max_length=32)
    unit: str | None = Field(default=None, max_length=64)
    explanation: str | None = None
    icon_key: str | None = Field(default=None, max_length=64)
    link_url: str | None = Field(default=None, max_length=1024)
    link_label: str | None = Field(default=None, max_length=255)
    source_title: str | None = Field(default=None, max_length=255)
    source_url: str | None = Field(default=None, max_length=1024)
    verified_on: date | None = None
    display_order: int = 100
    is_featured: bool = False
    is_enabled: bool = True

    @model_validator(mode="after")
    def validate_urls(self):
        if not _valid_link(self.link_url) or not _valid_link(self.source_url):
            raise ValueError("links must be internal paths or HTTPS")
        return self


class FactItemUpdate(StrictContentSchema):
    label: str | None = Field(default=None, min_length=1, max_length=255)
    display_value: str | None = Field(default=None, min_length=1, max_length=255)
    numeric_value: Decimal | None = None
    prefix: str | None = Field(default=None, max_length=32)
    suffix: str | None = Field(default=None, max_length=32)
    unit: str | None = Field(default=None, max_length=64)
    explanation: str | None = None
    icon_key: str | None = Field(default=None, max_length=64)
    link_url: str | None = Field(default=None, max_length=1024)
    link_label: str | None = Field(default=None, max_length=255)
    source_title: str | None = Field(default=None, max_length=255)
    source_url: str | None = Field(default=None, max_length=1024)
    verified_on: date | None = None
    display_order: int | None = None
    is_featured: bool | None = None
    is_enabled: bool | None = None


InstitutionalPageType = Literal["about", "service_charter", "strategic_plan"]
InstitutionalSectionType = Literal[
    "narrative", "commitments", "process", "priorities", "outcomes", "quote",
    "document_collection", "related_links", "governance_links", "institutional_profile",
]
InstitutionalSectionTheme = Literal["light", "ivory", "blue", "green"]


class InstitutionalPageCreate(StrictContentSchema):
    university_info_id: uuid.UUID
    page_type: InstitutionalPageType
    slug: SlugStr
    eyebrow: str | None = Field(default=None, max_length=255)
    title: str = Field(min_length=1, max_length=255)
    introduction: str = Field(min_length=1)
    hero_media_id: uuid.UUID | None = None
    mobile_hero_media_id: uuid.UUID | None = None
    hero_alt_text: str | None = Field(default=None, max_length=255)
    primary_document_id: uuid.UUID | None = None
    reporting_period_label: str | None = Field(default=None, max_length=128)
    effective_date: date | None = None
    review_date: date | None = None
    seo_title: str | None = Field(default=None, max_length=255)
    seo_description: str | None = Field(default=None, max_length=512)
    is_enabled: bool = True

    @model_validator(mode="after")
    def validate_page_dates_and_media(self):
        if self.effective_date and self.review_date and self.review_date < self.effective_date:
            raise ValueError("review date must be on or after effective date")
        if (self.hero_media_id or self.mobile_hero_media_id) and not self.hero_alt_text:
            raise ValueError("hero alt text is required when hero media is supplied")
        return self


class InstitutionalPageUpdate(StrictContentSchema):
    eyebrow: str | None = Field(default=None, max_length=255)
    title: str | None = Field(default=None, min_length=1, max_length=255)
    introduction: str | None = None
    hero_media_id: uuid.UUID | None = None
    mobile_hero_media_id: uuid.UUID | None = None
    hero_alt_text: str | None = Field(default=None, max_length=255)
    primary_document_id: uuid.UUID | None = None
    reporting_period_label: str | None = Field(default=None, max_length=128)
    effective_date: date | None = None
    review_date: date | None = None
    seo_title: str | None = Field(default=None, max_length=255)
    seo_description: str | None = Field(default=None, max_length=512)
    is_enabled: bool | None = None


class InstitutionalPageRead(BaseReadSchema, InstitutionalPageCreate):
    status: str
    workflow_status: str
    published_at: datetime | None = None


class InstitutionalPageSectionCreate(StrictContentSchema):
    institutional_page_id: uuid.UUID
    slug: SlugStr
    section_type: InstitutionalSectionType
    eyebrow: str | None = Field(default=None, max_length=255)
    heading: str = Field(min_length=1, max_length=255)
    summary: str | None = None
    body: str | None = None
    layout_variant: str = Field(default="default", min_length=1, max_length=32)
    theme: InstitutionalSectionTheme = "light"
    primary_media_id: uuid.UUID | None = None
    media_alt_text: str | None = Field(default=None, max_length=255)
    video_url: str | None = Field(default=None, max_length=1024)
    display_order: int = 100
    is_enabled: bool = True

    @model_validator(mode="after")
    def validate_section_media(self):
        if self.primary_media_id and not self.media_alt_text:
            raise ValueError("media alt text is required when section media is supplied")
        if not _valid_link(self.video_url):
            raise ValueError("video URL must be an internal path or HTTPS")
        return self


class InstitutionalPageSectionUpdate(StrictContentSchema):
    eyebrow: str | None = Field(default=None, max_length=255)
    heading: str | None = Field(default=None, min_length=1, max_length=255)
    summary: str | None = None
    body: str | None = None
    layout_variant: str | None = Field(default=None, min_length=1, max_length=32)
    theme: InstitutionalSectionTheme | None = None
    primary_media_id: uuid.UUID | None = None
    media_alt_text: str | None = Field(default=None, max_length=255)
    video_url: str | None = Field(default=None, max_length=1024)
    display_order: int | None = None
    is_enabled: bool | None = None


class InstitutionalPageSectionRead(BaseReadSchema, InstitutionalPageSectionCreate):
    status: str
    workflow_status: str
    published_at: datetime | None = None


class InstitutionalPageItemCreate(StrictContentSchema):
    section_id: uuid.UUID
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    supporting_label: str | None = Field(default=None, max_length=128)
    supporting_value: str | None = Field(default=None, max_length=255)
    icon_key: str | None = Field(default=None, max_length=64)
    image_id: uuid.UUID | None = None
    image_alt_text: str | None = Field(default=None, max_length=255)
    link_label: str | None = Field(default=None, max_length=255)
    link_url: str | None = Field(default=None, max_length=1024)
    display_order: int = 100
    is_enabled: bool = True

    @model_validator(mode="after")
    def validate_item_links_and_media(self):
        if self.image_id and not self.image_alt_text:
            raise ValueError("image alt text is required when item media is supplied")
        if bool(self.link_label) != bool(self.link_url):
            raise ValueError("link label and URL must be supplied together")
        if not _valid_link(self.link_url):
            raise ValueError("link URL must be an internal path or HTTPS")
        return self


class InstitutionalPageItemUpdate(StrictContentSchema):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    supporting_label: str | None = Field(default=None, max_length=128)
    supporting_value: str | None = Field(default=None, max_length=255)
    icon_key: str | None = Field(default=None, max_length=64)
    image_id: uuid.UUID | None = None
    image_alt_text: str | None = Field(default=None, max_length=255)
    link_label: str | None = Field(default=None, max_length=255)
    link_url: str | None = Field(default=None, max_length=1024)
    display_order: int | None = None
    is_enabled: bool | None = None


class InstitutionalPageItemRead(BaseReadSchema, InstitutionalPageItemCreate):
    status: str
    workflow_status: str
    published_at: datetime | None = None


class InstitutionalSectionDocumentCreate(StrictContentSchema):
    document_id: uuid.UUID
    public_label: str | None = Field(default=None, max_length=255)
    display_order: int = 100
    is_featured: bool = False
    is_enabled: bool = True


class InstitutionalSectionDocumentUpdate(StrictContentSchema):
    public_label: str | None = Field(default=None, max_length=255)
    display_order: int | None = None
    is_featured: bool | None = None
    is_enabled: bool | None = None


class AboutWorkflowAction(StrictContentSchema):
    action: Literal["submit", "request_changes", "approve", "publish", "unpublish", "archive"]
    reason: str | None = None


class FactEditionClone(StrictContentSchema):
    reporting_year: int = Field(ge=1965, le=2100)


class ReorderItem(StrictContentSchema):
    id: uuid.UUID
    display_order: int


class ReorderRequest(StrictContentSchema):
    items: list[ReorderItem] = Field(min_length=1)


class PublicHistoryRead(BaseSchema):
    milestones: list[dict[str, Any]]
    document: dict[str, Any] | None = None


class PublicAboutRead(BaseSchema):
    university: dict[str, Any]
    content: dict[str, Any] | None = None
    history: PublicHistoryRead


class PublicFactsRead(BaseSchema):
    edition: dict[str, Any]
    groups: list[dict[str, Any]]
    available_years: list[int]


__all__ = [name for name in globals() if name.startswith(("About", "History", "Fact", "Public", "Reorder"))]
