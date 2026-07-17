"""Schemas for publication models: publications, journals, editorial boards."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Any
from pydantic import ConfigDict, Field

from .base import (
    BaseSchema,
    BaseReadSchema,
    SEOFieldsMixin,
    SlugMixin,
    StatusMixin,
    SlugStr,
    UrlStr,
    EmailField,
)


# ============================================================================
# Publication
# ============================================================================


class PublicationAuthoringBase(BaseSchema, SlugMixin, SEOFieldsMixin):
    title: str = Field(max_length=1000)
    publication_type: str = Field(default="journal_article", max_length=32)
    project_id: uuid.UUID | None = None
    center_id: uuid.UUID | None = None
    journal_id: uuid.UUID | None = None
    abstract: str | None = None
    keywords: list[str] | None = None
    journal_name: str | None = Field(None, max_length=500)
    publisher: str | None = Field(None, max_length=255)
    volume: str | None = Field(None, max_length=32)
    issue: str | None = Field(None, max_length=32)
    pages: str | None = Field(None, max_length=32)
    article_number: str | None = Field(None, max_length=64)
    conference_name: str | None = Field(None, max_length=500)
    conference_location: str | None = Field(None, max_length=255)
    conference_date: date | None = None
    book_title: str | None = Field(None, max_length=500)
    editors: str | None = Field(None, max_length=500)
    edition: str | None = Field(None, max_length=32)
    isbn: str | None = Field(None, max_length=32)
    publication_date: date | None = None
    submission_date: date | None = None
    acceptance_date: date | None = None
    year: int | None = None
    doi: str | None = Field(None, max_length=128)
    pmid: str | None = Field(None, max_length=32)
    arxiv_id: str | None = Field(None, max_length=32)
    issn: str | None = Field(None, max_length=16)
    url: UrlStr | None = None
    pdf_url: UrlStr | None = None
    is_open_access: bool = False
    access_type: str | None = Field(None, max_length=32)
    impact_factor: float | None = None
    quartile: str | None = Field(None, max_length=8)
    h_index: int | None = None
    funding_acknowledgment: str | None = None
    grant_numbers: list[str] | None = None
    cover_image_url: UrlStr | None = None


class PublicationBase(PublicationAuthoringBase):
    status: str = Field(default="published", max_length=32)


class PublicationCreate(PublicationBase, StatusMixin):
    pass


class PublicationUpdate(BaseSchema):
    title: str | None = Field(None, max_length=1000)
    slug: SlugStr | None = None
    publication_type: str | None = Field(None, max_length=32)
    project_id: uuid.UUID | None = None
    center_id: uuid.UUID | None = None
    journal_id: uuid.UUID | None = None
    abstract: str | None = None
    keywords: list[str] | None = None
    journal_name: str | None = Field(None, max_length=500)
    publisher: str | None = Field(None, max_length=255)
    volume: str | None = Field(None, max_length=32)
    issue: str | None = Field(None, max_length=32)
    pages: str | None = Field(None, max_length=32)
    article_number: str | None = Field(None, max_length=64)
    conference_name: str | None = Field(None, max_length=500)
    conference_location: str | None = Field(None, max_length=255)
    conference_date: date | None = None
    book_title: str | None = Field(None, max_length=500)
    editors: str | None = Field(None, max_length=500)
    edition: str | None = Field(None, max_length=32)
    isbn: str | None = Field(None, max_length=32)
    publication_date: date | None = None
    submission_date: date | None = None
    acceptance_date: date | None = None
    year: int | None = None
    doi: str | None = None
    pmid: str | None = Field(None, max_length=32)
    arxiv_id: str | None = Field(None, max_length=32)
    issn: str | None = Field(None, max_length=16)
    url: UrlStr | None = None
    pdf_url: UrlStr | None = None
    is_open_access: bool | None = None
    access_type: str | None = Field(None, max_length=32)
    impact_factor: float | None = None
    quartile: str | None = Field(None, max_length=8)
    h_index: int | None = None
    funding_acknowledgment: str | None = None
    grant_numbers: list[str] | None = None
    cover_image_url: UrlStr | None = None
    status: str | None = None
    citation_count: int | None = None
    is_active: bool | None = None
    is_featured: bool | None = None


class SchoolPublicationCreate(PublicationAuthoringBase):
    """Author-controlled fields; ownership and workflow are server assigned."""

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        str_strip_whitespace=True,
        extra="forbid",
    )

    department_id: uuid.UUID | None = None


class SchoolPublicationUpdate(BaseSchema):
    """Editable school-publication fields, excluding scope and workflow state."""

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        str_strip_whitespace=True,
        extra="forbid",
    )

    title: str | None = Field(None, max_length=1000)
    slug: SlugStr | None = None
    publication_type: str | None = Field(None, max_length=32)
    department_id: uuid.UUID | None = None
    project_id: uuid.UUID | None = None
    center_id: uuid.UUID | None = None
    journal_id: uuid.UUID | None = None
    abstract: str | None = None
    keywords: list[str] | None = None
    journal_name: str | None = Field(None, max_length=500)
    publisher: str | None = Field(None, max_length=255)
    volume: str | None = Field(None, max_length=32)
    issue: str | None = Field(None, max_length=32)
    pages: str | None = Field(None, max_length=32)
    article_number: str | None = Field(None, max_length=64)
    conference_name: str | None = Field(None, max_length=500)
    conference_location: str | None = Field(None, max_length=255)
    conference_date: date | None = None
    book_title: str | None = Field(None, max_length=500)
    editors: str | None = Field(None, max_length=500)
    edition: str | None = Field(None, max_length=32)
    isbn: str | None = Field(None, max_length=32)
    publication_date: date | None = None
    submission_date: date | None = None
    acceptance_date: date | None = None
    year: int | None = None
    doi: str | None = Field(None, max_length=128)
    pmid: str | None = Field(None, max_length=32)
    arxiv_id: str | None = Field(None, max_length=32)
    issn: str | None = Field(None, max_length=16)
    url: UrlStr | None = None
    pdf_url: UrlStr | None = None
    is_open_access: bool | None = None
    access_type: str | None = Field(None, max_length=32)
    impact_factor: float | None = None
    quartile: str | None = Field(None, max_length=8)
    h_index: int | None = None
    funding_acknowledgment: str | None = None
    grant_numbers: list[str] | None = None
    cover_image_url: UrlStr | None = None


class PublicationRead(PublicationBase, BaseReadSchema, StatusMixin):
    school_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    submitted_by_user_id: uuid.UUID | None = None
    submitted_at: datetime | None = None
    withdrawn_at: datetime | None = None
    reviewed_at: datetime | None = None
    reviewer_comments: str | None = None
    citation_count: int
    journal: dict[str, Any] | None = None
    authors: list[dict[str, Any]] | None = None


class PublicationList(BaseReadSchema):
    title: str
    slug: str
    publication_type: str
    journal_name: str | None
    publication_date: date | None
    year: int | None
    doi: str | None
    is_open_access: bool
    citation_count: int
    is_featured: bool
    school_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    status: str


# ============================================================================
# Publication Author
# ============================================================================


class PublicationAuthorBase(BaseSchema):
    publication_id: uuid.UUID
    person_id: uuid.UUID | None = None
    name: str = Field(max_length=255)
    first_name: str | None = Field(None, max_length=128)
    last_name: str | None = Field(None, max_length=128)
    email: EmailField | None = None
    affiliation: str | None = Field(None, max_length=500)
    orcid: str | None = Field(None, max_length=32)
    author_order: int = Field(default=1, ge=1)
    is_corresponding: bool = False
    contribution: str | None = None
    is_internal: bool = False


class PublicationAuthorCreate(PublicationAuthorBase):
    pass


class PublicationAuthorUpdate(BaseSchema):
    name: str | None = None
    affiliation: str | None = None
    is_corresponding: bool | None = None


class PublicationAuthorRead(PublicationAuthorBase, BaseReadSchema):
    publication: dict[str, Any] | None = None


# ============================================================================
# Journal
# ============================================================================


class JournalBase(BaseSchema, SlugMixin, SEOFieldsMixin):
    name: str = Field(max_length=500)
    abbreviation: str | None = Field(None, max_length=64)
    issn: str | None = Field(None, max_length=16)
    eissn: str | None = Field(None, max_length=16)
    publisher: str | None = Field(None, max_length=255)
    publisher_location: str | None = Field(None, max_length=255)
    description: str | None = None
    scope: str | None = None
    subject_areas: list[str] | None = None
    impact_factor: float | None = None
    impact_factor_year: int | None = None
    h_index: int | None = None
    quartile: str | None = Field(None, max_length=8)
    sjr_score: float | None = None
    website: UrlStr | None = None
    submission_url: UrlStr | None = None
    is_open_access: bool = False
    is_university_journal: bool = False
    editor_in_chief_id: uuid.UUID | None = None
    cover_image_url: UrlStr | None = None


class JournalCreate(JournalBase, StatusMixin):
    pass


class JournalUpdate(BaseSchema):
    name: str | None = Field(None, max_length=500)
    slug: SlugStr | None = None
    abbreviation: str | None = Field(None, max_length=64)
    issn: str | None = Field(None, max_length=16)
    eissn: str | None = Field(None, max_length=16)
    publisher: str | None = Field(None, max_length=255)
    publisher_location: str | None = Field(None, max_length=255)
    description: str | None = None
    scope: str | None = None
    subject_areas: list[str] | None = None
    impact_factor: float | None = None
    impact_factor_year: int | None = None
    h_index: int | None = None
    quartile: str | None = Field(None, max_length=8)
    sjr_score: float | None = None
    website: UrlStr | None = None
    submission_url: UrlStr | None = None
    is_open_access: bool | None = None
    is_university_journal: bool | None = None
    editor_in_chief_id: uuid.UUID | None = None
    cover_image_url: UrlStr | None = None
    is_active: bool | None = None
    is_featured: bool | None = None


class JournalRead(JournalBase, BaseReadSchema, StatusMixin):
    publications: list[dict[str, Any]] | None = None
    editorial_board: list[dict[str, Any]] | None = None


class JournalList(BaseReadSchema):
    name: str
    slug: str
    abbreviation: str | None
    issn: str | None
    publisher: str | None
    impact_factor: float | None
    quartile: str | None
    is_open_access: bool
    is_university_journal: bool
    is_active: bool


# ============================================================================
# Editorial Board Member
# ============================================================================


class EditorialBoardMemberBase(BaseSchema):
    journal_id: uuid.UUID
    person_id: uuid.UUID | None = None
    name: str = Field(max_length=255)
    email: EmailField | None = None
    affiliation: str | None = Field(None, max_length=500)
    expertise: str | None = None
    bio: str | None = None
    orcid: str | None = Field(None, max_length=32)
    role: str = Field(default="member", max_length=32)
    joined_date: date | None = None
    left_date: date | None = None
    photo_url: UrlStr | None = None
    is_active: bool = True
    display_order: int = 100


class EditorialBoardMemberCreate(EditorialBoardMemberBase):
    pass


class EditorialBoardMemberUpdate(BaseSchema):
    name: str | None = None
    role: str | None = None
    is_active: bool | None = None


class EditorialBoardMemberRead(EditorialBoardMemberBase, BaseReadSchema):
    journal: dict[str, Any] | None = None
