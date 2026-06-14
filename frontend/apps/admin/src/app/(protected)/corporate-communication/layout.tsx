"use client";

import { PortalShell } from "@/components/portals/portal-shell";

export default function CorporateCommunicationLayout({ children }: { children: React.ReactNode }) {
  return <PortalShell portalKey="corporate-communication">{children}</PortalShell>;
}
