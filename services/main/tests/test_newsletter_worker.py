import uuid
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import Mock

import pytest

from app.tasks import newsletters


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
    def __init__(self, values):
        self.values = values
        self.statement = None

    async def execute(self, statement):
        self.statement = statement
        return _ExecuteResult(self.values)


class _RowsResult:
    def __init__(self, rows):
        self._rows = rows

    def all(self):
        return self._rows


class _FakeRowsDb:
    def __init__(self, rows):
        self.rows = rows
        self.statement = None

    async def execute(self, statement):
        self.statement = statement
        return _RowsResult(self.rows)


def test_render_newsletter_email_includes_public_link_and_plain_text():
    item = SimpleNamespace(
        title="Kisii University Weekly",
        slug="kisii-weekly",
        summary="Campus partnerships, events, and student achievements.",
        content="<p>Research week opens on Monday.</p>",
    )

    message = newsletters.render_newsletter_email(item)

    assert message.subject == "Kisii University Weekly"
    assert "Campus partnerships" in message.text_body
    assert "Research week opens on Monday." in message.text_body
    assert "/media/newsletters/kisii-weekly" in message.text_body
    assert "<h1" in message.html_body
    assert "Research week opens on Monday." in message.html_body


def test_render_newsletter_email_includes_unsubscribe_link():
    item = SimpleNamespace(
        title="Kisii University Weekly",
        slug="kisii-weekly",
        summary="Campus news.",
        content="<p>Research week opens on Monday.</p>",
    )
    unsubscribe_url = newsletters.unsubscribe_url_for_token("tok-abc")

    message = newsletters.render_newsletter_email(item, unsubscribe_url=unsubscribe_url)

    assert "/api/v1/newsletters/unsubscribe/tok-abc" in unsubscribe_url
    assert f"Unsubscribe: {unsubscribe_url}" in message.text_body
    assert f'href="{unsubscribe_url}"' in message.html_body
    assert ">Unsubscribe</a>" in message.html_body


def test_render_newsletter_email_without_unsubscribe_url_has_no_link():
    item = SimpleNamespace(title="T", slug="t", summary=None, content=None)

    message = newsletters.render_newsletter_email(item)

    assert "Unsubscribe" not in message.text_body
    assert "Unsubscribe" not in message.html_body


@pytest.mark.anyio
async def test_active_subscribers_returns_tokens_and_dedupes_by_email():
    db = _FakeRowsDb(
        [
            ("a@example.com", "tok-a"),
            ("a@example.com", "tok-dup"),
            ("b@example.com", None),
        ]
    )

    subscribers = await newsletters._active_subscribers(db)

    assert subscribers == [("a@example.com", "tok-a"), ("b@example.com", None)]
    assert "verification_token" in str(db.statement)
    assert "newsletter_subscribers.status = :status_1" in str(db.statement)


@pytest.mark.anyio
async def test_enqueue_due_newsletters_queues_due_ids(monkeypatch):
    now = datetime.now(timezone.utc)
    due_id = uuid.uuid4()
    db = _FakeDb([due_id])

    queued = []
    monkeypatch.setattr(
        newsletters.queue_newsletter_send,
        "delay",
        Mock(side_effect=lambda item_id: queued.append(item_id)),
    )

    count = await newsletters.enqueue_due_newsletters(db, now=now)

    assert count == 1
    assert queued == [str(due_id)]
    assert "newsletters.send_status = :send_status_1" in str(db.statement)
    assert "newsletters.scheduled_send_at <= :scheduled_send_at_1" in str(db.statement)
