"use client";

import { PortalShell } from "@/components/portals/portal-shell";
import { ResearchAskAIWidget } from "./_components/research-ask-ai-widget";

export default function ResearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalShell portalKey="research">
      {children}
      <ResearchAskAIWidget />
    </PortalShell>
  );
}
