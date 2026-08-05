"""Library service — FastAPI application factory."""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.responses import ORJSONResponse

from ksu_common import (
    configure_service_logging,
)
from ksu_common.runtime import AuditOptions, CorsConfig, ServiceAppConfig, create_service_app

from .core.config import get_settings
from .core.database import AsyncSessionLocal
from .routes import register_routers

settings = get_settings()
configure_service_logging(
    service_name=settings.SERVICE_NAME,
    log_dir=settings.LOG_DIR,
    log_level=settings.LOG_LEVEL,
    log_format=settings.LOG_FORMAT,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Shutdown


def create_app() -> FastAPI:
    return create_service_app(
        ServiceAppConfig(
            service_name=settings.SERVICE_NAME,
            title="KSU Library API",
            description="Library branches, resources, circulation, electronic resources, staff, and engagement API for Kisii University.",
            version=settings.APP_VERSION,
            docs_url="/api/docs" if settings.APP_ENV != "production" else None,
            redoc_url="/api/redoc" if settings.APP_ENV != "production" else None,
            openapi_url="/api/openapi.json" if settings.APP_ENV != "production" else None,
            lifespan=lifespan,
            default_response_class=ORJSONResponse,
        ),
        cors=CorsConfig(origins=settings.CORS_ORIGINS),
        register_routes=register_routers,
        audit=AuditOptions(
            session_factory=AsyncSessionLocal,
            service_name=settings.SERVICE_NAME,
        ),
    )
