from __future__ import annotations

import uuid

import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.models import SocialMediaDelivery, SocialMediaPost
from app.services import SocialMediaPostService


class _AsyncSessionAdapter:
    def __init__(self, session: Session):
        self._session = session

    def add(self, instance):
        self._session.add(instance)

    def add_all(self, instances):
        self._session.add_all(instances)

    async def delete(self, instance):
        self._session.delete(instance)

    async def flush(self):
        self._session.flush()

    async def execute(self, statement):
        return self._session.execute(statement)


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
def db():
    engine = create_engine("sqlite+pysqlite:///:memory:")
    with engine.begin() as connection:
        connection.exec_driver_sql(
            """
            CREATE TABLE social_media_posts (
                id UUID PRIMARY KEY,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                deleted_at DATETIME,
                source_type VARCHAR(32) NOT NULL,
                source_id UUID,
                title VARCHAR(255),
                content TEXT NOT NULL,
                media_ids JSON,
                platforms JSON NOT NULL,
                scheduled_at DATETIME,
                posted_at DATETIME,
                platform_post_ids JSON,
                status VARCHAR(32) NOT NULL DEFAULT 'draft',
                error_message TEXT,
                validation_summary JSON,
                created_by_id UUID NOT NULL
            )
            """
        )
        connection.exec_driver_sql(
            """
            CREATE TABLE social_media_deliveries (
                id UUID PRIMARY KEY,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                deleted_at DATETIME,
                social_post_id UUID NOT NULL,
                platform VARCHAR(32) NOT NULL,
                account_id UUID,
                status VARCHAR(32) NOT NULL DEFAULT 'draft',
                provider_post_id VARCHAR(255),
                attempts INTEGER NOT NULL DEFAULT 0,
                last_attempted_at DATETIME,
                posted_at DATETIME,
                error_message TEXT,
                validation_errors JSON,
                request_payload JSON,
                response_payload JSON
            )
            """
        )

    with Session(engine) as session:
        yield _AsyncSessionAdapter(session)


async def _make_post_with_delivery(db) -> SocialMediaPost:
    post = SocialMediaPost(
        source_type="manual",
        content="Campus open day this Friday.",
        platforms=["facebook"],
        status="draft",
        created_by_id=uuid.uuid4(),
    )
    db.add(post)
    await db.flush()
    delivery = SocialMediaDelivery(
        social_post_id=post.id,
        platform="facebook",
        status="draft",
    )
    db.add(delivery)
    await db.flush()
    return post


@pytest.mark.anyio
async def test_delete_social_post_is_soft_and_keeps_deliveries(db):
    post = await _make_post_with_delivery(db)

    await SocialMediaPostService.delete(db, post)

    row = (
        await db.execute(select(SocialMediaPost).where(SocialMediaPost.id == post.id))
    ).scalar_one()
    assert row.deleted_at is not None

    deliveries = (
        (
            await db.execute(
                select(SocialMediaDelivery).where(SocialMediaDelivery.social_post_id == post.id)
            )
        )
        .scalars()
        .all()
    )
    assert deliveries


@pytest.mark.anyio
async def test_deleted_posts_hidden_from_get_by_id_and_list(db):
    post = await _make_post_with_delivery(db)

    await SocialMediaPostService.delete(db, post)

    assert await SocialMediaPostService.get_by_id(db, post.id) is None

    result = await SocialMediaPostService.list(db)
    assert post.id not in [item.id for item in result.items]
