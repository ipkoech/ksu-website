import os
import uuid

import pytest
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from ksu_common.audit_outbox import limit_audit_transaction


@pytest.mark.asyncio
@pytest.mark.parametrize("finish", ["commit", "rollback"])
async def test_audit_ownership_skips_overlap_and_releases_at_transaction_end(finish):
    url = os.environ.get("KSU_TEST_DATABASE_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_DATABASE_URL required")
    engine = create_async_engine(url, pool_size=2, max_overflow=0)
    factory = async_sessionmaker(engine)
    key = "audit.ownership.probe." + uuid.uuid4().hex
    try:
        async with factory() as first, factory() as second:
            assert await limit_audit_transaction(first, owner_key=key)
            assert not await limit_audit_transaction(second, owner_key=key)
            # Different jobs do not block one another on the same database.
            assert await limit_audit_transaction(second, owner_key=key + ".other")
            assert await first.scalar(sa.text("SHOW lock_timeout")) == "1s"
            assert await first.scalar(sa.text("SHOW statement_timeout")) == "5s"
            await getattr(first, finish)()
            assert await limit_audit_transaction(second, owner_key=key)
            await second.rollback()
            assert await limit_audit_transaction(first, owner_key=key)
    finally:
        await engine.dispose()
