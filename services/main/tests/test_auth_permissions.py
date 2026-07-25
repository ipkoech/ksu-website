import unittest
import uuid
from types import SimpleNamespace

from app.api.v1.auth import _serialize_auth_user
from app.helpers.jwt import create_access_token, decode_token
from app.models import Permission, Role, RolePermission, User, UserRole
from app.services.auth import _active_permissions, _active_scope_grants


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


def _user_role_assignment(
    role_name: str,
    permissions: list[str],
    *,
    is_active: bool,
) -> UserRole:
    role = Role(name=role_name, is_active=True)
    role.role_permissions = [
        RolePermission(permission=Permission(name=permission_name, is_active=True))
        for permission_name in permissions
    ]
    return UserRole(role=role, is_active=is_active)


def _model_user(*role_assignments: UserRole) -> User:
    return User(
        email="inactive-assignment@example.test",
        password_hash="test-password-hash",
        full_name="Inactive Assignment Test",
        role_assignments=list(role_assignments),
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
    def test_inactive_role_assignment_does_not_satisfy_role_checks(self):
        user = _model_user(
            _user_role_assignment("legacy_admin", ["legacy.manage"], is_active=False)
        )

        self.assertEqual([], user.roles)
        self.assertFalse(user.has_role("legacy_admin"))

    def test_auth_serialization_omits_inactive_role_assignment_permissions(self):
        user = _model_user(
            _user_role_assignment("legacy_admin", ["legacy.manage"], is_active=False)
        )

        payload = _serialize_auth_user(user)

        self.assertEqual([], payload["roles"])
        self.assertEqual([], payload["permissions"])

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

    def test_active_scope_grants_include_assignment_scope_metadata(self):
        research_center_id = uuid.uuid4()
        user = _user(
            staff_assignments=[
                _staff_assignment("research", research_center_id, role="director"),
            ],
        )

        grants = _active_scope_grants(user)

        self.assertEqual(1, len(grants))
        self.assertEqual("research", grants[0]["scope_type"])
        self.assertEqual(str(research_center_id), grants[0]["scope_id"])
        self.assertEqual("assignment", grants[0]["source"])
        self.assertIn("research.manage_projects", grants[0]["permissions"])

    def test_token_scope_grants_omit_global_role_assignments(self):
        user = _user(
            role_assignments=[
                _role_assignment("research-admin", ["research.view", "research.manage_projects"]),
            ],
        )

        grants = _active_scope_grants(user)

        self.assertEqual([], grants)

    def test_access_token_contains_structured_scope_grants(self):
        grant = {
            "permissions": ["research.manage_projects"],
            "scope_type": "research",
            "scope_id": str(uuid.uuid4()),
            "source": "assignment",
        }

        token, _ = create_access_token(
            str(uuid.uuid4()),
            ["staff"],
            permissions=["research.manage_projects"],
            scope_grants=[grant],
        )

        payload = decode_token(token)
        self.assertEqual([grant], payload["scope_grants"])

    def test_access_token_does_not_duplicate_permissions_into_scopes_by_default(self):
        token, _ = create_access_token(
            str(uuid.uuid4()),
            ["research-admin"],
            permissions=["research.view", "research.manage_projects"],
        )

        payload = decode_token(token)

        self.assertEqual(["research.view", "research.manage_projects"], payload["permissions"])
        self.assertNotIn("scopes", payload)


if __name__ == "__main__":
    unittest.main()
