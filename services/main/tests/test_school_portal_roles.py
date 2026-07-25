import unittest
import uuid
from types import SimpleNamespace

from app.seeders.seed_rbac import PERMISSION_SPECS, ROLE_SPECS
from app.services.rbac import RBACService
from app.services.user import SchoolAdministrationRoleConflict


def _role(name: str):
    return SimpleNamespace(id=uuid.uuid4(), name=name, is_active=True)


def _assignment(role_name: str, school_id: uuid.UUID):
    return SimpleNamespace(
        role=_role(role_name),
        scope_type="school",
        scope_id=school_id,
        is_active=True,
    )


class _ScalarResult:
    def __init__(self, values):
        self.values = list(values)

    def scalars(self):
        return self

    def all(self):
        return self.values


class _SingleResult:
    def __init__(self, value=None):
        self.value = value

    def scalar_one_or_none(self):
        return self.value


class _Db:
    def __init__(self, role, existing_assignments=()):
        self.role = role
        self.existing_assignments = list(existing_assignments)
        self.added = []
        self.flush_count = 0

    async def get(self, model, item_id):
        return self.role if item_id == self.role.id else None

    async def execute(self, statement):
        query = str(statement).lower()
        if "join roles" in query:
            return _ScalarResult(self.existing_assignments)
        return _SingleResult(None)

    def add(self, item):
        self.added.append(item)

    async def flush(self):
        self.flush_count += 1


class SchoolPortalRoleTests(unittest.IsolatedAsyncioTestCase):
    def test_permission_matrix_and_school_roles_are_seeded(self):
        permission_names = {spec[0] for spec in PERMISSION_SPECS}
        roles = {spec["name"]: spec for spec in ROLE_SPECS}

        expected_views = {
            "school.dashboard.view",
            "school.profile.view",
            "school.team.view",
            "school.departments.view",
            "school.programmes.view",
            "school.publications.view",
            "school.content.view",
            "school.media.view",
            "school.inquiries.view",
            "school.notifications.view",
            "school.audit.view",
        }
        self.assertTrue(expected_views.issubset(permission_names))
        self.assertIn("school_admin", roles)
        self.assertIn("school_editor", roles)
        self.assertEqual(permission_names & {name for name in roles["school_admin"]["permission_names"]}, set(roles["school_admin"]["permission_names"]))
        self.assertTrue(expected_views.issubset(set(roles["school_editor"]["permission_names"])))
        self.assertNotIn("school.team.roles", roles["school_editor"]["permission_names"])

    async def test_school_admin_cannot_be_assigned_to_a_second_school(self):
        first_school_id = uuid.uuid4()
        second_school_id = uuid.uuid4()
        role = _role("school_admin")
        db = _Db(
            role,
            existing_assignments=(_assignment("school_editor", first_school_id),),
        )

        with self.assertRaises(SchoolAdministrationRoleConflict) as caught:
            await RBACService.assign_role(
                db,
                uuid.uuid4(),
                role.id,
                scope_type="school",
                scope_id=second_school_id,
                granted_by_id=uuid.uuid4(),
            )

        self.assertEqual(409, caught.exception.status_code)
        self.assertEqual([], db.added)

    async def test_school_editor_can_receive_an_additional_role_in_the_same_school(self):
        school_id = uuid.uuid4()
        role = _role("school_editor")
        db = _Db(
            role,
            existing_assignments=(_assignment("school_admin", school_id),),
        )

        assignment = await RBACService.assign_role(
            db,
            uuid.uuid4(),
            role.id,
            scope_type="school",
            scope_id=school_id,
            granted_by_id=uuid.uuid4(),
        )

        self.assertEqual(school_id, assignment.scope_id)
        self.assertEqual([assignment], db.added)

    async def test_lecturer_can_retain_non_administrative_school_assignments(self):
        first_school_id = uuid.uuid4()
        second_school_id = uuid.uuid4()
        role = _role("lecturer")
        db = _Db(
            role,
            existing_assignments=(_assignment("school_admin", first_school_id),),
        )

        assignment = await RBACService.assign_role(
            db,
            uuid.uuid4(),
            role.id,
            scope_type="school",
            scope_id=second_school_id,
            granted_by_id=uuid.uuid4(),
        )

        self.assertEqual(second_school_id, assignment.scope_id)
        self.assertEqual([assignment], db.added)


if __name__ == "__main__":
    unittest.main()
