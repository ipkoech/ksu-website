"""Tests for field-level before/after change tracking on content writes."""

import unittest
import uuid
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock

from fastapi import FastAPI
from fastapi.testclient import TestClient

from ksu_common import persist_audit_log

from app.models import News
from app.services.change_tracking import (
    begin_audit_context,
    collected_audit_changes,
    diff_fields,
    record_audit_changes,
    reset_audit_context,
    track_update,
)
from app.services.content import NewsService


class DiffFieldsTests(unittest.TestCase):
    def test_reports_changed_fields_with_before_and_after(self):
        record = SimpleNamespace(title="Old title", summary="Same")

        changes = diff_fields(record, {"title": "New title", "summary": "Same"})

        self.assertEqual({"title": {"from": "Old title", "to": "New title"}}, changes)

    def test_unchanged_payload_yields_empty_diff(self):
        record = SimpleNamespace(title="Same", display_order=100)

        self.assertEqual({}, diff_fields(record, {"title": "Same", "display_order": 100}))

    def test_skips_untracked_and_unknown_fields(self):
        record = SimpleNamespace(title="Old", updated_at=datetime.now(timezone.utc))

        changes = diff_fields(record, {
            "updated_at": datetime.now(timezone.utc),
            "plain_text": "ignored",
            "not_a_column": "ignored",
            "title": "New",
        })

        self.assertEqual({"title"}, set(changes))

    def test_serializes_datetime_and_uuid_values(self):
        old_dt = datetime(2026, 1, 1, tzinfo=timezone.utc)
        new_dt = datetime(2026, 6, 1, tzinfo=timezone.utc)
        old_id = uuid.uuid4()
        new_id = uuid.uuid4()
        record = SimpleNamespace(valid_from=old_dt, featured_media_id=old_id)

        changes = diff_fields(record, {"valid_from": new_dt, "featured_media_id": new_id})

        self.assertEqual(
            {"from": old_dt.isoformat(), "to": new_dt.isoformat()},
            changes["valid_from"],
        )
        self.assertEqual({"from": str(old_id), "to": str(new_id)}, changes["featured_media_id"])


class AuditContextTests(unittest.TestCase):
    def test_track_update_records_into_active_context(self):
        token = begin_audit_context()
        try:
            record = SimpleNamespace(title="Old", summary="Keep")
            track_update(record, {"title": "New", "summary": "Keep"})

            self.assertEqual(
                {"title": {"from": "Old", "to": "New"}},
                collected_audit_changes(),
            )
        finally:
            reset_audit_context(token)

    def test_track_update_without_context_is_a_noop(self):
        record = SimpleNamespace(title="Old")

        changes = track_update(record, {"title": "New"})

        self.assertEqual({"title": {"from": "Old", "to": "New"}}, changes)
        self.assertIsNone(collected_audit_changes())

    def test_empty_context_reports_no_changes(self):
        token = begin_audit_context()
        try:
            self.assertIsNone(collected_audit_changes())
            record_audit_changes({})
            self.assertIsNone(collected_audit_changes())
        finally:
            reset_audit_context(token)

    def test_reset_clears_context(self):
        token = begin_audit_context()
        record_audit_changes({"title": {"from": "a", "to": "b"}})
        reset_audit_context(token)

        self.assertIsNone(collected_audit_changes())


class _FakeAuditSession:
    def __init__(self, sink):
        self._sink = sink

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc_info):
        return False

    def add(self, entry):
        self._sink.append(entry)

    async def commit(self):
        return None

    async def rollback(self):
        return None


class NewsPatchAuditIntegrationTests(unittest.TestCase):
    """A news update inside the audit middleware persists AuditLog.changes."""

    def test_news_update_persists_field_diffs_on_audit_log(self):
        persisted = []

        def session_factory():
            return _FakeAuditSession(persisted)

        item = News(title="Old title", slug="old-title", summary="Old summary")
        item.id = uuid.uuid4()
        db = SimpleNamespace(flush=AsyncMock())

        app = FastAPI()

        @app.middleware("http")
        async def audit_middleware(request, call_next):
            audit_token = begin_audit_context()
            try:
                response = await call_next(request)
                await persist_audit_log(
                    session_factory,
                    service_name="main",
                    request=request,
                    status_code=response.status_code,
                    changes=collected_audit_changes(),
                )
            finally:
                reset_audit_context(audit_token)
            return response

        @app.patch("/api/v1/news/{news_id}")
        async def patch_news(news_id: uuid.UUID):
            await NewsService.update(db, item, title="New title", slug="new-title")
            return {"status": "success"}

        client = TestClient(app)
        response = client.patch(f"/api/v1/news/{item.id}")

        self.assertEqual(200, response.status_code)
        self.assertEqual(1, len(persisted))
        entry = persisted[0]
        self.assertEqual("main", entry.service_name)
        self.assertEqual(
            {
                "title": {"from": "Old title", "to": "New title"},
                "slug": {"from": "old-title", "to": "new-title"},
            },
            entry.changes,
        )
        self.assertEqual("New title", item.title)


if __name__ == "__main__":
    unittest.main()
