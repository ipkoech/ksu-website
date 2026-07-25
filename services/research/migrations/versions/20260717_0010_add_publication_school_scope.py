"""Add school ownership and author workflow to publications.

Revision ID: 20260717_0010
Revises: 20260702_0009
"""

from alembic import op
import sqlalchemy as sa


revision = "20260717_0010"
down_revision = "20260702_0009"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("publications", sa.Column("school_id", sa.Uuid(), nullable=True), schema="research")
    op.add_column("publications", sa.Column("department_id", sa.Uuid(), nullable=True), schema="research")
    op.add_column("publications", sa.Column("submitted_by_user_id", sa.Uuid(), nullable=True), schema="research")
    op.add_column("publications", sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True), schema="research")
    op.add_column("publications", sa.Column("withdrawn_at", sa.DateTime(timezone=True), nullable=True), schema="research")
    op.add_column("publications", sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True), schema="research")
    op.add_column("publications", sa.Column("reviewer_comments", sa.Text(), nullable=True), schema="research")
    op.create_index(
        "ix_publications_school_status",
        "publications",
        ["school_id", "status"],
        schema="research",
    )


def downgrade() -> None:
    op.drop_index("ix_publications_school_status", table_name="publications", schema="research")
    for column in (
        "reviewer_comments",
        "reviewed_at",
        "withdrawn_at",
        "submitted_at",
        "submitted_by_user_id",
        "department_id",
        "school_id",
    ):
        op.drop_column("publications", column, schema="research")
