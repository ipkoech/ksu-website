"""Every /users route must be scope-guarded.

The read routes were originally reachable by any authenticated caller while the
write routes on the same router were scoped, which let any logged-in user
enumerate the whole user table.
"""

import inspect
import unittest

from app.api.v1.users import router

EXPECTED_SCOPES = {
    ("GET", "/"): "users:read",
    ("GET", "/{user_id}"): "users:read",
    ("POST", "/"): "users:write",
    ("PATCH", "/{user_id}"): "users:write",
    ("DELETE", "/{user_id}"): "users:delete",
}


def _required_scopes(route) -> set[str]:
    scopes = set()
    for dependency in route.dependencies:
        call = getattr(dependency, "dependency", None)
        if call is None:
            continue
        nonlocals = inspect.getclosurevars(call).nonlocals
        scope = nonlocals.get("scope")
        if isinstance(scope, str):
            scopes.add(scope)
    return scopes


def _routes():
    for route in router.routes:
        for method in route.methods:
            if method in {"HEAD", "OPTIONS"}:
                continue
            yield (method, route.path or "/"), route


class UsersRouteScopeTests(unittest.TestCase):
    def test_every_route_declares_the_expected_scope(self):
        found = {}
        for key, route in _routes():
            normalized = (key[0], key[1] or "/")
            found[normalized] = _required_scopes(route)

        for key, expected in EXPECTED_SCOPES.items():
            with self.subTest(route=key):
                self.assertIn(key, found, f"route {key} is missing from the users router")
                self.assertIn(
                    expected,
                    found[key],
                    f"route {key} must require {expected}",
                )

    def test_no_route_is_left_unscoped(self):
        for key, route in _routes():
            with self.subTest(route=key):
                self.assertTrue(
                    _required_scopes(route),
                    f"route {key} has no scope dependency; authenticated users could reach it",
                )


if __name__ == "__main__":
    unittest.main()
