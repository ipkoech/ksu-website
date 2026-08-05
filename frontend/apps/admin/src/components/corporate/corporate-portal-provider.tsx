"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ApiClientError,
  corporatePortalApi,
  corporatePortalQueryKeys,
  type CorporatePortalContextResponse,
} from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";
import { RefreshCw, ShieldAlert } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@ksu/ui/components";
import { PortalShell } from "@/components/portals/portal-shell";
import { getPortalConfig } from "@/lib/portals/registry";
import type { PortalNavItem } from "@/lib/portals/types";

interface CorporatePortalContextValue {
  /** Server-computed capability map; empty when running in fallback mode. */
  capabilities: Record<string, boolean>;
  /** Server-approved navigation keys; empty when running in fallback mode. */
  allowedNavigation: string[];
  /** False when the backend lacks the context endpoint (client-side fallback). */
  serverAuthorized: boolean;
  can: (capability: string) => boolean;
}

const CorporatePortalContext =
  createContext<CorporatePortalContextValue | null>(null);

/** Marker for older backends without the context endpoint (404). */
const FALLBACK = Symbol("corporate-portal-fallback");

function PortalBootstrapSkeleton() {
  return (
    <div
      className="flex h-screen overflow-hidden"
      role="status"
      aria-label="Loading Corporate Communication portal"
    >
      <div className="hidden h-screen w-[17.5rem] flex-col border-r bg-sidebar md:flex">
        <div className="flex h-16 items-center gap-3 border-b px-4">
          <Skeleton className="size-10 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-2.5 w-24" />
            <Skeleton className="h-3.5 w-36" />
          </div>
        </div>
        <div className="flex-1 space-y-2 px-3 py-4">
          {Array.from({ length: 9 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 px-2 py-1.5">
              <Skeleton className="size-4 rounded" />
              <Skeleton className="h-3.5 w-40" />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 border-t p-3">
          <Skeleton className="size-8 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-2.5 w-36" />
          </div>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-16 items-center justify-between border-b px-6">
          <Skeleton className="h-4 w-56" />
          <div className="flex items-center gap-2">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="size-8 rounded-lg" />
          </div>
        </div>
        <div className="flex-1 space-y-6 bg-muted/30 p-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-80" />
            <Skeleton className="h-4 w-[28rem] max-w-full" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
      <span className="sr-only">Loading portal permissions…</span>
    </div>
  );
}

function PortalBootstrapError({
  error,
  onRetry,
  isRetrying,
}: {
  error: Error;
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full border bg-muted text-muted-foreground">
            <ShieldAlert className="size-6" aria-hidden="true" />
          </div>
          <CardTitle>Portal unavailable</CardTitle>
          <CardDescription>
            We couldn&apos;t confirm your Corporate Communication access with
            the server, so the portal can&apos;t open safely. This is usually
            temporary — retry in a moment, or contact an administrator if it
            persists.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          <p className="text-xs text-muted-foreground" role="alert">
            {error.message}
          </p>
          <Button
            onClick={onRetry}
            disabled={isRetrying}
            aria-label="Retry loading the Corporate Communication portal"
          >
            <RefreshCw
              data-icon="inline-start"
              className={isRetrying ? "animate-spin" : undefined}
              aria-hidden="true"
            />
            {isRetrying ? "Retrying…" : "Try again"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

export function CorporatePortalProvider({ children }: { children: ReactNode }) {
  const { hasScope } = usePermissions();
  const contextQuery = useQuery<
    CorporatePortalContextResponse | typeof FALLBACK
  >({
    queryKey: corporatePortalQueryKeys.bootstrap,
    queryFn: async () => {
      try {
        return (await corporatePortalApi.context()).data;
      } catch (error) {
        // Older backends don't expose the endpoint yet: degrade to the
        // registry's client-side scope filtering instead of blocking.
        if (error instanceof ApiClientError && error.status === 404) {
          return FALLBACK;
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const data = contextQuery.data;
  const serverContext =
    data && data !== FALLBACK ? (data as CorporatePortalContextResponse) : null;

  const navigation = useMemo<PortalNavItem[] | undefined>(() => {
    if (!serverContext) return undefined;
    const portal = getPortalConfig("corporate-communication");
    if (!portal) return undefined;
    const allowed = new Set<string>(serverContext.allowed_navigation);
    return portal.nav.filter(
      (item) => !item.navKey || allowed.has(item.navKey),
    );
  }, [serverContext]);

  const value = useMemo<CorporatePortalContextValue>(
    () =>
      serverContext
        ? {
            capabilities: serverContext.capabilities,
            allowedNavigation: serverContext.allowed_navigation,
            serverAuthorized: true,
            can: (capability) =>
              serverContext.capabilities[capability] === true,
          }
        : {
            capabilities: {},
            allowedNavigation: [],
            serverAuthorized: false,
            can: (capability) => hasScope(capability),
          },
    [serverContext, hasScope],
  );

  if (contextQuery.isPending) return <PortalBootstrapSkeleton />;
  if (contextQuery.error) {
    return (
      <PortalBootstrapError
        error={contextQuery.error}
        onRetry={() => void contextQuery.refetch()}
        isRetrying={contextQuery.isRefetching}
      />
    );
  }

  return (
    <CorporatePortalContext.Provider value={value}>
      <PortalShell portalKey="corporate-communication" navOverride={navigation}>
        {children}
      </PortalShell>
    </CorporatePortalContext.Provider>
  );
}

export function useCorporatePortal() {
  const context = useContext(CorporatePortalContext);
  if (!context) {
    throw new Error(
      "useCorporatePortal must be used within CorporatePortalProvider",
    );
  }
  return context;
}
