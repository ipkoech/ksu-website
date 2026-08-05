import csv
import io
import unittest
import uuid
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException

from app.api.v1 import exports
from app.api.v1.exports import EXPORT_SOURCES, LIFECYCLE_COLUMNS, export_resource_csv


class _Page:
    def __init__(self, items):
        self.items = items
        self.meta = {"total": len(items)}


def _request(query_params=None):
    return SimpleNamespace(query_params=query_params or {})


async def _render(response) -> str:
    chunks = []
    async for chunk in response.body_iterator:
        chunks.append(chunk if isinstance(chunk, str) else chunk.decode())
    return "".join(chunks)


def _subscriber(**overrides):
    values = {
        "id": uuid.uuid4(),
        "email": "reader@example.com",
        "name": "Reader",
        "frequency": "all",
        "is_verified": True,
        "subscribed_at": datetime(2026, 8, 1, tzinfo=timezone.utc),
        "unsubscribed_at": None,
        "status": "active",
    }
    values.update(overrides)
    return SimpleNamespace(**values)


class ExportsApiTests(unittest.IsolatedAsyncioTestCase):
    async def test_subscribers_export_returns_csv_header_and_seeded_row(self):
        user = SimpleNamespace(id=uuid.uuid4())
        subscriber = _subscriber()

        with patch(
            "app.api.v1.newsletters.NewsletterSubscriberService.list",
            AsyncMock(return_value=_Page([subscriber])),
        ), patch.object(exports, "user_has_scope", return_value=True):
            response = await export_resource_csv(
                "newsletter-subscribers", _request(), db=None, user=user
            )

        self.assertEqual("text/csv", response.media_type)
        self.assertIn("newsletter-subscribers.csv", response.headers["content-disposition"])

        rows = list(csv.reader(io.StringIO(await _render(response))))
        self.assertEqual(2, len(rows))
        header, row = rows
        expected_columns = list(
            EXPORT_SOURCES["newsletter-subscribers"].columns
            + tuple(
                name
                for name in LIFECYCLE_COLUMNS
                if name not in EXPORT_SOURCES["newsletter-subscribers"].columns
            )
        )
        self.assertEqual(expected_columns, header)
        record = dict(zip(header, row))
        self.assertEqual("reader@example.com", record["email"])
        self.assertEqual(str(subscriber.id), record["id"])
        self.assertEqual("active", record["status"])
        self.assertEqual("2026-08-01T00:00:00+00:00", record["subscribed_at"])
        self.assertEqual("", record["unsubscribed_at"])

    async def test_subscribers_export_passes_status_filter_through(self):
        user = SimpleNamespace(id=uuid.uuid4())
        service_list = AsyncMock(return_value=_Page([]))

        with patch(
            "app.api.v1.newsletters.NewsletterSubscriberService.list", service_list
        ), patch.object(exports, "user_has_scope", return_value=True):
            await export_resource_csv(
                "newsletter-subscribers",
                _request({"status": "unsubscribed", "ignored": "x"}),
                db=None,
                user=user,
            )

        self.assertEqual("unsubscribed", service_list.await_args.kwargs["status"])
        self.assertNotIn("ignored", service_list.await_args.kwargs)

    async def test_policies_export_passes_status_filter_and_admin_visibility(self):
        user = SimpleNamespace(id=uuid.uuid4())
        service_list = AsyncMock(return_value=_Page([]))

        with patch(
            "app.api.v1.policies.PolicyService.list", service_list
        ), patch("app.api.v1.policies.user_has_scope", return_value=True):
            await export_resource_csv(
                "policies",
                _request({"status": "archived"}),
                db=None,
                user=user,
            )

        kwargs = service_list.await_args.kwargs
        self.assertEqual("archived", kwargs["status"])
        self.assertFalse(kwargs["public_only"])

    async def test_policies_export_requires_policy_view_scope(self):
        user = SimpleNamespace(id=uuid.uuid4())

        with patch("app.api.v1.policies.user_has_scope", return_value=False):
            with self.assertRaises(HTTPException) as context:
                await export_resource_csv("policies", _request(), db=None, user=user)

        self.assertEqual(403, context.exception.status_code)

    async def test_viewer_without_permission_gets_403(self):
        user = SimpleNamespace(id=uuid.uuid4())

        with patch.object(exports, "user_has_scope", return_value=False):
            with self.assertRaises(HTTPException) as context:
                await export_resource_csv(
                    "newsletter-subscribers", _request(), db=None, user=user
                )

        self.assertEqual(403, context.exception.status_code)

    async def test_unknown_resource_is_404(self):
        user = SimpleNamespace(id=uuid.uuid4())
        with self.assertRaises(HTTPException) as context:
            await export_resource_csv("payroll", _request(), db=None, user=user)
        self.assertEqual(404, context.exception.status_code)

    def test_every_planned_resource_is_exportable(self):
        self.assertEqual(
            {
                "news", "announcements", "events", "blogs", "stories",
                "contacts", "faqs", "testimonials", "newsletter-subscribers", "documents",
                "policies",
            },
            set(EXPORT_SOURCES),
        )


if __name__ == "__main__":
    unittest.main()
