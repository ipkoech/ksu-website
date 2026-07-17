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
import { FileText, Plus, Search } from "lucide-react";
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
import { ContentEditorSheet } from "./content-editor-sheet";

const CONTENT_TYPES: Array<{ value: SchoolContentType; label: string }> = [
  { value: "news", label: "News" },
  { value: "event", label: "Events" },
  { value: "story", label: "Stories" },
  { value: "announcement", label: "Announcements" },
  { value: "calendar_entry", label: "Calendar" },
  { value: "gallery_link", label: "Gallery" },
  { value: "document", label: "Documents" },
  { value: "download", label: "Downloads" },
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

  return (
    <main className="space-y-5 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-medium text-primary">School editorial</p><h1 className="text-2xl font-semibold tracking-tight">Content Studio</h1><p className="mt-1 text-sm text-muted-foreground">Draft school content and hand it to CoCMS for central review.</p></div>
        {can("school.content.manage") ? <Button onClick={() => setCreateOpen(true)}><Plus className="mr-2 size-4" /> New {CONTENT_TYPES.find((item) => item.value === contentType)?.label}</Button> : null}
      </header>
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
          {CONTENT_TYPES.map((item) => <TabsTrigger key={item.value} value={item.value}>{item.label}</TabsTrigger>)}
        </TabsList>
      </Tabs>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem]">
        <label className="relative"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="pl-9" defaultValue={search} placeholder="Search content" onKeyDown={(event) => event.key === "Enter" && updateUrl("search", event.currentTarget.value.trim())} /></label>
        <Select value={status} onValueChange={(value) => updateUrl("status", value)}>
          <SelectTrigger aria-label="Workflow status"><SelectValue /></SelectTrigger>
          <SelectContent>{["all", "draft", "submitted", "in_review", "changes_requested", "approved", "published", "archived"].map((item) => <SelectItem key={item} value={item}>{item.replaceAll("_", " ")}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      {contentQuery.error ? <Alert variant="destructive"><AlertDescription>{contentQuery.error.message}</AlertDescription></Alert> : null}
      <section className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {records.map((record) => <ContentCard key={record.id} record={record} onOpen={() => updateUrl("record", record.id)} />)}
        {!contentQuery.isPending && records.length === 0 ? <div className="col-span-full rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">No content matches this type and workflow state.</div> : null}
      </section>
      <ContentEditorSheet
        contentType={contentType}
        record={focused}
        open={createOpen || Boolean(focusedId)}
        onOpenChange={(open) => { if (!open) { setCreateOpen(false); updateUrl("record"); } }}
        onSaved={async () => { await contentQuery.refetch(); }}
      />
    </main>
  );
}

function ContentCard({ record, onOpen }: { record: SchoolContentRecord; onOpen: () => void }) {
  const status = String(record.workflow_status || record.status || "draft");
  return (
    <button type="button" className="flex cursor-pointer gap-3 rounded-lg border bg-background p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={onOpen}>
      <FileText className="mt-1 size-5 shrink-0 text-primary" />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{String(record.title || record.name || "Untitled")}</span>
        <span className="mt-1 line-clamp-2 text-sm text-muted-foreground">{String(record.summary || "No summary")}</span>
        <span className="mt-3 flex items-center justify-between gap-2"><Badge variant={status === "changes_requested" ? "destructive" : "secondary"}>{status.replaceAll("_", " ")}</Badge><span className="text-xs text-muted-foreground">{record.updated_at ? new Date(record.updated_at).toLocaleDateString() : ""}</span></span>
      </span>
    </button>
  );
}
