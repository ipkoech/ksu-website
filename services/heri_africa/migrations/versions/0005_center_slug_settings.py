"""Store the configured HERI research centre by human-readable slug."""

from alembic import op
import sqlalchemy as sa

revision = "0005_center_slug_settings"
down_revision = "0004_partner_center_alignment"
branch_labels = None
depends_on = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    for table_name in ("site_settings", "partners"):
        columns = {column["name"] for column in inspector.get_columns(table_name, schema="heri")}
        if "research_center_slug" not in columns:
            op.add_column(
                table_name,
                sa.Column("research_center_slug", sa.String(180), nullable=True),
                schema="heri",
            )
    indexes = {
        index["name"]
        for table_name in ("site_settings", "partners")
        for index in inspector.get_indexes(table_name, schema="heri")
    }
    for name, table_name in (
        ("ix_heri_site_settings_research_center_slug", "site_settings"),
        ("ix_heri_partners_research_center_slug", "partners"),
    ):
        if name not in indexes:
            op.create_index(name, table_name, ["research_center_slug"], schema="heri")


def downgrade() -> None:
    op.drop_index("ix_heri_partners_research_center_slug", table_name="partners", schema="heri")
    op.drop_column("partners", "research_center_slug", schema="heri")
    op.drop_index("ix_heri_site_settings_research_center_slug", table_name="site_settings", schema="heri")
    op.drop_column("site_settings", "research_center_slug", schema="heri")
