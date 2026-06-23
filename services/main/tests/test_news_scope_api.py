import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import patch

from fastapi import HTTPException

from app.api.v1 import news
from app.schemas import NewsCreate, NewsUpdate


class _FakeSelector:
    load_options = ()

    def apply(self, value):
        return value


class _Page:
    def __init__(self, items):
        self.items = items
        self.meta = {"total": len(items)}


def _news(scope_type, scope_id):
    return SimpleNamespace(
        id=uuid.uuid4(),
        scope_type=scope_type,
        scope_id=scope_id,
    )


class NewsScopeApiTests(unittest.IsolatedAsyncioTestCase):
    async def test_admin_news_list_filters_by_user_scope(self):
        own_wing_id = uuid.uuid4()
        other_wing_id = uuid.uuid4()
        user = SimpleNamespace(id=uuid.uuid4())
        page = _Page([
            _news("wing", own_wing_id),
            _news("wing", other_wing_id),
        ])

        async def fake_can_access(_db, _user, _permission, _scope_type, scope_id):
            return scope_id == own_wing_id

        with (
            patch.object(news, "build_selector", return_value=_FakeSelector()),
            patch.object(news.NewsService, "list_admin", return_value=page),
            patch.object(news, "can_access_scope", side_effect=fake_can_access, create=True),
        ):
            response = await news.list_admin_news(db=None, user=user)

        self.assertEqual([page.items[0]], response["data"])
        self.assertEqual(1, response["meta"]["total"])

    async def test_get_news_by_id_rejects_unowned_scope(self):
        user = SimpleNamespace(id=uuid.uuid4())
        item = _news("wing", uuid.uuid4())

        with (
            patch.object(news, "build_selector", return_value=_FakeSelector()),
            patch.object(news.NewsService, "get_by_id", return_value=item),
            patch.object(news, "can_access_scope", return_value=False, create=True),
        ):
            with self.assertRaises(HTTPException) as context:
                await news.get_news_by_id(item.id, db=None, user=user)

        self.assertEqual(403, context.exception.status_code)

    async def test_create_news_rejects_unowned_scope(self):
        user = SimpleNamespace(id=uuid.uuid4())
        payload = NewsCreate(
            title="Office update",
            slug="office-update",
            scope_type="wing",
            scope_id=uuid.uuid4(),
        )

        with patch.object(news, "can_access_scope", return_value=False, create=True):
            with self.assertRaises(HTTPException) as context:
                await news.create_news(payload, db=None, user=user)

        self.assertEqual(403, context.exception.status_code)

    async def test_update_news_checks_existing_and_next_scope(self):
        own_wing_id = uuid.uuid4()
        other_wing_id = uuid.uuid4()
        user = SimpleNamespace(id=uuid.uuid4())
        item = _news("wing", own_wing_id)
        payload = NewsUpdate(scope_type="wing", scope_id=other_wing_id)

        async def fake_can_access(_db, _user, _permission, _scope_type, scope_id):
            return scope_id == own_wing_id

        with (
            patch.object(news.NewsService, "get_by_id", return_value=item),
            patch.object(news, "can_access_scope", side_effect=fake_can_access, create=True),
        ):
            with self.assertRaises(HTTPException) as context:
                await news.update_news(item.id, payload, db=None, user=user)

        self.assertEqual(403, context.exception.status_code)


if __name__ == "__main__":
    unittest.main()
