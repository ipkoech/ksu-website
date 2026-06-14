"use client";

import { PortalShell } from "@/components/portals/portal-shell";

export default function DepartmentsLayout({ children }: { children: React.ReactNode }) {
  return <PortalShell portalKey="departments">{children}</PortalShell>;
}
