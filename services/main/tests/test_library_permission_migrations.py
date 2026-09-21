import importlib.util
import os
from pathlib import Path
from uuid import uuid4

import pytest
import sqlalchemy as sa
from alembic.migration import MigrationContext
from alembic.operations import Operations
from sqlalchemy.ext.asyncio import create_async_engine
from ksu_contracts.roles import ALL_PERMISSIONS

from app.models import Permission


@pytest.mark.asyncio
async def test_library_catalog_migrations_are_replayable_without_grants_or_reactivation(monkeypatch):
    url = os.environ.get("KSU_TEST_DATABASE_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_DATABASE_URL required")
    schema = "library_catalog_" + uuid4().hex
    engine = create_async_engine(url, pool_size=1, max_overflow=0)
    root = Path(__file__).parents[1] / "migrations/versions"
    migrations = []
    for filename in ("20260907_0018_library_transfer.py", "20260907_0019_library_assistant_authority.py", "20260907_0020_library_conversation_authority.py"):
        spec = importlib.util.spec_from_file_location(filename[:-3], root / filename)
        migration = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(migration)
        migrations.append(migration)
    try:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"CREATE SCHEMA {schema}"))
            await conn.execute(sa.text(f"SET LOCAL search_path TO {schema}"))
            await conn.run_sync(Permission.__table__.create)
            # Synthetic existing reviewed state must survive replay and downgrade.
            existing_id = uuid4()
            await conn.execute(sa.insert(Permission).values(id=existing_id, name="library.transfer", is_active=False, description="Reviewed disabled"))
            await conn.execute(sa.text("CREATE TABLE role_permissions (role_id uuid, permission_id uuid)"))
            await conn.execute(sa.text("INSERT INTO role_permissions VALUES (:role, :permission)"), {"role": uuid4(), "permission": existing_id})
            for index, migration in enumerate(migrations):
                if index:
                    assert migration.down_revision == migrations[index - 1].revision
                def upgrade(sync):
                    monkeypatch.setattr(migration, "op", Operations(MigrationContext.configure(sync)))
                    migration.upgrade()
                    migration.upgrade()
                await conn.run_sync(upgrade)
            rows = (await conn.execute(sa.select(Permission.name, Permission.resource, Permission.action))).all()
            assert len(rows) == 8
            assert all(row.name in ALL_PERMISSIONS for row in rows)
            assert all(row.name == f"{row.resource}.{row.action}" for row in rows if row.name != "library.transfer")
            assert await conn.scalar(sa.select(Permission.is_active).where(Permission.id == existing_id)) is False
            assert await conn.scalar(sa.text("SELECT count(*) FROM role_permissions")) == 1
            for migration in reversed(migrations):
                await conn.run_sync(lambda _: migration.downgrade())
            assert await conn.scalar(sa.select(sa.func.count()).select_from(Permission)) == 8
            assert await conn.scalar(sa.text("SELECT count(*) FROM role_permissions")) == 1
            await conn.execute(sa.text(f"DROP SCHEMA {schema} CASCADE"))
    finally:
        await engine.dispose()
