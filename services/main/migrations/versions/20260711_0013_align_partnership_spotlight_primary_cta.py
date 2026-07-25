"""align partnership spotlight primary CTA fields

Revision ID: 20260711_0013
Revises: 20260710_0012
Create Date: 2026-07-11 09:30:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260711_0013"
down_revision = "20260710_0012"
branch_labels = None
depends_on = None


UPGRADE_CTA_SOURCES = ("manual", "partner_website", "generated_detail_page")
UPGRADE_CTA_SOURCES_SQL = ", ".join(f"'{source}'" for source in UPGRADE_CTA_SOURCES)
DOWNGRADE_CTA_SOURCES = ("research_partner", "custom")
DOWNGRADE_CTA_SOURCES_SQL = ", ".join(f"'{source}'" for source in DOWNGRADE_CTA_SOURCES)
PRIMARY_CTA_SOURCE_CHECK = "primary_cta_source IN ('manual', 'partner_website', 'generated_detail_page')"
CTA_SOURCE_CHECK = "cta_source IN ('research_partner', 'custom')"


def _tables() -> set[str]:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return set(inspector.get_table_names())


def _columns(table_name: str) -> set[str]:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return {column["name"] for column in inspector.get_columns(table_name)}


def _check_constraints(table_name: str) -> set[str]:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return {constraint["name"] for constraint in inspector.get_check_constraints(table_name)}


def upgrade() -> None:
    if "partnership_spotlights" not in _tables():
        return

    columns = _columns("partnership_spotlights")

    if "primary_cta_source" not in columns and "cta_source" in columns:
        op.alter_column(
            "partnership_spotlights",
            "cta_source",
            new_column_name="primary_cta_source",
            existing_type=sa.String(length=32),
            existing_nullable=False,
        )
    if "primary_cta_label" not in columns and "cta_label" in columns:
        op.alter_column(
            "partnership_spotlights",
            "cta_label",
            new_column_name="primary_cta_label",
            existing_type=sa.String(length=255),
            existing_nullable=True,
        )
    if "primary_cta_url" not in columns and "cta_url" in columns:
        op.alter_column(
            "partnership_spotlights",
            "cta_url",
            new_column_name="primary_cta_url",
            existing_type=sa.String(length=1024),
            existing_nullable=True,
        )

    columns = _columns("partnership_spotlights")
    if "primary_cta_source" not in columns:
        op.add_column(
            "partnership_spotlights",
            sa.Column("primary_cta_source", sa.String(length=32), server_default="manual", nullable=False),
        )
    if "primary_cta_label" not in columns:
        op.add_column("partnership_spotlights", sa.Column("primary_cta_label", sa.String(length=255), nullable=True))
    if "primary_cta_url" not in columns:
        op.add_column("partnership_spotlights", sa.Column("primary_cta_url", sa.String(length=1024), nullable=True))

    columns = _columns("partnership_spotlights")
    if "cta_source" in columns:
        op.execute(
            sa.text(
                """
                UPDATE partnership_spotlights
                SET primary_cta_source = COALESCE(primary_cta_source, cta_source)
                """
            )
        )
    if "cta_label" in columns:
        op.execute(
            sa.text(
                """
                UPDATE partnership_spotlights
                SET primary_cta_label = COALESCE(primary_cta_label, cta_label)
                """
            )
        )
    if "cta_url" in columns:
        op.execute(
            sa.text(
                """
                UPDATE partnership_spotlights
                SET primary_cta_url = COALESCE(primary_cta_url, cta_url)
                """
            )
        )

    constraints = _check_constraints("partnership_spotlights")
    if "ck_partnership_spotlights_cta_source" in constraints:
        op.drop_constraint("ck_partnership_spotlights_cta_source", "partnership_spotlights", type_="check")

    op.execute(
        sa.text(
            """
            UPDATE partnership_spotlights
            SET primary_cta_source = CASE
                WHEN primary_cta_source = 'custom' THEN 'manual'
                WHEN primary_cta_source = 'research_partner' THEN 'partner_website'
                WHEN primary_cta_source IS NULL THEN 'manual'
                ELSE primary_cta_source
            END
            """
        )
    )

    op.alter_column(
        "partnership_spotlights",
        "primary_cta_source",
        existing_type=sa.String(length=32),
        existing_nullable=False,
        server_default="manual",
    )

    constraints = _check_constraints("partnership_spotlights")
    if "ck_partnership_spotlights_primary_cta_source" not in constraints:
        op.create_check_constraint(
            "ck_partnership_spotlights_primary_cta_source",
            "partnership_spotlights",
            PRIMARY_CTA_SOURCE_CHECK,
        )

    columns = _columns("partnership_spotlights")
    if "cta_source" in columns:
        op.drop_column("partnership_spotlights", "cta_source")
    if "cta_label" in columns:
        op.drop_column("partnership_spotlights", "cta_label")
    if "cta_url" in columns:
        op.drop_column("partnership_spotlights", "cta_url")


def downgrade() -> None:
    if "partnership_spotlights" not in _tables():
        return

    constraints = _check_constraints("partnership_spotlights")
    if "ck_partnership_spotlights_primary_cta_source" in constraints:
        op.drop_constraint(
            "ck_partnership_spotlights_primary_cta_source",
            "partnership_spotlights",
            type_="check",
        )

    columns = _columns("partnership_spotlights")
    if "cta_source" not in columns and "primary_cta_source" in columns:
        op.alter_column(
            "partnership_spotlights",
            "primary_cta_source",
            new_column_name="cta_source",
            existing_type=sa.String(length=32),
            existing_nullable=False,
        )
    if "cta_label" not in columns and "primary_cta_label" in columns:
        op.alter_column(
            "partnership_spotlights",
            "primary_cta_label",
            new_column_name="cta_label",
            existing_type=sa.String(length=255),
            existing_nullable=True,
        )
    if "cta_url" not in columns and "primary_cta_url" in columns:
        op.alter_column(
            "partnership_spotlights",
            "primary_cta_url",
            new_column_name="cta_url",
            existing_type=sa.String(length=1024),
            existing_nullable=True,
        )

    columns = _columns("partnership_spotlights")
    if "cta_source" not in columns:
        op.add_column(
            "partnership_spotlights",
            sa.Column("cta_source", sa.String(length=32), server_default="research_partner", nullable=False),
        )
    if "cta_label" not in columns:
        op.add_column("partnership_spotlights", sa.Column("cta_label", sa.String(length=255), nullable=True))
    if "cta_url" not in columns:
        op.add_column("partnership_spotlights", sa.Column("cta_url", sa.String(length=1024), nullable=True))

    columns = _columns("partnership_spotlights")
    if "primary_cta_source" in columns:
        op.execute(
            sa.text(
                """
                UPDATE partnership_spotlights
                SET cta_source = COALESCE(cta_source, primary_cta_source)
                """
            )
        )
    if "primary_cta_label" in columns:
        op.execute(
            sa.text(
                """
                UPDATE partnership_spotlights
                SET cta_label = COALESCE(cta_label, primary_cta_label)
                """
            )
        )
    if "primary_cta_url" in columns:
        op.execute(
            sa.text(
                """
                UPDATE partnership_spotlights
                SET cta_url = COALESCE(cta_url, primary_cta_url)
                """
            )
        )

    op.execute(
        sa.text(
            """
            UPDATE partnership_spotlights
            SET cta_source = CASE
                WHEN cta_source = 'manual' THEN 'custom'
                WHEN cta_source = 'partner_website' THEN 'research_partner'
                WHEN cta_source = 'generated_detail_page' THEN 'custom'
                WHEN cta_source IS NULL THEN 'research_partner'
                ELSE cta_source
            END
            """
        )
    )

    op.alter_column(
        "partnership_spotlights",
        "cta_source",
        existing_type=sa.String(length=32),
        existing_nullable=False,
        server_default="research_partner",
    )

    constraints = _check_constraints("partnership_spotlights")
    if "ck_partnership_spotlights_cta_source" not in constraints:
        op.create_check_constraint(
            "ck_partnership_spotlights_cta_source",
            "partnership_spotlights",
            CTA_SOURCE_CHECK,
        )

    columns = _columns("partnership_spotlights")
    if "primary_cta_source" in columns:
        op.drop_column("partnership_spotlights", "primary_cta_source")
    if "primary_cta_label" in columns:
        op.drop_column("partnership_spotlights", "primary_cta_label")
    if "primary_cta_url" in columns:
        op.drop_column("partnership_spotlights", "primary_cta_url")
