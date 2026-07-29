"""Alembic env.py for the Main Site service."""

from __future__ import annotations

import asyncio
from logging.config import fileConfig
from typing import Any

from alembic import context
from alembic.script import ScriptDirectory
from sqlalchemy import inspect, text
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import get_settings
from app.models import Base

config = context.config
if config.config_file_name:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata
settings = get_settings()
BOOTSTRAP_MARKER_TABLE = "_ksu_fresh_schema_bootstrap"


def _include_object(
    object_: Any,
    name: str | None,
    type_: str,
    reflected: bool,
    compare_to: Any,
) -> bool:
    """Filter objects during autogenerate.

    Keep the schema diff focused on application-managed objects and avoid
    generating noise for Alembic's own version table.
    """
    if type_ == "table" and name in {
        "alembic_version",
        BOOTSTRAP_MARKER_TABLE,
    }:
        return False
    return True


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


def _version_table_schema() -> str | None:
    """Use a version table schema only when explicitly non-public."""
    schema = (settings.DB_SCHEMA or "").strip()
    if not schema or schema == "public":
        return None
    return schema


def run_migrations_offline() -> None:
    context.configure(
        url=settings.DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        include_schemas=True,
        compare_type=True,
        compare_server_default=True,
        include_object=_include_object,
        process_revision_directives=_process_revision_directives,
        version_table_schema=_version_table_schema(),
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    engine = create_async_engine(settings.DATABASE_URL)
    async with engine.connect() as conn:
        version_schema = _version_table_schema()
        async with conn.begin():
            if version_schema:
                await conn.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{version_schema}"'))
                await conn.execute(text(f'SET search_path TO "{version_schema}", public'))
            marker_exists = await conn.run_sync(
                lambda sync_conn: inspect(sync_conn).has_table(
                    BOOTSTRAP_MARKER_TABLE,
                    schema=version_schema,
                )
            )
            target_revision = getattr(
                getattr(config, "cmd_opts", None),
                "revision",
                None,
            )
            if marker_exists and target_revision == "base":
                await conn.run_sync(
                    lambda sync_conn: target_metadata.drop_all(bind=sync_conn)
                )
                qualified_marker = (
                    f'"{version_schema}"."{BOOTSTRAP_MARKER_TABLE}"'
                    if version_schema
                    else BOOTSTRAP_MARKER_TABLE
                )
                qualified_version_table = (
                    f'"{version_schema}"."alembic_version"'
                    if version_schema
                    else "alembic_version"
                )
                await conn.execute(text(f"DROP TABLE {qualified_marker}"))
                await conn.execute(text(f"DROP TABLE {qualified_version_table}"))
                return
            is_empty = await conn.run_sync(
                lambda sync_conn: not inspect(sync_conn).get_table_names(
                    schema=version_schema
                )
            )
            if is_empty:
                await conn.run_sync(
                    lambda sync_conn: target_metadata.create_all(bind=sync_conn)
                )
                head = ScriptDirectory.from_config(config).get_current_head()
                if head is None:
                    raise RuntimeError("Main migration history has no head revision")
                qualified_version_table = (
                    f'"{version_schema}"."alembic_version"'
                    if version_schema
                    else "alembic_version"
                )
                await conn.execute(
                    text(
                        f"CREATE TABLE {qualified_version_table} "
                        "(version_num VARCHAR(32) NOT NULL PRIMARY KEY)"
                    )
                )
                await conn.execute(
                    text(
                        f"INSERT INTO {qualified_version_table} (version_num) "
                        "VALUES (:head)"
                    ),
                    {"head": head},
                )
                qualified_marker = (
                    f'"{version_schema}"."{BOOTSTRAP_MARKER_TABLE}"'
                    if version_schema
                    else BOOTSTRAP_MARKER_TABLE
                )
                await conn.execute(
                    text(
                        f"CREATE TABLE {qualified_marker} "
                        "(bootstrapped_at TIMESTAMP WITH TIME ZONE "
                        "NOT NULL DEFAULT CURRENT_TIMESTAMP)"
                    )
                )
            else:
                await conn.run_sync(
                    lambda sync_conn: context.configure(
                        connection=sync_conn,
                        target_metadata=target_metadata,
                        include_schemas=True,
                        compare_type=True,
                        compare_server_default=True,
                        include_object=_include_object,
                        process_revision_directives=_process_revision_directives,
                        version_table_schema=version_schema,
                    )
                )
                await conn.run_sync(lambda _: context.run_migrations())
    await engine.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
