"""add page CMS source references

Revision ID: 20260713_0022
Revises: 20260713_0021
Create Date: 2026-07-13 12:30:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260713_0022"
down_revision = "20260713_0021"
branch_labels = None
depends_on = None


SOURCE_TYPES = (
    "intake",
    "programme",
    "academic_calendar",
    "person",
    "staff_assignment",
    "research_project",
    "publication",
    "news",
    "event",
    "research_partner",
    "alumni",
    "testimonial",
    "public_stat",
    "club_activity",
)
SOURCE_TYPES_SQL = ", ".join(f"'{source_type}'" for source_type in SOURCE_TYPES)
SOURCE_REFERENCE_CHECK = (
    "((source_type IS NULL AND source_id IS NULL) OR "
    "(source_type IS NOT NULL AND source_id IS NOT NULL))"
)
SOURCE_TYPE_CHECK = f"source_type IS NULL OR source_type IN ({SOURCE_TYPES_SQL})"
SOURCE_REFERENCE_ITEM_TYPE_CHECK = "source_type IS NULL OR item_type = 'reference'"
REFERENCE_ITEM_TYPE_CHECK = "item_type IN ('text', 'card', 'stat', 'cta', 'media', 'video', 'reference')"
ORIGINAL_ITEM_TYPE_CHECK = "item_type IN ('text', 'card', 'stat', 'cta', 'media', 'video')"


def _tables() -> set[str]:
    return set(sa.inspect(op.get_bind()).get_table_names())


def _columns(table_name: str) -> set[str]:
    return {column["name"] for column in sa.inspect(op.get_bind()).get_columns(table_name)}


def _indexes(table_name: str) -> set[str]:
    return {index["name"] for index in sa.inspect(op.get_bind()).get_indexes(table_name)}


def _check_constraints(table_name: str) -> set[str]:
    return {constraint["name"] for constraint in sa.inspect(op.get_bind()).get_check_constraints(table_name)}


def upgrade() -> None:
    tables = _tables()

    if "page_sections" in tables and "revision" not in _columns("page_sections"):
        op.add_column("page_sections", sa.Column("revision", sa.Integer(), server_default=sa.text("1"), nullable=False))

    if "section_items" not in tables:
        return

    columns = _columns("section_items")
    if "source_type" not in columns:
        op.add_column("section_items", sa.Column("source_type", sa.String(length=64), nullable=True))
    if "source_id" not in columns:
        op.add_column("section_items", sa.Column("source_id", sa.UUID(), nullable=True))
    if "editorial_overrides" not in columns:
        op.add_column(
            "section_items",
            sa.Column("editorial_overrides", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        )
    if "revision" not in columns:
        op.add_column("section_items", sa.Column("revision", sa.Integer(), server_default=sa.text("1"), nullable=False))

    constraints = _check_constraints("section_items")
    if "ck_section_items_item_type" in constraints:
        op.drop_constraint("ck_section_items_item_type", "section_items", type_="check")
    op.create_check_constraint("ck_section_items_item_type", "section_items", REFERENCE_ITEM_TYPE_CHECK)

    constraints = _check_constraints("section_items")
    if "ck_section_items_source_reference" not in constraints:
        op.create_check_constraint("ck_section_items_source_reference", "section_items", SOURCE_REFERENCE_CHECK)
    if "ck_section_items_source_type" not in constraints:
        op.create_check_constraint("ck_section_items_source_type", "section_items", SOURCE_TYPE_CHECK)
    if "ck_section_items_source_reference_item_type" not in constraints:
        op.create_check_constraint(
            "ck_section_items_source_reference_item_type",
            "section_items",
            SOURCE_REFERENCE_ITEM_TYPE_CHECK,
        )

    if "ix_section_items_source" not in _indexes("section_items"):
        op.create_index("ix_section_items_source", "section_items", ["source_type", "source_id"], unique=False)


def downgrade() -> None:
    tables = _tables()

    if "section_items" in tables:
        indexes = _indexes("section_items")
        if "ix_section_items_source" in indexes:
            op.drop_index("ix_section_items_source", table_name="section_items")

        constraints = _check_constraints("section_items")
        for constraint_name in (
            "ck_section_items_source_reference_item_type",
            "ck_section_items_source_type",
            "ck_section_items_source_reference",
        ):
            if constraint_name in constraints:
                op.drop_constraint(constraint_name, "section_items", type_="check")

        columns = _columns("section_items")
        if "item_type" in columns:
            op.execute(sa.text("UPDATE section_items SET item_type = 'text' WHERE item_type = 'reference'"))

        constraints = _check_constraints("section_items")
        if "ck_section_items_item_type" in constraints:
            op.drop_constraint("ck_section_items_item_type", "section_items", type_="check")
        op.create_check_constraint("ck_section_items_item_type", "section_items", ORIGINAL_ITEM_TYPE_CHECK)

        for column_name in ("editorial_overrides", "source_id", "source_type", "revision"):
            if column_name in _columns("section_items"):
                op.drop_column("section_items", column_name)

    if "page_sections" in tables and "revision" in _columns("page_sections"):
        op.drop_column("page_sections", "revision")
