"""constrain page section layout variants

Revision ID: 20260710_0012
Revises: 20260710_0011
Create Date: 2026-07-10 00:45:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260710_0012"
down_revision = "20260710_0011"
branch_labels = None
depends_on = None


LAYOUT_VARIANTS = (
    "hero_admissions",
    "pulse_strip",
    "featured_partnership",
    "programme_finder",
    "date_timeline",
    "pillar_grid",
    "media_mosaic",
    "leadership_activity",
    "research_cards",
    "news_grid",
    "events_list",
    "logo_carousel",
    "alumni_story",
    "facts_strip",
)
LAYOUT_VARIANTS_SQL = ", ".join(f"'{variant}'" for variant in LAYOUT_VARIANTS)


def _tables() -> set[str]:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return set(inspector.get_table_names())


def _check_constraints(table_name: str) -> set[str]:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return {constraint["name"] for constraint in inspector.get_check_constraints(table_name)}


def upgrade() -> None:
    if "page_sections" not in _tables():
        return

    op.execute(
        sa.text(
            f"""
            UPDATE page_sections
            SET layout_variant = 'hero_admissions'
            WHERE layout_variant IS NULL
               OR layout_variant NOT IN ({LAYOUT_VARIANTS_SQL})
            """
        )
    )
    op.alter_column("page_sections", "layout_variant", server_default="hero_admissions")

    if "ck_page_sections_layout_variant" not in _check_constraints("page_sections"):
        op.create_check_constraint(
            "ck_page_sections_layout_variant",
            "page_sections",
            f"layout_variant IN ({LAYOUT_VARIANTS_SQL})",
        )


def downgrade() -> None:
    if "page_sections" not in _tables():
        return

    if "ck_page_sections_layout_variant" in _check_constraints("page_sections"):
        op.drop_constraint("ck_page_sections_layout_variant", "page_sections", type_="check")
    op.alter_column("page_sections", "layout_variant", server_default="default")
