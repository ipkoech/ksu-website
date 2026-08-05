"""Library guide, specialist, workflow, and policy page models."""

from __future__ import annotations

import uuid
from typing import Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base


class LibraryGuide(Base):
    """A public-facing subject, course, or audience library guide."""

    __tablename__ = "library_guides"
    __table_args__ = (
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
    slug: Mapped[str] = mapped_column(sa.String(128), nullable=False, unique=True, index=True)
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # "subject" | "course" | "audience" | "topic" | "general"
    guide_type: Mapped[str] = mapped_column(sa.String(32), nullable=False, index=True)

    subject: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True, index=True)
    course_code: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True, index=True)
    audience: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True, index=True)

    # Cross-service FKs: resolve to main schools/departments/staff — no ORM relationships
    school_id: Mapped[Optional[uuid.UUID]] = mapped_column(PGUUID(as_uuid=True), nullable=True, index=True)
    department_id: Mapped[Optional[uuid.UUID]] = mapped_column(PGUUID(as_uuid=True), nullable=True, index=True)
    owner_staff_id: Mapped[Optional[uuid.UUID]] = mapped_column(PGUUID(as_uuid=True), nullable=True, index=True)

    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=True)
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=True)
    sort_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=0)

    sections: Mapped[list["LibraryGuideSection"]] = relationship(
        "LibraryGuideSection", back_populates="guide", cascade="all, delete-orphan"
    )


class LibraryGuideSection(Base):
    """Ordered content section within a library guide."""

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
    content: Mapped[str] = mapped_column(sa.Text, nullable=False)

    # "text" | "resources" | "links" | "files" | "contact"
    section_type: Mapped[str] = mapped_column(sa.String(32), nullable=False, default="text")

    resource_links: Mapped[Optional[list[dict]]] = mapped_column(sa.JSON, nullable=True)
    file_ids: Mapped[Optional[list[str]]] = mapped_column(sa.JSON, nullable=True)
    sort_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=0)
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=True)

    guide: Mapped[LibraryGuide] = relationship("LibraryGuide", back_populates="sections")


class LibrarySpecialist(Base):
    """Subject specialist mapping a library staff member to support areas."""

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

    # Cross-service FK: resolves to staff/person source — no ORM relationship
    staff_id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False, index=True)

    subjects: Mapped[Optional[list[str]]] = mapped_column(sa.JSON, nullable=True)
    schools: Mapped[Optional[list[str]]] = mapped_column(sa.JSON, nullable=True)
    departments: Mapped[Optional[list[str]]] = mapped_column(sa.JSON, nullable=True)
    support_areas: Mapped[Optional[list[str]]] = mapped_column(sa.JSON, nullable=True)
    booking_url: Mapped[Optional[str]] = mapped_column(sa.String(500), nullable=True)

    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=True)
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=True)
    sort_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=0)


class LibraryWorkflow(Base):
    """Public guidance workflow, such as remote access or borrowing steps."""

    __tablename__ = "library_workflows"
    __table_args__ = (
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

    workflow_type: Mapped[str] = mapped_column(sa.String(32), nullable=False, index=True)
    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), nullable=False, unique=True, index=True)
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    audience: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True, index=True)

    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=True)
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=True)
    sort_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=0)

    steps: Mapped[list["LibraryWorkflowStep"]] = relationship(
        "LibraryWorkflowStep", back_populates="workflow", cascade="all, delete-orphan"
    )


class LibraryWorkflowStep(Base):
    """Ordered step in a library workflow."""

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
    instructions: Mapped[str] = mapped_column(sa.Text, nullable=False)
    link_url: Mapped[Optional[str]] = mapped_column(sa.String(500), nullable=True)
    file_id: Mapped[Optional[uuid.UUID]] = mapped_column(PGUUID(as_uuid=True), nullable=True)
    sort_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=0)
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=True)

    workflow: Mapped[LibraryWorkflow] = relationship("LibraryWorkflow", back_populates="steps")


class LibraryPolicyPage(Base):
    """Public policy page backed by rich text and optional regulation/file links."""

    __tablename__ = "library_policy_pages"
    __table_args__ = (
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

    policy_type: Mapped[str] = mapped_column(sa.String(32), nullable=False, index=True)
    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), nullable=False, unique=True, index=True)
    content: Mapped[str] = mapped_column(sa.Text, nullable=False)

    related_regulation_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True),
        sa.ForeignKey("library.library_regulations.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    file_id: Mapped[Optional[uuid.UUID]] = mapped_column(PGUUID(as_uuid=True), nullable=True)

    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=True)
    status: Mapped[str] = mapped_column(sa.String(32), nullable=False, default="active", index=True)
    sort_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=0)
