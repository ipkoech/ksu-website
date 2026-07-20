from pathlib import Path


def test_public_wings_by_division_cache_varies_by_division_id():
    source = (Path(__file__).resolve().parents[1] / "app/api/v1/wings.py").read_text()

    assert '@cached_public(timeout=300, vary_on=("division_id", "is_active", "fields", "include"))' in source
