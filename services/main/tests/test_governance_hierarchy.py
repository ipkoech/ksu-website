import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import patch

from sqlalchemy.dialects import postgresql

from app.api.v1 import governance
from app.services.governance import GovernanceService


class _ScalarRows:
    def __init__(self, rows):
        self._rows = rows

    def all(self):
        return self._rows


class _Result:
    def __init__(self, rows):
        self._rows = rows

    def scalars(self):
        return _ScalarRows(self._rows)


class _RecordingDb:
    def __init__(self, rows=()):
        self.rows = list(rows)
        self.query = None

    async def execute(self, query):
        self.query = query
        return _Result(self.rows)


class _FakeSelector:
    load_options = ()

    def apply(self, value):
        return value


class GovernanceHierarchyTests(unittest.IsolatedAsyncioTestCase):
    async def test_boards_list_by_display_order_then_name(self):
        db = _RecordingDb()

        await GovernanceService.list_boards(db)

        query = str(
            db.query.compile(
                dialect=postgresql.dialect(),
                compile_kwargs={"literal_binds": True},
            )
        ).lower()
        self.assertIn("order by boards.display_order asc, boards.name asc", query)

    async def test_board_members_list_by_hierarchy_display_order_then_person_name(self):
        db = _RecordingDb()

        await GovernanceService.get_members(db, uuid.uuid4())

        query = str(
            db.query.compile(
                dialect=postgresql.dialect(),
                compile_kwargs={"literal_binds": True},
            )
        ).lower()
        self.assertIn(
            "order by staff_assignments.hierarchy_level asc, staff_assignments.display_order asc, persons.full_name asc",
            query,
        )

    async def test_council_returns_members_with_display_and_reporting_data(self):
        chair_id = uuid.uuid4()
        member_id = uuid.uuid4()
        board = SimpleNamespace(
            id=uuid.uuid4(),
            name="University Council",
            slug="university-council",
            board_type="council",
            description=None,
            mandate=None,
            mission=None,
            vision=None,
            meeting_schedule=None,
            display_order=10,
        )
        chair = SimpleNamespace(
            id=chair_id,
            person=SimpleNamespace(display_name="Prof. Ada Chair"),
            role="chairperson",
            hierarchy_level=1,
            display_order=10,
            reports_to=None,
            title=None,
            is_acting=False,
        )
        member = SimpleNamespace(
            id=member_id,
            person=SimpleNamespace(display_name="Dr. Bea Member"),
            role="member",
            hierarchy_level=2,
            display_order=20,
            reports_to=chair,
            title=None,
            is_acting=False,
        )

        with (
            patch.object(GovernanceService, "get_board_by_slug", return_value=board),
            patch.object(GovernanceService, "get_members", return_value=[chair, member]),
            patch.object(governance, "build_selector", return_value=_FakeSelector()),
        ):
            response = await governance.get_council.__wrapped__(db=None, fields=None)

        data = response["data"]
        self.assertIsInstance(data, dict)
        self.assertEqual("University Council", data["display_label"])
        self.assertEqual("Chairperson", data["members"][0]["role_label"])
        self.assertEqual("Prof. Ada Chair", data["members"][1]["reports_to"]["display_label"])

    async def test_management_board_returns_members_with_display_and_reporting_data(self):
        board = SimpleNamespace(
            id=uuid.uuid4(),
            name="Management Board",
            slug="management-board",
            board_type="management_board",
            description=None,
            mandate=None,
            mission=None,
            vision=None,
            meeting_schedule=None,
            display_order=20,
        )
        vc = SimpleNamespace(
            id=uuid.uuid4(),
            person=SimpleNamespace(display_name="Prof. Vice Chancellor"),
            role="vc",
            hierarchy_level=2,
            display_order=10,
            reports_to=None,
            title=None,
            is_acting=False,
        )

        with (
            patch.object(GovernanceService, "get_board_by_slug", return_value=board),
            patch.object(GovernanceService, "get_members", return_value=[vc]),
            patch.object(governance, "build_selector", return_value=_FakeSelector()),
        ):
            response = await governance.get_management_board.__wrapped__(db=None, fields=None)

        data = response["data"]
        self.assertIsInstance(data, dict)
        member = data["members"][0]
        self.assertEqual("Prof. Vice Chancellor", member["display_label"])
        self.assertEqual("Vc", member["role_label"])
        self.assertIsNone(member["reports_to"])


if __name__ == "__main__":
    unittest.main()
