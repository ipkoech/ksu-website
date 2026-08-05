#!/usr/bin/env python3
"""Backfill deterministic School Portal ownership with dry-run safety."""

from __future__ import annotations

import argparse
import asyncio
import os
import re
from dataclasses import dataclass

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

APPLY_CONFIRMATION = "APPLY_SCHOOL_PORTAL_BACKFILL"
SCHEMA_IDENTIFIER = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")


@dataclass(frozen=True)
class BackfillStep:
    name: str
    statements: tuple[str, ...]

    @property
    def sql(self) -> str:
        return "\n".join(self.statements)


def build_backfill_steps(
    main_schema: str = "main",
    research_schema: str = "research",
) -> tuple[BackfillStep, ...]:
    if not SCHEMA_IDENTIFIER.fullmatch(main_schema):
        raise ValueError("main schema must be a simple SQL identifier")
    if not SCHEMA_IDENTIFIER.fullmatch(research_schema):
        raise ValueError("research schema must be a simple SQL identifier")
    content_statements = tuple(
        f"""
        UPDATE "{main_schema}".{table}
        SET owner_portal = 'schools',
            owner_scope_type = 'school',
            owner_scope_id = scope_id,
            workflow_status = CASE
                WHEN is_published THEN 'published'
                WHEN status IN ('draft', 'submitted', 'changes_requested', 'approved', 'archived')
                    THEN status
                ELSE 'draft'
            END
        WHERE scope_type = 'school'
          AND scope_id IS NOT NULL
          AND owner_scope_id IS NULL
        """
        for table in ("news", "blogs", "announcements", "events")
    )
    return (
        BackfillStep("school_content_ownership", content_statements),
        BackfillStep(
            "school_gallery_ownership",
            (
                f"""
                UPDATE "{main_schema}".media_links AS link
                SET owner_portal = 'schools',
                    owner_scope_type = 'school',
                    owner_scope_id = link.entity_id,
                    author_user_id = COALESCE(link.author_user_id, media.uploaded_by_id),
                    is_public = media.is_public,
                    updated_at = now()
                FROM "{main_schema}".media AS media
                WHERE link.media_id = media.id
                  AND link.entity_type = 'school'
                  AND link.role = 'gallery'
                  AND link.deleted_at IS NULL
                  AND media.deleted_at IS NULL
                  AND (
                      link.owner_portal IS DISTINCT FROM 'schools'
                      OR link.owner_scope_type IS DISTINCT FROM 'school'
                      OR link.owner_scope_id IS DISTINCT FROM link.entity_id
                      OR link.author_user_id IS NULL
                      OR link.is_public IS DISTINCT FROM media.is_public
                  )
                """,
            ),
        ),
        BackfillStep(
            "school_document_workflow",
            (
                f"""
                UPDATE "{main_schema}".documents
                SET owner_portal = 'schools',
                    owner_scope_type = 'school',
                    owner_scope_id = scope_id,
                    workflow_status = CASE
                        WHEN is_published THEN 'published'
                        WHEN status IN ('draft', 'submitted', 'changes_requested', 'approved', 'archived')
                            THEN status
                        ELSE 'draft'
                    END
                WHERE scope_type = 'school'
                  AND scope_id IS NOT NULL
                  AND owner_scope_id IS NULL
                """,
            ),
        ),
        BackfillStep(
            "publication_school_ids",
            (
                f"""
                UPDATE "{research_schema}".publications AS publication
                SET school_id = department.school_id
                FROM "{main_schema}".departments AS department
                WHERE publication.school_id IS NULL
                  AND publication.department_id = department.id
                  AND department.school_id IS NOT NULL
                """,
            ),
        ),
        BackfillStep(
            "dean_school_admin_roles",
            (
                f"""
                INSERT INTO "{main_schema}".user_roles
                    (id, user_id, role_id, scope_type, scope_id, assigned_at,
                     note, is_active, created_at, updated_at)
                SELECT gen_random_uuid(), person.user_id, role.id, 'school', school.id,
                       now(), 'School Portal ownership backfill', true, now(), now()
                FROM "{main_schema}".schools AS school
                JOIN "{main_schema}".persons AS person ON person.id = school.dean_id
                JOIN "{main_schema}".roles AS role ON role.name = 'school_admin'
                WHERE person.user_id IS NOT NULL
                  AND school.deleted_at IS NULL
                  AND person.deleted_at IS NULL
                ON CONFLICT (user_id, role_id, scope_type, scope_id)
                DO UPDATE SET is_active = true,
                              expires_at = NULL,
                              updated_at = now(),
                              note = 'School Portal ownership backfill'
                """,
            ),
        ),
    )


async def run_backfill(
    database_url: str,
    *,
    apply: bool,
    main_schema: str,
    research_schema: str,
) -> dict[str, int]:
    engine = create_async_engine(database_url)
    totals: dict[str, int] = {}
    try:
        async with engine.connect() as connection:
            transaction = await connection.begin()
            try:
                for step in build_backfill_steps(main_schema, research_schema):
                    affected = 0
                    for statement in step.statements:
                        result = await connection.execute(text(statement))
                        affected += max(result.rowcount or 0, 0)
                    totals[step.name] = affected
                if apply:
                    await transaction.commit()
                else:
                    await transaction.rollback()
            except Exception:
                await transaction.rollback()
                raise
    finally:
        await engine.dispose()
    return totals


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Backfill School Portal ownership (dry-run by default).",
    )
    parser.add_argument("--apply", action="store_true", help="Commit changes.")
    parser.add_argument(
        "--confirm",
        help=f"Required with --apply; must equal {APPLY_CONFIRMATION}.",
    )
    parser.add_argument("--database-url", default=os.getenv("DATABASE_URL"))
    parser.add_argument("--main-schema", default=os.getenv("DB_SCHEMA", "main"))
    parser.add_argument("--research-schema", default="research")
    args = parser.parse_args()
    if not args.database_url:
        parser.error("DATABASE_URL or --database-url is required")
    if args.apply and args.confirm != APPLY_CONFIRMATION:
        parser.error(f"--apply requires --confirm {APPLY_CONFIRMATION}")
    return args


def main() -> None:
    args = parse_args()
    totals = asyncio.run(
        run_backfill(
            args.database_url,
            apply=args.apply,
            main_schema=args.main_schema,
            research_schema=args.research_schema,
        )
    )
    mode = "APPLIED" if args.apply else "DRY RUN (rolled back)"
    print(f"School Portal ownership backfill: {mode}")
    for name, affected in totals.items():
        print(f"  {name}: {affected} row(s)")


if __name__ == "__main__":
    main()
