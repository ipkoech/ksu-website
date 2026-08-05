#!/usr/bin/env bash

set -Eeuo pipefail

: "${POSTGRES_DB:?POSTGRES_DB is required}"

DATABASE_ADMIN_USER="${DATABASE_ADMIN_USER:-${POSTGRES_USER:-}}"
: "${DATABASE_ADMIN_USER:?DATABASE_ADMIN_USER or POSTGRES_USER is required}"
DATABASE_ADMIN_PASSWORD="${DATABASE_ADMIN_PASSWORD:-${POSTGRES_PASSWORD:-}}"
DATABASE_HOST="${DATABASE_HOST:-}"
DATABASE_PORT="${DATABASE_PORT:-}"

PSQL_ARGS=(--username "$DATABASE_ADMIN_USER" --dbname "$POSTGRES_DB")
if [[ -n "$DATABASE_HOST" ]]; then
  PSQL_ARGS+=(--host "$DATABASE_HOST")
fi
if [[ -n "$DATABASE_PORT" ]]; then
  PSQL_ARGS+=(--port "$DATABASE_PORT")
fi

create_service_role() {
  local role="$1"
  local password="$2"
  local schema="$3"

  : "${password:?a database role password is required}"

  PGPASSWORD="$DATABASE_ADMIN_PASSWORD" psql "${PSQL_ARGS[@]}" \
    --set=ON_ERROR_STOP=1 \
    --set=role="$role" \
    --set=password="$password" \
    --set=schema="$schema" <<'SQL'
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'role', :'password')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'role')\gexec

SELECT format('ALTER ROLE %I LOGIN PASSWORD %L', :'role', :'password')\gexec
SELECT format('CREATE SCHEMA IF NOT EXISTS %I AUTHORIZATION %I', :'schema', :'role')\gexec
SELECT format('ALTER SCHEMA %I OWNER TO %I', :'schema', :'role')\gexec
SELECT format('GRANT CONNECT ON DATABASE %I TO %I', current_database(), :'role')\gexec
SELECT format('GRANT USAGE ON SCHEMA %I TO %I', :'schema', :'role')\gexec
SELECT format('GRANT CREATE ON SCHEMA %I TO %I', :'schema', :'role')\gexec
SELECT format('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA %I TO %I', :'schema', :'role')\gexec
SELECT format('GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA %I TO %I', :'schema', :'role')\gexec
SELECT format('ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA %I GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO %I', current_user, :'schema', :'role')\gexec
SELECT format('ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA %I GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO %I', current_user, :'schema', :'role')\gexec

SELECT format('ALTER TABLE %I.%I OWNER TO %I', :'schema', tablename, :'role')
FROM pg_catalog.pg_tables
WHERE schemaname = :'schema'\gexec
SELECT format('ALTER SEQUENCE %I.%I OWNER TO %I', :'schema', sequence_name, :'role')
FROM information_schema.sequences
WHERE sequence_schema = :'schema'\gexec
SQL
}

create_service_role "${MAIN_DB_USER:-ksu_main}" "${MAIN_DB_PASSWORD:?MAIN_DB_PASSWORD is required}" main
create_service_role "${RESEARCH_DB_USER:-ksu_research}" "${RESEARCH_DB_PASSWORD:?RESEARCH_DB_PASSWORD is required}" research
create_service_role "${LIBRARY_DB_USER:-ksu_library}" "${LIBRARY_DB_PASSWORD:?LIBRARY_DB_PASSWORD is required}" library
create_service_role "${HERI_DB_USER:-ksu_heri}" "${HERI_DB_PASSWORD:?HERI_DB_PASSWORD is required}" heri

echo "Database service roles and schemas are ready."
