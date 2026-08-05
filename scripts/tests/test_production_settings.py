"""Non-network production settings validation for all backend services."""

from __future__ import annotations

import importlib.util
import sys
from copy import deepcopy
from pathlib import Path

import pytest
from pydantic import ValidationError


ROOT = Path(__file__).parents[2]
COMMON_DIR = ROOT / "services" / "common"
if str(COMMON_DIR) not in sys.path:
    sys.path.insert(0, str(COMMON_DIR))


def load_settings_class(service: str):
    config_path = ROOT / "services" / service / "app" / "core" / "config.py"
    module_name = f"task_17_{service}_config"
    spec = importlib.util.spec_from_file_location(module_name, config_path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    return getattr(module, "HeriSettings", getattr(module, "Settings", None))


SETTINGS_CLASSES = {service: load_settings_class(service) for service in ("main", "research", "library", "heri_africa")}


def main_fixture() -> dict[str, object]:
    return {
        "APP_ENV": "production",
        "APP_VERSION": "0.1.0",
        "SERVICE_NAME": "main",
        "DATABASE_URL": "postgresql+asyncpg://user:pass@postgres:5432/ksu",
        "DB_SCHEMA": "main",
        "DB_POOL_SIZE": 10,
        "DB_MAX_OVERFLOW": 20,
        "JWT_SECRET_KEY": "j" * 32,
        "JWT_ALGORITHM": "HS256",
        "JWT_ACCESS_TTL_MINUTES": 15,
        "JWT_REFRESH_TTL_DAYS": 7,
        "PASSWORD_RESET_TOKEN_TTL_HOURS": 1,
        "REDIS_URL": "redis://redis:6379/0",
        "CELERY_BROKER_URL": "redis://redis:6379/0",
        "CELERY_RESULT_BACKEND": "redis://redis:6379/0",
        "SMTP_HOST": "smtp.example.edu",
        "SMTP_PORT": 587,
        "SMTP_USERNAME": "service-account",
        "SMTP_PASSWORD": "s" * 32,
        "SMTP_USE_TLS": True,
        "EMAIL_FROM": "service@example.edu",
        "SMTP_FROM_EMAIL": "service@example.edu",
        "SMTP_FROM_NAME": "KSU",
        "FRONTEND_BASE_URL": "https://www.example.edu",
        "FRONTEND_ADMIN_URL": "https://www.example.edu/admin",
        "FRONTEND_RESEARCH_URL": "https://research.example.edu",
        "FRONTEND_LIBRARY_URL": "https://library.example.edu",
        "RESEARCH_SERVICE_URL": "http://research:8001",
        "LIBRARY_SERVICE_URL": "http://library:8002",
        "PASSWORD_RESET_RATE_LIMIT_COUNT": 5,
        "PASSWORD_RESET_RATE_LIMIT_WINDOW_SECONDS": 900,
        "SMS_PROVIDER": "disabled",
        "SMS_WEBHOOK_URL": None,
        "SMS_WEBHOOK_TOKEN": None,
        "TWILIO_ACCOUNT_SID": None,
        "TWILIO_AUTH_TOKEN": None,
        "TWILIO_FROM_NUMBER": None,
        "PUSH_PROVIDER": "disabled",
        "PUSH_WEBHOOK_URL": None,
        "PUSH_WEBHOOK_TOKEN": None,
        "FCM_SERVER_KEY": None,
        "INTERNAL_API_KEY": "i" * 32,
        "CORS_ORIGINS": ["https://www.example.edu"],
        "UPLOAD_DIR": "/tmp/ksu-task-17-uploads",
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
        "TWITTER_CLIENT_ID": None,
        "TWITTER_CLIENT_SECRET": None,
        "TWITTER_CALLBACK_URL": None,
        "FACEBOOK_APP_ID": None,
        "FACEBOOK_APP_SECRET": None,
        "FACEBOOK_CALLBACK_URL": None,
        "INSTAGRAM_CALLBACK_URL": None,
        "LINKEDIN_CLIENT_ID": None,
        "LINKEDIN_CLIENT_SECRET": None,
        "LINKEDIN_CALLBACK_URL": None,
        "DEBUG": False,
        "LOG_LEVEL": "INFO",
        "LOG_FORMAT": "json",
    }


def production_fixtures() -> dict[str, dict[str, object]]:
    return {
        "main": main_fixture(),
        "research": {
            "APP_ENV": "production",
            "DATABASE_URL": "postgresql+asyncpg://user:pass@postgres:5432/ksu",
            "JWT_SECRET_KEY": "j" * 32,
            "REDIS_URL": "redis://redis:6379/2",
            "MAIN_SERVICE_URL": "http://main:8000",
            "MAIN_SERVICE_API_KEY": "m" * 32,
            "INTERNAL_API_KEY": "r" * 32,
            "REFERENCE_VALIDATION_MODE": "strict",
            "CORS_ORIGINS": ["https://research.example.edu"],
        },
        "library": {
            "APP_ENV": "production",
            "DATABASE_URL": "postgresql+asyncpg://user:pass@postgres:5432/ksu",
            "JWT_SECRET_KEY": "j" * 32,
            "REDIS_URL": "redis://redis:6379/1",
            "MAIN_SERVICE_URL": "http://main:8000",
            "INTERNAL_API_KEY": "i" * 32,
            "CORS_ORIGINS": ["https://library.example.edu"],
        },
        "heri_africa": {
            "APP_ENV": "production",
            "DATABASE_URL": "postgresql+asyncpg://user:pass@postgres:5432/ksu",
            "JWT_SECRET_KEY": "j" * 32,
            "REDIS_URL": "redis://redis:6379/3",
            "RESEARCH_SERVICE_URL": "http://research:8001",
            "RESEARCH_SERVICE_API_KEY": "r" * 32,
            "CORS_ORIGINS": ["https://heri.example.edu"],
        },
    }


@pytest.mark.parametrize("service", SETTINGS_CLASSES)
def test_production_fixtures_initialize_without_network(service: str) -> None:
    SETTINGS_CLASSES[service](**production_fixtures()[service])


@pytest.mark.parametrize("service", SETTINGS_CLASSES)
def test_production_rejects_placeholder_jwt_secret(service: str) -> None:
    values = deepcopy(production_fixtures()[service])
    values["JWT_SECRET_KEY"] = "change-me-local"

    with pytest.raises(ValidationError, match="JWT_SECRET_KEY"):
        SETTINGS_CLASSES[service](**values)


@pytest.mark.parametrize("service", SETTINGS_CLASSES)
def test_production_rejects_generated_secret_markers(service: str) -> None:
    values = deepcopy(production_fixtures()[service])
    values["JWT_SECRET_KEY"] = "GENERATE_A_UNIQUE_32_CHARACTER_SECRET"

    with pytest.raises(ValidationError, match="JWT_SECRET_KEY"):
        SETTINGS_CLASSES[service](**values)


@pytest.mark.parametrize(
    ("service", "key_field"),
    (("main", "INTERNAL_API_KEY"), ("research", "MAIN_SERVICE_API_KEY"), ("library", "INTERNAL_API_KEY"), ("heri_africa", "RESEARCH_SERVICE_API_KEY")),
)
def test_production_rejects_missing_service_keys(service: str, key_field: str) -> None:
    values = deepcopy(production_fixtures()[service])
    values.pop(key_field)

    with pytest.raises(ValidationError, match=key_field):
        SETTINGS_CLASSES[service](**values)


@pytest.mark.parametrize(
    ("service", "url_field"),
    (("main", "RESEARCH_SERVICE_URL"), ("research", "MAIN_SERVICE_URL"), ("library", "MAIN_SERVICE_URL"), ("heri_africa", "RESEARCH_SERVICE_URL")),
)
def test_production_requires_explicit_service_urls(service: str, url_field: str) -> None:
    values = deepcopy(production_fixtures()[service])
    values.pop(url_field)

    with pytest.raises(ValidationError, match=url_field):
        SETTINGS_CLASSES[service](**values)


@pytest.mark.parametrize("service", SETTINGS_CLASSES)
def test_production_requires_explicit_non_local_cors_origins(service: str) -> None:
    values = deepcopy(production_fixtures()[service])
    values.pop("CORS_ORIGINS")

    with pytest.raises(ValidationError, match="CORS_ORIGINS"):
        SETTINGS_CLASSES[service](**values)


@pytest.mark.parametrize("service", SETTINGS_CLASSES)
def test_production_rejects_local_cors_origins(service: str) -> None:
    values = deepcopy(production_fixtures()[service])
    values["CORS_ORIGINS"] = ["http://localhost:3000"]

    with pytest.raises(ValidationError, match="CORS_ORIGINS"):
        SETTINGS_CLASSES[service](**values)


@pytest.mark.parametrize("service", SETTINGS_CLASSES)
def test_production_rejects_placeholder_cors_origins(service: str) -> None:
    values = deepcopy(production_fixtures()[service])
    values["CORS_ORIGINS"] = ["https://example.invalid"]

    with pytest.raises(ValidationError, match="CORS_ORIGINS"):
        SETTINGS_CLASSES[service](**values)


@pytest.mark.parametrize(
    ("service", "url_field"),
    (("main", "RESEARCH_SERVICE_URL"), ("research", "MAIN_SERVICE_URL"), ("library", "MAIN_SERVICE_URL"), ("heri_africa", "RESEARCH_SERVICE_URL")),
)
def test_production_rejects_placeholder_service_urls(service: str, url_field: str) -> None:
    values = deepcopy(production_fixtures()[service])
    values[url_field] = "https://example.invalid"

    with pytest.raises(ValidationError, match=url_field):
        SETTINGS_CLASSES[service](**values)
