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

    def test_scoped_office_role_gets_institutional_administration_with_label(self):
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
        self.assertEqual("institutional-administration", record.key)
        self.assertEqual("main", record.service)
        self.assertEqual("wing", record.scope_type)
        self.assertEqual(wing_id, record.scope_id)
        self.assertEqual("Registrar Academic Affairs", record.scope_label)
        self.assertNotIn(str(wing_id), record.label)
        self.assertIn("office.manage_content", record.permissions)

    def test_leadership_staff_assignment_infers_office_access(self):
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
        self.assertIn("institutional-administration", keys)
        office = next(record for record in records if record.key == "institutional-administration")
        self.assertEqual("division", office.scope_type)
        self.assertEqual(division_id, office.scope_id)
        self.assertEqual("Division of Academic, Research and Student Affairs", office.scope_label)
        self.assertIn("office.manage_services", office.permissions)


if __name__ == "__main__":
    unittest.main()
