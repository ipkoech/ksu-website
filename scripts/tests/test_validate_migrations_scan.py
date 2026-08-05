from __future__ import annotations

import os
import subprocess
from pathlib import Path


ROOT = Path(__file__).parents[2]


def _git(repo: Path, *args: str) -> None:
    subprocess.run(["git", *args], cwd=repo, check=True, capture_output=True, text=True)


def _make_repo(tmp_path: Path) -> tuple[Path, Path]:
    repo = tmp_path / "repo"
    migration_dir = repo / "services" / "main" / "migrations" / "versions"
    migration_dir.mkdir(parents=True)
    scripts_dir = repo / "scripts"
    scripts_dir.mkdir()
    (scripts_dir / "validate_migrations.sh").write_text(
        (ROOT / "scripts" / "validate_migrations.sh").read_text()
    )
    (scripts_dir / "validate_migrations.sh").chmod(0o755)
    (repo / "services" / "main" / "alembic.ini").write_text("[alembic]\nscript_location = migrations\n")
    (repo / "services" / "main" / "migrations" / "env.py").write_text("")

    fake_python = tmp_path / "migration-python"
    fake_python.write_text(
        "#!/usr/bin/env bash\n"
        "if [[ \"$2\" == \"alembic\" ]]; then echo 'revision (head)'; fi\n"
    )
    fake_python.chmod(0o755)

    _git(repo, "init", "-q")
    _git(repo, "config", "user.email", "task17@example.invalid")
    _git(repo, "config", "user.name", "Task 17 Tests")
    return repo, fake_python


def _run_validator(repo: Path, fake_python: Path, **extra_env: str) -> subprocess.CompletedProcess[str]:
    environment = os.environ | {"PYTHON_BIN": str(fake_python)} | extra_env
    return subprocess.run(
        ["bash", "scripts/validate_migrations.sh", "main"],
        cwd=repo,
        env=environment,
        capture_output=True,
        text=True,
        check=False,
    )


def _migration_text(*, destructive: bool) -> str:
    upgrade = "    op.drop_table('committed_fixture')\n" if destructive else "    op.create_table('committed_fixture')\n"
    return (
        "revision = 'fixture'\n"
        "down_revision = None\n\n"
        "def upgrade():\n"
        f"{upgrade}"
        "\ndef downgrade():\n    pass\n"
    )


def test_committed_destructive_migration_is_checked_in_explicit_committed_mode(tmp_path: Path):
    repo, fake_python = _make_repo(tmp_path)
    migration = repo / "services/main/migrations/versions/0001_fixture.py"
    migration.write_text(_migration_text(destructive=False))
    _git(repo, "add", ".")
    _git(repo, "commit", "-qm", "initial migration")

    migration.write_text(_migration_text(destructive=True))
    _git(repo, "add", ".")
    _git(repo, "commit", "-qm", "destructive migration")

    result = _run_validator(
        repo,
        fake_python,
        MIGRATION_SCAN_MODE="committed",
        MIGRATION_COMMIT_RANGE="HEAD^..HEAD",
    )

    assert result.returncode == 1
    assert "destructive migration detected" in result.stderr


def test_changed_scan_separates_tracked_and_untracked_migrations(tmp_path: Path):
    repo, fake_python = _make_repo(tmp_path)
    tracked = repo / "services/main/migrations/versions/0001_fixture.py"
    tracked.write_text(_migration_text(destructive=False))
    _git(repo, "add", ".")
    _git(repo, "commit", "-qm", "initial migration")

    tracked.write_text(_migration_text(destructive=False).replace("fixture", "tracked"))
    untracked = repo / "services/main/migrations/versions/0002_fixture.py"
    untracked.write_text(_migration_text(destructive=True).replace("fixture", "untracked"))

    result = _run_validator(repo, fake_python, MIGRATION_SCAN_MODE="changed")

    assert result.returncode == 1
    assert "destructive migration detected" in result.stderr
