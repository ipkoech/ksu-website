"""Impact models: success stories, metrics, sustainability initiatives."""

from __future__ import annotations

import uuid
from datetime import date
from decimal import Decimal
from typing import Optional

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column

from ksu_common.models.base import AttachmentRefsMixin, CoverImageRefMixin, SEOMixin

from .base import Base


SCHEMA = "research"

# Association tables for Sustainability M:N relationships
sustainability_projects = sa.Table(
    "sustainability_projects",
    Base.metadata,
    sa.Column("sustainability_id", sa.Uuid, sa.ForeignKey(f"{SCHEMA}.sustainabilities.id", ondelete="CASCADE"), primary_key=True),
    sa.Column("project_id", sa.Uuid, sa.ForeignKey(f"{SCHEMA}.research_projects.id", ondelete="CASCADE"), primary_key=True),
    schema=SCHEMA,
)

sustainability_grants = sa.Table(
    "sustainability_grants",
    Base.metadata,
    sa.Column("sustainability_id", sa.Uuid, sa.ForeignKey(f"{SCHEMA}.sustainabilities.id", ondelete="CASCADE"), primary_key=True),
    sa.Column("grant_id", sa.Uuid, sa.ForeignKey(f"{SCHEMA}.grants.id", ondelete="CASCADE"), primary_key=True),
    schema=SCHEMA,
)

sustainability_training = sa.Table(
    "sustainability_training",
    Base.metadata,
    sa.Column("sustainability_id", sa.Uuid, sa.ForeignKey(f"{SCHEMA}.sustainabilities.id", ondelete="CASCADE"), primary_key=True),
    sa.Column("training_id", sa.Uuid, sa.ForeignKey(f"{SCHEMA}.training_programs.id", ondelete="CASCADE"), primary_key=True),
    schema=SCHEMA,
)

sustainability_partners = sa.Table(
    "sustainability_partners",
    Base.metadata,
    sa.Column("sustainability_id", sa.Uuid, sa.ForeignKey(f"{SCHEMA}.sustainabilities.id", ondelete="CASCADE"), primary_key=True),
    sa.Column("partner_id", sa.Uuid, sa.ForeignKey(f"{SCHEMA}.partners.id", ondelete="CASCADE"), primary_key=True),
    schema=SCHEMA,
)

sustainability_stories = sa.Table(
    "sustainability_stories",
    Base.metadata,
    sa.Column("sustainability_id", sa.Uuid, sa.ForeignKey(f"{SCHEMA}.sustainabilities.id", ondelete="CASCADE"), primary_key=True),
    sa.Column("story_id", sa.Uuid, sa.ForeignKey(f"{SCHEMA}.success_stories.id", ondelete="CASCADE"), primary_key=True),
    schema=SCHEMA,
)


class SuccessStory(Base, SEOMixin, CoverImageRefMixin, AttachmentRefsMixin):
    """
    Research success story/case study showcasing impact.
    """

    __tablename__ = "success_stories"

    title: Mapped[str] = mapped_column(sa.String(500), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)

    story_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="impact",
        index=True,
    )  # impact | innovation | collaboration | community | policy | commercialization

    # Source
    project_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    center_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    innovation_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)

    # Content
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    challenge: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    solution: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    approach: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    outcomes: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    impact: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    lessons_learned: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    future_directions: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Beneficiaries
    beneficiaries: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    beneficiary_count: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)

    # Location
    location: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    county: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    country: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)

    # Quotes/Testimonials
    quotes: Mapped[Optional[list[dict]]] = mapped_column(sa.JSON, nullable=True)

    # Key people
    researchers: Mapped[Optional[list[dict]]] = mapped_column(sa.JSON, nullable=True)

    # Media
    video_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)

    # Dates
    story_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    published_at: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    # Status
    status: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="published",
        index=True,
    )  # draft | published | archived
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    def __repr__(self) -> str:
        return f"<SuccessStory {self.slug}: {self.title[:50]}>"


class ImpactMetric(Base):
    """
    Quantifiable impact metric for research activities.
    """

    __tablename__ = "impact_metrics"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)
    code: Mapped[Optional[str]] = mapped_column(sa.String(32), unique=True, nullable=True, index=True)

    metric_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="output",
        index=True,
    )  # input | output | outcome | impact

    category: Mapped[str] = mapped_column(
        sa.String(64),
        nullable=False,
        server_default="research",
        index=True,
    )  # research | innovation | capacity | community | economic | environmental | policy

    # Value
    value: Mapped[Decimal] = mapped_column(sa.Numeric(15, 2), nullable=False, server_default=sa.text("0"))
    unit: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)
    target_value: Mapped[Optional[Decimal]] = mapped_column(sa.Numeric(15, 2), nullable=True)
    baseline_value: Mapped[Optional[Decimal]] = mapped_column(sa.Numeric(15, 2), nullable=True)

    # Description
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    methodology: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    data_source: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)

    # Period
    period_start: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    period_end: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    reporting_year: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True, index=True)

    # Source entity
    project_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    center_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    program_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)

    # Display
    icon: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    color: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)

    # Status
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    def __repr__(self) -> str:
        return f"<ImpactMetric {self.slug}: {self.value} {self.unit}>"


class Sustainability(Base, SEOMixin, CoverImageRefMixin, AttachmentRefsMixin):
    """
    Sustainability/climate initiative hub.

    Aggregates related projects, grants, training, and partners under sustainability themes.
    """

    __tablename__ = "sustainabilities"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)
    code: Mapped[Optional[str]] = mapped_column(sa.String(32), unique=True, nullable=True, index=True)

    initiative_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="climate",
        index=True,
    )  # climate | biodiversity | conservation | renewable_energy | circular_economy | water | food_security

    # Content
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    objectives: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    approach: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    activities: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    impact: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # SDG alignment
    sdg_goals: Mapped[Optional[list[int]]] = mapped_column(sa.JSON, nullable=True)

    # Leadership
    lead_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    center_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)

    # Dates
    start_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    # Contact
    contact_email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    website: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)

    # Media
    video_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)

    # Status
    status: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="active",
        index=True,
    )  # planning | active | completed | suspended
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    def __repr__(self) -> str:
        return f"<Sustainability {self.slug}: {self.name}>"


__all__ = [
    "SuccessStory",
    "ImpactMetric",
    "Sustainability",
    "sustainability_projects",
    "sustainability_grants",
    "sustainability_training",
    "sustainability_partners",
    "sustainability_stories",
]
