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
import { Building2, CircleCheck, Eye, Layers3, Loader2, Pencil, Plus, Search, Upload } from "lucide-react";
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
      <div className="overflow-x-auto rounded-xl border bg-background shadow-sm">
        <Table className="min-w-[760px]">
          <TableHeader><TableRow><TableHead>Department</TableHead><TableHead>Type</TableHead><TableHead>Contact</TableHead><TableHead>Status</TableHead><TableHead className="w-16" /></TableRow></TableHeader>
          <TableBody>
            {departmentsQuery.data?.data.map((department) => (
              <TableRow key={department.id}>
                <TableCell><div className="flex items-center gap-3"><Building2 className="size-4 text-muted-foreground" /><div><p className="font-medium">{department.name}</p><p className="text-xs text-muted-foreground">{department.code}</p></div></div></TableCell>
                <TableCell>{department.department_type}</TableCell>
                <TableCell><p>{department.email || "—"}</p><p className="text-xs text-muted-foreground">{department.office_location}</p></TableCell>
                <TableCell><div className="flex gap-1"><Badge variant={department.is_active ? "default" : "secondary"}>{department.is_active ? "Active" : "Inactive"}</Badge>{department.is_public ? <Badge variant="outline">Public</Badge> : null}</div></TableCell>
                <TableCell><Button variant="ghost" size="icon" aria-label={`Edit ${department.name}`} onClick={() => updateUrl("department", department.id)}><Pencil className="size-4" /></Button></TableCell>
              </TableRow>
            ))}
            {!departmentsQuery.isPending && departmentsQuery.data?.data.length === 0 ? <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground">No departments match these filters.</TableCell></TableRow> : null}
          </TableBody>
        </Table>
      </div>
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
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" value={values.name} onChange={(name) => setValues((current) => ({ ...current, name }))} />
          <Field label="Code" value={values.code} onChange={(code) => setValues((current) => ({ ...current, code }))} />
          <Field label="Slug" value={values.slug} onChange={(slug) => setValues((current) => ({ ...current, slug }))} />
          <div className="space-y-2"><Label>Department type</Label><Select value={values.department_type ?? "academic"} onValueChange={(department_type) => setValues((current) => ({ ...current, department_type }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="academic">Academic</SelectItem><SelectItem value="service">Service</SelectItem><SelectItem value="research">Research</SelectItem></SelectContent></Select></div>
          <div className="space-y-2">
            <Label htmlFor="department-head">Department head</Label>
            <SchoolTeamSelect
              triggerId="department-head"
              valueMode="person"
              value={values.head_id}
              placeholder="Select department head"
              roles={["dean", "deputy_dean", "cod", "hod", "lecturer"]}
              onChange={(head_id) => setValues((current) => ({ ...current, head_id }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department-postgraduate-coordinator">Postgraduate coordinator</Label>
            <SchoolTeamSelect
              triggerId="department-postgraduate-coordinator"
              valueMode="person"
              value={values.postgraduate_coordinator_id}
              placeholder="Select postgraduate coordinator"
              roles={["deputy_dean", "cod", "hod", "coordinator", "lecturer"]}
              onChange={(postgraduate_coordinator_id) => setValues((current) => ({ ...current, postgraduate_coordinator_id }))}
            />
          </div>
          <Field label="Email" value={values.email} onChange={(email) => setValues((current) => ({ ...current, email }))} />
          <Field label="Phone" value={values.phone} onChange={(phone) => setValues((current) => ({ ...current, phone }))} />
          <Field label="Office location" value={values.office_location} onChange={(office_location) => setValues((current) => ({ ...current, office_location }))} />
          <MediaPicker label="Cover image" value={values.cover_image_id} onChange={(cover_image_id) => setValues((current) => ({ ...current, cover_image_id }))} mediaType="image" accept="image/*" />
        </div>
        <Area label="About" value={values.about} onChange={(about) => setValues((current) => ({ ...current, about }))} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Area label="Mission" value={values.mission} onChange={(mission) => setValues((current) => ({ ...current, mission }))} />
          <Area label="Vision" value={values.vision} onChange={(vision) => setValues((current) => ({ ...current, vision }))} />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3"><Label htmlFor="department-public">Public profile</Label><Switch id="department-public" checked={values.is_public ?? false} onCheckedChange={(is_public) => setValues((current) => ({ ...current, is_public }))} /></div>
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
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><Textarea id={id} rows={4} value={value ?? ""} onChange={(event) => onChange(event.target.value)} /></div>;
}
