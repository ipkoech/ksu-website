import unittest
from pathlib import Path


ADMIN_APP = Path(__file__).resolve().parents[3] / "frontend" / "apps" / "admin" / "src" / "app" / "(protected)"


class AdminRouteRedirectTests(unittest.TestCase):
    def test_legacy_portal_layouts_redirect_without_mounting_a_portal_shell(self):
        redirects = {
            "governance": "/admin",
            "institutional-administration": "/admin",
            "corporate-communication": "/cocms",
        }

        for route, destination in redirects.items():
            source = (ADMIN_APP / route / "layout.tsx").read_text()
            self.assertIn('import { redirect } from "next/navigation";', source)
            self.assertIn(f'redirect("{destination}");', source)
            self.assertNotIn("PortalShell", source)

