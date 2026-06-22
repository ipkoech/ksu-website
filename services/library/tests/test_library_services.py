import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from app.services import library as library_service
from app.services import resources as resources_service


class LibraryServiceFilterTests(unittest.IsolatedAsyncioTestCase):
    async def test_list_libraries_filters_public_records_by_default(self):
        captured = {}

        async def fake_paginate(_db, query, **kwargs):
            captured["query"] = query
            captured["kwargs"] = kwargs
            return SimpleNamespace(items=[], meta={})

        with patch.object(library_service, "paginate", new=fake_paginate):
            await library_service.list_libraries(AsyncMock())

        whereclause = str(captured["query"].whereclause)
        self.assertIn("libraries.is_active", whereclause)
        self.assertIn("libraries.is_public", whereclause)
        self.assertEqual(captured["kwargs"]["page"], 1)
        self.assertEqual(captured["kwargs"]["per_page"], 20)

    async def test_list_libraries_can_include_private_records_for_internal_use(self):
        captured = {}

        async def fake_paginate(_db, query, **kwargs):
            captured["query"] = query
            return SimpleNamespace(items=[], meta={})

        with patch.object(library_service, "paginate", new=fake_paginate):
            await library_service.list_libraries(
                AsyncMock(),
                active_only=False,
                public_only=False,
            )

        whereclause = str(captured["query"].whereclause)
        self.assertNotIn("libraries.is_active", whereclause)
        self.assertNotIn("libraries.is_public", whereclause)


class LibraryCirculationFilterTests(unittest.IsolatedAsyncioTestCase):
    async def test_list_loans_filters_by_library_branch(self):
        captured = {}
        library_id = uuid.uuid4()

        async def fake_paginate(_db, query, **kwargs):
            captured["query"] = query
            captured["kwargs"] = kwargs
            return SimpleNamespace(items=[], meta={})

        with patch.object(resources_service, "paginate", new=fake_paginate):
            await resources_service.list_loans(AsyncMock(), library_id=library_id)

        query_text = str(captured["query"])
        self.assertIn("library_resources", query_text)
        self.assertIn("library_id", query_text)

    async def test_list_reservations_filters_by_library_branch(self):
        captured = {}
        library_id = uuid.uuid4()

        async def fake_paginate(_db, query, **kwargs):
            captured["query"] = query
            captured["kwargs"] = kwargs
            return SimpleNamespace(items=[], meta={})

        with patch.object(resources_service, "paginate", new=fake_paginate):
            await resources_service.list_reservations(
                AsyncMock(), library_id=library_id
            )

        query_text = str(captured["query"])
        self.assertIn("library_resources", query_text)
        self.assertIn("library_id", query_text)


if __name__ == "__main__":
    unittest.main()
