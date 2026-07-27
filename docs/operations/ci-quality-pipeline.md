# CI quality pipeline

`.github/workflows/quality.yml` runs on pull requests and protected-branch pushes. It validates diffs, Python compilation, migration sources, secret scanning, Compose rendering, and production port topology; runs backend lint/tests for all services; runs the frontend lockfile install/lint/build; and builds/scans backend images.

The workflow intentionally uses real PostgreSQL and Redis service jobs as a follow-up staging/integration gate when credentials and runners are available. Local focused checks are:

```bash
POSTGRES_PASSWORD=ci-only-not-a-production-secret docker compose -f docker-compose.yml -f docker-compose.vm.yml config
python scripts/audit_compose_ports.py docker-compose.yml docker-compose.vm.yml
scripts/validate_migrations.sh
pytest -q scripts/tests/test_production_hardening.py
```

The workflow must not be treated as evidence for unavailable provider scans; failed image builds, tests, migration checks, secret scans, or port audits fail the job.
