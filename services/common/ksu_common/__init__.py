"""KSU shared utilities — imported by all microservices."""

from .audit import (
    AuditEntry,
    AuditLogger,
    audit_action,
    get_audit_logger,
    persist_audit_log,
    request_actor_id,
    should_skip_audit,
)
from .auth import TokenPayload, UserDependencies, build_user_dependencies
from .cache import (
    cache_response,
    cached_public,
    close_redis,
    get_redis,
    invalidate_cache,
    invalidate_prefix,
)
from .config import (
    is_production_environment,
    validate_cors_origins,
    validate_environment,
    validate_explicit_production_settings,
    validate_secret,
    validate_service_url,
)
from .database import (
    DatabaseBudgetRegistry,
    DatabaseBudgetRule,
    DatabaseConcurrencyLimitExceeded,
    DatabaseRequestBudget,
    QueryBudgetExceeded,
    current_query_count,
    query_budget_context,
    query_count_context,
)
from .field_selection import (
    FieldSelection,
    FieldSelector,
    FieldsQuery,
    apply_field_selection,
    build_load_options,
    get_requested_relationships,
    parse_field_selection,
)
from .gemini import GeminiTransport, close_gemini_transports, get_gemini_transport
from .internal_client import (
    PooledIntegrationClient,
    close_integration_pool,
    get_integration_pool,
)
from .logging import configure_service_logging
from .observability import (
    AuditEvent,
    CompositeMetricsSink,
    Metrics,
    PrometheusMetricsRegistry,
    Span,
    Tracer,
    audit_event,
    get_prometheus_registry,
    request_context,
)
from .pagination import PaginatedResult, paginate
from .rate_limit import (
    RateLimiter,
    RateLimitExceeded,
    RateLimitUnavailable,
    install_request_body_limit_middleware,
    rate_limit,
    reset_rate_limit,
)
from .rbac import (
    AuthorizationDecision,
    AuthorizationScope,
    authorize,
    authorize_permission,
    build_scope_dependency,
    get_role_scopes,
    has_scope,
)
from .reliability import (
    CircuitBreaker,
    RetryPolicy,
    TimeoutConfig,
)
from .schemas.responses import ErrorResponse, SuccessResponse, error, success
from .smtp import SmtpConfig, SmtpTransport
from .task_queue import (
    TaskQueueConfig,
    close_worker_async_runtime,
    create_celery_app,
    run_worker_async,
)
from .worker_metrics import (
    MultiprocessMetricsSink,
    QueueDepthCollector,
    WorkerMetricsConfig,
    mark_worker_process_dead,
    start_worker_metrics_server,
    stop_worker_metrics_server,
    worker_metrics_config_from_environment,
)

__all__ = [
    # Auth
    "TokenPayload",
    "UserDependencies",
    "build_user_dependencies",
    # RBAC
    "has_scope",
    "build_scope_dependency",
    "get_role_scopes",
    # Pagination
    "PaginatedResult",
    "paginate",
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
    "RateLimitUnavailable",
    "install_request_body_limit_middleware",
    "rate_limit",
    "reset_rate_limit",
    # Logging
    "configure_service_logging",
    # Canonical platform interfaces
    "AuthorizationDecision",
    "AuthorizationScope",
    "authorize",
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
    "query_budget_context",
    "query_count_context",
    "DatabaseBudgetRegistry",
    "DatabaseBudgetRule",
    "DatabaseConcurrencyLimitExceeded",
    "DatabaseRequestBudget",
    "QueryBudgetExceeded",
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
    "RetryPolicy",
    "TimeoutConfig",
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
    "MultiprocessMetricsSink",
    "QueueDepthCollector",
    "WorkerMetricsConfig",
    "mark_worker_process_dead",
    "start_worker_metrics_server",
    "stop_worker_metrics_server",
    "worker_metrics_config_from_environment",
]
