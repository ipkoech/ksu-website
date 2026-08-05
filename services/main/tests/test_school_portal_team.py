import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import FastAPI, HTTPException
from pydantic import ValidationError

from app.api.v1 import register_routes
from app.api.v1.school_portal.team import queue_team_import
from app.schemas.school_portal_team import (
    SchoolTeamImportRequest,
    SchoolTeamLifecycleRequest,
    SchoolTeamMemberCreate,
)
from app.services.school_portal_context import SchoolPortalContext
from app.services.school_portal_team import (
    TEAM_ROLE_GROUPS,
    activate_school_team_assignment,
    create_school_team_member,
    delete_school_team_assignment,
    end_school_team_assignment,
    get_school_team_assignment,
    resend_school_team_invite,
    revoke_school_portal_access,
    transfer_school_team_assignment,
)


class _Db:
    def __init__(self, scalar=None):
        self.added = []
        self.scalar = scalar

    def add(self, item):
        self.added.append(item)

    async def flush(self):
        return None

    async def execute(self, _statement):
        scalar = self.scalar

        class Result:
            def scalar_one_or_none(self):
                return scalar

        return Result()


def _context(*permissions):
    return SchoolPortalContext(
        school=SimpleNamespace(id=uuid.uuid4(), dean_id=None),
        user=SimpleNamespace(id=uuid.uuid4()),
        permissions=permissions,
        role_names=("school_admin",),
    )


class SchoolPortalTeamTests(unittest.IsolatedAsyncioTestCase):
    def test_role_taxonomy_contains_every_required_group(self):
        flattened = {
            role
            for roles in TEAM_ROLE_GROUPS.values()
            for role in roles
        }
        self.assertTrue(
            {
                "dean",
                "deputy_dean",
                "cod",
                "hod",
                "coordinator",
                "school_administrator",
                "administrative_staff",
                "lecturer",
                "technician",
                "support_staff",
            }.issubset(flattened)
        )

    def test_create_payload_requires_a_person_reference_or_identity(self):
        with self.assertRaises(ValidationError):
            SchoolTeamMemberCreate(role="lecturer")

        by_reference = SchoolTeamMemberCreate(
            person_id=uuid.uuid4(),
            role="lecturer",
        )
        self.assertIsNotNone(by_reference.person_id)

    async def test_create_stamps_current_school_and_rejects_foreign_department(self):
        context = _context("school.team.manage")
        department_id = uuid.uuid4()
        payload = SchoolTeamMemberCreate(
            first_name="Amina",
            last_name="Otieno",
            email="amina@example.com",
            role="lecturer",
            department_id=department_id,
        )

        with patch(
            "app.services.school_portal_team.Department.get_by_id",
            AsyncMock(return_value=SimpleNamespace(id=department_id, school_id=uuid.uuid4())),
        ):
            with self.assertRaises(HTTPException) as caught:
                await create_school_team_member(_Db(), context, payload)

        self.assertEqual(404, caught.exception.status_code)

    async def test_create_reuses_person_and_creates_assignment_and_portal_role(self):
        context = _context("school.team.manage", "school.team.roles")
        person = SimpleNamespace(
            id=uuid.uuid4(),
            user_id=None,
            email="admin@example.test",
            full_name="School Admin",
        )
        user = SimpleNamespace(id=uuid.uuid4())
        assignment = SimpleNamespace(id=uuid.uuid4())
        role = SimpleNamespace(id=uuid.uuid4(), name="school_editor", is_active=True)
        payload = SchoolTeamMemberCreate(
            person_id=person.id,
            role="school_administrator",
            invite_user=True,
            portal_role="school_editor",
        )

        with (
            patch(
                "app.services.school_portal_team.PersonService.get_by_id",
                AsyncMock(return_value=person),
            ),
            patch(
                "app.services.school_portal_team.UserService.get_by_email",
                AsyncMock(return_value=user),
            ),
            patch(
                "app.services.school_portal_team.StaffService.assign",
                AsyncMock(return_value=assignment),
            ) as assign,
            patch(
                "app.services.school_portal_team.get_role_by_name",
                AsyncMock(return_value=role),
            ),
            patch(
                "app.services.school_portal_team.RBACService.assign_role",
                AsyncMock(),
            ) as assign_role,
            patch(
                "app.services.school_portal_team.record_school_portal_audit",
                AsyncMock(),
            ),
        ):
            result = await create_school_team_member(_Db(person), context, payload)

        self.assertIs(assignment, result)
        self.assertEqual(context.school.id, assign.await_args.kwargs["entity_id"])
        assign_role.assert_awaited_once()
        self.assertEqual(
            context.school.id,
            assign_role.await_args.kwargs["scope_id"],
        )

    async def test_only_dean_requires_replacement_or_vacancy_acknowledgement(self):
        context = _context("school.team.manage")
        assignment = SimpleNamespace(
            id=uuid.uuid4(),
            entity_type="school",
            entity_id=context.school.id,
            role="dean",
            status="active",
            person_id=uuid.uuid4(),
        )
        context.school.dean_id = assignment.person_id

        with patch(
            "app.services.school_portal_team.get_school_record_or_404",
            AsyncMock(return_value=assignment),
        ):
            with self.assertRaises(HTTPException) as caught:
                await end_school_team_assignment(
                    _Db(),
                    context,
                    assignment.id,
                    SchoolTeamLifecycleRequest(),
                )

        self.assertEqual(409, caught.exception.status_code)

    async def test_final_school_admin_cannot_be_revoked(self):
        context = _context("school.team.roles")
        assignment = SimpleNamespace(
            id=uuid.uuid4(),
            user_id=uuid.uuid4(),
            entity_type="school",
            entity_id=context.school.id,
        )
        user_role = SimpleNamespace(
            id=uuid.uuid4(),
            role=SimpleNamespace(name="school_admin"),
            is_active=True,
        )

        with (
            patch(
                "app.services.school_portal_team.get_school_record_or_404",
                AsyncMock(return_value=assignment),
            ),
            patch(
                "app.services.school_portal_team.school_portal_roles_for_user",
                AsyncMock(return_value=[user_role]),
            ),
            patch(
                "app.services.school_portal_team.count_active_school_admins",
                AsyncMock(return_value=1),
            ),
        ):
            with self.assertRaises(HTTPException) as caught:
                await revoke_school_portal_access(
                    _Db(),
                    context,
                    assignment.id,
                )

        self.assertEqual(409, caught.exception.status_code)

    async def test_transfer_rejects_a_department_outside_current_school(self):
        context = _context("school.team.manage")
        assignment = SimpleNamespace(
            id=uuid.uuid4(),
            entity_type="school",
            entity_id=context.school.id,
            role="lecturer",
        )
        department_id = uuid.uuid4()
        with (
            patch(
                "app.services.school_portal_team.get_school_record_or_404",
                AsyncMock(return_value=assignment),
            ),
            patch(
                "app.services.school_portal_team.Department.get_by_id",
                AsyncMock(
                    return_value=SimpleNamespace(
                        id=department_id,
                        school_id=uuid.uuid4(),
                        deleted_at=None,
                    )
                ),
            ),
        ):
            with self.assertRaises(HTTPException) as caught:
                await transfer_school_team_assignment(
                    _Db(), context, assignment.id, department_id=department_id
                )

        self.assertEqual(404, caught.exception.status_code)

    async def test_safe_delete_allows_only_unused_pending_assignment(self):
        context = _context("school.team.manage")
        active = SimpleNamespace(
            id=uuid.uuid4(),
            entity_type="school",
            entity_id=context.school.id,
            status="active",
            user_id=None,
        )
        with patch(
            "app.services.school_portal_team.get_school_record_or_404",
            AsyncMock(return_value=active),
        ):
            with self.assertRaises(HTTPException) as caught:
                await delete_school_team_assignment(_Db(), context, active.id)

        self.assertEqual(409, caught.exception.status_code)

    async def test_activate_emits_team_change_event(self):
        context = _context("school.team.manage")
        assignment = SimpleNamespace(
            id=uuid.uuid4(),
            entity_type="school",
            entity_id=context.school.id,
            status="inactive",
        )
        activated = SimpleNamespace(
            id=assignment.id,
            entity_type="school",
            entity_id=context.school.id,
            status="active",
        )
        db = _Db()
        with (
            patch(
                "app.services.school_portal_team.get_school_record_or_404",
                AsyncMock(return_value=assignment),
            ),
            patch(
                "app.services.school_portal_team.StaffService.activate_assignment",
                AsyncMock(return_value=activated),
            ),
            patch(
                "app.services.school_portal_team.record_school_portal_audit",
                AsyncMock(),
            ),
        ):
            result = await activate_school_team_assignment(
                db, context, assignment.id
            )

        self.assertEqual("active", result.status)
        event = next(item for item in db.added if item.__class__.__name__ == "OutboxEvent")
        self.assertEqual("school.team.changed", event.event_type)

    async def test_team_detail_requires_view_permission(self):
        context = _context()

        with self.assertRaises(HTTPException) as caught:
            await get_school_team_assignment(_Db(), context, uuid.uuid4())

        self.assertEqual(403, caught.exception.status_code)

    async def test_resend_invite_requires_role_management_permission(self):
        context = _context("school.team.view")

        with self.assertRaises(HTTPException) as caught:
            await resend_school_team_invite(
                _Db(), context, uuid.uuid4()
            )

        self.assertEqual(403, caught.exception.status_code)

    async def test_bulk_import_requires_bulk_permission(self):
        context = _context("school.team.manage")
        request = SchoolTeamImportRequest(
            rows=[{"email": "amina@example.com", "role": "lecturer"}],
            idempotency_key="team-import-0001",
        )

        with self.assertRaises(HTTPException) as caught:
            await queue_team_import(request, context)

        self.assertEqual(403, caught.exception.status_code)

    def test_team_routes_cover_the_full_lifecycle_without_school_id(self):
        app = FastAPI()
        register_routes(app)
        paths = app.openapi()["paths"]

        self.assertIn("/api/v1/school-portal/team", paths)
        self.assertIn("/api/v1/school-portal/team/{assignment_id}", paths)
        for action in (
            "activate",
            "deactivate",
            "end",
            "transfer",
            "revoke-access",
            "resend-invite",
        ):
            self.assertIn(
                f"/api/v1/school-portal/team/{{assignment_id}}/{action}",
                paths,
            )
        self.assertIn("/api/v1/school-portal/team/imports", paths)
        self.assertIn("/api/v1/school-portal/team/imports/template", paths)
        self.assertIn("delete", paths["/api/v1/school-portal/team/{assignment_id}"])
        parameters = {
            parameter["name"]
            for parameter in paths["/api/v1/school-portal/team"]["get"]["parameters"]
        }
        self.assertTrue({"page", "per_page", "search", "status", "role"} <= parameters)

        route_paths = list(paths)
        self.assertLess(
            route_paths.index("/api/v1/school-portal/team/imports/template"),
            route_paths.index("/api/v1/school-portal/team/{assignment_id}"),
        )


if __name__ == "__main__":
    unittest.main()
