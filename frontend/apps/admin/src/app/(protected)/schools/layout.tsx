"use client";

import { PortalShell } from "@/components/portals/portal-shell";

export default function SchoolsLayout({ children }: { children: React.ReactNode }) {
  return <PortalShell portalKey="schools">{children}</PortalShell>;
}
