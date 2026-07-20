"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  schoolPortalApi,
  schoolPortalQueryKeys,
  type SchoolDepartmentPayload,
  type SchoolDepartmentRecord,
} from "@ksu/api-client";
import {
  ArrowRight,
  Building2,
  CircleCheck,
  Eye,
  GraduationCap,
  Layers3,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  Upload,
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
import { SchoolTeamSelect } from "@/components/schools/shared/school-reference-selectors";
import {
  SchoolFilterBar,
  SchoolMetricGrid,
  SchoolWorkspace,
  SchoolWorkspaceHeader,
} from "@/components/schools/shared/school-workspace";

const EMPTY: SchoolDepartmentPayload = {
  name: "",
  slug: "",
  code: "",
  department_type: "academic",
  is_public: false,
  allows_staff_management: true,
  display_order: 100,
};

function departmentDraft(department: SchoolDepartmentRecord): SchoolDepartmentPayload {
  const { id: _id, is_active, ...draft } = department;
  return { ...draft, is_active };
}

export function SchoolDepartmentsPage() {
  const { school, can } = useSchoolPortal();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const page = Number(params.get("page") || 1);
  const search = params.get("search") || "";
  const focusedId = params.get("department");
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const departmentsQuery = useQuery({
    queryKey: [...schoolPortalQueryKeys.departments(school.id), { page, search }],
    queryFn: () => schoolPortalApi.departments.list({ page, per_page: 20, search: search || undefined }),
  });
  const programmesQuery = useQuery({
    queryKey: [...schoolPortalQueryKeys.programmes(school.id), { purpose: "department-counts" }],
    queryFn: () => schoolPortalApi.programmes.list({ page: 1, per_page: 100 }),
    staleTime: 5 * 60 * 1000,
  });
  const programmeCounts = new Map<string, number>();
  for (const programme of programmesQuery.data?.data ?? []) {
    programmeCounts.set(programme.department_id, (programmeCounts.get(programme.department_id) ?? 0) + 1);
  }
  const focused = departmentsQuery.data?.data.find((item) => item.id === focusedId) ?? null;
  const updateUrl = (key: string, value?: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <SchoolWorkspace>
      <SchoolWorkspaceHeader
        eyebrow="Academic structure"
        title="Departments"
        description="Shape your school structure, leadership, contact details and the department profiles seen by the public."
        schoolName={school.name}
        icon={Building2}
        actions={<>
          {can("school.departments.bulk") ? <Button variant="outline" onClick={() => setImportOpen(true)}><Upload className="mr-2 size-4" /> Import</Button> : null}
          {can("school.departments.manage") ? <Button onClick={() => setCreateOpen(true)}><Plus className="mr-2 size-4" /> Add department</Button> : null}
        </>}
      />
      <SchoolMetricGrid items={[
        { label: "Departments", value: departmentsQuery.data?.meta.total ?? 0, detail: "Owned by this school", icon: Building2 },
        { label: "Active", value: departmentsQuery.data?.data.filter((item) => item.is_active).length ?? 0, detail: "On this page", icon: CircleCheck, tone: "success" },
        { label: "Public profiles", value: departmentsQuery.data?.data.filter((item) => item.is_public).length ?? 0, detail: "Visible online", icon: Eye, tone: "info" },
        { label: "Department types", value: new Set(departmentsQuery.data?.data.map((item) => item.department_type) ?? []).size, detail: "Academic, service or research", icon: Layers3, tone: "warning" },
      ]} />
      <SchoolFilterBar>
      <label className="relative block max-w-xl">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input className="pl-9" defaultValue={search} placeholder="Search departments" onKeyDown={(event) => event.key === "Enter" && updateUrl("search", event.currentTarget.value.trim())} />
      </label>
      </SchoolFilterBar>
      {departmentsQuery.error ? <Alert variant="destructive"><AlertDescription>{departmentsQuery.error.message}</AlertDescription></Alert> : null}
      <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {departmentsQuery.data?.data.map((department) => {
          const completeness = [
            department.about,
            department.email,
            department.phone,
            department.office_location,
            department.head_id,
            department.cover_image_id,
          ].filter(Boolean).length;
          return (
            <Card key={department.id} className="group overflow-hidden shadow-sm transition-colors duration-200 hover:border-primary/30">
              <div className={`h-1 ${department.is_public ? "bg-emerald-500" : "bg-amber-400"}`} />
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <span className="rounded-xl bg-primary/10 p-2.5 text-primary"><Building2 className="size-5" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{department.code}</Badge>
                      <Badge variant="secondary" className="capitalize">{department.department_type}</Badge>
                    </div>
                    <CardTitle className="line-clamp-2 text-base leading-6">{department.name}</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" aria-label={`Edit ${department.name}`} onClick={() => updateUrl("department", department.id)}>
                    <Pencil className="size-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
                  {department.about || "Add an overview to help students and visitors understand this department."}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-lg font-semibold">{programmeCounts.get(department.id) ?? 0}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground"><GraduationCap className="size-3" /> Programmes</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-lg font-semibold">{Math.round((completeness / 6) * 100)}%</p>
                    <p className="text-xs text-muted-foreground">Profile readiness</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2"><Mail className="size-3.5" /><span className="truncate">{department.email || "No email recorded"}</span></p>
                  <p className="flex items-center gap-2"><Phone className="size-3.5" /><span>{department.phone || "No phone recorded"}</span></p>
                  <p className="flex items-center gap-2"><MapPin className="size-3.5" /><span className="truncate">{department.office_location || "No office location"}</span></p>
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <div className="flex gap-1.5">
                    <Badge variant={department.is_active ? "default" : "secondary"}>{department.is_active ? "Active" : "Inactive"}</Badge>
                    <Badge variant="outline">{department.is_public ? "Public" : "Internal"}</Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => updateUrl("department", department.id)}>
                    Manage <ArrowRight className="ml-1 size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {!departmentsQuery.isPending && (departmentsQuery.data?.data.length ?? 0) === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed bg-background px-6 py-16 text-center">
            <Building2 className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 font-medium">No departments found</p>
            <p className="mt-1 text-sm text-muted-foreground">Change the search or add the school’s first department.</p>
          </div>
        ) : null}
      </section>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Page {departmentsQuery.data?.meta.page ?? page} of {departmentsQuery.data?.meta.pages ?? 1}</p>
        <div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => updateUrl("page", String(page - 1))}>Previous</Button><Button variant="outline" size="sm" disabled={page >= (departmentsQuery.data?.meta.pages ?? 1)} onClick={() => updateUrl("page", String(page + 1))}>Next</Button></div>
      </div>
      <DepartmentDialog
        department={focused}
        open={createOpen || Boolean(focusedId)}
        onOpenChange={(open) => { if (!open) { setCreateOpen(false); updateUrl("department"); } }}
        onSaved={async () => { await queryClient.invalidateQueries({ queryKey: schoolPortalQueryKeys.departments(school.id) }); }}
      />
      <SchoolImportDialog
        resource="departments"
        open={importOpen}
        onOpenChange={setImportOpen}
        onPreview={async (rows) => (await schoolPortalApi.departments.previewImport(rows)).data}
        onCommit={async (rows, mode, key) => (await schoolPortalApi.departments.commitImport(rows, mode, key)).data}
        onComplete={async () => { await departmentsQuery.refetch(); }}
      />
    </SchoolWorkspace>
  );
}

function DepartmentDialog({
  department,
  open,
  onOpenChange,
  onSaved,
}: {
  department: SchoolDepartmentRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => Promise<void>;
}) {
  const [values, setValues] = useState<SchoolDepartmentPayload>(EMPTY);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!open) return;
    setValues(department ? departmentDraft(department) : EMPTY);
    setError("");
  }, [department, open]);
  const mutation = useMutation({
    mutationFn: () => department ? schoolPortalApi.departments.update(department.id, values) : schoolPortalApi.departments.create(values),
    onSuccess: async () => { await onSaved(); onOpenChange(false); },
    onError: (caught) => setError(caught instanceof Error ? caught.message : "Unable to save department."),
  });
  const deactivate = useMutation({
    mutationFn: () => schoolPortalApi.departments.update(department!.id, { is_active: false }),
    onSuccess: async () => { await onSaved(); onOpenChange(false); },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader><DialogTitle>{department ? "Edit department" : "Add department"}</DialogTitle><DialogDescription>Maintain identity, leadership, contacts, content, media, and public state.</DialogDescription></DialogHeader>
        {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
        <section className="space-y-4 rounded-xl border p-4">
          <div><h3 className="text-sm font-semibold">Department identity</h3><p className="mt-1 text-xs text-muted-foreground">Set the official name, code, URL and organisational type.</p></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" value={values.name} onChange={(name) => setValues((current) => ({ ...current, name }))} />
            <Field label="Code" value={values.code} onChange={(code) => setValues((current) => ({ ...current, code }))} />
            <Field label="Slug" value={values.slug} onChange={(slug) => setValues((current) => ({ ...current, slug }))} />
            <div className="space-y-2"><Label>Department type</Label><Select value={values.department_type ?? "academic"} onValueChange={(department_type) => setValues((current) => ({ ...current, department_type }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="academic">Academic</SelectItem><SelectItem value="service">Service</SelectItem><SelectItem value="research">Research</SelectItem></SelectContent></Select></div>
          </div>
        </section>
        <section className="space-y-4 rounded-xl border p-4">
          <div><h3 className="text-sm font-semibold">Leadership & contact</h3><p className="mt-1 text-xs text-muted-foreground">Connect responsible staff and make the department easy to reach.</p></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="department-head">Department head</Label>
              <SchoolTeamSelect triggerId="department-head" valueMode="person" value={values.head_id} placeholder="Select department head" roles={["dean", "deputy_dean", "cod", "hod", "lecturer"]} onChange={(head_id) => setValues((current) => ({ ...current, head_id }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department-postgraduate-coordinator">Postgraduate coordinator</Label>
              <SchoolTeamSelect triggerId="department-postgraduate-coordinator" valueMode="person" value={values.postgraduate_coordinator_id} placeholder="Select postgraduate coordinator" roles={["deputy_dean", "cod", "hod", "coordinator", "lecturer"]} onChange={(postgraduate_coordinator_id) => setValues((current) => ({ ...current, postgraduate_coordinator_id }))} />
            </div>
            <Field label="Email" value={values.email} onChange={(email) => setValues((current) => ({ ...current, email }))} />
            <Field label="Phone" value={values.phone} onChange={(phone) => setValues((current) => ({ ...current, phone }))} />
            <Field label="Office location" value={values.office_location} onChange={(office_location) => setValues((current) => ({ ...current, office_location }))} />
            <MediaPicker label="Cover image" value={values.cover_image_id} onChange={(cover_image_id) => setValues((current) => ({ ...current, cover_image_id }))} mediaType="image" accept="image/*" />
          </div>
        </section>
        <section className="space-y-4 rounded-xl border p-4">
          <div><h3 className="text-sm font-semibold">Public department profile</h3><p className="mt-1 text-xs text-muted-foreground">Describe the department’s purpose and strategic direction.</p></div>
          <Area label="About" value={values.about} onChange={(about) => setValues((current) => ({ ...current, about }))} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Area label="Mission" value={values.mission} onChange={(mission) => setValues((current) => ({ ...current, mission }))} />
            <Area label="Vision" value={values.vision} onChange={(vision) => setValues((current) => ({ ...current, vision }))} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3"><div><Label htmlFor="department-public">Public profile</Label><p className="mt-1 text-xs text-muted-foreground">Show this department on the public university website.</p></div><Switch id="department-public" checked={values.is_public ?? false} onCheckedChange={(is_public) => setValues((current) => ({ ...current, is_public }))} /></div>
        </section>
        <DialogFooter className="gap-2">
          {department?.is_active ? <Button variant="destructive" onClick={() => deactivate.mutate()}>Deactivate</Button> : null}
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!values.name || !values.slug || !values.code || mutation.isPending} onClick={() => mutation.mutate()}>{mutation.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}Save department</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, onChange }: { label: string; value?: string | null; onChange: (value: string) => void }) {
  const id = `department-${label.toLowerCase().replaceAll(" ", "-")}`;
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><Input id={id} value={value ?? ""} onChange={(event) => onChange(event.target.value)} /></div>;
}
function Area({ label, value, onChange }: { label: string; value?: string | null; onChange: (value: string) => void }) {
  const id = `department-${label.toLowerCase()}`;
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><RichTextEditor value={value ?? ""} onChange={onChange} toolbar="simple" minHeight="9rem" maxHeight="22rem" /></div>;
}
