import unittest
import uuid
from types import SimpleNamespace

from app.security.scopes import (
    can_access_scope,
    filter_records_for_scope,
)


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


def _user_role(role_name, permissions, scope_type=None, scope_id=None):
    return SimpleNamespace(
        role=_role(role_name, permissions),
        scope_type=scope_type,
        scope_id=scope_id,
        is_active=True,
    )


def _user(*assignments, staff_assignments=None):
    return SimpleNamespace(
        id=uuid.uuid4(),
        role_assignments=list(assignments),
        person=SimpleNamespace(assignments=list(staff_assignments or [])),
    )


def _staff_assignment(entity_type, entity_id, role="registrar"):
    return SimpleNamespace(
        entity_type=entity_type,
        entity_id=entity_id,
        role=role,
        status="active",
    )


def _record(entity_type, entity_id):
    return SimpleNamespace(entity_type=entity_type, entity_id=entity_id)


class ScopedAccessTests(unittest.IsolatedAsyncioTestCase):
    async def test_global_permission_can_access_any_scope(self):
        user = _user(_user_role("super_admin", ["admin:*"]))

        allowed = await can_access_scope(
            None,
            user,
            "staff.manage_assignments",
            "wing",
            uuid.uuid4(),
        )

        self.assertTrue(allowed)

    async def test_exact_scoped_role_can_access_matching_scope_only(self):
        own_wing_id = uuid.uuid4()
        other_wing_id = uuid.uuid4()
        user = _user(
            _user_role(
                "office-staff-manager",
                ["staff.manage_assignments"],
                scope_type="wing",
                scope_id=own_wing_id,
            )
        )

        self.assertTrue(
            await can_access_scope(
                None,
                user,
                "staff.manage_assignments",
                "wing",
                own_wing_id,
            )
        )
        self.assertFalse(
            await can_access_scope(
                None,
                user,
                "staff.manage_assignments",
                "wing",
                other_wing_id,
            )
        )

    async def test_leadership_assignment_grants_own_office_scope(self):
        wing_id = uuid.uuid4()
        user = _user(
            staff_assignments=[
                _staff_assignment("wing", wing_id, role="registrar"),
            ]
        )

        allowed = await can_access_scope(
            None,
            user,
            "staff.view_assignments",
            "wing",
            wing_id,
        )

        self.assertTrue(allowed)

    async def test_dean_assignment_grants_own_school_scope(self):
        school_id = uuid.uuid4()
        user = _user(
            staff_assignments=[
                _staff_assignment("school", school_id, role="dean"),
            ]
        )

        self.assertTrue(
            await can_access_scope(
                None,
                user,
                "academic.manage_schools",
                "school",
                school_id,
            )
        )
        self.assertFalse(
            await can_access_scope(
                None,
                user,
                "academic.manage_schools",
                "school",
                uuid.uuid4(),
            )
        )

    async def test_hod_assignment_grants_own_department_scope(self):
        department_id = uuid.uuid4()
        user = _user(
            staff_assignments=[
                _staff_assignment("department", department_id, role="hod"),
            ]
        )

        self.assertTrue(
            await can_access_scope(
                None,
                user,
                "academic.manage_departments",
                "department",
                department_id,
            )
        )
        self.assertFalse(
            await can_access_scope(
                None,
                user,
                "academic.manage_departments",
                "department",
                uuid.uuid4(),
            )
        )

    async def test_librarian_assignment_grants_own_library_scope(self):
        library_id = uuid.uuid4()
        user = _user(
            staff_assignments=[
                _staff_assignment("library", library_id, role="university_librarian"),
            ]
        )

        self.assertTrue(
            await can_access_scope(
                None,
                user,
                "library:write",
                "library",
                library_id,
            )
        )
        self.assertFalse(
            await can_access_scope(
                None,
                user,
                "library:write",
                "library",
                uuid.uuid4(),
            )
        )

    async def test_research_director_assignment_grants_own_research_scope(self):
        research_unit_id = uuid.uuid4()
        user = _user(
            staff_assignments=[
                _staff_assignment("research", research_unit_id, role="director"),
            ]
        )

        self.assertTrue(
            await can_access_scope(
                None,
                user,
                "research.manage_projects",
                "research",
                research_unit_id,
            )
        )
        self.assertFalse(
            await can_access_scope(
                None,
                user,
                "research.manage_projects",
                "research",
                uuid.uuid4(),
            )
        )

    async def test_filter_records_for_scope_removes_other_offices(self):
        own_wing_id = uuid.uuid4()
        other_wing_id = uuid.uuid4()
        user = _user(
            _user_role(
                "office-admin",
                ["staff.view_assignments"],
                scope_type="wing",
                scope_id=own_wing_id,
            )
        )
        records = [
            _record("wing", own_wing_id),
            _record("wing", other_wing_id),
        ]

        visible = await filter_records_for_scope(
            None,
            user,
            "staff.view_assignments",
            records,
            scope_getter=lambda item: (item.entity_type, item.entity_id),
        )

        self.assertEqual([records[0]], visible)


if __name__ == "__main__":
    unittest.main()
