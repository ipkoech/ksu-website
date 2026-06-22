"use client";

import { PortalShell } from "@/components/portals/portal-shell";

export default function InstitutionalAdministrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalShell portalKey="institutional-administration">{children}</PortalShell>;
}

