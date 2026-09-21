import importlib.util
import os
from pathlib import Path
from uuid import uuid4

import pytest
import sqlalchemy as sa
from alembic.migration import MigrationContext
from alembic.operations import Operations
from sqlalchemy.ext.asyncio import create_async_engine


@pytest.mark.asyncio
@pytest.mark.parametrize("filename,expected", [
    ("20260907_0021_heri_editorial_authority.py", ["heri.content.approve", "heri.content.schedule", "heri.content.unpublish"]),
    ("20260907_0022_heri_integration_authority.py", ["heri.integrations.sync"]),
])
async def test_heri_capability_registration_is_repeatable_and_non_assigning(filename, expected):
    url = os.environ.get("KSU_TEST_DATABASE_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_DATABASE_URL required")
    schema = "heri_permissions_" + uuid4().hex
    engine = create_async_engine(url, connect_args={"server_settings": {"search_path": f"{schema},public"}})
    path = Path(__file__).parents[1] / "migrations/versions" / filename
    spec = importlib.util.spec_from_file_location("heri_permission_migration", path)
    migration = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(migration)
    try:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"CREATE SCHEMA {schema}"))
            await conn.execute(sa.text("CREATE TABLE permissions (id uuid PRIMARY KEY, name text UNIQUE, "
                                       "description text, resource text, action text, is_active boolean)"))
            def run(connection):
                migration.op = Operations(MigrationContext.configure(connection))
                migration.upgrade()
                migration.upgrade()
                migration.downgrade()
            await conn.run_sync(run)
            names = (await conn.execute(sa.text("SELECT name FROM permissions ORDER BY name"))).scalars().all()
            assert names == expected
    finally:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"DROP SCHEMA IF EXISTS {schema} CASCADE"))
        await engine.dispose()
