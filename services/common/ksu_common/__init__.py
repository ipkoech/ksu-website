"""KSU shared utilities — imported by all microservices."""

from .auth import TokenPayload, get_current_user, get_optional_user
from .rbac import has_scope, requires_scope, get_role_scopes
from .pagination import PaginatedResult, paginate, parse_pagination_params
from .field_selection import (
    FieldSelection,
    FieldSelector,
    FieldsQuery,
    apply_field_selection,
    build_load_options,
    get_requested_relationships,
    parse_field_selection,
)
from .cache import (
    cached_public,
    cache_response,
    get_redis,
    close_redis,
    invalidate_cache,
    invalidate_prefix,
)
from .audit import AuditEntry, AuditLogger, audit_action, get_audit_logger, persist_audit_log, request_actor_id, should_skip_audit
from .rate_limit import (
    RateLimiter,
    RateLimitExceeded,
    install_request_body_limit_middleware,
    rate_limit,
    reset_rate_limit,
)
from .repository import BaseRepository
from .logging import configure_service_logging
from .authorization import (
    AuthorizationDecision,
    AuthorizationScope,
    authorize,
    authorize_exact_scope,
    authorize_permission,
)
from .config import (
    is_production_environment,
    validate_cors_origins,
    validate_environment,
    validate_explicit_production_settings,
    validate_secret,
    validate_service_url,
)
from .internal_client import (
    PooledIntegrationClient,
    close_integration_pool,
    get_integration_pool,
)
from .database import current_query_count, query_count_context
from .gemini import GeminiTransport, close_gemini_transports, get_gemini_transport
from .observability import (
    AuditEvent,
    CompositeMetricsSink,
    Metrics,
    PrometheusMetricsRegistry,
    Span,
    Tracer,
    audit_event,
    request_context,
    get_prometheus_registry,
)
from .reliability import (
    CircuitBreaker,
    IdempotencyStore,
    RetryPolicy,
    TimeoutConfig,
    retry_async,
)
from .responses import ErrorResponse, SuccessResponse, error, success
from .smtp import SmtpConfig, SmtpTransport
from .task_queue import (
    TaskQueueConfig,
    close_worker_async_runtime,
    create_celery_app,
    run_worker_async,
)

__all__ = [
    # Auth
    "TokenPayload",
    "get_current_user",
    "get_optional_user",
    # RBAC
    "has_scope",
    "requires_scope",
    "get_role_scopes",
    # Pagination
    "PaginatedResult",
    "paginate",
    "parse_pagination_params",
    # Field selection
    "FieldSelection",
    "FieldSelector",
    "FieldsQuery",
    "apply_field_selection",
    "build_load_options",
    "get_requested_relationships",
    "parse_field_selection",
    # Cache
    "cached_public",
    "cache_response",
    "get_redis",
    "close_redis",
    "invalidate_cache",
    "invalidate_prefix",
    # Audit
    "AuditEntry",
    "AuditLogger",
    "audit_action",
    "get_audit_logger",
    "persist_audit_log",
    "request_actor_id",
    "should_skip_audit",
    # Rate limiting
    "RateLimiter",
    "RateLimitExceeded",
    "install_request_body_limit_middleware",
    "rate_limit",
    "reset_rate_limit",
    # Repository
    "BaseRepository",
    # Logging
    "configure_service_logging",
    # Canonical platform interfaces
    "AuthorizationDecision",
    "AuthorizationScope",
    "authorize",
    "authorize_exact_scope",
    "authorize_permission",
    "is_production_environment",
    "validate_cors_origins",
    "validate_environment",
    "validate_explicit_production_settings",
    "validate_secret",
    "validate_service_url",
    "PooledIntegrationClient",
    "get_integration_pool",
    "close_integration_pool",
    "current_query_count",
    "query_count_context",
    "GeminiTransport",
    "get_gemini_transport",
    "close_gemini_transports",
    "Metrics",
    "CompositeMetricsSink",
    "PrometheusMetricsRegistry",
    "get_prometheus_registry",
    "Span",
    "Tracer",
    "AuditEvent",
    "audit_event",
    "request_context",
    "CircuitBreaker",
    "IdempotencyStore",
    "RetryPolicy",
    "TimeoutConfig",
    "retry_async",
    "SuccessResponse",
    "ErrorResponse",
    "success",
    "error",
    "SmtpConfig",
    "SmtpTransport",
    "TaskQueueConfig",
    "close_worker_async_runtime",
    "create_celery_app",
    "run_worker_async",
]
