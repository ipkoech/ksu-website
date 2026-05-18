"""Alembic env.py for the Library service."""

from __future__ import annotations

import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import get_settings
from app.models import (  # noqa: F401 — registers all mapped classes with Base.metadata
    Base,
    ElectronicResource,
    ElectronicResourceGuide,
    Library,
    LibraryCharge,
    LibraryExternalLink,
    LibraryFile,
    LibraryHours,
    LibraryInquiry,
    LibraryLoan,
    LibraryRegulation,
    LibraryResource,
    LibraryResourceReservation,
    LibraryService,
    LibraryStaff,
    LibraryStatistics,
    SavedPublication,
    SupportTicket,
)

config = context.config
if config.config_file_name:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

settings = get_settings()


def run_migrations_offline() -> None:
    context.configure(
        url=settings.DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        include_schemas=True,
        version_table_schema=settings.DB_SCHEMA,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    engine = create_async_engine(settings.DATABASE_URL)
    async with engine.connect() as conn:
        await conn.run_sync(
            lambda sync_conn: context.configure(
                connection=sync_conn,
                target_metadata=target_metadata,
                include_schemas=True,
                version_table_schema=settings.DB_SCHEMA,
            )
        )
        async with conn.begin():
            await conn.run_sync(lambda _: context.run_migrations())
    await engine.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
