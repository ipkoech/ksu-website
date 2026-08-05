import unittest
from types import SimpleNamespace

from fastapi import HTTPException

from app.api.v1.admin import audit


def _permission(name: str):
    return SimpleNamespace(permission=SimpleNamespace(name=name, is_active=True))


def _user_with_permissions(*permissions: str):
    role = SimpleNamespace(
        is_active=True,
        role_permissions=[_permission(permission) for permission in permissions],
    )
    return SimpleNamespace(role_assignments=[SimpleNamespace(is_active=True, role=role)])


class AdminAuditAccessTests(unittest.TestCase):
    def test_research_admin_can_read_research_scoped_audit_logs(self):
        user = _user_with_permissions("research.view")

        audit._authorize_audit_list_access(user, "research")

    def test_research_admin_cannot_read_unscoped_audit_logs(self):
        user = _user_with_permissions("research.view")

        with self.assertRaises(HTTPException) as context:
            audit._authorize_audit_list_access(user, None)

        self.assertEqual(403, context.exception.status_code)

    def test_system_audit_reader_can_read_any_audit_logs(self):
        user = _user_with_permissions("audit:read")

        audit._authorize_audit_list_access(user, None)


if __name__ == "__main__":
    unittest.main()
