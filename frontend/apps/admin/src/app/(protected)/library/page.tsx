import { Metadata } from "next";
import { PortalDashboard } from "@/components/portals/portal-dashboard";

export const metadata: Metadata = {
  title: "Library Dashboard",
};

export default function LibraryDashboardPage() {
  return <PortalDashboard portalKey="library" />;
}
