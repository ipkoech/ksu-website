from app.seeders.seed_rbac import COCMS_PERMISSION_NAMES, PERMISSION_SPECS


def test_corporate_communication_role_has_vc_content_permissions():
    expected = {"vc_hub.view", "vc_hub.manage", "vc_hub.review", "vc_hub.publish"}
    assert expected.issubset(COCMS_PERMISSION_NAMES)
    assert expected.issubset({spec[0] for spec in PERMISSION_SPECS})
