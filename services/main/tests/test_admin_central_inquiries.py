"""Authorization tests for the central (corporate-aware) inquiry inbox."""

import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import FastAPI, HTTPException

from app.api.v1 import register_routes
from app.api.v1.admin.inquiries import (
    CORPORATE_INQUIRY_SCOPES,
    InquiryActor,
    _school_visibility,
    get_inquiry_actor,
    list_inquiries,
)


def _user(*permission_names: str):
    """Build a duck-typed user whose active roles grant the given permissions."""
    role = SimpleNamespace(
        is_active=True,
        role_permissions=[
            SimpleNamespace(permission=SimpleNamespace(name=name, is_active=True))
            for name in permission_names
        ],
    )
    return SimpleNamespace(
        id=uuid.uuid4(),
        role_assignments=[SimpleNamespace(is_active=True, role=role)],
    )


class CentralInquiryAuthTests(unittest.IsolatedAsyncioTestCase):
    async def test_admin_scope_grants_admin_actor(self):
        actor = await get_inquiry_actor(_user("admin:*"))
        self.assertTrue(actor.is_admin)

    async def test_corporate_scopes_grant_non_admin_access(self):
        for scope in CORPORATE_INQUIRY_SCOPES:
            with self.subTest(scope=scope):
                actor = await get_inquiry_actor(_user(scope))
                self.assertFalse(actor.is_admin)

    async def test_expected_corporate_scopes_are_the_seeded_ones(self):
        self.assertEqual(
            ("content.manage", "support.manage_contacts"),
            CORPORATE_INQUIRY_SCOPES,
        )

    async def test_unrelated_scope_is_rejected(self):
        with self.assertRaises(HTTPException) as caught:
            await get_inquiry_actor(_user("media.view", "content.view"))
        self.assertEqual(403, caught.exception.status_code)

    async def test_user_without_roles_is_rejected(self):
        with self.assertRaises(HTTPException) as caught:
            await get_inquiry_actor(_user())
        self.assertEqual(403, caught.exception.status_code)

    def test_school_visibility_is_admin_only(self):
        admin = InquiryActor(user=_user("admin:*"), is_admin=True)
        corporate = InquiryActor(
            user=_user("support.manage_contacts"), is_admin=False
        )
        self.assertTrue(_school_visibility(admin, True))
        self.assertFalse(_school_visibility(admin, False))
        self.assertFalse(_school_visibility(corporate, True))
        self.assertFalse(_school_visibility(corporate, False))

    async def test_non_admin_list_cannot_widen_to_school_owned(self):
        corporate = InquiryActor(
            user=_user("content.manage"), is_admin=False
        )
        with patch(
            "app.api.v1.admin.inquiries.ContactInquiryService.list_for_admin",
            new=AsyncMock(
                return_value=SimpleNamespace(items=[], meta={"total": 0})
            ),
        ) as mock_list:
            await list_inquiries(
                db=object(), actor=corporate, include_school_owned=True
            )
        self.assertFalse(mock_list.call_args.kwargs["include_school_owned"])

    async def test_admin_list_keeps_school_widening(self):
        admin = InquiryActor(user=_user("admin:*"), is_admin=True)
        with patch(
            "app.api.v1.admin.inquiries.ContactInquiryService.list_for_admin",
            new=AsyncMock(
                return_value=SimpleNamespace(items=[], meta={"total": 0})
            ),
        ) as mock_list:
            await list_inquiries(
                db=object(), actor=admin, include_school_owned=True
            )
        self.assertTrue(mock_list.call_args.kwargs["include_school_owned"])

    def test_central_inquiry_routes_cover_conversation_actions(self):
        app = FastAPI()
        register_routes(app)
        paths = app.openapi()["paths"]
        base = "/api/v1/admin/inquiries"
        for path in (
            base,
            f"{base}/{{inquiry_id}}",
            f"{base}/{{inquiry_id}}/assign",
            f"{base}/{{inquiry_id}}/status",
            f"{base}/{{inquiry_id}}/notes",
            f"{base}/{{inquiry_id}}/replies",
            f"{base}/{{inquiry_id}}/messages/{{message_id}}/retry",
        ):
            self.assertIn(path, paths)

    def test_engagement_nav_exposes_inquiries_scope(self):
        from app.services.corporate_portal_context import (
            CORPORATE_PORTAL_CAPABILITIES,
            CORPORATE_PORTAL_NAVIGATION,
        )

        self.assertIn("support.manage_contacts", CORPORATE_PORTAL_CAPABILITIES)
        engagement = dict(CORPORATE_PORTAL_NAVIGATION)["engagement"]
        self.assertIn("support.manage_contacts", engagement)
        self.assertIn("content.manage", engagement)


if __name__ == "__main__":
    unittest.main()
