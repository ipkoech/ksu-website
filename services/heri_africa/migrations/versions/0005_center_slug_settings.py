"""Store the configured HERI research centre by human-readable slug."""

from alembic import op
import sqlalchemy as sa

revision = "0005_center_slug_settings"
down_revision = "0004_partner_center_alignment"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("site_settings", sa.Column("research_center_slug", sa.String(180), nullable=True), schema="heri")
    op.create_index("ix_heri_site_settings_research_center_slug", "site_settings", ["research_center_slug"], schema="heri")
    op.add_column("partners", sa.Column("research_center_slug", sa.String(180), nullable=True), schema="heri")
    op.create_index("ix_heri_partners_research_center_slug", "partners", ["research_center_slug"], schema="heri")


def downgrade() -> None:
    op.drop_index("ix_heri_partners_research_center_slug", table_name="partners", schema="heri")
    op.drop_column("partners", "research_center_slug", schema="heri")
    op.drop_index("ix_heri_site_settings_research_center_slug", table_name="site_settings", schema="heri")
    op.drop_column("site_settings", "research_center_slug", schema="heri")
