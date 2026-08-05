"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Inbox,
  Search,
  Trophy,
  Users,
} from "lucide-react";
import {
  clubsApi,
  contentWorkflowApi,
  type Club,
  type ContentWorkflowQueueItem,
  type ContentWorkflowStatus,
} from "@ksu/api-client";
import { toast } from "@ksu/ui";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Skeleton,
} from "@ksu/ui/components";
import { usePermissions } from "@/hooks/use-permissions";
import {
  PortalEmptyState,
  PortalFilterBar,
  PortalMetricGrid,
  PortalStatusBadge,
  PortalWorkspace,
  PortalWorkspaceHeader,
} from "@/components/portals/portal-workspace";
import { WorkflowActions } from "@/components/workflow/workflow-actions";

const CLUB_TYPES = [
  { label: "Academic", value: "academic" },
  { label: "Professional", value: "professional" },
  { label: "Sports", value: "sports" },
  { label: "Culture", value: "culture" },
  { label: "Faith", value: "faith" },
  { label: "Service", value: "service" },
  { label: "Other", value: "other" },
];

/** Child-content workflow states a CoCMS reviewer still has to act on. */
const ACTIONABLE_STATUSES: ContentWorkflowStatus[] = [
  "submitted",
  "in_review",
  "approved",
  "scheduled",
];

const REVIEW_SCOPES = ["content.review", "content.manage", "admin:*"];
const PUBLISH_SCOPES = ["content.publish", "content.manage", "admin:*"];
const VISIBILITY_SCOPES = ["content.publish", "clubs.admin", "admin:*"];

type ClubRecord = Record<string, unknown>;

/**
 * Wraps a club child record as a queue item so the shared WorkflowActions
 * component can drive transitions through the generic content-workflow routes.
 */
function toQueueItem(
  record: ClubRecord,
  contentType: ContentWorkflowQueueItem["content_type"],
  contentTypeLabel: string,
  clubName: string,
): ContentWorkflowQueueItem {
  const media = record.media as Record<string, unknown> | undefined;
  const status = (record.workflow_status ??
    record.status ??
    "draft") as ContentWorkflowStatus;
  return {
    id: String(record.id),
    content_type: contentType,
    content_type_label: contentTypeLabel,
    title: String(
      record.title ?? media?.title ?? media?.filename ?? "Untitled content",
    ),
    summary: (record.summary ?? record.description ?? null) as string | null,
    status,
    source_portal: "student-clubs",
    source_label: clubName,
    owner_label: clubName,
    submitted_by_label: "Club officials",
    submitted_at: (record.submitted_at ?? null) as string | null,
    reviewer_label: "CoCMS",
    scheduled_publish_at: (record.scheduled_publish_at ?? null) as
      | string
      | null,
    publication_target: clubName,
    preview_path: null,
    edit_path: "",
    workflow_action_path: `/api/v1/content-workflow/${contentType}/${record.id}/{action}`,
    preview: {
      rich_text: null,
      plain_text: (record.plain_text ?? null) as string | null,
      structured_content: null,
      related_links: [],
      seo: {},
    },
  };
}

function isActionable(record: ClubRecord): boolean {
  const status = (record.workflow_status ??
    record.status ??
    "draft") as ContentWorkflowStatus;
  return ACTIONABLE_STATUSES.includes(status);
}

export function ClubReviewWorkspace() {
  const { hasAnyPermission } = usePermissions();
  const queryClient = useQueryClient();

  const canReview = hasAnyPermission(REVIEW_SCOPES);
  const canPublish = hasAnyPermission(PUBLISH_SCOPES);
  const canManage = hasAnyPermission(["content.manage", "admin:*"]);
  const canToggleVisibility = hasAnyPermission(VISIBILITY_SCOPES);

  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [clubType, setClubType] = useState("all");
  const [activity, setActivity] = useState("all");
  const [reviewClub, setReviewClub] = useState<Club | null>(null);
  const [visibilityTarget, setVisibilityTarget] = useState<Club | null>(null);

  const clubsQuery = useQuery({
    queryKey: [
      "corporate-communication",
      "club-review",
      { search, clubType, activity },
    ],
    queryFn: () =>
      clubsApi.listReview({
        page: 1,
        per_page: 100,
        q: search || undefined,
        club_type: clubType === "all" ? undefined : clubType,
        is_active:
          activity === "all" ? undefined : activity === "active",
      }),
  });

  const queueQuery = useQuery({
    queryKey: ["corporate-communication", "club-review", "queue"],
    queryFn: () =>
      contentWorkflowApi.listQueue({ source_portal: "student-clubs" }),
    enabled: canReview || canPublish,
  });

  const clubs = clubsQuery.data?.data ?? [];
  const totalClubs = clubsQuery.data?.meta?.total ?? clubs.length;
  const publicCount = clubs.filter((club) => club.is_public).length;
  const hiddenCount = clubs.filter((club) => !club.is_public).length;
  const pendingSubmissions = (queueQuery.data?.data ?? []).filter((item) =>
    ACTIONABLE_STATUSES.includes(item.status),
  ).length;

  const visibilityMutation = useMutation({
    mutationFn: (club: Club) =>
      clubsApi.update(club.id, { is_public: !club.is_public }),
    onSuccess: (_, club) => {
      toast.success(
        club.is_public
          ? `"${club.name}" is no longer publicly listed`
          : `"${club.name}" is now publicly listed`,
      );
      setVisibilityTarget(null);
      void queryClient.invalidateQueries({
        queryKey: ["corporate-communication", "club-review"],
      });
    },
    onError: () => toast.error("The club's visibility could not be changed"),
  });

  return (
    <PortalWorkspace>
      <PortalWorkspaceHeader
        eyebrow="Corporate Communication"
        title="Student Club Submissions"
        description="Central CoCMS review of every student club: audit each club's public visibility and clear the club content awaiting workflow decisions."
        icon={Trophy}
        badge={
          pendingSubmissions > 0 ? (
            <Badge variant="secondary">{pendingSubmissions} awaiting review</Badge>
          ) : null
        }
      />

      <PortalMetricGrid
        items={[
          {
            label: "Registered clubs",
            value: clubsQuery.isLoading ? "—" : totalClubs,
            detail: "All clubs, public and hidden",
            icon: Users,
            tone: "primary",
          },
          {
            label: "Publicly listed",
            value: clubsQuery.isLoading ? "—" : publicCount,
            detail: "Visible on the university site",
            icon: Eye,
            tone: "success",
          },
          {
            label: "Hidden profiles",
            value: clubsQuery.isLoading ? "—" : hiddenCount,
            detail: "Held back from public listing",
            icon: EyeOff,
            tone: "warning",
          },
          {
            label: "Pending submissions",
            value: queueQuery.isLoading ? "—" : pendingSubmissions,
            detail: "Club content in the CoCMS queue",
            icon: Inbox,
            tone: pendingSubmissions > 0 ? "danger" : "info",
          },
        ]}
      />

      <PortalFilterBar>
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
          onSubmit={(event) => {
            event.preventDefault();
            setSearch(searchDraft.trim());
          }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Search clubs by name, mission, or objectives"
              className="pl-9"
              aria-label="Search clubs"
            />
          </div>
          <Select value={clubType} onValueChange={setClubType}>
            <SelectTrigger className="w-full sm:w-44" aria-label="Club type">
              <SelectValue placeholder="Club type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All club types</SelectItem>
              {CLUB_TYPES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={activity} onValueChange={setActivity}>
            <SelectTrigger className="w-full sm:w-40" aria-label="Club status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Active and inactive</SelectItem>
              <SelectItem value="active">Active only</SelectItem>
              <SelectItem value="inactive">Inactive only</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" variant="secondary">
            Apply
          </Button>
        </form>
      </PortalFilterBar>

      {clubsQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : clubsQuery.isError ? (
        <PortalEmptyState
          icon={Inbox}
          title="Clubs could not be loaded"
          description="The central review listing requires content.review, content.manage, or clubs.view granted at university scope."
          action={
            <Button variant="outline" onClick={() => clubsQuery.refetch()}>
              Try again
            </Button>
          }
        />
      ) : clubs.length === 0 ? (
        <PortalEmptyState
          icon={Trophy}
          title="No clubs match these filters"
          description="Adjust the search, club type, or status filter to find the club you are reviewing."
        />
      ) : (
        <div className="space-y-3">
          {clubs.map((club) => (
            <Card key={club.id} className="shadow-sm">
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium">{club.name}</p>
                    <Badge variant="outline" className="font-normal capitalize">
                      {club.club_type}
                    </Badge>
                    {club.is_public ? (
                      <Badge className="gap-1 font-normal">
                        <Eye className="size-3" /> Public
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1 font-normal">
                        <EyeOff className="size-3" /> Hidden
                      </Badge>
                    )}
                    {!club.is_active ? (
                      <Badge variant="destructive" className="font-normal">
                        Inactive
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                    {club.about || club.mission || "No club description recorded."}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {club.membership_count} members
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {canToggleVisibility ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setVisibilityTarget(club)}
                    >
                      {club.is_public ? (
                        <>
                          <EyeOff className="size-4" /> Unpublish
                        </>
                      ) : (
                        <>
                          <Eye className="size-4" /> Publish
                        </>
                      )}
                    </Button>
                  ) : null}
                  <Button size="sm" onClick={() => setReviewClub(club)}>
                    <Inbox className="size-4" /> Review submissions
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={Boolean(visibilityTarget)}
        onOpenChange={(open) =>
          !open && !visibilityMutation.isPending && setVisibilityTarget(null)
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {visibilityTarget?.is_public
                ? "Unpublish this club?"
                : "Publish this club?"}
            </DialogTitle>
            <DialogDescription>
              {visibilityTarget?.is_public
                ? `"${visibilityTarget?.name}" will be removed from the public club listing. Its officials keep portal access.`
                : `"${visibilityTarget?.name}" will appear in the public club listing immediately.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setVisibilityTarget(null)}
              disabled={visibilityMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant={visibilityTarget?.is_public ? "destructive" : "default"}
              onClick={() =>
                visibilityTarget && visibilityMutation.mutate(visibilityTarget)
              }
              disabled={visibilityMutation.isPending}
            >
              {visibilityTarget?.is_public ? "Unpublish club" : "Publish club"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet
        open={Boolean(reviewClub)}
        onOpenChange={(open) => !open && setReviewClub(null)}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          {reviewClub ? (
            <ClubPendingContent
              club={reviewClub}
              canReview={canReview}
              canPublish={canPublish}
              canManage={canManage}
            />
          ) : null}
        </SheetContent>
      </Sheet>
    </PortalWorkspace>
  );
}

function ClubPendingContent({
  club,
  canReview,
  canPublish,
  canManage,
}: {
  club: Club;
  canReview: boolean;
  canPublish: boolean;
  canManage: boolean;
}) {
  const queryClient = useQueryClient();
  const baseKey = ["corporate-communication", "club-review", "pending", club.id];

  const [activities, stories, announcements, media] = useQueries({
    queries: [
      {
        queryKey: [...baseKey, "activities"],
        queryFn: () => clubsApi.listManagedActivities(club.id),
      },
      {
        queryKey: [...baseKey, "stories"],
        queryFn: () => clubsApi.listStories(club.id),
      },
      {
        queryKey: [...baseKey, "announcements"],
        queryFn: () => clubsApi.listAnnouncements(club.id),
      },
      {
        queryKey: [...baseKey, "media"],
        queryFn: () => clubsApi.listMedia(club.id),
      },
    ],
  });

  const isLoading =
    activities.isLoading ||
    stories.isLoading ||
    announcements.isLoading ||
    media.isLoading;

  const pendingItems = useMemo(() => {
    const collect = (
      records: ClubRecord[] | undefined,
      contentType: ContentWorkflowQueueItem["content_type"],
      label: string,
    ) =>
      (records ?? [])
        .filter(isActionable)
        .map((record) => toQueueItem(record, contentType, label, club.name));
    return [
      ...collect(
        activities.data?.data as ClubRecord[] | undefined,
        "club-events",
        "Club Event",
      ),
      ...collect(
        stories.data?.data as ClubRecord[] | undefined,
        "blogs",
        "Club Story",
      ),
      ...collect(
        announcements.data?.data as ClubRecord[] | undefined,
        "announcements",
        "Club Announcement",
      ),
      ...collect(
        media.data?.data as ClubRecord[] | undefined,
        "club-media",
        "Club Media",
      ),
    ];
  }, [activities.data, stories.data, announcements.data, media.data, club.name]);

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: baseKey });
    void queryClient.invalidateQueries({
      queryKey: ["corporate-communication", "club-review", "queue"],
    });
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle>{club.name}</SheetTitle>
        <SheetDescription>
          Club events, stories, announcements, and media awaiting a CoCMS
          workflow decision.
        </SheetDescription>
      </SheetHeader>
      <div className="mt-4 space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </>
        ) : pendingItems.length === 0 ? (
          <PortalEmptyState
            icon={CheckCircle2}
            title="Nothing awaiting review"
            description="Every submission from this club has been reviewed. New submissions will appear here."
          />
        ) : (
          pendingItems.map((item) => (
            <Card key={`${item.content_type}-${item.id}`} className="shadow-sm">
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.content_type_label}
                    </p>
                  </div>
                  <PortalStatusBadge status={item.status} />
                </div>
                {item.summary ? (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {item.summary}
                  </p>
                ) : null}
                <Separator />
                <WorkflowActions
                  item={item}
                  canReview={canReview}
                  canPublish={canPublish}
                  canManage={canManage}
                  canEdit={false}
                  onCompleted={refresh}
                />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
