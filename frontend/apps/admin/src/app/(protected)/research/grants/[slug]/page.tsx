"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@ksu/ui";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  RichTextEditor,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@ksu/ui/components";
import { Building2, CalendarDays, Edit3, Eye, EyeOff, FileText, HandCoins, ImageIcon, Star, StarOff, Trash2 } from "lucide-react";
import { researchServiceApi, type ResearchGenericRecord, type ResearchGrantPayload } from "@ksu/api-client";
import { MediaPicker } from "@/components/media";
import { EntityPicker } from "@/components/relationships/entity-picker";
import { relationshipAdapters } from "@/components/relationships/relationship-adapters";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ResearchDetailGuide } from "../../_components/research-guidance";
import { BindableRecordsCard, RelatedRecordsCard, RelatedRecordsGrid } from "../../_components/research-detail-relationships";
import { formatFundingDate, labelize, MoneyValue, StatusBadge } from "../../fundings/_components/funding-workspace";

type GrantEditValues = Record<string, string | boolean>;

type GrantActionConfirmation = {
  title: string;
  description: string;
  confirmText: string;
  variant?: "default" | "warning" | "destructive" | "success";
  payload?: Partial<ResearchGrantPayload>;
  deleteRecord?: boolean;
};

type GrantEditField = {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "datetime" | "richtext" | "boolean" | "funder" | "media";
  required?: boolean;
  placeholder?: string;
  mediaType?: string;
  accept?: string;
  uploadRole?: string;
};

type GrantEditGroup = {
  title: string;
  description: string;
  fields: GrantEditField[];
};

const GRANT_EDIT_GROUPS: GrantEditGroup[] = [
  {
    title: "Identity",
    description: "Core grant naming, type, and internal classification.",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "code", label: "Code", type: "text" },
      { name: "grant_type", label: "Grant type", type: "text", placeholder: "internal" },
      { name: "category", label: "Category", type: "text", placeholder: "research" },
      { name: "status", label: "Status", type: "text", placeholder: "draft" },
    ],
  },
  {
    title: "Funder and Contact",
    description: "Attach a real funder record and keep fallback contact text when needed.",
    fields: [
      { name: "funder_id", label: "Funder", type: "funder" },
      { name: "funder_name", label: "Fallback funder name", type: "text" },
      { name: "contact_name", label: "Contact name", type: "text" },
      { name: "contact_email", label: "Contact email", type: "text" },
      { name: "contact_phone", label: "Contact phone", type: "text" },
    ],
  },
  {
    title: "Funding Amounts",
    description: "Budget values and award range used in reporting and public calls.",
    fields: [
      { name: "total_budget", label: "Total budget", type: "number" },
      { name: "min_award", label: "Minimum award", type: "number" },
      { name: "max_award", label: "Maximum award", type: "number" },
      { name: "currency", label: "Currency", type: "text", placeholder: "KES" },
      { name: "number_of_awards", label: "Number of awards", type: "number" },
    ],
  },
  {
    title: "Dates",
    description: "Announcement, application, review, award, and project schedule.",
    fields: [
      { name: "announcement_date", label: "Announcement date", type: "date" },
      { name: "open_date", label: "Open date", type: "date" },
      { name: "deadline", label: "Deadline", type: "datetime" },
      { name: "review_start_date", label: "Review start", type: "date" },
      { name: "award_date", label: "Award date", type: "date" },
      { name: "project_start_date", label: "Project start", type: "date" },
      { name: "project_end_date", label: "Project end", type: "date" },
    ],
  },
  {
    title: "Content",
    description: "Narrative fields rendered with the rich text editor.",
    fields: [
      { name: "summary", label: "Summary", type: "richtext" },
      { name: "description", label: "Description", type: "richtext" },
      { name: "objectives", label: "Objectives", type: "richtext" },
      { name: "eligibility", label: "Eligibility", type: "richtext" },
      { name: "focus_areas", label: "Focus areas", type: "richtext" },
      { name: "requirements", label: "Requirements", type: "richtext" },
    ],
  },
  {
    title: "Media and Documents",
    description: "Visual assets for public grant presentation.",
    fields: [
      { name: "cover_image_id", label: "Cover image", type: "media", mediaType: "image", accept: "image/*", uploadRole: "cover_image" },
      { name: "logo_id", label: "Funder logo", type: "media", mediaType: "image", accept: "image/*", uploadRole: "logo" },
      { name: "external_url", label: "External URL", type: "text" },
      { name: "application_url", label: "Application URL", type: "text" },
    ],
  },
  {
    title: "Visibility",
    description: "Admin and featured-state controls.",
    fields: [
      { name: "is_active", label: "Active", type: "boolean" },
      { name: "is_featured", label: "Featured", type: "boolean" },
    ],
  },
];

const GRANT_EDIT_FIELDS = GRANT_EDIT_GROUPS.flatMap((group) => group.fields);

export default function ResearchGrantDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const grantQuery = useQuery({
    queryKey: ["research", "grants", "detail", slug],
    queryFn: async () => {
      const response = await researchServiceApi.grants.getBySlug(slug, {
        include: "funder",
      });
      return response.data ?? null;
    },
    enabled: Boolean(slug),
  });

  if (grantQuery.isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading grant...</div>;
  }

  if (grantQuery.isError || !grantQuery.data) {
    return <div className="p-6 text-sm text-destructive">Unable to load grant.</div>;
  }

  return <GrantDetail grant={grantQuery.data} />;
}

function GrantDetail({ grant }: { grant: ResearchGenericRecord }) {
  const grantId = String(grant.id);

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <ResearchDetailGuide title="Grant" status={grant.status} isPublic={grant.is_public} />
        <GrantDetailActions grant={grant} />
      </div>

      <Card>
        <CardContent className="grid gap-6 p-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-normal">{grant.title ?? "Untitled grant"}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{[grant.code, labelize(String(grant.grant_type ?? "")), labelize(String(grant.category ?? ""))].filter(Boolean).join(" · ")}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge value={String(grant.status ?? "")} />
                {grant.is_featured ? <Badge variant="outline">Featured</Badge> : null}
                {grant.is_active === false ? <Badge variant="destructive">Inactive</Badge> : <Badge variant="secondary">Active</Badge>}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <GrantMetric icon={<HandCoins className="h-4 w-4" />} label="Budget" value={<MoneyValue amount={grant.total_budget ?? grant.max_award} currency={String(grant.currency ?? "KES")} />} />
              <GrantMetric icon={<CalendarDays className="h-4 w-4" />} label="Deadline" value={formatFundingDate(String(grant.deadline ?? "")) || "No deadline"} />
              <GrantMetric icon={<Building2 className="h-4 w-4" />} label="Funder" value={<GrantFunderChip grant={grant} />} />
              <GrantMetric icon={<FileText className="h-4 w-4" />} label="Awards" value={grant.number_of_awards ? String(grant.number_of_awards) : "Not set"} />
            </div>
            {grant.summary ? <p className="max-w-4xl text-sm leading-6 text-muted-foreground">{String(grant.summary).replace(/<[^>]*>/g, "")}</p> : null}
          </div>
          <div className="rounded-md border bg-muted/20 p-3">
            <div className="flex aspect-video items-center justify-center rounded-md border bg-background text-muted-foreground">
              {grant.cover_image_id ? <ImageIcon className="h-8 w-8" /> : <span className="text-xs">No cover image</span>}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <Fact label="Open" value={formatFundingDate(String(grant.open_date ?? "")) || "Not set"} />
              <Fact label="Award" value={formatFundingDate(String(grant.award_date ?? "")) || "Not set"} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <div className="overflow-x-auto rounded-lg border bg-background p-1">
          <TabsList className="h-auto min-w-max bg-transparent p-0">
            {["Overview", "Funder", "Guidelines", "Applications", "Reviews", "Reports", "Projects", "Themes", "Media"].map((tab) => (
              <TabsTrigger key={tab} value={tab.toLowerCase()} className="rounded-md px-3 py-2">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent value="overview"><GrantOverview grant={grant} /></TabsContent>
        <TabsContent value="funder"><GrantFunderPanel grant={grant} /></TabsContent>
        <TabsContent value="guidelines"><RelatedRecordsCard title="Guidelines" queryKey={["research", "grants", grantId, "guidelines"]} queryFn={() => researchServiceApi.grantGuidelines.list({ page: 1, per_page: 12, grant_id: grantId })} emptyLabel="No guidelines are linked to this grant." metaFields={["guideline_type", "document_name", "is_required"]} /></TabsContent>
        <TabsContent value="applications"><RelatedRecordsCard title="Applications" queryKey={["research", "grants", grantId, "applications"]} queryFn={() => researchServiceApi.grantApplications.list({ page: 1, per_page: 12, grant_id: grantId })} emptyLabel="No applications are linked to this grant." metaFields={["application_number", "requested_amount", "status"]} /></TabsContent>
        <TabsContent value="reviews"><RelatedRecordsCard title="Applications in review" queryKey={["research", "grants", grantId, "review-applications"]} queryFn={() => researchServiceApi.grantApplications.list({ page: 1, per_page: 12, grant_id: grantId, status: "under_review" })} emptyLabel="No applications are currently under review for this grant." metaFields={["application_number", "requested_amount", "status"]} /></TabsContent>
        <TabsContent value="reports"><RelatedRecordsCard title="Reports" queryKey={["research", "grants", grantId, "reports"]} queryFn={() => researchServiceApi.grantReports.list({ page: 1, per_page: 12, grant_id: grantId })} emptyLabel="No reports are linked to this grant." metaFields={["report_type", "status", "submitted_at"]} /></TabsContent>
        <TabsContent value="projects"><RelatedRecordsCard title="Linked Projects" queryKey={["research", "grants", grantId, "projects"]} queryFn={() => researchServiceApi.grantRelations.projects.list(grantId)} emptyLabel="No projects are linked to this grant." metaFields={["code", "project_type", "status"]} /></TabsContent>
        <TabsContent value="themes">
          <BindableRecordsCard
            title="Themes"
            addLabel="Attach theme"
            relationshipLabel="Theme"
            queryKey={["research", "grants", grantId, "themes"]}
            queryFn={() => researchServiceApi.grantRelations.themes.list(grantId)}
            candidateQueryFn={(search) => researchServiceApi.themes.list({ page: 1, per_page: 20, search: search || undefined, fields: "id,name,slug,code,status" })}
            bindRecord={(recordId) => researchServiceApi.grantRelations.themes.add(grantId, recordId)}
            unbindRecord={(recordId) => researchServiceApi.grantRelations.themes.remove(grantId, recordId)}
            emptyLabel="No themes are attached to this grant."
            searchPlaceholder="Search themes to attach"
            invalidateKeys={[["research", "grants", "detail"]]}
          />
        </TabsContent>
        <TabsContent value="media"><GrantMediaPanel grant={grant} /></TabsContent>
      </Tabs>
    </div>
  );
}

function GrantDetailActions({ grant }: { grant: ResearchGenericRecord }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<GrantActionConfirmation | null>(null);
  const [values, setValues] = useState<GrantEditValues>(() => buildGrantEditValues(grant));
  const isActive = grant.is_active !== false;
  const isFeatured = Boolean(grant.is_featured);
  const isOpen = grant.status === "open";

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["research", "grants"] });
    await queryClient.invalidateQueries({ queryKey: ["research", "grants", "detail"] });
  };

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<ResearchGrantPayload>) => researchServiceApi.grants.update(String(grant.id), payload),
    onSuccess: async () => {
      toast.success("Grant updated");
      setEditOpen(false);
      setConfirmation(null);
      await refresh();
    },
    onError: () => toast.error("Could not update grant"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => researchServiceApi.grants.delete(String(grant.id)),
    onSuccess: async () => {
      toast.success("Grant deleted");
      await queryClient.invalidateQueries({ queryKey: ["research", "grants"] });
      router.push("/research/grants");
    },
    onError: () => toast.error("Could not delete grant"),
  });

  const busy = updateMutation.isPending || deleteMutation.isPending;

  const submitEdit = () => {
    const parsed = buildGrantPayload(values);
    if (!parsed.ok) {
      toast.error(parsed.message);
      return;
    }
    updateMutation.mutate(parsed.payload);
  };

  return (
    <>
      <Button type="button" variant="outline" disabled={busy} onClick={() => { setValues(buildGrantEditValues(grant)); setEditOpen(true); }}>
        <Edit3 className="mr-2 h-4 w-4" />
        Edit Grant
      </Button>
      <Button type="button" variant="outline" disabled={busy} onClick={() => setConfirmation({ title: isOpen ? "Close grant?" : "Open grant?", description: isOpen ? "Close this grant call to new applications." : "Open this grant call for applications.", confirmText: isOpen ? "Close" : "Open", payload: { status: isOpen ? "closed" : "open" } })}>
        {isOpen ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
        {isOpen ? "Close" : "Open"}
      </Button>
      <Button type="button" variant="outline" disabled={busy} onClick={() => setConfirmation({ title: isFeatured ? "Unfeature grant?" : "Feature grant?", description: isFeatured ? "Remove this grant from featured displays." : "Show this grant in featured funding displays.", confirmText: isFeatured ? "Unfeature" : "Feature", payload: { is_featured: !isFeatured } })}>
        {isFeatured ? <StarOff className="mr-2 h-4 w-4" /> : <Star className="mr-2 h-4 w-4" />}
        {isFeatured ? "Unfeature" : "Feature"}
      </Button>
      <Button type="button" variant="outline" disabled={busy} onClick={() => setConfirmation({ title: isActive ? "Deactivate grant?" : "Activate grant?", description: isActive ? "Hide this grant from active workflows." : "Return this grant to active workflows.", confirmText: isActive ? "Deactivate" : "Activate", payload: { is_active: !isActive }, variant: isActive ? "warning" : "success" })}>
        {isActive ? "Deactivate" : "Activate"}
      </Button>
      <Button type="button" variant="outline" className="text-destructive hover:text-destructive" disabled={busy} onClick={() => setConfirmation({ title: "Delete grant?", description: "Delete this grant record. Linked applications and reports may prevent deletion depending on backend constraints.", confirmText: "Delete", variant: "destructive", deleteRecord: true })}>
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </Button>

      <GrantEditSheet open={editOpen} onOpenChange={(open) => !busy && setEditOpen(open)} grant={grant} values={values} setValues={setValues} disabled={busy} onSubmit={submitEdit} saving={updateMutation.isPending} />

      <ConfirmDialog
        open={Boolean(confirmation)}
        onOpenChange={(open) => !open && !busy && setConfirmation(null)}
        title={confirmation?.title ?? ""}
        description={confirmation?.description ?? ""}
        confirmText={confirmation?.confirmText ?? "Confirm"}
        variant={confirmation?.variant}
        isLoading={busy}
        onConfirm={() => {
          if (confirmation?.deleteRecord) deleteMutation.mutate();
          else if (confirmation?.payload) updateMutation.mutate(confirmation.payload);
        }}
      />
    </>
  );
}

function GrantEditSheet({ open, onOpenChange, grant, values, setValues, disabled, onSubmit, saving }: { open: boolean; onOpenChange: (open: boolean) => void; grant: ResearchGenericRecord; values: GrantEditValues; setValues: (updater: (current: GrantEditValues) => GrantEditValues) => void; disabled: boolean; onSubmit: () => void; saving: boolean }) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => Object.fromEntries(GRANT_EDIT_GROUPS.map((group, index) => [group.title, index < 2])));
  const setField = (field: GrantEditField, value: string | boolean) => setValues((current) => ({ ...current, [field.name]: value }));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle>Edit grant</SheetTitle>
          <SheetDescription>Update grant fields. Relationships use readable selectors and chips instead of raw IDs.</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-5">
          {GRANT_EDIT_GROUPS.map((group) => (
            <section key={group.title} className="rounded-md border bg-card">
              <button type="button" className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left" onClick={() => setOpenGroups((current) => ({ ...current, [group.title]: !current[group.title] }))}>
                <span>
                  <span className="block text-sm font-semibold">{group.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">{group.description}</span>
                </span>
              </button>
              {openGroups[group.title] ? (
                <div className="grid gap-4 border-t p-4 md:grid-cols-2">
                  {group.fields.map((field) => (
                    <GrantEditFieldControl key={field.name} grantId={String(grant.id)} field={field} value={values[field.name]} disabled={disabled} onChange={(value) => setField(field, value)} />
                  ))}
                </div>
              ) : null}
            </section>
          ))}
        </div>
        <SheetFooter className="gap-2 border-t px-6 py-4">
          <Button type="button" variant="outline" disabled={disabled} onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" disabled={disabled} onClick={onSubmit}>{saving ? "Saving..." : "Save changes"}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function GrantEditFieldControl({ grantId, field, value, disabled, onChange }: { grantId: string; field: GrantEditField; value: string | boolean | undefined; disabled: boolean; onChange: (value: string | boolean) => void }) {
  const label = field.required ? `${field.label} *` : field.label;
  if (field.type === "boolean") {
    return (
      <label className="flex min-h-20 items-center justify-between gap-4 rounded-md border px-3 py-2 text-sm font-medium">
        <span>{label}</span>
        <Switch checked={Boolean(value)} disabled={disabled} onCheckedChange={(checked) => onChange(Boolean(checked))} />
      </label>
    );
  }
  if (field.type === "funder") {
    return (
      <div className="md:col-span-2">
        <EntityPicker
          adapter={relationshipAdapters.researchFunder as any}
          value={typeof value === "string" ? value : ""}
          onChange={(nextValue) => onChange(nextValue)}
          filters={{ is_active: true }}
          label={field.label}
          placeholder="Select a funder"
        />
      </div>
    );
  }
  if (field.type === "richtext") {
    return (
      <div className="space-y-2 text-sm font-medium md:col-span-2">
        <span>{label}</span>
        <RichTextEditor toolbar="simple" minHeight="150px" maxHeight="28rem" value={typeof value === "string" ? value : ""} disabled={disabled} onChange={onChange} />
      </div>
    );
  }
  if (field.type === "media") {
    return (
      <div className="space-y-2 text-sm font-medium md:col-span-2">
        <span>{label}</span>
        <MediaPicker value={typeof value === "string" ? value : ""} onChange={(nextValue) => onChange(nextValue || "")} mediaType={field.mediaType} accept={field.accept} label={field.label} uploadEntityType="research_grant" uploadEntityId={grantId} uploadRole={field.uploadRole} uploadLabel={value ? "Reupload" : "Upload"} allowUpload allowClear disabled={disabled} />
      </div>
    );
  }
  return (
    <label className="space-y-2 text-sm font-medium">
      <span>{label}</span>
      <Input type={field.type === "number" ? "number" : field.type === "date" || field.type === "datetime" ? field.type === "datetime" ? "datetime-local" : "date" : "text"} value={typeof value === "string" ? value : ""} disabled={disabled} placeholder={field.placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function GrantOverview({ grant }: { grant: ResearchGenericRecord }) {
  return (
    <RelatedRecordsGrid>
      <SectionCard title="Grant Content" record={grant} fields={["summary", "description", "objectives", "eligibility", "focus_areas", "requirements"]} />
      <SectionCard title="Application Details" record={grant} fields={["external_url", "application_url", "contact_name", "contact_email", "contact_phone"]} />
    </RelatedRecordsGrid>
  );
}

function GrantFunderPanel({ grant }: { grant: ResearchGenericRecord }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attached Funder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <GrantFunderChip grant={grant} />
        <p className="text-sm text-muted-foreground">Use Edit Grant to change the attached funder. The fallback funder name remains available for imported or legacy records.</p>
      </CardContent>
    </Card>
  );
}

function GrantMediaPanel({ grant }: { grant: ResearchGenericRecord }) {
  return (
    <RelatedRecordsGrid>
      <Card>
        <CardHeader><CardTitle>Cover Image</CardTitle></CardHeader>
        <CardContent><MediaPicker value={String(grant.cover_image_id ?? "")} onChange={() => undefined} mediaType="image" label="Cover image" disabled allowUpload={false} /></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Funder Logo</CardTitle></CardHeader>
        <CardContent><MediaPicker value={String(grant.logo_id ?? "")} onChange={() => undefined} mediaType="image" label="Funder logo" disabled allowUpload={false} /></CardContent>
      </Card>
    </RelatedRecordsGrid>
  );
}

function GrantFunderChip({ grant }: { grant: ResearchGenericRecord }) {
  const funderId = typeof grant.funder_id === "string" ? grant.funder_id : "";
  const funderQuery = useQuery({
    queryKey: ["research", "grant", "funder", funderId],
    queryFn: () => relationshipAdapters.researchFunder.get(funderId, { is_active: true }),
    enabled: Boolean(funderId),
  });
  const label = funderQuery.data?.label ?? grant.funder_name ?? "No funder attached";
  return <Badge variant="outline" className="max-w-full truncate">{String(label)}</Badge>;
}

function GrantMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border bg-background p-3">
      <div className="flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">{icon}{label}</div>
      <div className="mt-2 min-h-5 text-sm font-semibold">{value}</div>
    </div>
  );
}

function SectionCard({ title, record, fields }: { title: string; record: ResearchGenericRecord; fields: string[] }) {
  const entries = fields.map((field) => [field, record[field]] as const).filter(([, value]) => value);
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {entries.length === 0 ? <p className="text-sm text-muted-foreground">No details provided.</p> : entries.map(([field, value]) => (
          <div key={field}>
            <p className="text-xs font-semibold uppercase text-muted-foreground">{labelize(field)}</p>
            <p className="mt-1 text-sm leading-6">{String(value).replace(/<[^>]*>/g, "")}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function buildGrantEditValues(grant: ResearchGenericRecord): GrantEditValues {
  return Object.fromEntries(GRANT_EDIT_FIELDS.map((field) => {
    const value = grant[field.name];
    if (field.type === "boolean") return [field.name, Boolean(value)];
    if (field.type === "date") return [field.name, typeof value === "string" ? value.slice(0, 10) : ""];
    if (field.type === "datetime") return [field.name, typeof value === "string" ? value.slice(0, 16) : ""];
    return [field.name, value == null ? "" : String(value)];
  }));
}

function buildGrantPayload(values: GrantEditValues): { ok: true; payload: Partial<ResearchGrantPayload> } | { ok: false; message: string } {
  const payload: Partial<ResearchGrantPayload> = {};
  for (const field of GRANT_EDIT_FIELDS) {
    const value = values[field.name];
    if (field.type === "boolean") {
      payload[field.name as keyof ResearchGrantPayload] = Boolean(value) as never;
      continue;
    }
    const rawValue = typeof value === "string" ? value.trim() : "";
    if (field.required && !rawValue) return { ok: false, message: `${field.label} is required` };
    if (!rawValue) {
      payload[field.name as keyof ResearchGrantPayload] = null as never;
      continue;
    }
    if (field.type === "number") {
      const parsed = Number(rawValue);
      if (!Number.isFinite(parsed)) return { ok: false, message: `${field.label} must be a valid number` };
      payload[field.name as keyof ResearchGrantPayload] = parsed as never;
      continue;
    }
    payload[field.name as keyof ResearchGrantPayload] = rawValue as never;
  }
  return { ok: true, payload };
}
