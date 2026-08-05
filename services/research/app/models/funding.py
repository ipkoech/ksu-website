"""Funding models: grants, applications, reviews, funding sources, endowments."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import AttachmentRefsMixin, CoverImageRefMixin, DocumentRefMixin, LogoRefMixin, SEOMixin

from .base import Base


SCHEMA = "research"

# Association tables
project_funders = sa.Table(
    "project_funders",
    Base.metadata,
    sa.Column("project_id", sa.Uuid, sa.ForeignKey(f"{SCHEMA}.research_projects.id", ondelete="CASCADE"), primary_key=True),
    sa.Column("funding_id", sa.Uuid, sa.ForeignKey(f"{SCHEMA}.fundings.id", ondelete="CASCADE"), primary_key=True),
    schema=SCHEMA,
)

project_partners = sa.Table(
    "project_partners",
    Base.metadata,
    sa.Column("project_id", sa.Uuid, sa.ForeignKey(f"{SCHEMA}.research_projects.id", ondelete="CASCADE"), primary_key=True),
    sa.Column("partner_id", sa.Uuid, sa.ForeignKey(f"{SCHEMA}.partners.id", ondelete="CASCADE"), primary_key=True),
    schema=SCHEMA,
)

center_funders = sa.Table(
    "center_funders",
    Base.metadata,
    sa.Column("center_id", sa.Uuid, sa.ForeignKey(f"{SCHEMA}.research_centers.id", ondelete="CASCADE"), primary_key=True),
    sa.Column("funding_id", sa.Uuid, sa.ForeignKey(f"{SCHEMA}.fundings.id", ondelete="CASCADE"), primary_key=True),
    schema=SCHEMA,
)

center_partners = sa.Table(
    "center_partners",
    Base.metadata,
    sa.Column("center_id", sa.Uuid, sa.ForeignKey(f"{SCHEMA}.research_centers.id", ondelete="CASCADE"), primary_key=True),
    sa.Column("partner_id", sa.Uuid, sa.ForeignKey(f"{SCHEMA}.partners.id", ondelete="CASCADE"), primary_key=True),
    sa.Column("partnership_type", sa.String(64), nullable=True),
    sa.Column("partnership_level", sa.String(32), nullable=True),
    sa.Column("mou_start_date", sa.Date, nullable=True),
    sa.Column("mou_end_date", sa.Date, nullable=True),
    sa.Column("status", sa.String(32), nullable=False, server_default="active"),
    sa.Column("collaboration_areas", JSONB, nullable=True),
    sa.Column("notes", sa.Text, nullable=True),
    schema=SCHEMA,
)


class Grant(Base, SEOMixin, CoverImageRefMixin, LogoRefMixin, AttachmentRefsMixin):
    """
    Research grant opportunity - internal or external.

    Internal grants have full application workflow.
    External grants are informational with link to external site.
    """

    __tablename__ = "grants"

    title: Mapped[str] = mapped_column(sa.String(500), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)
    code: Mapped[Optional[str]] = mapped_column(sa.String(32), unique=True, nullable=True, index=True)

    grant_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="internal",
        index=True,
    )  # internal | external

    category: Mapped[str] = mapped_column(
        sa.String(64),
        nullable=False,
        server_default="research",
        index=True,
    )  # research | innovation | capacity_building | travel | equipment | publication

    # Funder info
    funder_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey(f"{SCHEMA}.fundings.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    funder_name: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    # Content
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    objectives: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    eligibility: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    focus_areas: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    requirements: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Funding details
    total_budget: Mapped[Optional[Decimal]] = mapped_column(sa.Numeric(15, 2), nullable=True)
    min_award: Mapped[Optional[Decimal]] = mapped_column(sa.Numeric(15, 2), nullable=True)
    max_award: Mapped[Optional[Decimal]] = mapped_column(sa.Numeric(15, 2), nullable=True)
    currency: Mapped[str] = mapped_column(sa.String(3), nullable=False, server_default="KES")
    number_of_awards: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)

    # Dates
    announcement_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    open_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    deadline: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    review_start_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    award_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    project_start_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    project_end_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    # External grant fields
    external_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)
    application_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)

    # Contact
    contact_name: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    contact_email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    contact_phone: Mapped[Optional[str]] = mapped_column(sa.String(24), nullable=True)

    # Status
    status: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="draft",
        index=True,
    )  # draft | open | closed | reviewing | awarded | cancelled
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    # Relationships
    guidelines: Mapped[list["GrantGuideline"]] = relationship(
        "GrantGuideline",
        back_populates="grant",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    applications: Mapped[list["GrantApplication"]] = relationship(
        "GrantApplication",
        back_populates="grant",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    reports: Mapped[list["GrantReport"]] = relationship(
        "GrantReport",
        back_populates="grant",
        lazy="selectin",
    )
    funder: Mapped[Optional["Funding"]] = relationship("Funding", back_populates="grants")

    @property
    def is_internal(self) -> bool:
        return self.grant_type == "internal"

    @property
    def is_open(self) -> bool:
        return self.status == "open"

    def __repr__(self) -> str:
        return f"<Grant {self.slug}: {self.title[:50]}>"


class GrantGuideline(Base, DocumentRefMixin):
    """Guidelines and procedures for grant applications."""

    __tablename__ = "grant_guidelines"

    grant_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("grants.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), nullable=False, index=True)

    guideline_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="procedure",
    )  # procedure | template | faq | criterion | checklist

    content: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Document attachment
    document_name: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)

    is_required: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    # Relationships
    grant: Mapped["Grant"] = relationship("Grant", back_populates="guidelines")

    __table_args__ = (
        sa.UniqueConstraint("grant_id", "slug", name="uq_grant_guideline_slug"),
    )

    def __repr__(self) -> str:
        return f"<GrantGuideline {self.title}>"


class GrantApplication(Base, AttachmentRefsMixin):
    """Application submitted for a grant."""

    __tablename__ = "grant_applications"

    grant_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("grants.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Applicant (principal investigator)
    applicant_id: Mapped[uuid.UUID] = mapped_column(sa.Uuid, nullable=False, index=True)

    application_number: Mapped[Optional[str]] = mapped_column(
        sa.String(64),
        unique=True,
        nullable=True,
        index=True,
    )

    # Project details
    project_title: Mapped[str] = mapped_column(sa.String(500), nullable=False)
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    abstract: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    objectives: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    methodology: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    expected_outcomes: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    work_plan: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    timeline: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Budget
    requested_amount: Mapped[Optional[Decimal]] = mapped_column(sa.Numeric(15, 2), nullable=True)
    budget_breakdown: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    currency: Mapped[str] = mapped_column(sa.String(3), nullable=False, server_default="KES")

    # Duration
    proposed_start_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    proposed_end_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    duration_months: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)

    # Team
    co_investigators: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)

    # Submission
    submitted_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)

    # Status
    status: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="draft",
        index=True,
    )  # draft | submitted | under_review | shortlisted | approved | rejected | withdrawn

    # Review outcome
    approved_amount: Mapped[Optional[Decimal]] = mapped_column(sa.Numeric(15, 2), nullable=True)
    review_comments: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    decision_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    # Relationships
    grant: Mapped["Grant"] = relationship("Grant", back_populates="applications")
    reviews: Mapped[list["GrantReview"]] = relationship(
        "GrantReview",
        back_populates="application",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<GrantApplication {self.application_number}: {self.project_title[:30]}>"


class GrantReview(Base):
    """Review of a grant application by a reviewer."""

    __tablename__ = "grant_reviews"

    application_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("grant_applications.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    reviewer_id: Mapped[uuid.UUID] = mapped_column(sa.Uuid, nullable=False, index=True)

    # Scores (0-100 or custom scale)
    overall_score: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    criteria_scores: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    # Feedback
    strengths: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    weaknesses: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    comments: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    recommendation: Mapped[Optional[str]] = mapped_column(
        sa.String(32),
        nullable=True,
    )  # approve | reject | revise | defer

    # Status
    status: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="pending",
    )  # pending | in_progress | completed

    reviewed_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)

    # Relationships
    application: Mapped["GrantApplication"] = relationship("GrantApplication", back_populates="reviews")

    __table_args__ = (
        sa.UniqueConstraint("application_id", "reviewer_id", name="uq_grant_review"),
    )

    def __repr__(self) -> str:
        return f"<GrantReview application={self.application_id} reviewer={self.reviewer_id}>"


class GrantReport(Base, AttachmentRefsMixin):
    """Progress/final report for an awarded grant."""

    __tablename__ = "grant_reports"

    grant_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("grants.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Which application/project this report is for
    application_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("grant_applications.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    project_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)

    submitter_id: Mapped[uuid.UUID] = mapped_column(sa.Uuid, nullable=False, index=True)

    report_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="progress",
    )  # progress | interim | final | financial

    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    reporting_period_start: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    reporting_period_end: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    # Content
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    activities: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    achievements: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    challenges: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    lessons_learned: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    next_steps: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Financial
    expenditure_summary: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    amount_spent: Mapped[Optional[Decimal]] = mapped_column(sa.Numeric(15, 2), nullable=True)
    balance: Mapped[Optional[Decimal]] = mapped_column(sa.Numeric(15, 2), nullable=True)

    # Status
    status: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="draft",
    )  # draft | submitted | under_review | approved | revision_requested
    submitted_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    reviewer_comments: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Relationships
    grant: Mapped["Grant"] = relationship("Grant", back_populates="reports")

    def __repr__(self) -> str:
        return f"<GrantReport {self.report_type}: {self.title}>"


class Funding(Base, LogoRefMixin):
    """
    Funding source/funder organization.

    Tracks organizations that fund research.
    """

    __tablename__ = "fundings"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)
    acronym: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)

    funder_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="government",
        index=True,
    )  # government | foundation | corporate | ngo | international | university

    # Content
    about: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    focus_areas: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Contact
    website: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(sa.String(24), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    country: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)

    # Status
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    grants: Mapped[list["Grant"]] = relationship("Grant", back_populates="funder", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Funding {self.slug}: {self.name}>"


class EndowmentFund(Base, SEOMixin, CoverImageRefMixin, AttachmentRefsMixin):
    """
    Endowment fund for sustained research support.

    Permanent funds where principal is invested and earnings support research.
    """

    __tablename__ = "endowment_funds"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)
    code: Mapped[Optional[str]] = mapped_column(sa.String(32), unique=True, nullable=True, index=True)

    fund_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="general",
    )  # general | named | restricted | scholarship | chair

    # Content
    purpose: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    eligibility: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    use_guidelines: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Financial
    principal_amount: Mapped[Optional[Decimal]] = mapped_column(sa.Numeric(15, 2), nullable=True)
    current_value: Mapped[Optional[Decimal]] = mapped_column(sa.Numeric(15, 2), nullable=True)
    annual_distribution: Mapped[Optional[Decimal]] = mapped_column(sa.Numeric(15, 2), nullable=True)
    currency: Mapped[str] = mapped_column(sa.String(3), nullable=False, server_default="KES")

    # Dates
    established_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    # Donor info (if named fund)
    donor_name: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    donor_message: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Contact
    contact_name: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    contact_email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)

    # Status
    status: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="active",
    )  # active | building | suspended | closed
    is_accepting_contributions: Mapped[bool] = mapped_column(
        sa.Boolean, nullable=False, server_default=sa.text("true")
    )
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    def __repr__(self) -> str:
        return f"<EndowmentFund {self.slug}: {self.name}>"


__all__ = [
    "Grant",
    "GrantGuideline",
    "GrantApplication",
    "GrantReview",
    "GrantReport",
    "Funding",
    "EndowmentFund",
    "project_funders",
    "project_partners",
    "center_funders",
    "center_partners",
]
