"""Add trigram indexes for public library search.

Revision ID: 20260630_0004
Revises: 20260623_0003
Create Date: 2026-06-30 00:00:00.000000
"""

from __future__ import annotations

from alembic import op


revision = "20260630_0004"
down_revision = "20260623_0003"
branch_labels = None
depends_on = None


SEARCH_INDEXES = (
    (
        "ix_library_resources_search_trgm",
        "library_resources",
        "coalesce(title, '') || ' ' || coalesce(subtitle, '') || ' ' || coalesce(authors, '') || ' ' || coalesce(publisher, '') || ' ' || coalesce(isbn, '') || ' ' || coalesce(issn, '') || ' ' || coalesce(call_number, '') || ' ' || coalesce(description, '')",
    ),
    (
        "ix_library_electronic_resources_search_trgm",
        "electronic_resources",
        "coalesce(name, '') || ' ' || coalesce(provider, '') || ' ' || coalesce(description, '') || ' ' || coalesce(resource_type, '')",
    ),
    (
        "ix_library_services_search_trgm",
        "library_services",
        "coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(eligibility, '') || ' ' || coalesce(how_to_access, '') || ' ' || coalesce(service_type, '')",
    ),
    (
        "ix_library_staff_search_trgm",
        "library_staff",
        "coalesce(job_title, '') || ' ' || coalesce(department, '') || ' ' || coalesce(role, '') || ' ' || coalesce(bio, '') || ' ' || coalesce(specialization, '')",
    ),
    (
        "ix_library_regulations_search_trgm",
        "library_regulations",
        "coalesce(title, '') || ' ' || coalesce(content, '') || ' ' || coalesce(category, '')",
    ),
    (
        "ix_library_guides_search_trgm",
        "library_guides",
        "coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(subject, '') || ' ' || coalesce(course_code, '') || ' ' || coalesce(audience, '')",
    ),
    (
        "ix_library_workflows_search_trgm",
        "library_workflows",
        "coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(audience, '') || ' ' || coalesce(workflow_type, '')",
    ),
    (
        "ix_library_policy_pages_search_trgm",
        "library_policy_pages",
        "coalesce(title, '') || ' ' || coalesce(content, '') || ' ' || coalesce(policy_type, '')",
    ),
    (
        "ix_library_external_links_search_trgm",
        "library_external_links",
        "coalesce(label, '') || ' ' || coalesce(description, '') || ' ' || coalesce(link_type, '')",
    ),
)


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
    for index_name, table_name, expression in SEARCH_INDEXES:
        op.execute(
            f"CREATE INDEX IF NOT EXISTS {index_name} "
            f"ON library.{table_name} USING gin (({expression}) gin_trgm_ops)"
        )


def downgrade() -> None:
    for index_name, _, _ in reversed(SEARCH_INDEXES):
        op.execute(f"DROP INDEX IF EXISTS library.{index_name}")
