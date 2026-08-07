# Backend verification gates

Phase 0 makes backend changes measurable before they are deployed. These gates
do not replace database-backed behavior tests; they ensure that every CI run
produces independent structural, packaging, migration, security, and topology
signals.

## Local commands

Use the Python environment containing all four editable services:

```bash
python scripts/structural_snapshot.py /tmp/ksu-structure.json \
  --expect scripts/structural-baseline.json
python scripts/ruff_baseline.py check --baseline .ruff-baseline.json --paths .
scripts/validate_migrations.sh main research library heri_africa
python scripts/validate_database_capacity.py
docker compose -f docker-compose.yml -f docker-compose.vm.yml config >/tmp/ksu-compose.yaml
python scripts/audit_compose_ports.py docker-compose.yml docker-compose.vm.yml
git diff --check
```

`structural_snapshot.py` creates deterministic development settings from each
service's complete `.env.example`; it does not read developer `.env` files. It
fails when an application cannot construct, Alembic cannot report a head, the
kernel cannot import, or the generated snapshot differs from the reviewed
baseline.

## Intentional structural changes

When a reviewed change deliberately adds or removes a route, table, setting,
migration head, kernel module, or public kernel export:

1. Capture a snapshot before the implementation.
2. Make and verify the change.
3. Inspect the full JSON diff.
4. Replace `scripts/structural-baseline.json` only with the reviewed result.
5. Explain the structural difference in the commit or pull request.

Never update the baseline merely to make CI green.

## CI independence

The workflow separates repository syntax, secret scanning, Ruff regression,
Compose rendering, production-setting validation, service compilation,
dependency checks, dependency audits, structural construction, migrations,
frontend checks, datastore connectivity, image builds, and image scans. A
failure in one matrix entry does not cancel the other service entries.

## Current limitation

The historical backend test suite was removed. Application construction and
structural comparison prove importability and surface stability, not endpoint
behavior. Database-backed login, mutation, migration-application, backup
restore, and load tests remain mandatory release evidence in later phases.
