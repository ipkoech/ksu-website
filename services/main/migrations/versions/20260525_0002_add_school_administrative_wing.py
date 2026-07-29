"""add school administrative wing link

Revision ID: 20260525_0002
Revises: 20260525_0001
Create Date: 2026-05-25 23:40:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260525_0002"
down_revision = "20260525_0001"
branch_labels = None
depends_on = None


def _columns(table_name: str) -> set[str]:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return {column["name"] for column in inspector.get_columns(table_name)}


def _indexes(table_name: str) -> set[str]:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return {index["name"] for index in inspector.get_indexes(table_name)}


def _foreign_key_exists(table_name: str, constrained_columns: list[str]) -> bool:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return any(
        foreign_key.get("constrained_columns") == constrained_columns
        for foreign_key in inspector.get_foreign_keys(table_name)
    )


def upgrade() -> None:
    if "administrative_wing_id" not in _columns("schools"):
        op.add_column("schools", sa.Column("administrative_wing_id", sa.UUID(), nullable=True))
    index_name = op.f("ix_schools_administrative_wing_id")
    if index_name not in _indexes("schools"):
        op.create_index(index_name, "schools", ["administrative_wing_id"], unique=False)
    if not _foreign_key_exists("schools", ["administrative_wing_id"]):
        op.create_foreign_key(
            "fk_schools_administrative_wing_id",
            "schools",
            "wings",
            ["administrative_wing_id"],
            ["id"],
            ondelete="SET NULL",
        )


def downgrade() -> None:
    op.drop_constraint("fk_schools_administrative_wing_id", "schools", type_="foreignkey")
    op.drop_index(op.f("ix_schools_administrative_wing_id"), table_name="schools")
    op.drop_column("schools", "administrative_wing_id")
