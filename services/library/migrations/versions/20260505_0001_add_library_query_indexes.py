"""Add composite indexes for common library-service query patterns.

Revision ID: 20260505_0001
Revises:
Create Date: 2026-05-05 00:01:00
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260505_0001"
down_revision = "20260505_0000"
branch_labels = None
depends_on = None


def _index_exists(table_name: str, index_name: str) -> bool:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return any(index["name"] == index_name for index in inspector.get_indexes(table_name, schema="library"))


def _create_index_if_missing(index_name: str, table_name: str, columns: list[str]) -> None:
    if _index_exists(table_name, index_name):
        return
    op.create_index(
        index_name,
        table_name,
        columns,
        unique=False,
        schema="library",
    )


def upgrade() -> None:
    _create_index_if_missing("ix_library_libraries_active_sort_name", "libraries", ["is_active", "sort_order", "name"])
    _create_index_if_missing(
        "ix_library_hours_library_day_type",
        "library_hours",
        ["library_id", "day_type"],
    )
    _create_index_if_missing(
        "ix_library_external_links_library_active_sort",
        "library_external_links",
        ["library_id", "is_active", "sort_order"],
    )
    _create_index_if_missing(
        "ix_library_files_library_public_sort",
        "library_files",
        ["library_id", "is_public", "sort_order"],
    )
    _create_index_if_missing(
        "ix_library_staff_library_active_public_sort",
        "library_staff",
        ["library_id", "is_active", "is_public", "sort_order"],
    )
    _create_index_if_missing(
        "ix_library_services_library_active_public_sort",
        "library_services",
        ["library_id", "is_active", "is_public", "sort_order"],
    )
    _create_index_if_missing(
        "ix_library_statistics_library_period_start",
        "library_statistics",
        ["library_id", "period_type", "period_start"],
    )
    _create_index_if_missing(
        "ix_library_resources_library_active_type_status_title",
        "library_resources",
        ["library_id", "is_active", "resource_type", "status", "title"],
    )
    _create_index_if_missing(
        "ix_library_loans_borrower_status_borrowed",
        "library_loans",
        ["borrower_person_id", "status", "borrowed_at"],
    )
    _create_index_if_missing(
        "ix_library_loans_resource_status_due",
        "library_loans",
        ["resource_id", "status", "due_at"],
    )
    _create_index_if_missing(
        "ix_library_reservations_requester_status_reserved",
        "library_resource_reservations",
        ["requester_person_id", "status", "reserved_at"],
    )
    _create_index_if_missing(
        "ix_library_reservations_resource_status_reserved",
        "library_resource_reservations",
        ["resource_id", "status", "reserved_at"],
    )
    _create_index_if_missing(
        "ix_library_charges_library_active_type",
        "library_charges",
        ["library_id", "is_active", "charge_type"],
    )
    _create_index_if_missing(
        "ix_library_electronic_resources_library_active_letter_sort",
        "electronic_resources",
        ["library_id", "is_active", "section_letter", "sort_order", "name"],
    )
    _create_index_if_missing(
        "ix_library_electronic_resources_active_type_access",
        "electronic_resources",
        ["is_active", "resource_type", "access_level"],
    )
    _create_index_if_missing(
        "ix_library_electronic_guides_resource_active_sort",
        "electronic_resource_guides",
        ["electronic_resource_id", "is_active", "sort_order"],
    )


def downgrade() -> None:
    op.drop_index("ix_library_electronic_guides_resource_active_sort", table_name="electronic_resource_guides", schema="library")
    op.drop_index("ix_library_electronic_resources_active_type_access", table_name="electronic_resources", schema="library")
    op.drop_index("ix_library_electronic_resources_library_active_letter_sort", table_name="electronic_resources", schema="library")
    op.drop_index("ix_library_charges_library_active_type", table_name="library_charges", schema="library")
    op.drop_index("ix_library_reservations_resource_status_reserved", table_name="library_resource_reservations", schema="library")
    op.drop_index("ix_library_reservations_requester_status_reserved", table_name="library_resource_reservations", schema="library")
    op.drop_index("ix_library_loans_resource_status_due", table_name="library_loans", schema="library")
    op.drop_index("ix_library_loans_borrower_status_borrowed", table_name="library_loans", schema="library")
    op.drop_index("ix_library_resources_library_active_type_status_title", table_name="library_resources", schema="library")
    op.drop_index("ix_library_statistics_library_period_start", table_name="library_statistics", schema="library")
    op.drop_index("ix_library_services_library_active_public_sort", table_name="library_services", schema="library")
    op.drop_index("ix_library_staff_library_active_public_sort", table_name="library_staff", schema="library")
    op.drop_index("ix_library_files_library_public_sort", table_name="library_files", schema="library")
    op.drop_index("ix_library_external_links_library_active_sort", table_name="library_external_links", schema="library")
    op.drop_index("ix_library_hours_library_day_type", table_name="library_hours", schema="library")
    op.drop_index("ix_library_libraries_active_sort_name", table_name="libraries", schema="library")
