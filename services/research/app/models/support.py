"""Support models: resources, services, guidelines, boards."""

from __future__ import annotations

import uuid
from datetime import date
from typing import Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import AttachmentRefsMixin, CoverImageRefMixin, DocumentRefMixin, LogoRefMixin, PhotoRefMixin, SEOMixin

from .base import Base


class ResearchResource(Base, SEOMixin, CoverImageRefMixin, AttachmentRefsMixin):
    """
    Research resource/tool/facility available to researchers.
    """

    __tablename__ = "research_resources"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)
    code: Mapped[Optional[str]] = mapped_column(sa.String(32), unique=True, nullable=True, index=True)

    resource_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="equipment",
        index=True,
    )  # equipment | facility | database | software | instrument | material | service

    category: Mapped[Optional[str]] = mapped_column(
        sa.String(64),
        nullable=True,
        index=True,
    )  # laboratory | computing | library | field | imaging | analysis

    # Location/ownership
    center_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    department_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    location: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    room: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)

    # Content
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    specifications: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    capabilities: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    usage_guidelines: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    training_required: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Access
    access_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="internal",
    )  # open | internal | restricted | booking_required
    access_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)
    booking_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)

    # Availability
    availability: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    operating_hours: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)

    # Fees
    is_free: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    fee_structure: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Contact
    contact_name: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    contact_email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    contact_phone: Mapped[Optional[str]] = mapped_column(sa.String(24), nullable=True)
    manager_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)

    # Status
    status: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="available",
    )  # available | in_use | maintenance | unavailable
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    def __repr__(self) -> str:
        return f"<ResearchResource {self.slug}: {self.name}>"


class ResearchService(Base, SEOMixin, CoverImageRefMixin, AttachmentRefsMixin):
    """
    Research support service offered by the university.
    """

    __tablename__ = "research_services"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)
    code: Mapped[Optional[str]] = mapped_column(sa.String(32), unique=True, nullable=True, index=True)

    service_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="support",
        index=True,
    )  # support | technical | administrative | consulting | training | editing

    category: Mapped[Optional[str]] = mapped_column(
        sa.String(64),
        nullable=True,
        index=True,
    )  # grants | ethics | ip | statistics | writing | compliance | data

    # Provider
    center_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    department_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)

    # Content
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    scope: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    process: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    eligibility: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    deliverables: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    turnaround_time: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)

    # Access
    how_to_access: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    request_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)

    # Fees
    is_free: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    fee_structure: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Contact
    contact_name: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    contact_email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    contact_phone: Mapped[Optional[str]] = mapped_column(sa.String(24), nullable=True)

    # Status
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    def __repr__(self) -> str:
        return f"<ResearchService {self.slug}: {self.name}>"


class ResearchGuideline(Base, SEOMixin, DocumentRefMixin):
    """
    Research policy, guideline, or procedure document.
    """

    __tablename__ = "research_guidelines"

    title: Mapped[str] = mapped_column(sa.String(500), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)
    code: Mapped[Optional[str]] = mapped_column(sa.String(32), unique=True, nullable=True, index=True)

    guideline_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="guideline",
        index=True,
    )  # policy | guideline | procedure | template | form | manual | standard

    category: Mapped[str] = mapped_column(
        sa.String(64),
        nullable=False,
        server_default="general",
        index=True,
    )  # ethics | grants | ip | data | publication | collaboration | safety | compliance

    # Content
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    content: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    scope: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    applicability: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Document
    document_name: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    version: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)

    # Approval
    approved_by: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    approval_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    effective_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    review_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    # Related
    supersedes_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("research_guidelines.id", ondelete="SET NULL"),
        nullable=True,
    )
    related_guideline_ids: Mapped[Optional[list[uuid.UUID]]] = mapped_column(JSONB, nullable=True)

    # Contact
    contact_email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)

    # Status
    status: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="active",
    )  # draft | active | under_review | superseded | archived
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_mandatory: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    def __repr__(self) -> str:
        return f"<ResearchGuideline {self.slug}: {self.title[:50]}>"


__all__ = [
    "ResearchResource",
    "ResearchService",
    "ResearchGuideline",
]
