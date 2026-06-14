"use client";

import { PortalShell } from "@/components/portals/portal-shell";

export default function ResearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalShell portalKey="research">{children}</PortalShell>;
}
