"""Main site service — FastAPI application factory."""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from ksu_common import persist_audit_log, should_skip_audit

from .core.config import get_settings
from .core.database import AsyncSessionLocal
from .api.v1 import register_routes

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title="KSU Main Site API",
        description="Shared university CMS, institutional structure, admissions, content, media, support, and platform API for Kisii University.",
        version=settings.APP_VERSION,
        docs_url="/api/docs" if settings.APP_ENV != "production" else None,
        redoc_url="/api/redoc" if settings.APP_ENV != "production" else None,
        openapi_url="/api/openapi.json",
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
        return response

    app.mount("/uploads", StaticFiles(directory=settings.upload_dir_path), name="uploads")

    register_routes(app)
    return app
