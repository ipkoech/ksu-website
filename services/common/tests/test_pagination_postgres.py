import asyncio
import os
import uuid

import pytest
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, aliased, joinedload, relationship

from ksu_common.pagination import paginate

TEST_URL = os.environ.get("KSU_TEST_DATABASE_URL")
pytestmark = pytest.mark.skipif(not TEST_URL, reason="disposable KSU_TEST_DATABASE_URL required")


class Base(DeclarativeBase):
    pass


class Parent(Base):
    __tablename__ = "pagination_parent"
    id = sa.Column(sa.Integer, primary_key=True)
    children = relationship("Child")


class Child(Base):
    __tablename__ = "pagination_child"
    id = sa.Column(sa.Integer, primary_key=True)
    parent_id = sa.Column(sa.ForeignKey(Parent.id))


@pytest.mark.parametrize("use_alias", [False, True])
def test_pagination_preserves_parent_pages_with_joined_collections(use_alias):
    async def exercise():
        schema = "pagination_probe_" + uuid.uuid4().hex
        engine = create_async_engine(TEST_URL, execution_options={"schema_translate_map": {None: schema}})
        factory = async_sessionmaker(engine, expire_on_commit=False)
        try:
            async with engine.begin() as connection:
                await connection.execute(sa.text(f"CREATE SCHEMA {schema}"))
                await connection.run_sync(Base.metadata.create_all)
            async with factory.begin() as db:
                db.add_all([Parent(id=1, children=[Child(id=1), Child(id=2)]),
                            Parent(id=2, children=[Child(id=3), Child(id=4)])])
            selected_parent = aliased(Parent) if use_alias else Parent
            query = sa.select(selected_parent).options(joinedload(selected_parent.children)).order_by(selected_parent.id)
            async with factory() as db:
                for page in (1, 2, 3):
                    result = await paginate(db, query, page=page, per_page=1)
                    assert [row.id for row in result.items] == ([page] if page <= 2 else [])
                    assert result.meta == {"page": page, "per_page": 1, "total": 2, "pages": 2}
                    if result.items:
                        assert len(result.items[0].children) == 2
                statements = []
                sa.event.listen(engine.sync_engine, "before_cursor_execute", lambda *args: statements.append(args[2]))
                result = await paginate(db, query, page=0, per_page=999, max_per_page=2, include_total=False)
                assert result.meta == {"page": 1, "per_page": 2}
                assert [row.id for row in result.items] == [1, 2]
                assert len(statements) == 1
                # Scalar selects retain repeated values: only ORM entity rows
                # need deduplication for joined relationship loading.
                scalar_page = await paginate(db, sa.select(Child.parent_id).order_by(Child.id))
                assert scalar_page.items == [1, 1, 2, 2]
                assert scalar_page.total == 4
                grouped_page = await paginate(
                    db, sa.select(Child.parent_id).group_by(Child.parent_id).order_by(Child.parent_id),
                    page=2, per_page=1,
                )
                assert grouped_page.items == [2]
                assert grouped_page.meta == {"page": 2, "per_page": 1, "total": 2, "pages": 2}
        finally:
            async with engine.begin() as connection:
                await connection.execute(sa.text(f"DROP SCHEMA IF EXISTS {schema} CASCADE"))
            await engine.dispose()

    asyncio.run(exercise())
