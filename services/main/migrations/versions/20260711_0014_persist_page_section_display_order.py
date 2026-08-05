"""persist page section display order

Revision ID: 20260711_0014
Revises: 20260711_0013
Create Date: 2026-07-11 10:30:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260711_0014"
down_revision = "20260711_0013"
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


def upgrade() -> None:
    tables = _tables()
    if "page_sections" not in tables:
        return

    columns = _columns("page_sections")
    if "display_order" not in columns:
        op.add_column("page_sections", sa.Column("display_order", sa.Integer(), server_default=sa.text("100"), nullable=False))

    if "section_items" in tables:
        op.execute(
            sa.text(
                """
                UPDATE page_sections
                SET display_order = COALESCE(section_item_min.display_order, 100)
                FROM (
                    SELECT
                        page_section_id,
                        MIN(display_order) AS display_order
                    FROM section_items
                    WHERE deleted_at IS NULL
                    GROUP BY page_section_id
                ) AS section_item_min
                WHERE page_sections.id = section_item_min.page_section_id
                """
            )
        )

    if "ix_page_sections_scope_page_order" not in _indexes("page_sections"):
        op.create_index("ix_page_sections_scope_page_order", "page_sections", ["scope_type", "scope_id", "page_key", "display_order"], unique=False)


def downgrade() -> None:
    if "page_sections" not in _tables():
        return

    indexes = _indexes("page_sections")
    if "ix_page_sections_scope_page_order" in indexes:
        op.drop_index("ix_page_sections_scope_page_order", table_name="page_sections")

    if "display_order" in _columns("page_sections"):
        op.drop_column("page_sections", "display_order")
