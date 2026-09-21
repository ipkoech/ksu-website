import inspect
import os
from datetime import datetime, timedelta, timezone
from uuid import uuid4

import pytest
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.models.chair import ChairProfile
from app.models.content import FooterLink, HeroSlide, NavigationItem, SiteSettings
from app.routes.v1 import public


@pytest.mark.asyncio
async def test_public_configuration_queries_exclude_deleted_records():
    url = os.environ.get("KSU_TEST_DATABASE_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_DATABASE_URL required")
    schema = "heri_public_" + uuid4().hex
    engine = create_async_engine(url, execution_options={"schema_translate_map": {"heri": schema}})
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    cases = [
        (ChairProfile, public.chair, {"name": "Chair"}, "name"),
        (SiteSettings, public.site, {"name": "Site"}, "name"),
        (NavigationItem, public.navigation, {"label": "Nav", "href": "/"}, "label"),
        (HeroSlide, public.hero_slides, {"title": "Hero", "image_url": "/image.jpg"}, "title"),
        (FooterLink, public.footer, {"label": "Footer", "column": "Links", "href": "/"}, "label"),
    ]
    try:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"CREATE SCHEMA {schema}"))
            for model, _, _, _ in cases:
                await conn.run_sync(model.__table__.create)
        async with sessions.begin() as db:
            for model, _, values, field in cases:
                old = {**values, field: "Deleted"}
                db.add(model(**old, deleted_at=datetime.now(timezone.utc),
                             created_at=datetime.now(timezone.utc) - timedelta(days=1)))
                db.add(model(**values))
        async with sessions() as db:
            for _, endpoint, values, field in cases:
                result = await inspect.unwrap(endpoint)(request=None, db=db)
                items = result if isinstance(result, list) else [result]
                assert len(items) == 1
                assert getattr(items[0], field) == values[field]
    finally:
        async with engine.begin() as conn:
            await conn.execute(sa.text(f"DROP SCHEMA IF EXISTS {schema} CASCADE"))
        await engine.dispose()
