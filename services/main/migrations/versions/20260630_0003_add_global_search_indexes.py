"""Add trigram indexes for public global search.

Revision ID: 20260630_0003
Revises: ed2320d646d1
Create Date: 2026-06-30 00:00:00.000000
"""

from __future__ import annotations

from alembic import op


revision = "20260630_0003"
down_revision = "ed2320d646d1"
branch_labels = None
depends_on = None


SEARCH_INDEXES = (
    (
        "ix_news_search_trgm",
        "news",
        "coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(plain_text, '') || ' ' || coalesce(rich_text, '')",
    ),
    (
        "ix_blogs_search_trgm",
        "blogs",
        "coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(plain_text, '') || ' ' || coalesce(rich_text, '')",
    ),
    (
        "ix_announcements_search_trgm",
        "announcements",
        "coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(plain_text, '') || ' ' || coalesce(rich_text, '') || ' ' || coalesce(category, '') || ' ' || coalesce(audience, '')",
    ),
    (
        "ix_events_search_trgm",
        "events",
        "coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(plain_text, '') || ' ' || coalesce(rich_text, '') || ' ' || coalesce(location, '')",
    ),
    (
        "ix_persons_search_trgm",
        "persons",
        "coalesce(full_name, '') || ' ' || coalesce(email, '') || ' ' || coalesce(bio, '') || ' ' || coalesce(specialization, '')",
    ),
    (
        "ix_schools_search_trgm",
        "schools",
        "coalesce(name, '') || ' ' || coalesce(code, '') || ' ' || coalesce(about, '') || ' ' || coalesce(head_message, '') || ' ' || coalesce(mission, '')",
    ),
    (
        "ix_departments_search_trgm",
        "departments",
        "coalesce(name, '') || ' ' || coalesce(code, '') || ' ' || coalesce(about, '') || ' ' || coalesce(head_message, '') || ' ' || coalesce(mission, '')",
    ),
)


def upgrade() -> None:
    # Extensions are installed by the privileged database bootstrap. Service
    # roles intentionally cannot create database extensions.
    op.execute(
        """DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
                RAISE EXCEPTION 'pg_trgm extension must be installed by the database bootstrap before search migrations';
            END IF;
        END $$;"""
    )
    for index_name, table_name, expression in SEARCH_INDEXES:
        op.execute(
            f"CREATE INDEX IF NOT EXISTS {index_name} "
            f"ON {table_name} USING gin (({expression}) gin_trgm_ops)"
        )


def downgrade() -> None:
    for index_name, _, _ in reversed(SEARCH_INDEXES):
        op.execute(f"DROP INDEX IF EXISTS {index_name}")
