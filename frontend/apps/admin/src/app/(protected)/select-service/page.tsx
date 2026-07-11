"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Landmark, Megaphone, Settings, Trophy, UserCheck } from "lucide-react";
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
    key: "cocms",
    title: "CoCMS",
    description: "Homepage CMS, publishing review, news, notices, events, and media management.",
    service: "main",
    baseHref: "/cocms",
    icon: Megaphone,
    accentClassName: "text-orange-700 bg-orange-50 border-orange-100",
    requiredScopes: ["content.review", "content.publish", "media.manage", "homepage.manage"],
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
    key: "student-clubs",
    title: "Student Clubs Portal",
    description: "Club-scoped events, stories, announcements, galleries, and member content.",
    service: "main",
    baseHref: "/student-clubs",
    icon: Trophy,
    accentClassName: "text-violet-700 bg-violet-50 border-violet-100",
    requiredScopes: ["clubs.view", "clubs.manage_own", "clubs.content_submit", "clubs.events_manage", "clubs.stories_manage"],
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

function directoryItemFromAccess(access: PortalAccess): PortalDirectoryItem {
  const fallback = portalFallbacks.get(access.key);
  if (fallback) {
    return {
      ...fallback,
      title: access.label || fallback.title,
      description:
        access.scope_type === "global"
          ? fallback.description
          : `${fallback.description} Current scope: ${access.scope_label}.`,
      baseHref: access.href || fallback.baseHref,
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
    ? backendPortals.map(directoryItemFromAccess)
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
