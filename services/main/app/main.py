"""Main site service — FastAPI application factory."""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, Response, status
from fastapi.responses import FileResponse
from ksu_common import (
    configure_service_logging,
    invalidate_prefix,
    request_actor_id,
)
from ksu_common.cache import close_redis
from ksu_common.internal_client import close_integration_pool
from ksu_common.runtime import (
    AuditOptions,
    CorsConfig,
    ServiceAppConfig,
    create_service_app,
)
from sqlalchemy import select

from .api.v1 import register_routes
from .cache_invalidation import should_invalidate_public_cache
from .core.config import get_settings
from .core.database import AsyncSessionLocal
from .helpers.storage import normalize_storage_path
from .models import Media
from .realtime.connection_manager import manager
from .realtime.redis_subscriber import subscriber
from .services.change_tracking import (
    begin_audit_context,
    collected_audit_changes,
    reset_audit_context,
)

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
        await close_integration_pool()
        await close_redis()


def create_app() -> FastAPI:
    return create_service_app(
        ServiceAppConfig(
            service_name=settings.SERVICE_NAME,
            title="KSU Main Site API",
            description="Shared university CMS, institutional structure, admissions, content, media, support, and platform API for Kisii University.",
            version=settings.APP_VERSION,
            debug=settings.DEBUG,
            docs_url="/api/docs" if settings.DEBUG or settings.APP_ENV != "production" else None,
            redoc_url="/api/redoc" if settings.DEBUG or settings.APP_ENV != "production" else None,
            openapi_url="/api/openapi.json" if settings.DEBUG or settings.APP_ENV != "production" else None,
            lifespan=lifespan,
        ),
        cors=CorsConfig(origins=settings.CORS_ORIGINS),
        register_routes=_register_service_routes,
        audit=AuditOptions(
            session_factory=AsyncSessionLocal,
            service_name=settings.SERVICE_NAME,
            begin_request=_begin_request_audit,
            collect_changes=collected_audit_changes,
            finish_request=reset_audit_context,
        ),
        after_response=_after_response,
    )


def _begin_request_audit(request: Request) -> object:
    return begin_audit_context(actor_id=request_actor_id(request))


async def _after_response(request: Request, response: Response) -> None:
    if should_invalidate_public_cache(request, response.status_code):
        await invalidate_prefix("public")


def _register_service_routes(app: FastAPI) -> None:

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
