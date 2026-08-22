"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  researchPortalApi,
  researchPortalQueryKeys,
  type ResearchPortalContextResponse,
} from "@ksu/api-client";
import { Alert, AlertDescription, AlertTitle, Skeleton } from "@ksu/ui/components";
import { PortalShell } from "@/components/portals/portal-shell";
import { getPortalConfig } from "@/lib/portals/registry";
import type { PortalNavItem } from "@/lib/portals/types";

type ResearchPortalContextValue = ResearchPortalContextResponse & {
  /** True when the server granted this capability. */
  can: (permission: string) => boolean;
  /** True when the caller works inside the named domain workspace. */
  inDomain: (domain: string) => boolean;
};

const ResearchPortalContext = createContext<ResearchPortalContextValue | null>(
  null,
);

function PortalBootstrapSkeleton() {
  return (
    <div className="grid min-h-screen grid-cols-[17.5rem_1fr]">
      <Skeleton className="h-screen rounded-none" />
      <div className="space-y-4 p-8">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-52 w-full" />
      </div>
    </div>
  );
}

function PortalBootstrapError({ error }: { error: Error }) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl items-center p-6">
      <Alert variant="destructive">
        <AlertTitle>Research Portal unavailable</AlertTitle>
        <AlertDescription>
          {error.message}. Contact an administrator to confirm your research
          access.
        </AlertDescription>
      </Alert>
    </main>
  );
}

/**
 * Keep only the nav items the server authorised.
 *
 * Items carry a stable `navKey` matching the backend's navigation table. Items
 * without one are legacy entries that predate server-driven navigation; they
 * fall back to the registry's own client-side `scope` check so this provider
 * never hides a section the backend has no opinion about.
 */
function filterNav(
  items: PortalNavItem[],
  allowed: Set<string>,
): PortalNavItem[] {
  return items.reduce<PortalNavItem[]>((kept, item) => {
    const children = item.children ? filterNav(item.children, allowed) : undefined;
    const selfAllowed = item.navKey ? allowed.has(item.navKey) : true;
    if (!selfAllowed && !children?.length) return kept;
    kept.push(children ? { ...item, children } : item);
    return kept;
  }, []);
}

export function ResearchPortalProvider({ children }: { children: ReactNode }) {
  const contextQuery = useQuery({
    queryKey: researchPortalQueryKeys.bootstrap,
    queryFn: async () => (await researchPortalApi.context()).data,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const context = contextQuery.data;

  const navOverride = useMemo(() => {
    if (!context) return undefined;
    const portal = getPortalConfig("research");
    if (!portal) return undefined;
    return filterNav(portal.nav, new Set(context.allowed_navigation));
  }, [context]);

  const value = useMemo<ResearchPortalContextValue | null>(
    () =>
      context
        ? {
            ...context,
            can: (permission) => context.capabilities[permission] === true,
            inDomain: (domain) => context.domains.includes(domain),
          }
        : null,
    [context],
  );

  if (contextQuery.isPending) return <PortalBootstrapSkeleton />;
  if (contextQuery.error) {
    return <PortalBootstrapError error={contextQuery.error as Error} />;
  }
  if (!value) {
    return (
      <PortalBootstrapError
        error={new Error("No research access is assigned to this account")}
      />
    );
  }

  return (
    <ResearchPortalContext.Provider value={value}>
      <PortalShell portalKey="research" navOverride={navOverride}>
        {children}
      </PortalShell>
    </ResearchPortalContext.Provider>
  );
}

export function useResearchPortal() {
  const context = useContext(ResearchPortalContext);
  if (!context) {
    throw new Error(
      "useResearchPortal must be used within ResearchPortalProvider",
    );
  }
  return context;
}

/**
 * Read the portal context without throwing.
 *
 * Research pages are also reachable through the generic portal shell, so
 * shared components use this to degrade gracefully when no provider is above
 * them.
 */
export function useOptionalResearchPortal() {
  return useContext(ResearchPortalContext);
}
