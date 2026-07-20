"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Landmark, PenLine, Settings, UserCheck } from "lucide-react";
import { useAuth, getHighestRole, formatRoleName } from "@ksu/auth";
import type { Service } from "@ksu/auth";
import { usePortalAccess, type PortalAccess } from "@ksu/api-client";
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
  access?: PortalAccess;
};

const portalItems: PortalDirectoryItem[] = [
  {
    key: "super-admin",
    title: "Super Admin Portal",
    description: "System-wide users, roles, permissions, audit records, and administrative overrides.",
    service: "system",
    baseHref: "/super-admin",
    icon: Settings,
    accentClassName: "text-slate-700 bg-slate-50 border-slate-200",
    requiredScopes: ["users.view", "roles.view", "permissions.view", "audit.view", "settings.manage"],
  },
  {
    key: "admin",
    title: "Admin Portal",
    description: "Governance, institutional administration, offices, policies, and academic coordination.",
    service: "main",
    baseHref: "/admin",
    icon: Landmark,
    accentClassName: "text-sky-700 bg-sky-50 border-sky-100",
    requiredScopes: ["governance.view", "administration.view", "office.manage_content", "policy.manage"],
  },
  {
    ...portalConfigs["corporate-communication"],
    key: "corporate-communication",
    title: "Corporate Communication Portal",
    baseHref: "/corporate-communication",
    requiredScopes: [
      "content.view",
      "content.review",
      "content.publish",
      "homepage.manage",
      "media.view",
      "media.manage",
      "page_sections.view",
      "partnership_spotlights.manage",
      "clubs.view",
    ],
  },
  {
    ...portalConfigs["story-contributor"],
    key: "story-contributor",
    title: "Story Contributor Portal",
    baseHref: "/story-contributor",
    requiredScopes: ["stories.submit", "stories.view_own", "stories.update_own", "content.submit"],
    icon: PenLine,
  },
  {
    ...portalConfigs.schools,
    key: "schools",
    baseHref: "/schools",
    requiredScopes: ["academic.view", "academic.manage_schools"],
  },
  {
    ...portalConfigs.departments,
    key: "departments",
    baseHref: "/departments",
    requiredScopes: ["academic.view", "academic.manage_departments"],
  },
  {
    ...portalConfigs.research,
    key: "research",
    baseHref: "/research",
    requiredScopes: ["research.view", "research.view_projects", "publications.view"],
  },
  {
    ...portalConfigs.library,
    key: "library",
    baseHref: "/library",
    requiredScopes: ["library.view"],
  },
  {
    key: "staff-profile",
    title: "Staff Profile Portal",
    description: "Update your public staff profile, photo, CV, contacts, biography, and research profile links.",
    service: "main",
    baseHref: "/settings/profile",
    icon: UserCheck,
    accentClassName: "text-emerald-700 bg-emerald-50 border-emerald-100",
    requiredScopes: ["profile.self_edit"],
  },
];

const portalFallbacks = new Map<string, PortalDirectoryItem>(
  portalItems.map((item) => [item.key, item]),
);

const canonicalPortalKeys = new Set([
  "super-admin",
  "admin",
  "corporate-communication",
  "story-contributor",
  "research",
  "schools",
  "departments",
  "library",
  "staff-profile",
]);

const portalAliases = new Map<string, string>([
  ["cocms", "corporate-communication"],
  ["page-cms", "corporate-communication"],
  ["student-clubs", "corporate-communication"],
  ["story-contributor", "story-contributor"],
  ["governance", "admin"],
  ["institutional-administration", "admin"],
  ["publications", "research"],
  ["system", "super-admin"],
]);

function directoryItemFromAccess(access: PortalAccess): PortalDirectoryItem {
  const canonicalKey = portalAliases.get(access.key) ?? access.key;
  const fallback = portalFallbacks.get(canonicalKey);
  if (fallback) {
    const isAlias = canonicalKey !== access.key;
    return {
      ...fallback,
      title: isAlias ? fallback.title : access.label || fallback.title,
      description:
        access.scope_type === "global"
          ? fallback.description
          : `${fallback.description} Current scope: ${access.scope_label}.`,
      baseHref: isAlias ? fallback.baseHref : access.href || fallback.baseHref,
      access,
    };
  }

  return {
    key: access.key as any,
    title: access.label,
    description: `Scoped workspace for ${access.scope_label}.`,
    service: access.service,
    baseHref: access.href,
    icon: Settings,
    accentClassName: "text-slate-700 bg-slate-50 border-slate-200",
    requiredScopes: access.permissions,
    access,
  };
}

function directoryItemsFromAccess(accessRecords: PortalAccess[]) {
  const byKey = new Map<string, PortalDirectoryItem>();
  for (const access of accessRecords) {
    const canonicalKey = portalAliases.get(access.key) ?? access.key;
    if (!canonicalPortalKeys.has(canonicalKey)) continue;
    if (!byKey.has(canonicalKey)) {
      byKey.set(canonicalKey, directoryItemFromAccess(access));
    }
  }
  return [...byKey.values()];
}

export default function SelectServicePage() {
  const router = useRouter();
  const { user, switchService } = useAuth();
  const portalAccessQuery = usePortalAccess();

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

  const backendPortals = portalAccessQuery.data?.data.portals;
  const visiblePortals = backendPortals?.length
    ? directoryItemsFromAccess(backendPortals)
    : portalItems.filter(canAccess);

  const handleSelect = (service: Service, href: string) => {
    switchService(service);
    router.push(href);
  };

  return (
    <div className="min-h-screen bg-muted/40 p-4 sm:p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
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
              const badgeLabel =
                portal.access?.scope_type && portal.access.scope_type !== "global"
                  ? portal.access.scope_label
                  : role
                    ? formatRoleName(role)
                    : "Scoped Access";

              return (
              <Card key={`${portal.baseHref}:${portal.access?.scope_type ?? "derived"}:${portal.access?.scope_id ?? "global"}`} className="flex h-full flex-col">
                <CardHeader className="flex flex-row items-start gap-4">
                  <div className={cn("rounded-lg border p-3 [&_svg]:size-6", portal.accentClassName)}>
                    <Icon />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg">{portal.title}</CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">
                      {portal.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="mt-auto flex items-center justify-between gap-3">
                  <Badge variant="outline">{badgeLabel}</Badge>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleSelect(portal.service, portal.baseHref)}
                  >
                    Open
                    <ArrowRight data-icon="inline-end" />
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
