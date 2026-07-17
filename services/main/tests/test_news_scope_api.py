import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

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
    async def test_create_news_forces_server_owned_private_draft_metadata(self):
        user = SimpleNamespace(id=uuid.uuid4())
        scope_id = uuid.uuid4()
        payload = NewsCreate(
            title="School update",
            slug="school-update",
            scope_type="school",
            scope_id=scope_id,
        )
        create = AsyncMock(return_value=SimpleNamespace(id=uuid.uuid4()))

        with (
            patch.object(news.NewsService, "create", create),
            patch("app.api.v1._scoped._can_access_scope", return_value=True),
        ):
            await news.create_news(payload, db=None, user=user)

        sent = create.await_args.kwargs
        self.assertEqual("draft", sent["status"])
        self.assertEqual("draft", sent["workflow_status"])
        self.assertFalse(sent["is_public"])
        self.assertFalse(sent["is_published"])
        self.assertEqual(user.id, sent["author_user_id"])
        self.assertEqual("schools", sent["owner_portal"])
        self.assertEqual("school", sent["owner_scope_type"])
        self.assertEqual(scope_id, sent["owner_scope_id"])

    async def test_update_published_news_is_rejected_instead_of_resetting_review(self):
        user = SimpleNamespace(id=uuid.uuid4())
        item = _news("wing", uuid.uuid4())
        item.status = "published"
        item.workflow_status = "published"
        payload = NewsUpdate(title="Revised title")
        db = SimpleNamespace()
        with (
            patch.object(news.NewsService, "get_by_id", AsyncMock(return_value=item)),
            patch.object(news.NewsService, "update", AsyncMock(return_value=item)),
            patch.object(news, "permissions_for_user", return_value={"content.edit"}),
            patch("app.api.v1._scoped._can_access_scope", return_value=True),
        ):
            with self.assertRaises(HTTPException) as caught:
                await news.update_news(item.id, payload, db=db, user=user)

        self.assertEqual(409, caught.exception.status_code)

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
            patch("app.api.v1._scoped._can_access_scope", side_effect=fake_can_access),
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
            patch("app.api.v1._scoped._can_access_scope", return_value=False),
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

        with patch("app.api.v1._scoped._can_access_scope", return_value=False):
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
            patch("app.api.v1._scoped._can_access_scope", side_effect=fake_can_access),
        ):
            with self.assertRaises(HTTPException) as context:
                await news.update_news(item.id, payload, db=None, user=user)

        self.assertEqual(403, context.exception.status_code)


if __name__ == "__main__":
    unittest.main()
