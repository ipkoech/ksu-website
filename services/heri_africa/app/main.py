from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from ksu_common.internal_client import close_integration_pool
from ksu_common.runtime import (
    AuditOptions,
    CorsConfig,
    ServiceAppConfig,
    create_service_app,
)

from .core.config import get_settings
from .core.database import AsyncSessionLocal
from .routes import register_routers
from .tasks.audit import dispatch_audit


@asynccontextmanager
async def lifespan(_: FastAPI):
    try:
        yield
    finally:
        await close_integration_pool()


def create_app() -> FastAPI:
    settings = get_settings()
    return create_service_app(
        ServiceAppConfig(
            service_name=settings.SERVICE_NAME,
            title="HERI Africa API",
            version=settings.APP_VERSION,
            docs_url="/api/docs" if settings.APP_ENV != "production" else None,
            redoc_url="/api/redoc" if settings.APP_ENV != "production" else None,
            lifespan=lifespan,
        ),
        cors=CorsConfig(origins=settings.CORS_ORIGINS),
        register_routes=register_routers,
        audit=AuditOptions(
            session_factory=AsyncSessionLocal,
            service_name=settings.SERVICE_NAME,
            dispatch=dispatch_audit,
            skip_anonymous_reads=True,
        ),
    )
