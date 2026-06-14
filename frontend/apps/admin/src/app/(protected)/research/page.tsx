import { Metadata } from "next";
import { PortalDashboard } from "@/components/portals/portal-dashboard";

export const metadata: Metadata = {
  title: "Research Dashboard",
};

export default function ResearchDashboardPage() {
  return <PortalDashboard portalKey="research" />;
}
