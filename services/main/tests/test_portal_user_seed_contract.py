"""Static contract checks for canonical portal QA accounts."""

from __future__ import annotations

import ast
from pathlib import Path


SEED_FILE = Path(__file__).parents[1] / "app" / "seeders" / "seed_portal_users.py"


def _portal_specs() -> list[dict[str, str]]:
    tree = ast.parse(SEED_FILE.read_text(encoding="utf-8"))
    for node in tree.body:
        if not isinstance(node, ast.Assign):
            continue
        if any(isinstance(target, ast.Name) and target.id == "PORTAL_USER_SPECS" for target in node.targets):
            value = ast.literal_eval(node.value)
            assert isinstance(value, list)
            return value
    raise AssertionError("PORTAL_USER_SPECS was not found")


def test_canonical_portal_accounts_have_unique_identity_and_role():
    specs = _portal_specs()
    assert len(specs) == 12
    for field in ("key", "email", "role"):
        values = [spec[field] for spec in specs]
        assert len(values) == len(set(values)), f"duplicate portal account {field}"
    assert all(spec["service_memberships"] for spec in specs)


def test_exactly_one_canonical_super_admin_account_exists():
    specs = _portal_specs()
    super_admins = [spec for spec in specs if spec["role"] == "super_admin"]
    assert super_admins == [
        {
            "key": "portal_super_admin",
            "email": "super.admin@ksu.dev.com",
            "full_name": "KSU Super Admin",
            "role": "super_admin",
            "institutional_role": "super_admin",
            "service_memberships": ["main", "research", "library", "heri", "system"],
        }
    ]
