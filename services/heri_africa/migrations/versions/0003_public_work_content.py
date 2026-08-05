"""Add typed public Our Work impact metrics."""

from alembic import op
import sqlalchemy as sa

revision = "0003_public_work_content"
down_revision = "0002_hero_slides"
branch_labels = None
depends_on = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    if inspector.has_table("impact_metrics", schema="heri"):
        return
    op.create_table(
        "impact_metrics",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("label", sa.String(length=180), nullable=False),
        sa.Column("value", sa.String(length=120), nullable=False),
        sa.Column("unit", sa.String(length=80), nullable=True),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("is_visible", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        schema="heri",
    )
    op.create_index("ix_heri_impact_metrics_position", "impact_metrics", ["position"], schema="heri")
    op.create_index("ix_heri_impact_metrics_is_visible", "impact_metrics", ["is_visible"], schema="heri")


def downgrade() -> None:
    op.drop_index("ix_heri_impact_metrics_is_visible", table_name="impact_metrics", schema="heri")
    op.drop_index("ix_heri_impact_metrics_position", table_name="impact_metrics", schema="heri")
    op.drop_table("impact_metrics", schema="heri")
