import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from app.services import library as library_service


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


if __name__ == "__main__":
    unittest.main()
