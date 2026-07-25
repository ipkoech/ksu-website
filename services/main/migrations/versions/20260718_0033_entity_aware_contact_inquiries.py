"""Make public contact inquiries entity-aware.

Revision ID: 20260718_0033
Revises: 20260717_0032
"""

from alembic import op
import sqlalchemy as sa


revision = "20260718_0033"
down_revision = "20260717_0032"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column("contact_inquiries", "school_id", nullable=True)
    for column in (
        sa.Column("target_entity_type", sa.String(32), nullable=True),
        sa.Column("target_entity_id", sa.UUID(), nullable=True),
        sa.Column("target_entity_name", sa.String(255), nullable=True),
        sa.Column("target_entity_slug", sa.String(255), nullable=True),
        sa.Column("owner_scope_type", sa.String(32), nullable=True),
        sa.Column("owner_scope_id", sa.UUID(), nullable=True),
        sa.Column("source_page_url", sa.String(1024), nullable=True),
    ):
        op.add_column("contact_inquiries", column)

    op.execute(
        """
        UPDATE contact_inquiries AS inquiry
        SET target_entity_type = 'school',
            target_entity_id = inquiry.school_id,
            target_entity_name = school.name,
            target_entity_slug = school.slug,
            owner_scope_type = 'school',
            owner_scope_id = inquiry.school_id
        FROM schools AS school
        WHERE school.id = inquiry.school_id
        """
    )
    for field in (
        "target_entity_type",
        "target_entity_id",
        "owner_scope_type",
    ):
        op.alter_column("contact_inquiries", field, nullable=False)

    op.create_check_constraint(
        "ck_contact_inquiries_target_entity_type",
        "contact_inquiries",
        "target_entity_type IN ('university', 'school', 'department', 'office', 'person')",
    )
    op.create_check_constraint(
        "ck_contact_inquiries_owner_scope_type",
        "contact_inquiries",
        "owner_scope_type IN ('university', 'division', 'wing', 'school', 'department')",
    )
    op.create_check_constraint(
        "ck_contact_inquiries_university_owner",
        "contact_inquiries",
        "(owner_scope_type = 'university' AND owner_scope_id IS NULL) OR "
        "(owner_scope_type <> 'university' AND owner_scope_id IS NOT NULL)",
    )
    op.create_index(
        "ix_contact_inquiries_target",
        "contact_inquiries",
        ["target_entity_type", "target_entity_id"],
    )
    op.create_index(
        "ix_contact_inquiries_owner_inbox",
        "contact_inquiries",
        ["owner_scope_type", "owner_scope_id", "status", "last_message_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_contact_inquiries_owner_inbox", table_name="contact_inquiries")
    op.drop_index("ix_contact_inquiries_target", table_name="contact_inquiries")
    op.drop_constraint("ck_contact_inquiries_university_owner", "contact_inquiries", type_="check")
    op.drop_constraint("ck_contact_inquiries_owner_scope_type", "contact_inquiries", type_="check")
    op.drop_constraint("ck_contact_inquiries_target_entity_type", "contact_inquiries", type_="check")
    for field in (
        "source_page_url",
        "owner_scope_id",
        "owner_scope_type",
        "target_entity_slug",
        "target_entity_name",
        "target_entity_id",
        "target_entity_type",
    ):
        op.drop_column("contact_inquiries", field)
    op.alter_column("contact_inquiries", "school_id", nullable=False)
