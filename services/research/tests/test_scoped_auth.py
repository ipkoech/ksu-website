import unittest
import uuid

from ksu_common.auth import TokenPayload

from app.core.auth import can_access_scoped_record


def _token(scope_grants):
    return TokenPayload(sub=str(uuid.uuid4()), jti=str(uuid.uuid4()), roles=[], raw={"scope_grants": scope_grants})


class ScopedAuthTests(unittest.TestCase):
    def test_matching_research_grant_allows_center_record(self):
        center_id = uuid.uuid4()
        user = _token(
            [
                {
                    "permissions": ["research.manage_projects"],
                    "scope_type": "research",
                    "scope_id": str(center_id),
                    "source": "assignment",
                }
            ]
        )

        self.assertTrue(
            can_access_scoped_record(
                user,
                "research.manage_projects",
                "research",
                center_id,
            )
        )

    def test_research_grant_rejects_other_center_record(self):
        user = _token(
            [
                {
                    "permissions": ["research.manage_projects"],
                    "scope_type": "research",
                    "scope_id": str(uuid.uuid4()),
                    "source": "assignment",
                }
            ]
        )

        self.assertFalse(
            can_access_scoped_record(
                user,
                "research.manage_projects",
                "research",
                uuid.uuid4(),
            )
        )

    def test_research_grant_rejects_missing_center_record(self):
        user = _token(
            [
                {
                    "permissions": ["research.manage_projects"],
                    "scope_type": "research",
                    "scope_id": str(uuid.uuid4()),
                    "source": "assignment",
                }
            ]
        )

        self.assertFalse(
            can_access_scoped_record(
                user,
                "research.manage_projects",
                "research",
                None,
            )
        )

    def test_global_grant_allows_any_center_record(self):
        user = _token(
            [
                {
                    "permissions": ["research.manage_projects"],
                    "scope_type": "global",
                    "scope_id": None,
                    "source": "role",
                }
            ]
        )

        self.assertTrue(
            can_access_scoped_record(
                user,
                "research.manage_projects",
                "research",
                uuid.uuid4(),
            )
        )

    def test_tokens_without_structured_grants_remain_flat_permission_compatible(self):
        user = TokenPayload(sub=str(uuid.uuid4()), jti=str(uuid.uuid4()), roles=[], raw={})

        self.assertTrue(
            can_access_scoped_record(
                user,
                "research.manage_projects",
                "research",
                uuid.uuid4(),
            )
        )


if __name__ == "__main__":
    unittest.main()
