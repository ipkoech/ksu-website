"""Add trigram indexes for public research search.

Revision ID: 20260630_0003
Revises: 20260630_0002
Create Date: 2026-06-30 00:00:00.000000
"""

from __future__ import annotations

from alembic import op


revision = "20260630_0003"
down_revision = "20260630_0002"
branch_labels = None
depends_on = None


SEARCH_INDEXES = (
    (
        "ix_research_projects_search_trgm",
        "research_projects",
        "coalesce(title, '') || ' ' || coalesce(code, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(abstract, '') || ' ' || coalesce(status, '')",
    ),
    (
        "ix_research_publications_search_trgm",
        "publications",
        "coalesce(title, '') || ' ' || coalesce(journal_name, '') || ' ' || coalesce(publisher, '') || ' ' || coalesce(doi, '') || ' ' || coalesce(abstract, '') || ' ' || coalesce(conference_name, '') || ' ' || coalesce(book_title, '')",
    ),
    (
        "ix_research_grants_search_trgm",
        "grants",
        "coalesce(title, '') || ' ' || coalesce(code, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(description, '') || ' ' || coalesce(objectives, '') || ' ' || coalesce(eligibility, '') || ' ' || coalesce(focus_areas, '') || ' ' || coalesce(funder_name, '')",
    ),
    (
        "ix_research_centers_search_trgm",
        "research_centers",
        "coalesce(name, '') || ' ' || coalesce(code, '') || ' ' || coalesce(acronym, '') || ' ' || coalesce(about, '') || ' ' || coalesce(mission, '') || ' ' || coalesce(objectives, '') || ' ' || coalesce(mandate, '') || ' ' || coalesce(research_areas, '') || ' ' || coalesce(location, '')",
    ),
    (
        "ix_research_innovations_search_trgm",
        "innovations",
        "coalesce(title, '') || ' ' || coalesce(code, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(description, '') || ' ' || coalesce(solution, '') || ' ' || coalesce(category, '') || ' ' || coalesce(innovation_type, '')",
    ),
    (
        "ix_research_partners_search_trgm",
        "partners",
        "coalesce(name, '') || ' ' || coalesce(acronym, '') || ' ' || coalesce(about, '') || ' ' || coalesce(country, '') || ' ' || coalesce(partner_type, '') || ' ' || coalesce(collaboration_areas, '')",
    ),
    (
        "ix_research_resources_search_trgm",
        "research_resources",
        "coalesce(name, '') || ' ' || coalesce(code, '') || ' ' || coalesce(description, '') || ' ' || coalesce(category, '') || ' ' || coalesce(resource_type, '')",
    ),
    (
        "ix_research_services_search_trgm",
        "research_services",
        "coalesce(name, '') || ' ' || coalesce(code, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(description, '') || ' ' || coalesce(category, '') || ' ' || coalesce(service_type, '')",
    ),
    (
        "ix_research_guidelines_search_trgm",
        "research_guidelines",
        "coalesce(title, '') || ' ' || coalesce(code, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(content, '') || ' ' || coalesce(category, '') || ' ' || coalesce(guideline_type, '')",
    ),
)


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
    for index_name, table_name, expression in SEARCH_INDEXES:
        op.execute(
            f"CREATE INDEX IF NOT EXISTS {index_name} "
            f"ON research.{table_name} USING gin (({expression}) gin_trgm_ops)"
        )


def downgrade() -> None:
    for index_name, _, _ in reversed(SEARCH_INDEXES):
        op.execute(f"DROP INDEX IF EXISTS research.{index_name}")
