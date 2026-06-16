"""Research service — FastAPI application factory."""

from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from ksu_common import configure_service_logging, invalidate_prefix, persist_audit_log, should_skip_audit

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
SEED_ASSETS_DIR = Path(__file__).resolve().parent / "seeders" / "assets"
PUBLIC_CACHE_INVALIDATION_METHODS = {"POST", "PUT", "PATCH", "DELETE"}
PUBLIC_CACHE_INVALIDATION_EXCLUDED_PREFIXES = (
    "/api/v1/audit",
    "/api/v1/health",
    "/api/v1/donations/submit",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title="KSU Research API",
        version=settings.APP_VERSION,
        docs_url="/api/docs" if settings.APP_ENV != "production" else None,
        redoc_url="/api/redoc" if settings.APP_ENV != "production" else None,
        openapi_url="/api/openapi.json" if settings.APP_ENV != "production" else None,
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(ValueError)
    async def value_error_handler(request: Request, exc: ValueError):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"status": "error", "message": str(exc), "code": "bad_request"},
        )

    @app.exception_handler(PermissionError)
    async def permission_error_handler(request: Request, exc: PermissionError):
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"status": "error", "message": str(exc), "code": "forbidden"},
        )

    @app.middleware("http")
    async def audit_middleware(request: Request, call_next):
        if should_skip_audit(request.url.path):
            return await call_next(request)

        try:
            response = await call_next(request)
        except Exception as exc:
            await persist_audit_log(
                AsyncSessionLocal,
                service_name=settings.SERVICE_NAME,
                request=request,
                status_code=500,
                error_message=str(exc),
            )
            raise

        await persist_audit_log(
            AsyncSessionLocal,
            service_name=settings.SERVICE_NAME,
            request=request,
            status_code=response.status_code,
        )
        if _should_invalidate_public_cache(request, response.status_code):
            await invalidate_prefix("public")
        return response

    register_routers(app)
    if settings.APP_ENV != "production" and SEED_ASSETS_DIR.exists():
        app.mount(
            "/seed-assets",
            StaticFiles(directory=SEED_ASSETS_DIR),
            name="seed-assets",
        )
    return app


def _should_invalidate_public_cache(request: Request, status_code: int) -> bool:
    if request.method not in PUBLIC_CACHE_INVALIDATION_METHODS:
        return False
    if status_code >= 400:
        return False

    path = request.url.path
    if not path.startswith("/api/v1/"):
        return False
    return not path.startswith(PUBLIC_CACHE_INVALIDATION_EXCLUDED_PREFIXES)
