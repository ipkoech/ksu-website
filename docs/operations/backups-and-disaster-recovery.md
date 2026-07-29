# Backups and disaster recovery

`scripts/backup_database.sh` creates a compressed, permission-restricted PostgreSQL dump plus metadata (UTC timestamp, environment, database, schema version, checksum). `scripts/restore_database.sh` restores only an explicitly supplied dump with `ON_ERROR_STOP`; `scripts/test_database_restore.sh` runs a clean recovery-container smoke test. No script drops or overwrites a production database automatically.

Target policy: daily full backups plus WAL/PITR where the selected PostgreSQL provider supports it; retain daily backups for 30 days and copy encrypted backups off-server. Initial RPO is 24 hours for dumps and RTO is 4 hours; the infrastructure owner must tighten these after measuring a staging restore. A scheduled staging restore test must provision a clean database, restore, run Alembic status, smoke-test APIs, record results, and clean up safely.
