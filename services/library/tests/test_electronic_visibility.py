import asyncio
import os
import time
from uuid import uuid4

import pytest
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.models import ElectronicResource, ElectronicResourceGuide, Library
from app.schemas import ElectronicResourceUpdate
from app.services.electronic import get_guide_library_id, get_resource, list_guides, update_resource
from app.services.ownership import lock_owner, validate_transfer_destination
from app.core.auth import require_library_transfer
from ksu_common.auth import TokenPayload
from fastapi import HTTPException


@pytest.mark.asyncio
async def test_private_electronic_editing_and_nested_guide_relationships():
    url = os.environ.get("KSU_TEST_DATABASE_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_DATABASE_URL required")
    schema = "electronic_visibility_" + uuid4().hex
    engine = create_async_engine(url, execution_options={"schema_translate_map": {"library": schema}})
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    resource_id, guide_id = uuid4(), uuid4()
    try:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"CREATE SCHEMA {schema}"))
            for model in (Library, ElectronicResource, ElectronicResourceGuide):
                await conn.run_sync(model.__table__.create)
        async with sessions.begin() as db:
            await db.execute(sa.insert(ElectronicResource).values(
                id=resource_id, name="Database", slug="database", section_letter="D",
                access_url="https://example.org", is_active=False,
            ))
            await db.execute(sa.insert(ElectronicResourceGuide).values(
                id=guide_id, electronic_resource_id=resource_id, title="Guide", is_active=False,
            ))
        async with sessions.begin() as db:
            with pytest.raises(ValueError, match="not found"):
                await get_resource(db, resource_id)
            assert (await get_resource(db, resource_id, public_only=False)).id == resource_id
            assert await list_guides(db, resource_id) == []
            assert [guide.id for guide in await list_guides(db, resource_id, public_only=False)] == [guide_id]
            # A NULL branch is a real central resource, not a missing join result.
            assert await get_guide_library_id(db, guide_id, resource_id=resource_id) is None
            with pytest.raises(ValueError, match="this resource"):
                await get_guide_library_id(db, guide_id, resource_id=uuid4())
            await update_resource(db, resource_id, ElectronicResourceUpdate(is_active=True))
            assert (await get_resource(db, resource_id)).id == resource_id
            assert await list_guides(db, resource_id) == []
            await db.execute(sa.update(ElectronicResource).values(deleted_at=sa.func.now()))
            with pytest.raises(ValueError, match="this resource"):
                await get_guide_library_id(db, guide_id, resource_id=resource_id)
        branches = [uuid4() for _ in range(3)]
        async with sessions.begin() as db:
            for index, branch in enumerate(branches):
                await db.execute(sa.insert(Library).values(id=branch, name=f"Branch {index}", slug=f"branch-{index}"))
            await db.execute(sa.update(ElectronicResource).values(deleted_at=None, library_id=branches[0]))
        ready = asyncio.Event()
        count = 0
        async def transfer(target):
            nonlocal count
            try:
                async with sessions.begin() as db:
                    record = await get_resource(db, resource_id, public_only=False)
                    assert record.library_id == branches[0]
                    count += 1
                    if count == 2:
                        ready.set()
                    await ready.wait()
                    await lock_owner(db, record)
                    actor = TokenPayload("actor", "session", raw={
                        "scope_grants": [{"scope_type": "library", "scope_id": str(branch),
                                          "permissions": ["library.transfer"]} for branch in (branches[0], target)],
                        "mfa_enabled": True, "mfa_verified_at": time.time(),
                    })
                    require_library_transfer(actor, record.library_id, target)
                    await validate_transfer_destination(db, record.library_id, target)
                    record.library_id = target
                return "transferred"
            except HTTPException as exc:
                assert exc.status_code == 403
                return "denied"
        results = await asyncio.wait_for(asyncio.gather(*(transfer(branch) for branch in branches[1:])), 10)
        assert sorted(results) == ["denied", "transferred"]
        async with sessions.begin() as db:
            await db.execute(sa.update(Library).where(Library.id == branches[0]).values(is_active=False))
            with pytest.raises(ValueError, match="active library branch"):
                await validate_transfer_destination(db, branches[1], branches[0])
    finally:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"DROP SCHEMA {schema} CASCADE"))
        await engine.dispose()
