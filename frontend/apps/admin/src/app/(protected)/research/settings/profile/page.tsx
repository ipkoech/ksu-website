"use client";

import Link from "next/link";
import { useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  ChevronDown,
  FileText,
  ImageIcon,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Save,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  publicResearchContextApi,
  type PublicResearchContextResponse,
  type PublicResearchContextUpdatePayload,
} from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";
import { toast } from "@ksu/ui";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
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
  Skeleton,
  Switch,
  richTextToPlainText,
} from "@ksu/ui/components";
import { cn } from "@ksu/ui/lib";
import { MediaPicker } from "@/components/media";
import { EntityPicker } from "@/components/relationships/entity-picker";
import { relationshipAdapters } from "@/components/relationships/relationship-adapters";
import { ResearchSectionGuide } from "../../_components/research-guidance";
import { ResearchSettingsWorkspaceHeader } from "../_components/settings-workspace";

type FormValues = {
  wing: Record<string, any>;
  department: Record<string, any>;
};

const contextFields = "resolved_entity,entity,team,leadership,relationships,division,wing,department";
const contextInclude =
  "wing:id,name,slug,code,wing_type,head_id,description,head_message,mandate,service_charter,email,phone,office_location,cover_image_id,is_public,is_active,display_order;" +
  "department:id,name,slug,code,department_type,head_id,postgraduate_coordinator_id,about,head_message,mission,vision,mandate,core_values,service_charter,guidelines,email,phone,office_location,cover_image_id,is_public,is_active,allows_staff_management,display_order";

const manageScopes = [
  "research.manage_office",
  "research.manage_guidelines",
  "academic.manage_departments",
  "administration.manage_units",
  "office.manage_content",
  "research:write",
];

const profileLinks = [
  {
    title: "Staff",
    description: "Attach, remove, or maintain research staff profiles.",
    href: "/research/content/staff",
    icon: Users,
  },
  {
    title: "Users",
    description: "Manage user access from the admin user directory.",
    href: "/system/users",
    icon: UserCheck,
  },
  {
    title: "Services",
    description: "Maintain research services, access steps, contacts, and fees.",
    href: "/research/settings/services",
    icon: MessageSquare,
  },
  {
    title: "Documents",
    description: "Manage research resources, forms, files, and downloadable documents.",
    href: "/research/settings/resources",
    icon: FileText,
  },
  {
    title: "Policies",
    description: "Maintain guidelines, procedures, policy notes, and public requirements.",
    href: "/research/settings/guidelines",
    icon: ShieldCheck,
  },
  {
    title: "Media",
    description: "Update research sliders and public visual assets.",
    href: "/research/settings/sliders",
    icon: ImageIcon,
  },
];

export default function ResearchProfileSettingsPage() {
  const { hasScope } = usePermissions();
  const canManage = manageScopes.some((scope) => hasScope(scope));
  const queryClient = useQueryClient();
  const [editorOpen, setEditorOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    identity: true,
    leadership: true,
    content: true,
    contact: false,
    media: false,
    visibility: false,
  });

  const contextQuery = useQuery({
    queryKey: ["research", "settings", "profile-context"],
    queryFn: () => publicResearchContextApi.get({ fields: contextFields, include: contextInclude }),
  });

  const context = contextQuery.data?.data;
  const [values, setValues] = useState<FormValues | null>(null);

  const updateMutation = useMutation({
    mutationFn: (payload: PublicResearchContextUpdatePayload) =>
      publicResearchContextApi.update(payload, { fields: contextFields, include: contextInclude }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["research", "settings", "profile-context"] });
      toast.success("Research profile updated");
      setEditorOpen(false);
      setValues(null);
    },
    onError: () => {
      toast.error("Failed to update research profile");
    },
  });

  const formValues = values ?? (context ? valuesFromContext(context) : null);
  const entity = context?.entity;
  const department = asRecord(context?.department);
  const wing = asRecord(context?.wing);
  const leadership = context?.leadership?.person;

  const stats = useMemo(
    () => [
      { label: "Wing", value: text(wing.name) || "Not set" },
      { label: "Department", value: text(department.name) || "Not set" },
      { label: "Lead", value: leadership?.full_name || "Not assigned" },
      { label: "Visibility", value: department.is_public || wing.is_public ? "Public" : "Internal" },
    ],
    [department.is_public, department.name, leadership?.full_name, wing.is_public, wing.name],
  );

  const startEdit = () => {
    if (!context) return;
    setValues(valuesFromContext(context));
    setEditorOpen(true);
  };

  const setField = (scope: keyof FormValues, name: string, value: unknown) => {
    setValues((current) => {
      const base = current ?? (context ? valuesFromContext(context) : { wing: {}, department: {} });
      return {
        ...base,
        [scope]: {
          ...base[scope],
          [name]: value,
        },
      };
    });
  };

  const submit = async () => {
    if (!formValues) return;
    await updateMutation.mutateAsync({
      wing: buildWingPayload(formValues.wing),
      department: buildDepartmentPayload(formValues.department),
    });
  };

  return (
    <div>
      <div className="space-y-4 p-4 sm:p-6">
        <ResearchSettingsWorkspaceHeader />

        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-background p-3">
          <ResearchSectionGuide title="Research Settings" className="mr-auto" />
          <Button asChild variant="outline" size="sm">
            <Link href="/research/settings/resources">
              <FileText data-icon="inline-start" />
              Documents
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/research/settings/services">
              <MessageSquare data-icon="inline-start" />
              Services
            </Link>
          </Button>
          <Button type="button" size="sm" onClick={startEdit} disabled={!canManage || contextQuery.isLoading || !context}>
            <Save data-icon="inline-start" />
            Edit Profile
          </Button>
        </div>

        {contextQuery.isLoading ? (
          <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
            <Skeleton className="h-72 rounded-lg" />
            <Skeleton className="h-72 rounded-lg" />
          </div>
        ) : contextQuery.isError ? (
          <Card>
            <CardHeader>
              <CardTitle>Research profile unavailable</CardTitle>
              <CardDescription>The research context endpoint could not be loaded.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-lg border bg-background px-3 py-2">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 truncate text-sm font-semibold">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle>{entity?.name || text(department.name) || "Research profile"}</CardTitle>
                      <CardDescription>{[entity?.code, entity?.entity_type].filter(Boolean).join(" · ") || "Research office context"}</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={department.is_active || wing.is_active ? "default" : "secondary"}>
                        {department.is_active || wing.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant={department.is_public || wing.is_public ? "outline" : "secondary"}>
                        {department.is_public || wing.is_public ? "Public" : "Internal"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ProfileCopy label="About department" value={entity?.about ?? text(department.about) ?? text(wing.description)} />
                  <div className="grid gap-3 md:grid-cols-2">
                    <InfoTile icon={Building2} label="Mandates" value={entity?.mandate ?? text(department.mandate) ?? text(wing.mandate)} />
                    <InfoTile icon={ShieldCheck} label="Service charter" value={entity?.service_charter ?? text(department.service_charter) ?? text(wing.service_charter)} />
                    <InfoTile icon={MapPin} label="Office location" value={text(department.office_location) ?? text(wing.office_location)} />
                    <InfoTile icon={UserCheck} label="Lead / Head" value={leadership?.full_name || "No dedicated research lead assigned"} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Operational Links</CardTitle>
                  <CardDescription>Manage related research administration records.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2">
                  {profileLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.href} href={item.href} className="group rounded-lg border bg-background p-3 transition-colors hover:border-primary/50 hover:bg-muted/30">
                        <div className="flex items-start gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <Icon className="size-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold">{item.title}</p>
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <ContactCard icon={Mail} label="Email" value={entity?.email ?? text(department.email) ?? text(wing.email)} />
              <ContactCard icon={Phone} label="Phone" value={entity?.phone ?? text(department.phone) ?? text(wing.phone)} />
              <ContactCard icon={MapPin} label="Office" value={entity?.office_location ?? text(department.office_location) ?? text(wing.office_location)} />
            </div>
          </>
        )}
      </div>

      <Sheet
        open={editorOpen}
        onOpenChange={(open) => {
          if (updateMutation.isPending) return;
          setEditorOpen(open);
          if (!open) setValues(null);
        }}
      >
        <SheetContent className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle>Edit Research Profile</SheetTitle>
            <SheetDescription>
              Update the research wing and research department context used by the public research portal.
            </SheetDescription>
          </SheetHeader>
          {formValues ? (
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-4">
              <EditorSection
                id="identity"
                title="Identity"
                description="Research office and department names, codes, and types."
                openSections={openSections}
                setOpenSections={setOpenSections}
              >
                <Field label="Wing name"><Input value={text(formValues.wing.name)} onChange={(event) => setField("wing", "name", event.target.value)} /></Field>
                <Field label="Wing code"><Input value={text(formValues.wing.code)} onChange={(event) => setField("wing", "code", event.target.value)} /></Field>
                <Field label="Wing slug"><Input value={text(formValues.wing.slug)} onChange={(event) => setField("wing", "slug", event.target.value)} /></Field>
                <Field label="Wing type"><Input value={text(formValues.wing.wing_type)} onChange={(event) => setField("wing", "wing_type", event.target.value)} /></Field>
                <Field label="Department name"><Input value={text(formValues.department.name)} onChange={(event) => setField("department", "name", event.target.value)} /></Field>
                <Field label="Department code"><Input value={text(formValues.department.code)} onChange={(event) => setField("department", "code", event.target.value)} /></Field>
                <Field label="Department slug"><Input value={text(formValues.department.slug)} onChange={(event) => setField("department", "slug", event.target.value)} /></Field>
                <Field label="Department type"><Input value={text(formValues.department.department_type)} onChange={(event) => setField("department", "department_type", event.target.value)} /></Field>
              </EditorSection>

              <EditorSection
                id="leadership"
                title="Leadership"
                description="Use a registrar, assistant registrar, or dedicated research lead; do not assign DVC as department head."
                openSections={openSections}
                setOpenSections={setOpenSections}
              >
                <Field label="Research wing lead">
                  <EntityPicker
                    adapter={relationshipAdapters.person as any}
                    value={text(formValues.wing.head_id)}
                    onChange={(value) => setField("wing", "head_id", value || "")}
                    filters={{ status: "active" }}
                    placeholder="Select registrar, assistant registrar, or research lead"
                    allowClear
                  />
                </Field>
                <Field label="Department lead">
                  <EntityPicker
                    adapter={relationshipAdapters.person as any}
                    value={text(formValues.department.head_id)}
                    onChange={(value) => setField("department", "head_id", value || "")}
                    filters={{ status: "active" }}
                    placeholder="Select dedicated department lead"
                    allowClear
                  />
                </Field>
                <Field label="Postgraduate coordinator">
                  <EntityPicker
                    adapter={relationshipAdapters.person as any}
                    value={text(formValues.department.postgraduate_coordinator_id)}
                    onChange={(value) => setField("department", "postgraduate_coordinator_id", value || "")}
                    filters={{ status: "active" }}
                    placeholder="Select postgraduate coordinator"
                    allowClear
                  />
                </Field>
                <RichField label="Lead message" value={text(formValues.department.head_message)} onChange={(value) => setField("department", "head_message", value)} />
              </EditorSection>

              <EditorSection
                id="content"
                title="About, Mandates, and Service Charter"
                description="Long-form public profile content rendered by the research public site."
                openSections={openSections}
                setOpenSections={setOpenSections}
              >
                <RichField label="About department" value={text(formValues.department.about)} onChange={(value) => setField("department", "about", value)} />
                <RichField label="Mission" value={text(formValues.department.mission)} onChange={(value) => setField("department", "mission", value)} />
                <RichField label="Vision" value={text(formValues.department.vision)} onChange={(value) => setField("department", "vision", value)} />
                <RichField label="Mandates" value={text(formValues.department.mandate)} onChange={(value) => setField("department", "mandate", value)} />
                <RichField label="Core values" value={text(formValues.department.core_values)} onChange={(value) => setField("department", "core_values", value)} />
                <RichField label="Service charter" value={text(formValues.department.service_charter)} onChange={(value) => setField("department", "service_charter", value)} />
                <RichField label="Guidelines" value={text(formValues.department.guidelines)} onChange={(value) => setField("department", "guidelines", value)} />
              </EditorSection>

              <EditorSection
                id="contact"
                title="Contacts"
                description="Contact fields shown on research public surfaces and admin profile cards."
                openSections={openSections}
                setOpenSections={setOpenSections}
              >
                <Field label="Email"><Input type="email" value={text(formValues.department.email)} onChange={(event) => setField("department", "email", event.target.value)} /></Field>
                <Field label="Phone"><Input value={text(formValues.department.phone)} onChange={(event) => setField("department", "phone", event.target.value)} /></Field>
                <Field label="Office location"><Input value={text(formValues.department.office_location)} onChange={(event) => setField("department", "office_location", event.target.value)} /></Field>
              </EditorSection>

              <EditorSection
                id="media"
                title="Media"
                description="Cover images and public visual profile assets."
                openSections={openSections}
                setOpenSections={setOpenSections}
              >
                <Field label="Wing cover image" wide>
                  <MediaPicker
                    value={text(formValues.wing.cover_image_id)}
                    onChange={(value) => setField("wing", "cover_image_id", value || "")}
                    label="Wing cover image"
                    mediaType="image"
                    accept="image/*"
                    uploadEntityType="research"
                    uploadRole="cover-image"
                    allowUpload
                    allowClear
                  />
                </Field>
                <Field label="Department cover image" wide>
                  <MediaPicker
                    value={text(formValues.department.cover_image_id)}
                    onChange={(value) => setField("department", "cover_image_id", value || "")}
                    label="Department cover image"
                    mediaType="image"
                    accept="image/*"
                    uploadEntityType="department"
                    uploadRole="cover-image"
                    allowUpload
                    allowClear
                  />
                </Field>
              </EditorSection>

              <EditorSection
                id="visibility"
                title="Visibility"
                description="Publication and active-state settings."
                openSections={openSections}
                setOpenSections={setOpenSections}
              >
                <SwitchField label="Wing public" value={Boolean(formValues.wing.is_public)} onChange={(value) => setField("wing", "is_public", value)} />
                <SwitchField label="Wing active" value={Boolean(formValues.wing.is_active)} onChange={(value) => setField("wing", "is_active", value)} />
                <SwitchField label="Department public" value={Boolean(formValues.department.is_public)} onChange={(value) => setField("department", "is_public", value)} />
                <SwitchField label="Department active" value={Boolean(formValues.department.is_active)} onChange={(value) => setField("department", "is_active", value)} />
                <SwitchField label="Allow staff management" value={Boolean(formValues.department.allows_staff_management)} onChange={(value) => setField("department", "allows_staff_management", value)} />
              </EditorSection>
            </div>
          ) : null}
          <SheetFooter className="border-t bg-background px-6 py-4">
            <Button type="button" variant="outline" disabled={updateMutation.isPending} onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={!canManage || updateMutation.isPending} onClick={submit}>
              <Save data-icon="inline-start" />
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function valuesFromContext(context: PublicResearchContextResponse): FormValues {
  return {
    wing: { ...asRecord(context.wing) },
    department: { ...asRecord(context.department) },
  };
}

function buildWingPayload(values: Record<string, any>) {
  return cleanPayload({
    name: values.name,
    slug: values.slug,
    code: values.code,
    wing_type: values.wing_type,
    head_id: emptyToNull(values.head_id),
    description: values.description,
    head_message: values.head_message,
    mandate: values.mandate,
    service_charter: values.service_charter,
    email: values.email,
    phone: values.phone,
    office_location: values.office_location,
    cover_image_id: emptyToNull(values.cover_image_id),
    is_public: values.is_public,
    is_active: values.is_active,
  });
}

function buildDepartmentPayload(values: Record<string, any>) {
  return cleanPayload({
    name: values.name,
    slug: values.slug,
    code: values.code,
    department_type: values.department_type,
    head_id: emptyToNull(values.head_id),
    postgraduate_coordinator_id: emptyToNull(values.postgraduate_coordinator_id),
    about: values.about,
    head_message: values.head_message,
    mission: values.mission,
    vision: values.vision,
    mandate: values.mandate,
    core_values: values.core_values,
    service_charter: values.service_charter,
    guidelines: values.guidelines,
    email: values.email,
    phone: values.phone,
    office_location: values.office_location,
    cover_image_id: emptyToNull(values.cover_image_id),
    is_public: values.is_public,
    is_active: values.is_active,
    allows_staff_management: values.allows_staff_management,
  });
}

function cleanPayload(values: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== undefined),
  );
}

function emptyToNull(value: unknown) {
  return value === "" || value === undefined ? null : value;
}

function asRecord(value: unknown): Record<string, any> {
  return value && typeof value === "object" ? value as Record<string, any> : {};
}

function text(value: unknown) {
  return value === null || value === undefined ? "" : String(value);
}

function plain(value?: string | null) {
  const source = value || "";
  return richTextToPlainText(source) || source;
}

function ProfileCopy({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-2 line-clamp-5 text-sm leading-6">{plain(value) || "No content has been added yet."}</p>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p className="mt-2 line-clamp-3 text-sm">{plain(value) || "Not set"}</p>
    </div>
  );
}

function ContactCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value?: string | null;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="truncate text-sm font-medium">{value || "Not set"}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function EditorSection({
  id,
  title,
  description,
  openSections,
  setOpenSections,
  children,
}: {
  id: string;
  title: string;
  description: string;
  openSections: Record<string, boolean>;
  setOpenSections: Dispatch<SetStateAction<Record<string, boolean>>>;
  children: ReactNode;
}) {
  const open = Boolean(openSections[id]);
  return (
    <section className="rounded-lg border bg-background">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
        aria-expanded={open}
        onClick={() => setOpenSections((current) => ({ ...current, [id]: !current[id] }))}
      >
        <span>
          <span className="block text-sm font-semibold">{title}</span>
          <span className="mt-1 block text-xs text-muted-foreground">{description}</span>
        </span>
        <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open ? <div className="grid gap-4 border-t p-4 md:grid-cols-2">{children}</div> : null}
    </section>
  );
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: ReactNode }) {
  return (
    <label className={cn("flex flex-col gap-2", wide && "md:col-span-2")}>
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

function RichField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="md:col-span-2">
      <p className="mb-2 text-sm font-medium">{label}</p>
      <RichTextEditor value={value} onChange={onChange} toolbar="simple" minHeight="180px" />
    </div>
  );
}

function SwitchField({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}
