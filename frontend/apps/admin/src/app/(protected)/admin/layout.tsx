"use client";

import { PortalShell } from "@/components/portals/portal-shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <PortalShell portalKey="admin">{children}</PortalShell>;
}
