import unittest

from ksu_common.roles import ALL_PERMISSIONS, ROLE_DEFINITIONS


REQUIRED_PAGE_CMS_PERMISSIONS = {
    "page_sections.view",
    "page_sections.create",
    "page_sections.update",
    "page_sections.delete",
    "page_sections.review",
    "page_sections.publish",
    "section_items.manage",
    "partnership_spotlights.manage",
    "homepage.view",
    "homepage.manage",
    "homepage.publish",
    "school_homepage.manage",
    "research_homepage.manage",
    "library_homepage.manage",
    "media.attach",
    "media.detach",
}


class PageCmsRolePermissionTests(unittest.TestCase):
    def test_all_permissions_include_page_cms_permissions(self):
        self.assertTrue(REQUIRED_PAGE_CMS_PERMISSIONS.issubset(set(ALL_PERMISSIONS)))

    def test_admin_role_includes_page_cms_permissions(self):
        self.assertTrue(
            REQUIRED_PAGE_CMS_PERMISSIONS.issubset(set(ROLE_DEFINITIONS["admin"].scopes))
        )

    def test_content_and_domain_roles_receive_homepage_permissions(self):
        self.assertIn("school_homepage.manage", ROLE_DEFINITIONS["content-admin"].scopes)
        self.assertIn("research_homepage.manage", ROLE_DEFINITIONS["research-content-admin"].scopes)
        self.assertIn("library_homepage.manage", ROLE_DEFINITIONS["library-admin"].scopes)

    def test_library_admin_role_includes_media_link_permissions(self):
        self.assertIn("media.attach", ROLE_DEFINITIONS["library-admin"].scopes)
        self.assertIn("media.detach", ROLE_DEFINITIONS["library-admin"].scopes)


if __name__ == "__main__":
    unittest.main()
