import { PortalShell } from "@/components/portals/portal-shell";
import type { ReactNode } from "react";

export default function StoryContributorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <PortalShell portalKey="story-contributor">{children}</PortalShell>;
}
