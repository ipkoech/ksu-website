from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Literal

from ksu_common.config import (
    validate_celery_url,
    validate_explicit_production_settings,
    validate_cors_origins,
    validate_read_replica_settings,
    validate_secret,
    validate_service_url,
)
from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

SERVICE_DIR = Path(__file__).resolve().parents[2]


class HeriSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=SERVICE_DIR / ".env", extra="ignore")

    APP_ENV: str = "development"
    APP_VERSION: str = "0.1.0"
    SERVICE_NAME: str = "heri-africa"
    DATABASE_URL: str = "postgresql+asyncpg://localhost/ksu_services_db"
    DB_SCHEMA: str = "heri"
    DB_POOL_SIZE: int = Field(default=5, ge=1)
    DB_MAX_OVERFLOW: int = Field(default=0, ge=0)
    READ_DATABASE_URL: str | None = None
    READ_REPLICA_ENABLED: bool = False
    READ_REPLICA_APPROVED: bool = False
    JWT_SECRET_KEY: str = "change-me-local"
    JWT_ALGORITHM: str = "HS256"
    REDIS_URL: str = "redis://localhost:6379/3"
    CELERY_BROKER_URL: str | None = None
    CELERY_RESULT_BACKEND: str | None = None
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: Literal["json", "text"] = "json"
    LOG_DIR: str = "/app/logs"
    UPLOAD_DIR: str = "/app/uploads"
    MEDIA_URL: str = "/media"
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:3001", "http://localhost:3004"]
    RESEARCH_SERVICE_URL: str = "http://research:8001"
    RESEARCH_SERVICE_API_KEY: str | None = None
    PUBLIC_CONTENT_RATE_LIMIT_COUNT: int = Field(default=120, ge=1)
    PUBLIC_CONTENT_RATE_LIMIT_WINDOW_SECONDS: int = Field(default=60, ge=1)
    HEALTH_RATE_LIMIT_COUNT: int = Field(default=30, ge=1)
    HEALTH_RATE_LIMIT_WINDOW_SECONDS: int = Field(default=60, ge=1)

    @field_validator("DATABASE_URL")
    @classmethod
    def must_use_asyncpg(cls, value: str) -> str:
        if not value.startswith("postgresql+asyncpg"):
            raise ValueError("DATABASE_URL must use postgresql+asyncpg driver")
        return value

    @field_validator("CELERY_BROKER_URL", "CELERY_RESULT_BACKEND")
    @classmethod
    def validate_celery_urls(cls, value: str | None) -> str | None:
        return validate_celery_url(value)

    @model_validator(mode="after")
    def reject_insecure_production_defaults(self) -> "HeriSettings":
        validate_explicit_production_settings(
            configured_fields=self.model_fields_set,
            required_fields=("APP_ENV", "RESEARCH_SERVICE_URL", "CORS_ORIGINS"),
            app_env=self.APP_ENV,
        )
        validate_secret(self.JWT_SECRET_KEY, field_name="JWT_SECRET_KEY", app_env=self.APP_ENV)
        validate_secret(
            self.RESEARCH_SERVICE_API_KEY,
            field_name="RESEARCH_SERVICE_API_KEY",
            app_env=self.APP_ENV,
        )
        validate_service_url(self.DATABASE_URL, field_name="DATABASE_URL", app_env=self.APP_ENV)
        validate_service_url(self.REDIS_URL, field_name="REDIS_URL", app_env=self.APP_ENV)
        validate_service_url(self.RESEARCH_SERVICE_URL, field_name="RESEARCH_SERVICE_URL", app_env=self.APP_ENV)
        validate_read_replica_settings(
            enabled=self.READ_REPLICA_ENABLED,
            approved=self.READ_REPLICA_APPROVED,
            url=self.READ_DATABASE_URL,
            app_env=self.APP_ENV,
        )
        validate_cors_origins(self.CORS_ORIGINS, app_env=self.APP_ENV)
        return self


@lru_cache
def get_settings() -> HeriSettings:
    return HeriSettings()
