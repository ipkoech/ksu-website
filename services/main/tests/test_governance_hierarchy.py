import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from sqlalchemy.dialects import postgresql

from app.api.v1 import governance
from app.seeders import seed_governance as governance_seeder
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


class _ScalarOneResult:
    def __init__(self, row):
        self._row = row

    def scalar_one_or_none(self):
        return self._row


class _RecordingDb:
    def __init__(self, rows=()):
        self.rows = list(rows)
        self.query = None

    async def execute(self, query):
        self.query = query
        return _Result(self.rows)


class _SeederRecordingDb:
    def __init__(self, existing_roles, existing_page_content):
        self._results = [*(_ScalarOneResult(role) for role in existing_roles), _ScalarOneResult(existing_page_content)]
        self.added = []

    async def execute(self, query):
        return self._results.pop(0)

    def add(self, value):
        self.added.append(value)


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

    async def test_public_board_members_require_published_governance_workflow(self):
        db = _RecordingDb()

        await GovernanceService.get_members(db, uuid.uuid4(), public_only=True)

        query = str(
            db.query.compile(
                dialect=postgresql.dialect(),
                compile_kwargs={"literal_binds": True},
            )
        ).lower()
        self.assertIn("staff_assignments.is_public is true", query)
        self.assertIn("staff_assignments.workflow_status = 'published'", query)
        self.assertIn("staff_assignments.appointment_status = 'published'", query)

    async def test_public_board_members_route_requests_published_members_only(self):
        board = SimpleNamespace(id=uuid.uuid4())
        get_members = AsyncMock(return_value=[])

        with (
            patch.object(GovernanceService, "get_board_by_slug", new_callable=AsyncMock, return_value=board),
            patch.object(GovernanceService, "get_members", get_members),
            patch.object(governance, "build_selector", return_value=_FakeSelector()),
            patch.object(governance, "with_person_photo_urls", side_effect=lambda payload, _members: payload),
        ):
            await governance.get_board_members.__wrapped__(slug="university-council", db=None, fields=None)

        get_members.assert_awaited_once_with(None, board.id, public_only=True)

    async def test_governance_seed_preserves_existing_role_and_page_content(self):
        existing_roles = [
            SimpleNamespace(name=f"Custom {slug}", public_label=f"Custom {slug}", is_active=False)
            for _, slug, *_ in governance_seeder.GOVERNANCE_ROLE_SPECS
        ]
        existing_page_content = SimpleNamespace(
            title="Custom Council Page",
            mandate_body="Custom mandate",
            workflow_status="draft",
        )
        db = _SeederRecordingDb(existing_roles, existing_page_content)
        people = {key: SimpleNamespace(id=uuid.uuid4()) for key in ("council_chair", "vice_chancellor")}
        board = SimpleNamespace(id=uuid.uuid4(), mandate="Seed mandate")

        with (
            patch.object(
                governance_seeder,
                "get_or_create_person",
                new_callable=AsyncMock,
                side_effect=lambda _db, _ctx, key, **_kwargs: people.setdefault(key, SimpleNamespace(id=uuid.uuid4())),
            ),
            patch.object(governance_seeder, "upsert_board", new_callable=AsyncMock, return_value=board),
        ):
            await governance_seeder.seed_governance(db, ctx=SimpleNamespace())

        self.assertEqual([], db.added)
        self.assertEqual("Custom chairperson", existing_roles[0].name)
        self.assertEqual("Custom chairperson", existing_roles[0].public_label)
        self.assertFalse(existing_roles[0].is_active)
        self.assertEqual("Custom Council Page", existing_page_content.title)
        self.assertEqual("Custom mandate", existing_page_content.mandate_body)
        self.assertEqual("draft", existing_page_content.workflow_status)

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
