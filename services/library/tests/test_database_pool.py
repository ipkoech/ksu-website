import importlib
import sys
from types import SimpleNamespace

import pytest
from pydantic import ValidationError
from app.core.config import Settings


def base_settings(**overrides):
    return {
        "DATABASE_URL": "postgresql+asyncpg://user:pass@postgres:5432/ksu",
        "JWT_SECRET_KEY": "j" * 32,
        "REDIS_URL": "redis://redis:6379/1",
        "MAIN_SERVICE_URL": "http://main:8000",
        "CORS_ORIGINS": ["https://library.example.edu"],
        **overrides,
    }


def test_pool_settings_are_configurable_and_validated():
    settings = Settings(**base_settings(DB_POOL_SIZE=17, DB_MAX_OVERFLOW=4))

    assert settings.DB_POOL_SIZE == 17
    assert settings.DB_MAX_OVERFLOW == 4

    with pytest.raises(ValidationError):
        Settings(**base_settings(DB_POOL_SIZE=0))
    with pytest.raises(ValidationError):
        Settings(**base_settings(DB_MAX_OVERFLOW=-1))


def test_database_runtime_uses_configured_pool(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", base_settings()["DATABASE_URL"])
    monkeypatch.setenv("JWT_SECRET_KEY", "j" * 32)
    monkeypatch.setenv("INTERNAL_API_KEY", "l" * 32)
    monkeypatch.setenv("DB_POOL_SIZE", "17")
    monkeypatch.setenv("DB_MAX_OVERFLOW", "4")

    from app.core.config import get_settings

    get_settings.cache_clear()
    import ksu_common.database as common_database

    captured = {}

    def fake_runtime(config):
        captured["config"] = config
        return SimpleNamespace(engine=object(), session_factory=object(), session=object())

    monkeypatch.setattr(common_database, "create_database_runtime", fake_runtime)
    sys.modules.pop("app.core.database", None)
    importlib.import_module("app.core.database")

    assert captured["config"].pool_size == 17
    assert captured["config"].max_overflow == 4
