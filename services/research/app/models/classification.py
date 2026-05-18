"""Classification models: themes, focus areas, expertise tags, and association tables."""

from __future__ import annotations

import uuid
from typing import Optional

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import CoverImageRefMixin

from .base import Base


SCHEMA = "research"

# Association tables for M:N relationships
project_themes = sa.Table(
    "project_themes",
    Base.metadata,
    sa.Column("project_id", sa.Uuid, sa.ForeignKey(f"{SCHEMA}.research_projects.id", ondelete="CASCADE"), primary_key=True),
    sa.Column("theme_id", sa.Uuid, sa.ForeignKey(f"{SCHEMA}.research_themes.id", ondelete="CASCADE"), primary_key=True),
    schema=SCHEMA,
)

publication_themes = sa.Table(
    "publication_themes",
    Base.metadata,
    sa.Column("publication_id", sa.Uuid, sa.ForeignKey(f"{SCHEMA}.publications.id", ondelete="CASCADE"), primary_key=True),
    sa.Column("theme_id", sa.Uuid, sa.ForeignKey(f"{SCHEMA}.research_themes.id", ondelete="CASCADE"), primary_key=True),
    schema=SCHEMA,
)

program_themes = sa.Table(
    "program_themes",
    Base.metadata,
    sa.Column("program_id", sa.Uuid, sa.ForeignKey(f"{SCHEMA}.research_programs.id", ondelete="CASCADE"), primary_key=True),
    sa.Column("theme_id", sa.Uuid, sa.ForeignKey(f"{SCHEMA}.research_themes.id", ondelete="CASCADE"), primary_key=True),
    schema=SCHEMA,
)

grant_themes = sa.Table(
    "grant_themes",
    Base.metadata,
    sa.Column("grant_id", sa.Uuid, sa.ForeignKey(f"{SCHEMA}.grants.id", ondelete="CASCADE"), primary_key=True),
    sa.Column("theme_id", sa.Uuid, sa.ForeignKey(f"{SCHEMA}.research_themes.id", ondelete="CASCADE"), primary_key=True),
    schema=SCHEMA,
)

project_focus_areas = sa.Table(
    "project_focus_areas",
    Base.metadata,
    sa.Column("project_id", sa.Uuid, sa.ForeignKey(f"{SCHEMA}.research_projects.id", ondelete="CASCADE"), primary_key=True),
    sa.Column("focus_area_id", sa.Uuid, sa.ForeignKey(f"{SCHEMA}.focus_areas.id", ondelete="CASCADE"), primary_key=True),
    schema=SCHEMA,
)

center_focus_areas = sa.Table(
    "center_focus_areas",
    Base.metadata,
    sa.Column("center_id", sa.Uuid, sa.ForeignKey(f"{SCHEMA}.research_centers.id", ondelete="CASCADE"), primary_key=True),
    sa.Column("focus_area_id", sa.Uuid, sa.ForeignKey(f"{SCHEMA}.focus_areas.id", ondelete="CASCADE"), primary_key=True),
    schema=SCHEMA,
)

person_expertise = sa.Table(
    "person_expertise",
    Base.metadata,
    sa.Column("person_id", sa.Uuid, primary_key=True),  # References person in main service
    sa.Column("tag_id", sa.Uuid, sa.ForeignKey(f"{SCHEMA}.expertise_tags.id", ondelete="CASCADE"), primary_key=True),
    schema=SCHEMA,
)


class ResearchTheme(Base, CoverImageRefMixin):
    """
    High-level research theme/pillar.

    Examples: Climate & Sustainability, Health & Wellbeing, Food Security
    """

    __tablename__ = "research_themes"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)
    code: Mapped[Optional[str]] = mapped_column(sa.String(32), unique=True, nullable=True, index=True)

    # Content
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    objectives: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Visual
    icon: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    color: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)
    # Status
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    # Relationships
    focus_areas: Mapped[list["FocusArea"]] = relationship(
        "FocusArea",
        back_populates="theme",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<ResearchTheme {self.slug}: {self.name}>"


class FocusArea(Base):
    """
    Specific focus area within a theme.

    Examples under "Climate & Sustainability": Carbon Sequestration, Renewable Energy, Climate Adaptation
    """

    __tablename__ = "focus_areas"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), nullable=False, index=True)
    code: Mapped[Optional[str]] = mapped_column(sa.String(32), unique=True, nullable=True, index=True)

    # Parent theme (optional - can be standalone)
    theme_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey(f"{SCHEMA}.research_themes.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Content
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    key_questions: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Visual
    icon: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    color: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)

    # Status
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    # Relationships
    theme: Mapped[Optional["ResearchTheme"]] = relationship(
        "ResearchTheme",
        back_populates="focus_areas",
    )

    __table_args__ = (
        sa.UniqueConstraint("theme_id", "slug", name="uq_focus_area_theme_slug"),
        {"schema": SCHEMA},
    )

    def __repr__(self) -> str:
        return f"<FocusArea {self.slug}: {self.name}>"


class ExpertiseTag(Base):
    """
    Expertise/skill tag for researchers.

    Examples: Machine Learning, Crop Genetics, Climate Modeling, Policy Analysis
    """

    __tablename__ = "expertise_tags"

    name: Mapped[str] = mapped_column(sa.String(128), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)

    # Grouping
    category: Mapped[Optional[str]] = mapped_column(
        sa.String(64),
        nullable=True,
        index=True,
    )  # methodology | domain | technology | discipline

    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Status
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    def __repr__(self) -> str:
        return f"<ExpertiseTag {self.slug}: {self.name}>"


__all__ = [
    "ResearchTheme",
    "FocusArea",
    "ExpertiseTag",
    "project_themes",
    "publication_themes",
    "program_themes",
    "grant_themes",
    "project_focus_areas",
    "center_focus_areas",
    "person_expertise",
]
