# Database recovery and lifecycle runbook

## Recovery objectives

The operational target is a daily off-host backup plus the automatic pre-deploy
backup. This gives an RPO of at most 24 hours for a VM loss and an RTO target of
two hours for a practiced restore. These are targets, not guarantees: record the
duration and result of every quarterly drill.

`BACKUP_OFFSITE_DIR` must be a mounted destination whose storage lifecycle is
independent of the application VM. A second directory on the same VM does not
qualify. Production may set `REQUIRE_OFFSITE_BACKUP=true` to fail backup and
deployment when that mount is unavailable.

The production configuration validator requires an absolute managed off-host
`BACKUP_OFFSITE_DIR`, `REQUIRE_OFFSITE_BACKUP=true` and a positive
`BACKUP_RETENTION_DAYS`. The deployment wrapper also forces the off-site
requirement on whenever `ENV_NAME=production`, so an omitted or false override
cannot silently skip the backup copy.

## Backup schedule

Run the following daily from the VM scheduler using deployment secrets:

```bash
BACKUP_DIR=/srv/ksu/backups/production \
BACKUP_OFFSITE_DIR=/mnt/ksu-offsite/production \
REQUIRE_OFFSITE_BACKUP=true \
BACKUP_RETENTION_DAYS=14 \
APP_ENV=production \
POSTGRES_CONTAINER=ksu-production-postgres-1 \
POSTGRES_DB=ksu_services_db \
POSTGRES_USER=postgres \
scripts/backup_database.sh
```

The script creates a PostgreSQL custom-format dump atomically, validates its
catalog, writes a SHA-256 metadata sidecar, copies both files off-host, and only
then reaps expired local backups. Alert if no new off-host metadata file appears
within 26 hours. Keep at least 14 daily and 12 monthly recovery points in the
off-host store.

The dump login must be a dedicated backup role with read access to all four
schemas, or the PostgreSQL administrator for the initial deployment. A normal
service role cannot produce a complete platform backup and must not be used.

## Restore drill

Never rehearse against the production database. Create a disposable database,
then run:

For the local Compose stack, the wrapper creates a fresh backup, starts an
isolated PostgreSQL container on a random loopback port, restores and verifies
it, writes recovery evidence, and removes the disposable container:

```bash
RECOVERY_OPERATOR="operator-name" scripts/run_compose_restore_drill.sh
```

Evidence is written under `backups/restore-drills/` by default. Override that
with `RECOVERY_DRILL_DIR` or provide an exact `RECOVERY_REPORT_FILE`.

For an externally managed disposable database, run the lower-level drill:

```bash
BACKUP_FILE=/srv/ksu/backups/production/ksu-production-TIMESTAMP.dump \
RECOVERY_DB=ksu_restore_drill \
RECOVERY_USER=postgres \
RECOVERY_PASSWORD="$DATABASE_ADMIN_PASSWORD" \
RECOVERY_HOST=127.0.0.1 \
RECOVERY_ADMIN_URL="postgresql://postgres:$DATABASE_ADMIN_PASSWORD@127.0.0.1:5432/ksu_restore_drill" \
MAIN_DB_PASSWORD="$MAIN_DB_PASSWORD" \
RESEARCH_DB_PASSWORD="$RESEARCH_DB_PASSWORD" \
LIBRARY_DB_PASSWORD="$LIBRARY_DB_PASSWORD" \
HERI_DB_PASSWORD="$HERI_DB_PASSWORD" \
scripts/test_database_restore.sh
```

The drill refuses a missing or altered checksum, restores with ownership omitted,
reconstructs the four least-privilege roles, verifies every object owner and
foreign privilege, verifies all four Alembic heads, and requires more than the
version table in every schema. Its evidence file records the backup timestamp,
start/end time, database size, result, operator, and measured recovery time in
seconds. Compare that measured time with the two-hour RTO target and investigate
any regression. Drop the disposable database afterward.

## Lifecycle policy

Main’s maintenance worker deletes in bounded transactions:

- request audits after 180 days;
- delivered outbox events and their delivery attempts after 7 days;
- first-party analytics after 395 days;
- completed or failed command-idempotency records after 30 days.

Pending outbox and idempotency records are never reaped. Retention values are
deployment settings and `0` disables a reaper. Watch table and index size,
dead-row ratio, autovacuum age, backup size, and drill duration monthly. Consider
partitioning only when bounded deletion and autovacuum no longer meet the RTO or
write-latency target.

## Point-in-time recovery

Compose exposes opt-in `POSTGRES_ARCHIVE_MODE`, `POSTGRES_ARCHIVE_COMMAND` and
`POSTGRES_WAL_ARCHIVE_HOST_DIR`. Production must set archive mode to `on`, use
both `%p` and `%f` in the command, and point the archive directory at a writable
encrypted store whose lifecycle is independent of the application VM. The
checked-in archive helper validates segment names, writes with private
permissions and moves each segment atomically.

A disposable PostgreSQL 18.6 archive/PITR drill passed locally: WAL was archived,
a base backup was taken, and recovery promoted at a named restore point while
excluding a later marker (`services/postgres-pitr-smoke-20260906.json`). Before
rollout, verify `SHOW archive_mode, archive_command` on the running instance and
perform the same drill against the independent off-host target. Until that
deployment drill and retention monitoring pass, the production RPO remains the
daily-backup interval.
