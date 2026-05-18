"""Innovation models: innovations, research outputs, technology transfer."""

from __future__ import annotations

import uuid
from datetime import date
from decimal import Decimal
from typing import Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import AttachmentRefsMixin, CoverImageRefMixin, SEOMixin

from .base import Base


SCHEMA = "research"

# Association tables
innovation_sponsors = sa.Table(
    "innovation_sponsors",
    Base.metadata,
    sa.Column("innovation_id", sa.Uuid, sa.ForeignKey(f"{SCHEMA}.innovations.id", ondelete="CASCADE"), primary_key=True),
    sa.Column("partner_id", sa.Uuid, sa.ForeignKey(f"{SCHEMA}.partners.id", ondelete="CASCADE"), primary_key=True),
    schema=SCHEMA,
)


class Innovation(Base, SEOMixin, CoverImageRefMixin, AttachmentRefsMixin):
    """
    Innovation, invention, or technology developed through research.

    Examples: Patents, software, products, processes, prototypes
    """

    __tablename__ = "innovations"

    title: Mapped[str] = mapped_column(sa.String(500), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)
    code: Mapped[Optional[str]] = mapped_column(sa.String(32), unique=True, nullable=True, index=True)

    innovation_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="product",
        index=True,
    )  # product | process | service | technology | software | patent | model | prototype

    category: Mapped[Optional[str]] = mapped_column(
        sa.String(64),
        nullable=True,
        index=True,
    )  # agriculture | health | energy | ict | environment | manufacturing | social

    # Source project/center
    project_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    center_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)

    # Inventors/creators
    lead_inventor_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    inventors: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)

    # Content
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    problem_addressed: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    solution: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    benefits: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    applications: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    target_users: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # IP & Legal
    ip_status: Mapped[Optional[str]] = mapped_column(
        sa.String(32),
        nullable=True,
    )  # pending | filed | granted | licensed | open_source | trade_secret
    patent_number: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    patent_filing_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    patent_grant_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    patent_countries: Mapped[Optional[list[str]]] = mapped_column(JSONB, nullable=True)
    license_type: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)

    # Commercialization
    commercialization_status: Mapped[Optional[str]] = mapped_column(
        sa.String(32),
        nullable=True,
    )  # concept | prototype | pilot | market_ready | commercialized
    commercial_value: Mapped[Optional[Decimal]] = mapped_column(sa.Numeric(15, 2), nullable=True)
    revenue_generated: Mapped[Optional[Decimal]] = mapped_column(sa.Numeric(15, 2), nullable=True)
    currency: Mapped[str] = mapped_column(sa.String(3), nullable=False, server_default="KES")

    # Development
    development_stage: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="research",
    )  # research | development | testing | validation | production
    trl_level: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)  # Technology Readiness Level 1-9

    # Dates
    invention_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    # Media
    video_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)

    # Awards
    awards: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)

    # Status
    status: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="active",
        index=True,
    )  # draft | active | archived | discontinued
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    def __repr__(self) -> str:
        return f"<Innovation {self.slug}: {self.title[:50]}>"


class ResearchOutput(Base, CoverImageRefMixin):
    """
    Research output/deliverable from a project.

    Examples: datasets, software, reports, policy briefs, tools
    """

    __tablename__ = "research_outputs"

    title: Mapped[str] = mapped_column(sa.String(500), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)

    output_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="dataset",
        index=True,
    )  # dataset | software | tool | report | brief | methodology | model | framework | guideline

    # Source
    project_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    center_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)

    # Authors/contributors
    author_ids: Mapped[Optional[list[uuid.UUID]]] = mapped_column(JSONB, nullable=True)

    # Content
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    methodology: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    usage_notes: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    citation: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Access
    access_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="open",
    )  # open | restricted | request | proprietary
    access_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)
    download_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)
    repository_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)

    # Identifiers
    doi: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    version: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)

    # License
    license: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    license_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)

    # Technical details
    format: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)
    size_bytes: Mapped[Optional[int]] = mapped_column(sa.BigInteger, nullable=True)
    technical_requirements: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Dates
    release_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    last_updated: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    # Keywords
    keywords: Mapped[Optional[list[str]]] = mapped_column(JSONB, nullable=True)

    # Statistics
    download_count: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("0"))
    citation_count: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("0"))

    # Status
    status: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="published",
    )  # draft | published | archived | deprecated
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    def __repr__(self) -> str:
        return f"<ResearchOutput {self.slug}: {self.title[:50]}>"


__all__ = [
    "Innovation",
    "ResearchOutput",
    "innovation_sponsors",
]
