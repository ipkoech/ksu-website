"""Tests for record_state list filtering and the record restore endpoints."""

from __future__ import annotations

import unittest
import uuid
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException

from app.api.v1 import news, record_recovery
from app.models import ContentWorkflowLog, News
from app.services.content import _record_state_query


class _FakeSelector:
    load_options = ()

    def apply(self, value):
        return value


class _Page:
    def __init__(self, items):
        self.items = items
        self.meta = {"total": len(items)}


class _ScalarResult:
    def __init__(self, value):
        self._value = value

    def scalar_one_or_none(self):
        return self._value


class _FakeDb:
    def __init__(self, record=None):
        self.record = record
        self.added = []

    async def execute(self, statement):
        return _ScalarResult(self.record)

    def add(self, item):
        self.added.append(item)

    async def flush(self):
        return None


class _Record(SimpleNamespace):
    def restore(self):
        self.deleted_at = None


def _news_record(**overrides):
    defaults = dict(
        id=uuid.uuid4(),
        scope_type="school",
        scope_id=uuid.uuid4(),
        status="draft",
        workflow_status="draft",
        deleted_at=None,
        archived_at=None,
        is_published=False,
        is_public=False,
    )
    defaults.update(overrides)
    return _Record(**defaults)


class RecordStateQueryTests(unittest.TestCase):
    def test_active_hides_soft_deleted_rows(self):
        sql = str(_record_state_query(News, "active"))
        self.assertIn("deleted_at IS NULL", sql)

    def test_deleted_targets_only_soft_deleted_rows(self):
        sql = str(_record_state_query(News, "deleted"))
        self.assertIn("deleted_at IS NOT NULL", sql)
        self.assertNotIn("deleted_at IS NULL", sql)

    def test_archived_keeps_active_rows_in_archived_state(self):
        sql = str(_record_state_query(News, "archived"))
        self.assertIn("deleted_at IS NULL", sql)
        self.assertIn("workflow_status", sql)


class RecordStatePassThroughTests(unittest.IsolatedAsyncioTestCase):
    async def test_admin_news_list_forwards_record_state(self):
        list_admin = AsyncMock(return_value=_Page([]))
        with (
            patch.object(news, "build_selector", return_value=_FakeSelector()),
            patch.object(news.NewsService, "list_admin", list_admin),
        ):
            await news.list_admin_news(db=None, user=SimpleNamespace(id=uuid.uuid4()), record_state="deleted")

        self.assertEqual("deleted", list_admin.await_args.kwargs["record_state"])


class RestoreEndpointTests(unittest.IsolatedAsyncioTestCase):
    async def test_restore_deleted_news_clears_deleted_at(self):
        record = _news_record(deleted_at=datetime.now(timezone.utc))
        db = _FakeDb(record)

        with patch("app.api.v1._scoped._can_access_scope", return_value=True):
            response = await record_recovery.restore_record(
                "news", record.id, db=db, user=SimpleNamespace(id=uuid.uuid4())
            )

        self.assertIsNone(record.deleted_at)
        self.assertIs(record, response["data"])
        self.assertEqual([], db.added)

    async def test_restore_archived_news_returns_to_draft_and_logs(self):
        record = _news_record(status="archived", workflow_status="archived")
        actor = SimpleNamespace(id=uuid.uuid4())
        db = _FakeDb(record)

        with patch("app.api.v1._scoped._can_access_scope", return_value=True):
            await record_recovery.restore_record("news", record.id, db=db, user=actor)

        self.assertEqual("draft", record.workflow_status)
        self.assertEqual("draft", record.status)
        self.assertIsNone(record.archived_at)
        self.assertEqual(1, len(db.added))
        log = db.added[0]
        self.assertIsInstance(log, ContentWorkflowLog)
        self.assertEqual("edit_reset", log.action)
        self.assertEqual("archived", log.from_status)
        self.assertEqual("draft", log.to_status)
        self.assertEqual(actor.id, log.actor_id)
        self.assertEqual("Restored from archive", log.comments)

    async def test_restore_rejects_unowned_scope(self):
        record = _news_record(deleted_at=datetime.now(timezone.utc))
        db = _FakeDb(record)

        with patch("app.api.v1._scoped._can_access_scope", return_value=False):
            with self.assertRaises(HTTPException) as caught:
                await record_recovery.restore_record(
                    "news", record.id, db=db, user=SimpleNamespace(id=uuid.uuid4())
                )

        self.assertEqual(403, caught.exception.status_code)
        self.assertIsNotNone(record.deleted_at)

    async def test_restore_flat_scope_requires_manage_permission(self):
        record = _news_record(deleted_at=datetime.now(timezone.utc))
        db = _FakeDb(record)

        with patch.object(record_recovery, "user_has_scope", return_value=False):
            with self.assertRaises(HTTPException) as caught:
                await record_recovery.restore_record(
                    "stories", record.id, db=db, user=SimpleNamespace(id=uuid.uuid4())
                )

        self.assertEqual(403, caught.exception.status_code)

    async def test_restore_active_record_conflicts(self):
        record = _news_record()
        db = _FakeDb(record)

        with patch("app.api.v1._scoped._can_access_scope", return_value=True):
            with self.assertRaises(HTTPException) as caught:
                await record_recovery.restore_record(
                    "news", record.id, db=db, user=SimpleNamespace(id=uuid.uuid4())
                )

        self.assertEqual(409, caught.exception.status_code)

    async def test_restore_unknown_content_type_is_404(self):
        with self.assertRaises(HTTPException) as caught:
            await record_recovery.restore_record(
                "widgets", uuid.uuid4(), db=_FakeDb(), user=SimpleNamespace(id=uuid.uuid4())
            )

        self.assertEqual(404, caught.exception.status_code)
