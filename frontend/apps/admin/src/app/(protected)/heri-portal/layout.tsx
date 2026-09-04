import { PortalShell } from "@/components/portals/portal-shell";

export default function HeriPortalLayout({ children }: { children: React.ReactNode }) {
  return <PortalShell portalKey="heri">{children}</PortalShell>;
}
