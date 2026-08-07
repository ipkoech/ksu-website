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
from ksu_common.security import decode_key_material
from sqlalchemy import select

from .api.v1 import register_routes
from .cache_invalidation import should_invalidate_public_cache
from .core.config import get_settings
from .core.database import AsyncSessionLocal
from .helpers.storage import normalize_storage_path
from .helpers.email import close_email_transport
from .models import Media
from .realtime.connection_manager import manager
from .realtime.redis_subscriber import subscriber
from .services.change_tracking import (
    begin_audit_context,
    collected_audit_changes,
    reset_audit_context,
)
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
    await subscriber.start()
    try:
        yield
    finally:
        await subscriber.stop()
        await manager.close_all()
        await close_email_transport()
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
            response_model_missing_baseline=742,
            lifespan=lifespan,
        ),
        cors=CorsConfig(origins=settings.CORS_ORIGINS),
        register_routes=_register_service_routes,
        audit=AuditOptions(
            session_factory=AsyncSessionLocal,
            service_name=settings.SERVICE_NAME,
            token_key=token_public_key,
            token_algorithm=settings.JWT_ALGORITHM,
            token_issuer=settings.JWT_ISSUER,
            token_audience=settings.JWT_AUDIENCE,
            token_key_id=settings.JWT_KEY_ID,
            begin_request=_begin_request_audit,
            collect_changes=collected_audit_changes,
            finish_request=reset_audit_context,
            dispatch=dispatch_audit,
            skip_anonymous_reads=True,
        ),
        after_response=_after_response,
    )


def _begin_request_audit(request: Request) -> object:
    return begin_audit_context(
        actor_id=request_actor_id(
            request,
            token_key=token_public_key,
            token_algorithm=settings.JWT_ALGORITHM,
            token_issuer=settings.JWT_ISSUER,
            token_audience=settings.JWT_AUDIENCE,
            token_key_id=settings.JWT_KEY_ID,
        )
    )


async def _after_response(request: Request, response: Response) -> None:
    if (override_status := getattr(request.state, "main_idempotency_status", None)) is not None:
        response.status_code = override_status
        if override_status == status.HTTP_204_NO_CONTENT:
            response.body = b""
            response.headers.pop("content-length", None)
        if retry_after := getattr(request.state, "main_idempotency_retry_after", None):
            response.headers["Retry-After"] = retry_after
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

        # Authorization already happened above. Hand the byte streaming to the
        # gateway when it is in front of us so a page full of images does not
        # occupy a worker and a pooled connection per file.
        if redirect_prefix := settings.MEDIA_INTERNAL_REDIRECT_PREFIX:
            return Response(
                status_code=status.HTTP_200_OK,
                media_type=media.mime_type,
                headers={
                    "X-Accel-Redirect": f"{redirect_prefix.rstrip('/')}/{normalized_path}",
                },
            )

        return FileResponse(file_path, media_type=media.mime_type)

    register_routes(app)
