"""Research service — FastAPI application factory."""

from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request, Response
from fastapi.staticfiles import StaticFiles
from ksu_common import (
    configure_service_logging,
    invalidate_prefix,
)
from ksu_common.gemini import close_gemini_transports
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
from .services.idempotency import install_idempotency_guards
from .tasks.audit import dispatch_audit

settings = get_settings()
configure_service_logging(
    service_name=settings.SERVICE_NAME,
    log_dir=settings.LOG_DIR,
    log_level=settings.LOG_LEVEL,
    log_format=settings.LOG_FORMAT,
)
SEED_ASSETS_DIR = Path(__file__).resolve().parent / "seeders" / "assets"
PUBLIC_CACHE_INVALIDATION_METHODS = {"POST", "PUT", "PATCH", "DELETE"}
PUBLIC_CACHE_INVALIDATION_EXCLUDED_PREFIXES = (
    "/api/v1/audit",
    "/api/v1/health",
    "/api/v1/donations/submit",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        yield
    finally:
        await close_gemini_transports()
        await close_integration_pool()


def create_app() -> FastAPI:
    app = create_service_app(
        ServiceAppConfig(
            service_name=settings.SERVICE_NAME,
            title="KSU Research API",
            version=settings.APP_VERSION,
            docs_url="/api/docs" if settings.APP_ENV != "production" else None,
            redoc_url="/api/redoc" if settings.APP_ENV != "production" else None,
            openapi_url="/api/openapi.json" if settings.APP_ENV != "production" else None,
            lifespan=lifespan,
        ),
        cors=CorsConfig(origins=settings.CORS_ORIGINS),
        register_routes=register_routers,
        audit=AuditOptions(
            session_factory=AsyncSessionLocal,
            service_name=settings.SERVICE_NAME,
            token_secret=settings.JWT_SECRET_KEY,
            token_algorithm=settings.JWT_ALGORITHM,
            dispatch=dispatch_audit,
            skip_anonymous_reads=True,
        ),
        after_response=_after_response,
    )
    app.state.idempotency_adoption_count = install_idempotency_guards(app)
    if settings.APP_ENV != "production" and SEED_ASSETS_DIR.exists():
        app.mount(
            "/seed-assets",
            StaticFiles(directory=SEED_ASSETS_DIR),
            name="seed-assets",
        )
    return app


async def _after_response(request: Request, response: Response) -> None:
    if _should_invalidate_public_cache(request, response.status_code):
        await invalidate_prefix("public")


def _should_invalidate_public_cache(request: Request, status_code: int) -> bool:
    if request.method not in PUBLIC_CACHE_INVALIDATION_METHODS:
        return False
    if status_code >= 400:
        return False

    path = request.url.path
    if not path.startswith("/api/v1/"):
        return False
    return not path.startswith(PUBLIC_CACHE_INVALIDATION_EXCLUDED_PREFIXES)
