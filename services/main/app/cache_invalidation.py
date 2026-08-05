"""Policy for invalidating cached public API responses after writes."""

from fastapi import Request


PUBLIC_CACHE_INVALIDATION_METHODS = {"POST", "PUT", "PATCH", "DELETE"}
PUBLIC_CACHE_INVALIDATION_EXCLUDED_PREFIXES = (
    "/api/v1/analytics",
    "/api/v1/auth",
    "/api/v1/notifications",
)


def should_invalidate_public_cache(request: Request, status_code: int) -> bool:
    if request.method not in PUBLIC_CACHE_INVALIDATION_METHODS:
        return False
    if status_code >= 400:
        return False

    path = request.url.path
    if not path.startswith("/api/v1/"):
        return False
    return not path.startswith(PUBLIC_CACHE_INVALIDATION_EXCLUDED_PREFIXES)
