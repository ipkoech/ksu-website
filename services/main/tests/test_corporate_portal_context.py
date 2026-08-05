import unittest
import uuid
from types import SimpleNamespace

from fastapi import FastAPI

from app.api.v1 import register_routes
from app.api.v1.corporate_portal import context_response
from app.services.corporate_portal_context import (
    CORPORATE_PORTAL_CAPABILITIES,
    CORPORATE_PORTAL_NAVIGATION,
    allowed_corporate_navigation,
    corporate_portal_capabilities,
)


def _permission(name: str):
    return SimpleNamespace(name=name, is_active=True)


def _assignment(
    role_name: str,
    *,
    permissions: tuple[str, ...],
    is_active: bool = True,
    role_is_active: bool = True,
):
    return SimpleNamespace(
        is_active=is_active,
        scope_type="global",
        scope_id=None,
        role=SimpleNamespace(
            name=role_name,
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
        email="comms@example.test",
        role_assignments=list(assignments),
    )


class CorporatePortalContextTests(unittest.TestCase):
    def test_corporate_portal_context_route_is_registered(self):
        app = FastAPI()
        register_routes(app)
        paths = app.openapi()["paths"]

        self.assertIn("/api/v1/corporate-communication-portal/context", paths)
        self.assertIn(
            "get", paths["/api/v1/corporate-communication-portal/context"]
        )

    def test_every_navigation_scope_is_a_known_capability(self):
        capability_set = set(CORPORATE_PORTAL_CAPABILITIES)
        for key, scopes in CORPORATE_PORTAL_NAVIGATION:
            for scope in scopes:
                self.assertIn(scope, capability_set, f"{key} requires {scope}")

    def test_admin_wildcard_grants_every_capability_and_nav_item(self):
        user = _user(_assignment("super_admin", permissions=("admin:*",)))

        response = context_response(user)

        self.assertTrue(all(response.capabilities.values()))
        self.assertEqual(
            [key for key, _scopes in CORPORATE_PORTAL_NAVIGATION],
            response.allowed_navigation,
        )

    def test_scoped_viewer_gets_reduced_capabilities_and_navigation(self):
        user = _user(
            _assignment(
                "comms_viewer",
                permissions=(
                    "content.view",
                    "media.view",
                    "unrelated.permission",
                ),
            )
        )

        capabilities = corporate_portal_capabilities(user)

        self.assertTrue(capabilities["content.view"])
        self.assertTrue(capabilities["media.view"])
        self.assertFalse(capabilities["content.publish"])
        self.assertFalse(capabilities["content.manage_news"])
        self.assertFalse(capabilities["policy.manage"])
        self.assertNotIn("unrelated.permission", capabilities)
        self.assertEqual(
            ["dashboard", "media", "oversight"],
            allowed_corporate_navigation(capabilities),
        )

    def test_manage_wildcard_semantics_widen_capabilities_like_the_api(self):
        # `content.manage_news` grants other content manage-actions exactly as
        # require_scope() would; the capability map must mirror enforcement.
        user = _user(
            _assignment("comms_editor", permissions=("content.manage_news",))
        )

        capabilities = corporate_portal_capabilities(user)

        self.assertTrue(capabilities["content.manage_news"])
        self.assertTrue(capabilities["content.manage"])
        self.assertFalse(capabilities["content.view"])
        self.assertFalse(capabilities["media.manage"])
        allowed = allowed_corporate_navigation(capabilities)
        self.assertIn("newsroom", allowed)
        self.assertIn("engagement", allowed)
        self.assertNotIn("media", allowed)

    def test_inactive_assignments_grant_nothing(self):
        user = _user(
            _assignment(
                "comms_editor",
                permissions=("content.view",),
                is_active=False,
            ),
            _assignment(
                "comms_reviewer",
                permissions=("content.review",),
                role_is_active=False,
            ),
        )

        response = context_response(user)

        self.assertFalse(any(response.capabilities.values()))
        self.assertEqual([], response.allowed_navigation)

    def test_user_without_assignments_gets_empty_navigation(self):
        response = context_response(_user())

        self.assertEqual(
            sorted(CORPORATE_PORTAL_CAPABILITIES),
            sorted(response.capabilities),
        )
        self.assertFalse(any(response.capabilities.values()))
        self.assertEqual([], response.allowed_navigation)


if __name__ == "__main__":
    unittest.main()
