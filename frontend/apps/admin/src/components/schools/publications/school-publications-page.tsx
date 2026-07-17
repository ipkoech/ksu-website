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
import { BookOpen, Loader2, Pencil, Plus } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from "@ksu/ui/components";
import { useSchoolPortal } from "@/components/schools/school-portal-provider";

const EMPTY: SchoolPublicationPayload = {
  title: "",
  publication_type: "journal_article",
  is_open_access: false,
};

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
  const focused = publicationsQuery.data?.data.find((item) => item.id === focusedId) ?? null;
  const updateUrl = (key: string, value?: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <main className="space-y-5 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-medium text-primary">Research outputs</p><h1 className="text-2xl font-semibold tracking-tight">Publications</h1><p className="mt-1 text-sm text-muted-foreground">Author school publications and submit them to Research for review.</p></div>
        {can("school.publications.manage") ? <Button onClick={() => setCreateOpen(true)}><Plus className="mr-2 size-4" /> Add publication</Button> : null}
      </header>
      <Select value={status} onValueChange={(value) => updateUrl("status", value)}>
        <SelectTrigger className="w-52" aria-label="Publication status"><SelectValue /></SelectTrigger>
        <SelectContent>{["all", "draft", "submitted", "under_review", "accepted", "published", "retracted"].map((item) => <SelectItem key={item} value={item}>{item.replaceAll("_", " ")}</SelectItem>)}</SelectContent>
      </Select>
      {publicationsQuery.error ? <Alert variant="destructive"><AlertDescription>{publicationsQuery.error.message}</AlertDescription></Alert> : null}
      <div className="overflow-hidden rounded-lg border bg-background">
        <Table>
          <TableHeader><TableRow><TableHead>Publication</TableHead><TableHead>Department</TableHead><TableHead>Journal / publisher</TableHead><TableHead>Year</TableHead><TableHead>Status</TableHead><TableHead className="w-16" /></TableRow></TableHeader>
          <TableBody>
            {publicationsQuery.data?.data.map((publication) => (
              <TableRow key={publication.id}>
                <TableCell><div className="flex gap-3"><BookOpen className="mt-0.5 size-4 text-muted-foreground" /><div><p className="max-w-xl font-medium">{publication.title}</p><p className="text-xs text-muted-foreground">{publication.doi || publication.publication_type.replaceAll("_", " ")}</p></div></div></TableCell>
                <TableCell>{publication.department_id || "School-wide"}</TableCell>
                <TableCell>{publication.journal_name || publication.publisher || "—"}</TableCell>
                <TableCell>{publication.year || publication.publication_date?.slice(0, 4) || "—"}</TableCell>
                <TableCell><Badge variant={publication.status === "draft" ? "secondary" : "default"}>{publication.status.replaceAll("_", " ")}</Badge></TableCell>
                <TableCell><Button size="icon" variant="ghost" aria-label={`Open ${publication.title}`} onClick={() => updateUrl("publication", publication.id)}><Pencil className="size-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <PublicationDialog
        publication={focused}
        open={createOpen || Boolean(focusedId)}
        onOpenChange={(open) => { if (!open) { setCreateOpen(false); updateUrl("publication"); } }}
        onSaved={async () => { await publicationsQuery.refetch(); }}
      />
    </main>
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
          <Field label="Title" value={values.title} onChange={(title) => setValues((current) => ({ ...current, title }))} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Slug" value={values.slug} onChange={(slug) => setValues((current) => ({ ...current, slug }))} />
            <Field label="Department ID" value={values.department_id} onChange={(department_id) => setValues((current) => ({ ...current, department_id: department_id || null }))} />
            <div className="space-y-2"><Label>Publication type</Label><Select value={values.publication_type ?? "journal_article"} onValueChange={(publication_type) => setValues((current) => ({ ...current, publication_type }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["journal_article", "conference_paper", "book", "book_chapter", "thesis", "report", "working_paper", "preprint"].map((item) => <SelectItem key={item} value={item}>{item.replaceAll("_", " ")}</SelectItem>)}</SelectContent></Select></div>
            <Field label="Journal name" value={values.journal_name} onChange={(journal_name) => setValues((current) => ({ ...current, journal_name }))} />
            <Field label="Publisher" value={values.publisher} onChange={(publisher) => setValues((current) => ({ ...current, publisher }))} />
            <Field label="Publication date" type="date" value={values.publication_date} onChange={(publication_date) => setValues((current) => ({ ...current, publication_date }))} />
            <Field label="DOI" value={values.doi} onChange={(doi) => setValues((current) => ({ ...current, doi }))} />
            <Field label="Publication URL" value={values.url} onChange={(url) => setValues((current) => ({ ...current, url }))} />
            <Field label="PDF URL" value={values.pdf_url} onChange={(pdf_url) => setValues((current) => ({ ...current, pdf_url }))} />
          </div>
          <div className="space-y-2"><Label htmlFor="publication-abstract">Abstract</Label><Textarea id="publication-abstract" rows={7} value={values.abstract ?? ""} onChange={(event) => setValues((current) => ({ ...current, abstract: event.target.value }))} /></div>
          <Field label="Keywords (comma separated)" value={keywords} onChange={setKeywords} />
          <div className="flex items-center justify-between rounded-lg border p-3"><Label htmlFor="open-access">Open access</Label><Switch id="open-access" checked={values.is_open_access ?? false} onCheckedChange={(is_open_access) => setValues((current) => ({ ...current, is_open_access }))} /></div>
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
