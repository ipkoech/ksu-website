"""Publication models: publications, authors, journals, editorial boards."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING, Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import CoverImageRefMixin, PhotoRefMixin, SEOMixin

from .base import Base

if TYPE_CHECKING:
    from .core import ResearchCenter, ResearchProject


class Publication(Base, SEOMixin, CoverImageRefMixin):
    """
    Academic publication (journal article, conference paper, book, etc.).
    """

    __tablename__ = "publications"

    title: Mapped[str] = mapped_column(sa.String(1000), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)

    publication_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="journal_article",
        index=True,
    )  # journal_article | conference_paper | book | book_chapter | thesis | report | working_paper | preprint

    # Main-service ownership. These remain nullable so existing publications
    # continue to work while school-authored records opt into strict scoping.
    school_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True)
    department_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True)
    submitted_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True)
    submitted_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    withdrawn_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    reviewer_comments: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Source
    project_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    center_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    journal_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("journals.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Content
    abstract: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    keywords: Mapped[Optional[list[str]]] = mapped_column(JSONB, nullable=True)

    # Publication details
    journal_name: Mapped[Optional[str]] = mapped_column(sa.String(500), nullable=True)
    publisher: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    volume: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)
    issue: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)
    pages: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)
    article_number: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)

    # Conference details (if conference paper)
    conference_name: Mapped[Optional[str]] = mapped_column(sa.String(500), nullable=True)
    conference_location: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    conference_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    # Book details (if book/chapter)
    book_title: Mapped[Optional[str]] = mapped_column(sa.String(500), nullable=True)
    editors: Mapped[Optional[str]] = mapped_column(sa.String(500), nullable=True)
    edition: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)
    isbn: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)

    # Dates
    publication_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True, index=True)
    submission_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    acceptance_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    year: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True, index=True)

    # Identifiers
    doi: Mapped[Optional[str]] = mapped_column(sa.String(128), unique=True, nullable=True, index=True)
    pmid: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)
    arxiv_id: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)
    issn: Mapped[Optional[str]] = mapped_column(sa.String(16), nullable=True)

    # Access
    url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)
    pdf_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)
    is_open_access: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    access_type: Mapped[Optional[str]] = mapped_column(
        sa.String(32),
        nullable=True,
    )  # gold | green | hybrid | bronze | closed

    # Quality indicators
    impact_factor: Mapped[Optional[float]] = mapped_column(sa.Float, nullable=True)
    quartile: Mapped[Optional[str]] = mapped_column(sa.String(8), nullable=True)  # Q1, Q2, Q3, Q4
    h_index: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    citation_count: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("0"))

    # Funding acknowledgment
    funding_acknowledgment: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    grant_numbers: Mapped[Optional[list[str]]] = mapped_column(JSONB, nullable=True)

    # Status
    status: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="published",
        index=True,
    )  # draft | submitted | under_review | accepted | published | retracted
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    # Relationships
    project: Mapped[Optional["ResearchProject"]] = relationship(
        "ResearchProject",
        primaryjoin="Publication.project_id == foreign(ResearchProject.id)",
        viewonly=True,
    )
    center: Mapped[Optional["ResearchCenter"]] = relationship(
        "ResearchCenter",
        primaryjoin="Publication.center_id == foreign(ResearchCenter.id)",
        viewonly=True,
    )
    journal: Mapped[Optional["Journal"]] = relationship("Journal", back_populates="publications")
    authors: Mapped[list["PublicationAuthor"]] = relationship(
        "PublicationAuthor",
        back_populates="publication",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="PublicationAuthor.author_order",
    )

    __table_args__ = (
        sa.Index("ix_publications_school_status", "school_id", "status"),
    )

    def __repr__(self) -> str:
        return f"<Publication {self.doi or self.slug}: {self.title[:50]}>"


class PublicationAuthor(Base):
    """Author attribution for a publication."""

    __tablename__ = "publication_authors"

    publication_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("publications.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Internal author (if KSU staff)
    person_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)

    # Author details (for external or if person not in system)
    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    first_name: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    last_name: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    affiliation: Mapped[Optional[str]] = mapped_column(sa.String(500), nullable=True)
    orcid: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)

    # Role
    author_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("1"))
    is_corresponding: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    contribution: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    is_internal: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))

    # Relationships
    publication: Mapped["Publication"] = relationship("Publication", back_populates="authors")

    __table_args__ = (
        sa.UniqueConstraint("publication_id", "author_order", name="uq_publication_author_order"),
    )

    def __repr__(self) -> str:
        return f"<PublicationAuthor {self.name} ({self.author_order})>"


class Journal(Base, SEOMixin, CoverImageRefMixin):
    """
    Academic journal for publications.

    Also includes university's own journals if any.
    """

    __tablename__ = "journals"

    name: Mapped[str] = mapped_column(sa.String(500), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)
    abbreviation: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)

    # Identifiers
    issn: Mapped[Optional[str]] = mapped_column(sa.String(16), nullable=True)
    eissn: Mapped[Optional[str]] = mapped_column(sa.String(16), nullable=True)

    # Publisher
    publisher: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    publisher_location: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)

    # Content
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    scope: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    subject_areas: Mapped[Optional[list[str]]] = mapped_column(JSONB, nullable=True)

    # Quality metrics
    impact_factor: Mapped[Optional[float]] = mapped_column(sa.Float, nullable=True)
    impact_factor_year: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    h_index: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    quartile: Mapped[Optional[str]] = mapped_column(sa.String(8), nullable=True)
    sjr_score: Mapped[Optional[float]] = mapped_column(sa.Float, nullable=True)

    # Access
    website: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)
    submission_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)
    is_open_access: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))

    # KSU journal specific
    is_university_journal: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    editor_in_chief_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)

    # Status
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    # Relationships
    publications: Mapped[list["Publication"]] = relationship(
        "Publication",
        back_populates="journal",
        lazy="selectin",
    )
    editorial_board: Mapped[list["EditorialBoardMember"]] = relationship(
        "EditorialBoardMember",
        back_populates="journal",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Journal {self.abbreviation or self.slug}: {self.name[:50]}>"


class EditorialBoardMember(Base, PhotoRefMixin):
    """Editorial board member for a journal."""

    __tablename__ = "editorial_board_members"

    journal_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("journals.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Internal person (if KSU staff)
    person_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)

    # Member details
    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    affiliation: Mapped[Optional[str]] = mapped_column(sa.String(500), nullable=True)
    expertise: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    orcid: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)

    # Role
    role: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="member",
    )  # editor_in_chief | associate_editor | section_editor | member | reviewer

    # Period
    joined_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    left_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    # Relationships
    journal: Mapped["Journal"] = relationship("Journal", back_populates="editorial_board")

    __table_args__ = (
        sa.UniqueConstraint("journal_id", "person_id", name="uq_editorial_board_person"),
    )

    def __repr__(self) -> str:
        return f"<EditorialBoardMember {self.name} ({self.role})>"


__all__ = [
    "Publication",
    "PublicationAuthor",
    "Journal",
    "EditorialBoardMember",
]
