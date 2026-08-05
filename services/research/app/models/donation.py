"""Donation models: donors, donations, settings, impact stories."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import AttachmentRefsMixin, CoverImageRefMixin, LogoRefMixin, PhotoRefMixin, SEOMixin

from .base import Base


class Donor(Base, PhotoRefMixin, LogoRefMixin):
    """
    Research donor/benefactor.
    """

    __tablename__ = "donors"

    # User link (if registered user)
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, unique=True, index=True)

    # Donor info
    donor_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="individual",
        index=True,
    )  # individual | corporate | foundation | government | alumni

    # Personal details (individual)
    first_name: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    last_name: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    title: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)

    # Organization details (corporate/foundation)
    organization_name: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    organization_type: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)

    # Display name
    display_name: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    is_anonymous: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))

    # Contact
    email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(sa.String(24), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    city: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    country: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)

    # Preferences
    communication_preferences: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    interests: Mapped[Optional[list[str]]] = mapped_column(JSONB, nullable=True)

    # Stats (denormalized)
    total_donated: Mapped[Decimal] = mapped_column(sa.Numeric(15, 2), nullable=False, server_default=sa.text("0"))
    donation_count: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("0"))
    first_donation_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    last_donation_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    # Recognition tier
    tier: Mapped[Optional[str]] = mapped_column(
        sa.String(32),
        nullable=True,
    )  # bronze | silver | gold | platinum | legacy

    # Notes
    notes: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Status
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))

    # Relationships
    donations: Mapped[list["Donation"]] = relationship(
        "Donation",
        back_populates="donor",
        lazy="selectin",
    )

    @property
    def name(self) -> str:
        if self.is_anonymous:
            return "Anonymous Donor"
        if self.display_name:
            return self.display_name
        if self.organization_name:
            return self.organization_name
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return "Unknown Donor"

    def __repr__(self) -> str:
        return f"<Donor {self.id}: {self.name}>"


class Donation(Base):
    """
    Individual donation transaction.
    """

    __tablename__ = "donations"

    donor_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("donors.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Transaction
    donation_number: Mapped[Optional[str]] = mapped_column(
        sa.String(64),
        unique=True,
        nullable=True,
        index=True,
    )

    # Amount
    amount: Mapped[Decimal] = mapped_column(sa.Numeric(15, 2), nullable=False)
    currency: Mapped[str] = mapped_column(sa.String(3), nullable=False, server_default="KES")
    amount_usd: Mapped[Optional[Decimal]] = mapped_column(sa.Numeric(15, 2), nullable=True)

    # Type
    donation_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="one_time",
        index=True,
    )  # one_time | recurring | pledge | in_kind
    recurring_frequency: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)

    # Designation
    designation: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="unrestricted",
    )  # unrestricted | restricted | endowment

    # Purpose/fund
    purpose: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    fund_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    project_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    center_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    scholarship_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)

    # Payment
    payment_method: Mapped[Optional[str]] = mapped_column(
        sa.String(32),
        nullable=True,
    )  # card | bank_transfer | mpesa | check | cash | wire | crypto
    payment_reference: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    payment_provider: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)

    # Dates
    donation_date: Mapped[date] = mapped_column(sa.Date, nullable=False, index=True)
    received_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    # Donor message
    message: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    dedication: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    is_tribute: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    tribute_type: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)  # in_honor | in_memory
    tribute_name: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)

    # Recognition
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))

    # Tax
    is_tax_deductible: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    receipt_number: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)
    receipt_sent: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    receipt_sent_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)

    # Status
    status: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="completed",
        index=True,
    )  # pending | processing | completed | failed | refunded | cancelled

    # Internal
    notes: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Relationships
    donor: Mapped["Donor"] = relationship("Donor", back_populates="donations")

    def __repr__(self) -> str:
        return f"<Donation {self.donation_number}: {self.amount} {self.currency}>"


class DonationSettings(Base):
    """
    Research donation settings and configuration.
    """

    __tablename__ = "donation_settings"

    key: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)
    value: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    value_json: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    setting_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="general",
    )  # general | payment | email | display | tier

    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))

    def __repr__(self) -> str:
        return f"<DonationSettings {self.key}>"


class DonationImpact(Base, SEOMixin, CoverImageRefMixin, AttachmentRefsMixin):
    """
    Impact report for donations showing how funds were used.
    """

    __tablename__ = "donation_impacts"

    title: Mapped[str] = mapped_column(sa.String(500), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)

    impact_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="project",
        index=True,
    )  # project | scholarship | general | campaign | fund

    # Source
    project_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    center_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    scholarship_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    fund_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)

    # Content
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    achievements: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    beneficiaries: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Metrics
    total_raised: Mapped[Optional[Decimal]] = mapped_column(sa.Numeric(15, 2), nullable=True)
    total_spent: Mapped[Optional[Decimal]] = mapped_column(sa.Numeric(15, 2), nullable=True)
    currency: Mapped[str] = mapped_column(sa.String(3), nullable=False, server_default="KES")
    beneficiary_count: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    metrics: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)

    # Period
    period_start: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    period_end: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    reporting_year: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)

    # Quotes/testimonials
    quotes: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)

    # Media
    video_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)

    # Status
    status: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="published",
    )  # draft | published | archived
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    def __repr__(self) -> str:
        return f"<DonationImpact {self.slug}: {self.title[:50]}>"


class DonationStory(Base, SEOMixin, PhotoRefMixin):
    """
    Donor story/testimonial for marketing.
    """

    __tablename__ = "donation_stories"

    title: Mapped[str] = mapped_column(sa.String(500), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)

    # Donor (optional - could be anonymous)
    donor_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("donors.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    donor_name: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    donor_title: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    donor_organization: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)

    # Content
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    story: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    motivation: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    impact_witnessed: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    quote: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Media
    video_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)

    # Status
    status: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="published",
    )  # draft | published | archived
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    def __repr__(self) -> str:
        return f"<DonationStory {self.slug}: {self.title[:50]}>"


__all__ = [
    "Donor",
    "Donation",
    "DonationSettings",
    "DonationImpact",
    "DonationStory",
]
