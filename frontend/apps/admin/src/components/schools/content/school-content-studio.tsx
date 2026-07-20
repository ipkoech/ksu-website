"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  schoolPortalApi,
  schoolPortalQueryKeys,
  type SchoolContentRecord,
  type SchoolContentType,
} from "@ksu/api-client";
import {
  ArrowRight,
  Calendar,
  CalendarDays,
  CircleCheck,
  Download,
  FilePenLine,
  FileText,
  Images,
  Megaphone,
  Newspaper,
  Plus,
  Search,
  Send,
  Sparkles,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@ksu/ui/components";
import { useSchoolPortal } from "@/components/schools/school-portal-provider";
import {
  SchoolFilterBar,
  SchoolMetricGrid,
  SchoolWorkspace,
  SchoolWorkspaceHeader,
} from "@/components/schools/shared/school-workspace";
import { ContentEditorSheet } from "./content-editor-sheet";

const CONTENT_TYPES: Array<{ value: SchoolContentType; label: string; icon: typeof Newspaper; tone: string }> = [
  { value: "news", label: "News", icon: Newspaper, tone: "bg-sky-500/10 text-sky-700 dark:text-sky-400" },
  { value: "event", label: "Events", icon: CalendarDays, tone: "bg-violet-500/10 text-violet-700 dark:text-violet-400" },
  { value: "story", label: "Stories", icon: Sparkles, tone: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  { value: "announcement", label: "Announcements", icon: Megaphone, tone: "bg-rose-500/10 text-rose-700 dark:text-rose-400" },
  { value: "calendar_entry", label: "Calendar", icon: Calendar, tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
  { value: "gallery_link", label: "Gallery", icon: Images, tone: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400" },
  { value: "document", label: "Documents", icon: FileText, tone: "bg-slate-500/10 text-slate-700 dark:text-slate-400" },
  { value: "download", label: "Downloads", icon: Download, tone: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400" },
];

export function SchoolContentStudio() {
  const { school, can } = useSchoolPortal();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const contentType = (params.get("type") || "news") as SchoolContentType;
  const status = params.get("status") || "all";
  const search = params.get("search") || "";
  const focusedId = params.get("record");
  const createRequested = params.get("action") === "create";
  const [createOpen, setCreateOpen] = useState(false);
  const contentQuery = useQuery({
    queryKey: [...schoolPortalQueryKeys.content(school.id), contentType],
    queryFn: async () => (await schoolPortalApi.content.list(contentType)).data,
  });
  const updateUrl = (key: string, value?: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };
  const records = useMemo(
    () =>
      (contentQuery.data ?? [])
        .map((item) => item.record)
        .filter((record) => {
          const recordStatus = String(record.workflow_status || record.status || "draft");
          const text = `${record.title || record.name || ""} ${record.summary || ""}`.toLowerCase();
          return (status === "all" || recordStatus === status) && (!search || text.includes(search.toLowerCase()));
        }),
    [contentQuery.data, search, status],
  );
  const focused = records.find((record) => record.id === focusedId) ?? null;
  const activeType = CONTENT_TYPES.find((item) => item.value === contentType) ?? CONTENT_TYPES[0];

  return (
    <SchoolWorkspace>
      <SchoolWorkspaceHeader
        eyebrow="School editorial"
        title="Content studio"
        description="Create timely school stories, news and announcements, then follow them through the central publishing workflow."
        schoolName={school.name}
        icon={Newspaper}
        actions={can("school.content.manage") ? <Button onClick={() => setCreateOpen(true)}><Plus className="mr-2 size-4" /> New {CONTENT_TYPES.find((item) => item.value === contentType)?.label}</Button> : null}
      />
      <SchoolMetricGrid items={[
        { label: `${CONTENT_TYPES.find((item) => item.value === contentType)?.label ?? "Content"} records`, value: contentQuery.data?.length ?? 0, detail: "In this content collection", icon: Newspaper },
        { label: "Drafts", value: records.filter((item) => String(item.workflow_status || item.status || "draft") === "draft").length, detail: "Work in progress", icon: FilePenLine, tone: "warning" },
        { label: "In workflow", value: records.filter((item) => ["submitted", "in_review", "changes_requested", "approved"].includes(String(item.workflow_status || item.status))).length, detail: "Awaiting action", icon: Send, tone: "info" },
        { label: "Published", value: records.filter((item) => String(item.workflow_status || item.status) === "published").length, detail: "Visible to audiences", icon: CircleCheck, tone: "success" },
      ]} />
      <Tabs
        value={contentType}
        onValueChange={(value) => {
          const next = new URLSearchParams(params);
          next.set("type", value);
          next.delete("record");
          router.replace(`${pathname}?${next.toString()}`, { scroll: false });
        }}
      >
        <TabsList className="h-auto w-full justify-start overflow-x-auto">
          {CONTENT_TYPES.map((item) => {
            const Icon = item.icon;
            return <TabsTrigger key={item.value} value={item.value}><Icon className="mr-1.5 size-3.5" />{item.label}</TabsTrigger>;
          })}
        </TabsList>
      </Tabs>
      <SchoolFilterBar>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem]">
        <label className="relative"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="pl-9" defaultValue={search} placeholder="Search content" onKeyDown={(event) => event.key === "Enter" && updateUrl("search", event.currentTarget.value.trim())} /></label>
        <Select value={status} onValueChange={(value) => updateUrl("status", value)}>
          <SelectTrigger aria-label="Workflow status"><SelectValue /></SelectTrigger>
          <SelectContent>{["all", "draft", "submitted", "in_review", "changes_requested", "approved", "published", "archived"].map((item) => <SelectItem key={item} value={item}>{item.replaceAll("_", " ")}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      </SchoolFilterBar>
      {contentQuery.error ? <Alert variant="destructive"><AlertDescription>{contentQuery.error.message}</AlertDescription></Alert> : null}
      <section aria-label="Editorial pipeline" className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {[
          { value: "draft", label: "Draft", color: "bg-amber-500" },
          { value: "submitted", label: "Submitted", color: "bg-sky-500" },
          { value: "changes_requested", label: "Changes requested", color: "bg-destructive" },
          { value: "published", label: "Published", color: "bg-emerald-500" },
        ].map((item) => (
          <button
            key={item.value}
            type="button"
            className="cursor-pointer rounded-xl border bg-background p-3 text-left shadow-sm transition-colors duration-200 hover:border-primary/30"
            onClick={() => updateUrl("status", status === item.value ? "all" : item.value)}
          >
            <span className={`mb-2 block h-1 w-8 rounded-full ${item.color}`} />
            <span className="block text-xl font-semibold">
              {(contentQuery.data ?? []).filter(({ record }) => String(record.workflow_status || record.status || "draft") === item.value).length}
            </span>
            <span className="block truncate text-xs font-medium sm:text-sm">{item.label}</span>
          </button>
        ))}
      </section>
      <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {records.map((record) => <ContentCard key={record.id} record={record} contentType={activeType} onOpen={() => updateUrl("record", record.id)} />)}
        {!contentQuery.isPending && records.length === 0 ? <div className="col-span-full rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">No content matches this type and workflow state.</div> : null}
      </section>
      <ContentEditorSheet
        contentType={contentType}
        record={focused}
        open={createOpen || Boolean(focusedId) || createRequested}
        onOpenChange={(open) => { if (!open) { setCreateOpen(false); updateUrl(createRequested ? "action" : "record"); } }}
        onSaved={async () => { await contentQuery.refetch(); }}
      />
    </SchoolWorkspace>
  );
}

function ContentCard({
  record,
  contentType,
  onOpen,
}: {
  record: SchoolContentRecord;
  contentType: (typeof CONTENT_TYPES)[number];
  onOpen: () => void;
}) {
  const status = String(record.workflow_status || record.status || "draft");
  const Icon = contentType.icon;
  const date = record.updated_at ? new Date(record.updated_at) : null;
  return (
    <button type="button" className="group flex min-h-52 cursor-pointer flex-col rounded-xl border bg-background p-4 text-left shadow-sm transition-colors duration-200 hover:border-primary/40 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={onOpen}>
      <span className="flex w-full items-start gap-3">
        <span className={`rounded-xl p-2.5 ${contentType.tone}`}><Icon className="size-5" /></span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-1.5">
            <Badge variant={status === "changes_requested" ? "destructive" : "secondary"}>{status.replaceAll("_", " ")}</Badge>
            <Badge variant="outline">{contentType.label}</Badge>
          </span>
          <span className="mt-2 block line-clamp-2 font-semibold leading-6">{String(record.title || record.name || "Untitled")}</span>
        </span>
      </span>
      <span className="mt-3 line-clamp-3 text-sm leading-5 text-muted-foreground">{String(record.summary || record.excerpt || "Add a summary so reviewers and audiences can understand this content quickly.")}</span>
      <span className="mt-auto flex w-full items-center justify-between gap-3 border-t pt-3">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5" />{date ? date.toLocaleDateString() : "Not dated"}
        </span>
        <span className="flex items-center text-xs font-medium text-primary">Open editor <ArrowRight className="ml-1 size-3.5 transition-transform group-hover:translate-x-0.5" /></span>
      </span>
    </button>
  );
}
