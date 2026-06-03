"""Main site service configuration via pydantic-settings."""

from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

FrontendService = Literal["web", "admin", "research", "library"]
SERVICE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=SERVICE_DIR / ".env", extra="ignore")

    APP_ENV: str = "development"
    APP_VERSION: str = "0.1.0"
    SERVICE_NAME: str = "main"

    DATABASE_URL: str
    DB_SCHEMA: str = "main"

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TTL_MINUTES: int = 15
    JWT_REFRESH_TTL_DAYS: int = 7

    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str | None = None
    CELERY_RESULT_BACKEND: str | None = None

    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str | None = None
    SMTP_PASSWORD: str | None = None
    SMTP_USE_TLS: bool = True
    EMAIL_FROM: str | None = None
    SMTP_FROM_EMAIL: str | None = None
    SMTP_FROM_NAME: str | None = None
    FRONTEND_BASE_URL: str = "http://localhost:3000"
    FRONTEND_ADMIN_URL: str = "http://localhost:3001"
    FRONTEND_RESEARCH_URL: str = "http://localhost:3002"
    FRONTEND_LIBRARY_URL: str = "http://localhost:3003"
    RESEARCH_SERVICE_URL: str = "http://localhost:8001"
    PASSWORD_RESET_RATE_LIMIT_COUNT: int = 5
    PASSWORD_RESET_RATE_LIMIT_WINDOW_SECONDS: int = 900

    SMS_PROVIDER: Literal["disabled", "webhook", "twilio"] = "disabled"
    SMS_WEBHOOK_URL: str | None = None
    SMS_WEBHOOK_TOKEN: str | None = None
    TWILIO_ACCOUNT_SID: str | None = None
    TWILIO_AUTH_TOKEN: str | None = None
    TWILIO_FROM_NUMBER: str | None = None

    PUSH_PROVIDER: Literal["disabled", "webhook", "fcm_legacy"] = "disabled"
    PUSH_WEBHOOK_URL: str | None = None
    PUSH_WEBHOOK_TOKEN: str | None = None
    FCM_SERVER_KEY: str | None = None

    INTERNAL_API_KEY: str = "change-me-internal"

    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
    ]

    UPLOAD_DIR: str = "/app/uploads"
    MEDIA_URL: str = "/uploads"
    MAX_UPLOAD_MB: int = 20

    X_API_BASE_URL: str = "https://api.x.com"
    X_UPLOAD_BASE_URL: str = "https://upload.twitter.com"
    FACEBOOK_GRAPH_API_BASE_URL: str = "https://graph.facebook.com"
    FACEBOOK_GRAPH_API_VERSION: str = "v23.0"
    INSTAGRAM_GRAPH_API_VERSION: str = "v23.0"
    LINKEDIN_API_BASE_URL: str = "https://api.linkedin.com"
    LINKEDIN_VERSION: str = "202603"
    TWITTER_CLIENT_ID: str | None = None
    TWITTER_CLIENT_SECRET: str | None = None
    TWITTER_CALLBACK_URL: str | None = None
    FACEBOOK_APP_ID: str | None = None
    FACEBOOK_APP_SECRET: str | None = None
    FACEBOOK_CALLBACK_URL: str | None = None
    INSTAGRAM_CALLBACK_URL: str | None = None
    LINKEDIN_CLIENT_ID: str | None = None
    LINKEDIN_CLIENT_SECRET: str | None = None
    LINKEDIN_CALLBACK_URL: str | None = None

    @property
    def upload_dir_path(self) -> Path:
        path = Path(self.UPLOAD_DIR).expanduser()
        if not path.is_absolute():
            path = SERVICE_DIR / path
        path.mkdir(parents=True, exist_ok=True)
        return path

    @property
    def email_template_dir(self) -> Path:
        return Path(__file__).resolve().parents[1] / "templates" / "email"

    @property
    def email_logo_path(self) -> Path:
        return Path(__file__).resolve().parents[1] / "assets" / "logos" / "ksu-logo.png"

    def frontend_url_for(self, service: FrontendService | None = None) -> str:
        service_map = {
            "web": self.FRONTEND_BASE_URL,
            "admin": self.FRONTEND_ADMIN_URL,
            "research": self.FRONTEND_RESEARCH_URL,
            "library": self.FRONTEND_LIBRARY_URL,
        }
        return service_map.get(service or "web", self.FRONTEND_BASE_URL)

    @field_validator("DATABASE_URL")
    @classmethod
    def must_be_asyncpg(cls, v: str) -> str:
        if not v.startswith("postgresql+asyncpg"):
            raise ValueError("DATABASE_URL must use postgresql+asyncpg driver")
        return v

    @field_validator("CELERY_BROKER_URL", "CELERY_RESULT_BACKEND")
    @classmethod
    def validate_celery_urls(cls, v: str | None) -> str | None:
        if v is None:
            return v
        valid_prefixes = ("redis://", "rediss://", "amqp://", "rpc://")
        if not v.startswith(valid_prefixes):
            raise ValueError("Celery broker/backend must use redis, rediss, amqp, or rpc URL")
        return v

    @field_validator("SMS_WEBHOOK_URL", "PUSH_WEBHOOK_URL")
    @classmethod
    def validate_optional_http_url(cls, v: str | None) -> str | None:
        if v is None or v == "":
            return None
        if not v.startswith(("http://", "https://")):
            raise ValueError("Webhook URLs must start with http:// or https://")
        return v

    @model_validator(mode="after")
    def reject_insecure_production_defaults(self) -> "Settings":
        if self.APP_ENV.lower() not in {"development", "dev", "local", "test", "testing"}:
            if self.INTERNAL_API_KEY == "change-me-internal":
                raise ValueError("INTERNAL_API_KEY must be configured outside local development")
        return self


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    os.environ.setdefault("JWT_SECRET_KEY", settings.JWT_SECRET_KEY)
    os.environ.setdefault("JWT_ALGORITHM", settings.JWT_ALGORITHM)
    return settings
