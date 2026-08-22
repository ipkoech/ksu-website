"use client";

import { ResearchPortalProvider } from "@/components/research/research-portal-provider";
import { ResearchAskAIWidget } from "./_components/research-ask-ai-widget";

export default function ResearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ResearchPortalProvider>
      {children}
      <ResearchAskAIWidget />
    </ResearchPortalProvider>
  );
}
