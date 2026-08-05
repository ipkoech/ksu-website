"use client";

import { useMemo, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  announcementsApi,
  blogsApi,
  eventsApi,
  newsApi,
  storiesApi,
} from "@ksu/api-client";
import {
  CalendarDays,
  CheckCircle2,
  CircleCheck,
  FileEdit,
  FilePenLine,
  Inbox,
  Megaphone,
  MessageSquareWarning,
  Newspaper,
  Send,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Badge, Card, CardContent, Skeleton } from "@ksu/ui/components";
import { cn } from "@ksu/ui/lib";
import { PortalResourcePage } from "@/components/portals/portal-resource-page";
import {
  PortalMetricGrid,
  PortalWorkspace,
  PortalWorkspaceHeader,
  type PortalMetric,
} from "@/components/portals/portal-workspace";
import { useCorporatePortal } from "./corporate-portal-provider";
import {
  SocialShareButton,
  type SocialShareSource,
} from "./social-share-button";

type ContentType = "news" | "press-releases" | "notices" | "events" | "stories";

interface NewsroomWorkspaceProps {
  contentType: ContentType;
  /** Extra tab content (e.g. ContributorRequestsPanel for stories). */
  children?: ReactNode;
}

const CONTENT_CONFIG: Record<
  ContentType,
  {
    title: string;
    description: string;
    icon: LucideIcon;
    resourceKey: string;
    singularLabel: string;
    listFn: (filters: Record<string, unknown>) => Promise<{ data?: unknown[]; meta?: Record<string, unknown> }>;
    /** "Share to social" wiring: source_type + public site path prefix. */
    share: { sourceType: string; publicPathPrefix: string };
  }
> = {
  news: {
    title: "News",
    description: "Create and publish university news updates, track editorial progress, and manage the newsroom pipeline.",
    icon: Newspaper,
    resourceKey: "news",
    singularLabel: "news article",
    listFn: (filters) => newsApi.listAdmin({ is_main: true, per_page: 100, fields: "id,workflow_status,status", ...filters }),
    share: { sourceType: "news", publicPathPrefix: "/news" },
  },
  "press-releases": {
    title: "Press Releases",
    description: "Draft press releases and long-form media posts, then route them through editorial review before publication.",
    icon: Megaphone,
    resourceKey: "press-releases",
    singularLabel: "press release",
    listFn: (filters) => blogsApi.listAdmin({ is_main: true, per_page: 100, fields: "id,workflow_status,status", ...filters }),
    share: { sourceType: "blog", publicPathPrefix: "/blogs" },
  },
  notices: {
    title: "Public Notices",
    description: "Manage university-wide notices and announcements with workflow tracking from draft to publication.",
    icon: Megaphone,
    resourceKey: "notices",
    singularLabel: "notice",
    listFn: (filters) => announcementsApi.listAdmin({ is_main: true, per_page: 100, fields: "id,workflow_status,status", ...filters }),
    share: { sourceType: "announcement", publicPathPrefix: "/announcements" },
  },
  events: {
    title: "Events Calendar",
    description: "Schedule public university events and manage their visibility through the editorial pipeline.",
    icon: CalendarDays,
    resourceKey: "events",
    singularLabel: "event",
    listFn: (filters) => eventsApi.listAdmin({ is_main: true, per_page: 100, fields: "id,workflow_status,status", ...filters }),
    share: { sourceType: "event", publicPathPrefix: "/events" },
  },
  stories: {
    title: "Stories",
    description: "Curate public stories and reviewed community submissions, guiding each piece from draft to published.",
    icon: Sparkles,
    resourceKey: "stories",
    singularLabel: "story",
    listFn: (filters) => storiesApi.listAdmin({ is_main: true, per_page: 100, fields: "id,workflow_status,status", ...filters }),
    share: { sourceType: "story", publicPathPrefix: "/stories" },
  },
};

const PIPELINE_LANES = [
  {
    value: "draft",
    label: "Draft",
    icon: FileEdit,
    color: "bg-amber-500",
    tone: "warning" as const,
    emptyTitle: "No drafts in progress",
    emptyDescription: "Start a new piece to see it appear here.",
  },
  {
    value: "submitted",
    label: "Submitted",
    icon: Send,
    color: "bg-sky-500",
    tone: "info" as const,
    emptyTitle: "No submissions awaiting review",
    emptyDescription: "Content moves here when authors submit for approval.",
  },
  {
    value: "changes_requested",
    label: "Changes requested",
    icon: MessageSquareWarning,
    color: "bg-destructive",
    tone: "danger" as const,
    emptyTitle: "No revisions pending",
    emptyDescription: "Content needing author attention appears here.",
  },
  {
    value: "published",
    label: "Published",
    icon: CheckCircle2,
    color: "bg-emerald-500",
    tone: "success" as const,
    emptyTitle: "Nothing published yet",
    emptyDescription: "Approved content goes live and appears here.",
  },
] as const;

type WorkflowStatus = (typeof PIPELINE_LANES)[number]["value"];

export function NewsroomWorkspace({ contentType, children }: NewsroomWorkspaceProps) {
  const config = CONTENT_CONFIG[contentType];
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { can } = useCorporatePortal();
  const lane = params.get("lane") as WorkflowStatus | null;

  // "Share to social" pulls the latest published records with the fields the
  // composer prefill needs (plain-text summary + slug for the public URL).
  const shareSource = useMemo<SocialShareSource>(
    () => ({
      sourceType: config.share.sourceType,
      contentLabel: config.singularLabel,
      publicPathPrefix: config.share.publicPathPrefix,
      fetchPublished: async () => {
        const response = await config.listFn({
          workflow_status: "published",
          per_page: 10,
          fields: "id,title,slug,summary",
        });
        return (response.data ?? []) as Array<Record<string, unknown>>;
      },
    }),
    [config],
  );

  // Lightweight count query: sparse fieldset, capped at the backend's
  // per_page maximum (100) — counts beyond that read "100+".
  const countsQuery = useQuery({
    queryKey: ["newsroom", contentType, "counts"],
    queryFn: async () => {
      const response = await config.listFn({});
      return response.data ?? [];
    },
    staleTime: 30_000,
  });

  const records = countsQuery.data ?? [];
  const isLoading = countsQuery.isLoading;

  const counts = useMemo(() => {
    const getStatus = (record: Record<string, unknown>) =>
      String(record.workflow_status ?? record.status ?? "draft");

    return {
      total: records.length,
      draft: records.filter((r) => getStatus(r as Record<string, unknown>) === "draft").length,
      inWorkflow: records.filter((r) => {
        const status = getStatus(r as Record<string, unknown>);
        return ["submitted", "in_review", "changes_requested", "approved"].includes(status);
      }).length,
      published: records.filter((r) => getStatus(r as Record<string, unknown>) === "published").length,
      submitted: records.filter((r) => getStatus(r as Record<string, unknown>) === "submitted").length,
      changesRequested: records.filter((r) => getStatus(r as Record<string, unknown>) === "changes_requested").length,
    };
  }, [records]);

  const metrics: PortalMetric[] = [
    {
      label: `Total ${config.title}`,
      value: isLoading ? <Skeleton className="h-7 w-12" /> : counts.total,
      detail: "In this collection",
      icon: config.icon,
    },
    {
      label: "Drafts",
      value: isLoading ? <Skeleton className="h-7 w-8" /> : counts.draft,
      detail: "Work in progress",
      icon: FilePenLine,
      tone: "warning",
    },
    {
      label: "In workflow",
      value: isLoading ? <Skeleton className="h-7 w-8" /> : counts.inWorkflow,
      detail: "Awaiting action",
      icon: Send,
      tone: "info",
    },
    {
      label: "Published",
      value: isLoading ? <Skeleton className="h-7 w-8" /> : counts.published,
      detail: "Visible to audiences",
      icon: CircleCheck,
      tone: "success",
    },
  ];

  const updateLane = (newLane: WorkflowStatus | null) => {
    const next = new URLSearchParams(params);
    if (newLane) {
      next.set("lane", newLane);
    } else {
      next.delete("lane");
    }
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const getLaneCount = (status: WorkflowStatus) => {
    if (status === "draft") return counts.draft;
    if (status === "submitted") return counts.submitted;
    if (status === "changes_requested") return counts.changesRequested;
    if (status === "published") return counts.published;
    return 0;
  };

  // Map lane to the workflow_status filter value for the resource page
  const initialFilters = useMemo(() => {
    if (!lane) return undefined;
    return { workflow_status: lane };
  }, [lane]);

  const activeLaneConfig = lane ? PIPELINE_LANES.find((l) => l.value === lane) : null;
  const Icon = config.icon;

  return (
    <PortalWorkspace>
      <PortalWorkspaceHeader
        eyebrow="Newsroom"
        title={config.title}
        description={config.description}
        icon={Icon}
        actions={
          can("marketing.manage_social") ? (
            <SocialShareButton source={shareSource} />
          ) : undefined
        }
        badge={
          lane && activeLaneConfig ? (
            <Badge variant="secondary" className="gap-1.5 font-normal">
              <activeLaneConfig.icon className="size-3" />
              Viewing {activeLaneConfig.label.toLowerCase()}
            </Badge>
          ) : null
        }
      />

      <PortalMetricGrid items={metrics} />

      <section aria-label="Editorial pipeline" className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Pipeline stages
        </p>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {PIPELINE_LANES.map((item) => {
            const LaneIcon = item.icon;
            const count = getLaneCount(item.value);
            const isActive = lane === item.value;

            return (
              <button
                key={item.value}
                type="button"
                aria-label={`Filter by ${item.label} status, ${isLoading ? "loading" : `${count} items`}`}
                aria-pressed={isActive}
                className={cn(
                  "group relative cursor-pointer rounded-xl border bg-background p-4 text-left shadow-sm transition-all duration-200",
                  "hover:border-primary/40 hover:shadow-md",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isActive && "ring-2 ring-ring ring-offset-2 border-primary/50"
                )}
                onClick={() => updateLane(isActive ? null : item.value)}
              >
                <span className="flex items-center gap-2">
                  <span className={cn("rounded-lg p-1.5", {
                    "bg-amber-500/10 text-amber-700 dark:text-amber-400": item.tone === "warning",
                    "bg-sky-500/10 text-sky-700 dark:text-sky-400": item.tone === "info",
                    "bg-destructive/10 text-destructive": item.tone === "danger",
                    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400": item.tone === "success",
                  })}>
                    <LaneIcon className="size-4" />
                  </span>
                  <span className={cn("h-1 w-6 rounded-full", item.color)} />
                </span>
                <span className="mt-3 block text-2xl font-semibold tracking-tight">
                  {isLoading ? <Skeleton className="h-7 w-8" /> : count}
                </span>
                <span className="block truncate text-sm font-medium">{item.label}</span>
                {isActive && (
                  <span className="absolute right-3 top-3">
                    <Badge variant="default" className="text-[10px] px-1.5 py-0">
                      Active
                    </Badge>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Lane-specific empty state hint when filtering */}
      {lane && activeLaneConfig && !isLoading && getLaneCount(lane) === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <span className="mb-3 rounded-full bg-muted p-3 text-muted-foreground">
              <Inbox className="size-6" />
            </span>
            <p className="font-medium">{activeLaneConfig.emptyTitle}</p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {activeLaneConfig.emptyDescription}
            </p>
          </CardContent>
        </Card>
      )}

      {children}

      {/* initialFilters only seeds the resource page's filter state, so a
          lane change must remount it to take effect. */}
      <PortalResourcePage
        key={lane ?? "all"}
        portalKey="corporate-communication"
        resourceKey={config.resourceKey}
        initialFilters={initialFilters}
      />
    </PortalWorkspace>
  );
}
