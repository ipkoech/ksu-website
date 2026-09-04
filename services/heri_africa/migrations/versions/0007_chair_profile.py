"""Add structured HERI Language Education Research Chair profile."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0007_chair_profile"
down_revision = "0006_command_idempotency"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "chair_profiles",
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("acronym", sa.String(80), nullable=True),
        sa.Column("host_institution", sa.String(255), server_default="Kisii University", nullable=False),
        sa.Column("initiative_name", sa.String(255), server_default="HERI Africa", nullable=False),
        sa.Column("about", sa.Text(), server_default="", nullable=False),
        sa.Column("tagline", sa.String(255), nullable=True),
        sa.Column("vision", sa.Text(), server_default="", nullable=False),
        sa.Column("mission", sa.Text(), server_default="", nullable=False),
        sa.Column("mandate", sa.Text(), server_default="", nullable=False),
        sa.Column("objectives", sa.Text(), server_default="", nullable=False),
        sa.Column("values", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("why_it_matters", sa.Text(), server_default="", nullable=False),
        sa.Column("logo_url", sa.String(500), nullable=True),
        sa.Column("cover_image_url", sa.String(500), nullable=True),
        sa.Column("seo", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default="{}"),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        schema="heri",
    )
    op.create_index("ix_heri_chair_profiles_is_active", "chair_profiles", ["is_active"], schema="heri")


def downgrade() -> None:
    op.drop_index("ix_heri_chair_profiles_is_active", table_name="chair_profiles", schema="heri")
    op.drop_table("chair_profiles", schema="heri")
