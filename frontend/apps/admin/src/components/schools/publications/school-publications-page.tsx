"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  schoolPortalApi,
  schoolPortalQueryKeys,
  type SchoolPublicationPayload,
  type SchoolPublicationRecord,
} from "@ksu/api-client";
import {
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  CalendarDays,
  FilePenLine,
  Globe2,
  Loader2,
  Plus,
  Send,
  Unlock,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from "@ksu/ui/components";
import { useSchoolPortal } from "@/components/schools/school-portal-provider";
import { SchoolDepartmentSelect } from "@/components/schools/shared/school-reference-selectors";
import {
  SchoolFilterBar,
  SchoolMetricGrid,
  SchoolWorkspace,
  SchoolWorkspaceHeader,
} from "@/components/schools/shared/school-workspace";

const EMPTY: SchoolPublicationPayload = {
  title: "",
  publication_type: "journal_article",
  is_open_access: false,
};

const PIPELINE = [
  { key: "draft", label: "Draft", detail: "Being prepared", tone: "bg-amber-500" },
  { key: "submitted", label: "Submitted", detail: "Sent for review", tone: "bg-sky-500" },
  { key: "under_review", label: "In review", detail: "Research office review", tone: "bg-violet-500" },
  { key: "accepted", label: "Accepted", detail: "Ready for publication", tone: "bg-emerald-500" },
  { key: "published", label: "Published", detail: "Completed research output", tone: "bg-primary" },
  { key: "retracted", label: "Retracted", detail: "Removed from circulation", tone: "bg-destructive" },
];

export function SchoolPublicationsPage() {
  const { school, can } = useSchoolPortal();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const page = Number(params.get("page") || 1);
  const status = params.get("status") || "all";
  const focusedId = params.get("publication");
  const [createOpen, setCreateOpen] = useState(false);
  const publicationsQuery = useQuery({
    queryKey: [...schoolPortalQueryKeys.publications(school.id), { page, status }],
    queryFn: () => schoolPortalApi.publications.list({ page, per_page: 20, status: status === "all" ? undefined : status }),
  });
  const departmentsQuery = useQuery({
    queryKey: [...schoolPortalQueryKeys.departments(school.id), { purpose: "publication-labels" }],
    queryFn: () => schoolPortalApi.departments.list({ page: 1, per_page: 100 }),
    staleTime: 5 * 60 * 1000,
  });
  const departmentNames = new Map(
    (departmentsQuery.data?.data ?? []).map((department) => [department.id, department.name]),
  );
  const focused = publicationsQuery.data?.data.find((item) => item.id === focusedId) ?? null;
  const updateUrl = (key: string, value?: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <SchoolWorkspace>
      <SchoolWorkspaceHeader
        eyebrow="Research outputs"
        title="Publications"
        description="Capture scholarly work, complete its metadata, and follow each publication through institutional review."
        schoolName={school.name}
        icon={BookOpenCheck}
        actions={can("school.publications.manage") ? <Button onClick={() => setCreateOpen(true)}><Plus className="mr-2 size-4" /> Add publication</Button> : null}
      />
      <SchoolMetricGrid items={[
        { label: "Publications", value: publicationsQuery.data?.meta.total ?? publicationsQuery.data?.data.length ?? 0, detail: "School research records", icon: BookOpenCheck },
        { label: "Drafts", value: publicationsQuery.data?.data.filter((item) => item.status === "draft").length ?? 0, detail: "Still being prepared", icon: FilePenLine, tone: "warning" },
        { label: "In review", value: publicationsQuery.data?.data.filter((item) => ["submitted", "under_review"].includes(item.status)).length ?? 0, detail: "With the research office", icon: Send, tone: "info" },
        { label: "Published", value: publicationsQuery.data?.data.filter((item) => item.status === "published").length ?? 0, detail: "Completed outputs", icon: Globe2, tone: "success" },
      ]} />
      <SchoolFilterBar>
      <Select value={status} onValueChange={(value) => updateUrl("status", value)}>
        <SelectTrigger className="w-52" aria-label="Publication status"><SelectValue /></SelectTrigger>
        <SelectContent>{["all", "draft", "submitted", "under_review", "accepted", "published", "retracted"].map((item) => <SelectItem key={item} value={item}>{item.replaceAll("_", " ")}</SelectItem>)}</SelectContent>
      </Select>
      </SchoolFilterBar>
      {publicationsQuery.error ? <Alert variant="destructive"><AlertDescription>{publicationsQuery.error.message}</AlertDescription></Alert> : null}
      {status === "all" ? (
        <section aria-label="Publication workflow" className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
          {PIPELINE.map((lane) => {
            const count = publicationsQuery.data?.data.filter((publication) => publication.status === lane.key).length ?? 0;
            return (
              <button
                key={lane.key}
                type="button"
                className="cursor-pointer rounded-xl border bg-background p-3 text-left shadow-sm transition-colors duration-200 hover:border-primary/30"
                onClick={() => updateUrl("status", lane.key)}
              >
                <span className={`mb-3 block h-1 w-10 rounded-full ${lane.tone}`} />
                <span className="block text-xl font-semibold">{count}</span>
                <span className="block text-sm font-medium">{lane.label}</span>
                <span className="mt-0.5 hidden text-xs text-muted-foreground sm:block">{lane.detail}</span>
              </button>
            );
          })}
        </section>
      ) : null}
      <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {publicationsQuery.data?.data.map((publication) => {
          const pipeline = PIPELINE.find((item) => item.key === publication.status);
          return (
            <Card key={publication.id} className="group overflow-hidden shadow-sm transition-colors duration-200 hover:border-primary/30">
              <div className={`h-1 ${pipeline?.tone || "bg-muted"}`} />
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <span className="rounded-xl bg-primary/10 p-2.5 text-primary"><BookOpen className="size-5" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className="capitalize">{publication.publication_type.replaceAll("_", " ")}</Badge>
                      <Badge variant="outline" className="capitalize">{publication.status.replaceAll("_", " ")}</Badge>
                    </div>
                    <CardTitle className="line-clamp-3 text-base leading-6">{publication.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="line-clamp-3 min-h-[3.75rem] text-sm leading-5 text-muted-foreground">
                  {publication.abstract || "No abstract has been added to this publication record."}
                </p>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2"><Globe2 className="size-3.5" /><span className="truncate">{publication.journal_name || publication.publisher || "Journal or publisher not recorded"}</span></p>
                  <p className="flex items-center gap-2"><CalendarDays className="size-3.5" /><span>{publication.year || publication.publication_date?.slice(0, 4) || "Publication date not recorded"}</span></p>
                  <p className="flex items-center gap-2"><BookOpenCheck className="size-3.5" /><span className="truncate">{publication.department_id ? departmentNames.get(publication.department_id) || "Department" : "School-wide research"}</span></p>
                  {publication.is_open_access ? <p className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400"><Unlock className="size-3.5" /> Open access</p> : null}
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="truncate text-xs text-muted-foreground">{publication.doi || "No DOI recorded"}</span>
                  <Button variant="ghost" size="sm" onClick={() => updateUrl("publication", publication.id)}>
                    Open record <ArrowRight className="ml-1 size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {!publicationsQuery.isPending && (publicationsQuery.data?.data.length ?? 0) === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed bg-background px-6 py-16 text-center">
            <BookOpenCheck className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 font-medium">No publications found</p>
            <p className="mt-1 text-sm text-muted-foreground">Change the workflow filter or add a new research output.</p>
          </div>
        ) : null}
      </section>
      <PublicationDialog
        publication={focused}
        open={createOpen || Boolean(focusedId)}
        onOpenChange={(open) => { if (!open) { setCreateOpen(false); updateUrl("publication"); } }}
        onSaved={async () => { await publicationsQuery.refetch(); }}
      />
    </SchoolWorkspace>
  );
}

function publicationDraft(publication: SchoolPublicationRecord): SchoolPublicationPayload {
  const {
    id: _id,
    status: _status,
    reviewer_comments: _reviewerComments,
    submitted_at: _submittedAt,
    reviewed_at: _reviewedAt,
    ...draft
  } = publication;
  return draft;
}

function PublicationDialog({
  publication,
  open,
  onOpenChange,
  onSaved,
}: {
  publication: SchoolPublicationRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => Promise<void>;
}) {
  const { can } = useSchoolPortal();
  const [values, setValues] = useState<SchoolPublicationPayload>(EMPTY);
  const [keywords, setKeywords] = useState("");
  const [error, setError] = useState("");
  const readOnly = Boolean(publication && !["draft"].includes(publication.status));
  useEffect(() => {
    if (!open) return;
    setValues(publication ? publicationDraft(publication) : EMPTY);
    setKeywords(publication?.keywords?.join(", ") || "");
    setError("");
  }, [open, publication]);
  const save = useMutation({
    mutationFn: () => {
      const payload = { ...values, keywords: keywords.split(",").map((item) => item.trim()).filter(Boolean) };
      return publication ? schoolPortalApi.publications.update(publication.id, payload) : schoolPortalApi.publications.create(payload);
    },
    onSuccess: async () => { await onSaved(); onOpenChange(false); },
    onError: (caught) => setError(caught instanceof Error ? caught.message : "Unable to save publication."),
  });
  const workflow = useMutation({
    mutationFn: (action: "submit" | "withdraw") => schoolPortalApi.publications.action(publication!.id, action),
    onSuccess: onSaved,
    onError: (caught) => setError(caught instanceof Error ? caught.message : "Publication workflow action failed."),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader><DialogTitle>{publication ? "Publication details" : "Add publication"}</DialogTitle><DialogDescription>School ownership is assigned by the server; associate an optional department and complete the scholarly metadata.</DialogDescription></DialogHeader>
        {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
        {publication?.reviewer_comments ? <Alert variant="destructive"><AlertTitle>Reviewer comments</AlertTitle><AlertDescription>{publication.reviewer_comments}</AlertDescription></Alert> : null}
        {readOnly ? <Alert><AlertDescription>This publication is {publication?.status.replaceAll("_", " ")} and cannot be edited. Withdraw a pending submission before making changes.</AlertDescription></Alert> : null}
        <fieldset disabled={readOnly} className="space-y-4 disabled:opacity-75">
          <section className="space-y-4 rounded-xl border p-4">
            <div><h3 className="text-sm font-semibold">Research identity</h3><p className="mt-1 text-xs text-muted-foreground">Classify the output and connect it to its school or department owner.</p></div>
            <Field label="Title" value={values.title} onChange={(title) => setValues((current) => ({ ...current, title }))} />
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Slug" value={values.slug} onChange={(slug) => setValues((current) => ({ ...current, slug }))} />
              <div className="space-y-2">
                <Label htmlFor="publication-department">Department</Label>
                <SchoolDepartmentSelect triggerId="publication-department" value={values.department_id} disabled={readOnly} onChange={(department_id) => setValues((current) => ({ ...current, department_id }))} />
              </div>
              <div className="space-y-2"><Label>Publication type</Label><Select value={values.publication_type ?? "journal_article"} onValueChange={(publication_type) => setValues((current) => ({ ...current, publication_type }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["journal_article", "conference_paper", "book", "book_chapter", "thesis", "report", "working_paper", "preprint"].map((item) => <SelectItem key={item} value={item}>{item.replaceAll("_", " ")}</SelectItem>)}</SelectContent></Select></div>
            </div>
          </section>
          <section className="space-y-4 rounded-xl border p-4">
            <div><h3 className="text-sm font-semibold">Publication reference</h3><p className="mt-1 text-xs text-muted-foreground">Record where and when the work appeared, including stable links.</p></div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Journal name" value={values.journal_name} onChange={(journal_name) => setValues((current) => ({ ...current, journal_name }))} />
              <Field label="Publisher" value={values.publisher} onChange={(publisher) => setValues((current) => ({ ...current, publisher }))} />
              <Field label="Publication date" type="date" value={values.publication_date} onChange={(publication_date) => setValues((current) => ({ ...current, publication_date }))} />
              <Field label="DOI" value={values.doi} onChange={(doi) => setValues((current) => ({ ...current, doi }))} />
              <Field label="Publication URL" value={values.url} onChange={(url) => setValues((current) => ({ ...current, url }))} />
              <Field label="PDF URL" value={values.pdf_url} onChange={(pdf_url) => setValues((current) => ({ ...current, pdf_url }))} />
            </div>
          </section>
          <section className="space-y-4 rounded-xl border p-4">
            <div><h3 className="text-sm font-semibold">Abstract & discovery</h3><p className="mt-1 text-xs text-muted-foreground">Help reviewers and readers understand and find this research output.</p></div>
            <div className="space-y-2"><Label htmlFor="publication-abstract">Abstract</Label><Textarea id="publication-abstract" rows={7} value={values.abstract ?? ""} onChange={(event) => setValues((current) => ({ ...current, abstract: event.target.value }))} /></div>
            <Field label="Keywords (comma separated)" value={keywords} onChange={setKeywords} />
            <div className="flex items-center justify-between rounded-lg border p-3"><div><Label htmlFor="open-access">Open access</Label><p className="mt-1 text-xs text-muted-foreground">The full publication is freely available to readers.</p></div><Switch id="open-access" checked={values.is_open_access ?? false} onCheckedChange={(is_open_access) => setValues((current) => ({ ...current, is_open_access }))} /></div>
          </section>
        </fieldset>
        <DialogFooter className="gap-2">
          {publication && can("school.publications.submit") && ["draft", "submitted", "under_review"].includes(publication.status) ? <Button variant="outline" disabled={workflow.isPending} onClick={() => workflow.mutate(publication.status === "draft" ? "submit" : "withdraw")}>{publication.status === "draft" ? "Submit for review" : "Withdraw"}</Button> : null}
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          {!readOnly && can("school.publications.manage") ? <Button disabled={!values.title || save.isPending} onClick={() => save.mutate()}>{save.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}Save publication</Button> : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value?: string | null; onChange: (value: string) => void; type?: string }) {
  const id = `publication-${label.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`;
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><Input id={id} type={type} value={value ?? ""} onChange={(event) => onChange(event.target.value)} /></div>;
}
