"""add HERI homepage hero slides

Revision ID: 0002_hero_slides
Revises: 0001_heri_schema
"""

from alembic import op
import sqlalchemy as sa

revision = "0002_hero_slides"
down_revision = "0001_heri_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    if sa.inspect(op.get_bind()).has_table("hero_slides", schema="heri"):
        return
    op.create_table(
        "hero_slides",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("eyebrow", sa.String(length=160), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("image_url", sa.String(length=500), nullable=False),
        sa.Column("mobile_image_url", sa.String(length=500), nullable=True),
        sa.Column("button_label", sa.String(length=120), nullable=False),
        sa.Column("button_href", sa.String(length=500), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        schema="heri",
    )
    op.create_index("ix_heri_hero_slides_position", "hero_slides", ["position"], schema="heri")
    op.create_index("ix_heri_hero_slides_is_active", "hero_slides", ["is_active"], schema="heri")


def downgrade() -> None:
    op.drop_index("ix_heri_hero_slides_is_active", table_name="hero_slides", schema="heri")
    op.drop_index("ix_heri_hero_slides_position", table_name="hero_slides", schema="heri")
    op.drop_table("hero_slides", schema="heri")
