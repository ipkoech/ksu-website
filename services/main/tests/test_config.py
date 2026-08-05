import unittest
import importlib
import json
import os
import sys
import tempfile
from unittest.mock import patch

from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from app.core.config import Settings


def base_settings(**overrides):
    return {
        "APP_ENV": "development",
        "APP_VERSION": "0.1.0",
        "SERVICE_NAME": "main",
        "DATABASE_URL": "postgresql+asyncpg://user:pass@localhost:5432/ksu",
        "DB_SCHEMA": "main",
        "DB_POOL_SIZE": 10,
        "DB_MAX_OVERFLOW": 20,
        "JWT_SECRET_KEY": "test-secret",
        "JWT_ALGORITHM": "HS256",
        "JWT_ACCESS_TTL_MINUTES": 15,
        "JWT_REFRESH_TTL_DAYS": 7,
        "PASSWORD_RESET_TOKEN_TTL_HOURS": 1,
        "REDIS_URL": "redis://localhost:6379/0",
        "CELERY_BROKER_URL": "redis://localhost:6379/0",
        "CELERY_RESULT_BACKEND": "redis://localhost:6379/0",
        "SMTP_HOST": "smtp.example.invalid",
        "SMTP_PORT": 587,
        "SMTP_USERNAME": "",
        "SMTP_PASSWORD": "",
        "SMTP_USE_TLS": True,
        "EMAIL_FROM": "",
        "SMTP_FROM_EMAIL": "",
        "SMTP_FROM_NAME": "",
        "FRONTEND_BASE_URL": "http://localhost:3000",
        "FRONTEND_ADMIN_URL": "http://localhost:3001",
        "FRONTEND_RESEARCH_URL": "http://localhost:3002",
        "FRONTEND_LIBRARY_URL": "http://localhost:3003",
        "RESEARCH_SERVICE_URL": "http://research:8001",
        "LIBRARY_SERVICE_URL": "http://library:8002",
        "PASSWORD_RESET_RATE_LIMIT_COUNT": 5,
        "PASSWORD_RESET_RATE_LIMIT_WINDOW_SECONDS": 900,
        "AUTH_LOGIN_MAX_ATTEMPTS": 5,
        "AUTH_LOGIN_LOCKOUT_MINUTES": 15,
        "API_KEY_RATE_LIMIT_WINDOW_SECONDS": 60,
        "ANALYTICS_RATE_LIMIT_COUNT": 120,
        "ANALYTICS_RATE_LIMIT_WINDOW_SECONDS": 60,
        "NEWSLETTER_RATE_LIMIT_COUNT": 10,
        "NEWSLETTER_RATE_LIMIT_WINDOW_SECONDS": 300,
        "SMS_PROVIDER": "disabled",
        "SMS_WEBHOOK_URL": "",
        "SMS_WEBHOOK_TOKEN": "",
        "TWILIO_ACCOUNT_SID": "",
        "TWILIO_AUTH_TOKEN": "",
        "TWILIO_FROM_NUMBER": "",
        "PUSH_PROVIDER": "disabled",
        "PUSH_WEBHOOK_URL": "",
        "PUSH_WEBHOOK_TOKEN": "",
        "FCM_SERVER_KEY": "",
        "INTERNAL_API_KEY": "change-me-internal",
        "CORS_ORIGINS": ["http://localhost:3000"],
        "UPLOAD_DIR": "./uploads",
        "MEDIA_URL": "/uploads",
        "MAX_UPLOAD_MB": 20,
        "ALLOWED_IMAGE_TYPES": "image/jpeg,image/png",
        "ALLOWED_DOCUMENT_TYPES": "application/pdf",
        "X_API_BASE_URL": "https://api.x.com",
        "X_UPLOAD_BASE_URL": "https://upload.twitter.com",
        "FACEBOOK_GRAPH_API_BASE_URL": "https://graph.facebook.com",
        "FACEBOOK_GRAPH_API_VERSION": "v23.0",
        "INSTAGRAM_GRAPH_API_VERSION": "v23.0",
        "LINKEDIN_API_BASE_URL": "https://api.linkedin.com",
        "LINKEDIN_VERSION": "202603",
        "TWITTER_CLIENT_ID": "",
        "TWITTER_CLIENT_SECRET": "",
        "TWITTER_CALLBACK_URL": "",
        "FACEBOOK_APP_ID": "",
        "FACEBOOK_APP_SECRET": "",
        "FACEBOOK_CALLBACK_URL": "",
        "INSTAGRAM_CALLBACK_URL": "",
        "LINKEDIN_CLIENT_ID": "",
        "LINKEDIN_CLIENT_SECRET": "",
        "LINKEDIN_CALLBACK_URL": "",
        "DEBUG": True,
        "LOG_LEVEL": "INFO",
        "LOG_FORMAT": "json",
        **overrides,
    }


class SettingsTests(unittest.TestCase):
    def test_internal_api_key_default_allowed_in_development(self):
        settings = Settings(**base_settings(APP_ENV="development"))

        self.assertTrue(settings.INTERNAL_API_KEY)

    def test_internal_api_key_default_rejected_outside_development(self):
        with self.assertRaisesRegex(ValidationError, "INTERNAL_API_KEY"):
            Settings(
                **base_settings(
                    APP_ENV="production",
                    JWT_SECRET_KEY="j" * 32,
                    INTERNAL_API_KEY="change-me-internal",
                )
            )

    def test_production_rejects_default_and_short_jwt_secrets(self):
        for secret in ("change-me-local", "short-secret"):
            with self.subTest(secret=secret), self.assertRaisesRegex(ValidationError, "JWT_SECRET_KEY"):
                Settings(
                    **base_settings(
                        APP_ENV="production",
                        JWT_SECRET_KEY=secret,
                        INTERNAL_API_KEY="i" * 32,
                    )
                )

    def test_production_rejects_missing_internal_api_key(self):
        values = base_settings(
            APP_ENV="production",
            JWT_SECRET_KEY="j" * 32,
        )
        values.pop("INTERNAL_API_KEY")

        with self.assertRaisesRegex(ValidationError, "INTERNAL_API_KEY"):
            Settings(**values)

    def test_production_rejects_local_database_and_redis_urls(self):
        with self.assertRaisesRegex(ValidationError, "DATABASE_URL"):
            Settings(
                **base_settings(
                    APP_ENV="production",
                    JWT_SECRET_KEY="j" * 32,
                    INTERNAL_API_KEY="i" * 32,
                )
            )

    def test_production_rejects_local_redis_url(self):
        with self.assertRaisesRegex(ValidationError, "REDIS_URL"):
            Settings(
                **base_settings(
                    APP_ENV="production",
                    JWT_SECRET_KEY="j" * 32,
                    INTERNAL_API_KEY="i" * 32,
                    DATABASE_URL="postgresql+asyncpg://user:pass@postgres:5432/ksu",
                )
            )

    def test_production_rejects_empty_cors_origins(self):
        with self.assertRaisesRegex(ValidationError, "CORS_ORIGINS"):
            Settings(
                **base_settings(
                    APP_ENV="production",
                    JWT_SECRET_KEY="j" * 32,
                    INTERNAL_API_KEY="i" * 32,
                    DATABASE_URL="postgresql+asyncpg://user:pass@postgres:5432/ksu",
                    REDIS_URL="redis://redis:6379/0",
                    RESEARCH_SERVICE_API_KEY="r" * 32,
                    LIBRARY_SERVICE_API_KEY="l" * 32,
                    CORS_ORIGINS=[],
                )
            )

    def test_cors_uses_explicit_client_allowlists(self):
        environment = {
            key: json.dumps(value) if isinstance(value, list) else str(value)
            for key, value in base_settings().items()
        }
        from app.core.config import get_settings

        with tempfile.TemporaryDirectory() as log_dir:
            environment["LOG_DIR"] = log_dir
            with patch.dict(os.environ, environment, clear=True):
                get_settings.cache_clear()
                sys.modules.pop("app.main", None)
                main = importlib.import_module("app.main")
                app = main.create_app()
                cors = next(middleware for middleware in app.user_middleware if middleware.cls is CORSMiddleware)

                self.assertEqual(cors.kwargs["allow_methods"], ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
                self.assertEqual(cors.kwargs["allow_headers"], ["Authorization", "Content-Type", "X-Internal-Key"])
            get_settings.cache_clear()


if __name__ == "__main__":
    unittest.main()
