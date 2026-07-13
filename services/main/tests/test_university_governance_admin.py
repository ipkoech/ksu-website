import unittest
import uuid
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from sqlalchemy.dialects import postgresql

from app.api.v1 import governance as governance_api
from app.models import GovernancePageContent, GovernanceRole, StaffAssignment
from app.schemas import CouncilMemberCreate, CouncilOrderUpdate, GovernanceRoleCreate
from app.services import AuditService
from app.services.governance import GovernanceService


class UniversityGovernanceAdminSchemaTests(unittest.TestCase):
    def test_governance_role_model_has_configurable_public_grouping_fields(self):
        columns = GovernanceRole.__table__.columns

        for name in (
            "name",
            "slug",
            "category",
            "display_group",
            "public_label",
            "default_hierarchy_level",
            "default_display_order",
            "badge_style",
            "is_active",
        ):
            self.assertIn(name, columns)

    def test_governance_page_content_model_has_hero_and_mandate_fields(self):
        columns = GovernancePageContent.__table__.columns

        for name in (
            "board_id",
            "page_key",
            "title",
            "intro",
            "hero_image_id",
            "hero_focal_point",
            "overlay_intensity",
            "mandate_label",
            "mandate_heading",
            "mandate_body",
            "document_cta_label",
            "document_cta_url",
            "workflow_status",
            "published_at",
        ):
            self.assertIn(name, columns)

    def test_staff_assignment_has_governance_appointment_fields(self):
        columns = StaffAssignment.__table__.columns

        for name in (
            "governance_role_id",
            "appointment_category",
            "official_designation",
            "public_role_label",
            "represented_institution",
            "appointing_authority",
            "term_number",
            "is_ex_officio",
            "is_voting_member",
            "profile_slug",
            "appointment_status",
            "workflow_status",
            "published_at",
            "publish_without_portrait_override",
        ):
            self.assertIn(name, columns)

    def test_council_member_schema_accepts_governance_metadata(self):
        payload = CouncilMemberCreate(
            person_id=uuid.uuid4(),
            governance_role_id=uuid.uuid4(),
            public_role_label="Government Representative",
            appointment_category="government_representative",
            profile_slug="hon-mary-mokua",
            display_order=20,
        )

        self.assertEqual("Government Representative", payload.public_role_label)
        self.assertEqual("government_representative", payload.appointment_category)

    def test_council_order_update_requires_nodes(self):
        order = CouncilOrderUpdate(
            nodes=[
                {
                    "assignment_id": uuid.uuid4(),
                    "display_group": "chairperson",
                    "display_order": 1,
                    "hierarchy_level": 1,
                    "reports_to_id": None,
                }
            ]
        )

        self.assertEqual(1, len(order.nodes))

    def test_governance_role_slug_is_schema_validated(self):
        role = GovernanceRoleCreate(
            name="Government Representative",
            slug="government-representative",
            category="representative",
            display_group="member",
            public_label="Government Representative",
        )

        self.assertEqual("government-representative", role.slug)

    def test_governance_migration_adds_unique_profile_slug_index_name(self):
        indexes = {index.name for index in StaffAssignment.__table__.indexes}

        self.assertIn("uq_staff_assignments_governance_profile_slug", indexes)

    def test_governance_role_table_compiles_for_postgres(self):
        statement = GovernanceRole.__table__.select()

        compiled = str(statement.compile(dialect=postgresql.dialect())).lower()

        self.assertIn("governance_roles", compiled)


class UniversityGovernanceAdminServiceTests(unittest.IsolatedAsyncioTestCase):
    async def test_public_page_content_query_requires_published_workflow(self):
        class RecordingDb:
            query = None

            async def execute(self, query):
                self.query = query
                return SimpleNamespace(scalar_one_or_none=lambda: None)

        db = RecordingDb()

        await GovernanceService.get_council_page_content(db, uuid.uuid4(), published_only=True)

        compiled = str(db.query.compile(dialect=postgresql.dialect(), compile_kwargs={"literal_binds": True})).lower()
        self.assertIn("governance_page_content.workflow_status = 'published'", compiled)

    async def test_public_council_groups_members_by_display_group_in_order(self):
        board = SimpleNamespace(
            id=uuid.uuid4(),
            name="University Council",
            slug="university-council",
            description="Council description",
        )
        page = SimpleNamespace(
            title="University Council",
            intro="Council intro",
            mandate_label="Our Mandate",
            mandate_heading="Our Mandate",
            mandate_body="Council mandate text",
            document_cta_label="Council Charter",
            document_cta_url="/about/governance/documents",
            hero_image=None,
        )
        role_chair = SimpleNamespace(display_group="chairperson", public_label="Chairperson", badge_style="green")
        role_member = SimpleNamespace(display_group="member", public_label="Government Representative", badge_style="blue")
        role_secretary = SimpleNamespace(display_group="secretary", public_label="Secretary to Council", badge_style="gray")

        def member(name, role, order):
            return SimpleNamespace(
                id=uuid.uuid4(),
                person=SimpleNamespace(display_name=name, photo_url=None, photo=None),
                governance_role=role,
                public_role_label=role.public_label,
                role=role.public_label.lower().replace(" ", "_"),
                title=None,
                profile_slug=name.lower().replace(" ", "-"),
                profile_summary=None,
                display_order=order,
                hierarchy_level=1 if role.display_group == "chairperson" else 3 if role.display_group == "secretary" else 2,
                published_at=datetime.now(timezone.utc),
                is_acting=False,
            )

        with (
            patch.object(GovernanceService, "get_university_council_board", return_value=board),
            patch.object(GovernanceService, "get_council_page_content", return_value=page),
            patch.object(
                GovernanceService,
                "list_council_members",
                return_value=[
                    member("Prof Chair", role_chair, 1),
                    member("Hon Member", role_member, 20),
                    member("Mr Secretary", role_secretary, 1000),
                ],
            ),
        ):
            data = await GovernanceService.public_university_council(object())

        self.assertEqual("Prof Chair", data["chairperson"]["name"])
        self.assertEqual("Hon Member", data["members"][0]["name"])
        self.assertEqual("Mr Secretary", data["secretary"]["name"])

    async def test_order_update_rejects_duplicate_group_order(self):
        first_id = uuid.uuid4()
        duplicate_id = uuid.uuid4()
        assignments = {
            first_id: SimpleNamespace(
                id=first_id, governance_role=SimpleNamespace(display_group="member"), reports_to_id=None
            ),
            duplicate_id: SimpleNamespace(
                id=duplicate_id, governance_role=SimpleNamespace(display_group="member"), reports_to_id=None
            ),
        }
        nodes = [
            {"assignment_id": first_id, "display_group": "chairperson", "display_order": 10, "hierarchy_level": 2, "reports_to_id": None},
            {"assignment_id": duplicate_id, "display_group": "secretary", "display_order": 10, "hierarchy_level": 2, "reports_to_id": None},
        ]

        with self.assertRaisesRegex(ValueError, "Duplicate display order"):
            await GovernanceService.validate_council_order_nodes(nodes, assignments_by_id=assignments)

    async def test_order_update_rejects_duplicate_assignment_ids(self):
        assignment_id = uuid.uuid4()
        assignment = SimpleNamespace(id=assignment_id, governance_role=SimpleNamespace(display_group="member"), reports_to_id=None)
        nodes = [
            {"assignment_id": assignment_id, "display_group": "chairperson", "display_order": 10, "hierarchy_level": 2, "reports_to_id": None},
            {"assignment_id": assignment_id, "display_group": "secretary", "display_order": 20, "hierarchy_level": 2, "reports_to_id": None},
        ]

        with self.assertRaisesRegex(ValueError, "Duplicate assignment"):
            await GovernanceService.validate_council_order_nodes(nodes, {assignment_id: assignment})

    async def test_order_update_rejects_inactive_assignment(self):
        active = SimpleNamespace(id=uuid.uuid4(), governance_role=SimpleNamespace(display_group="member"), reports_to_id=None)
        inactive_id = uuid.uuid4()
        nodes = [
            {"assignment_id": inactive_id, "display_group": "member", "display_order": 10, "hierarchy_level": 2, "reports_to_id": None},
        ]

        with patch.object(GovernanceService, "list_council_members", new_callable=AsyncMock, return_value=[active]):
            with self.assertRaisesRegex(ValueError, "outside this board"):
                await GovernanceService.update_council_order(object(), nodes, uuid.uuid4())

    async def test_create_council_member_forces_draft_workflow_state(self):
        board = SimpleNamespace(id=uuid.uuid4())
        role = SimpleNamespace(
            id=uuid.uuid4(),
            slug="council-member",
            category="representative",
            default_hierarchy_level=2,
            default_display_order=20,
        )
        db = SimpleNamespace(added=[], flush=AsyncMock(), refresh=AsyncMock())
        db.add = db.added.append
        payload = {
            "person_id": uuid.uuid4(),
            "governance_role_id": role.id,
            "public_role_label": "Representative",
            "workflow_status": "published",
            "appointment_status": "published",
        }

        with (
            patch.object(GovernanceService, "get_university_council_board", return_value=board),
            patch.object(GovernanceService, "get_governance_role", return_value=role),
        ):
            assignment = await GovernanceService.create_council_member(db, payload, uuid.uuid4())

        self.assertEqual("draft", assignment.workflow_status)
        self.assertEqual("draft", assignment.appointment_status)

    async def test_page_content_update_ignores_workflow_injection_and_unpublishes_content(self):
        published_at = datetime.now(timezone.utc)
        page = SimpleNamespace(
            title="Published title",
            status="published",
            workflow_status="published",
            published_at=published_at,
            updated_by_id=None,
        )
        db = SimpleNamespace(flush=AsyncMock(), refresh=AsyncMock())

        with patch.object(GovernanceService, "get_council_page_content", return_value=page):
            updated = await GovernanceService.upsert_council_page_content(
                db,
                uuid.uuid4(),
                {"title": "Pending title", "status": "approved", "workflow_status": "published"},
                uuid.uuid4(),
            )

        self.assertIs(page, updated)
        self.assertEqual("Pending title", page.title)
        self.assertEqual("draft", page.status)
        self.assertEqual("draft", page.workflow_status)
        self.assertIsNone(page.published_at)

    async def test_update_council_member_rejects_direct_workflow_changes(self):
        assignment = SimpleNamespace(workflow_status="draft", appointment_status="draft")

        with self.assertRaisesRegex(ValueError, "workflow state"):
            await GovernanceService.update_council_member(
                object(), assignment, {"workflow_status": "published"}, uuid.uuid4()
            )

    async def test_published_member_edit_reenters_draft_workflow(self):
        published_at = datetime.now(timezone.utc)
        assignment = SimpleNamespace(
            workflow_status="published",
            appointment_status="published",
            published_at=published_at,
            public_role_label="Previous representative",
        )
        db = SimpleNamespace(flush=AsyncMock(), refresh=AsyncMock())

        updated = await GovernanceService.update_council_member(
            db,
            assignment,
            {"public_role_label": "Updated representative"},
            uuid.uuid4(),
        )

        self.assertIs(assignment, updated)
        self.assertEqual("Updated representative", assignment.public_role_label)
        self.assertEqual("draft", assignment.workflow_status)
        self.assertEqual("draft", assignment.appointment_status)
        self.assertIsNone(assignment.published_at)

    async def test_council_audit_log_uses_council_path_scope(self):
        db = object()
        result = SimpleNamespace(items=[], meta={"page": 2, "per_page": 10, "total": 0, "pages": 0})

        with patch.object(AuditService, "list", new_callable=AsyncMock, return_value=result) as audit_list:
            await governance_api.list_council_audit_log(db, object(), page=2, per_page=10)

        audit_list.assert_awaited_once_with(
            db,
            page=2,
            per_page=10,
            request_path_prefix="/api/v1/governance/admin/council",
        )

    def test_admin_member_read_includes_readable_reports_to_summary(self):
        chair = SimpleNamespace(
            id=uuid.uuid4(),
            person=SimpleNamespace(display_name="Prof. Ada Chair"),
            public_role_label="Chairperson",
            governance_role=SimpleNamespace(public_label="Chairperson"),
            role="chairperson",
            title=None,
        )
        member = SimpleNamespace(reports_to=chair)

        self.assertEqual(
            {"id": chair.id, "display_label": "Prof. Ada Chair", "role_label": "Chairperson"},
            GovernanceService.council_member_reports_to_summary(member),
        )

    async def test_workflow_publish_requires_approved_status(self):
        assignment = SimpleNamespace(workflow_status="draft", appointment_status="draft")

        with self.assertRaisesRegex(ValueError, "Invalid workflow transition"):
            await GovernanceService.transition_council_member(object(), assignment, "publish", uuid.uuid4())

    async def test_workflow_submit_approve_publish_unpublish_sequence(self):
        user_id = uuid.uuid4()
        assignment = SimpleNamespace(
            workflow_status="draft",
            appointment_status="draft",
            submitted_by_id=None,
            submitted_at=None,
            approved_by_id=None,
            approved_at=None,
            published_by_id=None,
            published_at=None,
            unpublished_at=None,
        )

        await GovernanceService.transition_council_member(object(), assignment, "submit-review", user_id)
        self.assertEqual("submitted", assignment.workflow_status)

        await GovernanceService.transition_council_member(object(), assignment, "approve", user_id)
        self.assertEqual("approved", assignment.workflow_status)

        await GovernanceService.transition_council_member(object(), assignment, "publish", user_id)
        self.assertEqual("published", assignment.workflow_status)
        self.assertEqual("published", assignment.appointment_status)

        await GovernanceService.transition_council_member(object(), assignment, "unpublish", user_id)
        self.assertEqual("approved", assignment.workflow_status)


if __name__ == "__main__":
    unittest.main()
