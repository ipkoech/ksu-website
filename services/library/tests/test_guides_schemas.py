import json
import unittest
import uuid
from datetime import datetime, timezone

from app.schemas import (
    LibraryGuideCreate,
    LibraryGuideOut,
    LibraryGuideSectionCreate,
    LibrarySpecialistCreate,
    LibrarySpecialistUpdate,
    LibraryWorkflowCreate,
    LibraryWorkflowUpdate,
    LibraryPolicyPageCreate,
    LibraryPolicyPageUpdate,
)


NOW = datetime(2026, 6, 22, 12, 0, tzinfo=timezone.utc)
LIBRARY_ID = uuid.UUID("00000000-0000-4000-8000-000000000101")
STAFF_ID = uuid.UUID("00000000-0000-4000-8000-000000000102")


class LibraryGuideSchemaTests(unittest.TestCase):
    def test_guide_create_accepts_subject_course_and_audience(self):
        guide = LibraryGuideCreate(
            library_id=LIBRARY_ID,
            title="Nursing Research Guide",
            slug="nursing-research",
            summary="Databases and research help for nursing.",
            guide_type="subject",
            subject="Nursing",
            course_code="NUR 301",
            audience="undergraduate",
            owner_staff_id=STAFF_ID,
        )

        self.assertEqual(guide.guide_type, "subject")
        self.assertEqual(guide.subject, "Nursing")
        self.assertTrue(guide.is_public)
        self.assertTrue(guide.is_active)

    def test_guide_rejects_unknown_type(self):
        with self.assertRaisesRegex(ValueError, "guide_type"):
            LibraryGuideCreate(title="Bad", slug="bad", guide_type="unknown")

    def test_specialist_create_maps_staff_to_subjects(self):
        specialist = LibrarySpecialistCreate(
            library_id=LIBRARY_ID,
            staff_id=STAFF_ID,
            subjects=["Nursing", "Public Health"],
            support_areas=["systematic_reviews", "citation_support"],
            booking_url="https://example.com/book",
        )

        self.assertIn("Nursing", specialist.subjects)
        self.assertIn("citation_support", specialist.support_areas)

    def test_specialist_update_dumps_only_typed_fields(self):
        specialist = LibrarySpecialistUpdate.model_validate(
            {
                "subjects": ["Nursing"],
                "booking_url": "https://example.com/book-new",
                "unexpected": "ignored",
            }
        )

        self.assertEqual(
            specialist.model_dump(exclude_unset=True),
            {
                "subjects": ["Nursing"],
                "booking_url": "https://example.com/book-new",
            },
        )

    def test_workflow_create_accepts_remote_access_type(self):
        workflow = LibraryWorkflowCreate(
            library_id=LIBRARY_ID,
            workflow_type="remote_access",
            title="Off-campus access",
            slug="remote-access",
            summary="How to use databases away from campus.",
            audience="students",
        )

        self.assertEqual(workflow.workflow_type, "remote_access")

    def test_workflow_create_accepts_public_page_workflow_types(self):
        for workflow_type in (
            "borrowing_access",
            "repository_deposit",
            "digital_scholarship",
        ):
            with self.subTest(workflow_type=workflow_type):
                workflow = LibraryWorkflowCreate(
                    workflow_type=workflow_type,
                    title=workflow_type.replace("_", " ").title(),
                    slug=workflow_type,
                )

                self.assertEqual(workflow.workflow_type, workflow_type)

    def test_workflow_update_validates_workflow_type(self):
        workflow = LibraryWorkflowUpdate.model_validate(
            {"workflow_type": "repository_deposit", "unexpected": "ignored"}
        )

        self.assertEqual(
            workflow.model_dump(exclude_unset=True),
            {"workflow_type": "repository_deposit"},
        )
        with self.assertRaisesRegex(ValueError, "workflow_type"):
            LibraryWorkflowUpdate(workflow_type="unknown")

    def test_policy_page_create_accepts_privacy_type(self):
        policy = LibraryPolicyPageCreate(
            library_id=LIBRARY_ID,
            policy_type="privacy",
            title="Library Privacy",
            slug="privacy",
            content="Privacy guidance for library users.",
        )

        self.assertEqual(policy.policy_type, "privacy")

    def test_policy_page_create_accepts_public_policy_types(self):
        for policy_type in ("accessibility", "copyright", "acceptable_use"):
            with self.subTest(policy_type=policy_type):
                policy = LibraryPolicyPageCreate(
                    policy_type=policy_type,
                    title=policy_type.replace("_", " ").title(),
                    slug=policy_type,
                    content="Policy content.",
                )

                self.assertEqual(policy.policy_type, policy_type)

    def test_policy_page_update_validates_type_and_status(self):
        policy = LibraryPolicyPageUpdate.model_validate(
            {
                "policy_type": "copyright",
                "status": "archived",
                "unexpected": "ignored",
            }
        )

        self.assertEqual(
            policy.model_dump(exclude_unset=True),
            {"policy_type": "copyright", "status": "archived"},
        )
        with self.assertRaisesRegex(ValueError, "policy_type"):
            LibraryPolicyPageUpdate(policy_type="unknown")
        with self.assertRaisesRegex(ValueError, "status"):
            LibraryPolicyPageUpdate(status="unknown")

    def test_guide_out_serializes_sections_and_specialist_ids(self):
        guide = LibraryGuideOut.model_validate(
            {
                "id": uuid.UUID("00000000-0000-4000-8000-000000000103"),
                "library_id": LIBRARY_ID,
                "title": "Nursing Research Guide",
                "slug": "nursing-research",
                "summary": "Databases and research help for nursing.",
                "guide_type": "subject",
                "subject": "Nursing",
                "course_code": "NUR 301",
                "audience": "undergraduate",
                "owner_staff_id": STAFF_ID,
                "is_public": True,
                "is_active": True,
                "sort_order": 0,
                "created_at": NOW,
                "updated_at": NOW,
                "deleted_at": None,
                "sections": [],
                "specialists": [],
            }
        )

        self.assertEqual(guide.slug, "nursing-research")
        self.assertEqual(guide.sections, [])

    def test_section_file_ids_dump_as_json_serializable_strings(self):
        file_id = uuid.UUID("00000000-0000-4000-8000-000000000201")

        section = LibraryGuideSectionCreate(
            heading="Dataset files",
            content="Download supporting datasets.",
            section_type="files",
            file_ids=[file_id],
        )
        dumped = section.model_dump()

        self.assertEqual(dumped["file_ids"], [str(file_id)])
        json.dumps(dumped)


if __name__ == "__main__":
    unittest.main()
