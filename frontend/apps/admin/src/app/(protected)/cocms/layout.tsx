"use client";

import { PortalShell } from "@/components/portals/portal-shell";

export default function CoCmsLayout({ children }: { children: React.ReactNode }) {
  return <PortalShell portalKey="cocms">{children}</PortalShell>;
}
