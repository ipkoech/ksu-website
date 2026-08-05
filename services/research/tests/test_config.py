import importlib
import os
import sys
import unittest

from fastapi.routing import APIRoute
from pydantic import ValidationError

from app.core.config import Settings, get_settings


def route_paths(app):
    return {route.path for route in app.routes if isinstance(route, APIRoute)}


def base_settings(**overrides):
    return {
        "DATABASE_URL": "postgresql+asyncpg://user:pass@postgres:5432/ksu",
        "JWT_SECRET_KEY": "j" * 32,
        "REDIS_URL": "redis://redis:6379/2",
        "MAIN_SERVICE_API_KEY": "m" * 32,
        **overrides,
    }


def import_research_main():
    os.environ["LOG_DIR"] = "/tmp/ksu-research-test-logs"
    os.environ["DATABASE_URL"] = "postgresql+asyncpg://user:pass@postgres:5432/ksu"
    os.environ["JWT_SECRET_KEY"] = "j" * 32
    os.environ["MAIN_SERVICE_API_KEY"] = "m" * 32
    os.environ["INTERNAL_API_KEY"] = "r" * 32
    get_settings.cache_clear()
    sys.modules.pop("app.main", None)
    return importlib.import_module("app.main")


class SettingsTests(unittest.TestCase):
    def test_reference_validation_defaults_to_warn(self):
        settings = Settings(**base_settings(APP_ENV="development", REFERENCE_VALIDATION_MODE="warn"))

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

    def test_production_requires_a_distinct_main_service_key(self):
        with self.assertRaisesRegex(ValidationError, "MAIN_SERVICE_API_KEY"):
            Settings(
                **base_settings(
                    APP_ENV="production",
                    MAIN_SERVICE_API_KEY=None,
                    INTERNAL_API_KEY="r" * 32,
                    REFERENCE_VALIDATION_MODE="strict",
                )
            )

    def test_development_allows_main_service_key_to_be_unconfigured(self):
        settings = Settings(
            **base_settings(
                APP_ENV="development",
                MAIN_SERVICE_API_KEY=None,
            )
        )

        self.assertIsNone(settings.MAIN_SERVICE_API_KEY)

    def test_non_strict_reference_validation_rejected_outside_development(self):
        with self.assertRaisesRegex(ValidationError, "REFERENCE_VALIDATION_MODE"):
            Settings(
                **base_settings(
                    APP_ENV="production",
                    INTERNAL_API_KEY="r" * 32,
                    REFERENCE_VALIDATION_MODE="disabled",
                )
            )

        with self.assertRaisesRegex(ValidationError, "REFERENCE_VALIDATION_MODE"):
            Settings(
                **base_settings(
                    APP_ENV="production",
                    INTERNAL_API_KEY="r" * 32,
                    REFERENCE_VALIDATION_MODE="warn",
                )
            )

    def test_strict_reference_validation_allowed_in_production(self):
        settings = Settings(
            **base_settings(
                APP_ENV="production",
                INTERNAL_API_KEY="r" * 32,
                REFERENCE_VALIDATION_MODE="strict",
            )
        )

        self.assertEqual(settings.REFERENCE_VALIDATION_MODE, "strict")

    def test_openapi_schema_is_hidden_in_production(self):
        research_main = import_research_main()
        original_settings = research_main.settings
        try:
            research_main.settings = Settings(
                **base_settings(
                    APP_ENV="production",
                    INTERNAL_API_KEY="r" * 32,
                    REFERENCE_VALIDATION_MODE="strict",
                )
            )

            app = research_main.create_app()

            self.assertIsNone(app.openapi_url)
            self.assertIsNone(app.docs_url)
            self.assertIsNone(app.redoc_url)
        finally:
            research_main.settings = original_settings

    def test_seed_assets_are_not_mounted_in_production(self):
        research_main = import_research_main()
        original_settings = research_main.settings
        original_seed_assets_dir = research_main.SEED_ASSETS_DIR
        try:
            research_main.settings = Settings(
                **base_settings(
                    APP_ENV="production",
                    INTERNAL_API_KEY="r" * 32,
                    REFERENCE_VALIDATION_MODE="strict",
                )
            )
            research_main.SEED_ASSETS_DIR = original_seed_assets_dir.parent

            app = research_main.create_app()

            self.assertNotIn("/seed-assets", route_paths(app))
        finally:
            research_main.settings = original_settings
            research_main.SEED_ASSETS_DIR = original_seed_assets_dir

    def test_successful_api_mutations_invalidate_public_cache(self):
        research_main = import_research_main()

        request = type(
            "Request",
            (),
            {
                "method": "PATCH",
                "url": type("Url", (), {"path": "/api/v1/projects/id/123"})(),
            },
        )()

        self.assertTrue(research_main._should_invalidate_public_cache(request, 200))

    def test_public_cache_invalidation_skips_failures_and_excluded_paths(self):
        research_main = import_research_main()

        failed_request = type(
            "Request",
            (),
            {
                "method": "PATCH",
                "url": type("Url", (), {"path": "/api/v1/projects/id/123"})(),
            },
        )()
        excluded_request = type(
            "Request",
            (),
            {
                "method": "POST",
                "url": type("Url", (), {"path": "/api/v1/donations/submit"})(),
            },
        )()

        self.assertFalse(research_main._should_invalidate_public_cache(failed_request, 422))
        self.assertFalse(research_main._should_invalidate_public_cache(excluded_request, 201))


if __name__ == "__main__":
    unittest.main()
