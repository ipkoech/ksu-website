"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ExternalLink,
  FileText,
  Filter,
  History,
  SearchCheck,
  Settings2,
  Sparkles,
} from "lucide-react";
import {
  contentWorkflowApi,
  type ContentWorkflowQueueFilters,
  type ContentWorkflowQueueItem,
} from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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

export function ReviewQueue() {
  const queryClient = useQueryClient();
  const { hasScope } = usePermissions();
  const [filters, setFilters] = useState<ContentWorkflowQueueFilters>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const queueQuery = useQuery({
    queryKey: ["content-workflow", "queue", filters],
    queryFn: () => contentWorkflowApi.listQueue(filters),
  });
  const items = useMemo(() => queueQuery.data?.data ?? [], [queueQuery.data?.data]);
  const selectedItem =
    items.find((item) => item.id === selectedId) ?? items[0] ?? null;
  const canReview = hasScope("content.review") || hasScope("content.manage");
  const canPublish = hasScope("content.publish");
  const canManage = hasScope("content.manage");
  const canEdit = canManage || hasScope("content.edit_submitted");
  const canAccess = canReview || canPublish || hasScope("homepage.manage");

  useEffect(() => {
    if (selectedItem && selectedItem.id !== selectedId) {
      setSelectedId(selectedItem.id);
    }
  }, [selectedId, selectedItem]);

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
  }

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
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Approve, request changes, and publish with context</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                The queue reflects backend workflow state across newsroom, Page CMS, slider and student-club submissions.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <QueueMetric label="Visible" value={items.length} />
              <QueueMetric label="Review" value={items.filter((item) => item.status === "in_review" || item.status === "submitted").length} />
              <QueueMetric label="Approved" value={items.filter((item) => item.status === "approved").length} />
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
              {Object.keys(filters).length > 0 ? (
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
          <CardContent>
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
                  { value: "blogs", label: "Blogs" },
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
                {items.length} record{items.length === 1 ? "" : "s"} in the
                current view.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {queueQuery.isLoading ? (
                <QueueLoading />
              ) : queueQuery.isError ? (
                <QueueMessage message="The review queue could not be loaded." />
              ) : items.length === 0 ? (
                <QueueMessage message="No content matches the current filters." />
              ) : (
                <div className="divide-y rounded-2xl border bg-background">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={
                        selectedItem?.id === item.id
                          ? "block w-full bg-primary/5 p-4 text-left"
                          : "block w-full p-4 text-left transition-colors hover:bg-primary/5"
                      }
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

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
  const historyQuery = useQuery({
    queryKey: ["content-workflow", "history", item?.content_type, item?.id],
    queryFn: () => contentWorkflowApi.logs(item!.content_type, item!.id),
    enabled: Boolean(item),
  });

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
            {historyQuery.isLoading ? (
              <QueueLoading />
            ) : historyQuery.isError ? (
              <QueueMessage message="Workflow history could not be loaded." />
            ) : historyQuery.data?.data.length ? (
              <div className="divide-y rounded-md border">
                {historyQuery.data.data.map((entry) => (
                  <div key={entry.id} className="p-4">
                    <p className="font-medium">
                      {humanize(entry.action)}: {humanize(entry.from_status)} to{" "}
                      {humanize(entry.to_status)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(entry.created_at)}
                    </p>
                    {entry.comments ? (
                      <p className="mt-3 text-sm text-muted-foreground">
                        {entry.comments}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <QueueMessage message="No workflow actions have been recorded." />
            )}
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
      <Input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
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
