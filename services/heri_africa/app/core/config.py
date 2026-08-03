from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

SERVICE_DIR = Path(__file__).resolve().parents[2]


class HeriSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=SERVICE_DIR / ".env", extra="ignore")

    APP_ENV: str = "development"
    APP_VERSION: str = "0.1.0"
    SERVICE_NAME: str = "heri-africa"
    DATABASE_URL: str = "postgresql+asyncpg://localhost/ksu_services_db"
    DB_SCHEMA: str = "heri"
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

    @field_validator("DATABASE_URL")
    @classmethod
    def must_use_asyncpg(cls, value: str) -> str:
        if not value.startswith("postgresql+asyncpg"):
            raise ValueError("DATABASE_URL must use postgresql+asyncpg driver")
        return value


@lru_cache
def get_settings() -> HeriSettings:
    return HeriSettings()
