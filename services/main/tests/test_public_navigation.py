import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from app.api.v1 import navigation
from app.api.v1.navigation import (
    NAV_CLUBS_LIMIT,
    NAV_DEPARTMENTS_LIMIT,
    NAV_DIVISIONS_LIMIT,
    NAV_SCHOOLS_LIMIT,
    _load_navigation_data,
    _navigation_payload,
    _wings_statement,
)


def _record(**extra):
    return SimpleNamespace(
        id=uuid.uuid4(),
        name=extra.pop("name", "Record"),
        slug=extra.pop("slug", "record"),
        **extra,
    )


class _FakeScalarResult:
    def __init__(self, items):
        self._items = items

    def scalars(self):
        return self

    def all(self):
        return self._items


class _FakeDb:
    def __init__(self, wings):
        self._wings = wings

    async def execute(self, _stmt):
        return _FakeScalarResult(self._wings)


class NavigationPayloadTests(unittest.TestCase):
    def test_payload_groups_exact_nav_field_sets(self):
        school = _record(name="School of Law", slug="school-of-law")
        division = _record(
            name="Administration", slug="administration", division_type="division"
        )
        department = _record(
            name="Finance",
            slug="finance",
            code="FIN",
            school_id=school.id,
            department_type="administrative",
        )
        club = _record(name="Chess Club", slug="chess-club")
        wing = _record(name="Registrar AA", slug="registrar-aa", code="RAA")

        payload = _navigation_payload(
            schools=[school],
            divisions=[division],
            departments=[department],
            clubs=[club],
            wings=[wing],
        )

        self.assertEqual(
            {"schools", "divisions", "departments", "clubs", "wings"},
            set(payload),
        )
        self.assertEqual(
            {"id": school.id, "name": "School of Law", "slug": "school-of-law"},
            payload["schools"][0],
        )
        self.assertEqual(
            {
                "id": division.id,
                "name": "Administration",
                "slug": "administration",
                "division_type": "division",
            },
            payload["divisions"][0],
        )
        self.assertEqual(
            {
                "id": department.id,
                "name": "Finance",
                "slug": "finance",
                "code": "FIN",
                "school_id": school.id,
                "department_type": "administrative",
            },
            payload["departments"][0],
        )
        self.assertEqual(
            {"id": club.id, "name": "Chess Club", "slug": "chess-club"},
            payload["clubs"][0],
        )
        self.assertEqual(
            {
                "id": wing.id,
                "name": "Registrar AA",
                "slug": "registrar-aa",
                "code": "RAA",
            },
            payload["wings"][0],
        )

    def test_wings_statement_only_selects_active_wings_of_active_divisions(self):
        query_text = str(_wings_statement()).lower()

        self.assertIn("wings.is_active is true", query_text)
        self.assertIn("divisions.is_active is true", query_text)
        self.assertIn("divisions.division_type =", query_text)


class NavigationLoadTests(unittest.IsolatedAsyncioTestCase):
    async def test_load_reuses_public_service_defaults_and_limits(self):
        school = _record(name="School of Law", slug="school-of-law")
        division = _record(
            name="Administration", slug="administration", division_type="division"
        )
        department = _record(
            name="Finance",
            slug="finance",
            code="FIN",
            school_id=school.id,
            department_type="administrative",
        )
        club = _record(name="Chess Club", slug="chess-club")
        wing = _record(name="Registrar AA", slug="registrar-aa", code="RAA")

        schools_list = AsyncMock(return_value=SimpleNamespace(items=[school]))
        divisions_list = AsyncMock(return_value=SimpleNamespace(items=[division]))
        departments_list = AsyncMock(return_value=SimpleNamespace(items=[department]))
        clubs_list = AsyncMock(return_value=SimpleNamespace(items=[club]))
        db = _FakeDb([wing])

        with (
            patch.object(navigation.SchoolService, "list", schools_list),
            patch.object(navigation.DivisionService, "list", divisions_list),
            patch.object(navigation.DepartmentService, "list", departments_list),
            patch.object(navigation.ClubService, "list", clubs_list),
        ):
            payload = await _load_navigation_data(db)

        schools_list.assert_awaited_once_with(db, page=1, per_page=NAV_SCHOOLS_LIMIT)
        divisions_list.assert_awaited_once_with(db, page=1, per_page=NAV_DIVISIONS_LIMIT)
        departments_list.assert_awaited_once_with(
            db,
            page=1,
            per_page=NAV_DEPARTMENTS_LIMIT,
            department_type="administrative",
        )
        clubs_list.assert_awaited_once_with(db, page=1, per_page=NAV_CLUBS_LIMIT)

        self.assertEqual([school.id], [item["id"] for item in payload["schools"]])
        self.assertEqual([division.id], [item["id"] for item in payload["divisions"]])
        self.assertEqual(
            [department.id], [item["id"] for item in payload["departments"]]
        )
        self.assertEqual([club.id], [item["id"] for item in payload["clubs"]])
        self.assertEqual([wing.id], [item["id"] for item in payload["wings"]])


if __name__ == "__main__":
    unittest.main()
