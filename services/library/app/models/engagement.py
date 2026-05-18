"""User engagement models: LibraryInquiry, SupportTicket, SavedPublication, and LibraryRegulation."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base


class LibraryInquiry(Base):
    """Ask Librarian — a simple message sent to library staff."""

    __tablename__ = "library_inquiries"
    __table_args__ = {"schema": "library"}

    library_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True),
        sa.ForeignKey("library.libraries.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Sender details — not required to be a registered user
    sender_name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    sender_email: Mapped[str] = mapped_column(
        sa.String(255), nullable=False, index=True
    )
    sender_phone: Mapped[Optional[str]] = mapped_column(sa.String(30), nullable=True)

    # Cross-service FK: person if logged in — no ORM relationship
    person_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True), nullable=True, index=True
    )

    subject: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    message: Mapped[str] = mapped_column(sa.Text, nullable=False)

    # "open" | "in_progress" | "replied" | "closed"
    status: Mapped[str] = mapped_column(
        sa.String(16), nullable=False, default="open", index=True
    )

    replied_at: Mapped[Optional[datetime]] = mapped_column(
        sa.DateTime(timezone=True), nullable=True
    )
    reply_message: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Cross-service FK: staff who replied — no ORM relationship
    replied_by_person_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True), nullable=True
    )

    ip_address: Mapped[Optional[str]] = mapped_column(sa.String(45), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(sa.String(500), nullable=True)

    library: Mapped[Optional["Library"]] = relationship(
        "Library", back_populates="inquiries"
    )


class SupportTicket(Base):
    """Support ticket — polymorphic, targets any entity (Library, ElectronicResource, etc.).

    Designed for future extraction to a Central service;
    target_entity_type differentiates domain of the ticket.
    """

    __tablename__ = "support_tickets"
    __table_args__ = {"schema": "library"}

    # Cross-service FK: requester — no ORM relationship
    requester_person_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True), nullable=True, index=True
    )

    # Anonymous submission fallback
    requester_email: Mapped[Optional[str]] = mapped_column(
        sa.String(255), nullable=True
    )
    requester_name: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)

    subject: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    description: Mapped[str] = mapped_column(sa.Text, nullable=False)

    # "library" | "electronic_resource" | "loan" | "other"
    target_entity_type: Mapped[Optional[str]] = mapped_column(
        sa.String(64), nullable=True, index=True
    )
    target_entity_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True), nullable=True, index=True
    )

    # "open" | "in_progress" | "resolved" | "closed" | "rejected"
    status: Mapped[str] = mapped_column(
        sa.String(16), nullable=False, default="open", index=True
    )

    # "low" | "medium" | "high" | "critical"
    priority: Mapped[str] = mapped_column(
        sa.String(16), nullable=False, default="medium"
    )

    # "library_service" | "access_issue" | "resource_request" | "complaint" | "other"
    category: Mapped[str] = mapped_column(
        sa.String(32), nullable=False, default="other"
    )

    # Cross-service FK: assigned staff — no ORM relationship
    assigned_to_person_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True), nullable=True
    )

    resolved_at: Mapped[Optional[datetime]] = mapped_column(
        sa.DateTime(timezone=True), nullable=True
    )
    resolution_notes: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Arbitrary metadata (attachments list, tags, etc.)
    meta: Mapped[Optional[dict]] = mapped_column(sa.JSON, nullable=True)


class SavedPublication(Base):
    """A publication bookmarked by a user — sourced internally or from external aggregators."""

    __tablename__ = "saved_publications"
    __table_args__ = (
        sa.UniqueConstraint(
            "person_id", "source", "external_id", name="uq_saved_pub_person_source"
        ),
        {"schema": "library"},
    )

    # Cross-service FK: resolves to main.persons.id — no ORM relationship
    person_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), nullable=False, index=True
    )

    # "internal" | "crossref" | "openalex" | "pubmed" | "doaj" | "other"
    source: Mapped[str] = mapped_column(sa.String(32), nullable=False)

    # External identifier (DOI, PubMed ID, OpenAlex ID, etc.)
    external_id: Mapped[Optional[str]] = mapped_column(
        sa.String(255), nullable=True, index=True
    )

    # Cross-service FK: if source == "internal" this resolves to research.publications.id — no ORM relationship
    internal_publication_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True), nullable=True
    )

    # Cached metadata snapshot at time of save (title, authors, journal, year, doi, url, abstract)
    cached_metadata: Mapped[Optional[dict]] = mapped_column(sa.JSON, nullable=True)

    notes: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # "unread" | "reading" | "completed"
    reading_status: Mapped[str] = mapped_column(
        sa.String(16), nullable=False, default="unread"
    )


class LibraryRegulation(Base):
    """Policies and rules for a library."""

    __tablename__ = "library_regulations"
    __table_args__ = {"schema": "library"}

    library_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True),
        sa.ForeignKey("library.libraries.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)

    # "general" | "borrowing" | "conduct" | "access" | "fees" | "other"
    category: Mapped[Optional[str]] = mapped_column(
        sa.String(64), nullable=True, index=True
    )

    content: Mapped[str] = mapped_column(sa.Text, nullable=False)

    effective_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    # Cross-service FK: document attachment — no ORM relationship
    document_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True), nullable=True
    )

    # "draft" | "active" | "archived"
    status: Mapped[str] = mapped_column(
        sa.String(32), nullable=False, default="active", index=True
    )

    library: Mapped[Optional["Library"]] = relationship(
        "Library", back_populates="regulation_entries"
    )
