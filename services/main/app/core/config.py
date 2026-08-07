"""Main site service configuration via pydantic-settings."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Literal

from ksu_common.config import (
    validate_celery_url,
    validate_cors_origins,
    validate_read_replica_settings,
    validate_secret,
    validate_service_url,
)
from ksu_common.rate_limit import rate_limit
from pydantic import Field, field_validator, model_validator
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
    READ_DATABASE_URL: str | None = None
    READ_REPLICA_ENABLED: bool = False
    READ_REPLICA_APPROVED: bool = False

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
    # Public origin of the API gateway, used for links embedded in emails
    # (e.g. newsletter unsubscribe). Defaults to the local dev gateway.
    PUBLIC_API_BASE_URL: str = "http://localhost:8080"
    FRONTEND_ADMIN_URL: str
    FRONTEND_RESEARCH_URL: str
    FRONTEND_LIBRARY_URL: str
    RESEARCH_SERVICE_URL: str
    LIBRARY_SERVICE_URL: str
    RESEARCH_SERVICE_API_KEY: str | None = None
    LIBRARY_SERVICE_API_KEY: str | None = None
    PASSWORD_RESET_RATE_LIMIT_COUNT: int
    PASSWORD_RESET_RATE_LIMIT_WINDOW_SECONDS: int
    AUTH_LOGIN_MAX_ATTEMPTS: int = 5
    AUTH_LOGIN_LOCKOUT_MINUTES: int = 15

    # Retention for the two tables that grow with traffic rather than content.
    # Set either to 0 to disable pruning and keep rows indefinitely.
    AUDIT_LOG_RETENTION_DAYS: int = Field(default=180, ge=0)
    OUTBOX_RETENTION_DAYS: int = Field(default=7, ge=0)

    # When set, /uploads/ answers with an X-Accel-Redirect into this internal
    # nginx location instead of streaming the file through Python. Leave unset
    # when running the API without the gateway in front, e.g. local uvicorn.
    MEDIA_INTERNAL_REDIRECT_PREFIX: str | None = None
    LOGIN_RATE_LIMIT_COUNT: int = 10
    LOGIN_RATE_LIMIT_WINDOW_SECONDS: int = 60
    API_KEY_RATE_LIMIT_WINDOW_SECONDS: int = 60
    ANALYTICS_RATE_LIMIT_COUNT: int = 120
    ANALYTICS_RATE_LIMIT_WINDOW_SECONDS: int = 60
    NEWSLETTER_RATE_LIMIT_COUNT: int = 10
    NEWSLETTER_RATE_LIMIT_WINDOW_SECONDS: int = 300
    PUBLIC_CONTENT_RATE_LIMIT_COUNT: int = 120
    PUBLIC_CONTENT_RATE_LIMIT_WINDOW_SECONDS: int = 60
    PUBLIC_MEDIA_RATE_LIMIT_COUNT: int = 60
    PUBLIC_MEDIA_RATE_LIMIT_WINDOW_SECONDS: int = 60
    MEDIA_UPLOAD_RATE_LIMIT_COUNT: int = 30
    MEDIA_UPLOAD_RATE_LIMIT_WINDOW_SECONDS: int = 60
    HEALTH_RATE_LIMIT_COUNT: int = 30
    HEALTH_RATE_LIMIT_WINDOW_SECONDS: int = 60

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
    UPLOAD_BATCH_EXPIRY_HOURS: int = 24
    UPLOAD_PROGRESS_STEP_PERCENT: int = 10
    REALTIME_HEARTBEAT_SECONDS: int = 25
    REALTIME_TICKET_TTL_SECONDS: int = 60
    REALTIME_MAX_MESSAGE_BYTES: int = 4096
    REALTIME_MAX_CONNECTIONS_PER_USER: int = 5
    REALTIME_MAX_CONNECTIONS_PER_IP: int = 20
    REALTIME_QUEUE_SIZE: int = 100
    SCHOOL_PORTAL_ROUTES_ENABLED: bool = True
    SCHOOL_PORTAL_EVENTS_ENABLED: bool = True
    SCHOOL_PORTAL_WEBSOCKET_FANOUT_ENABLED: bool = True

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
        return validate_celery_url(v)

    @field_validator("SMS_WEBHOOK_URL", "PUSH_WEBHOOK_URL")
    @classmethod
    def validate_optional_http_url(cls, v: str | None) -> str | None:
        if v is None or v == "":
            return None
        if not v.startswith(("http://", "https://")):
            raise ValueError("Webhook URLs must start with http:// or https://")
        return v

    @model_validator(mode="after")
    def reject_insecure_production_defaults(self) -> Settings:
        if self.APP_ENV.strip().lower() == "production" and self.DEBUG:
            raise ValueError("DEBUG must be false in production")
        validate_secret(self.JWT_SECRET_KEY, field_name="JWT_SECRET_KEY", app_env=self.APP_ENV)
        validate_secret(self.INTERNAL_API_KEY, field_name="INTERNAL_API_KEY", app_env=self.APP_ENV)
        validate_service_url(self.DATABASE_URL, field_name="DATABASE_URL", app_env=self.APP_ENV)
        validate_service_url(self.REDIS_URL, field_name="REDIS_URL", app_env=self.APP_ENV)
        validate_service_url(self.RESEARCH_SERVICE_URL, field_name="RESEARCH_SERVICE_URL", app_env=self.APP_ENV)
        validate_service_url(self.LIBRARY_SERVICE_URL, field_name="LIBRARY_SERVICE_URL", app_env=self.APP_ENV)
        validate_read_replica_settings(
            enabled=self.READ_REPLICA_ENABLED,
            approved=self.READ_REPLICA_APPROVED,
            url=self.READ_DATABASE_URL,
            app_env=self.APP_ENV,
        )
        validate_secret(
            self.RESEARCH_SERVICE_API_KEY,
            field_name="RESEARCH_SERVICE_API_KEY",
            app_env=self.APP_ENV,
        )
        validate_secret(
            self.LIBRARY_SERVICE_API_KEY,
            field_name="LIBRARY_SERVICE_API_KEY",
            app_env=self.APP_ENV,
        )
        validate_cors_origins(self.CORS_ORIGINS, app_env=self.APP_ENV)
        return self


def _parse_csv_list(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    return settings


_settings = get_settings()
public_content_rate_limit = rate_limit(
    requests=_settings.PUBLIC_CONTENT_RATE_LIMIT_COUNT,
    window=_settings.PUBLIC_CONTENT_RATE_LIMIT_WINDOW_SECONDS,
    prefix="main:public-content:ip",
)
public_media_rate_limit = rate_limit(
    requests=_settings.PUBLIC_MEDIA_RATE_LIMIT_COUNT,
    window=_settings.PUBLIC_MEDIA_RATE_LIMIT_WINDOW_SECONDS,
    prefix="main:public-media:ip",
)
media_upload_rate_limit = rate_limit(
    requests=_settings.MEDIA_UPLOAD_RATE_LIMIT_COUNT,
    window=_settings.MEDIA_UPLOAD_RATE_LIMIT_WINDOW_SECONDS,
    by_user=True,
    prefix="main:media-upload:user-or-ip",
)
health_rate_limit = rate_limit(
    requests=_settings.HEALTH_RATE_LIMIT_COUNT,
    window=_settings.HEALTH_RATE_LIMIT_WINDOW_SECONDS,
    prefix="main:health:ip",
)
