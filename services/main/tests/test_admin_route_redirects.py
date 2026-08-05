import unittest
from pathlib import Path


ADMIN_APP = Path(__file__).resolve().parents[3] / "frontend" / "apps" / "admin" / "src" / "app" / "(protected)"


class AdminRouteRedirectTests(unittest.TestCase):
    def test_legacy_portal_layouts_redirect_without_mounting_a_portal_shell(self):
        redirects = {
            "governance": "/admin",
            "institutional-administration": "/admin",
        }

        for route, destination in redirects.items():
            source = (ADMIN_APP / route / "layout.tsx").read_text()
            self.assertIn('import { redirect } from "next/navigation";', source)
            self.assertIn(f'redirect("{destination}");', source)
            self.assertNotIn("PortalShell", source)

    def test_corporate_communication_is_the_canonical_portal(self):
        source = (ADMIN_APP / "corporate-communication" / "layout.tsx").read_text()
        legacy = (ADMIN_APP / "cocms" / "page.tsx").read_text()

        # The layout delegates the portal shell to CorporatePortalProvider,
        # which mounts PortalShell with the canonical portal key.
        self.assertIn("CorporatePortalProvider", source)
        provider = (
            ADMIN_APP.parents[1]
            / "components"
            / "corporate"
            / "corporate-portal-provider.tsx"
        ).read_text()
        self.assertIn('portalKey="corporate-communication"', provider)
        self.assertNotIn("redirect(", source)
        self.assertIn('redirect("/corporate-communication")', legacy)
