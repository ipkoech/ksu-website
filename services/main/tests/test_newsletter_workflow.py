from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

import pytest

from app.models import Newsletter, NewsletterSubscriber
from app.services.marketing import NewsletterService, NewsletterSubscriberService


class _Result:
    def __init__(self, item):
        self.item = item

    def scalar_one_or_none(self):
        return self.item


class _Session:
    def __init__(self, item):
        self.item = item
        self.executed = 0

    async def execute(self, _query):
        self.executed += 1
        return _Result(self.item)

    async def flush(self):
        return None


@pytest.mark.asyncio
async def test_queue_send_claims_draft_and_sets_immediate_due_time():
    item = Newsletter(id=uuid.uuid4(), title="June", slug="june", send_status="draft")
    db = _Session(item)

    result = await NewsletterService.queue_send(db, item.id)

    assert result is item
    assert item.send_status == "scheduled"
    assert item.scheduled_send_at is not None
    assert item.scheduled_send_at <= datetime.now(timezone.utc)
    assert item.send_error is None


@pytest.mark.asyncio
async def test_schedule_send_requires_future_timezone_aware_time():
    item = Newsletter(id=uuid.uuid4(), title="June", slug="june", send_status="draft")
    db = _Session(item)

    with pytest.raises(ValueError, match="future"):
        await NewsletterService.schedule_send(
            db,
            item.id,
            datetime.now(timezone.utc) - timedelta(minutes=1),
        )
    assert db.executed == 0


@pytest.mark.asyncio
async def test_cancel_schedule_returns_newsletter_to_draft():
    item = Newsletter(
        id=uuid.uuid4(),
        title="June",
        slug="june",
        send_status="scheduled",
        scheduled_send_at=datetime.now(timezone.utc) + timedelta(hours=1),
    )
    db = _Session(item)

    result = await NewsletterService.cancel_schedule(db, item.id)

    assert result is item
    assert item.send_status == "draft"
    assert item.scheduled_send_at is None


@pytest.mark.asyncio
async def test_admin_unsubscribe_by_id_is_idempotent():
    item = NewsletterSubscriber(id=uuid.uuid4(), email="reader@example.com", status="active")
    db = _Session(item)

    result = await NewsletterSubscriberService.unsubscribe_by_id(db, item.id)

    assert result is item
    assert item.status == "unsubscribed"
    assert item.unsubscribed_at is not None
