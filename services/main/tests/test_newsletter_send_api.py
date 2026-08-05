"""Send-workflow, unsubscribe, and subscriber-search endpoint tests."""

import unittest
import uuid
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException

from app.api.v1 import newsletters
from app.schemas import NewsletterCreate, NewsletterScheduleRequest, NewsletterUpdate


class _FakeSelector:
    load_options = ()

    def apply(self, value):
        return value


class _Page:
    def __init__(self, items):
        self.items = items
        self.meta = {"total": len(items)}


def _newsletter(send_status="draft", **extra):
    return SimpleNamespace(
        id=uuid.uuid4(),
        title="Weekly Update",
        send_status=send_status,
        scheduled_send_at=None,
        sent_at=None,
        send_error=None,
        **extra,
    )


def _db():
    return SimpleNamespace(flush=AsyncMock())


class SendNowEndpointTests(unittest.IsolatedAsyncioTestCase):
    async def test_send_now_queues_draft_newsletter(self):
        item = _newsletter("draft")
        db = _db()
        with (
            patch.object(newsletters, "_get_newsletter_for_update", AsyncMock(return_value=item)),
            patch.object(newsletters, "enqueue_celery_after_commit") as enqueue,
        ):
            response = await newsletters.send_newsletter_now(item.id, db, None)

        self.assertEqual("scheduled", item.send_status)
        self.assertIsNotNone(item.scheduled_send_at)
        self.assertIsNone(item.send_error)
        enqueue.assert_called_once_with(db, newsletters.NEWSLETTER_SEND_TASK, args=[str(item.id)])
        self.assertIs(item, response["data"])

    async def test_send_now_retries_failed_newsletter(self):
        item = _newsletter("failed", **{})
        item.send_error = "smtp down"
        with (
            patch.object(newsletters, "_get_newsletter_for_update", AsyncMock(return_value=item)),
            patch.object(newsletters, "enqueue_celery_after_commit"),
        ):
            await newsletters.send_newsletter_now(item.id, _db(), None)

        self.assertEqual("scheduled", item.send_status)
        self.assertIsNone(item.send_error)

    async def test_send_now_rejects_sent_newsletter(self):
        item = _newsletter("sent")
        with (
            patch.object(newsletters, "_get_newsletter_for_update", AsyncMock(return_value=item)),
            patch.object(newsletters, "enqueue_celery_after_commit") as enqueue,
        ):
            with self.assertRaises(HTTPException) as context:
                await newsletters.send_newsletter_now(item.id, _db(), None)

        self.assertEqual(409, context.exception.status_code)
        self.assertEqual("sent", item.send_status)
        enqueue.assert_not_called()

    async def test_send_now_rejects_sending_newsletter(self):
        item = _newsletter("sending")
        with patch.object(newsletters, "_get_newsletter_for_update", AsyncMock(return_value=item)):
            with self.assertRaises(HTTPException) as context:
                await newsletters.send_newsletter_now(item.id, _db(), None)

        self.assertEqual(409, context.exception.status_code)

    async def test_send_now_missing_newsletter_is_404(self):
        with patch.object(newsletters, "_get_newsletter_for_update", AsyncMock(return_value=None)):
            with self.assertRaises(HTTPException) as context:
                await newsletters.send_newsletter_now(uuid.uuid4(), _db(), None)

        self.assertEqual(404, context.exception.status_code)


class ScheduleEndpointTests(unittest.IsolatedAsyncioTestCase):
    async def test_schedule_sets_future_send(self):
        item = _newsletter("draft")
        when = datetime.now(timezone.utc) + timedelta(hours=2)
        payload = NewsletterScheduleRequest(scheduled_send_at=when)
        with patch.object(newsletters, "_get_newsletter_for_update", AsyncMock(return_value=item)):
            await newsletters.schedule_newsletter_send(item.id, payload, _db(), None)

        self.assertEqual("scheduled", item.send_status)
        self.assertEqual(when, item.scheduled_send_at)

    async def test_schedule_rejects_past_datetime(self):
        payload = NewsletterScheduleRequest(
            scheduled_send_at=datetime.now(timezone.utc) - timedelta(minutes=5)
        )
        with self.assertRaises(HTTPException) as context:
            await newsletters.schedule_newsletter_send(uuid.uuid4(), payload, _db(), None)

        self.assertEqual(400, context.exception.status_code)

    async def test_schedule_treats_naive_datetime_as_utc(self):
        item = _newsletter("draft")
        naive_future = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(hours=1)
        payload = NewsletterScheduleRequest(scheduled_send_at=naive_future)
        with patch.object(newsletters, "_get_newsletter_for_update", AsyncMock(return_value=item)):
            await newsletters.schedule_newsletter_send(item.id, payload, _db(), None)

        self.assertEqual("scheduled", item.send_status)
        self.assertEqual(timezone.utc, item.scheduled_send_at.tzinfo)

    async def test_schedule_rejects_sent_newsletter(self):
        item = _newsletter("sent")
        payload = NewsletterScheduleRequest(
            scheduled_send_at=datetime.now(timezone.utc) + timedelta(hours=1)
        )
        with patch.object(newsletters, "_get_newsletter_for_update", AsyncMock(return_value=item)):
            with self.assertRaises(HTTPException) as context:
                await newsletters.schedule_newsletter_send(item.id, payload, _db(), None)

        self.assertEqual(409, context.exception.status_code)
        self.assertEqual("sent", item.send_status)


class CancelScheduleEndpointTests(unittest.IsolatedAsyncioTestCase):
    async def test_cancel_returns_scheduled_newsletter_to_draft(self):
        item = _newsletter("scheduled")
        item.scheduled_send_at = datetime.now(timezone.utc) + timedelta(hours=1)
        with patch.object(newsletters, "_get_newsletter_for_update", AsyncMock(return_value=item)):
            await newsletters.cancel_newsletter_schedule(item.id, _db(), None)

        self.assertEqual("draft", item.send_status)
        self.assertIsNone(item.scheduled_send_at)

    async def test_cancel_rejects_sending_newsletter(self):
        item = _newsletter("sending")
        with patch.object(newsletters, "_get_newsletter_for_update", AsyncMock(return_value=item)):
            with self.assertRaises(HTTPException) as context:
                await newsletters.cancel_newsletter_schedule(item.id, _db(), None)

        self.assertEqual(409, context.exception.status_code)
        self.assertEqual("sending", item.send_status)

    async def test_cancel_rejects_draft_newsletter(self):
        item = _newsletter("draft")
        with patch.object(newsletters, "_get_newsletter_for_update", AsyncMock(return_value=item)):
            with self.assertRaises(HTTPException) as context:
                await newsletters.cancel_newsletter_schedule(item.id, _db(), None)

        self.assertEqual(409, context.exception.status_code)


class PatchCannotForgeSendStateTests(unittest.TestCase):
    def test_update_schema_drops_send_state_fields(self):
        payload = NewsletterUpdate.model_validate(
            {
                "title": "Weekly",
                "send_status": "sent",
                "sent_at": "2026-08-01T00:00:00Z",
                "send_error": "forged",
            }
        )
        data = payload.model_dump(exclude_unset=True)
        self.assertNotIn("send_status", data)
        self.assertNotIn("sent_at", data)
        self.assertNotIn("send_error", data)
        self.assertEqual({"title"}, set(data))

    def test_create_schema_drops_send_state_fields(self):
        payload = NewsletterCreate.model_validate(
            {"title": "Weekly", "send_status": "sent", "sent_at": "2026-08-01T00:00:00Z"}
        )
        data = payload.model_dump()
        self.assertNotIn("send_status", data)
        self.assertNotIn("sent_at", data)
        self.assertNotIn("send_error", data)


class UnsubscribeTokenEndpointTests(unittest.IsolatedAsyncioTestCase):
    async def test_unsubscribe_by_token_cancels_subscription(self):
        subscriber = SimpleNamespace(
            id=uuid.uuid4(), email="reader@example.com", status="active"
        )
        unsubscribed = SimpleNamespace(
            id=subscriber.id, email=subscriber.email, status="unsubscribed"
        )
        with (
            patch.object(
                newsletters.NewsletterSubscriberService,
                "get_by_token",
                AsyncMock(return_value=subscriber),
            ) as get_by_token,
            patch.object(
                newsletters.NewsletterSubscriberService,
                "unsubscribe",
                AsyncMock(return_value=unsubscribed),
            ) as unsubscribe,
        ):
            response = await newsletters.unsubscribe_newsletter_by_token(
                request=None, token="tok-123", db=None
            )

        get_by_token.assert_awaited_once_with(None, "tok-123")
        unsubscribe.assert_awaited_once_with(None, "reader@example.com")
        self.assertEqual("unsubscribed", response["data"].status)

    async def test_unsubscribe_by_token_is_idempotent(self):
        subscriber = SimpleNamespace(
            id=uuid.uuid4(), email="reader@example.com", status="unsubscribed"
        )
        with (
            patch.object(
                newsletters.NewsletterSubscriberService,
                "get_by_token",
                AsyncMock(return_value=subscriber),
            ),
            patch.object(
                newsletters.NewsletterSubscriberService, "unsubscribe", AsyncMock()
            ) as unsubscribe,
        ):
            response = await newsletters.unsubscribe_newsletter_by_token(
                request=None, token="tok-123", db=None
            )

        unsubscribe.assert_not_awaited()
        self.assertIs(subscriber, response["data"])

    async def test_unsubscribe_by_token_unknown_token_is_404(self):
        with patch.object(
            newsletters.NewsletterSubscriberService,
            "get_by_token",
            AsyncMock(return_value=None),
        ):
            with self.assertRaises(HTTPException) as context:
                await newsletters.unsubscribe_newsletter_by_token(
                    request=None, token="missing", db=None
                )

        self.assertEqual(404, context.exception.status_code)


class AdminSubscriberEndpointTests(unittest.IsolatedAsyncioTestCase):
    async def test_admin_unsubscribe_honors_request(self):
        subscriber = SimpleNamespace(
            id=uuid.uuid4(), email="reader@example.com", status="active"
        )
        unsubscribed = SimpleNamespace(
            id=subscriber.id, email=subscriber.email, status="unsubscribed"
        )
        with (
            patch.object(
                newsletters.NewsletterSubscriberService,
                "get_by_id",
                AsyncMock(return_value=subscriber),
            ),
            patch.object(
                newsletters.NewsletterSubscriberService,
                "unsubscribe",
                AsyncMock(return_value=unsubscribed),
            ) as unsubscribe,
        ):
            response = await newsletters.unsubscribe_newsletter_subscriber_admin(
                subscriber.id, None, None
            )

        unsubscribe.assert_awaited_once_with(None, "reader@example.com")
        self.assertEqual("unsubscribed", response["data"].status)

    async def test_admin_unsubscribe_missing_subscriber_is_404(self):
        with patch.object(
            newsletters.NewsletterSubscriberService, "get_by_id", AsyncMock(return_value=None)
        ):
            with self.assertRaises(HTTPException) as context:
                await newsletters.unsubscribe_newsletter_subscriber_admin(
                    uuid.uuid4(), None, None
                )

        self.assertEqual(404, context.exception.status_code)

    async def test_subscriber_list_forwards_search_and_verified_filters(self):
        page = _Page([])
        with (
            patch.object(newsletters, "build_selector", return_value=_FakeSelector()),
            patch.object(
                newsletters.NewsletterSubscriberService, "list", AsyncMock(return_value=page)
            ) as list_mock,
        ):
            await newsletters.list_newsletter_subscribers(
                db=None, page=1, per_page=20, q="gmail", is_verified=True, status="active"
            )

        list_mock.assert_awaited_once_with(
            None, page=1, per_page=20, status="active", q="gmail", is_verified=True
        )


class SubscriberSearchQueryTests(unittest.IsolatedAsyncioTestCase):
    async def test_service_list_filters_by_email_and_verification(self):
        from app.services.marketing import NewsletterSubscriberService

        captured = {}

        async def fake_paginate(db, query, *, page, per_page):
            captured["query"] = query
            return _Page([])

        with patch("app.services.marketing.paginate_query", side_effect=fake_paginate):
            await NewsletterSubscriberService.list(None, q="gmail", is_verified=False)

        statement = str(captured["query"]).upper()
        # The generic dialect renders ilike() as lower(...) LIKE lower(...).
        self.assertIn("LIKE LOWER", statement)
        self.assertIn("EMAIL", statement)
        self.assertIn("IS_VERIFIED IS FALSE", statement)
