from __future__ import annotations

from pathlib import Path
import tomllib


ROOT = Path(__file__).parents[2]
SERVICES = ("common", "main", "research", "library", "heri_africa")
BASELINE_COMMANDS = (
    "python3 -m compileall -q services",
    "python3 -m pytest services/common/tests services/main/tests services/research/tests "
    "services/library/tests services/heri_africa/tests --asyncio-mode=auto",
    "ruff check services/common services/main services/research services/library services/heri_africa",
    "pip check",
    "pip-audit",
    "scripts/validate_migrations.sh",
    "git diff --check",
)


def test_backend_hardening_baseline_is_declared_and_enforced() -> None:
    for service in SERVICES:
        with (ROOT / "services" / service / "pyproject.toml").open("rb") as file:
            metadata = tomllib.load(file)

        test_dependencies = metadata["project"]["optional-dependencies"]["test"]
        assert any(dependency.startswith("pytest>=") for dependency in test_dependencies)
        assert any(dependency.startswith("pytest-asyncio>=") for dependency in test_dependencies)

    workflow = (ROOT / ".github/workflows/quality.yml").read_text()
    assert "service: [common, main, research, library, heri_africa]" in workflow
    assert 'pip install -e ".[test]"' in workflow
    assert "--asyncio-mode=auto" in workflow
    assert "pip check" in workflow
    assert "pip-audit" in workflow
    assert "scripts/validate_migrations.sh" in workflow

    migration_validator = (ROOT / "scripts/validate_migrations.sh").read_text()
    assert "services=(main research library heri_africa)" in migration_validator
    assert 'PYTHON_BIN="${PYTHON_BIN:-python3}"' in migration_validator
    assert '"${PYTHON_BIN}" -m alembic heads' in migration_validator
    assert 'MIGRATION_SCAN_MODE' in migration_validator

    baseline = (ROOT / "docs/backend-hardening-baseline.md").read_text()
    for command in BASELINE_COMMANDS:
        assert command in baseline
