from app.seeders import seed_portal_users, seed_rbac


def test_seeded_portal_users_are_canonical():
    assert {item["email"] for item in seed_portal_users.PORTAL_USER_SPECS} == {
        "system.admin@ksu.dev.com",
        "admin@ksu.dev.com",
        "corporate.admin@ksu.dev.com",
        "research.admin@ksu.dev.com",
        "school.admin@ksu.dev.com",
        "department.admin@ksu.dev.com",
        "library.admin@ksu.dev.com",
    }


def test_primary_roles_are_canonical():
    roles_by_name = {item["name"]: item for item in seed_rbac.ROLE_SPECS}

    assert "cocms_admin" not in roles_by_name
    assert "corporate_communication_admin" in roles_by_name
    assert "publications_admin" not in roles_by_name
    assert {
        "publications.manage",
        "publications.view",
        "publications.submit",
        "publications.review",
        "publications.approve",
    }.issubset(roles_by_name["research_admin"]["permission_names"])
