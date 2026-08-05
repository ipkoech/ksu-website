"""FastAPI application runtime assembled from service-owned configuration."""

from __future__ import annotations

import inspect
import os
import re
from collections.abc import Awaitable, Callable, Sequence
from contextlib import AbstractAsyncContextManager
from dataclasses import dataclass
from typing import Any

from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .audit import persist_audit_log, should_skip_audit
from .cache import begin_cache_context, end_cache_context, get_cache_context
from .database import DatabaseBudgetRegistry
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

STANDARD_CORS_METHODS = ("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
STANDARD_CORS_HEADERS = ("Authorization", "Content-Type", "X-Internal-Key")

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
    skip_path: Callable[[str], bool] = should_skip_audit
    begin_request: Callable[[Request], object] | None = None
    collect_changes: Callable[[], dict[str, Any] | None] | None = None
    finish_request: Callable[[object], None] | None = None


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

    error_response_class = (
        config.error_response_class or config.default_response_class or JSONResponse
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

    # Register this last so body-limit middleware installed by route registrars
    # is inside the shared observation boundary. Header-only rejections still
    # receive correlation and latency headers and are timed consistently.
    @app.middleware("http")
    async def service_runtime_middleware(request: Request, call_next: Callable) -> Response:
        observation = begin_request_observation(request, service_name=config.service_name)
        audit_state: object | None = None
        audit_enabled = audit is not None and not audit.skip_path(request.url.path)
        if audit_enabled and audit and audit.begin_request:
            audit_state = await _resolve_callback(audit.begin_request(request))

        response: Response | None = None
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        error_type: str | None = None
        cache_context_token = begin_cache_context(request)
        try:
            try:
                async with database_budget_registry.for_path(request.url.path).limit():
                    response = await call_next(request)
                status_code = response.status_code
            except Exception as exc:
                error_type = type(exc).__name__
                if audit_enabled and audit:
                    changes = audit.collect_changes() if audit.collect_changes else None
                    await persist_audit_log(
                        audit.session_factory,
                        service_name=audit.service_name,
                        request=request,
                        status_code=status_code,
                        error_message=_safe_exception_detail(exc),
                        changes=changes,
                    )
                raise

            if audit_enabled and audit:
                changes = audit.collect_changes() if audit.collect_changes else None
                await persist_audit_log(
                    audit.session_factory,
                    service_name=audit.service_name,
                    request=request,
                    status_code=status_code,
                    changes=changes,
                )
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
