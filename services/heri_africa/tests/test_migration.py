from __future__ import annotations

from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path


def test_initial_migration_creates_and_drops_heri_schema() -> None:
    path = Path(__file__).parents[1] / "migrations" / "versions" / "0001_heri_schema.py"
    spec = spec_from_file_location("heri_initial_migration", path)
    assert spec and spec.loader
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    assert module.revision == "0001_heri_schema"
    assert module.down_revision is None


def test_command_idempotency_migration_extends_current_heri_head() -> None:
    path = Path(__file__).parents[1] / "migrations" / "versions" / "0006_command_idempotency.py"
    spec = spec_from_file_location("heri_command_idempotency", path)
    assert spec and spec.loader
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    assert module.revision == "0006_command_idempotency"
    assert module.down_revision == "0005_center_slug_settings"
