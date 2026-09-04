"""Add nullable external lecturer synchronization fields."""

import sqlalchemy as sa
from alembic import op

revision = "20260904_0900"
down_revision = "20260813_0840"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("programmes", sa.Column("external_source", sa.String(64), nullable=True))
    op.add_column("programmes", sa.Column("external_source_id", sa.String(128), nullable=True))
    op.add_column("programmes", sa.Column("external_name", sa.String(255), nullable=True))
    op.alter_column("programmes", "duration", existing_type=sa.String(64), nullable=True)
    op.create_index("ix_programmes_external_source", "programmes", ["external_source"])
    op.create_index("ix_programmes_external_source_id", "programmes", ["external_source_id"])
    op.create_index("uq_programmes_external_identity", "programmes", ["external_source", "external_source_id"], unique=True, postgresql_where=sa.text("external_source IS NOT NULL AND external_source_id IS NOT NULL AND deleted_at IS NULL"))
    for table in ("persons", "departments", "staff_assignments"):
        op.add_column(table, sa.Column("external_source", sa.String(64), nullable=True))
        op.add_column(table, sa.Column("external_source_id", sa.String(128), nullable=True))
        op.create_index(f"ix_{table}_external_source", table, ["external_source"])
        op.create_index(f"ix_{table}_external_source_id", table, ["external_source_id"])
    op.add_column("persons", sa.Column("external_updated_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("persons", sa.Column("external_avatar_url", sa.String(1024), nullable=True))
    op.add_column("persons", sa.Column("skills", sa.JSON(), nullable=True))
    op.add_column("staff_assignments", sa.Column("external_updated_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("departments", sa.Column("external_name", sa.String(255), nullable=True))

    op.create_table(
        "person_work_experience",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("person_id", sa.Uuid(), sa.ForeignKey("persons.id", ondelete="CASCADE"), nullable=False),
        sa.Column("external_source", sa.String(64), nullable=True),
        sa.Column("external_source_id", sa.String(128), nullable=True),
        sa.Column("organization", sa.String(255), nullable=False),
        sa.Column("designation", sa.String(255), nullable=True),
        sa.Column("assignment", sa.Text(), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("source_status", sa.String(64), nullable=True),
    )
    op.create_index("ix_person_work_experience_person_id", "person_work_experience", ["person_id"])
    op.create_index("ix_person_work_experience_external_source", "person_work_experience", ["external_source"])
    op.create_index("ix_person_work_experience_external_source_id", "person_work_experience", ["external_source_id"])
    for table in ("persons", "departments", "staff_assignments", "person_work_experience"):
        op.create_index(
            f"uq_{table}_external_identity", table, ["external_source", "external_source_id"], unique=True,
            postgresql_where=sa.text("external_source IS NOT NULL AND external_source_id IS NOT NULL AND deleted_at IS NULL"),
        )


def downgrade() -> None:
    op.drop_index("uq_programmes_external_identity", table_name="programmes")
    op.drop_index("ix_programmes_external_source_id", table_name="programmes")
    op.drop_index("ix_programmes_external_source", table_name="programmes")
    op.alter_column("programmes", "duration", existing_type=sa.String(64), nullable=False)
    op.drop_column("programmes", "external_name")
    op.drop_column("programmes", "external_source_id")
    op.drop_column("programmes", "external_source")
    op.drop_table("person_work_experience")
    for table in ("persons", "departments", "staff_assignments"):
        op.drop_index(f"uq_{table}_external_identity", table_name=table)
    for table, columns in {
        "persons": ("external_updated_at", "external_avatar_url", "skills"),
        "departments": ("external_name",),
        "staff_assignments": ("external_updated_at",),
    }.items():
        for column in columns:
            op.drop_column(table, column)
    for table in ("persons", "departments", "staff_assignments"):
        op.drop_index(f"ix_{table}_external_source_id", table_name=table)
        op.drop_index(f"ix_{table}_external_source", table_name=table)
        op.drop_column(table, "external_source_id")
        op.drop_column(table, "external_source")
