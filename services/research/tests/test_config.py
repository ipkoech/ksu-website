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
    def test_reference_validation_defaults_to_warn(self):
        settings = Settings(**base_settings(APP_ENV="development"))

        self.assertEqual(settings.REFERENCE_VALIDATION_MODE, "warn")

    def test_reference_validation_mode_is_normalized(self):
        settings = Settings(**base_settings(REFERENCE_VALIDATION_MODE="STRICT"))

        self.assertEqual(settings.REFERENCE_VALIDATION_MODE, "strict")

    def test_invalid_reference_validation_mode_is_rejected(self):
        with self.assertRaisesRegex(ValidationError, "REFERENCE_VALIDATION_MODE"):
            Settings(**base_settings(REFERENCE_VALIDATION_MODE="silent"))

    def test_insecure_internal_key_rejected_outside_development(self):
        with self.assertRaisesRegex(ValidationError, "INTERNAL_API_KEY"):
            Settings(**base_settings(APP_ENV="production", INTERNAL_API_KEY="change-me-internal"))

    def test_disabled_reference_validation_rejected_outside_development(self):
        with self.assertRaisesRegex(ValidationError, "REFERENCE_VALIDATION_MODE"):
            Settings(
                **base_settings(
                    APP_ENV="production",
                    INTERNAL_API_KEY="configured-key",
                    REFERENCE_VALIDATION_MODE="disabled",
                )
            )


if __name__ == "__main__":
    unittest.main()
