"""Main site service — FastAPI application factory."""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.responses import JSONResponse
from sqlalchemy import select

from ksu_common import configure_service_logging, invalidate_prefix, persist_audit_log, request_actor_id, should_skip_audit
from ksu_common.cache import close_redis

from .core.config import get_settings
from .core.database import AsyncSessionLocal
from .api.v1 import register_routes
from .cache_invalidation import should_invalidate_public_cache
from .helpers.storage import normalize_storage_path
from .models import Media
from .services.change_tracking import begin_audit_context, collected_audit_changes, reset_audit_context
from .realtime.connection_manager import manager
from .realtime.redis_subscriber import subscriber

settings = get_settings()

configure_service_logging(
    service_name=settings.SERVICE_NAME,
    log_dir=settings.LOG_DIR,
    log_level=settings.LOG_LEVEL,
    log_format=settings.LOG_FORMAT,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await subscriber.start()
    try:
        yield
    finally:
        await subscriber.stop()
        await manager.close_all()
        await close_redis()


def create_app() -> FastAPI:
    app = FastAPI(
        title="KSU Main Site API",
        description="Shared university CMS, institutional structure, admissions, content, media, support, and platform API for Kisii University.",
        version=settings.APP_VERSION,
        debug=settings.DEBUG,
        docs_url="/api/docs" if settings.DEBUG or settings.APP_ENV != "production" else None,
        redoc_url="/api/redoc" if settings.DEBUG or settings.APP_ENV != "production" else None,
        openapi_url="/api/openapi.json" if settings.DEBUG or settings.APP_ENV != "production" else None,
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

        audit_token = begin_audit_context(actor_id=request_actor_id(request))
        try:
            try:
                response = await call_next(request)
            except Exception as exc:
                await persist_audit_log(
                    AsyncSessionLocal,
                    service_name=settings.SERVICE_NAME,
                    request=request,
                    status_code=500,
                    error_message=str(exc),
                    changes=collected_audit_changes(),
                )
                raise

            await persist_audit_log(
                AsyncSessionLocal,
                service_name=settings.SERVICE_NAME,
                request=request,
                status_code=response.status_code,
                changes=collected_audit_changes(),
            )
        finally:
            reset_audit_context(audit_token)
        if should_invalidate_public_cache(request, response.status_code):
            await invalidate_prefix("public")
        return response

    @app.get("/uploads/{storage_path:path}", include_in_schema=False)
    async def serve_public_upload(storage_path: str):
        normalized_path = normalize_storage_path(storage_path)
        if not normalized_path:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media not found")

        upload_root = settings.upload_dir_path.resolve()
        file_path = (upload_root / normalized_path).resolve()
        try:
            file_path.relative_to(upload_root)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media not found") from exc

        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(Media).where(
                    Media.storage_path == normalized_path,
                    Media.deleted_at.is_(None),
                    Media.is_public.is_(True),
                )
            )
            media = result.scalar_one_or_none()

        if media is None or not file_path.is_file():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media not found")

        return FileResponse(file_path, media_type=media.mime_type)

    register_routes(app)
    return app
