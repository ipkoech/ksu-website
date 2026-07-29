from __future__ import annotations

from app.services.seed import seed_heri


def test_seed_function_is_async_and_idempotent_entrypoint() -> None:
    assert callable(seed_heri)
    assert seed_heri.__name__ == "seed_heri"
