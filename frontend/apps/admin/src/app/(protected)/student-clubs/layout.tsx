"use client";

import { PortalShell } from "@/components/portals/portal-shell";

export default function StudentClubsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalShell portalKey="student-clubs">{children}</PortalShell>;
}
