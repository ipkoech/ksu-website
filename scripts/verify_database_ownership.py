#!/usr/bin/env python3
"""Fail unless every service role owns and can access only its PostgreSQL schema."""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
from urllib.parse import unquote, urlparse

OWNERS = {
    "main": "MAIN_DB_USER",
    "research": "RESEARCH_DB_USER",
    "library": "LIBRARY_DB_USER",
    "heri": "HERI_DB_USER",
}


def _sql() -> str:
    expected = " UNION ALL ".join(
        f"SELECT '{schema}'::text AS schema_name, :'role_{schema}'::text AS role_name"
        for schema in OWNERS
    )
    return f"""
WITH expected AS ({expected}),
violations AS (
  SELECT 'schema_owner' AS kind, e.schema_name AS object_name, n.nspowner::regrole::text AS actual
  FROM expected e JOIN pg_namespace n ON n.nspname=e.schema_name
  WHERE n.nspowner::regrole::text <> e.role_name
  UNION ALL
  SELECT 'table_owner', format('%I.%I', n.nspname, c.relname), c.relowner::regrole::text
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  JOIN expected e ON e.schema_name=n.nspname
  WHERE c.relkind IN ('r','p','S') AND c.relowner::regrole::text <> e.role_name
  UNION ALL
  SELECT 'role_capability', r.rolname, 'elevated'
  FROM pg_roles r JOIN expected e ON e.role_name=r.rolname
  WHERE r.rolsuper OR r.rolcreaterole OR r.rolcreatedb OR r.rolreplication OR r.rolbypassrls
  UNION ALL
  SELECT 'foreign_schema_privilege', e.role_name || '->' || n.nspname, 'USAGE/CREATE'
  FROM expected e CROSS JOIN pg_namespace n
  WHERE n.nspname IN ('main','research','library','heri')
    AND n.nspname <> e.schema_name
    AND (has_schema_privilege(e.role_name,n.oid,'USAGE') OR has_schema_privilege(e.role_name,n.oid,'CREATE'))
  UNION ALL
  SELECT 'foreign_table_privilege', e.role_name || '->' || format('%I.%I', n.nspname,c.relname), 'DML'
  FROM expected e CROSS JOIN pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname IN ('main','research','library','heri') AND n.nspname <> e.schema_name
    AND c.relkind IN ('r','p','S')
    AND has_table_privilege(e.role_name,c.oid,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
)
SELECT kind || ':' || object_name || ':' || actual FROM violations ORDER BY kind, object_name;
"""


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--admin-url", default=os.getenv("DATABASE_ADMIN_URL"))
    args = parser.parse_args()
    if not args.admin_url:
        parser.error("--admin-url or DATABASE_ADMIN_URL is required")
    parsed = urlparse(args.admin_url.replace("postgresql+asyncpg://", "postgresql://", 1))
    env = dict(os.environ, PGPASSWORD=unquote(parsed.password or ""))
    command = [
        "psql", "-X", "--no-psqlrc", "--set=ON_ERROR_STOP=1", "--tuples-only", "--no-align",
        "--host", parsed.hostname or "localhost", "--port", str(parsed.port or 5432),
        "--username", unquote(parsed.username or "postgres"), "--dbname", parsed.path.lstrip("/"),
    ]
    for schema, variable in OWNERS.items():
        command.extend(["--set", f"role_{schema}={os.getenv(variable, 'ksu_' + schema)}"])
    result = subprocess.run(command, input=_sql(), text=True, capture_output=True, env=env)
    if result.returncode:
        print(result.stderr.strip(), file=sys.stderr)
        return result.returncode
    violations = [line for line in result.stdout.splitlines() if line.strip()]
    if violations:
        print("database ownership verification failed", file=sys.stderr)
        for violation in violations:
            print(f"- {violation}", file=sys.stderr)
        return 1
    print("database ownership verification passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
