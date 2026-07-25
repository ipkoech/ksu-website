import unittest
import uuid
from types import SimpleNamespace

from app.api.v1 import me
from app.schemas import UserPreferencesUpdate


class _FakePreferenceDb:
    def __init__(self):
        self.records = []

    async def execute(self, _statement):
        return SimpleNamespace(scalars=lambda: SimpleNamespace(all=lambda: list(self.records), first=lambda: self.records[0] if self.records else None))

    def add(self, record):
        self.records.append(record)

    async def flush(self):
        return None

    async def refresh(self, _record):
        return None


class MyPreferencesApiTests(unittest.IsolatedAsyncioTestCase):
    async def test_user_preferences_are_stored_per_user_and_namespace(self):
        db = _FakePreferenceDb()
        user = SimpleNamespace(id=uuid.uuid4())

        initial = await me.get_my_preferences(db, user)

        self.assertEqual("success", initial["status"])
        self.assertEqual([], initial["data"]["preferences"])

        payload = UserPreferencesUpdate(
            preferences=[
                {
                    "namespace": "onboarding",
                    "key": "research-admin:v1",
                    "value": {"completed": True, "completed_at": "2026-06-30T12:00:00Z"},
                }
            ]
        )

        updated = await me.update_my_preferences(payload, db, user)

        self.assertEqual("success", updated["status"])
        self.assertEqual("onboarding", updated["data"]["preferences"][0]["namespace"])
        self.assertEqual("research-admin:v1", updated["data"]["preferences"][0]["key"])
        self.assertTrue(updated["data"]["preferences"][0]["value"]["completed"])


if __name__ == "__main__":
    unittest.main()
