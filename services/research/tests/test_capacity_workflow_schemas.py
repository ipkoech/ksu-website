import unittest
import uuid
from datetime import date, datetime, timezone
from decimal import Decimal

from services.research.app.schemas.capacity import MentorshipApplicationUpdate, ScholarshipApplicationUpdate


class CapacityWorkflowSchemaTests(unittest.TestCase):
    def test_mentorship_application_update_keeps_review_fields(self):
        reviewer_id = uuid.uuid4()
        reviewed_at = datetime(2026, 6, 30, 9, 0, tzinfo=timezone.utc)

        payload = MentorshipApplicationUpdate(
            status="approved",
            review_notes="Strong mentor fit.",
            reviewed_by_id=reviewer_id,
            reviewed_at=reviewed_at,
        ).model_dump(exclude_unset=True)

        self.assertEqual(payload["status"], "approved")
        self.assertEqual(payload["review_notes"], "Strong mentor fit.")
        self.assertEqual(payload["reviewed_by_id"], reviewer_id)
        self.assertEqual(payload["reviewed_at"], reviewed_at)

    def test_scholarship_application_update_keeps_review_and_award_fields(self):
        payload = ScholarshipApplicationUpdate(
            status="awarded",
            review_score=88,
            decision_date=date(2026, 6, 30),
            awarded_amount=Decimal("125000.00"),
        ).model_dump(exclude_unset=True)

        self.assertEqual(payload["status"], "awarded")
        self.assertEqual(payload["review_score"], 88)
        self.assertEqual(payload["decision_date"], date(2026, 6, 30))
        self.assertEqual(payload["awarded_amount"], Decimal("125000.00"))


if __name__ == "__main__":
    unittest.main()
