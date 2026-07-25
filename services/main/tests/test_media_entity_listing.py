import unittest
import uuid

from app.services.media import MediaService


class _ScalarResult:
    def __init__(self, rows=()):
        self._rows = rows

    def scalar_one(self):
        return len(self._rows)

    def scalars(self):
        return self

    def all(self):
        return list(self._rows)


class _StatementDb:
    def __init__(self):
        self.statements = []

    async def execute(self, statement):
        self.statements.append(statement)
        return _ScalarResult()


class MediaEntityListingTests(unittest.IsolatedAsyncioTestCase):
    async def test_media_list_can_filter_by_linked_entity(self):
        db = _StatementDb()
        user = type("User", (), {"has_role": lambda self, role: True, "role_assignments": []})()
        entity_id = uuid.uuid4()

        await MediaService.list(
            db,
            user=user,
            entity_type="research",
            entity_id=entity_id,
            role="gallery",
        )

        query_text = str(db.statements[0]).lower()
        self.assertIn("media_links", query_text)
        self.assertIn("media_links.entity_type", query_text)
        self.assertIn("media_links.entity_id", query_text)
        self.assertIn("media_links.role", query_text)


if __name__ == "__main__":
    unittest.main()
