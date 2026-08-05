"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ExternalLink,
  FileText,
  Filter,
  History,
  Search,
  SearchCheck,
  Settings2,
  Sparkles,
} from "lucide-react";
import {
  contentWorkflowApi,
  type ContentWorkflowBulkAction,
  type ContentWorkflowQueueFilters,
  type ContentWorkflowQueueItem,
} from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";
import { toast } from "@ksu/ui";
import {
  Alert,
  AlertDescription,
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
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  RichTextRenderer,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  StatusBadge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@ksu/ui/components";
import { PageHeader } from "@/components/layout";
import { DateTimePicker } from "@/components/shared/date-time-picker";
import { RecordHistory } from "./record-history";
import { WorkflowActions } from "./workflow-actions";

const statusOptions = [
  "submitted",
  "in_review",
  "changes_requested",
  "approved",
  "scheduled",
  "published",
  "unpublished",
  "rejected",
  "archived",
] as const;

const PER_PAGE = 20;

/** Content types whose workflow runs through a type-specific endpoint. */
const CUSTOM_WORKFLOW_TYPES = new Set<ContentWorkflowQueueItem["content_type"]>([
  "page-sections",
  "partnership-spotlights",
]);

const BULK_ACTION_LABELS: Record<
  "approve" | "publish" | "archive",
  { verb: string; done: string; failed: string }
> = {
  approve: { verb: "Approve", done: "Approved", failed: "approved" },
  publish: { verb: "Publish", done: "Published", failed: "published" },
  archive: { verb: "Archive", done: "Archived", failed: "archived" },
};

export function ReviewQueue() {
  const queryClient = useQueryClient();
  const { hasScope } = usePermissions();
  const [filters, setFilters] = useState<ContentWorkflowQueueFilters>({});
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checkedIds, setCheckedIds] = useState<ReadonlySet<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<
    "approve" | "publish" | "archive" | null
  >(null);
  const [bulkRunning, setBulkRunning] = useState(false);

  useEffect(() => {
    const handle = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const queueQuery = useQuery({
    queryKey: ["content-workflow", "queue", filters, search, page],
    queryFn: () =>
      contentWorkflowApi.listQueue({
        ...filters,
        ...(search ? { q: search } : {}),
        page,
        per_page: PER_PAGE,
      }),
  });
  const items = useMemo(
    () => queueQuery.data?.data ?? [],
    [queueQuery.data?.data],
  );
  const meta = queueQuery.data?.meta;
  const statusCounts = meta?.status_counts ?? {};
  const totalItems = meta?.total ?? items.length;
  const totalPages = meta?.pages ?? 1;
  const selectedItem =
    items.find((item) => item.id === selectedId) ?? items[0] ?? null;
  const canReview = hasScope("content.review") || hasScope("content.manage");
  const canPublish = hasScope("content.publish");
  const canManage = hasScope("content.manage");
  const canEdit = canManage || hasScope("content.edit_submitted");
  const canAccess = canReview || canPublish || hasScope("homepage.manage");
  const canBulk = canReview || canPublish || canManage;

  useEffect(() => {
    setPage(1);
  }, [filters, search]);

  useEffect(() => {
    setCheckedIds(new Set());
  }, [filters, search, page]);

  useEffect(() => {
    if (selectedItem && selectedItem.id !== selectedId) {
      setSelectedId(selectedItem.id);
    }
  }, [selectedId, selectedItem]);

  const checkedItems = useMemo(
    () => items.filter((item) => checkedIds.has(item.id)),
    [checkedIds, items],
  );
  const allPageChecked =
    items.length > 0 && items.every((item) => checkedIds.has(item.id));

  const toggleChecked = (itemId: string, checked: boolean) => {
    setCheckedIds((current) => {
      const next = new Set(current);
      if (checked) next.add(itemId);
      else next.delete(itemId);
      return next;
    });
  };

  const runBulkAction = async (action: "approve" | "publish" | "archive") => {
    if (checkedItems.length === 0 || bulkRunning) return;
    const labels = BULK_ACTION_LABELS[action];
    setBulkRunning(true);
    try {
      const results: Array<{ id: string; title: string; ok: boolean; error: string | null }> =
        [];
      // Page sections and partnership spotlights use type-specific workflow
      // endpoints (the generic bulk route rejects them), so run those
      // individually via each row's workflow_action_path.
      const customRows = checkedItems.filter((item) =>
        CUSTOM_WORKFLOW_TYPES.has(item.content_type),
      );
      const genericRows = checkedItems.filter(
        (item) => !CUSTOM_WORKFLOW_TYPES.has(item.content_type),
      );
      if (genericRows.length > 0) {
        const response = await contentWorkflowApi.bulk(
          action as ContentWorkflowBulkAction,
          genericRows.map((item) => ({
            content_type: item.content_type,
            content_id: item.id,
          })),
        );
        const titlesById = new Map(genericRows.map((item) => [item.id, item.title]));
        for (const result of response.data ?? []) {
          results.push({
            id: result.content_id,
            title: titlesById.get(result.content_id) ?? result.content_id,
            ok: result.ok,
            error: result.error,
          });
        }
      }
      for (const item of customRows) {
        try {
          await contentWorkflowApi.action(item, action);
          results.push({ id: item.id, title: item.title, ok: true, error: null });
        } catch (error) {
          results.push({
            id: item.id,
            title: item.title,
            ok: false,
            error: error instanceof Error ? error.message : null,
          });
        }
      }
      const failures = results.filter((result) => !result.ok);
      const okCount = results.length - failures.length;
      if (failures.length === 0) {
        toast.success(
          `${labels.done} ${okCount} item${okCount === 1 ? "" : "s"}.`,
        );
      } else {
        const detail = failures
          .map(
            (failure) =>
              `'${failure.title}' — ${failure.error ?? "not allowed right now"}`,
          )
          .join("; ");
        const couldnt =
          failures.length === 1 ? "1 couldn't" : `${failures.length} couldn't`;
        toast.error(
          `${labels.done} ${okCount} of ${results.length}. ${couldnt} be ${labels.failed}: ${detail}`,
        );
      }
      setCheckedIds(new Set());
      await queryClient.invalidateQueries({
        queryKey: ["content-workflow", "queue"],
      });
    } catch {
      toast.error(`The bulk ${action} could not be completed. Try again in a moment.`);
    } finally {
      setBulkRunning(false);
      setBulkAction(null);
    }
  };

  const sourceOptions = useMemo(
    () =>
      uniqueOptions(
        items,
        (item) => item.source_portal,
        (item) => item.source_label,
      ),
    [items],
  );
  const reviewerOptions = useMemo(
    () => [
      ...new Set(
        items
          .map((item) => item.reviewer_label)
          .filter((label) => label !== "Unassigned"),
      ),
    ],
    [items],
  );

  function setFilter<K extends keyof ContentWorkflowQueueFilters>(
    key: K,
    value: ContentWorkflowQueueFilters[K] | undefined,
  ) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function clearFilters() {
    setFilters({});
    setSearchInput("");
    setSearch("");
  }

  const hasActiveFilters = Object.keys(filters).length > 0 || search !== "";

  if (!canAccess) {
    return (
      <div>
        <PageHeader
          title="Review Queue"
          description="Editorial review and publishing workspace."
          backHref="/corporate-communication"
        />
        <div className="p-4 sm:p-6">
          <Card>
            <CardHeader>
              <CardTitle>Access required</CardTitle>
              <CardDescription>
                A content review, publishing, content management, or homepage
                management role is required.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Review Queue"
        description="Review submitted public content before approval, scheduling, or publishing."
        backHref="/corporate-communication"
      />
      <div className="space-y-5 p-4 sm:p-6">
        <section className="overflow-hidden rounded-3xl border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(248,250,252,0.86))] p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_32%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.86))] sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                <Sparkles className="size-3.5 text-orange-600" />
                Editorial workflow command centre
              </div>
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Approve, request changes, and publish with context
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                The queue reflects backend workflow state across newsroom, Page
                CMS, slider and student-club submissions.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <QueueMetric label="In queue" value={totalItems} />
              <QueueMetric
                label="Awaiting review"
                value={
                  (statusCounts.submitted ?? 0) + (statusCounts.in_review ?? 0)
                }
              />
              <QueueMetric
                label="Approved"
                value={statusCounts.approved ?? 0}
              />
            </div>
          </div>
        </section>

        <Card className="overflow-hidden border-white/70 bg-white/90 shadow-sm backdrop-blur dark:border-white/10 dark:bg-background/90">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="size-4" />
                  Queue filters
                </CardTitle>
                <CardDescription>
                  Filter by source, content state, submission and scheduling
                  dates, or reviewer.
                </CardDescription>
              </div>
              {hasActiveFilters ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="review-queue-search">Search titles</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="review-queue-search"
                  type="search"
                  className="pl-9"
                  placeholder="Search the queue by title…"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
              <FilterSelect
                label="Source portal"
                value={filters.source_portal ?? "all"}
                onValueChange={(value) =>
                  setFilter(
                    "source_portal",
                    value === "all" ? undefined : value,
                  )
                }
                options={sourceOptions}
              />
              <FilterSelect
                label="Content type"
                value={filters.content_type ?? "all"}
                onValueChange={(value) =>
                  setFilter(
                    "content_type",
                    value === "all"
                      ? undefined
                      : (value as ContentWorkflowQueueItem["content_type"]),
                  )
                }
                options={[
                  { value: "news", label: "News" },
                  { value: "blogs", label: "Press releases" },
                  { value: "stories", label: "Stories" },
                  { value: "announcements", label: "Announcements" },
                  { value: "events", label: "Events" },
                  { value: "club-events", label: "Club events" },
                  { value: "club-media", label: "Club media" },
                  { value: "page-sections", label: "Page sections" },
                  {
                    value: "partnership-spotlights",
                    label: "Partnership spotlights",
                  },
                  { value: "sliders", label: "Sliders" },
                  { value: "documents", label: "Documents" },
                  { value: "school-gallery", label: "School gallery" },
                ]}
              />
              <FilterSelect
                label="Status"
                value={filters.status ?? "all"}
                onValueChange={(value) =>
                  setFilter(
                    "status",
                    value === "all"
                      ? undefined
                      : (value as ContentWorkflowQueueItem["status"]),
                  )
                }
                options={statusOptions.map((value) => ({
                  value,
                  label: humanize(value),
                }))}
              />
              <FilterSelect
                label="Reviewer"
                value={filters.reviewer ?? "all"}
                onValueChange={(value) =>
                  setFilter("reviewer", value === "all" ? undefined : value)
                }
                options={reviewerOptions.map((value) => ({
                  value,
                  label: value,
                }))}
              />
              <DateFilter
                label="Submitted date"
                value={filters.submitted_date ?? ""}
                onChange={(value) =>
                  setFilter("submitted_date", value || undefined)
                }
              />
              <DateFilter
                label="Scheduled date"
                value={filters.scheduled_date ?? ""}
                onChange={(value) =>
                  setFilter("scheduled_date", value || undefined)
                }
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-5 xl:grid-cols-[minmax(330px,0.82fr)_minmax(0,1.18fr)]">
          <Card className="min-w-0 overflow-hidden border-white/70 bg-white/90 shadow-sm backdrop-blur dark:border-white/10 dark:bg-background/90">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <SearchCheck className="size-4" />
                Items for review
              </CardTitle>
              <CardDescription>
                {totalItems} record{totalItems === 1 ? "" : "s"} match
                {totalItems === 1 ? "es" : ""} the current filters
                {totalPages > 1
                  ? `, showing page ${meta?.page ?? page} of ${totalPages}`
                  : ""}
                .
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {canBulk && items.length > 0 ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/30 px-3 py-2">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={allPageChecked}
                      onCheckedChange={(checked) =>
                        setCheckedIds(
                          checked === true
                            ? new Set(items.map((item) => item.id))
                            : new Set(),
                        )
                      }
                      aria-label="Select all items on this page"
                    />
                    {checkedIds.size > 0
                      ? `${checkedIds.size} selected`
                      : "Select all on page"}
                  </label>
                  {checkedIds.size > 0 ? (
                    <div className="flex flex-wrap items-center gap-2">
                      {canReview ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          disabled={bulkRunning}
                          onClick={() => setBulkAction("approve")}
                        >
                          Approve
                        </Button>
                      ) : null}
                      {canPublish ? (
                        <Button
                          type="button"
                          size="sm"
                          disabled={bulkRunning}
                          onClick={() => setBulkAction("publish")}
                        >
                          Publish
                        </Button>
                      ) : null}
                      {canManage ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={bulkRunning}
                          onClick={() => setBulkAction("archive")}
                        >
                          Archive
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={bulkRunning}
                        onClick={() => setCheckedIds(new Set())}
                      >
                        Clear
                      </Button>
                    </div>
                  ) : null}
                </div>
              ) : null}
              {queueQuery.isLoading ? (
                <QueueLoading />
              ) : queueQuery.isError ? (
                <QueueMessage message="The review queue could not be loaded." />
              ) : items.length === 0 ? (
                <QueueMessage message="No content matches the current filters." />
              ) : (
                <div className="divide-y rounded-2xl border bg-background">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={
                        selectedItem?.id === item.id
                          ? "flex items-start gap-2 bg-primary/5 p-4"
                          : "flex items-start gap-2 p-4 transition-colors hover:bg-primary/5"
                      }
                    >
                      {canBulk ? (
                        <Checkbox
                          className="mt-1 shrink-0"
                          checked={checkedIds.has(item.id)}
                          onCheckedChange={(checked) =>
                            toggleChecked(item.id, checked === true)
                          }
                          aria-label={`Select ${item.title}`}
                        />
                      ) : null}
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-left"
                        onClick={() => setSelectedId(item.id)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-medium">{item.title}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {item.content_type_label} · {item.source_label}
                            </p>
                          </div>
                          <StatusBadge
                            status={item.status}
                            className="shrink-0"
                          />
                        </div>
                        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                          {item.summary || "No summary supplied."}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span>{item.owner_label}</span>
                          <span>Submitted {formatDate(item.submitted_at)}</span>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {totalPages > 1 ? (
                <div className="flex items-center justify-between gap-2 pt-1">
                  <p className="text-xs text-muted-foreground">
                    Page {meta?.page ?? page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={page <= 1 || queueQuery.isFetching}
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages || queueQuery.isFetching}
                      onClick={() => setPage((current) => current + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <AlertDialog
            open={bulkAction !== null}
            onOpenChange={(open) => {
              if (!open && !bulkRunning) setBulkAction(null);
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {bulkAction
                    ? `${BULK_ACTION_LABELS[bulkAction].verb} ${checkedItems.length} item${checkedItems.length === 1 ? "" : "s"}?`
                    : "Confirm bulk action"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {bulkAction === "publish"
                    ? `The ${checkedItems.length === 1 ? "selected item" : `${checkedItems.length} selected items`} will go live on the public site immediately.`
                    : bulkAction === "archive"
                      ? `The ${checkedItems.length === 1 ? "selected item" : `${checkedItems.length} selected items`} will be removed from public view and moved to the archive.`
                      : `The ${checkedItems.length === 1 ? "selected item" : `${checkedItems.length} selected items`} will be marked as approved and ready for publishing.`}{" "}
                  Items that cannot make this transition are skipped and
                  reported.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={bulkRunning}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={bulkRunning}
                  onClick={(event) => {
                    event.preventDefault();
                    if (bulkAction) void runBulkAction(bulkAction);
                  }}
                >
                  {bulkRunning
                    ? "Working…"
                    : bulkAction
                      ? `${BULK_ACTION_LABELS[bulkAction].verb} ${checkedItems.length === 1 ? "1 item" : `${checkedItems.length} items`}`
                      : "Confirm"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <ReviewDetail
            item={selectedItem}
            canReview={canReview}
            canPublish={canPublish}
            canManage={canManage}
            canEdit={canEdit}
            onCompleted={() =>
              queryClient.invalidateQueries({
                queryKey: ["content-workflow", "queue"],
              })
            }
          />
        </div>
      </div>
    </div>
  );
}

function ReviewDetail({
  item,
  canReview,
  canPublish,
  canManage,
  canEdit,
  onCompleted,
}: {
  item: ContentWorkflowQueueItem | null;
  canReview: boolean;
  canPublish: boolean;
  canManage: boolean;
  canEdit: boolean;
  onCompleted: () => void;
}) {
  if (!item) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select content to review</CardTitle>
          <CardDescription>Content details appear here.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="min-w-0 overflow-hidden border-white/70 bg-white/90 shadow-sm backdrop-blur dark:border-white/10 dark:bg-background/90">
      <CardHeader className="gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{item.content_type_label}</Badge>
              <StatusBadge status={item.status} />
            </div>
            <CardTitle className="mt-3 break-words">{item.title}</CardTitle>
            <CardDescription className="mt-2">
              {item.source_label} · Target: {item.publication_target}
            </CardDescription>
          </div>
          {item.preview_path ? (
            <Button asChild size="sm" variant="outline" className="shrink-0">
              <a href={item.preview_path} target="_blank" rel="noreferrer">
                <ExternalLink />
                Open public preview
              </a>
            </Button>
          ) : null}
        </div>
        <WorkflowActions
          item={item}
          canReview={canReview}
          canPublish={canPublish}
          canManage={canManage}
          canEdit={canEdit}
          onCompleted={onCompleted}
        />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="preview" className="space-y-4">
          <TabsList className="h-auto w-full justify-start overflow-x-auto bg-muted/60 p-1">
            <TabsTrigger value="preview" className="gap-2">
              <FileText className="size-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="details" className="gap-2">
              <Settings2 className="size-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="size-4" />
              History
            </TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="mt-0 space-y-5">
            <div className="border-y py-5">
              <RichTextRenderer
                content={
                  item.preview.rich_text ||
                  item.preview.plain_text ||
                  item.summary
                }
                emptyFallback={
                  <p className="text-sm text-muted-foreground">
                    No preview content was supplied.
                  </p>
                }
              />
            </div>
            <div>
              <p className="text-sm font-medium">
                Attachments and related links
              </p>
              {item.preview.related_links.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  No linked attachments.
                </p>
              ) : (
                <div className="mt-2 divide-y rounded-md border">
                  {item.preview.related_links.map((link, index) => (
                    <LinkRow
                      key={`${link.url ?? link.href ?? index}`}
                      link={link}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="details" className="mt-0 space-y-5">
            {item.contributor?.consent_to_publish === false ? (
              <Alert variant="destructive">
                <AlertDescription>
                  The contributor has <strong>not consented to publication</strong>.
                  Publishing is blocked until consent is recorded on the story.
                </AlertDescription>
              </Alert>
            ) : null}
            <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
              <DetailTerm label="Owner" value={item.owner_label} />
              <DetailTerm
                label="Submitted by"
                value={item.submitted_by_label}
              />
              <DetailTerm
                label="Submitted at"
                value={formatDate(item.submitted_at)}
              />
              <DetailTerm label="Reviewer" value={item.reviewer_label} />
              <DetailTerm
                label="Scheduled publish"
                value={formatDate(item.scheduled_publish_at)}
              />
              <DetailTerm
                label="Publication target"
                value={item.publication_target}
              />
              {item.contributor ? (
                <>
                  <DetailTerm
                    label="Contributor"
                    value={`${item.contributor.name || "Unnamed"}${item.contributor.affiliation ? ` · ${item.contributor.affiliation}` : ""}`}
                  />
                  <DetailTerm
                    label="Publication consent"
                    value={
                      item.contributor.consent_to_publish === false
                        ? "Not granted"
                        : item.contributor.consent_to_publish
                          ? `Granted${item.contributor.show_name === false ? " (name withheld)" : ""}`
                          : "Unknown"
                    }
                  />
                </>
              ) : null}
            </dl>
            <div className="border-t pt-5">
              <p className="text-sm font-medium">Search metadata</p>
              <dl className="mt-3 grid gap-y-3 text-sm">
                <DetailTerm
                  label="Title"
                  value={item.preview.seo.title || "Not set"}
                />
                <DetailTerm
                  label="Description"
                  value={item.preview.seo.description || "Not set"}
                />
                <DetailTerm
                  label="Keywords"
                  value={formatKeywords(item.preview.seo.keywords)}
                />
              </dl>
            </div>
          </TabsContent>
          <TabsContent value="history" className="mt-0">
            <RecordHistory contentType={item.content_type} contentId={item.id} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onValueChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onValueChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All {label.toLowerCase()}s</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function DateFilter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <DateTimePicker
        value={value}
        onChange={onChange}
        placeholder={`Select ${label.toLowerCase()}`}
      />
    </div>
  );
}

function DetailTerm({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 break-words">{value}</dd>
    </div>
  );
}

function LinkRow({ link }: { link: Record<string, unknown> }) {
  const label = String(
    link.label ?? link.title ?? link.name ?? "Linked content",
  );
  const href =
    typeof link.url === "string"
      ? link.url
      : typeof link.href === "string"
        ? link.href
        : null;
  return (
    <div className="flex items-center justify-between gap-3 p-3 text-sm">
      <span className="min-w-0 truncate">{label}</span>
      {href ? (
        <a
          className="shrink-0 text-primary hover:underline"
          href={href}
          target="_blank"
          rel="noreferrer"
        >
          Open
        </a>
      ) : (
        <span className="text-muted-foreground">Linked</span>
      )}
    </div>
  );
}

function QueueLoading() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((index) => (
        <Skeleton key={index} className="h-24 w-full" />
      ))}
    </div>
  );
}

function QueueMessage({ message }: { message: string }) {
  return (
    <p
      role="status"
      className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground"
    >
      {message}
    </p>
  );
}

function QueueMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-[112px] rounded-2xl border bg-background/80 p-3 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function uniqueOptions(
  items: ContentWorkflowQueueItem[],
  value: (item: ContentWorkflowQueueItem) => string,
  label: (item: ContentWorkflowQueueItem) => string,
) {
  return [
    ...new Map(
      items.map((item) => [
        value(item),
        { value: value(item), label: label(item) },
      ]),
    ).values(),
  ];
}

function humanize(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value?: string | null) {
  if (!value) return "Not set";
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? "Not set" : parsed.toLocaleString();
}

function formatKeywords(value?: Record<string, unknown> | string[] | null) {
  if (!value) return "Not set";
  return Array.isArray(value)
    ? value.join(", ") || "Not set"
    : Object.values(value).flat().join(", ") || "Not set";
}
