import unittest
import uuid
from types import SimpleNamespace

from app.services._base import apply_updates
from app.services.change_tracking import begin_audit_context, reset_audit_context


class UpdateSemanticsTests(unittest.TestCase):
    def test_apply_updates_keeps_explicit_none_values(self):
        record = SimpleNamespace(
            title="Original",
            summary="Existing summary",
            external_url="https://example.test",
        )

        result = apply_updates(
            record,
            title="Updated",
            summary=None,
        )

        self.assertIs(result, record)
        self.assertEqual("Updated", record.title)
        self.assertIsNone(record.summary)
        self.assertEqual("https://example.test", record.external_url)

    def test_apply_updates_stamps_updated_by_from_audit_context(self):
        record = SimpleNamespace(title="Original", updated_by_id=None)
        actor_id = uuid.uuid4()

        token = begin_audit_context(actor_id=actor_id)
        try:
            apply_updates(record, title="Updated")
        finally:
            reset_audit_context(token)

        self.assertEqual("Updated", record.title)
        self.assertEqual(actor_id, record.updated_by_id)

    def test_apply_updates_leaves_updated_by_untouched_without_actor(self):
        record = SimpleNamespace(title="Original", updated_by_id=None)

        apply_updates(record, title="Updated")

        self.assertIsNone(record.updated_by_id)


if __name__ == "__main__":
    unittest.main()
