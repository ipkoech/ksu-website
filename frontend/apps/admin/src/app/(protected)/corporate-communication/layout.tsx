"use client";

import { CorporatePortalProvider } from "@/components/corporate/corporate-portal-provider";

export default function CorporateCommunicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CorporatePortalProvider>{children}</CorporatePortalProvider>;
}
