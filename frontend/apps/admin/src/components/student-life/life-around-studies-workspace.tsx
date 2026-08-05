/**
 * Life Around Studies Workspace
 *
 * GUARD-RAIL POLICY
 * -----------------
 * What is guarded (frontend):
 *   1. Dirty-state protection: beforeunload + click intercept warns before discarding edits
 *   2. Destructive confirm: removal requires an explicit dialog naming the tile; the disable is
 *      applied via the batch save's remove_ids in the same transaction as the other edits
 *   3. Save failures: the batch endpoint is all-or-nothing; a 422 response carries
 *      detail.invalid_ids which we map back to the offending tiles (failedIndices)
 *
 * Backend support (implemented):
 *   - Transactional batch save: sectionItemsApi.batchSave PUTs
 *     /page-sections/{id}/items/batch — updates entries with ids, creates entries without,
 *     soft-disables remove_ids, all in one DB transaction (nothing is applied on any failure)
 *   - Per-item workflow: SectionItem.status (draft | in_review | published | archived) is
 *     enforced server-side. Setting published/archived requires publish authority
 *     (life_around_studies.publish / homepage.manage / page_sections.publish / admin:*);
 *     in_review requires manage or life_around_studies.review. Only "published" items appear
 *     in public composition. Published tiles are locked in this UI behind an explicit
 *     "Unlock to edit" acknowledgment that flips them to draft on the next save.
 */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  Eye,
  FileEdit,
  Film,
  Lock,
  Plus,
  RefreshCw,
  Save,
  Send,
  Sparkles,
  Trash2,
  Undo2,
} from "lucide-react";
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
  CardHeader,
  CardTitle,
  Input,
  Skeleton,
  Textarea,
} from "@ksu/ui/components";
import { cn } from "@ksu/ui/lib/utils";
import { usePermissions } from "@ksu/auth";
import { PageTransition } from "@/lib/animations";
import {
  LIFE_AROUND_STUDIES_AUDIENCES,
  LIFE_AROUND_STUDIES_SOURCE_TYPES,
  SECTION_ITEM_STATUSES,
  pageSectionsApi,
  sectionItemsApi,
  type LifeAroundStudiesAudience,
  type LifeAroundStudiesSourceType,
  type SectionItem,
  type SectionItemBatchEntry,
  type SectionItemPayload,
  type SectionItemStatus,
} from "@/lib/api/page-cms";
import {
  PortalMetricGrid,
  PortalWorkspace,
  PortalWorkspaceHeader,
  type PortalMetric,
} from "@/components/portals/portal-workspace";

type Draft = SectionItemPayload & { id?: string; unlocked?: boolean };

type BatchErrorDetail = {
  message?: string;
  invalid_ids?: string[];
};

const audienceLabels: Record<LifeAroundStudiesAudience, string> = {
  all: "Everyone",
  prospective: "Prospective students",
  current_student: "Current students",
  visitor_partner: "Visitors and partners",
};

const statusLabels: Record<SectionItemStatus, string> = {
  draft: "Draft",
  in_review: "In review",
  published: "Published",
  archived: "Archived",
};

const statusBadgeVariants: Record<SectionItemStatus, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "secondary",
  in_review: "outline",
  published: "default",
  archived: "destructive",
};

function draftFromItem(item?: SectionItem): Draft {
  return {
    id: item?.id,
    // Existing rows default to published (matches the DB default); new tiles start as drafts.
    status: item ? (item.status ?? "published") : "draft",
    unlocked: false,
    item_type: item?.item_type ?? "text",
    title: item?.title ?? "",
    subtitle: item?.subtitle ?? "",
    body_text: item?.body_text ?? "",
    cta_label: item?.cta_label ?? "",
    cta_url: item?.cta_url ?? "",
    video_provider: item?.video_provider ?? "youtube",
    video_url: item?.video_url ?? "",
    poster_media_id: item?.poster_media_id ?? "",
    transcript: item?.transcript ?? "",
    audience: item?.audience ?? "all",
    source_type: item?.source_type ?? "manual",
    source_id: item?.source_id ?? "",
    is_featured: item?.is_featured ?? false,
    display_order: item?.display_order ?? 0,
    is_enabled: item?.is_enabled ?? true,
  };
}

function draftsEqual(a: Draft, b: Draft): boolean {
  const keys: (keyof Draft)[] = [
    "title",
    "subtitle",
    "body_text",
    "cta_label",
    "cta_url",
    "video_url",
    "poster_media_id",
    "transcript",
    "audience",
    "source_type",
    "source_id",
    "is_featured",
    "display_order",
    "is_enabled",
    "status",
  ];
  return keys.every((key) => (a[key] ?? "") === (b[key] ?? ""));
}

type StatusLane = "all" | SectionItemStatus;

const STATUS_LANES: { value: StatusLane; label: string; color: string }[] = [
  { value: "all", label: "All", color: "bg-muted-foreground" },
  { value: "draft", label: "Draft", color: "bg-amber-500" },
  { value: "in_review", label: "In review", color: "bg-sky-500" },
  { value: "published", label: "Published", color: "bg-emerald-500" },
  { value: "archived", label: "Archived", color: "bg-zinc-500" },
];

export function LifeAroundStudiesWorkspace() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { hasAnyScope } = usePermissions();

  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [baselineDrafts, setBaselineDrafts] = useState<Draft[]>([]);
  const [failedIndices, setFailedIndices] = useState<Set<number>>(new Set());
  const [removeTarget, setRemoveTarget] = useState<{ index: number; title: string } | null>(null);
  const [reviewAction, setReviewAction] = useState<{ index: number; action: "approve" | "return" } | null>(null);

  // URL-synced lane filter
  const activeLane = (searchParams.get("lane") as StatusLane) || "all";
  const setActiveLane = (lane: StatusLane) => {
    const params = new URLSearchParams(searchParams.toString());
    if (lane === "all") {
      params.delete("lane");
    } else {
      params.set("lane", lane);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const canManage = hasAnyScope([
    "life_around_studies.manage",
    "homepage.manage",
    "section_items.manage",
    "admin:*",
  ]);
  const canReview = hasAnyScope([
    "life_around_studies.review",
    "page_sections.review",
    "content.review",
    "admin:*",
  ]);
  const canPublish = hasAnyScope([
    "life_around_studies.publish",
    "homepage.publish",
    "page_sections.publish",
    "content.publish",
    "admin:*",
  ]);
  // Per-item status authority (mirrors backend gating on the batch endpoint).
  const canSetItemPublished = hasAnyScope([
    "life_around_studies.publish",
    "homepage.manage",
    "admin:*",
  ]);
  const canSetItemReview = canManage || hasAnyScope(["life_around_studies.review", "admin:*"]);

  // Query: load section + items
  const sectionQuery = useQuery({
    queryKey: ["page-cms", "life-around-studies"],
    queryFn: async () => {
      const response = await pageSectionsApi.listAdmin({
        page: 1,
        per_page: 100,
        page_key: "homepage",
        scope_type: "university",
      });
      return (response.data ?? []).find((s) => s.section_key === "campus-life") ?? null;
    },
  });

  const section = sectionQuery.data ?? null;
  const originalItemIds = useMemo(
    () => (section?.items ?? []).map((item) => item.id),
    [section],
  );

  // Sync drafts when section loads
  useEffect(() => {
    if (section) {
      const loaded = (section.items ?? []).map(draftFromItem);
      setDrafts(loaded);
      setBaselineDrafts(loaded);
      setFailedIndices(new Set());
    }
  }, [section]);

  // Dirty state detection
  const isDirty = useMemo(() => {
    if (drafts.length !== baselineDrafts.length) return true;
    return drafts.some((draft, i) => !draftsEqual(draft, baselineDrafts[i]));
  }, [drafts, baselineDrafts]);

  // Dirty-state guard: beforeunload + click intercept
  useEffect(() => {
    if (!isDirty) return;

    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    const interceptNavigation = (event: MouseEvent) => {
      const anchor = (event.target as Element).closest("a");
      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.href === window.location.href
      )
        return;
      if (
        !window.confirm(
          "You have unsaved Life Around Studies changes. Leave without saving?",
        )
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", interceptNavigation, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", interceptNavigation, true);
    };
  }, [isDirty]);

  const updateDraft = (index: number, values: Partial<Draft>) => {
    setDrafts((current) =>
      current.map((draft, i) => (i === index ? { ...draft, ...values } : draft)),
    );
  };

  const addDraft = () => setDrafts((current) => [...current, draftFromItem()]);

  const confirmRemove = (index: number) => {
    const draft = drafts[index];
    setRemoveTarget({ index, title: draft.title || `Item ${index + 1}` });
  };

  const executeRemove = () => {
    if (!removeTarget) return;
    setDrafts((current) => current.filter((_, i) => i !== removeTarget.index));
    setRemoveTarget(null);
  };

  // Transactional batch save: one request, all-or-nothing on the server.
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!section) throw new Error("Section not found");

      const entries: SectionItemBatchEntry[] = drafts.map((draft, index) => ({
        id: draft.id,
        item_type: draft.item_type,
        display_order: draft.display_order ?? index,
        title: draft.title || null,
        subtitle: draft.subtitle || null,
        body_text: draft.body_text || null,
        cta_label: draft.cta_label || null,
        cta_url: draft.cta_url || null,
        video_provider: draft.video_provider || null,
        video_url: draft.video_url || null,
        poster_media_id: draft.poster_media_id || null,
        transcript: draft.transcript || null,
        audience: draft.audience,
        source_type: draft.source_type,
        source_id: draft.source_id || null,
        is_featured: draft.is_featured,
        is_enabled: draft.is_enabled,
        status: draft.status,
      }));
      const retainedIds = new Set(drafts.flatMap((d) => (d.id ? [d.id] : [])));
      const removeIds = originalItemIds.filter((id) => !retainedIds.has(id));

      return sectionItemsApi.batchSave(section.id, {
        items: entries,
        remove_ids: removeIds,
      });
    },
    onSuccess: async () => {
      toast.success("Life Around Studies content saved.");
      setFailedIndices(new Set());
      await queryClient.invalidateQueries({ queryKey: ["page-cms", "life-around-studies"] });
    },
    onError: (error) => {
      // The batch is transactional: nothing was applied. Map 422 invalid ids
      // (items that no longer belong to this section) back to their tiles.
      const response = (
        error as {
          response?: {
            status?: number;
            data?: { detail?: BatchErrorDetail | string; error?: { message?: string } };
          };
        }
      ).response;
      const detail = response?.data?.detail;
      if (
        response?.status === 422 &&
        detail &&
        typeof detail === "object" &&
        Array.isArray(detail.invalid_ids)
      ) {
        const invalidIds = new Set(detail.invalid_ids);
        setFailedIndices(
          new Set(
            drafts.flatMap((draft, index) => (draft.id && invalidIds.has(draft.id) ? [index] : [])),
          ),
        );
        toast.error(
          detail.message ??
            "Some items no longer belong to this section. Nothing was saved — refresh and try again.",
        );
        return;
      }
      toast.error("Save failed. No changes were applied.");
    },
  });

  const retryFailed = () => saveMutation.mutate();

  // Workflow mutation
  const workflowMutation = useMutation({
    mutationFn: async (
      action: "submit" | "approve" | "request_changes" | "publish" | "unpublish" | "archive",
    ) => {
      if (!section) throw new Error("Section not found");
      return pageSectionsApi.workflow(section.id, action);
    },
    onSuccess: async (_, action) => {
      toast.success(`Section ${action.replace(/_/g, " ")} complete.`);
      await queryClient.invalidateQueries({ queryKey: ["page-cms", "life-around-studies"] });
    },
    onError: (_, action) => {
      toast.error(`Unable to ${action.replace(/_/g, " ")} this section.`);
    },
  });

  const runWorkflow = (
    action: "submit" | "approve" | "request_changes" | "publish" | "unpublish" | "archive",
  ) => {
    workflowMutation.mutate(action);
  };

  const enabledCount = useMemo(
    () => drafts.filter((d) => d.is_enabled).length,
    [drafts],
  );
  const featuredCount = useMemo(
    () => drafts.filter((d) => d.is_featured).length,
    [drafts],
  );

  // Status lane counts
  const laneCounts = useMemo(() => {
    const counts: Record<StatusLane, number> = {
      all: drafts.length,
      draft: 0,
      in_review: 0,
      published: 0,
      archived: 0,
    };
    for (const d of drafts) {
      const s = (d.status ?? "published") as SectionItemStatus;
      if (s in counts) counts[s] += 1;
    }
    return counts;
  }, [drafts]);

  // Filtered drafts based on active lane
  const filteredDrafts = useMemo(() => {
    if (activeLane === "all") return drafts;
    return drafts.filter((d) => (d.status ?? "published") === activeLane);
  }, [drafts, activeLane]);

  // Per-item review capability
  const canReviewItems = hasAnyScope([
    "life_around_studies.review",
    "life_around_studies.publish",
    "homepage.manage",
    "admin:*",
  ]);

  // Execute review action (approve or return to draft)
  const executeReviewAction = () => {
    if (!reviewAction) return;
    const { index, action } = reviewAction;
    const realIndex = drafts.findIndex((d) => d === filteredDrafts[index]);
    if (realIndex === -1) return;

    if (action === "approve") {
      updateDraft(realIndex, { status: "published" });
    } else {
      updateDraft(realIndex, { status: "draft" });
    }
    setReviewAction(null);
    // Note: actual save happens when user clicks "Save Life Around Studies"
    toast.info("Status changed. Save to apply.");
  };

  const workflowActions = section
    ? {
        submit: section.status === "draft" || section.status === "changes_requested",
        approve: section.status === "in_review",
        request_changes: section.status === "in_review",
        publish: section.status === "approved",
        unpublish: section.status === "published",
        archive: !["archived"].includes(section.status),
      }
    : {
        submit: false,
        approve: false,
        request_changes: false,
        publish: false,
        unpublish: false,
        archive: false,
      };

  const metrics: PortalMetric[] = [
    {
      label: "Draft",
      value: laneCounts.draft,
      detail: "Work in progress",
      icon: FileEdit,
      tone: "warning",
    },
    {
      label: "In Review",
      value: laneCounts.in_review,
      detail: "Awaiting approval",
      icon: Send,
      tone: "info",
    },
    {
      label: "Published",
      value: laneCounts.published,
      detail: "Live on homepage",
      icon: CheckCircle2,
      tone: "success",
    },
    {
      label: "Archived",
      value: laneCounts.archived,
      detail: "Hidden from view",
      icon: Archive,
      tone: "danger",
    },
  ];

  if (sectionQuery.isPending) {
    return (
      <PageTransition>
        <PortalWorkspace>
          <Skeleton className="h-32 rounded-xl" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </PortalWorkspace>
      </PageTransition>
    );
  }

  if (sectionQuery.error) {
    return (
      <PageTransition>
        <PortalWorkspace>
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-sm text-destructive">Unable to load the Life Around Studies section.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => sectionQuery.refetch()}
            >
              <RefreshCw className="mr-2 size-4" /> Retry
            </Button>
          </div>
        </PortalWorkspace>
      </PageTransition>
    );
  }

  if (!section) {
    return (
      <PageTransition>
        <PortalWorkspace>
          <PortalWorkspaceHeader
            eyebrow="Student Life"
            title="Life Around Studies"
            description="Curate the homepage preview and connect each story to live clubs, activities, sports, accommodation, arts, governance, or video content."
            icon={Sparkles}
          />
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No homepage campus-life section found. Seed or create the campus-life section in Page CMS first.
          </div>
        </PortalWorkspace>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <PortalWorkspace>
        <PortalWorkspaceHeader
          eyebrow="Student Life"
          title="Life Around Studies"
          description="Curate the homepage preview and connect each story to live clubs, activities, sports, accommodation, arts, governance, or video content."
          icon={Sparkles}
          badge={
            <Badge variant="outline" className="gap-1">
              {section.status.replace(/_/g, " ")}
            </Badge>
          }
          actions={
            isDirty ? (
              <Badge variant="secondary" className="animate-pulse">
                Unsaved changes
              </Badge>
            ) : null
          }
        />

        <PortalMetricGrid items={metrics} />

        {/* Status lane filter pills */}
        <section aria-label="Filter by status" className="flex flex-wrap gap-2">
          {STATUS_LANES.map((lane) => {
            const isActive = activeLane === lane.value;
            const count = laneCounts[lane.value];
            return (
              <button
                key={lane.value}
                type="button"
                onClick={() => setActiveLane(lane.value)}
                aria-pressed={isActive}
                aria-label={`Filter by ${lane.label} (${count} items)`}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background hover:border-primary/40 hover:bg-muted/50",
                )}
              >
                <span className={cn("size-2 rounded-full", lane.color)} aria-hidden="true" />
                {lane.label}
                <Badge
                  variant={isActive ? "secondary" : "outline"}
                  className={cn(
                    "ml-0.5 h-5 min-w-5 justify-center px-1.5 text-xs",
                    isActive && "bg-primary-foreground/20 text-primary-foreground",
                  )}
                >
                  {count}
                </Badge>
              </button>
            );
          })}
        </section>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle>{section.title || "Life Around Studies"}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Homepage section · {section.status.replace(/_/g, " ")}
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              {workflowActions.submit && canManage ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => runWorkflow("submit")}
                  disabled={workflowMutation.isPending}
                >
                  Submit for review
                </Button>
              ) : null}
              {workflowActions.approve && canReview ? (
                <Button
                  size="sm"
                  onClick={() => runWorkflow("approve")}
                  disabled={workflowMutation.isPending}
                >
                  <CheckCircle2 data-icon="inline-start" /> Approve
                </Button>
              ) : null}
              {workflowActions.request_changes && canReview ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => runWorkflow("request_changes")}
                  disabled={workflowMutation.isPending}
                >
                  Request changes
                </Button>
              ) : null}
              {workflowActions.publish && canPublish ? (
                <Button
                  size="sm"
                  onClick={() => runWorkflow("publish")}
                  disabled={workflowMutation.isPending}
                >
                  Publish
                </Button>
              ) : null}
              {workflowActions.unpublish && canPublish ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => runWorkflow("unpublish")}
                  disabled={workflowMutation.isPending}
                >
                  Unpublish
                </Button>
              ) : null}
              {workflowActions.archive && canManage ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => runWorkflow("archive")}
                  disabled={workflowMutation.isPending}
                >
                  Archive
                </Button>
              ) : null}
              {canManage ? (
                <Button onClick={addDraft} variant="outline">
                  <Plus data-icon="inline-start" /> Add item
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {drafts.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
                <Sparkles className="size-8 text-muted-foreground" />
                <p className="text-sm font-medium">No editorial items yet</p>
                <p className="text-xs text-muted-foreground">Add the first item to curate Life Around Studies content.</p>
              </div>
            ) : filteredDrafts.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
                {activeLane === "draft" ? <FileEdit className="size-8 text-amber-500" /> : null}
                {activeLane === "in_review" ? <Send className="size-8 text-sky-500" /> : null}
                {activeLane === "published" ? <CheckCircle2 className="size-8 text-emerald-500" /> : null}
                {activeLane === "archived" ? <Archive className="size-8 text-muted-foreground" /> : null}
                <p className="text-sm font-medium">No {statusLabels[activeLane as SectionItemStatus] || activeLane} items</p>
                <p className="text-xs text-muted-foreground">
                  {activeLane === "draft" && "Items being worked on will appear here."}
                  {activeLane === "in_review" && "Items awaiting approval will appear here."}
                  {activeLane === "published" && "Published items visible on the homepage will appear here."}
                  {activeLane === "archived" && "Archived items hidden from view will appear here."}
                </p>
                <Button variant="outline" size="sm" onClick={() => setActiveLane("all")}>
                  View all items
                </Button>
              </div>
            ) : null}
            {filteredDrafts.map((draft, filteredIndex) => {
              const realIndex = drafts.indexOf(draft);
              const itemStatus = (draft.status ?? "published") as SectionItemStatus;
              const isLocked = itemStatus === "published" && !draft.unlocked;
              const isInReview = itemStatus === "in_review";
              const showReviewActions = isInReview && canReviewItems && activeLane === "in_review";
              return (
              <article
                key={draft.id ?? `new-${realIndex}`}
                className={cn(
                  "rounded-xl border bg-muted/10 p-4 transition-colors duration-200",
                  failedIndices.has(realIndex) && "border-destructive/50 bg-destructive/5",
                  itemStatus === "draft" && "border-amber-500/20",
                  itemStatus === "in_review" && "border-sky-500/20",
                  itemStatus === "published" && "border-emerald-500/20",
                  itemStatus === "archived" && "border-muted-foreground/20 opacity-60",
                )}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className={cn(
                      "flex size-7 items-center justify-center rounded-full",
                      itemStatus === "draft" && "bg-amber-500/10 text-amber-600",
                      itemStatus === "in_review" && "bg-sky-500/10 text-sky-600",
                      itemStatus === "published" && "bg-emerald-500/10 text-emerald-600",
                      itemStatus === "archived" && "bg-muted text-muted-foreground",
                    )}>
                      {realIndex + 1}
                    </span>
                    {draft.title || "Untitled item"}
                    <Badge variant={statusBadgeVariants[itemStatus]} className="ml-1">
                      {statusLabels[itemStatus]}
                    </Badge>
                    {failedIndices.has(realIndex) ? (
                      <Badge variant="destructive" className="ml-2">
                        Save failed
                      </Badge>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Review quick actions for in_review items */}
                    {showReviewActions ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700"
                          onClick={() => setReviewAction({ index: filteredIndex, action: "approve" })}
                          aria-label={`Approve and publish "${draft.title || "Untitled item"}"`}
                        >
                          <CheckCircle2 className="mr-1.5 size-4" />
                          Approve
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => setReviewAction({ index: filteredIndex, action: "return" })}
                          aria-label={`Return "${draft.title || "Untitled item"}" to draft`}
                        >
                          <Undo2 className="mr-1.5 size-4" />
                          Return
                        </Button>
                      </>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => confirmRemove(realIndex)}
                      aria-label={`Remove "${draft.title || "Untitled item"}"`}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                {isLocked && canManage ? (
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
                    <span className="flex items-center gap-2">
                      <Lock className="size-4 shrink-0" />
                      This item is live on the homepage. Unlock it to edit — it switches to draft on
                      your next save and leaves the public page until it is published again.
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateDraft(realIndex, { unlocked: true, status: "draft" })}
                    >
                      Unlock to edit
                    </Button>
                  </div>
                ) : null}
                <fieldset disabled={isLocked} className="disabled:opacity-60">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-1.5 text-sm font-medium">
                    Title
                    <Input
                      value={draft.title ?? ""}
                      onChange={(e) => updateDraft(realIndex, { title: e.target.value })}
                      placeholder="Student clubs, sports and recreation"
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-medium">
                    Subtitle
                    <Input
                      value={draft.subtitle ?? ""}
                      onChange={(e) => updateDraft(realIndex, { subtitle: e.target.value })}
                      placeholder="A short editorial label"
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-medium md:col-span-2">
                    Description
                    <Textarea
                      rows={3}
                      value={draft.body_text ?? ""}
                      onChange={(e) => updateDraft(realIndex, { body_text: e.target.value })}
                      placeholder="What should this audience understand?"
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-medium">
                    Audience
                    <select
                      className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
                      value={draft.audience ?? "all"}
                      onChange={(e) =>
                        updateDraft(realIndex, {
                          audience: e.target.value as LifeAroundStudiesAudience,
                        })
                      }
                    >
                      {LIFE_AROUND_STUDIES_AUDIENCES.map((value) => (
                        <option key={value} value={value}>
                          {audienceLabels[value]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1.5 text-sm font-medium">
                    Status
                    <select
                      className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
                      value={itemStatus}
                      onChange={(e) =>
                        updateDraft(realIndex, { status: e.target.value as SectionItemStatus })
                      }
                    >
                      {SECTION_ITEM_STATUSES.map((value) => {
                        const allowed =
                          value === "draft" ||
                          (value === "in_review" && canSetItemReview) ||
                          ((value === "published" || value === "archived") && canSetItemPublished);
                        return (
                          <option key={value} value={value} disabled={!allowed && value !== itemStatus}>
                            {statusLabels[value]}
                          </option>
                        );
                      })}
                    </select>
                  </label>
                  <label className="space-y-1.5 text-sm font-medium">
                    Live source type
                    <select
                      className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
                      value={draft.source_type ?? "manual"}
                      onChange={(e) =>
                        updateDraft(realIndex, {
                          source_type: e.target.value as LifeAroundStudiesSourceType,
                        })
                      }
                    >
                      {LIFE_AROUND_STUDIES_SOURCE_TYPES.map((value) => (
                        <option key={value} value={value}>
                          {value.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1.5 text-sm font-medium">
                    Source record ID
                    <Input
                      value={draft.source_id ?? ""}
                      onChange={(e) => updateDraft(realIndex, { source_id: e.target.value })}
                      placeholder="UUID of a club, activity, sport, or story"
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-medium">
                    Display order
                    <Input
                      type="number"
                      value={draft.display_order ?? 0}
                      onChange={(e) =>
                        updateDraft(realIndex, { display_order: Number(e.target.value) })
                      }
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-medium">
                    CTA label
                    <Input
                      value={draft.cta_label ?? ""}
                      onChange={(e) => updateDraft(realIndex, { cta_label: e.target.value })}
                      placeholder="Explore student life"
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-medium">
                    CTA URL
                    <Input
                      value={draft.cta_url ?? ""}
                      onChange={(e) => updateDraft(realIndex, { cta_url: e.target.value })}
                      placeholder="/campus-life/clubs"
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-medium">
                    Poster media ID
                    <Input
                      value={draft.poster_media_id ?? ""}
                      onChange={(e) =>
                        updateDraft(realIndex, { poster_media_id: e.target.value })
                      }
                      placeholder="Optional media UUID"
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-medium">
                    Video URL
                    <Input
                      value={draft.video_url ?? ""}
                      onChange={(e) => updateDraft(realIndex, { video_url: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-medium md:col-span-2">
                    Video transcript
                    <Textarea
                      rows={3}
                      value={draft.transcript ?? ""}
                      onChange={(e) => updateDraft(realIndex, { transcript: e.target.value })}
                      placeholder="Accessible transcript for embedded video"
                    />
                  </label>
                </div>
                <div className="mt-4 flex flex-wrap gap-5 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(draft.is_featured)}
                      onChange={(e) => updateDraft(realIndex, { is_featured: e.target.checked })}
                    />
                    Featured on homepage
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={draft.is_enabled !== false}
                      onChange={(e) => updateDraft(realIndex, { is_enabled: e.target.checked })}
                    />
                    Visible
                  </label>
                  {draft.video_url ? (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Film className="size-4" /> Video attached
                    </span>
                  ) : null}
                </div>
                </fieldset>
              </article>
              );
            })}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          {failedIndices.size > 0 ? (
            <Button
              variant="outline"
              onClick={retryFailed}
              disabled={saveMutation.isPending}
            >
              <RefreshCw className="mr-2 size-4" />
              Retry save ({failedIndices.size} flagged)
            </Button>
          ) : null}
          {canManage ? (
            <Button
              size="lg"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              <Save data-icon="inline-start" />
              {saveMutation.isPending ? "Saving..." : "Save Life Around Studies"}
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              You have view-only access to this workspace.
            </p>
          )}
        </div>
      </PortalWorkspace>

      {/* Destructive action confirmation dialog */}
      <AlertDialog open={!!removeTarget} onOpenChange={() => setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove "{removeTarget?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will disable the item when you save. The item can be restored from the
              database if needed, but it will be removed from this workspace immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Review action confirmation dialog */}
      <AlertDialog open={!!reviewAction} onOpenChange={() => setReviewAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {reviewAction?.action === "approve"
                ? `Approve and publish "${filteredDrafts[reviewAction?.index ?? 0]?.title || "Untitled item"}"?`
                : `Return "${filteredDrafts[reviewAction?.index ?? 0]?.title || "Untitled item"}" to draft?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {reviewAction?.action === "approve"
                ? "This item will be published and visible on the homepage once you save your changes."
                : "This item will be returned to draft status for further editing. It will not be visible on the homepage until published again."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeReviewAction}
              className={
                reviewAction?.action === "approve"
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : ""
              }
            >
              {reviewAction?.action === "approve" ? (
                <>
                  <CheckCircle2 className="mr-2 size-4" />
                  Approve and publish
                </>
              ) : (
                <>
                  <Undo2 className="mr-2 size-4" />
                  Return to draft
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTransition>
  );
}
