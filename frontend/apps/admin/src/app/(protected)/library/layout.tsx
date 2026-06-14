"use client";

import { PortalShell } from "@/components/portals/portal-shell";

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalShell portalKey="library">{children}</PortalShell>;
}
