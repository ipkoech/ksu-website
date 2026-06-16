import unittest
from types import SimpleNamespace

from app.services._base import apply_updates


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


if __name__ == "__main__":
    unittest.main()
