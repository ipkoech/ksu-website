"""fix page cms uniqueness and enabled flags

Revision ID: 20260710_0011
Revises: 20260710_0010
Create Date: 2026-07-10 00:30:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260710_0011"
down_revision = "20260710_0010"
branch_labels = None
depends_on = None


def _tables() -> set[str]:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return set(inspector.get_table_names())


def _columns(table_name: str) -> set[str]:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return {column["name"] for column in inspector.get_columns(table_name)}


def _indexes(table_name: str) -> set[str]:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return {index["name"] for index in inspector.get_indexes(table_name)}


def _unique_constraints(table_name: str) -> set[str]:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return {constraint["name"] for constraint in inspector.get_unique_constraints(table_name)}


def upgrade() -> None:
    tables = _tables()

    if "page_sections" in tables:
        columns = _columns("page_sections")
        if "is_enabled" not in columns:
            op.add_column(
                "page_sections",
                sa.Column("is_enabled", sa.Boolean(), server_default=sa.text("true"), nullable=False),
            )

        if "uq_page_sections_scope_section" in _unique_constraints("page_sections"):
            op.drop_constraint("uq_page_sections_scope_section", "page_sections", type_="unique")

        indexes = _indexes("page_sections")
        if "uq_page_sections_scope_section_with_scope_id" not in indexes:
            op.create_index(
                "uq_page_sections_scope_section_with_scope_id",
                "page_sections",
                ["page_key", "scope_type", "scope_id", "section_key"],
                unique=True,
                postgresql_where=sa.text("scope_id IS NOT NULL"),
            )
        if "uq_page_sections_scope_section_without_scope_id" not in indexes:
            op.create_index(
                "uq_page_sections_scope_section_without_scope_id",
                "page_sections",
                ["page_key", "scope_type", "section_key"],
                unique=True,
                postgresql_where=sa.text("scope_id IS NULL"),
            )

    if "partnership_spotlights" in tables and "is_enabled" not in _columns("partnership_spotlights"):
        op.add_column(
            "partnership_spotlights",
            sa.Column("is_enabled", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        )


def downgrade() -> None:
    tables = _tables()

    if "page_sections" in tables:
        indexes = _indexes("page_sections")
        if "uq_page_sections_scope_section_without_scope_id" in indexes:
            op.drop_index("uq_page_sections_scope_section_without_scope_id", table_name="page_sections")
        if "uq_page_sections_scope_section_with_scope_id" in indexes:
            op.drop_index("uq_page_sections_scope_section_with_scope_id", table_name="page_sections")

        if "uq_page_sections_scope_section" not in _unique_constraints("page_sections"):
            op.create_unique_constraint(
                "uq_page_sections_scope_section",
                "page_sections",
                ["page_key", "scope_type", "scope_id", "section_key"],
            )

        if "is_enabled" in _columns("page_sections"):
            op.drop_column("page_sections", "is_enabled")

    if "partnership_spotlights" in tables and "is_enabled" in _columns("partnership_spotlights"):
        op.drop_column("partnership_spotlights", "is_enabled")
