from __future__ import annotations

from ksu_common.database import DatabaseConfig, create_database_runtime

from .config import get_settings

settings = get_settings()
database = create_database_runtime(
    DatabaseConfig(
        url=settings.DATABASE_URL,
        pool_size=settings.DB_POOL_SIZE,
        max_overflow=settings.DB_MAX_OVERFLOW,
    )
)
engine = database.engine
AsyncSessionLocal = database.session_factory
get_db = database.session
