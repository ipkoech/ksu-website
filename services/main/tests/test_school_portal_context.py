import unittest
import uuid
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

from fastapi import FastAPI, HTTPException

from app.api.v1 import register_routes
from app.api.v1.school_portal.context import context_response
from app.services.school_portal_context import (
    SCHOOL_PORTAL_PERMISSIONS,
    resolve_school_portal_context,
)


def _permission(name: str):
    return SimpleNamespace(name=name, is_active=True)


def _assignment(
    role_name: str,
    *,
    school_id: uuid.UUID | None,
    permissions: tuple[str, ...],
    is_active: bool = True,
    role_is_active: bool = True,
    expires_at: datetime | None = None,
    scope_type: str | None = "school",
):
    return SimpleNamespace(
        is_active=is_active,
        expires_at=expires_at,
        scope_type=scope_type,
        scope_id=school_id,
        role=SimpleNamespace(
            name=role_name,
            display_name=role_name.replace("_", " ").title(),
            is_active=role_is_active,
            role_permissions=[
                SimpleNamespace(permission=_permission(name))
                for name in permissions
            ],
        ),
    )


def _user(*assignments):
    return SimpleNamespace(
        id=uuid.uuid4(),
        email="dean@example.test",
        full_name="Portal User",
        role_assignments=list(assignments),
    )


def _school(school_id: uuid.UUID):
    return SimpleNamespace(
        id=school_id,
        name="School of Computing",
        slug="school-of-computing",
        code="SOC",
        school_type="school",
        campus_id=uuid.uuid4(),
        administrative_wing_id=uuid.uuid4(),
        dean_id=uuid.uuid4(),
        logo_image_id=uuid.uuid4(),
        cover_image_id=uuid.uuid4(),
        brochure_id=uuid.uuid4(),
        is_active=True,
        is_public=True,
        campus=SimpleNamespace(id=uuid.uuid4(), name="Main Campus", code="MAIN"),
        administrative_wing=SimpleNamespace(
            id=uuid.uuid4(),
            name="Academic Affairs",
            slug="academic-affairs",
        ),
        dean=SimpleNamespace(id=uuid.uuid4(), display_name="Prof. Ada Dean"),
        logo_image=SimpleNamespace(id=uuid.uuid4(), url="/uploads/logo.png", alt_text="School logo"),
        cover_image=SimpleNamespace(id=uuid.uuid4(), url="/uploads/cover.jpg", alt_text="School cover"),
        brochure=SimpleNamespace(id=uuid.uuid4(), url="/uploads/brochure.pdf", alt_text=None),
        departments=[
            SimpleNamespace(
                id=uuid.uuid4(),
                name="Computer Science",
                slug="computer-science",
                code="CS",
                is_active=True,
                display_order=20,
            ),
            SimpleNamespace(
                id=uuid.uuid4(),
                name="Archived Department",
                slug="archived",
                code="OLD",
                is_active=False,
                display_order=1,
            ),
        ],
    )


class _Result:
    def __init__(self, school):
        self.school = school
        self.unique_called = False

    def unique(self):
        self.unique_called = True
        return self

    def scalar_one_or_none(self):
        if not self.unique_called:
            raise AssertionError("aggregate result must be de-duplicated")
        return self.school


class _Db:
    def __init__(self, school):
        self.school = school
        self.statements = []

    async def execute(self, statement):
        self.statements.append(statement)
        return _Result(self.school)


class SchoolPortalContextTests(unittest.IsolatedAsyncioTestCase):
    def test_school_portal_context_routes_are_registered(self):
        app = FastAPI()
        register_routes(app)
        paths = app.openapi()["paths"]

        self.assertIn("/api/v1/school-portal/context", paths)
        self.assertIn("get", paths["/api/v1/school-portal/context"])
        self.assertIn("/api/v1/school-portal/capabilities", paths)
        self.assertIn("get", paths["/api/v1/school-portal/capabilities"])

    async def test_one_scoped_school_admin_resolves_full_context_in_one_query(self):
        school_id = uuid.uuid4()
        school = _school(school_id)
        db = _Db(school)
        user = _user(
            _assignment(
                "school_admin",
                school_id=school_id,
                permissions=("school.dashboard.view",),
            )
        )

        context = await resolve_school_portal_context(db, user)
        response = context_response(context)

        self.assertIs(school, context.school)
        self.assertIs(user, context.user)
        self.assertEqual(SCHOOL_PORTAL_PERMISSIONS, context.permissions)
        self.assertEqual(("school_admin",), context.role_names)
        self.assertEqual(1, len(db.statements))
        self.assertEqual(["Computer Science"], [item.name for item in response.school.departments])
        self.assertIn("dashboard", response.allowed_navigation)
        self.assertIn("audit", response.allowed_navigation)

    async def test_user_without_a_school_assignment_is_forbidden(self):
        user = _user()

        with self.assertRaises(HTTPException) as caught:
            await resolve_school_portal_context(_Db(None), user)

        self.assertEqual(403, caught.exception.status_code)
        self.assertEqual("No school is assigned to this account", caught.exception.detail)

    async def test_inactive_or_expired_school_assignment_is_ignored(self):
        school_id = uuid.uuid4()
        yesterday = datetime.now(timezone.utc) - timedelta(days=1)
        assignments = (
            _assignment(
                "school_admin",
                school_id=school_id,
                permissions=("school.dashboard.view",),
                is_active=False,
            ),
            _assignment(
                "school_editor",
                school_id=school_id,
                permissions=("school.dashboard.view",),
                role_is_active=False,
            ),
            _assignment(
                "school_editor",
                school_id=school_id,
                permissions=("school.dashboard.view",),
                expires_at=yesterday,
            ),
        )

        with self.assertRaises(HTTPException) as caught:
            await resolve_school_portal_context(_Db(None), _user(*assignments))

        self.assertEqual(403, caught.exception.status_code)

    async def test_two_school_administration_grants_are_rejected_as_ambiguous(self):
        user = _user(
            _assignment(
                "school_admin",
                school_id=uuid.uuid4(),
                permissions=("school.dashboard.view",),
            ),
            _assignment(
                "school_editor",
                school_id=uuid.uuid4(),
                permissions=("school.profile.view",),
            ),
        )

        with self.assertRaises(HTTPException) as caught:
            await resolve_school_portal_context(_Db(None), user)

        self.assertEqual(409, caught.exception.status_code)
        self.assertEqual("Multiple schools are assigned to this account", caught.exception.detail)

    async def test_global_super_admin_does_not_implicitly_select_a_school(self):
        user = _user(
            _assignment(
                "super_admin",
                school_id=None,
                scope_type=None,
                permissions=("*",),
            )
        )

        with self.assertRaises(HTTPException) as caught:
            await resolve_school_portal_context(_Db(None), user)

        self.assertEqual(403, caught.exception.status_code)

    async def test_editor_capabilities_and_navigation_are_reduced(self):
        school_id = uuid.uuid4()
        user = _user(
            _assignment(
                "school_editor",
                school_id=school_id,
                permissions=(
                    "school.dashboard.view",
                    "school.content.view",
                    "school.content.manage",
                    "unrelated.global.permission",
                ),
            )
        )

        context = await resolve_school_portal_context(_Db(_school(school_id)), user)
        response = context_response(context)

        self.assertEqual(
            (
                "school.content.manage",
                "school.content.view",
                "school.dashboard.view",
            ),
            context.permissions,
        )
        self.assertEqual(["dashboard", "content"], response.allowed_navigation)
        self.assertTrue(response.capabilities["school.content.manage"])
        self.assertFalse(response.capabilities["school.team.view"])


if __name__ == "__main__":
    unittest.main()
