"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Settings } from "lucide-react";
import { useAuth, getHighestRole, formatRoleName } from "@ksu/auth";
import type { Service } from "@ksu/auth";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  LogoIcon,
} from "@ksu/ui/components";
import { cn } from "@ksu/ui/lib";
import { portalConfigs } from "@/lib/portals/registry";
import type { PortalConfig } from "@/lib/portals/types";

type PortalDirectoryItem = Pick<
  PortalConfig,
  "key" | "title" | "description" | "service" | "baseHref" | "icon" | "accentClassName"
> & {
  requiredScopes: string[];
};

const portalItems: PortalDirectoryItem[] = [
  {
    ...portalConfigs.governance,
    requiredScopes: ["governance.view", "governance.manage_boards"],
  },
  {
    ...portalConfigs.schools,
    requiredScopes: ["academic.view", "academic.manage_schools"],
  },
  {
    ...portalConfigs.departments,
    requiredScopes: ["academic.view", "academic.manage_departments"],
  },
  {
    ...portalConfigs["corporate-communication"],
    requiredScopes: ["content.view", "content.publish", "media.view"],
  },
  {
    ...portalConfigs.research,
    requiredScopes: ["research.view", "research.view_projects"],
  },
  {
    ...portalConfigs.library,
    requiredScopes: ["library.view"],
  },
  {
    ...portalConfigs.publications,
    requiredScopes: ["publications.view", "publications.submit", "publications.review"],
  },
  {
    key: "system" as any,
    title: "System Administration Portal",
    description: "Users, roles, permissions, audit logs, notifications, and settings.",
    service: "system",
    baseHref: "/system",
    icon: Settings,
    accentClassName: "text-slate-700 bg-slate-50 border-slate-200",
    requiredScopes: ["users.view", "roles.view", "permissions.view", "audit.view"],
  },
];

export default function SelectServicePage() {
  const router = useRouter();
  const { user, switchService } = useAuth();

  if (!user) return null;

  const isAdmin = user.roles.some((role) =>
    ["super-admin", "admin", "system-admin"].includes(role),
  );
  const scopes = new Set([
    ...(user.permissions ?? []),
    ...user.services.flatMap((service) => service.scopes),
  ].map((scope) => scope.toLowerCase()));
  const services = new Set(user.services.map((service) => service.service));

  const canAccess = (item: PortalDirectoryItem) => {
    if (isAdmin || scopes.has("admin:*") || scopes.has("*")) return true;
    if (!services.has(item.service)) return false;
    return item.requiredScopes.some((scope) => scopes.has(scope.toLowerCase()));
  };

  const visiblePortals = portalItems.filter(canAccess);

  const handleSelect = (service: Service, href: string) => {
    switchService(service);
    router.push(href);
  };

  return (
    <div className="min-h-screen bg-muted/40 p-4 sm:p-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 rounded-lg border bg-background p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <LogoIcon size="lg" priority />
            <div>
              <h1 className="text-2xl font-bold">Kisii University Portals</h1>
              <p className="text-sm text-muted-foreground">
                Welcome, {user.name}. Choose an individual portal workspace.
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="w-fit">
            {visiblePortals.length} portals available
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visiblePortals.map((portal) => {
            const Icon = portal.icon;
            const role = getHighestRole(user.roles, portal.service);

            return (
              <Card key={portal.baseHref} className="flex h-full flex-col">
                <CardHeader className="flex flex-row items-start gap-4">
                  <div className={cn("rounded-lg border p-3", portal.accentClassName)}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg">{portal.title}</CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">
                      {portal.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="mt-auto flex items-center justify-between gap-3">
                  <Badge variant="outline">
                    {role ? formatRoleName(role) : "Scoped Access"}
                  </Badge>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleSelect(portal.service, portal.baseHref)}
                  >
                    Open
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
