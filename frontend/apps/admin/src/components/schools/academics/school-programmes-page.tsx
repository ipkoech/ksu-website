"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  schoolPortalApi,
  schoolPortalQueryKeys,
  type SchoolProgrammePayload,
  type SchoolProgrammeRecord,
} from "@ksu/api-client";
import { BookOpen, Loader2, Pencil, Plus, Search, Upload } from "lucide-react";
import {
  Alert,
  AlertDescription,
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
import { MediaPicker } from "@/components/media/media-picker";
import { useSchoolPortal } from "@/components/schools/school-portal-provider";
import { SchoolImportDialog } from "@/components/schools/imports/school-import-dialog";

const EMPTY: SchoolProgrammePayload = {
  name: "",
  code: "",
  slug: "",
  level: "undergraduate",
  mode_of_study: "full_time",
  duration: "",
  department_id: "",
  is_active: true,
  display_order: 100,
};

function programmeDraft(programme: SchoolProgrammeRecord): SchoolProgrammePayload {
  const { id: _id, department: _department, ...draft } = programme;
  return draft;
}

export function SchoolProgrammesPage() {
  const { school, can } = useSchoolPortal();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const page = Number(params.get("page") || 1);
  const search = params.get("search") || "";
  const level = params.get("level") || "all";
  const focusedId = params.get("programme");
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const programmesQuery = useQuery({
    queryKey: [...schoolPortalQueryKeys.programmes(school.id), { page, search, level }],
    queryFn: () => schoolPortalApi.programmes.list({ page, per_page: 20, search: search || undefined, level: level === "all" ? undefined : level }),
  });
  const focused = programmesQuery.data?.data.find((item) => item.id === focusedId) ?? null;
  const updateUrl = (key: string, value?: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <main className="space-y-5 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-medium text-primary">Academic offering</p><h1 className="text-2xl font-semibold tracking-tight">Programmes</h1><p className="mt-1 text-sm text-muted-foreground">Manage programme details, relationships, accreditation, media, and capacity.</p></div>
        <div className="flex gap-2">
          {can("school.programmes.bulk") ? <Button variant="outline" onClick={() => setImportOpen(true)}><Upload className="mr-2 size-4" /> Import</Button> : null}
          {can("school.programmes.create") ? <Button onClick={() => setCreateOpen(true)}><Plus className="mr-2 size-4" /> Add programme</Button> : null}
        </div>
      </header>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem]">
        <label className="relative"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="pl-9" defaultValue={search} placeholder="Search programmes" onKeyDown={(event) => event.key === "Enter" && updateUrl("search", event.currentTarget.value.trim())} /></label>
        <Select value={level} onValueChange={(value) => updateUrl("level", value)}><SelectTrigger aria-label="Programme level"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All levels</SelectItem><SelectItem value="certificate">Certificate</SelectItem><SelectItem value="diploma">Diploma</SelectItem><SelectItem value="undergraduate">Undergraduate</SelectItem><SelectItem value="masters">Masters</SelectItem><SelectItem value="doctorate">Doctorate</SelectItem></SelectContent></Select>
      </div>
      {programmesQuery.error ? <Alert variant="destructive"><AlertDescription>{programmesQuery.error.message}</AlertDescription></Alert> : null}
      <div className="overflow-hidden rounded-lg border bg-background">
        <Table>
          <TableHeader><TableRow><TableHead>Programme</TableHead><TableHead>Level & mode</TableHead><TableHead>Department</TableHead><TableHead>Accreditation</TableHead><TableHead>Status</TableHead><TableHead className="w-16" /></TableRow></TableHeader>
          <TableBody>
            {programmesQuery.data?.data.map((programme) => (
              <TableRow key={programme.id}>
                <TableCell><div className="flex items-center gap-3"><BookOpen className="size-4 text-muted-foreground" /><div><p className="font-medium">{programme.name}</p><p className="text-xs text-muted-foreground">{programme.code} · {programme.duration}</p></div></div></TableCell>
                <TableCell>{programme.level}<p className="text-xs text-muted-foreground">{programme.mode_of_study.replaceAll("_", " ")}</p></TableCell>
                <TableCell>{programme.department?.name || programme.department_id}</TableCell>
                <TableCell>{programme.accreditation_status || "Not recorded"}</TableCell>
                <TableCell><Badge variant={programme.is_active ? "default" : "secondary"}>{programme.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                <TableCell><Button variant="ghost" size="icon" aria-label={`Edit ${programme.name}`} onClick={() => updateUrl("programme", programme.id)}><Pencil className="size-4" /></Button></TableCell>
              </TableRow>
            ))}
            {!programmesQuery.isPending && programmesQuery.data?.data.length === 0 ? <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No programmes match these filters.</TableCell></TableRow> : null}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Page {programmesQuery.data?.meta.page ?? page} of {programmesQuery.data?.meta.pages ?? 1}</p><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => updateUrl("page", String(page - 1))}>Previous</Button><Button variant="outline" size="sm" disabled={page >= (programmesQuery.data?.meta.pages ?? 1)} onClick={() => updateUrl("page", String(page + 1))}>Next</Button></div></div>
      <ProgrammeDialog
        programme={focused}
        open={createOpen || Boolean(focusedId)}
        onOpenChange={(open) => { if (!open) { setCreateOpen(false); updateUrl("programme"); } }}
        onSaved={async () => { await queryClient.invalidateQueries({ queryKey: schoolPortalQueryKeys.programmes(school.id) }); }}
      />
      <SchoolImportDialog
        resource="programmes"
        open={importOpen}
        onOpenChange={setImportOpen}
        onPreview={async (rows) => (await schoolPortalApi.programmes.previewImport(rows)).data}
        onCommit={async (rows, mode, key) => (await schoolPortalApi.programmes.commitImport(rows, mode, key)).data}
        onComplete={async () => { await programmesQuery.refetch(); }}
      />
    </main>
  );
}

function ProgrammeDialog({
  programme,
  open,
  onOpenChange,
  onSaved,
}: {
  programme: SchoolProgrammeRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => Promise<void>;
}) {
  const [values, setValues] = useState<SchoolProgrammePayload>(EMPTY);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!open) return;
    setValues(programme ? programmeDraft(programme) : EMPTY);
    setError("");
  }, [programme, open]);
  const mutation = useMutation({
    mutationFn: () => programme ? schoolPortalApi.programmes.update(programme.id, values) : schoolPortalApi.programmes.create(values),
    onSuccess: async () => { await onSaved(); onOpenChange(false); },
    onError: (caught) => setError(caught instanceof Error ? caught.message : "Unable to save programme."),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader><DialogTitle>{programme ? "Edit programme" : "Add programme"}</DialogTitle><DialogDescription>Maintain programme identity, curriculum, relationships, intake, capacity, accreditation, and media.</DialogDescription></DialogHeader>
        {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Name" className="sm:col-span-2" value={values.name} onChange={(name) => setValues((current) => ({ ...current, name }))} />
          <Field label="Code" value={values.code} onChange={(code) => setValues((current) => ({ ...current, code }))} />
          <Field label="Slug" value={values.slug} onChange={(slug) => setValues((current) => ({ ...current, slug }))} />
          <Field label="Department ID" value={values.department_id} onChange={(department_id) => setValues((current) => ({ ...current, department_id }))} />
          <Field label="Duration" value={values.duration} onChange={(duration) => setValues((current) => ({ ...current, duration }))} />
          <div className="space-y-2"><Label>Level</Label><Select value={values.level} onValueChange={(level) => setValues((current) => ({ ...current, level }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["certificate", "diploma", "undergraduate", "masters", "doctorate"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Mode of study</Label><Select value={values.mode_of_study ?? "full_time"} onValueChange={(mode_of_study) => setValues((current) => ({ ...current, mode_of_study }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="full_time">Full time</SelectItem><SelectItem value="part_time">Part time</SelectItem><SelectItem value="online">Online</SelectItem><SelectItem value="blended">Blended</SelectItem></SelectContent></Select></div>
          <Field label="Credits required" type="number" value={values.credits_required?.toString()} onChange={(value) => setValues((current) => ({ ...current, credits_required: value ? Number(value) : null }))} />
          <Field label="Minimum students" type="number" value={values.min_students?.toString()} onChange={(value) => setValues((current) => ({ ...current, min_students: value ? Number(value) : null }))} />
          <Field label="Maximum students" type="number" value={values.max_students?.toString()} onChange={(value) => setValues((current) => ({ ...current, max_students: value ? Number(value) : null }))} />
          <Field label="Accreditation status" value={values.accreditation_status} onChange={(accreditation_status) => setValues((current) => ({ ...current, accreditation_status }))} />
          <Field label="Accrediting body" value={values.accrediting_body} onChange={(accrediting_body) => setValues((current) => ({ ...current, accrediting_body }))} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {(["about", "objectives", "entry_requirements", "career_prospects", "curriculum_overview"] as const).map((field) => <Area key={field} label={field.replaceAll("_", " ")} value={values[field]} onChange={(value) => setValues((current) => ({ ...current, [field]: value }))} />)}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <MediaPicker label="Cover image" value={values.cover_image_id} onChange={(cover_image_id) => setValues((current) => ({ ...current, cover_image_id }))} mediaType="image" accept="image/*" />
          <MediaPicker label="Programme brochure" value={values.brochure_id} onChange={(brochure_id) => setValues((current) => ({ ...current, brochure_id }))} mediaType="document" accept=".pdf" />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3"><Label htmlFor="programme-active">Active programme</Label><Switch id="programme-active" checked={values.is_active ?? true} onCheckedChange={(is_active) => setValues((current) => ({ ...current, is_active }))} /></div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={!values.name || !values.code || !values.slug || !values.department_id || !values.duration || mutation.isPending} onClick={() => mutation.mutate()}>{mutation.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}Save programme</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, onChange, type = "text", className = "" }: { label: string; value?: string | null; onChange: (value: string) => void; type?: string; className?: string }) {
  const id = `programme-${label.toLowerCase().replaceAll(" ", "-")}`;
  return <div className={`space-y-2 ${className}`}><Label htmlFor={id}>{label}</Label><Input id={id} type={type} value={value ?? ""} onChange={(event) => onChange(event.target.value)} /></div>;
}
function Area({ label, value, onChange }: { label: string; value?: string | null; onChange: (value: string) => void }) {
  const id = `programme-${label.replaceAll(" ", "-")}`;
  return <div className="space-y-2"><Label htmlFor={id} className="capitalize">{label}</Label><Textarea id={id} rows={4} value={value ?? ""} onChange={(event) => onChange(event.target.value)} /></div>;
}
