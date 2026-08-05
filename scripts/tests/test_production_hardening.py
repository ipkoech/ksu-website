from importlib.util import spec_from_file_location, module_from_spec
from pathlib import Path


MODULE_PATH = Path(__file__).parents[1] / "validate_production_env.py"
spec = spec_from_file_location("validate_production_env", MODULE_PATH)
module = module_from_spec(spec)
assert spec.loader
spec.loader.exec_module(module)


def production_values() -> dict[str, str]:
    return {
        "APP_ENV": "production",
        "DATABASE_URL": "postgresql+asyncpg://user:secret@postgres/db",
        "REDIS_URL": "rediss://:secret@redis:6379/0",
        "JWT_SECRET_KEY": "j" * 40,
        "INTERNAL_API_KEY": "i" * 40,
        "CORS_ORIGINS": '["https://example.edu"]',
        "SMTP_HOST": "smtp.example.edu",
        "SMTP_PASSWORD": "s" * 40,
        "EMAIL_FROM": "service@example.edu",
    }


def test_production_values_pass():
    assert module.validate(production_values(), "production", "main") == []


def test_placeholders_and_wildcard_cors_fail_without_exposing_values():
    values = production_values() | {"JWT_SECRET_KEY": "change-me", "CORS_ORIGINS": "[*]"}
    errors = module.validate(values, "production", "main")
    assert "JWT_SECRET_KEY contains a placeholder value" in errors
    assert "CORS_ORIGINS must not contain '*' outside development" in errors
    assert "change-me" not in " ".join(errors)


def test_generated_example_markers_are_rejected():
    values = production_values() | {"JWT_SECRET_KEY": "GENERATE_A_UNIQUE_32_CHARACTER_SECRET"}
    assert "JWT_SECRET_KEY contains a placeholder value" in module.validate(values, "production", "main")


def test_development_mode_allows_local_defaults():
    assert module.validate({}, "development", "main") == []
