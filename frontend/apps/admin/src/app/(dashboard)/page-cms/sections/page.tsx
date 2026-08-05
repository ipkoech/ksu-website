"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Archive,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FilterX,
  Layers3,
  MoreHorizontal,
  Plus,
  Send,
  Sparkles,
  Undo2,
} from "lucide-react";
import { toast } from "@ksu/ui";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from "@ksu/ui/components";
import { DataTable } from "@/components/data-table/data-table";
import { TableSearch } from "@/components/shared/table-search";
import { usePermissions } from "@/hooks/use-permissions";
import { PageTransition } from "@/lib/animations";
import {
  PAGE_SCOPE_TYPES,
  PAGE_SECTION_LAYOUT_VARIANTS,
  PAGE_SECTION_STATUSES,
  PAGE_SECTION_WORKFLOW_ACTIONS,
  pageSectionsApi,
  type PageScopeType,
  type PageSection,
  type PageSectionLayoutVariant,
  type PageSectionStatus,
  type PageSectionWorkflowAction,
} from "@/lib/api/page-cms";

function workflowActionsForStatus(status: PageSectionStatus): PageSectionWorkflowAction[] {
  const actions: PageSectionWorkflowAction[] = [];
  if (status === "draft" || status === "changes_requested") actions.push("submit");
  if (status === "in_review") actions.push("approve", "request_changes");
  if (status === "approved") actions.push("publish");
  if (status === "published") actions.push("unpublish");
  if (status !== "archived") actions.push("archive");
  return actions;
}

type NewSectionForm = {
  page_key: string;
  scope_type: PageScopeType;
  section_key: string;
  title: string;
  layout_variant: PageSectionLayoutVariant;
  display_order: number;
  is_enabled: boolean;
};

function emptyNewSectionForm(): NewSectionForm {
  return {
    page_key: "homepage",
    scope_type: "university",
    section_key: "",
    title: "",
    layout_variant: PAGE_SECTION_LAYOUT_VARIANTS[0],
    display_order: 100,
    is_enabled: true,
  };
}

function getColumns(
  onWorkflowAction: (section: PageSection, action: PageSectionWorkflowAction) => void,
  permissions: { canReview: boolean; canPublish: boolean; canArchive: boolean; canManage: boolean },
): ColumnDef<PageSection>[] {
  return [
    {
      accessorKey: "title",
      header: "Section",
      cell: ({ row }) => {
        const section = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Layers3 className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium">{section.title || section.section_key}</p>
              <p className="truncate text-xs text-muted-foreground">
                {section.section_key} · {section.layout_variant}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "page_key",
      header: "Page / Scope",
      cell: ({ row }) => (
        <div className="space-y-1 text-sm">
          <p>{row.original.page_key}</p>
          <p className="text-xs text-muted-foreground">{scopeSummary(row.original)}</p>
        </div>
      ),
    },
    {
      accessorKey: "display_order",
      header: "Order",
      cell: ({ row }) => row.original.display_order,
    },
    {
      accessorKey: "items",
      header: "Items",
      cell: ({ row }) => row.original.items?.length ?? 0,
    },
    {
      accessorKey: "status",
      header: "Workflow",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <Badge variant={row.original.status === "published" ? "default" : "secondary"}>
            {row.original.status.replace(/_/g, " ")}
          </Badge>
          <Badge variant="outline">{row.original.is_enabled ? "Enabled" : "Disabled"}</Badge>
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const section = row.original;
        const availableActions = workflowActionsForStatus(section.status).filter((action) => {
          if (action === "approve" || action === "request_changes") return permissions.canReview;
          if (action === "publish" || action === "unpublish") return permissions.canPublish;
          if (action === "archive") return permissions.canArchive;
          return permissions.canManage;
        });

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal data-icon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href={`/corporate-communication/page-cms/sections/${section.id}`}>Edit section</Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              {availableActions.length > 0 ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Workflow</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    {availableActions.map((action) => (
                      <DropdownMenuItem
                        key={action}
                        onClick={() => onWorkflowAction(section, action)}
                      >
                        {action === "submit" ? (
                          <Send className="mr-2 size-4" />
                        ) : action === "approve" ? (
                          <CheckCircle2 className="mr-2 size-4" />
                        ) : action === "request_changes" ? (
                          <Undo2 className="mr-2 size-4" />
                        ) : action === "archive" ? (
                          <Archive className="mr-2 size-4" />
                        ) : null}
                        {action.replace(/_/g, " ")}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}

function scopeSummary(section: PageSection) {
  if (section.scope_type === "university") return "University-wide";
  if (section.scope_type === "school") return section.scope_id ? "School-specific" : "School scope";
  if (section.scope_type === "research") return section.scope_id ? "Research-specific" : "Main research homepage";
  if (section.scope_type === "library") return section.scope_id ? "Library-specific" : "Main library homepage";
  return section.scope_type;
}

export default function PageCmsSectionsPage() {
  const router = useRouter();
  const { hasPermission, hasAnyPermission } = usePermissions();
  const [search, setSearch] = useState("");
  const [pageKeyFilter, setPageKeyFilter] = useState("");
  const [scopeType, setScopeType] = useState<"all" | PageScopeType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | PageSectionStatus>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newSection, setNewSection] = useState<NewSectionForm>(() => emptyNewSectionForm());
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [paginationMeta, setPaginationMeta] = useState<{
    page: number;
    per_page: number;
    total: number;
    pages: number;
  } | null>(null);
  const [pendingWorkflowAction, setPendingWorkflowAction] = useState<{
    section: PageSection;
    action: PageSectionWorkflowAction;
  } | null>(null);
  const [workflowReason, setWorkflowReason] = useState("");
  const [workflowBusy, setWorkflowBusy] = useState(false);

  const canReview = hasAnyPermission(["page_sections.review", "page_sections.manage"]);
  const canPublish = hasAnyPermission(["page_sections.publish", "page_sections.manage", "homepage.publish"]);
  const canArchive = hasAnyPermission([
    "page_sections.delete",
    "page_sections.manage",
    "homepage.manage",
    "school_homepage.manage",
    "research_homepage.manage",
    "library_homepage.manage",
  ]);
  const canManage = hasAnyPermission([
    "page_sections.create",
    "page_sections.update",
    "page_sections.manage",
    "homepage.manage",
    "school_homepage.manage",
    "research_homepage.manage",
    "library_homepage.manage",
  ]);

  const loadSections = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await pageSectionsApi.listAdmin({
        page,
        per_page: 25,
        search: search || undefined,
        page_key: pageKeyFilter || undefined,
        scope_type: scopeType === "all" ? undefined : scopeType,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setSections(response.data ?? []);
      const rawMeta = response.meta as { page: number; per_page: number; total: number; total_pages?: number; pages?: number } | null;
      setPaginationMeta(rawMeta ? {
        page: rawMeta.page,
        per_page: rawMeta.per_page,
        total: rawMeta.total,
        pages: rawMeta.pages ?? rawMeta.total_pages ?? 1,
      } : null);
    } catch {
      setError("Failed to load page sections.");
    } finally {
      setIsLoading(false);
    }
  }, [pageKeyFilter, scopeType, search, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
    void loadSections(1);
  }, [loadSections]);

  // Derive unique page_key options from loaded data
  const pageKeyOptions = useMemo(() => {
    const keys = new Set(sections.map((s) => s.page_key));
    return Array.from(keys).sort();
  }, [sections]);

  const handleWorkflowAction = useCallback(
    (section: PageSection, action: PageSectionWorkflowAction) => {
      if (action === "request_changes") {
        setPendingWorkflowAction({ section, action });
        setWorkflowReason("");
      } else {
        void executeWorkflow(section, action);
      }
    },
    [],
  );

  const executeWorkflow = async (
    section: PageSection,
    action: PageSectionWorkflowAction,
    reason?: string,
  ) => {
    setWorkflowBusy(true);
    try {
      const response = await pageSectionsApi.workflow(section.id, action, reason);
      setSections((current) =>
        current.map((s) => (s.id === section.id ? response.data : s)),
      );
      toast.success(`Section ${action.replace(/_/g, " ")} complete.`);
      setPendingWorkflowAction(null);
      setWorkflowReason("");
    } catch {
      toast.error(`Failed to ${action.replace(/_/g, " ")} section.`);
    } finally {
      setWorkflowBusy(false);
    }
  };

  const confirmWorkflowAction = () => {
    if (!pendingWorkflowAction) return;
    if (pendingWorkflowAction.action === "request_changes" && !workflowReason.trim()) {
      toast.error("Add a clear revision note before requesting changes.");
      return;
    }
    void executeWorkflow(
      pendingWorkflowAction.section,
      pendingWorkflowAction.action,
      workflowReason.trim() || undefined,
    );
  };

  const columns = useMemo(
    () => getColumns(handleWorkflowAction, { canReview, canPublish, canArchive, canManage }),
    [handleWorkflowAction, canReview, canPublish, canArchive, canManage],
  );
  const canCreateSections = canManage;
  const hasFilters = Boolean(search) || Boolean(pageKeyFilter) || scopeType !== "all" || statusFilter !== "all";

  const handleCreateSection = async () => {
    if (!canCreateSections) {
      toast.error("You do not have permission to create page sections.");
      return;
    }
    if (!newSection.page_key.trim() || !newSection.section_key.trim()) {
      toast.error("Page and section key are required.");
      return;
    }

    setIsCreating(true);
    try {
      const response = await pageSectionsApi.create({
        page_key: newSection.page_key.trim(),
        scope_type: newSection.scope_type,
        scope_id: null,
        section_key: newSection.section_key.trim(),
        title: newSection.title.trim() || null,
        subtitle: null,
        description: null,
        settings: {},
        layout_variant: newSection.layout_variant,
        display_order: newSection.display_order,
        is_enabled: newSection.is_enabled,
        valid_from: null,
        valid_to: null,
      });
      const created = response.data;
      setSections((current) => [created, ...current]);
      setCreateOpen(false);
      setNewSection(emptyNewSectionForm());
      toast.success("Section created");
      router.push(`/corporate-communication/page-cms/sections/${created.id}`);
    } catch {
      toast.error("Failed to create section.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <PageTransition>
      <section className="mb-5 overflow-hidden rounded-2xl border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.14),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(248,250,252,0.86))] p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.14),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.86))]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border bg-background/80 px-2.5 py-0.5 text-xs font-medium text-muted-foreground shadow-sm">
              <Sparkles className="size-3.5 text-orange-600" />
              Structured homepage sections
            </div>
            <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Page Sections</h1>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              Sections control where public content appears, which scope owns it, and how item-level CTAs, media and layout settings are published.
            </p>
          </div>
          <div className="flex flex-col gap-2 lg:items-end">
            {canCreateSections ? (
              <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
                <Plus data-icon="inline-start" />
                New Section
              </Button>
            ) : null}
            <div className="grid gap-2 sm:grid-cols-4">
              <ScopeMetric label="Total" value={paginationMeta?.total ?? sections.length} />
              <ScopeMetric label="Page" value={`${currentPage}/${paginationMeta?.pages ?? 1}`} />
              <ScopeMetric label="Published" value={sections.filter((section) => section.status === "published").length} />
              <ScopeMetric label="Enabled" value={sections.filter((section) => section.is_enabled).length} />
            </div>
          </div>
        </div>
      </section>

      <DataTable
        data={sections}
        columns={columns}
        isLoading={isLoading}
        toolbar={(
          <div className="space-y-3">
            <div className="grid gap-3 rounded-2xl border bg-card/90 p-3 shadow-sm lg:grid-cols-[minmax(0,1.3fr)_180px_180px_180px_auto] lg:items-end">
              <div className="space-y-2">
                <p className="text-sm font-medium">Search</p>
                <TableSearch
                  value={search}
                  onChange={setSearch}
                  placeholder="Search sections by title, key, or page"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Page Key</p>
                <Input
                  value={pageKeyFilter}
                  onChange={(e) => setPageKeyFilter(e.target.value)}
                  placeholder="e.g. homepage"
                  list="page-key-options"
                />
                {pageKeyOptions.length > 0 && (
                  <datalist id="page-key-options">
                    {pageKeyOptions.map((key) => (
                      <option key={key} value={key} />
                    ))}
                  </datalist>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Scope</p>
                <Select value={scopeType} onValueChange={(value) => setScopeType(value as "all" | PageScopeType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All scopes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All scopes</SelectItem>
                      {PAGE_SCOPE_TYPES.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Status</p>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | PageSectionStatus)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All statuses</SelectItem>
                      {PAGE_SECTION_STATUSES.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={!hasFilters}
                onClick={() => {
                  setSearch("");
                  setPageKeyFilter("");
                  setScopeType("all");
                  setStatusFilter("all");
                }}
              >
                <FilterX data-icon="inline-start" />
                Clear
              </Button>
            </div>
            {paginationMeta && paginationMeta.pages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1 || isLoading}
                  onClick={() => {
                    const newPage = currentPage - 1;
                    setCurrentPage(newPage);
                    void loadSections(newPage);
                  }}
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {paginationMeta.pages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= paginationMeta.pages || isLoading}
                  onClick={() => {
                    const newPage = currentPage + 1;
                    setCurrentPage(newPage);
                    void loadSections(newPage);
                  }}
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </div>
        )}
        emptyMessage={error || (search ? "No sections match this search." : "No page sections found.")}
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create page section</DialogTitle>
            <DialogDescription>
              Start with the section identity and layout. Items, media, timing, and workflow are edited on the detail page after creation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">Page</p>
              <Input
                value={newSection.page_key}
                onChange={(event) => setNewSection((current) => ({ ...current, page_key: event.target.value }))}
                placeholder="homepage"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Scope</p>
              <Select
                value={newSection.scope_type}
                onValueChange={(value) => setNewSection((current) => ({ ...current, scope_type: value as PageScopeType }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {PAGE_SCOPE_TYPES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Section Key</p>
              <Input
                value={newSection.section_key}
                onChange={(event) => setNewSection((current) => ({ ...current, section_key: event.target.value }))}
                placeholder="homepage.hero"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Layout</p>
              <Select
                value={newSection.layout_variant}
                onValueChange={(value) => setNewSection((current) => ({ ...current, layout_variant: value as PageSectionLayoutVariant }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose layout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {PAGE_SECTION_LAYOUT_VARIANTS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <p className="text-sm font-medium">Title</p>
              <Input
                value={newSection.title}
                onChange={(event) => setNewSection((current) => ({ ...current, title: event.target.value }))}
                placeholder="Public section title"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Display Order</p>
              <Input
                type="number"
                value={newSection.display_order}
                onChange={(event) => setNewSection((current) => ({ ...current, display_order: Number(event.target.value || 0) }))}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border p-3">
              <div>
                <p className="text-sm font-medium">Enabled</p>
                <p className="text-xs text-muted-foreground">Allow this section to participate in composition.</p>
              </div>
              <Switch
                checked={newSection.is_enabled}
                onCheckedChange={(checked) => setNewSection((current) => ({ ...current, is_enabled: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={isCreating} onClick={() => void handleCreateSection()}>
              {isCreating ? "Creating..." : "Create and continue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Workflow Reason Dialog */}
      <Dialog
        open={Boolean(pendingWorkflowAction)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingWorkflowAction(null);
            setWorkflowReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingWorkflowAction?.action === "request_changes"
                ? "Request changes"
                : pendingWorkflowAction?.action.replace(/_/g, " ")}
            </DialogTitle>
            <DialogDescription>
              This changes the editorial state of &quot;{pendingWorkflowAction?.section.title || pendingWorkflowAction?.section.section_key}&quot; immediately.
            </DialogDescription>
          </DialogHeader>
          {pendingWorkflowAction?.action === "request_changes" ? (
            <div className="space-y-2">
              <Label htmlFor="workflow-reason">Revision note</Label>
              <Textarea
                id="workflow-reason"
                rows={4}
                value={workflowReason}
                onChange={(event) => setWorkflowReason(event.target.value)}
                placeholder="Explain what must change before approval"
              />
            </div>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingWorkflowAction(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={confirmWorkflowAction}
              disabled={workflowBusy}
            >
              {workflowBusy ? "Working..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}

function ScopeMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="min-w-[100px] rounded-2xl border bg-background/80 p-3 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tracking-tight">{value}</p>
    </div>
  );
}
