import unittest
from unittest.mock import patch

from app.services import content
from app.services.content import EventService, NewsService


class _Result:
    def scalar_one_or_none(self):
        return None


class _FakeDb:
    def __init__(self):
        self.statements = []

    async def execute(self, statement):
        self.statements.append(statement)
        return _Result()


async def _skip_archive(*_args, **_kwargs):
    return None


class PublicContentVisibilityTests(unittest.IsolatedAsyncioTestCase):
    async def test_rich_content_public_slug_requires_public_published_active_unarchived(self):
        db = _FakeDb()

        with patch.object(content, "_archive_expired_content", _skip_archive):
            await NewsService.get_by_slug(db, "campus-update", public_only=True)

        self.assertEqual(1, len(db.statements))
        query_text = str(db.statements[0]).lower()

        self.assertIn("news.slug", query_text)
        self.assertIn("news.is_public is true", query_text)
        self.assertIn("news.is_published is true", query_text)
        self.assertIn("news.archived_at is null", query_text)
        self.assertIn("news.valid_from is null", query_text)
        self.assertIn("news.valid_to is null", query_text)
        self.assertIn("news.deleted_at is null", query_text)

    async def test_event_public_slug_requires_public_published_active_unarchived(self):
        db = _FakeDb()

        with patch.object(content, "_archive_expired_content", _skip_archive):
            await EventService.get_by_slug(db, "orientation-week", public_only=True)

        self.assertEqual(1, len(db.statements))
        query_text = str(db.statements[0]).lower()

        self.assertIn("events.slug", query_text)
        self.assertIn("events.is_public is true", query_text)
        self.assertIn("events.is_published is true", query_text)
        self.assertIn("events.archived_at is null", query_text)
        self.assertIn("events.valid_from is null", query_text)
        self.assertIn("events.valid_to is null", query_text)
        self.assertIn("events.deleted_at is null", query_text)


if __name__ == "__main__":
    unittest.main()
