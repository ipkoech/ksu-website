"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ApiClientError,
  socialPostsApi,
  socialQueryKeys,
  SOCIAL_PLATFORM_LIMITS,
  type SocialMediaPost,
  type SocialPlatform,
} from "@ksu/api-client";
import { toast } from "@ksu/ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Button,
  Card,
  CardContent,
  Skeleton,
} from "@ksu/ui/components";
import { cn } from "@ksu/ui/lib/utils";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  FileEdit,
  Inbox,
  PenSquare,
  RefreshCw,
  Send,
  Share2,
  Trash2,
} from "lucide-react";
import {
  PortalEmptyState,
  PortalMetricGrid,
  PortalWorkspace,
  PortalWorkspaceHeader,
  type PortalMetric,
} from "@/components/portals/portal-workspace";
import { SocialComposerSheet } from "./social-composer-sheet";

const STATUS_LANES = [
  {
    value: "draft",
    label: "Drafts",
    icon: FileEdit,
    tone: "warning" as const,
    bar: "bg-amber-500",
  },
  {
    value: "scheduled",
    label: "Scheduled",
    icon: CalendarClock,
    tone: "info" as const,
    bar: "bg-sky-500",
  },
  {
    value: "published",
    label: "Published",
    icon: CheckCircle2,
    tone: "success" as const,
    bar: "bg-emerald-500",
  },
  {
    value: "failed",
    label: "Failed",
    icon: AlertCircle,
    tone: "danger" as const,
    bar: "bg-destructive",
  },
] as const;

type LaneValue = (typeof STATUS_LANES)[number]["value"];

function platformLabel(platform: string): string {
  const rules = SOCIAL_PLATFORM_LIMITS[platform as SocialPlatform];
  return rules?.label ?? platform;
}

function deliveryToneClass(status: string): string {
  switch (status) {
    case "posted":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
    case "failed":
      return "bg-destructive/10 text-destructive";
    case "scheduled":
      return "bg-sky-500/10 text-sky-700 dark:text-sky-400";
    case "validated":
      return "bg-violet-500/10 text-violet-700 dark:text-violet-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function formatWhen(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function PostCard({
  post,
  onEdit,
  onDelete,
}: {
  post: SocialMediaPost;
  onEdit: (post: SocialMediaPost) => void;
  onDelete: (post: SocialMediaPost) => void;
}) {
  const queryClient = useQueryClient();
  const publishMutation = useMutation({
    mutationFn: () => socialPostsApi.publish(post.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: socialQueryKeys.all });
      toast.success("Post queued for publishing");
    },
    onError: (error) =>
      toast.error(
        error instanceof ApiClientError ? error.message : "Publish failed",
      ),
  });

  const scheduled = formatWhen(post.scheduled_at);
  const posted = formatWhen(post.posted_at);
  const deliveries = post.deliveries ?? [];
  const canPublish = post.status === "draft" || post.status === "failed";
  const isFailed = post.status === "failed";

  return (
    <Card className="shadow-sm">
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            {post.title ? (
              <p className="truncate text-sm font-semibold">{post.title}</p>
            ) : null}
            <p className="line-clamp-3 whitespace-pre-line text-sm text-muted-foreground">
              {post.content}
            </p>
          </div>
          <Badge
            variant={
              post.status === "published"
                ? "default"
                : isFailed
                  ? "destructive"
                  : "secondary"
            }
            className="shrink-0 capitalize"
          >
            {String(post.status).replace(/_/g, " ")}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(post.platforms ?? []).map((platform) => {
            const delivery = deliveries.find(
              (item) => item.platform === platform,
            );
            return (
              <span
                key={String(platform)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                  deliveryToneClass(delivery?.status ?? "draft"),
                )}
                title={delivery?.error_message ?? undefined}
              >
                {platformLabel(String(platform))}
                <span className="opacity-75">
                  · {delivery?.status ?? "draft"}
                </span>
              </span>
            );
          })}
        </div>

        {(scheduled || posted || post.media_ids?.length) && (
          <p className="text-xs text-muted-foreground">
            {posted
              ? `Posted ${posted}`
              : scheduled
                ? `Scheduled for ${scheduled}`
                : null}
            {post.media_ids?.length
              ? `${posted || scheduled ? " · " : ""}${post.media_ids.length} media item(s)`
              : null}
          </p>
        )}

        {isFailed && post.error_message ? (
          <p
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive"
          >
            {post.error_message}
          </p>
        ) : null}

        <div className="flex flex-wrap justify-end gap-2 border-t pt-3">
          {post.status !== "published" ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(post)}
              aria-label="Edit post"
            >
              <PenSquare data-icon="inline-start" className="size-4" />
              Edit
            </Button>
          ) : null}
          {canPublish ? (
            <Button
              size="sm"
              variant={isFailed ? "secondary" : "default"}
              disabled={publishMutation.isPending}
              onClick={() => publishMutation.mutate()}
            >
              {isFailed ? (
                <RefreshCw data-icon="inline-start" className="size-4" />
              ) : (
                <Send data-icon="inline-start" className="size-4" />
              )}
              {isFailed ? "Retry publish" : "Publish now"}
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(post)}
            aria-label="Delete post"
          >
            <Trash2 data-icon="inline-start" className="size-4" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function SocialPostsWorkspace() {
  const queryClient = useQueryClient();
  const [lane, setLane] = React.useState<LaneValue | null>(null);
  const [composerOpen, setComposerOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SocialMediaPost | null>(null);
  const [deleting, setDeleting] = React.useState<SocialMediaPost | null>(null);

  const postsQuery = useQuery({
    queryKey: socialQueryKeys.list({ per_page: 100 }),
    queryFn: async () =>
      (await socialPostsApi.list({ per_page: 100 })).data ?? [],
    staleTime: 15_000,
  });
  const posts = postsQuery.data ?? [];
  const isLoading = postsQuery.isLoading;

  const laneCount = (value: LaneValue) =>
    posts.filter((post) => post.status === value).length;

  const visible = lane
    ? posts.filter((post) => post.status === lane)
    : posts;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => socialPostsApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: socialQueryKeys.all });
      toast.success("Post deleted");
      setDeleting(null);
    },
    onError: (error) =>
      toast.error(
        error instanceof ApiClientError ? error.message : "Delete failed",
      ),
  });

  const metrics: PortalMetric[] = [
    {
      label: "Total posts",
      value: isLoading ? <Skeleton className="h-7 w-10" /> : posts.length,
      detail: "Across all platforms",
      icon: Share2,
    },
    {
      label: "Scheduled",
      value: isLoading ? <Skeleton className="h-7 w-8" /> : laneCount("scheduled"),
      detail: "Waiting to go out",
      icon: CalendarClock,
      tone: "info",
    },
    {
      label: "Published",
      value: isLoading ? <Skeleton className="h-7 w-8" /> : laneCount("published"),
      detail: "Live on platforms",
      icon: CheckCircle2,
      tone: "success",
    },
    {
      label: "Failed",
      value: isLoading ? <Skeleton className="h-7 w-8" /> : laneCount("failed"),
      detail: "Needs attention",
      icon: AlertCircle,
      tone: "danger",
    },
  ];

  return (
    <PortalWorkspace>
      <PortalWorkspaceHeader
        eyebrow="Social Media"
        title="Posts & Scheduling"
        description="Compose once and deliver to X, Facebook, Instagram, and LinkedIn — draft, schedule, and track per-platform delivery."
        icon={Share2}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setComposerOpen(true);
            }}
          >
            <PenSquare data-icon="inline-start" className="size-4" />
            New post
          </Button>
        }
      />

      <PortalMetricGrid items={metrics} />

      <section aria-label="Post status lanes" className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Status lanes
        </p>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {STATUS_LANES.map((item) => {
            const LaneIcon = item.icon;
            const count = laneCount(item.value);
            const isActive = lane === item.value;
            return (
              <button
                key={item.value}
                type="button"
                aria-pressed={isActive}
                aria-label={`Filter by ${item.label}, ${isLoading ? "loading" : `${count} posts`}`}
                onClick={() => setLane(isActive ? null : item.value)}
                className={cn(
                  "group relative cursor-pointer rounded-xl border bg-background p-4 text-left shadow-sm transition-all duration-200",
                  "hover:border-primary/40 hover:shadow-md",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isActive && "border-primary/50 ring-2 ring-ring ring-offset-2",
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={cn("rounded-lg p-1.5", {
                      "bg-amber-500/10 text-amber-700 dark:text-amber-400":
                        item.tone === "warning",
                      "bg-sky-500/10 text-sky-700 dark:text-sky-400":
                        item.tone === "info",
                      "bg-destructive/10 text-destructive":
                        item.tone === "danger",
                      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400":
                        item.tone === "success",
                    })}
                  >
                    <LaneIcon className="size-4" />
                  </span>
                  <span className={cn("h-1 w-6 rounded-full", item.bar)} />
                </span>
                <span className="mt-3 block text-2xl font-semibold tracking-tight">
                  {isLoading ? <Skeleton className="h-7 w-8" /> : count}
                </span>
                <span className="block truncate text-sm font-medium">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-label="Social posts" className="space-y-3">
        {isLoading ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <PortalEmptyState
            icon={Inbox}
            title={lane ? `No ${lane} posts` : "No social posts yet"}
            description={
              lane
                ? "Nothing in this lane right now."
                : "Compose your first post, or share published newsroom content straight to social."
            }
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(null);
                  setComposerOpen(true);
                }}
              >
                <PenSquare data-icon="inline-start" className="size-4" />
                Compose post
              </Button>
            }
          />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {visible.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onEdit={(item) => {
                  setEditing(item);
                  setComposerOpen(true);
                }}
                onDelete={setDeleting}
              />
            ))}
          </div>
        )}
      </section>

      <SocialComposerSheet
        open={composerOpen}
        onOpenChange={(open) => {
          setComposerOpen(open);
          if (!open) setEditing(null);
        }}
        post={editing}
      />

      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this social post?</AlertDialogTitle>
            <AlertDialogDescription>
              The post is removed from the queue. Delivery history is retained
              for auditing, but scheduled publishing stops.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleting && deleteMutation.mutate(deleting.id)}
            >
              Delete post
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PortalWorkspace>
  );
}
