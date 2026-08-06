"""Add the index coverage carried over from the removed guides model stack.

``app/models/guides.py`` was a second, parallel declaration of six tables that
``app/models/engagement.py`` already owned, and importing both raised
``Table 'library.library_guides' is already defined``. engagement.py is now the
single owner. Its column definitions were kept unchanged — they are the shape
this migration chain builds and they are strictly more permissive than the
guides variant, so no data migration is required.

The one thing guides.py had that engagement.py did not was index coverage, so
those indexes are created here. Everything is ``if_not_exists`` because the
orphan revision 20260622_0003 declares some of the same names; a database that
was ever stamped through that branch may already have them.

Note for large tables: ``CREATE INDEX`` takes an ACCESS EXCLUSIVE lock. If any
of these tables has grown, run the equivalent ``CREATE INDEX CONCURRENTLY``
out of band first — this migration will then no-op over them.

Revision ID: 20260806_0009
Revises: 20260728_0008
Create Date: 2026-08-06
"""

from __future__ import annotations

from alembic import op

revision = "20260806_0009"
down_revision = "20260728_0008"
branch_labels = None
depends_on = None

SCHEMA = "library"

# (index_name, table_name, [columns])
INDEXES: tuple[tuple[str, str, list[str]], ...] = (
    # library_guides — single-column lookups guides.py declared inline
    ("ix_library_library_guides_subject", "library_guides", ["subject"]),
    ("ix_library_library_guides_course_code", "library_guides", ["course_code"]),
    ("ix_library_library_guides_audience", "library_guides", ["audience"]),
    ("ix_library_library_guides_school_id", "library_guides", ["school_id"]),
    ("ix_library_library_guides_department_id", "library_guides", ["department_id"]),
    ("ix_library_library_guides_owner_staff_id", "library_guides", ["owner_staff_id"]),
    ("ix_library_guides_type_subject", "library_guides", ["guide_type", "subject"]),
    # Public list orders by sort_order without narrowing the *_type column, which
    # the existing *_type_sort composites cannot serve.
    (
        "ix_library_guides_library_public_active_sort",
        "library_guides",
        ["library_id", "is_public", "is_active", "sort_order"],
    ),
    # library_workflows
    ("ix_library_library_workflows_audience", "library_workflows", ["audience"]),
    (
        "ix_library_workflows_library_public_active_sort",
        "library_workflows",
        ["library_id", "is_public", "is_active", "sort_order"],
    ),
    # library_policy_pages
    (
        "ix_library_library_policy_pages_related_regulation_id",
        "library_policy_pages",
        ["related_regulation_id"],
    ),
    (
        "ix_library_policy_pages_library_public_status_sort",
        "library_policy_pages",
        ["library_id", "is_public", "status", "sort_order"],
    ),
)


def upgrade() -> None:
    for name, table, columns in INDEXES:
        op.create_index(
            name,
            table,
            columns,
            unique=False,
            schema=SCHEMA,
            if_not_exists=True,
        )


def downgrade() -> None:
    for name, table, _columns in reversed(INDEXES):
        op.drop_index(name, table_name=table, schema=SCHEMA, if_exists=True)
