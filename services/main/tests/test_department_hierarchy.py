import asyncio
import os
from uuid import uuid4

import pytest
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.services.department_hierarchy import lock_hierarchy, require_no_active_children, validate_parent


@pytest.mark.asyncio
async def test_department_graph_serializes_opposite_moves_and_preserves_children():
    url = os.environ.get("KSU_TEST_DATABASE_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_DATABASE_URL required")
    schema = "department_graph_" + uuid4().hex
    engine = create_async_engine(url, pool_size=2, max_overflow=0,
                                 connect_args={"server_settings": {"search_path": f"{schema},public"}})
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    first, second, wing = uuid4(), uuid4(), uuid4()
    try:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"CREATE SCHEMA {schema}"))
            await conn.execute(sa.text("CREATE TABLE departments (id uuid PRIMARY KEY, parent_department_id uuid, school_id uuid, wing_id uuid, is_active boolean, deleted_at timestamptz)"))
            await conn.execute(sa.text("INSERT INTO departments (id, wing_id, is_active) VALUES (:id, :wing, true)"),
                               [{"id": first, "wing": wing}, {"id": second, "wing": wing}])

        async def move(identifier, parent):
            try:
                async with sessions.begin() as db:
                    await lock_hierarchy(db)
                    await validate_parent(db, identifier, {"parent_department_id": parent, "wing_id": wing})
                    await db.execute(sa.text("UPDATE departments SET parent_department_id=:parent WHERE id=:id"),
                                     {"id": identifier, "parent": parent})
                return True
            except ValueError:
                return False
        results = await asyncio.gather(move(first, second), move(second, first))
        assert results.count(True) == 1 and results.count(False) == 1
        async with sessions.begin() as db:
            parent = await db.scalar(sa.text("SELECT parent_department_id FROM departments WHERE parent_department_id IS NOT NULL"))
            with pytest.raises(ValueError, match="child departments"):
                await require_no_active_children(db, parent)
            with pytest.raises(ValueError, match="own parent"):
                await validate_parent(db, first, {"parent_department_id": first})
            with pytest.raises(ValueError, match="different organizational owner"):
                await validate_parent(db, uuid4(), {"parent_department_id": parent, "school_id": uuid4()})
            # Existing support sub-departments under the same wing remain valid.
            await validate_parent(db, uuid4(), {"parent_department_id": parent, "wing_id": wing, "department_type": "support"})
            await db.execute(sa.text("UPDATE departments SET is_active=false WHERE parent_department_id IS NOT NULL"))
            await require_no_active_children(db, parent)
            with pytest.raises(ValueError, match="organizational owner"):
                await require_no_active_children(db, parent, include_inactive=True)
    finally:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"DROP SCHEMA {schema} CASCADE"))
        await engine.dispose()
