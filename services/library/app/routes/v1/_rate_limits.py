"""Library route-level abuse-control budgets."""

from ksu_common.rate_limit import rate_limit

from ...core.config import get_settings

settings = get_settings()

public_catalog_rate_limit = rate_limit(
    requests=settings.PUBLIC_CATALOG_RATE_LIMIT_COUNT,
    window=settings.PUBLIC_CATALOG_RATE_LIMIT_WINDOW_SECONDS,
    by_user=True,
    prefix="library:public-catalog:user-or-ip",
)
health_rate_limit = rate_limit(
    requests=settings.HEALTH_RATE_LIMIT_COUNT,
    window=settings.HEALTH_RATE_LIMIT_WINDOW_SECONDS,
    prefix="library:health:ip",
)
