"""Library service configuration via pydantic-settings."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Literal

from ksu_common.config import (
    validate_explicit_production_settings,
    validate_cors_origins,
    validate_secret,
    validate_service_url,
)
from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

SERVICE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=SERVICE_DIR / ".env", extra="ignore")

    APP_ENV: str = "development"
    APP_VERSION: str = "0.1.0"
    SERVICE_NAME: str = "library"

    DATABASE_URL: str
    DB_SCHEMA: str = "library"
    DB_POOL_SIZE: int = Field(default=10, ge=1)
    DB_MAX_OVERFLOW: int = Field(default=20, ge=0)

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"

    REDIS_URL: str = "redis://localhost:6379/1"
    CELERY_BROKER_URL: str | None = None
    CELERY_RESULT_BACKEND: str | None = None

    MAIN_SERVICE_URL: str = "http://main:8000"
    INTERNAL_API_KEY: str = "change-me-internal"
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: Literal["json", "text"] = "json"
    LOG_DIR: str = "/app/logs"

    ASK_AI_PROVIDER: Literal["deterministic", "gemini"] = "deterministic"
    GEMINI_API_KEY: str | None = None
    GOOGLE_API_KEY: str | None = None
    GEMINI_MODEL: str = "gemini-2.5-flash"
    GEMINI_TIMEOUT_SECONDS: float = 30.0

    PUBLIC_APP_URL: str = "http://localhost:3000"
    GUEST_SESSION_TTL_MINUTES: int = 30
    EMAIL_VERIFICATION_TTL_MINUTES: int = 15
    EMAIL_VERIFICATION_MAX_ATTEMPTS: int = 5
    EMAIL_VERIFICATION_RESEND_SECONDS: int = 60
    CONVERSATION_CONTINUATION_TTL_DAYS: int = 30

    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
    ]

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

    @model_validator(mode="after")
    def reject_insecure_production_defaults(self) -> "Settings":
        validate_explicit_production_settings(
            configured_fields=self.model_fields_set,
            required_fields=("APP_ENV", "MAIN_SERVICE_URL", "CORS_ORIGINS"),
            app_env=self.APP_ENV,
        )
        validate_secret(self.JWT_SECRET_KEY, field_name="JWT_SECRET_KEY", app_env=self.APP_ENV)
        validate_secret(self.INTERNAL_API_KEY, field_name="INTERNAL_API_KEY", app_env=self.APP_ENV)
        validate_service_url(self.DATABASE_URL, field_name="DATABASE_URL", app_env=self.APP_ENV)
        validate_service_url(self.REDIS_URL, field_name="REDIS_URL", app_env=self.APP_ENV)
        validate_service_url(self.MAIN_SERVICE_URL, field_name="MAIN_SERVICE_URL", app_env=self.APP_ENV)
        validate_cors_origins(self.CORS_ORIGINS, app_env=self.APP_ENV)
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
