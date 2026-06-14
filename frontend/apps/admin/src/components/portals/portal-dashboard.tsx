"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ShieldCheck } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ksu/ui/components";
import { usePermissions } from "@ksu/auth";
import { PageHeader } from "@/components/layout";
import { formatCount } from "@/lib/counts";
import { getPortalConfig } from "@/lib/portals/registry";
import type { PortalConfig, PortalKey } from "@/lib/portals/types";

interface PortalDashboardProps {
  portalKey: PortalKey;
}

export function PortalDashboard({ portalKey }: PortalDashboardProps) {
  const portal = getPortalConfig(portalKey);
  const { hasScope } = usePermissions();

  if (!portal) return null;

  const visibleStats = portal.dashboard.stats.filter((stat) =>
    !stat.scopes?.length || stat.scopes.some((scope) => hasScope(scope)),
  );
  const visiblePanels = portal.dashboard.panels.filter((panel) =>
    !panel.scopes?.length || panel.scopes.some((scope) => hasScope(scope)),
  );

  return (
    <div>
      <PageHeader title={portal.dashboard.title} description={portal.dashboard.description} />

      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-background p-3">
          <div className="mr-2 flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Portal role scopes
          </div>
          {portal.dashboard.scopeBadges.map((scope) => (
            <Badge key={scope} variant="secondary" className="font-mono text-[11px]">
              {scope}
            </Badge>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {visibleStats.map((stat) => (
            <PortalStatCard key={stat.href} stat={stat} />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.7fr]">
          <Card>
            <CardHeader>
              <CardTitle>{portal.shortTitle} work areas</CardTitle>
              <CardDescription>
                These are domain-specific CRUD and workflow surfaces for this portal only.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {visiblePanels.map((panel) => {
                const Icon = panel.icon;
                return (
                  <Link
                    key={panel.href}
                    href={panel.href}
                    className="group rounded-lg border bg-background p-4 transition-colors hover:border-primary/50 hover:bg-muted/30"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <h3 className="font-semibold">{panel.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{panel.description}</p>
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Portal boundaries</CardTitle>
              <CardDescription>
                This portal has its own URL, navigation, dashboard, and scoped operations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p className="rounded-lg border bg-background p-3">
                Shared backend services still provide login, roles, audit logs, media, and workflow state.
              </p>
              <p className="rounded-lg border bg-background p-3">
                Records remain domain-specific and are routed through the correct CRUD endpoints.
              </p>
              <Button asChild variant="outline" className="w-full justify-between">
                <Link href="/select-service">
                  Portal directory
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PortalStatCard({
  stat,
}: {
  stat: PortalConfig["dashboard"]["stats"][number];
}) {
  const query = useQuery({
    queryKey: stat.queryKey,
    queryFn: stat.query,
  });
  const Icon = stat.icon;

  return (
    <Link href={stat.href} className="block">
      <Card className="h-full transition-colors hover:border-primary/50 hover:bg-muted/30">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {stat.title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCount(query.data as any, query.isLoading, query.isError)}
          </div>
          <p className="text-xs text-muted-foreground">{stat.description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
