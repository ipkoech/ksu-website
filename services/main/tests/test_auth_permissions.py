import unittest
import uuid
from types import SimpleNamespace

from app.services.auth import _active_permissions


def _permission(name):
    return SimpleNamespace(name=name, is_active=True)


def _role(name, permissions):
    return SimpleNamespace(
        name=name,
        is_active=True,
        role_permissions=[
            SimpleNamespace(permission=_permission(permission_name))
            for permission_name in permissions
        ],
    )


def _role_assignment(role_name, permissions):
    return SimpleNamespace(
        role=_role(role_name, permissions),
        is_active=True,
        scope_type=None,
        scope_id=None,
    )


def _staff_assignment(entity_type, entity_id, role):
    return SimpleNamespace(
        entity_type=entity_type,
        entity_id=entity_id,
        role=role,
        status="active",
    )


def _user(*, role_assignments=None, staff_assignments=None):
    return SimpleNamespace(
        role_assignments=list(role_assignments or []),
        person=SimpleNamespace(assignments=list(staff_assignments or [])),
    )


class AuthPermissionTests(unittest.TestCase):
    def test_active_permissions_include_assignment_grants(self):
        library_id = uuid.uuid4()
        user = _user(
            role_assignments=[
                _role_assignment("staff", ["profile.self_edit"]),
            ],
            staff_assignments=[
                _staff_assignment("library", library_id, role="university_librarian"),
            ],
        )

        permissions = set(_active_permissions(user))

        self.assertIn("profile.self_edit", permissions)
        self.assertIn("library:write", permissions)
        self.assertIn("library.manage_resources", permissions)


if __name__ == "__main__":
    unittest.main()
