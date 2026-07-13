import unittest
import uuid

from sqlalchemy.dialects import postgresql

from app.models import GovernancePageContent, GovernanceRole, StaffAssignment
from app.schemas import CouncilMemberCreate, CouncilOrderUpdate, GovernanceRoleCreate


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


if __name__ == "__main__":
    unittest.main()
