#!/usr/bin/env python3
"""Verify that a restored KSU database has every schema and migration head."""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
from urllib.parse import unquote, urlparse

EXPECTED_HEADS = {
    "main": "20260809_0800",
    "research": "20260805_0012",
    "library": "20260807_0010",
    "heri": "0006_command_idempotency",
}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--admin-url", default=os.getenv("DATABASE_ADMIN_URL"))
    args = parser.parse_args()
    if not args.admin_url:
        parser.error("--admin-url or DATABASE_ADMIN_URL is required")
    parsed = urlparse(args.admin_url.replace("postgresql+asyncpg://", "postgresql://", 1))
    expected = " UNION ALL ".join(
        f"SELECT '{schema}'::text, '{head}'::text" for schema, head in EXPECTED_HEADS.items()
    )
    sql = f"""
WITH expected(schema_name, expected_head) AS ({expected}),
observed AS (
  SELECT e.schema_name, e.expected_head,
         to_regclass(format('%I.alembic_version', e.schema_name)) AS version_table,
         (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
          WHERE n.nspname=e.schema_name AND c.relkind IN ('r','p')) AS table_count
  FROM expected e
)
SELECT schema_name || ':' || expected_head || ':' || table_count
FROM observed
WHERE version_table IS NULL OR table_count < 2
   OR NOT EXISTS (
     SELECT 1 FROM pg_catalog.pg_tables t
     WHERE t.schemaname=observed.schema_name AND t.tablename='alembic_version'
   )
ORDER BY schema_name;
"""
    env = dict(os.environ, PGPASSWORD=unquote(parsed.password or ""))
    command = [
        "psql", "-XAt", "--set=ON_ERROR_STOP=1",
        "--host", parsed.hostname or "localhost", "--port", str(parsed.port or 5432),
        "--username", unquote(parsed.username or "postgres"), "--dbname", parsed.path.lstrip("/"),
    ]
    result = subprocess.run(command, input=sql, text=True, capture_output=True, env=env)
    if result.returncode:
        print(result.stderr.strip(), file=sys.stderr)
        return result.returncode
    failures = [line for line in result.stdout.splitlines() if line.strip()]
    if failures:
        print("database recovery verification failed", file=sys.stderr)
        for failure in failures:
            print(f"- incomplete schema: {failure}", file=sys.stderr)
        return 1

    # Read heads separately because PostgreSQL cannot parameterize identifiers.
    for schema, expected_head in EXPECTED_HEADS.items():
        head_sql = f'SELECT version_num FROM "{schema}".alembic_version'
        head = subprocess.run(command, input=head_sql, text=True, capture_output=True, env=env)
        observed = {line.strip() for line in head.stdout.splitlines() if line.strip()}
        if head.returncode or observed != {expected_head}:
            print(f"database recovery verification failed: {schema} head {sorted(observed)} != {expected_head}", file=sys.stderr)
            return 1
    print("database recovery verification passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
