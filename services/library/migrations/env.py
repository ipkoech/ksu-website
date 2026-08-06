"""Alembic env.py for the Library service."""

from __future__ import annotations

import asyncio
from logging.config import fileConfig
from typing import Any

from alembic import context
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import get_settings

# Importing the package registers every mapped class on Base.metadata. Do not
# list model names here: a hand-maintained list silently drifts, and a model
# missing from it is invisible to autogenerate — or worse, looks like a table
# that should be dropped. app/models/__init__.py is the single source of truth.
from app.models import Base

config = context.config
if config.config_file_name:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata
settings = get_settings()

TARGET_SCHEMA = settings.DB_SCHEMA or "library"


def _include_name(name: str | None, type_: str, parent_names: dict[str, str | None]) -> bool:
    """Keep autogenerate inside this service's own schema.

    Every service shares one database, so reflection with include_schemas=True
    sees main, research and heri tables too. Without this filter they are absent
    from target_metadata and autogenerate proposes dropping them.
    """
    if type_ == "schema":
        return name == TARGET_SCHEMA
    if type_ == "table":
        return parent_names.get("schema_name") == TARGET_SCHEMA
    return True


def _include_object(
    object_: Any,
    name: str | None,
    type_: str,
    reflected: bool,
    compare_to: Any,
) -> bool:
    """Filter objects during autogenerate."""
    return not (type_ == "table" and name == "alembic_version")


def _process_revision_directives(context_, revision, directives) -> None:
    """Skip writing empty autogenerate revisions."""
    cmd_opts = getattr(config, "cmd_opts", None)
    if not getattr(cmd_opts, "autogenerate", False):
        return
    if not directives:
        return
    script = directives[0]
    if script.upgrade_ops.is_empty():
        directives[:] = []
        print("No schema changes detected.")


def run_migrations_offline() -> None:
    context.configure(
        url=settings.DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        include_schemas=True,
        compare_type=True,
        compare_server_default=True,
        include_name=_include_name,
        include_object=_include_object,
        process_revision_directives=_process_revision_directives,
        version_table_schema=TARGET_SCHEMA,
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
                compare_type=True,
                compare_server_default=True,
                include_name=_include_name,
                include_object=_include_object,
                process_revision_directives=_process_revision_directives,
                version_table_schema=TARGET_SCHEMA,
            )
        )
        async with conn.begin():
            await conn.run_sync(lambda _: context.run_migrations())
    await engine.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
