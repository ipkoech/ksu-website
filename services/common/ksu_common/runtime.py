"""FastAPI application runtime assembled from service-owned configuration."""

from __future__ import annotations

import inspect
import logging
import os
import re
from collections.abc import Awaitable, Callable, Sequence
from contextlib import AbstractAsyncContextManager
from dataclasses import dataclass
from typing import Any

from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError

from .audit import (
    build_audit_payload,
    is_anonymous_read,
    persist_audit_log,
    persist_audit_payload,
    should_skip_audit,
)
from .cache import begin_cache_context, end_cache_context, get_cache_context
from .database import DatabaseBudgetRegistry, DatabaseConcurrencyLimitExceeded
from .errors import (
    AccessDenied,
    ApplicationError,
    AuthenticationRequired,
    Conflict,
    InvalidInput,
    ResourceNotFound,
    TemporarilyUnavailable,
)
from .field_selection import is_sensitive_field
from .observability import (
    CompositeMetricsSink,
    Metrics,
    MetricsSink,
    PrometheusMetricsRegistry,
    begin_request_observation,
    complete_request_observation,
    end_request_observation,
    get_prometheus_registry,
)
from .response_validation import (
    StrictResponseValidationRoute,
    allow_response_model_exemption,
    enforce_response_model_coverage,
    install_strict_response_validation,
)

logger = logging.getLogger("ksu_common.runtime")

STANDARD_CORS_METHODS = ("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
STANDARD_CORS_HEADERS = (
    "Authorization",
    "Content-Type",
    "Idempotency-Key",
    "X-Internal-Key",
)

RouteRegistrar = Callable[[FastAPI], None]
AfterResponse = Callable[[Request, Response], Awaitable[None] | None]
Lifespan = Callable[[FastAPI], AbstractAsyncContextManager[None]]

_BEARER_EXCEPTION_TEXT = re.compile(r"(?i)\b(bearer)\s+[^\s,;]+")
_SENSITIVE_EXCEPTION_TEXT = re.compile(
    r"(?i)((?:authorization|x-internal-key|x-internal-api-key|api[_-]?key|token|secret|password)\s*[:=]\s*(?:bearer\s+)?)\S+"
)


def _safe_exception_detail(exc: BaseException) -> str:
    """Keep useful audit detail without persisting obvious credential values."""

    detail = _BEARER_EXCEPTION_TEXT.sub(r"\1 [REDACTED]", str(exc))
    return _SENSITIVE_EXCEPTION_TEXT.sub(r"\1[REDACTED]", detail)


@dataclass(frozen=True)
class ServiceAppConfig:
    service_name: str
    title: str
    version: str
    description: str | None = None
    debug: bool = False
    docs_url: str | None = "/docs"
    redoc_url: str | None = "/redoc"
    openapi_url: str | None = "/openapi.json"
    lifespan: Lifespan | None = None
    default_response_class: type[Response] | None = None
    error_response_class: type[Response] | None = None
    metrics_path: str | None = "/metrics"
    environment: str | None = None
    strict_response_model_validation: bool | None = None
    response_model_missing_baseline: int = 0


@dataclass(frozen=True)
class CorsConfig:
    origins: Sequence[str]
    allow_credentials: bool = True
    methods: Sequence[str] = STANDARD_CORS_METHODS
    headers: Sequence[str] = STANDARD_CORS_HEADERS


@dataclass(frozen=True)
class AuditOptions:
    """Cross-cutting audit persistence with optional service-owned context hooks."""

    session_factory: Any
    service_name: str
    token_key: str | bytes
    token_algorithm: str
    token_issuer: str
    token_audience: str
    token_key_id: str
    audit_model: type[Any] | None = None
    skip_path: Callable[[str], bool] = should_skip_audit
    begin_request: Callable[[Request], object] | None = None
    collect_changes: Callable[[], dict[str, Any] | None] | None = None
    finish_request: Callable[[object], None] | None = None
    #: Hand the built payload to a background worker instead of writing it on
    #: the request path. Receives the JSON-serializable dict from
    #: :func:`build_audit_payload`. When None the write stays inline.
    dispatch: Callable[[dict[str, Any]], Awaitable[None] | None] | None = None
    #: Skip safe-method requests that carry no credential. Public reads are the
    #: bulk of traffic and auditing them turns every page view into a write.
    skip_anonymous_reads: bool = False
    #: Persist a built audit payload in the active business transaction.
    #: A service opting in must also provide durable background draining.
    capture: Callable[[Any, dict[str, Any]], Awaitable[None]] | None = None
    #: Legacy broker dispatchers can fall back to indexed local writes. Durable
    #: capture dispatchers disable this to avoid a second write on DB failure.
    inline_fallback: bool = True


async def _resolve_callback(value: Awaitable[Any] | Any) -> Any:
    if inspect.isawaitable(value):
        return await value
    return value


def create_service_app(
    config: ServiceAppConfig,
    *,
    cors: CorsConfig,
    register_routes: RouteRegistrar,
    audit: AuditOptions | None = None,
    after_response: AfterResponse | None = None,
    metrics_registry: PrometheusMetricsRegistry | None = None,
    metrics_sink: MetricsSink | None = None,
) -> FastAPI:
    """Build one service app while keeping all domain callbacks in that service."""

    app_options: dict[str, Any] = {
        "title": config.title,
        "version": config.version,
        "description": config.description,
        "debug": config.debug,
        "docs_url": config.docs_url,
        "redoc_url": config.redoc_url,
        "openapi_url": config.openapi_url,
        "lifespan": config.lifespan,
    }
    if config.default_response_class is not None:
        app_options["default_response_class"] = config.default_response_class
    app = FastAPI(**app_options)
    app.router.route_class = StrictResponseValidationRoute
    database_budget_registry = DatabaseBudgetRegistry.from_environment()
    registry = metrics_registry or get_prometheus_registry()
    sinks = [registry]
    if metrics_sink is not None:
        sinks.append(metrics_sink)
    http_metrics = Metrics(CompositeMetricsSink(*sinks))
    app.state.metrics_registry = registry
    app.state.metrics = http_metrics
    if audit and not audit.inline_fallback:
        http_metrics.increment("audit.capture_failure", 0, tags={"service": audit.service_name})

    if config.metrics_path:
        @app.get(config.metrics_path, include_in_schema=False)
        @allow_response_model_exemption("metrics", path=config.metrics_path)
        async def metrics_endpoint() -> Response:
            return Response(
                content=registry.render(),
                media_type="text/plain; version=0.0.4",
            )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(cors.origins),
        allow_credentials=cors.allow_credentials,
        allow_methods=list(cors.methods),
        allow_headers=list(cors.headers),
    )

    allowed_cookie_origins = {origin.rstrip("/") for origin in cors.origins}

    @app.middleware("http")
    async def protect_cookie_authenticated_writes(request: Request, call_next):
        """Reject cross-origin state changes that carry the auth cookie.

        Bearer clients remain usable without an Origin header. Browser cookie
        requests are additionally protected from CSRF beyond SameSite=Lax.
        """
        auth_cookies = ("ksu_access", "ksu_refresh", "access_token")
        if request.method not in {"GET", "HEAD", "OPTIONS"} and any(
            request.cookies.get(name) for name in auth_cookies
        ):
            origin = request.headers.get("origin")
            if (
                (origin is None and request.headers.get("sec-fetch-site") == "cross-site")
                or (origin is not None
                and "*" not in allowed_cookie_origins
                and origin.rstrip("/") not in allowed_cookie_origins)
            ):
                return JSONResponse(
                    status_code=status.HTTP_403_FORBIDDEN,
                    content={"status": "error", "message": "Untrusted request origin", "code": "csrf_origin"},
                )
        return await call_next(request)

    error_response_class = (
        config.error_response_class or config.default_response_class or JSONResponse
    )

    @app.exception_handler(RequestValidationError)
    async def request_validation_error_handler(_request: Request, exc: RequestValidationError) -> Response:
        errors = []
        for error in exc.errors():
            safe_error = dict(error)
            # Container-level failures can otherwise echo whole credential-bearing
            # bodies. Field locations/messages remain the legacy validation API.
            sensitive_location = any(
                isinstance(part, str) and is_sensitive_field(part) for part in error.get("loc", ())
            )
            if isinstance(error.get("input"), (dict, list, tuple)) or sensitive_location:
                safe_error.pop("input", None)
            if sensitive_location:
                safe_error.pop("ctx", None)
                rejected_value = error.get("input")
                message = str(error.get("msg", ""))
                echoes_value = isinstance(rejected_value, str) and bool(rejected_value) and (
                    rejected_value in message or repr(rejected_value)[1:-1] in message
                )
                if error.get("type") in {"value_error", "assertion_error"} and echoes_value:
                    safe_error["msg"] = "Invalid value for sensitive field"
            errors.append(safe_error)
        return error_response_class(status_code=422, content={"detail": jsonable_encoder(errors)})

    application_statuses = {
        InvalidInput: 400,
        AuthenticationRequired: 401,
        AccessDenied: 403,
        ResourceNotFound: 404,
        Conflict: 409,
        TemporarilyUnavailable: 503,
    }

    @app.exception_handler(ApplicationError)
    async def application_error_handler(_request: Request, exc: ApplicationError) -> Response:
        status_code = next(
            (code for kind, code in application_statuses.items() if isinstance(exc, kind)),
            500,
        )
        return error_response_class(
            status_code=status_code,
            content={"status": "error", "message": str(exc), "code": exc.code},
            headers={"WWW-Authenticate": "Bearer"} if status_code == 401 else None,
        )

    @app.exception_handler(ValueError)
    async def value_error_handler(_request: Request, exc: ValueError) -> Response:
        return error_response_class(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"status": "error", "message": str(exc), "code": "bad_request"},
        )

    @app.exception_handler(PermissionError)
    async def permission_error_handler(_request: Request, exc: PermissionError) -> Response:
        return error_response_class(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"status": "error", "message": str(exc), "code": "forbidden"},
        )

    register_routes(app)
    install_strict_response_validation(app.routes)
    configured_environment = config.environment or os.getenv("APP_ENV", "")
    is_production = configured_environment.strip().lower() == "production"
    strict_response_model_validation = (
        is_production
        if config.strict_response_model_validation is None
        else config.strict_response_model_validation
    )
    app.state.response_model_coverage = enforce_response_model_coverage(
        app.routes,
        production=strict_response_model_validation,
        baseline_missing=config.response_model_missing_baseline,
    )
    coverage = app.state.response_model_coverage
    coverage_tags = {"service": config.service_name}
    http_metrics.gauge("response_model_coverage.missing", len(coverage.missing), tags=coverage_tags)
    http_metrics.gauge(
        "response_model_coverage.nonconcrete", len(coverage.nonconcrete), tags=coverage_tags
    )
    http_metrics.gauge(
        "response_model_coverage.invalid_exemptions",
        len(coverage.invalid_exemptions),
        tags=coverage_tags,
    )
    http_metrics.gauge(
        "response_model_coverage.baseline_delta", coverage.baseline_delta, tags=coverage_tags
    )

    async def _write_audit(
        options: AuditOptions,
        request: Request,
        status_code: int,
        *,
        error_message: str | None = None,
    ) -> None:
        """Record one audit entry, off the request path when a dispatcher exists."""

        if status_code < 400 and request.scope.get("ksu.audit_committed"):
            return

        changes = options.collect_changes() if options.collect_changes else None
        if options.dispatch is None:
            if options.audit_model is None:
                raise RuntimeError("inline audit persistence requires audit_model")
            await persist_audit_log(
                options.session_factory,
                service_name=options.service_name,
                request=request,
                status_code=status_code,
                token_key=options.token_key,
                token_algorithm=options.token_algorithm,
                token_issuer=options.token_issuer,
                token_audience=options.token_audience,
                token_key_id=options.token_key_id,
                audit_model=options.audit_model,
                error_message=error_message,
                changes=changes,
            )
            return

        # Building the payload must happen here — the Request is gone afterwards.
        # Only the database write is handed off.
        payload = await build_audit_payload(
            service_name=options.service_name,
            request=request,
            status_code=status_code,
            token_key=options.token_key,
            token_algorithm=options.token_algorithm,
            token_issuer=options.token_issuer,
            token_audience=options.token_audience,
            token_key_id=options.token_key_id,
            error_message=error_message,
            changes=changes,
        )
        try:
            await _resolve_callback(options.dispatch(payload))
        except Exception as exc:  # a broker outage must not fail the request
            if not options.inline_fallback:
                http_metrics.increment("audit.capture_failure", tags={"service": options.service_name})
                logger.error("durable audit capture failed", extra={
                    "service": options.service_name, "exception_type": type(exc).__name__,
                })
                return
            logger.exception(
                "failed to dispatch audit entry for %s; falling back to inline write",
                payload.get("request_path"),
            )
            if options.audit_model is None:
                logger.error("audit dispatch failed and no inline audit model is configured")
            else:
                await persist_audit_payload(options.session_factory, payload, options.audit_model)

    # Register this last so body-limit middleware installed by route registrars
    # is inside the shared observation boundary. Header-only rejections still
    # receive correlation and latency headers and are timed consistently.
    @app.middleware("http")
    async def service_runtime_middleware(request: Request, call_next: Callable) -> Response:
        observation = begin_request_observation(request, service_name=config.service_name)
        audit_state: object | None = None
        audit_path_enabled = audit is not None and not audit.skip_path(request.url.path)
        audit_enabled = audit_path_enabled
        if audit_enabled and audit and audit.skip_anonymous_reads and is_anonymous_read(request):
            audit_enabled = False
        if audit_enabled and audit and audit.begin_request:
            audit_state = await _resolve_callback(audit.begin_request(request))

        if audit_enabled and audit and audit.capture:
            async def capture_in_transaction(session, route_request, response):
                # A trusted ingestion endpoint has already inserted the source
                # audit events in this transaction. Avoid auditing that transfer
                # again; the route marks coverage only after commit succeeds.
                if route_request.scope.get("ksu.audit_ingested"):
                    return
                payload = await build_audit_payload(
                    service_name=audit.service_name, request=route_request,
                    status_code=response.status_code, token_key=audit.token_key,
                    token_algorithm=audit.token_algorithm, token_issuer=audit.token_issuer,
                    token_audience=audit.token_audience, token_key_id=audit.token_key_id,
                    changes=audit.collect_changes() if audit.collect_changes else None,
                )
                await audit.capture(session, payload)

            request.scope["ksu.capture_audit"] = capture_in_transaction

        response: Response | None = None
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        error_type: str | None = None
        cache_context_token = begin_cache_context(request)
        try:
            try:
                async with database_budget_registry.for_path(request.url.path).limit():
                    response = await call_next(request)
                status_code = response.status_code
            except DatabaseConcurrencyLimitExceeded as exc:
                error_type = type(exc).__name__
                status_code = exc.status_code
                response = error_response_class(
                    status_code=status_code, content={"detail": exc.detail}, headers=exc.headers,
                )
            except Exception as exc:
                error_type = type(exc).__name__
                if audit_enabled and audit:
                    await _write_audit(
                        audit,
                        request,
                        status_code,
                        error_message=_safe_exception_detail(exc),
                    )
                raise

            if audit and (audit_enabled or (audit_path_enabled and status_code in {401, 403})):
                await _write_audit(audit, request, status_code)
            if after_response:
                await _resolve_callback(after_response(request, response))
            cache_status = (get_cache_context() or {}).get("status")
            if cache_status:
                response.headers["X-Cache"] = cache_status
            return response
        finally:
            if audit_enabled and audit and audit.finish_request:
                await _resolve_callback(audit.finish_request(audit_state))
            complete_request_observation(
                observation,
                response=response,
                status_code=status_code,
                error_type=error_type,
                metrics=(
                    None
                    if config.metrics_path and request.url.path == config.metrics_path
                    else http_metrics
                ),
                route=getattr(request.scope.get("route"), "path", None),
            )
            end_request_observation(observation)
            end_cache_context(cache_context_token)

    return app
