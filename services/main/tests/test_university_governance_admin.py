import unittest
import uuid
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import patch

from sqlalchemy.dialects import postgresql

from app.api.v1 import governance as governance_api
from app.models import GovernancePageContent, GovernanceRole, StaffAssignment
from app.schemas import CouncilMemberCreate, CouncilOrderUpdate, GovernanceRoleCreate
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
        duplicate_id = uuid.uuid4()
        nodes = [
            {"assignment_id": uuid.uuid4(), "display_group": "member", "display_order": 10, "hierarchy_level": 2, "reports_to_id": None},
            {"assignment_id": duplicate_id, "display_group": "member", "display_order": 10, "hierarchy_level": 2, "reports_to_id": None},
        ]

        with self.assertRaisesRegex(ValueError, "Duplicate display order"):
            await GovernanceService.validate_council_order_nodes(nodes, assignments_by_id={})

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
