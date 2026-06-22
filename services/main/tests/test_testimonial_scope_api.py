import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import patch

from fastapi import HTTPException

from app.api.v1 import testimonials
from app import schemas


class _FakeSelector:
    load_options = ()

    def apply(self, value):
        return value


class _Page:
    def __init__(self, items):
        self.items = items
        self.meta = {"total": len(items)}


def _testimonial(**overrides):
    values = {
        "id": uuid.uuid4(),
        "school_id": None,
        "department_id": None,
        "programme_id": None,
    }
    values.update(overrides)
    return SimpleNamespace(**values)


class TestimonialScopeApiTests(unittest.IsolatedAsyncioTestCase):
    async def test_admin_testimonials_list_filters_by_user_scope(self):
        own_school_id = uuid.uuid4()
        other_school_id = uuid.uuid4()
        user = SimpleNamespace(id=uuid.uuid4())
        page = _Page([
            _testimonial(school_id=own_school_id),
            _testimonial(school_id=other_school_id),
        ])

        async def fake_can_access(_db, _user, _permission, _scope_type, scope_id):
            return scope_id == own_school_id

        with (
            patch.object(testimonials, "build_selector", return_value=_FakeSelector()),
            patch.object(testimonials.TestimonialService, "list", return_value=page),
            patch.object(testimonials, "can_access_scope", side_effect=fake_can_access, create=True),
        ):
            response = await testimonials.list_admin_testimonials(db=None, user=user)

        self.assertEqual([page.items[0]], response["data"])
        self.assertEqual(1, response["meta"]["total"])

    async def test_create_testimonial_rejects_unowned_school_scope(self):
        user = SimpleNamespace(id=uuid.uuid4())
        payload = schemas.TestimonialCreate(
            name="Alumni Story",
            quote="Kisii University shaped my career.",
            testimonial_type="alumni",
            school_id=uuid.uuid4(),
        )

        with patch.object(testimonials, "can_access_scope", return_value=False, create=True):
            with self.assertRaises(HTTPException) as context:
                await testimonials.create_testimonial(payload, db=None, user=user)

        self.assertEqual(403, context.exception.status_code)

    async def test_update_testimonial_checks_existing_and_next_scope(self):
        own_department_id = uuid.uuid4()
        other_department_id = uuid.uuid4()
        user = SimpleNamespace(id=uuid.uuid4())
        item = _testimonial(department_id=own_department_id)
        payload = schemas.TestimonialUpdate(department_id=other_department_id)

        async def fake_can_access(_db, _user, _permission, _scope_type, scope_id):
            return scope_id == own_department_id

        with (
            patch.object(testimonials.TestimonialService, "get_by_id", return_value=item),
            patch.object(testimonials, "can_access_scope", side_effect=fake_can_access, create=True),
        ):
            with self.assertRaises(HTTPException) as context:
                await testimonials.update_testimonial(item.id, payload, db=None, user=user)

        self.assertEqual(403, context.exception.status_code)


if __name__ == "__main__":
    unittest.main()
