import { Metadata } from "next";
import { PortalDashboard } from "@/components/portals/portal-dashboard";

export const metadata: Metadata = {
  title: "Institutional Administration",
};

export default function InstitutionalAdministrationPage() {
  return <PortalDashboard portalKey="institutional-administration" />;
}

