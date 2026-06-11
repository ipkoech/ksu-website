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
from .audit import AuditEntry, AuditLogger, audit_action, get_audit_logger, persist_audit_log, should_skip_audit
from .rate_limit import RateLimiter, RateLimitExceeded, rate_limit, reset_rate_limit
from .repository import BaseRepository
from .logging import configure_service_logging

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
    "should_skip_audit",
    # Rate limiting
    "RateLimiter",
    "RateLimitExceeded",
    "rate_limit",
    "reset_rate_limit",
    # Repository
    "BaseRepository",
    # Logging
    "configure_service_logging",
]
