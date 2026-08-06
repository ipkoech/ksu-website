from __future__ import annotations

import asyncio
from logging.config import fileConfig
from typing import Any

from alembic import context
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import get_settings
from app.models import Base

config = context.config
if config.config_file_name:
    fileConfig(config.config_file_name)

settings = get_settings()
target_metadata = Base.metadata
target_schema = settings.DB_SCHEMA


def _include_name(name: str | None, type_: str, parent_names: dict[str, str | None]) -> bool:
    if type_ == "schema":
        return name == target_schema
    if type_ == "table":
        return parent_names.get("schema_name") == target_schema
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
        version_table_schema=target_schema,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    engine = create_async_engine(settings.DATABASE_URL)
    async with engine.connect() as connection:
        async with connection.begin():
            await connection.run_sync(
                lambda sync: context.configure(
                    connection=sync,
                    target_metadata=target_metadata,
                    include_schemas=True,
                    compare_type=True,
                    compare_server_default=True,
                    include_name=_include_name,
                    include_object=_include_object,
                    process_revision_directives=_process_revision_directives,
                    version_table_schema=target_schema,
                )
            )
            await connection.run_sync(lambda _: context.run_migrations())
    await engine.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
