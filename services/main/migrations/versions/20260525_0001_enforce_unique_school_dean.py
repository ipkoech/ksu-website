"""enforce unique active school dean assignment

Revision ID: 20260525_0001
Revises: 20260520_0001
Create Date: 2026-05-25 00:00:00.000000
"""

from __future__ import annotations

from alembic import op


revision = "20260525_0001"
down_revision = "20260520_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        CREATE UNIQUE INDEX IF NOT EXISTS uq_staff_assignments_active_school_dean
        ON staff_assignments (entity_type, entity_id, role)
        WHERE status = 'active'
          AND deleted_at IS NULL
          AND entity_type = 'school'
          AND role = 'dean'
        """
    )
    op.execute(
        """
        CREATE UNIQUE INDEX IF NOT EXISTS uq_staff_assignments_active_department_head_role
        ON staff_assignments (entity_type, entity_id, role)
        WHERE status = 'active'
          AND deleted_at IS NULL
          AND entity_type = 'department'
          AND role IN ('hod', 'cod', 'head')
        """
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS uq_staff_assignments_active_department_head_role")
    op.execute("DROP INDEX IF EXISTS uq_staff_assignments_active_school_dean")
