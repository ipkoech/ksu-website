import unittest
import uuid
from types import SimpleNamespace

from app.services.portal_access import build_portal_access_records


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


def _assignment(role, scope_type=None, scope_id=None, permissions=None):
    return SimpleNamespace(
        role=_role(role, permissions or []),
        scope_type=scope_type,
        scope_id=scope_id,
        is_active=True,
    )


def _staff_assignment(entity_type, entity_id, role="registrar", title=None):
    return SimpleNamespace(
        entity_type=entity_type,
        entity_id=entity_id,
        role=role,
        title=title,
        status="active",
        is_primary=True,
    )


def _user(*, role_assignments=None, staff_assignments=None):
    return SimpleNamespace(
        id=uuid.uuid4(),
        role_assignments=list(role_assignments or []),
        person=SimpleNamespace(assignments=list(staff_assignments or [])),
    )


class PortalAccessTests(unittest.TestCase):
    def test_staff_role_only_gets_profile_portal(self):
        user = _user(
            role_assignments=[
                _assignment("staff", permissions=["profile.self_edit", "media.upload"]),
            ],
        )

        records = build_portal_access_records(user, scope_labels={})

        self.assertEqual(1, len(records))
        self.assertEqual("staff-profile", records[0].key)
        self.assertEqual("profile", records[0].scope_type)
        self.assertEqual(user.id, records[0].scope_id)
        self.assertEqual("My Staff Profile", records[0].scope_label)
        self.assertEqual(["profile.self_edit"], records[0].permissions)

    def test_scoped_office_role_gets_admin_with_label(self):
        wing_id = uuid.uuid4()
        user = _user(
            role_assignments=[
                _assignment(
                    "office-admin",
                    scope_type="wing",
                    scope_id=wing_id,
                    permissions=[
                        "administration.view",
                        "office.manage_content",
                        "office.manage_staff",
                    ],
                ),
            ],
        )

        records = build_portal_access_records(
            user,
            scope_labels={("wing", wing_id): "Registrar Academic Affairs"},
        )

        self.assertEqual(1, len(records))
        record = records[0]
        self.assertEqual("admin", record.key)
        self.assertEqual("main", record.service)
        self.assertEqual("wing", record.scope_type)
        self.assertEqual(wing_id, record.scope_id)
        self.assertEqual("Registrar Academic Affairs", record.scope_label)
        self.assertNotIn(str(wing_id), record.label)
        self.assertIn("office.manage_content", record.permissions)

    def test_leadership_staff_assignment_infers_admin_access(self):
        division_id = uuid.uuid4()
        user = _user(
            role_assignments=[
                _assignment("staff", permissions=["profile.self_edit"]),
            ],
            staff_assignments=[
                _staff_assignment(
                    "division",
                    division_id,
                    role="dvc",
                    title="Deputy Vice Chancellor ARSA",
                ),
            ],
        )

        records = build_portal_access_records(
            user,
            scope_labels={("division", division_id): "Division of Academic, Research and Student Affairs"},
        )

        keys = {record.key for record in records}
        self.assertIn("staff-profile", keys)
        self.assertIn("admin", keys)
        office = next(record for record in records if record.key == "admin")
        self.assertEqual("division", office.scope_type)
        self.assertEqual(division_id, office.scope_id)
        self.assertEqual("Division of Academic, Research and Student Affairs", office.scope_label)
        self.assertIn("office.manage_services", office.permissions)

    def test_governance_and_administration_permissions_emit_admin(self):
        user = _user(
            role_assignments=[
                _assignment(
                    "admin-coordinator",
                    permissions=["governance.view", "administration.view", "policy.manage"],
                ),
            ],
        )

        records = build_portal_access_records(user, scope_labels={})

        self.assertEqual(1, len(records))
        record = records[0]
        self.assertEqual("admin", record.key)
        self.assertEqual("/admin", record.href)
        self.assertEqual(
            ["administration.view", "governance.view", "policy.manage"],
            record.permissions,
        )

    def test_content_media_and_homepage_permissions_emit_cocms(self):
        user = _user(
            role_assignments=[
                _assignment(
                    "content-editor",
                    permissions=["content.review", "media.manage", "homepage.manage"],
                ),
            ],
        )

        records = build_portal_access_records(user, scope_labels={})

        self.assertEqual(1, len(records))
        record = records[0]
        self.assertEqual("cocms", record.key)
        self.assertEqual("/cocms", record.href)
        self.assertEqual(
            ["content.review", "homepage.manage", "media.manage"],
            record.permissions,
        )

    def test_club_role_assignment_emits_locked_student_clubs_access(self):
        club_id = uuid.uuid4()
        user = _user(
            role_assignments=[
                _assignment(
                    "club-official",
                    scope_type="club",
                    scope_id=club_id,
                    permissions=["clubs.manage_own", "clubs.events_manage"],
                ),
            ],
        )

        records = build_portal_access_records(
            user,
            scope_labels={("club", club_id): "KSU Debate Club"},
        )

        self.assertEqual(1, len(records))
        record = records[0]
        self.assertEqual("student-clubs", record.key)
        self.assertEqual("club", record.scope_type)
        self.assertEqual(club_id, record.scope_id)
        self.assertEqual("KSU Debate Club", record.scope_label)
        self.assertTrue(record.locked_scope)
        self.assertEqual(["clubs.events_manage", "clubs.manage_own"], record.permissions)

    def test_club_person_assignment_infers_locked_student_clubs_access(self):
        club_id = uuid.uuid4()
        user = _user(
            staff_assignments=[
                _staff_assignment("club", club_id, role="chairperson"),
            ],
        )

        records = build_portal_access_records(
            user,
            scope_labels={("club", club_id): "KSU Debate Club"},
        )

        self.assertEqual(1, len(records))
        record = records[0]
        self.assertEqual("student-clubs", record.key)
        self.assertEqual("club", record.scope_type)
        self.assertEqual(club_id, record.scope_id)
        self.assertTrue(record.locked_scope)
        self.assertIn("clubs.manage_own", record.permissions)

    def test_dean_assignment_infers_school_portal_access(self):
        school_id = uuid.uuid4()
        user = _user(
            role_assignments=[
                _assignment("staff", permissions=["profile.self_edit"]),
            ],
            staff_assignments=[
                _staff_assignment("school", school_id, role="dean", title="Dean"),
            ],
        )

        records = build_portal_access_records(
            user,
            scope_labels={("school", school_id): "School of Business"},
        )

        school = next(record for record in records if record.key == "schools")
        self.assertEqual("school", school.scope_type)
        self.assertEqual(school_id, school.scope_id)
        self.assertEqual("School of Business", school.scope_label)
        self.assertIn("academic.manage_schools", school.permissions)

    def test_hod_assignment_infers_department_portal_access(self):
        department_id = uuid.uuid4()
        user = _user(
            role_assignments=[
                _assignment("staff", permissions=["profile.self_edit"]),
            ],
            staff_assignments=[
                _staff_assignment("department", department_id, role="hod", title="Head of Department"),
            ],
        )

        records = build_portal_access_records(
            user,
            scope_labels={("department", department_id): "Department of Computing Sciences"},
        )

        department = next(record for record in records if record.key == "departments")
        self.assertEqual("department", department.scope_type)
        self.assertEqual(department_id, department.scope_id)
        self.assertEqual("Department of Computing Sciences", department.scope_label)
        self.assertIn("academic.manage_departments", department.permissions)

    def test_librarian_assignment_infers_library_portal_access(self):
        library_id = uuid.uuid4()
        user = _user(
            role_assignments=[
                _assignment("staff", permissions=["profile.self_edit"]),
            ],
            staff_assignments=[
                _staff_assignment("library", library_id, role="university_librarian"),
            ],
        )

        records = build_portal_access_records(user, scope_labels={})

        library = next(record for record in records if record.key == "library")
        self.assertEqual("library", library.scope_type)
        self.assertEqual(library_id, library.scope_id)
        self.assertEqual("Library scope", library.scope_label)
        self.assertNotIn(str(library_id), library.label)
        self.assertIn("library.manage_resources", library.permissions)

    def test_research_director_assignment_infers_research_portal_access(self):
        research_unit_id = uuid.uuid4()
        user = _user(
            role_assignments=[
                _assignment("staff", permissions=["profile.self_edit"]),
            ],
            staff_assignments=[
                _staff_assignment("research", research_unit_id, role="director"),
            ],
        )

        records = build_portal_access_records(user, scope_labels={})

        research = next(record for record in records if record.key == "research")
        self.assertEqual("research", research.scope_type)
        self.assertEqual(research_unit_id, research.scope_id)
        self.assertEqual("Research scope", research.scope_label)
        self.assertNotIn(str(research_unit_id), research.label)
        self.assertIn("research.manage_projects", research.permissions)


if __name__ == "__main__":
    unittest.main()
