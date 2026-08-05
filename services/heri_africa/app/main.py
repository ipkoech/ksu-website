from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI

from ksu_common.runtime import CorsConfig, ServiceAppConfig, create_service_app

from .core.config import get_settings
from .routes import register_routers


@asynccontextmanager
async def lifespan(_: FastAPI):
    yield


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
    )
