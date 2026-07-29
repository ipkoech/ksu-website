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
import {
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  CircleCheck,
  Clock3,
  GraduationCap,
  Layers3,
  Loader2,
  Pencil,
  Plus,
  Search,
  Upload,
  Users,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
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
  RichTextEditor,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@ksu/ui/components";
import { MediaPicker } from "@/components/media/media-picker";
import { useSchoolPortal } from "@/components/schools/school-portal-provider";
import { SchoolImportDialog } from "@/components/schools/imports/school-import-dialog";
import { SchoolDepartmentSelect } from "@/components/schools/shared/school-reference-selectors";
import {
  SchoolFilterBar,
  SchoolMetricGrid,
  SchoolWorkspace,
  SchoolWorkspaceHeader,
} from "@/components/schools/shared/school-workspace";

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
  const createRequested = params.get("action") === "create";
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
    <SchoolWorkspace>
      <SchoolWorkspaceHeader
        eyebrow="Academic offering"
        title="Programmes"
        description="Maintain the programmes students discover—from curriculum and entry requirements to accreditation and capacity."
        schoolName={school.name}
        icon={GraduationCap}
        actions={<>
          {can("school.programmes.bulk") ? <Button variant="outline" onClick={() => setImportOpen(true)}><Upload className="mr-2 size-4" /> Import</Button> : null}
          {can("school.programmes.manage") ? <Button onClick={() => setCreateOpen(true)}><Plus className="mr-2 size-4" /> Add programme</Button> : null}
        </>}
      />
      <SchoolMetricGrid items={[
        { label: "Programmes", value: programmesQuery.data?.meta.total ?? 0, detail: "In the school portfolio", icon: GraduationCap },
        { label: "Active", value: programmesQuery.data?.data.filter((item) => item.is_active).length ?? 0, detail: "Currently offered", icon: CircleCheck, tone: "success" },
        { label: "Study levels", value: new Set(programmesQuery.data?.data.map((item) => item.level) ?? []).size, detail: "Represented on this page", icon: Layers3, tone: "info" },
        { label: "Accredited", value: programmesQuery.data?.data.filter((item) => Boolean(item.accreditation_status)).length ?? 0, detail: "With status recorded", icon: Award, tone: "warning" },
      ]} />
      <SchoolFilterBar>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem]">
        <label className="relative"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="pl-9" defaultValue={search} placeholder="Search programmes" onKeyDown={(event) => event.key === "Enter" && updateUrl("search", event.currentTarget.value.trim())} /></label>
        <Select value={level} onValueChange={(value) => updateUrl("level", value)}><SelectTrigger aria-label="Programme level"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All levels</SelectItem><SelectItem value="certificate">Certificate</SelectItem><SelectItem value="diploma">Diploma</SelectItem><SelectItem value="undergraduate">Undergraduate</SelectItem><SelectItem value="masters">Masters</SelectItem><SelectItem value="doctorate">Doctorate</SelectItem></SelectContent></Select>
      </div>
      </SchoolFilterBar>
      {programmesQuery.error ? <Alert variant="destructive"><AlertDescription>{programmesQuery.error.message}</AlertDescription></Alert> : null}
      <section className="space-y-5">
        {Array.from(
          new Set((programmesQuery.data?.data ?? []).map((programme) => programme.level)),
        ).map((programmeLevel) => {
          const programmes = programmesQuery.data?.data.filter((programme) => programme.level === programmeLevel) ?? [];
          return (
            <div key={programmeLevel}>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold capitalize">{programmeLevel.replaceAll("_", " ")}</h2>
                  <p className="text-xs text-muted-foreground">{programmes.length} programme{programmes.length === 1 ? "" : "s"} in this study level</p>
                </div>
                <Badge variant="secondary">{programmes.length}</Badge>
              </div>
              <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                {programmes.map((programme) => (
                  <Card key={programme.id} className="group overflow-hidden shadow-sm transition-colors duration-200 hover:border-primary/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <span className="rounded-xl bg-primary/10 p-2.5 text-primary"><BookOpen className="size-5" /></span>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex flex-wrap gap-1.5">
                            <Badge variant="outline">{programme.code}</Badge>
                            <Badge variant={programme.is_active ? "default" : "secondary"}>{programme.is_active ? "Active" : "Inactive"}</Badge>
                          </div>
                          <CardTitle className="line-clamp-2 text-base leading-6">{programme.name}</CardTitle>
                        </div>
                        <Button variant="ghost" size="icon" aria-label={`Edit ${programme.name}`} onClick={() => updateUrl("programme", programme.id)}>
                          <Pencil className="size-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
                        {programme.about || "Add a programme overview to help prospective students understand this offering."}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg bg-muted/50 p-3">
                          <Clock3 className="mb-1.5 size-4 text-primary" />
                          <p className="font-medium">{programme.duration}</p>
                          <p className="mt-0.5 text-muted-foreground">{programme.mode_of_study.replaceAll("_", " ")}</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-3">
                          <Users className="mb-1.5 size-4 text-primary" />
                          <p className="font-medium">{programme.max_students ? `Up to ${programme.max_students}` : "Open capacity"}</p>
                          <p className="mt-0.5 text-muted-foreground">Student capacity</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-xs text-muted-foreground">
                        <p className="flex items-center gap-2"><Building2 className="size-3.5" /><span className="truncate">{programme.department?.name || "Department not resolved"}</span></p>
                        <p className="flex items-center gap-2"><Award className="size-3.5" /><span className="truncate">{programme.accreditation_status || "Accreditation not recorded"}</span></p>
                      </div>
                      <div className="flex items-center justify-between border-t pt-3">
                        <Badge variant="outline" className="capitalize">{programme.level.replaceAll("_", " ")}</Badge>
                        <Button variant="ghost" size="sm" onClick={() => updateUrl("programme", programme.id)}>
                          Manage <ArrowRight className="ml-1 size-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
        {!programmesQuery.isPending && (programmesQuery.data?.data.length ?? 0) === 0 ? (
          <div className="rounded-xl border border-dashed bg-background px-6 py-16 text-center">
            <GraduationCap className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 font-medium">No programmes found</p>
            <p className="mt-1 text-sm text-muted-foreground">Change the filters or add a programme to this school portfolio.</p>
          </div>
        ) : null}
      </section>
      <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Page {programmesQuery.data?.meta.page ?? page} of {programmesQuery.data?.meta.pages ?? 1}</p><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => updateUrl("page", String(page - 1))}>Previous</Button><Button variant="outline" size="sm" disabled={page >= (programmesQuery.data?.meta.pages ?? 1)} onClick={() => updateUrl("page", String(page + 1))}>Next</Button></div></div>
      <ProgrammeDialog
        programme={focused}
        open={createOpen || Boolean(focusedId) || createRequested}
        onOpenChange={(open) => { if (!open) { setCreateOpen(false); updateUrl(createRequested ? "action" : "programme"); } }}
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
    </SchoolWorkspace>
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
        <section className="space-y-4 rounded-xl border p-4">
          <div><h3 className="text-sm font-semibold">Programme identity & delivery</h3><p className="mt-1 text-xs text-muted-foreground">Define where the programme sits and how students complete it.</p></div>
          <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Name" className="sm:col-span-2" value={values.name} onChange={(name) => setValues((current) => ({ ...current, name }))} />
          <Field label="Code" value={values.code} onChange={(code) => setValues((current) => ({ ...current, code }))} />
          <Field label="Slug" value={values.slug} onChange={(slug) => setValues((current) => ({ ...current, slug }))} />
          <div className="space-y-2">
            <Label htmlFor="programme-department">Department</Label>
            <SchoolDepartmentSelect
              triggerId="programme-department"
              allowSchoolWide={false}
              value={values.department_id}
              onChange={(department_id) => setValues((current) => ({ ...current, department_id: department_id ?? "" }))}
            />
          </div>
          <Field label="Duration" value={values.duration} onChange={(duration) => setValues((current) => ({ ...current, duration }))} />
          <div className="space-y-2"><Label>Level</Label><Select value={values.level} onValueChange={(level) => setValues((current) => ({ ...current, level }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["certificate", "diploma", "undergraduate", "masters", "doctorate"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Mode of study</Label><Select value={values.mode_of_study ?? "full_time"} onValueChange={(mode_of_study) => setValues((current) => ({ ...current, mode_of_study }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="full_time">Full time</SelectItem><SelectItem value="part_time">Part time</SelectItem><SelectItem value="online">Online</SelectItem><SelectItem value="blended">Blended</SelectItem></SelectContent></Select></div>
          <Field label="Credits required" type="number" value={values.credits_required?.toString()} onChange={(value) => setValues((current) => ({ ...current, credits_required: value ? Number(value) : null }))} />
          <Field label="Minimum students" type="number" value={values.min_students?.toString()} onChange={(value) => setValues((current) => ({ ...current, min_students: value ? Number(value) : null }))} />
          <Field label="Maximum students" type="number" value={values.max_students?.toString()} onChange={(value) => setValues((current) => ({ ...current, max_students: value ? Number(value) : null }))} />
          <Field label="Accreditation status" value={values.accreditation_status} onChange={(accreditation_status) => setValues((current) => ({ ...current, accreditation_status }))} />
          <Field label="Accrediting body" value={values.accrediting_body} onChange={(accrediting_body) => setValues((current) => ({ ...current, accrediting_body }))} />
          </div>
        </section>
        <section className="space-y-4 rounded-xl border p-4">
          <div><h3 className="text-sm font-semibold">Student-facing programme information</h3><p className="mt-1 text-xs text-muted-foreground">Explain outcomes, requirements, curriculum and career pathways.</p></div>
          <div className="grid gap-4 sm:grid-cols-2">
            {(["about", "objectives", "entry_requirements", "career_prospects", "curriculum_overview"] as const).map((field) => <Area key={field} label={field.replaceAll("_", " ")} value={values[field]} onChange={(value) => setValues((current) => ({ ...current, [field]: value }))} />)}
          </div>
        </section>
        <section className="space-y-4 rounded-xl border p-4">
          <div><h3 className="text-sm font-semibold">Media & availability</h3><p className="mt-1 text-xs text-muted-foreground">Attach discovery assets and control whether the programme is currently offered.</p></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <MediaPicker label="Cover image" value={values.cover_image_id} onChange={(cover_image_id) => setValues((current) => ({ ...current, cover_image_id }))} mediaType="image" accept="image/*" />
            <MediaPicker label="Programme brochure" value={values.brochure_id} onChange={(brochure_id) => setValues((current) => ({ ...current, brochure_id }))} mediaType="document" accept=".pdf" />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3"><div><Label htmlFor="programme-active">Active programme</Label><p className="mt-1 text-xs text-muted-foreground">Available in the school’s current academic portfolio.</p></div><Switch id="programme-active" checked={values.is_active ?? true} onCheckedChange={(is_active) => setValues((current) => ({ ...current, is_active }))} /></div>
        </section>
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
  return <div className="space-y-2"><Label htmlFor={id} className="capitalize">{label}</Label><RichTextEditor value={value ?? ""} onChange={onChange} toolbar="simple" minHeight="10rem" maxHeight="24rem" /></div>;
}
