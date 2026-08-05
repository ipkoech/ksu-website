import unittest

from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from app.core.config import HeriSettings


def production_settings(**overrides):
    return {
        "APP_ENV": "production",
        "DATABASE_URL": "postgresql+asyncpg://user:pass@postgres:5432/ksu",
        "JWT_SECRET_KEY": "j" * 32,
        "REDIS_URL": "redis://redis:6379/3",
        "RESEARCH_SERVICE_URL": "http://research:8001",
        "RESEARCH_SERVICE_API_KEY": "r" * 32,
        "CORS_ORIGINS": ["https://example.edu"],
        **overrides,
    }


class HeriSettingsTests(unittest.TestCase):
    def test_explicit_development_fixture_allows_local_defaults(self):
        settings = HeriSettings(APP_ENV="development", JWT_SECRET_KEY="change-me-local")

        self.assertEqual(settings.JWT_SECRET_KEY, "change-me-local")

    def test_production_rejects_default_and_short_jwt_secrets(self):
        for secret in ("change-me-local", "short-secret"):
            with self.subTest(secret=secret), self.assertRaisesRegex(ValidationError, "JWT_SECRET_KEY"):
                HeriSettings(**production_settings(JWT_SECRET_KEY=secret))

    def test_production_rejects_missing_research_service_key(self):
        with self.assertRaisesRegex(ValidationError, "RESEARCH_SERVICE_API_KEY"):
            HeriSettings(**production_settings(RESEARCH_SERVICE_API_KEY=None))

    def test_production_rejects_local_database_and_redis_urls(self):
        with self.assertRaisesRegex(ValidationError, "DATABASE_URL"):
            HeriSettings(
                **production_settings(
                    DATABASE_URL="postgresql+asyncpg://localhost/ksu_services_db",
                    REDIS_URL="redis://localhost:6379/3",
                )
            )

    def test_production_rejects_local_redis_url(self):
        with self.assertRaisesRegex(ValidationError, "REDIS_URL"):
            HeriSettings(
                **production_settings(
                    REDIS_URL="redis://localhost:6379/3",
                )
            )

    def test_production_rejects_empty_cors_origins(self):
        with self.assertRaisesRegex(ValidationError, "CORS_ORIGINS"):
            HeriSettings(**production_settings(CORS_ORIGINS=[]))

    def test_cors_uses_explicit_client_allowlists(self):
        from app.main import create_app

        app = create_app()
        cors = next(middleware for middleware in app.user_middleware if middleware.cls is CORSMiddleware)

        self.assertEqual(cors.kwargs["allow_methods"], ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
        self.assertEqual(cors.kwargs["allow_headers"], ["Authorization", "Content-Type", "X-Internal-Key"])
