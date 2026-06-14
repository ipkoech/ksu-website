"use client";

import { PortalShell } from "@/components/portals/portal-shell";

export default function PublicationsLayout({ children }: { children: React.ReactNode }) {
  return <PortalShell portalKey="publications">{children}</PortalShell>;
}
