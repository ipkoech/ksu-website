"""Scope wiring tests for the social posts router.

The Corporate Communication portal exposes the social publishing subsystem to
``marketing.manage_social`` holders, while connected platform accounts
(credentials) remain admin-only. These tests pin the required scope on every
route and verify the permission-resolution semantics the relaxation relies on:

* ``marketing.manage_social`` grants posts CRUD/publish + read-only account
  listing, but none of the account-management routes.
* ``admin:*`` keeps working everywhere (wildcard superuser).
* The permission is seeded and granted to the roles that hold
  ``marketing.manage_sliders`` (CoCMS roles).
"""

from __future__ import annotations

import unittest

from fastapi.routing import APIRoute

from app.api.v1 import social_posts
from app.deps import _has_permission
from app.seeders import seed_rbac
from app.services.corporate_portal_context import (
    CORPORATE_PORTAL_CAPABILITIES,
    CORPORATE_PORTAL_NAVIGATION,
    allowed_corporate_navigation,
)

MANAGE = "marketing.manage_social"


def _route_scope(route: APIRoute) -> str | None:
    """Extract the scope literal captured by the require_scope dependency."""
    for depends in route.dependencies:
        check = depends.dependency
        if check is None or check.__closure__ is None:
            continue
        freevars = check.__code__.co_freevars
        if "scope" in freevars:
            return check.__closure__[freevars.index("scope")].cell_contents
    return None


def _scope_map() -> dict[tuple[str, str], str | None]:
    result: dict[tuple[str, str], str | None] = {}
    for route in social_posts.router.routes:
        if not isinstance(route, APIRoute):
            continue
        for method in route.methods - {"HEAD", "OPTIONS"}:
            result[(method, route.path)] = _route_scope(route)
    return result


class SocialPostsRouteScopeTests(unittest.TestCase):
    def test_posts_routes_require_manage_social(self):
        scopes = _scope_map()
        expected_manage = [
            ("GET", ""),
            ("POST", ""),
            ("GET", "/accounts"),
            ("GET", "/{item_id}"),
            ("PATCH", "/{item_id}"),
            ("DELETE", "/{item_id}"),
            ("GET", "/{item_id}/deliveries"),
            ("POST", "/{item_id}/validate"),
            ("POST", "/{item_id}/publish"),
        ]
        for key in expected_manage:
            self.assertEqual(MANAGE, scopes[key], f"route {key} should require {MANAGE}")

    def test_account_management_routes_stay_admin_only(self):
        scopes = _scope_map()
        expected_admin = [
            ("POST", "/accounts"),
            ("PATCH", "/accounts/{item_id}"),
            ("POST", "/accounts/{item_id}/validate"),
            ("DELETE", "/accounts/{item_id}"),
        ]
        for key in expected_admin:
            self.assertEqual("admin:*", scopes[key], f"route {key} must stay admin-only")

    def test_every_route_is_scope_protected(self):
        for key, scope in _scope_map().items():
            self.assertIsNotNone(scope, f"route {key} lost its scope dependency")


class SocialScopeResolutionTests(unittest.TestCase):
    def test_manage_social_grants_posts_but_not_account_admin(self):
        granted = {MANAGE}
        self.assertTrue(_has_permission(granted, MANAGE))
        self.assertFalse(_has_permission(granted, "admin:*"))

    def test_admin_wildcard_still_grants_manage_social_routes(self):
        self.assertTrue(_has_permission({"admin:*"}, MANAGE))

    def test_manage_sliders_holders_resolve_manage_social(self):
        # Platform-wide action equivalence: any marketing.manage_* permission
        # grants write-level marketing actions, so today's slider managers can
        # use the social workspace without a migration on existing databases.
        self.assertTrue(_has_permission({"marketing.manage_sliders"}, MANAGE))

    def test_view_scopes_do_not_grant_manage_social(self):
        self.assertFalse(_has_permission({"marketing.view"}, MANAGE))
        self.assertFalse(_has_permission({"content.view"}, MANAGE))


class SocialScopeSeedingTests(unittest.TestCase):
    def test_permission_spec_exists(self):
        names = {spec[0] for spec in seed_rbac.PERMISSION_SPECS}
        self.assertIn(MANAGE, names)

    def test_granted_alongside_manage_sliders_in_cocms_roles(self):
        self.assertIn("marketing.manage_sliders", seed_rbac.COCMS_PERMISSION_NAMES)
        self.assertIn(MANAGE, seed_rbac.COCMS_PERMISSION_NAMES)

    def test_every_manage_sliders_role_resolves_manage_social(self):
        # Explicitly seeded (CoCMS roles) or resolved via the marketing
        # manage-action equivalence in ``_has_permission`` — every role that
        # holds manage_sliders must be able to use the social workspace.
        for role in seed_rbac.ROLE_SPECS:
            if "marketing.manage_sliders" in role["permission_names"]:
                self.assertTrue(
                    _has_permission(set(role["permission_names"]), MANAGE),
                    f"role {role['name']} holds manage_sliders but cannot resolve {MANAGE}",
                )


class SocialPortalContextTests(unittest.TestCase):
    def test_capability_and_nav_registered(self):
        self.assertIn(MANAGE, CORPORATE_PORTAL_CAPABILITIES)
        nav = dict(CORPORATE_PORTAL_NAVIGATION)
        self.assertIn("social", nav)
        self.assertIn(MANAGE, nav["social"])

    def test_nav_key_resolves_from_capability(self):
        capabilities = {capability: False for capability in CORPORATE_PORTAL_CAPABILITIES}
        self.assertNotIn("social", allowed_corporate_navigation(capabilities))
        capabilities[MANAGE] = True
        self.assertIn("social", allowed_corporate_navigation(capabilities))


if __name__ == "__main__":
    unittest.main()
