import asyncio
from datetime import datetime, timedelta, timezone
import os
import uuid

import pytest
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from ksu_common.audit_outbox import limit_audit_transaction, prune_audit_batch


def test_retention_skips_competing_claims_and_rolls_back():
    url = os.environ.get("KSU_TEST_DATABASE_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_DATABASE_URL required")

    async def exercise():
        class Base(DeclarativeBase):
            pass

        class Audit(Base):
            __tablename__ = "audit_logs"
            id = sa.Column(sa.Integer, primary_key=True)
            happened_at = sa.Column(sa.DateTime(timezone=True), index=True)

        schema = "audit_retention_" + uuid.uuid4().hex
        engine = create_async_engine(url, execution_options={"schema_translate_map": {None: schema}})
        factory = async_sessionmaker(engine)
        cutoff = datetime.now(timezone.utc)
        try:
            async with engine.begin() as conn:
                await conn.execute(sa.text(f"CREATE SCHEMA {schema}"))
                await conn.run_sync(Base.metadata.create_all)
            async with factory.begin() as db:
                await db.execute(sa.insert(Audit), [
                    {"id": i, "happened_at": cutoff - timedelta(days=1) if i < 4 else cutoff}
                    for i in range(1, 5)
                ])
            async with factory() as first, factory() as second:
                await limit_audit_transaction(first)
                assert await prune_audit_batch(first, Audit, cutoff, limit=2) == 2
                await limit_audit_transaction(second)
                assert await asyncio.wait_for(prune_audit_batch(second, Audit, cutoff, limit=2), 3) == 1
                await second.commit()
                await first.rollback()
            async with factory.begin() as db:
                assert list((await db.scalars(sa.select(Audit.id).order_by(Audit.id))).all()) == [1, 2, 4]
                assert await prune_audit_batch(db, Audit, cutoff, limit=2) == 2
            async with factory.begin() as db:
                assert await prune_audit_batch(db, Audit, cutoff) == 0
                assert list((await db.scalars(sa.select(Audit.id))).all()) == [4]
        finally:
            async with engine.begin() as conn:
                await conn.execute(sa.text(f"DROP SCHEMA IF EXISTS {schema} CASCADE"))
            await engine.dispose()

    asyncio.run(exercise())
