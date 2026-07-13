from app.services import portal_access


def test_portal_definitions_are_canonical():
    keys = set(portal_access.PORTAL_DEFINITIONS)
    assert {
        "super-admin",
        "admin",
        "corporate-communication",
        "research",
        "schools",
        "departments",
        "library",
    }.issubset(keys)
    assert "cocms" not in keys
    assert "governance" not in keys
    assert "institutional-administration" not in keys
    assert "publications" not in keys
    assert "student-clubs" not in keys


def test_corporate_communication_covers_homepage_and_content_permissions():
    portal = portal_access.PORTAL_DEFINITIONS["corporate-communication"]
    assert portal["href"] == "/corporate-communication"
    for permission in [
        "content.review",
        "content.publish",
        "media.manage",
        "homepage.manage",
        "partnership_spotlights.manage",
    ]:
        assert permission in portal["permissions"]
