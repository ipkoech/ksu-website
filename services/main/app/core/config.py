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

    APP_ENV: str
    APP_VERSION: str
    SERVICE_NAME: str

    DATABASE_URL: str
    DB_SCHEMA: str
    DB_POOL_SIZE: int
    DB_MAX_OVERFLOW: int

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str
    JWT_ACCESS_TTL_MINUTES: int
    JWT_REFRESH_TTL_DAYS: int
    PASSWORD_RESET_TOKEN_TTL_HOURS: int

    REDIS_URL: str
    CELERY_BROKER_URL: str | None
    CELERY_RESULT_BACKEND: str | None

    SMTP_HOST: str
    SMTP_PORT: int
    SMTP_USERNAME: str | None
    SMTP_PASSWORD: str | None
    SMTP_USE_TLS: bool
    EMAIL_FROM: str | None
    SMTP_FROM_EMAIL: str | None
    SMTP_FROM_NAME: str | None
    FRONTEND_BASE_URL: str
    FRONTEND_ADMIN_URL: str
    FRONTEND_RESEARCH_URL: str
    FRONTEND_LIBRARY_URL: str
    RESEARCH_SERVICE_URL: str
    LIBRARY_SERVICE_URL: str
    PASSWORD_RESET_RATE_LIMIT_COUNT: int
    PASSWORD_RESET_RATE_LIMIT_WINDOW_SECONDS: int

    SMS_PROVIDER: Literal["disabled", "webhook", "twilio"]
    SMS_WEBHOOK_URL: str | None
    SMS_WEBHOOK_TOKEN: str | None
    TWILIO_ACCOUNT_SID: str | None
    TWILIO_AUTH_TOKEN: str | None
    TWILIO_FROM_NUMBER: str | None

    PUSH_PROVIDER: Literal["disabled", "webhook", "fcm_legacy"]
    PUSH_WEBHOOK_URL: str | None
    PUSH_WEBHOOK_TOKEN: str | None
    FCM_SERVER_KEY: str | None

    INTERNAL_API_KEY: str

    CORS_ORIGINS: list[str]

    UPLOAD_DIR: str
    MEDIA_URL: str
    MAX_UPLOAD_MB: int
    ALLOWED_IMAGE_TYPES: str
    ALLOWED_DOCUMENT_TYPES: str

    X_API_BASE_URL: str
    X_UPLOAD_BASE_URL: str
    FACEBOOK_GRAPH_API_BASE_URL: str
    FACEBOOK_GRAPH_API_VERSION: str
    INSTAGRAM_GRAPH_API_VERSION: str
    LINKEDIN_API_BASE_URL: str
    LINKEDIN_VERSION: str
    TWITTER_CLIENT_ID: str | None
    TWITTER_CLIENT_SECRET: str | None
    TWITTER_CALLBACK_URL: str | None
    FACEBOOK_APP_ID: str | None
    FACEBOOK_APP_SECRET: str | None
    FACEBOOK_CALLBACK_URL: str | None
    INSTAGRAM_CALLBACK_URL: str | None
    LINKEDIN_CLIENT_ID: str | None
    LINKEDIN_CLIENT_SECRET: str | None
    LINKEDIN_CALLBACK_URL: str | None

    DEBUG: bool
    LOG_LEVEL: str
    LOG_FORMAT: Literal["json", "text"]
    LOG_DIR: str = "/app/logs"

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

    @property
    def allowed_image_types(self) -> list[str]:
        return _parse_csv_list(self.ALLOWED_IMAGE_TYPES)

    @property
    def allowed_document_types(self) -> list[str]:
        return _parse_csv_list(self.ALLOWED_DOCUMENT_TYPES)

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

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug(cls, v: bool | str) -> bool | str:
        if isinstance(v, str) and v.strip().lower() == "release":
            return False
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


def _parse_csv_list(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    os.environ.setdefault("JWT_SECRET_KEY", settings.JWT_SECRET_KEY)
    os.environ.setdefault("JWT_ALGORITHM", settings.JWT_ALGORITHM)
    return settings
