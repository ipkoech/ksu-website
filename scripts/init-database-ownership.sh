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
SELECT format('ALTER ROLE %I NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS', :'role')\gexec
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

# Extensions are an administrator prerequisite. Migrations run as deliberately
# non-elevated service roles and must not need CREATE on the database.
PGPASSWORD="$DATABASE_ADMIN_PASSWORD" psql "${PSQL_ARGS[@]}" --set=ON_ERROR_STOP=1 <<'SQL'
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;

-- PUBLIC must never be an alternate write namespace. Service roles retain USAGE
-- for administrator-installed extensions, but cannot create objects in it.
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
SQL

revoke_foreign_schema_access() {
  local role="$1"
  local owned_schema="$2"
  for schema in main research library heri; do
    if [[ "$schema" == "$owned_schema" ]]; then
      continue
    fi
    PGPASSWORD="$DATABASE_ADMIN_PASSWORD" psql "${PSQL_ARGS[@]}" \
      --set=ON_ERROR_STOP=1 --set=role="$role" --set=schema="$schema" <<'SQL'
SELECT format('REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA %I FROM %I', :'schema', :'role')\gexec
SELECT format('REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA %I FROM %I', :'schema', :'role')\gexec
SELECT format('REVOKE ALL PRIVILEGES ON SCHEMA %I FROM %I', :'schema', :'role')\gexec
SQL
  done
}

revoke_foreign_schema_access "${MAIN_DB_USER:-ksu_main}" main
revoke_foreign_schema_access "${RESEARCH_DB_USER:-ksu_research}" research
revoke_foreign_schema_access "${LIBRARY_DB_USER:-ksu_library}" library
revoke_foreign_schema_access "${HERI_DB_USER:-ksu_heri}" heri

echo "Database service roles and schemas are ready."
