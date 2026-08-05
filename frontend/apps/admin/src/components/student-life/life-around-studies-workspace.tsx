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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  Film,
  Lock,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
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

export function LifeAroundStudiesWorkspace() {
  const queryClient = useQueryClient();
  const { hasAnyScope } = usePermissions();

  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [baselineDrafts, setBaselineDrafts] = useState<Draft[]>([]);
  const [failedIndices, setFailedIndices] = useState<Set<number>>(new Set());
  const [removeTarget, setRemoveTarget] = useState<{ index: number; title: string } | null>(null);

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
      label: "Total Items",
      value: drafts.length,
      detail: "Editorial items in this section",
      icon: Sparkles,
      tone: "primary",
    },
    {
      label: "Enabled",
      value: enabledCount,
      detail: "Visible on homepage",
      icon: Eye,
      tone: "success",
    },
    {
      label: "Featured",
      value: featuredCount,
      detail: "Highlighted prominently",
      icon: Sparkles,
      tone: "info",
    },
    {
      label: "Failed Saves",
      value: failedIndices.size,
      detail: failedIndices.size > 0 ? "Retry required" : "All synced",
      icon: AlertTriangle,
      tone: failedIndices.size > 0 ? "danger" : "success",
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
              <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                Add the first editorial item.
              </p>
            ) : null}
            {drafts.map((draft, index) => {
              const itemStatus = (draft.status ?? "published") as SectionItemStatus;
              const isLocked = itemStatus === "published" && !draft.unlocked;
              return (
              <article
                key={draft.id ?? `new-${index}`}
                className={`rounded-xl border bg-muted/10 p-4 ${failedIndices.has(index) ? "border-destructive/50 bg-destructive/5" : ""}`}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {index + 1}
                    </span>
                    {draft.title || "Untitled item"}
                    <Badge variant={statusBadgeVariants[itemStatus]} className="ml-1">
                      {statusLabels[itemStatus]}
                    </Badge>
                    {failedIndices.has(index) ? (
                      <Badge variant="destructive" className="ml-2">
                        Save failed
                      </Badge>
                    ) : null}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => confirmRemove(index)}
                    aria-label="Remove item"
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
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
                      onClick={() => updateDraft(index, { unlocked: true, status: "draft" })}
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
                      onChange={(e) => updateDraft(index, { title: e.target.value })}
                      placeholder="Student clubs, sports and recreation"
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-medium">
                    Subtitle
                    <Input
                      value={draft.subtitle ?? ""}
                      onChange={(e) => updateDraft(index, { subtitle: e.target.value })}
                      placeholder="A short editorial label"
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-medium md:col-span-2">
                    Description
                    <Textarea
                      rows={3}
                      value={draft.body_text ?? ""}
                      onChange={(e) => updateDraft(index, { body_text: e.target.value })}
                      placeholder="What should this audience understand?"
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-medium">
                    Audience
                    <select
                      className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
                      value={draft.audience ?? "all"}
                      onChange={(e) =>
                        updateDraft(index, {
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
                        updateDraft(index, { status: e.target.value as SectionItemStatus })
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
                        updateDraft(index, {
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
                      onChange={(e) => updateDraft(index, { source_id: e.target.value })}
                      placeholder="UUID of a club, activity, sport, or story"
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-medium">
                    Display order
                    <Input
                      type="number"
                      value={draft.display_order ?? 0}
                      onChange={(e) =>
                        updateDraft(index, { display_order: Number(e.target.value) })
                      }
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-medium">
                    CTA label
                    <Input
                      value={draft.cta_label ?? ""}
                      onChange={(e) => updateDraft(index, { cta_label: e.target.value })}
                      placeholder="Explore student life"
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-medium">
                    CTA URL
                    <Input
                      value={draft.cta_url ?? ""}
                      onChange={(e) => updateDraft(index, { cta_url: e.target.value })}
                      placeholder="/campus-life/clubs"
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-medium">
                    Poster media ID
                    <Input
                      value={draft.poster_media_id ?? ""}
                      onChange={(e) =>
                        updateDraft(index, { poster_media_id: e.target.value })
                      }
                      placeholder="Optional media UUID"
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-medium">
                    Video URL
                    <Input
                      value={draft.video_url ?? ""}
                      onChange={(e) => updateDraft(index, { video_url: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-medium md:col-span-2">
                    Video transcript
                    <Textarea
                      rows={3}
                      value={draft.transcript ?? ""}
                      onChange={(e) => updateDraft(index, { transcript: e.target.value })}
                      placeholder="Accessible transcript for embedded video"
                    />
                  </label>
                </div>
                <div className="mt-4 flex flex-wrap gap-5 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(draft.is_featured)}
                      onChange={(e) => updateDraft(index, { is_featured: e.target.checked })}
                    />
                    Featured on homepage
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={draft.is_enabled !== false}
                      onChange={(e) => updateDraft(index, { is_enabled: e.target.checked })}
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
    </PageTransition>
  );
}
