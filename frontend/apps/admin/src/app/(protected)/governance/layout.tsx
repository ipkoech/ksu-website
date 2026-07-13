"use client";

import { PortalShell } from "@/components/portals/portal-shell";

export default function GovernanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalShell portalKey="governance">{children}</PortalShell>;
}
