"""Tests for the content lifecycle beat tasks (auto-publish / auto-expire)."""
import uuid
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

import pytest

from app.models import News


@pytest.fixture
def anyio_backend():
    return "asyncio"


class _ScalarResult:
    def __init__(self, values):
        self._values = values

    def all(self):
        return self._values


class _ExecuteResult:
    def __init__(self, values):
        self._values = values

    def scalars(self):
        return _ScalarResult(self._values)


class _FakeDb:
    def __init__(self, rows):
        self.rows = rows
        self.statements = []
        self.added = []
        self.committed = False

    async def execute(self, statement):
        self.statements.append(statement)
        return _ExecuteResult(self.rows)

    def add(self, item):
        self.added.append(item)

    async def commit(self):
        self.committed = True


def _scheduled_news(**overrides):
    record = SimpleNamespace(
        id=uuid.uuid4(),
        status="scheduled",
        workflow_status="scheduled",
        scheduled_publish_at=datetime.now(timezone.utc) - timedelta(minutes=10),
        is_published=False,
        is_public=False,
        published_at=None,
        deleted_at=None,
    )
    for key, value in overrides.items():
        setattr(record, key, value)
    return record


def _published_news(**overrides):
    record = SimpleNamespace(
        id=uuid.uuid4(),
        status="published",
        workflow_status="published",
        expires_at=datetime.now(timezone.utc) - timedelta(hours=1),
        is_published=True,
        is_public=True,
        unpublished_at=None,
        unpublished_by_id=None,
        deleted_at=None,
    )
    for key, value in overrides.items():
        setattr(record, key, value)
    return record


@pytest.mark.anyio
async def test_publish_due_promotes_scheduled_news(monkeypatch):
    from app.tasks import content_lifecycle

    monkeypatch.setattr(content_lifecycle, "CONTENT_MODELS", {"news": News})
    record = _scheduled_news()
    db = _FakeDb([record])
    now = datetime.now(timezone.utc)

    count = await content_lifecycle.publish_due_content(db, now=now)

    assert count == 1
    assert record.workflow_status == "published"
    assert record.status == "published"
    assert record.is_published is True
    assert record.is_public is True
    assert record.published_at == now
    assert db.committed is True

    assert len(db.added) == 1
    log = db.added[0]
    assert log.action == "system_publish"
    assert log.content_type == "news"
    assert log.content_id == record.id
    assert log.from_status == "scheduled"
    assert log.to_status == "published"
    assert log.actor_id is None

    statement = str(db.statements[0])
    assert "news.workflow_status = :workflow_status_1" in statement
    assert "news.scheduled_publish_at <= :scheduled_publish_at_1" in statement
    assert "news.deleted_at IS NULL" in statement


@pytest.mark.anyio
async def test_publish_due_ignores_future_schedule(monkeypatch):
    """The due filter lives in SQL: an empty result set promotes nothing."""
    from app.tasks import content_lifecycle

    monkeypatch.setattr(content_lifecycle, "CONTENT_MODELS", {"news": News})
    db = _FakeDb([])

    count = await content_lifecycle.publish_due_content(db)

    assert count == 0
    assert db.added == []
    assert "news.scheduled_publish_at <= :scheduled_publish_at_1" in str(db.statements[0])


@pytest.mark.anyio
async def test_publish_due_skips_models_without_schedule_columns(monkeypatch):
    from app.tasks import content_lifecycle

    class _NoWorkflow:
        pass

    monkeypatch.setattr(content_lifecycle, "CONTENT_MODELS", {"plain": _NoWorkflow})
    db = _FakeDb([])

    assert await content_lifecycle.publish_due_content(db) == 0
    assert db.statements == []
