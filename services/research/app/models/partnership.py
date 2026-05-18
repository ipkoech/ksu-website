"""Partnership models: partners, consultancies."""

from __future__ import annotations

import uuid
from datetime import date
from decimal import Decimal
from typing import Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from ksu_common.models.base import AttachmentRefsMixin, CoverImageRefMixin, DocumentRefMixin, LogoRefMixin, SEOMixin

from .base import Base


class Partner(Base, SEOMixin, CoverImageRefMixin, LogoRefMixin, DocumentRefMixin):
    """
    Research partner organization.

    Includes collaborating institutions, industry partners, NGOs, government agencies.
    """

    __tablename__ = "partners"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)
    acronym: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)

    partner_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="academic",
        index=True,
    )  # academic | industry | government | ngo | foundation | international | community

    partnership_level: Mapped[Optional[str]] = mapped_column(
        sa.String(32),
        nullable=True,
    )  # strategic | implementing | funding | technical | community

    # Content
    about: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    collaboration_areas: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    key_achievements: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Contact
    website: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(sa.String(24), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    country: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)

    # Key contact person
    contact_person_name: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    contact_person_title: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    contact_person_email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)

    # Partnership dates
    partnership_start: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    partnership_end: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    mou_signed_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    mou_expiry_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    # Social
    social_links: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    # Status
    status: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="active",
        index=True,
    )  # active | inactive | pending | expired
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    def __repr__(self) -> str:
        return f"<Partner {self.slug}: {self.name}>"


class Consultancy(Base, SEOMixin, CoverImageRefMixin, LogoRefMixin, AttachmentRefsMixin):
    """
    Research consultancy engagement.

    Tracks consulting work done by university researchers for external clients.
    """

    __tablename__ = "consultancies"

    title: Mapped[str] = mapped_column(sa.String(500), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)
    code: Mapped[Optional[str]] = mapped_column(sa.String(32), unique=True, nullable=True, index=True)

    consultancy_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="research",
        index=True,
    )  # research | technical | policy | evaluation | training | advisory

    # Client
    client_name: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    client_type: Mapped[Optional[str]] = mapped_column(
        sa.String(32),
        nullable=True,
    )  # government | ngo | corporate | international | academic
    partner_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)

    # Lead consultant
    lead_consultant_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)

    # Team
    team_members: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)

    # Center (if through a center)
    center_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)

    # Content
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    objectives: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    methodology: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    deliverables: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    outcomes: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    impact: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Dates
    start_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    # Financial
    contract_value: Mapped[Optional[Decimal]] = mapped_column(sa.Numeric(15, 2), nullable=True)
    currency: Mapped[str] = mapped_column(sa.String(3), nullable=False, server_default="KES")

    # Location
    location: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    country: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)

    # Status
    status: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="ongoing",
        index=True,
    )  # proposal | awarded | ongoing | completed | cancelled
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    def __repr__(self) -> str:
        return f"<Consultancy {self.slug}: {self.title[:50]}>"


__all__ = [
    "Partner",
    "Consultancy",
]
