"""Library service configuration via pydantic-settings."""

from __future__ import annotations

from functools import lru_cache

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_ENV: str = "development"
    APP_VERSION: str = "0.1.0"
    SERVICE_NAME: str = "library"

    DATABASE_URL: str
    DB_SCHEMA: str = "library"

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"

    REDIS_URL: str = "redis://localhost:6379/1"
    CELERY_BROKER_URL: str | None = None
    CELERY_RESULT_BACKEND: str | None = None

    MAIN_SERVICE_URL: str = "http://main:8000"
    INTERNAL_API_KEY: str = "change-me-internal"

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
        if self.APP_ENV.lower() not in {"development", "dev", "local", "test", "testing"}:
            if self.INTERNAL_API_KEY == "change-me-internal":
                raise ValueError("INTERNAL_API_KEY must be configured outside local development")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
