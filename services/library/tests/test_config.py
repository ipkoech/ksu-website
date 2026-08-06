import unittest

from pydantic import ValidationError

from app.core.config import Settings


def base_settings(**overrides):
    return {
        "DATABASE_URL": "postgresql+asyncpg://user:pass@postgres:5432/ksu",
        "JWT_SECRET_KEY": "j" * 32,
        "REDIS_URL": "redis://redis:6379/1",
        "MAIN_SERVICE_URL": "http://main:8000",
        "INTERNAL_API_KEY": "i" * 32,
        "CORS_ORIGINS": ["https://library.example.edu"],
        **overrides,
    }


class SettingsTests(unittest.TestCase):
    def test_internal_api_key_is_required_even_in_development(self):
        # The field carries no default on purpose: a shipped placeholder is a
        # published credential anywhere APP_ENV is not a production value.
        missing = base_settings(APP_ENV="development")
        missing.pop("INTERNAL_API_KEY")

        with self.assertRaisesRegex(ValidationError, "INTERNAL_API_KEY"):
            Settings(**missing)

    def test_internal_api_key_default_rejected_outside_development(self):
        with self.assertRaisesRegex(ValidationError, "INTERNAL_API_KEY"):
            Settings(
                **base_settings(
                    APP_ENV="production",
                    MAIN_SERVICE_API_KEY="m" * 32,
                    INTERNAL_API_KEY="change-me-internal",
                )
            )

    def test_main_service_api_key_is_required_outside_development(self):
        with self.assertRaisesRegex(ValidationError, "MAIN_SERVICE_API_KEY"):
            Settings(**base_settings(APP_ENV="production", INTERNAL_API_KEY="i" * 32))


if __name__ == "__main__":
    unittest.main()
