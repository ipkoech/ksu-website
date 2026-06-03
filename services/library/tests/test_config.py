import unittest

from pydantic import ValidationError

from app.core.config import Settings


def base_settings(**overrides):
    return {
        "DATABASE_URL": "postgresql+asyncpg://user:pass@localhost:5432/ksu",
        "JWT_SECRET_KEY": "test-secret",
        **overrides,
    }


class SettingsTests(unittest.TestCase):
    def test_internal_api_key_default_allowed_in_development(self):
        settings = Settings(**base_settings(APP_ENV="development"))

        self.assertEqual(settings.INTERNAL_API_KEY, "change-me-internal")

    def test_internal_api_key_default_rejected_outside_development(self):
        with self.assertRaisesRegex(ValidationError, "INTERNAL_API_KEY"):
            Settings(**base_settings(APP_ENV="production", INTERNAL_API_KEY="change-me-internal"))


if __name__ == "__main__":
    unittest.main()
