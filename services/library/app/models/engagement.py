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
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=True)

    library: Mapped[Optional["Library"]] = relationship(
        "Library", back_populates="regulation_entries"
    )


class LibrarySpecialist(Base):
    """Subject/support specialist attached to a branch staff profile."""

    __tablename__ = "library_specialists"
    __table_args__ = (
        sa.Index(
            "ix_library_specialists_library_public_active_sort",
            "library_id",
            "is_public",
            "is_active",
            "sort_order",
        ),
        {"schema": "library"},
    )

    library_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True),
        sa.ForeignKey("library.libraries.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    staff_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True),
        sa.ForeignKey("library.library_staff.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    subjects: Mapped[Optional[list[str]]] = mapped_column(sa.JSON, nullable=True)
    schools: Mapped[Optional[list[str]]] = mapped_column(sa.JSON, nullable=True)
    departments: Mapped[Optional[list[str]]] = mapped_column(sa.JSON, nullable=True)
    support_areas: Mapped[Optional[list[str]]] = mapped_column(sa.JSON, nullable=True)
    booking_url: Mapped[Optional[str]] = mapped_column(sa.String(500), nullable=True)
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=True)
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=True)
    sort_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=0)


class LibraryGuide(Base):
    """Public research, subject, course, and database guide."""

    __tablename__ = "library_guides"
    __table_args__ = (
        sa.UniqueConstraint("slug", name="uq_library_guides_slug"),
        sa.Index(
            "ix_library_guides_library_public_active_type_sort",
            "library_id",
            "is_public",
            "is_active",
            "guide_type",
            "sort_order",
        ),
        # Public list path filters a branch's visible guides and orders by
        # sort_order without narrowing guide_type, which the composite above
        # cannot serve because guide_type sits between the filter and the sort.
        sa.Index(
            "ix_library_guides_library_public_active_sort",
            "library_id",
            "is_public",
            "is_active",
            "sort_order",
        ),
        sa.Index("ix_library_guides_type_subject", "guide_type", "subject"),
        {"schema": "library"},
    )

    library_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True),
        sa.ForeignKey("library.libraries.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(160), nullable=False, index=True)
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    guide_type: Mapped[str] = mapped_column(
        sa.String(32), nullable=False, default="subject", index=True
    )
    subject: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True, index=True)
    course_code: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True, index=True)
    audience: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True, index=True)
    school_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True), nullable=True, index=True
    )
    department_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True), nullable=True, index=True
    )
    owner_staff_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True),
        sa.ForeignKey("library.library_staff.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=True)
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=True)
    sort_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=0)

    sections: Mapped[list["LibraryGuideSection"]] = relationship(
        "LibraryGuideSection", back_populates="guide", cascade="all, delete-orphan"
    )
    specialists: Mapped[list["LibraryGuideSpecialist"]] = relationship(
        "LibraryGuideSpecialist", back_populates="guide", cascade="all, delete-orphan"
    )


class LibraryGuideSection(Base):
    """Ordered guide content section."""

    __tablename__ = "library_guide_sections"
    __table_args__ = (
        sa.Index(
            "ix_library_guide_sections_guide_active_sort",
            "guide_id",
            "is_active",
            "sort_order",
        ),
        {"schema": "library"},
    )

    guide_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        sa.ForeignKey("library.library_guides.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    heading: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    content: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    section_type: Mapped[str] = mapped_column(
        sa.String(32), nullable=False, default="text"
    )
    resource_links: Mapped[Optional[list[dict]]] = mapped_column(sa.JSON, nullable=True)
    file_ids: Mapped[Optional[list[str]]] = mapped_column(sa.JSON, nullable=True)
    sort_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=0)
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=True)

    guide: Mapped[LibraryGuide] = relationship("LibraryGuide", back_populates="sections")


class LibraryGuideSpecialist(Base):
    """Many-to-many link between guides and specialists."""

    __tablename__ = "library_guide_specialists"
    __table_args__ = (
        sa.UniqueConstraint(
            "guide_id",
            "specialist_id",
            name="uq_library_guide_specialists_guide_specialist",
        ),
        {"schema": "library"},
    )

    guide_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        sa.ForeignKey("library.library_guides.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    specialist_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        sa.ForeignKey("library.library_specialists.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    guide: Mapped[LibraryGuide] = relationship("LibraryGuide", back_populates="specialists")
    specialist: Mapped[LibrarySpecialist] = relationship("LibrarySpecialist")


class LibraryWorkflow(Base):
    """Public library workflow such as clearance, borrowing, or repository deposit."""

    __tablename__ = "library_workflows"
    __table_args__ = (
        sa.UniqueConstraint("slug", name="uq_library_workflows_slug"),
        sa.Index(
            "ix_library_workflows_library_public_active_type_sort",
            "library_id",
            "is_public",
            "is_active",
            "workflow_type",
            "sort_order",
        ),
        # Same reason as library_guides: the public list does not narrow
        # workflow_type before ordering by sort_order.
        sa.Index(
            "ix_library_workflows_library_public_active_sort",
            "library_id",
            "is_public",
            "is_active",
            "sort_order",
        ),
        {"schema": "library"},
    )

    library_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True),
        sa.ForeignKey("library.libraries.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    workflow_type: Mapped[str] = mapped_column(
        sa.String(32), nullable=False, default="other", index=True
    )
    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(160), nullable=False, index=True)
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    audience: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True, index=True)
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=True)
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=True)
    sort_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=0)

    steps: Mapped[list["LibraryWorkflowStep"]] = relationship(
        "LibraryWorkflowStep", back_populates="workflow", cascade="all, delete-orphan"
    )


class LibraryWorkflowStep(Base):
    """Ordered step in a public library workflow."""

    __tablename__ = "library_workflow_steps"
    __table_args__ = (
        sa.Index(
            "ix_library_workflow_steps_workflow_active_sort",
            "workflow_id",
            "is_active",
            "sort_order",
        ),
        {"schema": "library"},
    )

    workflow_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        sa.ForeignKey("library.library_workflows.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    instructions: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    link_url: Mapped[Optional[str]] = mapped_column(sa.String(500), nullable=True)
    file_id: Mapped[Optional[uuid.UUID]] = mapped_column(PGUUID(as_uuid=True), nullable=True)
    sort_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=0)
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=True)

    workflow: Mapped[LibraryWorkflow] = relationship(
        "LibraryWorkflow", back_populates="steps"
    )


class LibraryPolicyPage(Base):
    """Public policy page with optional source regulation or file attachment."""

    __tablename__ = "library_policy_pages"
    __table_args__ = (
        sa.UniqueConstraint("slug", name="uq_library_policy_pages_slug"),
        sa.Index(
            "ix_library_policy_pages_library_public_status_type_sort",
            "library_id",
            "is_public",
            "status",
            "policy_type",
            "sort_order",
        ),
        # Same reason as library_guides: the public list does not narrow
        # policy_type before ordering by sort_order.
        sa.Index(
            "ix_library_policy_pages_library_public_status_sort",
            "library_id",
            "is_public",
            "status",
            "sort_order",
        ),
        {"schema": "library"},
    )

    library_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True),
        sa.ForeignKey("library.libraries.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    policy_type: Mapped[str] = mapped_column(
        sa.String(32), nullable=False, default="other", index=True
    )
    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(160), nullable=False, index=True)
    content: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    related_regulation_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True),
        sa.ForeignKey("library.library_regulations.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    file_id: Mapped[Optional[uuid.UUID]] = mapped_column(PGUUID(as_uuid=True), nullable=True)
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=True)
    status: Mapped[str] = mapped_column(
        sa.String(32), nullable=False, default="active", index=True
    )
    sort_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=0)
