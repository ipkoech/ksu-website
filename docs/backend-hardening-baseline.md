# Backend hardening baseline

Run the backend release gates from the repository root in an isolated Python
environment. The CI backend matrix runs the compile, Ruff, pytest, dependency
integrity, and dependency-audit checks separately for `common`, `main`,
`research`, `library`, and `heri_africa`; this keeps each service's editable
installation and test imports isolated.

Install `common` first for every application service, then install that
service's declared test extra. The test extra supplies both `pytest` and
`pytest-asyncio`, so asynchronous tests do not depend on a globally installed
plugin.

```bash
python3 -m compileall -q services
python3 -m pytest services/common/tests services/main/tests services/research/tests services/library/tests services/heri_africa/tests --asyncio-mode=auto
ruff check services/common services/main services/research services/library services/heri_africa
pip check
pip-audit
scripts/validate_migrations.sh
git diff --check
```

For local service isolation, run the equivalent compile, test, Ruff,
dependency-integrity, and audit commands from each service directory, replacing
the workspace targets above with `.` or `tests` as appropriate. For example:

```bash
cd services/main
python3 -m compileall -q .
python3 -m pytest tests --asyncio-mode=auto
ruff check .
pip check
pip-audit
```

Run `scripts/validate_migrations.sh` from the repository root after installing
the dependencies for each migration-owning service, or run it with a service
name in the CI matrix.

`scripts/validate_migrations.sh` compiles all migration sources, requires one
Alembic head for each migration-owning service, and blocks unchecked destructive
operations in changed migrations. Set `MIGRATION_DESTRUCTIVE_REVIEW=approved`
only after the migration has received explicit destructive-change review.

CI treats every command above as a release gate: a compile, test, Ruff
correctness finding, dependency-integrity failure, dependency vulnerability,
migration failure, or whitespace error fails the workflow.
