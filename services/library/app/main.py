"""Library service — FastAPI application factory."""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.responses import ORJSONResponse
from ksu_common import (
    configure_service_logging,
)
from ksu_common.gemini import close_gemini_transports
from ksu_common.internal_client import close_integration_pool
from ksu_common.runtime import (
    AuditOptions,
    CorsConfig,
    ServiceAppConfig,
    create_service_app,
)
from ksu_common.security import decode_key_material

from .core.config import get_settings
from .core.database import AsyncSessionLocal
from .routes import register_routers
from .tasks.audit import dispatch_audit

settings = get_settings()
token_public_key = decode_key_material(settings.JWT_PUBLIC_KEY_B64, field_name="JWT_PUBLIC_KEY_B64")
configure_service_logging(
    service_name=settings.SERVICE_NAME,
    log_dir=settings.LOG_DIR,
    log_level=settings.LOG_LEVEL,
    log_format=settings.LOG_FORMAT,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        yield
    finally:
        await close_gemini_transports()
        await close_integration_pool()


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
            response_model_missing_baseline=133,
            lifespan=lifespan,
            default_response_class=ORJSONResponse,
        ),
        cors=CorsConfig(origins=settings.CORS_ORIGINS),
        register_routes=register_routers,
        audit=AuditOptions(
            session_factory=AsyncSessionLocal,
            service_name=settings.SERVICE_NAME,
            token_key=token_public_key,
            token_algorithm=settings.JWT_ALGORITHM,
            token_issuer=settings.JWT_ISSUER,
            token_audience=settings.JWT_AUDIENCE,
            token_key_id=settings.JWT_KEY_ID,
            dispatch=dispatch_audit,
            skip_anonymous_reads=True,
        ),
    )
