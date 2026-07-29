# Database migrations

Developers may generate a candidate with `alembic revision --autogenerate -m "description"`, but must review the resulting file, check indexes/constraints/data safety, and commit it with the model change. `scripts/validate_migrations.sh` compiles every migration and blocks destructive operations unless an explicitly reviewed run sets `MIGRATION_DESTRUCTIVE_REVIEW=approved`.

Deployments never autogenerate. For staging and production, `scripts/deploy.sh` runs `alembic upgrade head` for Main, Research, and Library after the pre-deploy backup and before readiness is accepted, then runs `alembic current --check-heads` to prove the database reached every expected head. Deployment exits on any migration failure. The VM workflow's concurrency group prevents overlapping GitHub deployments; operators must use one migration-capable deployment at a time.

Recovery is forward-fix first. Restore into an isolated database using `scripts/restore_database.sh`, validate with `scripts/test_database_restore.sh`, and only then redirect traffic. Down migrations are not an automatic rollback strategy.
