import {
  BadgeCheck,
  BookOpen,
  Boxes,
  Building2,
  CalendarDays,
  ClipboardCheck,
  FileArchive,
  FileText,
  FlaskConical,
  GraduationCap,
  ImageIcon,
  Landmark,
  Library,
  LinkIcon,
  Megaphone,
  Newspaper,
  PanelsTopLeft,
  ScrollText,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import {
  announcementsApi,
  blogsApi,
  academicCalendarsApi,
  contactsApi,
  departmentsApi,
  divisionsApi,
  documentsApi,
  eventsApi,
  faqsApi,
  governanceApi,
  intakesApi,
  libraryServiceApi,
  mediaApi,
  newsApi,
  personsApi,
  programmesApi,
  researchServiceApi,
  schoolsApi,
  slidersApi,
  staffApi,
  testimonialsApi,
  wingsApi,
  type AcademicCalendar,
  type Announcement,
  type Blog,
  type Board,
  type ContactDirectory,
  type Department,
  type Division,
  type Document,
  type Event,
  type FAQ,
  type Intake,
  type LibraryBranch,
  type LibraryCharge,
  type LibraryChargePayload,
  type LibraryGenericPayload,
  type LibraryGenericRecord,
  type LibraryGuide,
  type LibraryInquiry,
  type LibraryLoan,
  type LibraryPolicyPage,
  type LibraryReservation,
  type LibraryRegulation,
  type LibraryResource,
  type LibraryResourcePayload,
  type LibraryStaff,
  type LibrarySpecialist,
  type LibrarySupportTicket,
  type LibraryWorkflow,
  type Media,
  type MediaFolder,
  type News,
  type Person,
  type Programme,
  type ResearchGenericPayload,
  type ResearchGenericRecord,
  type ResearchGrant,
  type ResearchGrantPayload,
  type ResearchProject,
  type ResearchProjectPayload,
  type ResearchPublication,
  type ResearchPublicationPayload,
  type School,
  type Slider,
  type SliderGroup,
  type StaffAssignment,
  type Testimonial,
  type Wing,
} from "@ksu/api-client";
import type {
  PortalConfig,
  PortalPayload,
  PortalRecord,
  PortalResourceConfig,
} from "./types";
import type {
  EditableField,
  EditableListFilter,
} from "@/components/dashboard/editable-service-resource-page";

const pageParams = { page: 1, per_page: 50 };
const countParams = { page: 1, per_page: 1, fields: "id" };

function statCount(value?: number) {
  return { data: [], meta: { total: Number(value ?? 0) } };
}

async function researchAdminCount(key: string) {
  const response = await researchServiceApi.adminStats();
  const item = response.data.stats.find((stat) => stat.key === key);
  return statCount(Number(item?.value ?? 0));
}

async function libraryAdminCount(key: string) {
  const response = await libraryServiceApi.adminStats();
  const item = response.data.stats.find((stat) => stat.key === key);
  return statCount(Number(item?.value ?? 0));
}

const statusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Submitted", value: "submitted" },
  { label: "Under Review", value: "under_review" },
  { label: "Approved", value: "approved" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];

const contentStatusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Under Review", value: "under_review" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];

const contactStatusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Archived", value: "archived" },
];

const yesNoFilters = [
  { name: "is_active", label: "Active", type: "boolean" as const },
  { name: "is_public", label: "Public", type: "boolean" as const },
];

const libraryGuideTypeOptions = [
  { label: "Subject", value: "subject" },
  { label: "Course", value: "course" },
  { label: "Database", value: "database" },
  { label: "Research", value: "research" },
  { label: "Other", value: "other" },
];

const libraryWorkflowTypeOptions = [
  { label: "Borrowing", value: "borrowing" },
  { label: "Clearance", value: "clearance" },
  { label: "Research", value: "research" },
  { label: "Repository", value: "repository" },
  { label: "Other", value: "other" },
];

const libraryPolicyTypeOptions = [
  { label: "Borrowing", value: "borrowing" },
  { label: "Access", value: "access" },
  { label: "Clearance", value: "clearance" },
  { label: "Repository", value: "repository" },
  { label: "Other", value: "other" },
];

const libraryPolicyStatusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Active", value: "active" },
  { label: "Archived", value: "archived" },
];

type PortalEntityScope =
  | "school"
  | "department"
  | "wing"
  | "division"
  | "university"
  | "administration";

const portalScopeConfigs = [
  {
    value: "university",
    label: "University",
    adapter: "staffEntity" as const,
    filters: { entity_type: "university" },
    recordRequired: false,
  },
  {
    value: "division",
    label: "DVC Division / Directorate",
    adapter: "staffEntity" as const,
    filters: { entity_type: "division" },
  },
  {
    value: "wing",
    label: "Registrar Office / Wing",
    adapter: "staffEntity" as const,
    filters: { entity_type: "wing" },
  },
  {
    value: "department",
    label: "Administrative Department",
    adapter: "staffEntity" as const,
    filters: { entity_type: "department" },
  },
];

function normalizeScopePayload(
  values: PortalPayload,
  fallbackScopeType?: string,
) {
  const scopeType = fallbackScopeType ?? values.scope_type;
  return {
    scope_type: scopeType,
    scope_id:
      scopeType === "university" || values.scope_id === "__university__"
        ? null
        : values.scope_id,
  };
}

function validateScopeValues(values: PortalPayload) {
  const errors: Record<string, string> = {};
  if (!values.scope_type) {
    errors.scope = "Choose the office scope for this record.";
  } else if (values.scope_type !== "university" && !values.scope_id) {
    errors.scope = "Choose the office, division, or unit for this record.";
  }
  return errors;
}

function scopeEntityFields(scopeType?: PortalEntityScope): EditableField[] {
  if (scopeType === "administration") {
    return [
      {
        name: "scope",
        label: "Office Scope",
        type: "entity-record",
        entityRecord: {
          typeName: "scope_type",
          idName: "scope_id",
          configs: portalScopeConfigs,
          description:
            "Attach this record to the university, a DVC division, registrar office, or administrative department.",
          typePlaceholder: "Select office scope",
          recordPlaceholder: "Select office or unit",
          allowNone: false,
        },
      },
    ];
  }
  if (scopeType === "university") {
    return [
      {
        name: "scope_type",
        label: "Scope",
        type: "select",
        options: [{ label: "University", value: "university" }],
      },
    ];
  }
  if (scopeType === "division") {
    return [
      {
        name: "scope_id",
        label: "Division",
        type: "entity",
        required: true,
        relation: {
          adapter: "division",
          filters: { is_active: true },
        },
      },
    ];
  }
  if (scopeType === "wing") {
    return [
      {
        name: "scope_id",
        label: "Office / Wing",
        type: "entity",
        required: true,
        relation: {
          adapter: "staffEntity",
          filters: { entity_type: "wing" },
        },
      },
    ];
  }
  if (scopeType === "school") {
    return [
      {
        name: "scope_id",
        label: "School",
        type: "entity",
        required: true,
        relation: {
          adapter: "school",
          filters: { is_active: true },
        },
      },
    ];
  }
  if (scopeType === "department") {
    return [
      {
        name: "scope_id",
        label: "Department",
        type: "entity",
        required: true,
        relation: {
          adapter: "department",
          filters: { is_active: true },
        },
      },
    ];
  }
  return [];
}

function scopeEntityFilters(scopeType?: PortalEntityScope): EditableListFilter[] {
  if (scopeType === "administration") {
    return [
      {
        name: "scope_type",
        label: "Office Scope",
        type: "select",
        options: portalScopeConfigs.map((config) => ({
          label: config.label,
          value: config.value,
        })),
      },
    ];
  }
  if (scopeType === "division") {
    return [
      {
        name: "scope_id",
        label: "Division",
        type: "entity",
        relation: {
          adapter: "division",
          filters: { is_active: true },
        },
      },
    ];
  }
  if (scopeType === "wing") {
    return [
      {
        name: "scope_id",
        label: "Office / Wing",
        type: "entity",
        relation: {
          adapter: "staffEntity",
          filters: { entity_type: "wing" },
        },
      },
    ];
  }
  if (scopeType === "school") {
    return [
      {
        name: "scope_id",
        label: "School",
        type: "entity",
        relation: {
          adapter: "school",
          filters: { is_active: true },
        },
      },
    ];
  }
  if (scopeType === "department") {
    return [
      {
        name: "scope_id",
        label: "Department",
        type: "entity",
        relation: {
          adapter: "department",
          filters: { is_active: true },
        },
      },
    ];
  }
  return [];
}

function faqFields(scopeType?: PortalEntityScope): EditableField[] {
  return [
  { name: "question", label: "Question", required: true },
  { name: "answer", label: "Answer", type: "textarea" as const },
  { name: "category", label: "Category" },
  ...scopeEntityFields(scopeType),
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    options: statusOptions,
  },
  { name: "display_order", label: "Display Order", type: "number" as const },
  { name: "is_main", label: "Main Site", type: "boolean" as const },
  { name: "is_public", label: "Public", type: "boolean" as const },
  ];
}

function contactFields(scopeType?: PortalEntityScope): EditableField[] {
  return [
  { name: "name", label: "Name", required: true },
  { name: "contact_type", label: "Contact Type" },
  { name: "email", label: "Email", type: "email" as const },
  { name: "phone", label: "Phone Numbers" },
  { name: "extension", label: "Extension" },
  {
    name: "physical_address",
    label: "Physical Address",
    type: "textarea" as const,
  },
  { name: "building", label: "Building" },
  { name: "room_number", label: "Room Number" },
  {
    name: "contact_person_id",
    label: "Contact Person",
    type: "entity" as const,
    relation: {
      adapter: "person" as const,
      filters: { status: "active" },
      allowClear: true,
    },
  },
  ...scopeEntityFields(scopeType),
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    options: contactStatusOptions,
  },
  { name: "is_main", label: "Main Site", type: "boolean" as const },
  { name: "is_public", label: "Public", type: "boolean" as const },
  ];
}

function documentFields(scopeType?: PortalEntityScope | "governance"): EditableField[] {
  return [
    { name: "title", label: "Title", required: true },
    { name: "slug", label: "Slug" },
    { name: "document_type", label: "Document Type", required: true },
    { name: "category", label: "Category" },
    { name: "description", label: "Description", type: "textarea" },
    {
      name: "file_id",
      label: "Document File",
      type: "entity",
      required: true,
      relation: {
        adapter: "media",
        filters: { media_type: "document" },
      },
    },
    ...scopeEntityFields(scopeType === "governance" ? undefined : scopeType),
    { name: "version", label: "Version" },
    { name: "display_order", label: "Display Order", type: "number" },
    { name: "is_public", label: "Public", type: "boolean" },
    { name: "requires_login", label: "Requires Login", type: "boolean" },
    { name: "is_active", label: "Active", type: "boolean" },
  ];
}

const testimonialFields = [
  {
    name: "person_id",
    label: "Person",
    type: "entity" as const,
    relation: {
      adapter: "person" as const,
      filters: { status: "active" },
      allowClear: true,
    },
  },
  { name: "name", label: "Name", required: true },
  { name: "role", label: "Role" },
  { name: "quote", label: "Quote", required: true, type: "textarea" as const },
  { name: "full_story", label: "Full Story", type: "textarea" as const },
  { name: "testimonial_type", label: "Type" },
  {
    name: "school_id",
    label: "School",
    type: "entity" as const,
    relation: {
      adapter: "school" as const,
      filters: { is_active: true },
      allowClear: true,
    },
  },
  {
    name: "department_id",
    label: "Department",
    type: "entity" as const,
    relation: {
      adapter: "department" as const,
      filters: { is_active: true },
      allowClear: true,
    },
  },
  {
    name: "programme_id",
    label: "Programme",
    type: "entity" as const,
    relation: { adapter: "programme" as const, allowClear: true },
  },
  { name: "video_url", label: "Video URL", type: "url" as const },
  { name: "display_order", label: "Display Order", type: "number" as const },
  { name: "is_featured", label: "Featured", type: "boolean" as const },
  { name: "is_approved", label: "Approved", type: "boolean" as const },
  { name: "is_public", label: "Public", type: "boolean" as const },
];

function titleOf(record: PortalRecord) {
  return (
    record.title ??
    record.name ??
    record.full_name ??
    record.subject ??
    record.display_name ??
    record.slug ??
    "Untitled record"
  );
}

function metaOf(record: PortalRecord, keys: string[]) {
  return keys
    .map((key) => record[key])
    .filter(
      (value) =>
        value !== undefined && value !== null && String(value).trim() !== "",
    )
    .map(String)
    .join(" · ");
}

function joinMetaValues(values: Array<string | number | boolean | null | undefined>) {
  return values
    .filter(
      (value) =>
        value !== undefined && value !== null && String(value).trim() !== "",
    )
    .map(String)
    .join(" · ");
}

const staffAssignmentEntityConfigs = [
  {
    value: "university",
    label: "University",
    adapter: "staffEntity" as const,
    filters: { entity_type: "university" },
    recordRequired: false,
  },
  {
    value: "board",
    label: "Board",
    adapter: "staffEntity" as const,
    filters: { entity_type: "board" },
  },
  {
    value: "division",
    label: "Division",
    adapter: "staffEntity" as const,
    filters: { entity_type: "division" },
  },
  {
    value: "wing",
    label: "Registrar Office / Wing",
    adapter: "staffEntity" as const,
    filters: { entity_type: "wing" },
  },
  {
    value: "directorate",
    label: "Directorate",
    adapter: "staffEntity" as const,
    filters: { entity_type: "directorate" },
  },
  {
    value: "school",
    label: "School / Faculty",
    adapter: "staffEntity" as const,
    filters: { entity_type: "school" },
  },
  {
    value: "department",
    label: "Department",
    adapter: "staffEntity" as const,
    filters: { entity_type: "department" },
  },
];

const staffEntityTypeOptions = staffAssignmentEntityConfigs.map((config) => ({
  label: config.label,
  value: config.value,
}));

function staffAssignmentPersonName(record: StaffAssignment) {
  const person = record.person as Person | undefined;
  return (
    person?.full_name ||
    [person?.first_name, person?.middle_name, person?.last_name]
      .filter(Boolean)
      .join(" ") ||
    "Unassigned staff"
  );
}

function staffAssignmentTitle(record: StaffAssignment) {
  return joinMetaValues([
    staffAssignmentPersonName(record),
    record.title || record.role_display || record.role,
  ]);
}

function libraryLabelOf(record: PortalRecord) {
  const library = record.library as
    | { name?: string | null; short_name?: string | null }
    | null
    | undefined;
  if (!library?.name) return null;
  return [library.name, library.short_name].filter(Boolean).join(" - ");
}

function formatDateTime(value: unknown) {
  if (!value) return "";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function normalizeText(value: unknown) {
  return typeof value === "string" && value.trim() === "" ? null : value;
}

function splitList(value: unknown) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return value;
  const items = value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length ? items : null;
}

function commonContentPayload(values: PortalPayload, scopeType?: string) {
  return {
    title: values.title,
    slug: values.slug,
    excerpt: values.excerpt,
    content: values.content,
    status: values.status || "draft",
    is_published: values.is_published,
    is_featured: values.is_featured,
    is_main: values.is_main ?? !scopeType,
    scope_type: scopeType ?? values.scope_type,
    scope_id: values.scope_id,
    featured_media_id: values.featured_media_id,
  };
}

function contentFields(
  scopeType?: "school" | "department" | "research" | "corporate",
) {
  return [
    {
      name: "title",
      label: "Title",
      required: true,
      placeholder: "Public title",
    },
    { name: "slug", label: "Slug", placeholder: "public-title" },
    { name: "excerpt", label: "Excerpt", type: "textarea" as const },
    { name: "content", label: "Content", type: "textarea" as const },
    {
      name: "status",
      label: "Status",
      type: "select" as const,
      options: contentStatusOptions,
    },
    ...(scopeType === "school"
      ? [
          {
            name: "scope_id",
            label: "School",
            type: "entity" as const,
            relation: {
              adapter: "school" as const,
              filters: { is_active: true },
            },
          },
        ]
      : []),
    ...(scopeType === "department"
      ? [
          {
            name: "scope_id",
            label: "Department",
            type: "entity" as const,
            relation: {
              adapter: "department" as const,
              filters: { is_active: true },
            },
          },
        ]
      : []),
    {
      name: "featured_media_id",
      label: "Featured Image",
      type: "entity" as const,
      relation: {
        adapter: "media" as const,
        filters: { media_type: "image" },
        allowClear: true,
      },
    },
    { name: "is_published", label: "Published", type: "boolean" as const },
    { name: "is_featured", label: "Featured", type: "boolean" as const },
  ];
}

function contentResource<TRecord extends PortalRecord>({
  key,
  title,
  description,
  backHref,
  list,
  create,
  update,
  remove,
  publish,
  unpublish,
  scopeType,
  manageScopes,
}: {
  key: string;
  title: string;
  description: string;
  backHref: string;
  list: (filters?: PortalPayload) => Promise<{ data?: TRecord[] }>;
  create: (payload: PortalPayload) => Promise<unknown>;
  update: (id: string, payload: PortalPayload) => Promise<unknown>;
  remove: (id: string) => Promise<unknown>;
  publish?: (id: string) => Promise<unknown>;
  unpublish?: (id: string) => Promise<unknown>;
  scopeType?: "school" | "department" | "research" | "corporate";
  manageScopes: string[];
}): PortalResourceConfig<TRecord, PortalPayload> {
  return {
    key,
    title,
    description,
    backHref,
    queryKey: [backHref, key],
    portalScope:
      scopeType === "school" || scopeType === "department"
        ? {
            typeField: "scope_type",
            idField: "scope_id",
            allowedScopeTypes: [scopeType],
          }
        : undefined,
    fields: contentFields(scopeType),
    listFilters: [
      {
        name: "status",
        label: "Status",
        type: "select",
        options: contentStatusOptions,
      },
      ...(scopeType === "school"
        ? [
            {
              name: "scope_id",
              label: "School",
              type: "entity" as const,
              relation: {
                adapter: "school" as const,
                filters: { is_active: true },
              },
            },
          ]
        : []),
      ...(scopeType === "department"
        ? [
            {
              name: "scope_id",
              label: "Department",
              type: "entity" as const,
              relation: {
                adapter: "department" as const,
                filters: { is_active: true },
              },
            },
          ]
        : []),
      { name: "is_published", label: "Published", type: "boolean" },
    ],
    list,
    create: (payload) => create(payload),
    update: (id, payload) => update(id, payload),
    delete: remove,
    getRecordWorkflowActions:
      publish && unpublish
        ? (record) => [
            {
              label: "Publish",
              successMessage: `${title} published`,
              payload: () => ({ is_published: true, status: "published" }),
              run: () => publish(record.id),
              confirmTitle: `Publish ${title.toLowerCase()}?`,
              confirmDescription: `This will publish "${titleOf(record)}" to its public-facing portal surface.`,
            },
            {
              label: "Unpublish",
              variant: "outline",
              successMessage: `${title} unpublished`,
              payload: () => ({ is_published: false, status: "draft" }),
              run: () => unpublish(record.id),
              confirmTitle: `Unpublish ${title.toLowerCase()}?`,
              confirmDescription: `This will remove "${titleOf(record)}" from public visibility.`,
            },
          ]
        : undefined,
    getRecordTitle: titleOf,
    getRecordMeta: (record) =>
      metaOf(record, ["status", "published_at", "updated_at"]),
    emptyMessage: `No ${title.toLowerCase()} records were returned.`,
    buildPayload: (values) =>
      commonContentPayload(
        values,
        scopeType === "corporate" ? undefined : scopeType,
      ),
    viewScopes: ["content.view", ...manageScopes],
    manageScopes,
    deleteScopes: ["content.publish", ...manageScopes],
  };
}

function administrationContentResource<TRecord extends PortalRecord>({
  key,
  title,
  description,
  api,
  manageScopes,
}: {
  key: string;
  title: string;
  description: string;
  api: {
    listAdmin: (filters?: PortalPayload) => Promise<{ data?: TRecord[] }>;
    create: (payload: PortalPayload) => Promise<unknown>;
    update: (id: string, payload: PortalPayload) => Promise<unknown>;
    delete: (id: string) => Promise<unknown>;
    publish: (id: string) => Promise<unknown>;
    unpublish: (id: string) => Promise<unknown>;
  };
  manageScopes: string[];
}): PortalResourceConfig<TRecord, PortalPayload> {
  return {
    key,
    title,
    description,
    backHref: "/institutional-administration",
    queryKey: ["institutional-administration", key],
    portalScope: {
      typeField: "scope_type",
      idField: "scope_id",
      allowedScopeTypes: ["university", "division", "wing", "department"],
    },
    fields: [...contentFields(), ...scopeEntityFields("administration")],
    listFilters: [
      {
        name: "status",
        label: "Status",
        type: "select",
        options: contentStatusOptions,
      },
      ...scopeEntityFilters("administration"),
      { name: "is_published", label: "Published", type: "boolean" },
    ],
    list: (filters) => api.listAdmin({ ...pageParams, ...filters }),
    create: (payload) => api.create(payload),
    update: (id, payload) => api.update(id, payload),
    delete: (id) => api.delete(id),
    getRecordWorkflowActions: (record) => [
      {
        label: record.is_published ? "Unpublish" : "Publish",
        variant: record.is_published ? "outline" : undefined,
        successMessage: record.is_published ? "Unpublished" : "Published",
        payload: { is_published: !record.is_published },
        run: record.is_published
          ? (item) => api.unpublish(item.id)
          : (item) => api.publish(item.id),
        confirmTitle: record.is_published ? "Unpublish item?" : "Publish item?",
        confirmDescription: record.is_published
          ? `This removes "${titleOf(record)}" from public office pages.`
          : `This publishes "${titleOf(record)}" to the selected office scope.`,
      },
    ],
    getRecordTitle: titleOf,
    getRecordMeta: (record) =>
      metaOf(record, ["scope_type", "status", "is_published", "updated_at"]),
    emptyMessage: `No ${title.toLowerCase()} records were returned.`,
    buildPayload: (values) => ({
      ...commonContentPayload(values),
      ...normalizeScopePayload(values),
      is_main: values.is_main ?? values.scope_type === "university",
    }),
    validate: validateScopeValues,
    viewScopes: ["administration.view", "office.view", "content.view"],
    manageScopes,
    deleteScopes: ["content.publish", ...manageScopes],
  };
}

const governanceResources: Record<string, PortalResourceConfig<any, any>> = {
  council: {
    key: "council",
    title: "Council & Boards",
    description:
      "Manage council, UMB, registrars, committees, and governance bodies.",
    backHref: "/governance",
    queryKey: ["governance", "boards"],
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "slug", label: "Slug" },
      {
        name: "board_type",
        label: "Board Type",
        type: "select",
        options: [
          { label: "Council", value: "council" },
          { label: "Management Board", value: "management_board" },
          { label: "Committee", value: "committee" },
          { label: "Registrar Office", value: "registrar_office" },
          { label: "Directorate", value: "directorate" },
        ],
      },
      { name: "description", label: "Description", type: "textarea" },
      { name: "mandate", label: "Mandate", type: "textarea" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
    listFilters: [
      {
        name: "board_type",
        label: "Board Type",
        type: "select",
        options: [
          { label: "Council", value: "council" },
          { label: "Management Board", value: "management_board" },
          { label: "Committee", value: "committee" },
        ],
      },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
    list: (filters) => governanceApi.listBoards(filters),
    create: (payload) => governanceApi.createBoard(payload),
    update: (id, payload) => governanceApi.updateBoard(id, payload),
    delete: (id) => governanceApi.deleteBoard(id),
    getRecordTitle: (record) => record.name,
    getRecordMeta: (record) =>
      metaOf(record, ["board_type", "status", "updated_at"]),
    getRecordDetailHref: (record) => `/governance/boards/${record.id}`,
    emptyMessage: "No governance bodies were returned.",
    buildPayload: (values) => ({
      name: values.name,
      slug: values.slug,
      board_type: values.board_type || "committee",
      description: values.description,
      mandate: values.mandate,
      status: values.status || "draft",
      is_active: values.is_active,
    }),
    viewScopes: ["governance.view", "governance.manage_boards"],
    manageScopes: ["governance.manage_boards"],
  } as PortalResourceConfig<Board>,
  divisions: {
    key: "divisions",
    title: "Divisions",
    description:
      "Manage university divisions used by the governance structure.",
    backHref: "/governance",
    queryKey: ["governance", "divisions"],
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "slug", label: "Slug" },
      { name: "code", label: "Code" },
      { name: "division_type", label: "Division Type" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
    listFilters: yesNoFilters,
    list: (filters) => divisionsApi.listAdmin(filters),
    create: (payload) => divisionsApi.create(payload),
    update: (id, payload) => divisionsApi.update(id, payload),
    delete: (id) => divisionsApi.delete(id),
    getRecordTitle: (record) => record.name,
    getRecordMeta: (record) =>
      metaOf(record, ["code", "division_type", "updated_at"]),
    emptyMessage: "No divisions were returned.",
    viewScopes: ["governance.view", "governance.manage_divisions"],
    manageScopes: [
      "governance.manage_divisions",
      "organization.manage_divisions",
    ],
  } as PortalResourceConfig<Division>,
  wings: {
    key: "wings",
    title: "Division Wings",
    description: "Manage administrative wings under university divisions.",
    backHref: "/governance",
    queryKey: ["governance", "wings"],
    fields: [
      {
        name: "division_id",
        label: "Division",
        required: true,
        type: "entity",
        relation: { adapter: "division", filters: { is_active: true } },
      },
      { name: "name", label: "Name", required: true },
      { name: "slug", label: "Slug" },
      { name: "code", label: "Code" },
      { name: "wing_type", label: "Wing Type" },
      {
        name: "head_id",
        label: "Head",
        type: "entity",
        relation: {
          adapter: "person",
          filters: { status: "active" },
          allowClear: true,
        },
      },
      { name: "description", label: "Description", type: "textarea" },
      { name: "mandate", label: "Mandate", type: "textarea" },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Phone" },
      { name: "office_location", label: "Office Location" },
      { name: "is_public", label: "Public", type: "boolean" },
      { name: "is_active", label: "Active", type: "boolean" },
      { name: "display_order", label: "Display Order", type: "number" },
    ],
    listFilters: [
      {
        name: "division_id",
        label: "Division",
        type: "entity",
        relation: { adapter: "division", filters: { is_active: true } },
      },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
    list: async (filters) => {
      const divisionId = filters?.division_id || (await firstDivisionId());
      if (!divisionId) return { data: [] };
      return wingsApi.listByDivision(String(divisionId), {
        fields: undefined,
        is_active: filters?.is_active as boolean | undefined,
      });
    },
    create: (payload) => wingsApi.create(payload),
    update: (id, payload) => wingsApi.update(id, payload),
    getRecordTitle: (record) => record.name,
    getRecordMeta: (record) =>
      metaOf(record, ["code", "wing_type", "updated_at"]),
    emptyMessage:
      "No division wings were returned. Select or create a division first.",
    viewScopes: ["governance.view", "governance.manage_divisions"],
    manageScopes: [
      "governance.manage_divisions",
      "organization.manage_divisions",
    ],
    canDelete: false,
  } as PortalResourceConfig<Wing>,
  "staff-assignments": {
    key: "staff-assignments",
    title: "Governance Staff Assignments",
    description: "Assign council, registrar, DVC, and governance office roles.",
    backHref: "/governance",
    queryKey: ["governance", "staff-assignments"],
    fields: [
      {
        name: "person_id",
        label: "Person",
        required: true,
        type: "entity",
        relation: { adapter: "person", filters: { status: "active" } },
      },
      {
        name: "entity",
        label: "Office / Entity",
        type: "entity-record",
        entityRecord: {
          typeName: "entity_type",
          idName: "entity_id",
          configs: staffAssignmentEntityConfigs,
          description:
            "Choose the office, directorate, school, department, board, or university-level scope for this role.",
          typePlaceholder: "Select office type",
          recordPlaceholder: "Select office or unit",
          allowNone: false,
        },
      },
      { name: "role", label: "Role", required: true },
      { name: "title", label: "Public Title" },
      { name: "start_date", label: "Start Date", type: "date" },
      { name: "end_date", label: "End Date", type: "date" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
      { name: "is_primary", label: "Primary", type: "boolean" },
      { name: "is_public", label: "Public", type: "boolean" },
    ],
    listFilters: [
      {
        name: "entity_type",
        label: "Entity Type",
        type: "select",
        options: staffEntityTypeOptions,
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
    ],
    list: (filters) =>
      staffApi.listAssignments({
        ...filters,
        page: undefined,
        per_page: undefined,
        fields:
          "id,person_id,entity_type,entity_id,role,title,hierarchy_level,is_primary,is_acting,is_public,start_date,end_date,status,display_order",
        include:
          "person:id,title,first_name,middle_name,last_name,full_name,email,photo_url;entity",
      }),
    create: (payload) => staffApi.createAssignment(payload as any),
    update: (id, payload) => staffApi.updateAssignment(id, payload as any),
    delete: (id) => staffApi.deleteAssignment(id),
    getRecordTitle: (record) => staffAssignmentTitle(record),
    getRecordMeta: (record) =>
      joinMetaValues([
        record.entity?.name,
        record.entity?.name ? undefined : record.entity_type,
        record.status,
        record.start_date,
      ]),
    getRecordWorkflowActions: () => [
      {
        label: "Activate",
        successMessage: "Assignment activated",
        payload: { status: "active" },
      },
      {
        label: "End",
        variant: "outline",
        successMessage: "Assignment ended",
        payload: { status: "ended" },
      },
    ],
    emptyMessage: "No governance staff assignments were returned.",
    buildPayload: (values) => ({
      person_id: values.person_id,
      entity_type: values.entity_type || "university",
      entity_id:
        values.entity_type === "university" || values.entity_id === "__university__"
          ? null
          : values.entity_id,
      role: values.role,
      title: values.title,
      start_date: values.start_date,
      end_date: values.end_date,
      status: values.status || "active",
      is_primary: values.is_primary,
      is_public: values.is_public,
      hierarchy_level: values.hierarchy_level ?? 1,
    }),
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.entity_type) {
        errors.entity = "Choose the office or entity type for this assignment.";
      } else if (values.entity_type !== "university" && !values.entity_id) {
        errors.entity = "Choose the office or unit for this assignment.";
      }
      return errors;
    },
    viewScopes: ["staff.view_assignments", "governance.view"],
    manageScopes: ["staff.manage_assignments", "governance.manage_boards"],
  } as PortalResourceConfig<StaffAssignment>,
  documents: {
    key: "documents",
    title: "Policies & Documents",
    description:
      "Manage governance policies, charters, and official documents.",
    backHref: "/governance",
    queryKey: ["governance", "documents"],
    fields: documentFields("governance"),
    listFilters: [
      {
        name: "document_type",
        label: "Document Type",
        type: "select",
        options: [
          { label: "Policy", value: "policy" },
          { label: "Charter", value: "charter" },
          { label: "Report", value: "report" },
          { label: "Minutes", value: "minutes" },
        ],
      },
    ],
    list: (filters) =>
      documentsApi.listAdmin({
        ...pageParams,
        scope_type: "governance",
        ...filters,
      }),
    create: (payload) => documentsApi.create(payload),
    update: (id, payload) => documentsApi.update(id, payload),
    delete: (id) => documentsApi.delete(id),
    getRecordTitle: titleOf,
    getRecordMeta: (record) =>
      metaOf(record, ["document_type", "category", "status"]),
    emptyMessage: "No governance documents were returned.",
    buildPayload: (values) => ({
      ...values,
      scope_type: "governance",
    }),
    viewScopes: ["policy.view", "governance.view"],
    manageScopes: [
      "policy.manage",
      "policy.publish",
      "governance.manage_boards",
    ],
  } as PortalResourceConfig<Document>,
};

const administrationResources: Record<string, PortalResourceConfig<any, any>> = {
  divisions: {
    ...governanceResources.divisions,
    title: "DVC Divisions & Directorates",
    description:
      "Manage DVC divisions, high-level directorates, mandates, contacts, and public office content.",
    backHref: "/institutional-administration",
    queryKey: ["institutional-administration", "divisions"],
    list: (filters) => divisionsApi.listAdmin({ ...pageParams, ...filters }),
    viewScopes: ["administration.view", "office.view"],
    manageScopes: ["administration.manage_units"],
  },
  offices: {
    ...governanceResources.wings,
    key: "offices",
    title: "Registrar Offices & Wings",
    description:
      "Manage registrar offices, administrative wings, service units, contacts, and public office details.",
    backHref: "/institutional-administration",
    queryKey: ["institutional-administration", "offices"],
    list: (filters) => wingsApi.listAdmin({ ...pageParams, ...filters }),
    viewScopes: ["administration.view", "office.view"],
    manageScopes: ["administration.manage_units", "office.manage_content"],
  },
  "staff-assignments": {
    ...governanceResources["staff-assignments"],
    title: "Office Staff Assignments",
    description:
      "Attach staff to VC, DVC, registrar, directorate, and administrative office roles.",
    backHref: "/institutional-administration",
    queryKey: ["institutional-administration", "staff-assignments"],
    portalScope: {
      typeField: "entity_type",
      idField: "entity_id",
      allowedScopeTypes: ["university", "division", "wing", "department"],
    },
    viewScopes: ["staff.view_assignments", "office.view", "administration.view"],
    manageScopes: ["staff.manage_assignments", "office.manage_staff", "administration.manage_staff"],
  },
  news: administrationContentResource<News>({
    key: "news",
    title: "Office News",
    description:
      "Manage public news updates for VC, DVC, registrar, directorate, and administrative offices.",
    api: newsApi,
    manageScopes: ["office.manage_content", "administration.manage_content", "content.manage_news"],
  }),
  notices: administrationContentResource<Announcement>({
    key: "notices",
    title: "Office Notices",
    description:
      "Manage notices and announcements owned by administrative offices.",
    api: announcementsApi,
    manageScopes: [
      "office.manage_content",
      "administration.manage_content",
      "content.manage_announcements",
    ],
  }),
  events: administrationContentResource<Event>({
    key: "events",
    title: "Office Events",
    description:
      "Manage events, deadlines, and public calendars for administrative offices.",
    api: eventsApi,
    manageScopes: ["office.manage_content", "administration.manage_content", "content.manage_events"],
  }),
  documents: {
    ...governanceResources.documents,
    title: "Office Documents & Media",
    description:
      "Manage public documents, service charters, policy files, and office media for administrative units.",
    backHref: "/institutional-administration",
    queryKey: ["institutional-administration", "documents"],
    portalScope: {
      typeField: "scope_type",
      idField: "scope_id",
      allowedScopeTypes: ["university", "division", "wing", "department"],
    },
    fields: documentFields("administration"),
    listFilters: [
      {
        name: "document_type",
        label: "Document Type",
        type: "select",
        options: [
          { label: "Policy", value: "policy" },
          { label: "Charter", value: "charter" },
          { label: "Report", value: "report" },
          { label: "Minutes", value: "minutes" },
        ],
      },
      ...scopeEntityFilters("administration"),
    ],
    list: (filters) =>
      documentsApi.listAdmin({
        ...pageParams,
        ...filters,
      }),
    buildPayload: (values) => ({
      ...values,
      ...normalizeScopePayload(values),
    }),
    validate: validateScopeValues,
    viewScopes: ["administration.view", "office.view", "policy.view"],
    manageScopes: ["office.manage_content", "administration.manage_content", "policy.manage"],
  },
  faqs: {
    key: "faqs",
    title: "Office FAQs",
    description:
      "Manage public frequently asked questions for registrar offices, DVC divisions, and administrative departments.",
    backHref: "/institutional-administration",
    queryKey: ["institutional-administration", "faqs"],
    portalScope: {
      typeField: "scope_type",
      idField: "scope_id",
      allowedScopeTypes: ["university", "division", "wing", "department"],
    },
    fields: faqFields("administration"),
    listFilters: [
      ...scopeEntityFilters("administration"),
      { name: "is_public", label: "Public", type: "boolean" },
    ],
    list: (filters) => faqsApi.listAdmin({ ...pageParams, ...filters }),
    create: (payload) => faqsApi.create(payload),
    update: (id, payload) => faqsApi.update(id, payload),
    delete: (id) => faqsApi.delete(id),
    getRecordTitle: (record) => record.question,
    getRecordMeta: (record) =>
      metaOf(record, ["scope_type", "category", "status", "updated_at"]),
    emptyMessage: "No office FAQs were returned.",
    buildPayload: (values) => ({
      ...values,
      ...normalizeScopePayload(values),
      status: values.status || "published",
    }),
    validate: validateScopeValues,
    viewScopes: ["administration.view", "office.view", "content.view"],
    manageScopes: ["office.manage_content", "administration.manage_content", "support.manage_faqs"],
  } as PortalResourceConfig<FAQ>,
  contacts: {
    key: "contacts",
    title: "Office Contacts",
    description:
      "Manage public contact directory entries for offices, directorates, and administrative units.",
    backHref: "/institutional-administration",
    queryKey: ["institutional-administration", "contacts"],
    portalScope: {
      typeField: "scope_type",
      idField: "scope_id",
      allowedScopeTypes: ["university", "division", "wing", "department"],
    },
    fields: contactFields("administration"),
    listFilters: [
      ...scopeEntityFilters("administration"),
      { name: "is_public", label: "Public", type: "boolean" },
    ],
    list: (filters) => contactsApi.listAdmin({ ...pageParams, ...filters }),
    create: (payload) => contactsApi.create(payload),
    update: (id, payload) => contactsApi.update(id, payload),
    getRecordTitle: (record) => record.name,
    getRecordMeta: (record) =>
      metaOf(record, ["scope_type", "contact_type", "email", "status"]),
    emptyMessage: "No office contacts were returned.",
    buildPayload: (values) => ({
      ...values,
      ...normalizeScopePayload(values),
      phone: splitList(values.phone),
      status: values.status || "active",
    }),
    validate: validateScopeValues,
    viewScopes: ["administration.view", "office.view", "content.view"],
    manageScopes: ["office.manage_content", "administration.manage_content", "support.manage_contacts"],
    canDelete: false,
  } as PortalResourceConfig<ContactDirectory>,
};

const schoolResources: Record<string, PortalResourceConfig<any, any>> = {
  profiles: {
    key: "profiles",
    title: "School Profiles",
    description:
      "Manage school mini-site profiles, codes, descriptions, and publication state.",
    backHref: "/schools",
    queryKey: ["schools", "profiles"],
    portalScope: {
      allowedScopeTypes: ["school"],
      stampPayload: false,
      lockedCanCreate: false,
    },
    fields: [
      { name: "name", label: "School Name", required: true },
      { name: "slug", label: "Slug" },
      { name: "code", label: "Code" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "school_type", label: "School Type" },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Phone" },
      { name: "is_active", label: "Active", type: "boolean" },
      { name: "is_public", label: "Public", type: "boolean" },
    ],
    listFilters: yesNoFilters,
    list: (filters) => schoolsApi.listAdmin({ ...pageParams, ...filters }),
    create: (payload) => schoolsApi.create(payload),
    update: (id, payload) => schoolsApi.update(id, payload),
    delete: (id) => schoolsApi.delete(id),
    getRecordTitle: (record) => record.name,
    getRecordMeta: (record) =>
      metaOf(record, ["code", "school_type", "updated_at"]),
    emptyMessage: "No schools were returned.",
    viewScopes: ["academic.view", "academic.manage_schools"],
    manageScopes: ["academic.manage_schools"],
  } as PortalResourceConfig<School>,
  departments: {
    key: "departments",
    title: "School Departments",
    description: "Manage departments attached to schools.",
    backHref: "/schools",
    queryKey: ["schools", "departments"],
    portalScope: {
      idField: "school_id",
      allowedScopeTypes: ["school"],
    },
    fields: [
      { name: "name", label: "Department Name", required: true },
      { name: "slug", label: "Slug" },
      { name: "code", label: "Code" },
      {
        name: "school_id",
        label: "School",
        type: "entity",
        relation: { adapter: "school", filters: { is_active: true } },
      },
      {
        name: "department_type",
        label: "Department Type",
        type: "select",
        options: [
          { label: "Academic", value: "academic" },
          { label: "Administrative", value: "administrative" },
        ],
      },
      { name: "description", label: "Description", type: "textarea" },
      { name: "is_active", label: "Active", type: "boolean" },
      { name: "is_public", label: "Public", type: "boolean" },
    ],
    listFilters: [
      {
        name: "school_id",
        label: "School",
        type: "entity",
        relation: { adapter: "school", filters: { is_active: true } },
      },
      {
        name: "department_type",
        label: "Type",
        type: "select",
        options: [
          { label: "Academic", value: "academic" },
          { label: "Administrative", value: "administrative" },
        ],
      },
    ],
    list: (filters) => departmentsApi.listAdmin({ ...pageParams, ...filters }),
    create: (payload) => departmentsApi.create(payload),
    update: (id, payload) => departmentsApi.update(id, payload),
    delete: (id) => departmentsApi.delete(id),
    getRecordTitle: (record) => record.name,
    getRecordMeta: (record) =>
      metaOf(record, ["code", "school_name", "department_type"]),
    emptyMessage: "No school departments were returned.",
    viewScopes: ["academic.view", "academic.manage_departments"],
    manageScopes: ["academic.manage_departments"],
  } as PortalResourceConfig<Department>,
  programmes: {
    key: "programmes",
    title: "School Programmes",
    description: "Manage school-scoped programmes.",
    backHref: "/schools",
    queryKey: ["schools", "programmes"],
    portalScope: {
      idField: "school_id",
      allowedScopeTypes: ["school"],
    },
    fields: [
      { name: "name", label: "Programme Name", required: true },
      { name: "slug", label: "Slug" },
      { name: "code", label: "Code" },
      {
        name: "school_id",
        label: "School",
        type: "entity",
        relation: { adapter: "school", filters: { is_active: true } },
      },
      {
        name: "department_id",
        label: "Department",
        type: "entity",
        relation: {
          adapter: "department",
          filters: { is_active: true },
          allowClear: true,
        },
      },
      { name: "level", label: "Level" },
      { name: "mode_of_study", label: "Mode of Study" },
      { name: "duration", label: "Duration" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
    listFilters: [
      {
        name: "school_id",
        label: "School",
        type: "entity",
        relation: { adapter: "school", filters: { is_active: true } },
      },
      {
        name: "department_id",
        label: "Department",
        type: "entity",
        relation: { adapter: "department", filters: { is_active: true } },
      },
    ],
    list: (filters) => programmesApi.listAdmin({ ...pageParams, ...filters }),
    create: (payload) => programmesApi.create(payload),
    update: (id, payload) => programmesApi.update(id, payload),
    delete: (id) => programmesApi.delete(id),
    getRecordTitle: (record) => record.name,
    getRecordMeta: (record) =>
      metaOf(record, ["code", "level", "department_name"]),
    getRecordDetailHref: (record) => `/schools/programmes/${record.id}`,
    emptyMessage: "No school programmes were returned.",
    viewScopes: ["academic.view", "programmes.view"],
    manageScopes: ["academic.manage_programmes", "programmes.manage"],
  } as PortalResourceConfig<Programme>,
  calendars: {
    key: "calendars",
    title: "Academic Calendars",
    description:
      "Manage academic years, semester windows, registration, teaching, exams, and result timelines.",
    backHref: "/schools",
    queryKey: ["schools", "calendars"],
    fields: [
      { name: "academic_year", label: "Academic Year", required: true },
      { name: "semester", label: "Semester", required: true, type: "number" },
      { name: "start_date", label: "Start Date", type: "date" },
      { name: "end_date", label: "End Date", type: "date" },
      { name: "registration_start", label: "Registration Start", type: "date" },
      { name: "registration_end", label: "Registration End", type: "date" },
      {
        name: "late_registration_end",
        label: "Late Registration End",
        type: "date",
      },
      { name: "teaching_start", label: "Teaching Start", type: "date" },
      { name: "teaching_end", label: "Teaching End", type: "date" },
      { name: "exam_start", label: "Exam Start", type: "date" },
      { name: "exam_end", label: "Exam End", type: "date" },
      { name: "results_release", label: "Results Release", type: "date" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
    ],
    listFilters: [
      {
        name: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
    ],
    list: (filters) =>
      academicCalendarsApi.listAdmin({ ...pageParams, ...filters }),
    create: (payload) => academicCalendarsApi.create(payload),
    update: (id, payload) => academicCalendarsApi.update(id, payload),
    delete: (id) => academicCalendarsApi.delete(id),
    getRecordTitle: (record) =>
      `${record.academic_year} Semester ${record.semester}`,
    getRecordMeta: (record) =>
      metaOf(record, ["status", "start_date", "end_date"]),
    emptyMessage: "No academic calendars were returned.",
    viewScopes: ["academic.view", "academic.manage_calendars"],
    manageScopes: ["academic.manage_calendars", "academic.manage_programmes"],
  } as PortalResourceConfig<AcademicCalendar>,
  intakes: {
    key: "intakes",
    title: "Intakes",
    description: "Manage admission intakes used by programme admissions.",
    backHref: "/schools",
    queryKey: ["schools", "intakes"],
    fields: [
      {
        name: "academic_calendar_id",
        label: "Academic Calendar",
        required: true,
        type: "entity",
        relation: { adapter: "academicCalendar" },
      },
      { name: "name", label: "Name", required: true },
      { name: "slug", label: "Slug" },
      { name: "code", label: "Code" },
      { name: "application_start", label: "Application Start", type: "date" },
      { name: "application_end", label: "Application End", type: "date" },
      {
        name: "late_application_end",
        label: "Late Application End",
        type: "date",
      },
      { name: "max_students", label: "Max Students", type: "number" },
      { name: "is_open", label: "Open", type: "boolean" },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
    listFilters: [
      {
        name: "academic_calendar_id",
        label: "Academic Calendar",
        type: "entity",
        relation: { adapter: "academicCalendar" },
      },
      { name: "is_open", label: "Open", type: "boolean" },
    ],
    list: (filters) => intakesApi.listAdmin({ ...pageParams, ...filters }),
    create: (payload) => intakesApi.create(payload),
    update: (id, payload) => intakesApi.update(id, payload),
    delete: (id) => intakesApi.delete(id),
    getRecordTitle: (record) => record.name,
    getRecordMeta: (record) =>
      metaOf(record, ["code", "application_start", "application_end"]),
    emptyMessage: "No intakes were returned.",
    viewScopes: ["academic.view", "academic.manage_intakes"],
    manageScopes: ["academic.manage_intakes", "academic.manage_programmes"],
  } as PortalResourceConfig<Intake>,
  staff: {
    ...governanceResources["staff-assignments"],
    title: "School Staff Assignments",
    description: "Attach staff to school-level academic and administrative roles.",
    backHref: "/schools",
    queryKey: ["schools", "staff-assignments"],
    portalScope: {
      typeField: "entity_type",
      idField: "entity_id",
      allowedScopeTypes: ["school"],
    },
    viewScopes: ["staff.view_assignments", "academic.view"],
    manageScopes: ["staff.manage_assignments", "academic.manage_schools"],
  },
  news: contentResource<News>({
    key: "news",
    title: "School News",
    description: "Manage school-scoped news items.",
    backHref: "/schools",
    scopeType: "school",
    list: (filters) =>
      newsApi.listAdmin({ ...pageParams, scope_type: "school", ...filters }),
    create: (payload) => newsApi.create(payload),
    update: (id, payload) => newsApi.update(id, payload),
    remove: (id) => newsApi.delete(id),
    publish: (id) => newsApi.publish(id),
    unpublish: (id) => newsApi.unpublish(id),
    manageScopes: ["content.manage_news", "academic.manage_schools"],
  }),
  events: contentResource<Event>({
    key: "events",
    title: "School Events",
    description: "Manage school-scoped events.",
    backHref: "/schools",
    scopeType: "school",
    list: (filters) =>
      eventsApi.listAdmin({ ...pageParams, scope_type: "school", ...filters }),
    create: (payload) => eventsApi.create(payload),
    update: (id, payload) => eventsApi.update(id, payload),
    remove: (id) => eventsApi.delete(id),
    publish: (id) => eventsApi.publish(id),
    unpublish: (id) => eventsApi.unpublish(id),
    manageScopes: ["content.manage_events", "academic.manage_schools"],
  }),
  validation: {
    key: "validation",
    title: "School Publication Validation",
    description:
      "Review researcher submissions before research office approval.",
    backHref: "/schools",
    queryKey: ["schools", "publication-validation"],
    fields: [
      { name: "title", label: "Title", required: true },
      {
        name: "publication_type",
        label: "Publication Type",
        type: "select",
        options: [
          { label: "Journal Article", value: "journal_article" },
          { label: "Conference Paper", value: "conference_paper" },
          { label: "Book Chapter", value: "book_chapter" },
          { label: "Report", value: "report" },
        ],
      },
      { name: "abstract", label: "Abstract", type: "textarea" },
      { name: "doi", label: "DOI" },
      { name: "url", label: "URL", type: "url" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
    listFilters: [
      {
        name: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
      {
        name: "publication_type",
        label: "Type",
        type: "select",
        options: [
          { label: "Journal Article", value: "journal_article" },
          { label: "Conference Paper", value: "conference_paper" },
        ],
      },
    ],
    list: (filters) =>
      researchServiceApi.publications.list({
        ...pageParams,
        status: "submitted",
        ...filters,
      }),
    create: (payload) =>
      researchServiceApi.publications.create(
        payload as ResearchPublicationPayload,
      ),
    update: (id, payload) =>
      researchServiceApi.publications.update(id, payload),
    delete: (id) => researchServiceApi.publications.delete(id),
    getRecordTitle: (record) => record.title,
    getRecordMeta: (record) =>
      metaOf(record, ["publication_type", "status", "updated_at"]),
    getRecordWorkflowActions: () => [
      {
        label: "School Approve",
        successMessage: "Submission moved to research office review",
        payload: { status: "school_approved" },
      },
      {
        label: "Return",
        variant: "outline",
        successMessage: "Submission returned for correction",
        payload: { status: "returned_for_correction" },
      },
    ],
    emptyMessage:
      "No publication submissions are waiting for school validation.",
    buildPayload: (values) => ({
      ...values,
      status: values.status || "submitted",
    }),
    viewScopes: ["publications.review", "academic.view"],
    manageScopes: ["publications.review", "academic.manage_schools"],
  } as PortalResourceConfig<ResearchPublication, ResearchPublicationPayload>,
};

const departmentalResources: Record<string, PortalResourceConfig<any, any>> = {
  profiles: {
    ...schoolResources.departments,
    key: "profiles",
    title: "Department Profiles",
    description: "Manage academic and administrative department profiles.",
    backHref: "/departments",
    queryKey: ["departments", "profiles"],
    portalScope: {
      allowedScopeTypes: ["department"],
      stampPayload: false,
      lockedCanCreate: false,
    },
  },
  staff: {
    ...governanceResources["staff-assignments"],
    title: "Department Staff Assignments",
    description: "Attach staff to department academic, technical, and administrative roles.",
    backHref: "/departments",
    queryKey: ["departments", "staff-assignments"],
    portalScope: {
      typeField: "entity_type",
      idField: "entity_id",
      allowedScopeTypes: ["department"],
    },
    viewScopes: ["staff.view_assignments", "academic.view"],
    manageScopes: ["staff.manage_assignments", "academic.manage_departments"],
  },
  programmes: {
    ...schoolResources.programmes,
    title: "Department Programmes",
    description: "Manage programmes owned by academic departments.",
    backHref: "/departments",
    queryKey: ["departments", "programmes"],
    portalScope: {
      idField: "department_id",
      allowedScopeTypes: ["department"],
    },
    getRecordDetailHref: (record: Programme) =>
      `/departments/programmes/${record.id}`,
  },
  notices: contentResource<Announcement>({
    key: "notices",
    title: "Department Notices",
    description: "Manage department-scoped notices and announcements.",
    backHref: "/departments",
    scopeType: "department",
    list: (filters) =>
      announcementsApi.listAdmin({
        ...pageParams,
        scope_type: "department",
        ...filters,
      }),
    create: (payload) => announcementsApi.create(payload),
    update: (id, payload) => announcementsApi.update(id, payload),
    remove: (id) => announcementsApi.delete(id),
    publish: (id) => announcementsApi.publish(id),
    unpublish: (id) => announcementsApi.unpublish(id),
    manageScopes: [
      "content.manage_announcements",
      "academic.manage_departments",
    ],
  }),
  events: contentResource<Event>({
    key: "events",
    title: "Department Events",
    description: "Manage department-scoped events.",
    backHref: "/departments",
    scopeType: "department",
    list: (filters) =>
      eventsApi.listAdmin({
        ...pageParams,
        scope_type: "department",
        ...filters,
      }),
    create: (payload) => eventsApi.create(payload),
    update: (id, payload) => eventsApi.update(id, payload),
    remove: (id) => eventsApi.delete(id),
    publish: (id) => eventsApi.publish(id),
    unpublish: (id) => eventsApi.unpublish(id),
    manageScopes: ["content.manage_events", "academic.manage_departments"],
  }),
  resources: {
    ...governanceResources.documents,
    key: "resources",
    title: "Department Resources",
    description:
      "Manage department files, forms, guides, and service documents.",
    backHref: "/departments",
    queryKey: ["departments", "resources"],
    portalScope: {
      typeField: "scope_type",
      idField: "scope_id",
      allowedScopeTypes: ["department"],
    },
    fields: documentFields("department"),
    listFilters: [
      {
        name: "document_type",
        label: "Document Type",
        type: "select",
        options: [
          { label: "Policy", value: "policy" },
          { label: "Charter", value: "charter" },
          { label: "Report", value: "report" },
          { label: "Minutes", value: "minutes" },
        ],
      },
      ...scopeEntityFilters("department"),
    ],
    list: (filters) =>
      documentsApi.listAdmin({
        ...pageParams,
        scope_type: "department",
        ...filters,
      }),
    buildPayload: (values) => ({
      ...values,
      scope_type: "department",
    }),
  },
  faqs: {
    key: "faqs",
    title: "Department FAQs",
    description: "Manage department-scoped frequently asked questions.",
    backHref: "/departments",
    queryKey: ["departments", "faqs"],
    portalScope: {
      typeField: "scope_type",
      idField: "scope_id",
      allowedScopeTypes: ["department"],
    },
    fields: faqFields("department"),
    listFilters: [
      ...scopeEntityFilters("department"),
      { name: "is_public", label: "Public", type: "boolean" },
    ],
    list: (filters) =>
      faqsApi.listAdmin({ ...pageParams, scope_type: "department", ...filters }),
    create: (payload) => faqsApi.create(payload),
    update: (id, payload) => faqsApi.update(id, payload),
    delete: (id) => faqsApi.delete(id),
    getRecordTitle: (record) => record.question,
    getRecordMeta: (record) =>
      metaOf(record, ["category", "status", "updated_at"]),
    emptyMessage: "No department FAQs were returned.",
    buildPayload: (values) => ({
      ...values,
      scope_type: "department",
      status: values.status || "published",
    }),
    viewScopes: ["content.view", "academic.view"],
    manageScopes: ["support.manage_faqs", "content.manage_pages", "academic.manage_departments"],
  } as PortalResourceConfig<FAQ>,
  contacts: {
    key: "contacts",
    title: "Department Contacts",
    description: "Manage department-scoped contact directory entries.",
    backHref: "/departments",
    queryKey: ["departments", "contacts"],
    portalScope: {
      typeField: "scope_type",
      idField: "scope_id",
      allowedScopeTypes: ["department"],
    },
    fields: contactFields("department"),
    listFilters: [
      ...scopeEntityFilters("department"),
      { name: "is_public", label: "Public", type: "boolean" },
    ],
    list: (filters) =>
      contactsApi.listAdmin({ ...pageParams, scope_type: "department", ...filters }),
    create: (payload) => contactsApi.create(payload),
    update: (id, payload) => contactsApi.update(id, payload),
    getRecordTitle: (record) => record.name,
    getRecordMeta: (record) =>
      metaOf(record, ["contact_type", "email", "status"]),
    emptyMessage: "No department contacts were returned.",
    buildPayload: (values) => ({
      ...values,
      scope_type: "department",
      phone: splitList(values.phone),
      status: values.status || "active",
    }),
    viewScopes: ["content.view", "academic.view"],
    manageScopes: ["support.manage_contacts", "content.manage_pages", "academic.manage_departments"],
    canDelete: false,
  } as PortalResourceConfig<ContactDirectory>,
};

const corporateResources: Record<string, PortalResourceConfig<any, any>> = {
  news: contentResource<News>({
    key: "news",
    title: "Newsroom",
    description: "Manage university news and newsroom publishing.",
    backHref: "/corporate-communication",
    scopeType: "corporate",
    list: (filters) =>
      newsApi.listAdmin({ ...pageParams, is_main: true, ...filters }),
    create: (payload) => newsApi.create(payload),
    update: (id, payload) => newsApi.update(id, payload),
    remove: (id) => newsApi.delete(id),
    publish: (id) => newsApi.publish(id),
    unpublish: (id) => newsApi.unpublish(id),
    manageScopes: ["content.manage_news", "content.publish"],
  }),
  "press-releases": contentResource<Blog>({
    key: "press-releases",
    title: "Press Releases",
    description: "Manage press releases and long-form media posts.",
    backHref: "/corporate-communication",
    scopeType: "corporate",
    list: (filters) =>
      blogsApi.listAdmin({ ...pageParams, is_main: true, ...filters }),
    create: (payload) => blogsApi.create(payload),
    update: (id, payload) => blogsApi.update(id, payload),
    remove: (id) => blogsApi.delete(id),
    publish: (id) => blogsApi.publish(id),
    unpublish: (id) => blogsApi.unpublish(id),
    manageScopes: ["content.manage_blogs", "content.publish"],
  }),
  notices: contentResource<Announcement>({
    key: "notices",
    title: "Public Notices",
    description: "Manage university-wide notices and announcements.",
    backHref: "/corporate-communication",
    scopeType: "corporate",
    list: (filters) =>
      announcementsApi.listAdmin({ ...pageParams, is_main: true, ...filters }),
    create: (payload) => announcementsApi.create(payload),
    update: (id, payload) => announcementsApi.update(id, payload),
    remove: (id) => announcementsApi.delete(id),
    publish: (id) => announcementsApi.publish(id),
    unpublish: (id) => announcementsApi.unpublish(id),
    manageScopes: ["content.manage_announcements", "content.publish"],
  }),
  events: contentResource<Event>({
    key: "events",
    title: "Events Calendar",
    description: "Manage public university events.",
    backHref: "/corporate-communication",
    scopeType: "corporate",
    list: (filters) =>
      eventsApi.listAdmin({ ...pageParams, is_main: true, ...filters }),
    create: (payload) => eventsApi.create(payload),
    update: (id, payload) => eventsApi.update(id, payload),
    remove: (id) => eventsApi.delete(id),
    publish: (id) => eventsApi.publish(id),
    unpublish: (id) => eventsApi.unpublish(id),
    manageScopes: ["content.manage_events", "content.publish"],
  }),
  "homepage-features": {
    key: "homepage-features",
    title: "Homepage Features",
    description: "Manage homepage slider groups used by the public site.",
    backHref: "/corporate-communication",
    queryKey: ["corporate", "slider-groups"],
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "slug", label: "Slug" },
      { name: "location", label: "Location" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "is_main", label: "Main", type: "boolean" },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
    listFilters: [
      { name: "is_main", label: "Main", type: "boolean" },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
    list: (filters) =>
      slidersApi.listGroups({ ...filters, is_main: filters?.is_main ?? true }),
    create: (payload) => slidersApi.createGroup(payload as any),
    update: (id, payload) => slidersApi.updateGroup(id, payload),
    delete: (id) => slidersApi.deleteGroup(id),
    getRecordTitle: (record) => record.name,
    getRecordMeta: (record) =>
      metaOf(record, ["location", "slug", "updated_at"]),
    emptyMessage: "No homepage slider groups were returned.",
    viewScopes: ["marketing.view", "marketing.manage_sliders"],
    manageScopes: ["marketing.manage_sliders"],
  } as PortalResourceConfig<SliderGroup>,
  sliders: {
    key: "sliders",
    title: "Homepage Slider Items",
    description:
      "Manage individual homepage feature slides and their publish state.",
    backHref: "/corporate-communication",
    queryKey: ["corporate", "sliders"],
    fields: [
      {
        name: "slider_group_id",
        label: "Slider Group",
        type: "entity",
        relation: {
          adapter: "sliderGroup",
          filters: { is_main: true },
          allowClear: true,
        },
      },
      { name: "title", label: "Title", required: true },
      { name: "subtitle", label: "Subtitle" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "button_text", label: "Button Text" },
      { name: "button_url", label: "Button URL", type: "url" },
      { name: "link_url", label: "Link URL", type: "url" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: contentStatusOptions,
      },
      { name: "display_order", label: "Display Order", type: "number" },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
    listFilters: [
      {
        name: "slider_group_id",
        label: "Slider Group",
        type: "entity",
        relation: { adapter: "sliderGroup", filters: { is_main: true } },
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: contentStatusOptions,
      },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
    list: (filters) =>
      slidersApi.listAdminSliders({ ...filters, is_main: true }),
    create: async (payload) => {
      const groupId = payload.slider_group_id || (await firstSliderGroupId());
      if (!groupId)
        throw new Error(
          "Create a homepage feature group before adding slider items.",
        );
      return slidersApi.createSlider(String(groupId), payload);
    },
    update: (id, payload) => slidersApi.updateSlider(id, payload),
    delete: (id) => slidersApi.deleteSlider(id),
    getRecordTitle: titleOf,
    getRecordMeta: (record) =>
      metaOf(record, ["status", "display_order", "updated_at"]),
    getRecordWorkflowActions: () => [
      {
        label: "Publish",
        successMessage: "Slider item published",
        payload: { status: "published", is_active: true },
      },
      {
        label: "Archive",
        variant: "outline",
        successMessage: "Slider item archived",
        payload: { status: "archived", is_active: false },
      },
    ],
    emptyMessage: "No homepage slider items were returned.",
    buildPayload: (values) => ({
      ...values,
      status: values.status || "draft",
      display_order: values.display_order ?? 0,
    }),
    viewScopes: ["marketing.view", "marketing.manage_sliders"],
    manageScopes: ["marketing.manage_sliders"],
  } as PortalResourceConfig<Slider>,
  "media-folders": {
    key: "media-folders",
    title: "Media Folders",
    description: "Manage folders for corporate communication media assets.",
    backHref: "/corporate-communication",
    queryKey: ["corporate", "media-folders"],
    fields: [
      { name: "name", label: "Folder Name", required: true },
      { name: "slug", label: "Slug" },
      { name: "description", label: "Description", type: "textarea" },
      {
        name: "parent_id",
        label: "Parent Folder",
        type: "entity",
        relation: { adapter: "mediaFolder", allowClear: true },
      },
      { name: "is_public", label: "Public", type: "boolean" },
    ],
    list: () => mediaApi.listFolders(),
    create: (payload) => mediaApi.createFolder(payload as any),
    update: (id, payload) => mediaApi.updateFolder(id, payload as any),
    delete: (id) => mediaApi.deleteFolder(id),
    getRecordTitle: (record) => record.name,
    getRecordMeta: (record) =>
      metaOf(record, ["slug", "is_public", "updated_at"]),
    emptyMessage: "No media folders were returned.",
    viewScopes: ["media.view", "media.manage"],
    manageScopes: ["media.manage", "media.upload"],
    deleteScopes: ["media.delete", "media.manage"],
  } as PortalResourceConfig<MediaFolder>,
  "media-assets": {
    key: "media-assets",
    title: "Media Assets",
    description: "Review, classify, and remove uploaded media assets.",
    backHref: "/corporate-communication",
    queryKey: ["corporate", "media-assets"],
    fields: [
      { name: "title", label: "Title" },
      { name: "alt_text", label: "Alt Text" },
      { name: "caption", label: "Caption", type: "textarea" },
      { name: "description", label: "Description", type: "textarea" },
      {
        name: "folder_id",
        label: "Folder",
        type: "entity",
        relation: { adapter: "mediaFolder", allowClear: true },
      },
      { name: "is_public", label: "Public", type: "boolean" },
    ],
    listFilters: [
      {
        name: "folder_id",
        label: "Folder",
        type: "entity",
        relation: { adapter: "mediaFolder", allowClear: true },
      },
      {
        name: "media_type",
        label: "Media Type",
        type: "select",
        options: [
          { label: "Image", value: "image" },
          { label: "Document", value: "document" },
          { label: "Video", value: "video" },
          { label: "Audio", value: "audio" },
        ],
      },
    ],
    list: (filters) => mediaApi.list({ ...pageParams, ...filters }),
    create: async () => {
      throw new Error("Use the upload control to create media assets.");
    },
    update: (id, payload) => mediaApi.update(id, payload as any),
    delete: (id) => mediaApi.delete(id),
    getRecordTitle: (record) =>
      record.title || record.original_filename || record.filename || "Media asset",
    getRecordMeta: (record) =>
      metaOf(record, ["media_type", "mime_type", "created_at"]),
    emptyMessage: "No media assets were returned.",
    viewScopes: ["media.view", "media.manage"],
    manageScopes: ["media.manage", "media.upload"],
    deleteScopes: ["media.delete", "media.manage"],
    canCreate: false,
  } as PortalResourceConfig<Media>,
  faqs: {
    key: "faqs",
    title: "Public FAQs",
    description: "Manage main-site frequently asked questions.",
    backHref: "/corporate-communication",
    queryKey: ["corporate", "faqs"],
    fields: faqFields(),
    listFilters: [
      { name: "is_public", label: "Public", type: "boolean" },
      { name: "is_main", label: "Main Site", type: "boolean" },
    ],
    list: (filters) =>
      faqsApi.listAdmin({ ...pageParams, is_main: true, ...filters }),
    create: (payload) => faqsApi.create(payload),
    update: (id, payload) => faqsApi.update(id, payload),
    delete: (id) => faqsApi.delete(id),
    getRecordTitle: (record) => record.question,
    getRecordMeta: (record) =>
      metaOf(record, ["category", "status", "updated_at"]),
    emptyMessage: "No public FAQs were returned.",
    buildPayload: (values) => ({
      ...values,
      is_main: values.is_main ?? true,
      status: values.status || "published",
    }),
    viewScopes: ["content.view"],
    manageScopes: ["support.manage_faqs", "content.manage_pages", "content.publish"],
  } as PortalResourceConfig<FAQ>,
  contacts: {
    key: "contacts",
    title: "Contact Directory",
    description:
      "Manage public contact directory entries for corporate communication.",
    backHref: "/corporate-communication",
    queryKey: ["corporate", "contacts"],
    fields: contactFields(),
    listFilters: [
      { name: "is_public", label: "Public", type: "boolean" },
      { name: "is_main", label: "Main Site", type: "boolean" },
    ],
    list: (filters) =>
      contactsApi.listAdmin({ ...pageParams, is_main: true, ...filters }),
    create: (payload) => contactsApi.create(payload),
    update: (id, payload) => contactsApi.update(id, payload),
    getRecordTitle: (record) => record.name,
    getRecordMeta: (record) =>
      metaOf(record, ["contact_type", "email", "status"]),
    emptyMessage: "No contact entries were returned.",
    buildPayload: (values) => ({
      ...values,
      phone: splitList(values.phone),
      is_main: values.is_main ?? true,
      status: values.status || "active",
    }),
    viewScopes: ["content.view"],
    manageScopes: ["support.manage_contacts", "content.manage_pages", "content.publish"],
    canDelete: false,
  } as PortalResourceConfig<ContactDirectory>,
  testimonials: {
    key: "testimonials",
    title: "Testimonials",
    description: "Manage approved stories and quotes used on public pages.",
    backHref: "/corporate-communication",
    queryKey: ["corporate", "testimonials"],
    fields: testimonialFields,
    listFilters: [{ name: "featured_only", label: "Featured", type: "boolean" }],
    list: (filters) => testimonialsApi.listAdmin({ ...pageParams, ...filters }),
    create: (payload) => testimonialsApi.create(payload),
    update: (id, payload) => testimonialsApi.update(id, payload),
    delete: (id) => testimonialsApi.delete(id),
    getRecordTitle: (record) => record.name,
    getRecordMeta: (record) =>
      metaOf(record, ["role", "testimonial_type", "is_approved"]),
    getRecordWorkflowActions: (record) => [
      {
        label: record.is_approved ? "Unapprove" : "Approve",
        variant: record.is_approved ? "outline" : undefined,
        successMessage: record.is_approved
          ? "Testimonial unapproved"
          : "Testimonial approved",
        payload: { is_approved: !record.is_approved },
        confirmTitle: record.is_approved
          ? "Unapprove testimonial?"
          : "Approve testimonial?",
        confirmDescription: record.is_approved
          ? `This removes approval from "${record.name}".`
          : `This approves "${record.name}" for public use.`,
      },
    ],
    emptyMessage: "No testimonials were returned.",
    buildPayload: (values) => ({
      ...values,
      testimonial_type: values.testimonial_type || "general",
      display_order: values.display_order ?? 100,
    }),
    viewScopes: ["content.view"],
    manageScopes: ["content.manage", "content.publish"],
  } as PortalResourceConfig<Testimonial>,
};

async function firstSliderGroupId() {
  const groups = await slidersApi.listGroups({ is_main: true });
  return groups.data?.[0]?.id;
}

async function firstDivisionId() {
  const divisions = await divisionsApi.listAdmin({
    page: 1,
    per_page: 1,
    is_active: true,
  });
  return divisions.data?.[0]?.id;
}

const libraryBranchPortalScope = {
  idField: "library_id",
  allowedScopeTypes: ["library"],
};

const researchCenterPortalScope = {
  idField: "center_id",
  allowedScopeTypes: ["research"],
};

const researchResources: Record<string, PortalResourceConfig<any, any>> = {
  projects: {
    key: "projects",
    title: "Research Projects",
    description:
      "Manage research projects, investigators, status, and publication state.",
    backHref: "/research",
    queryKey: ["research-portal", "projects"],
    portalScope: researchCenterPortalScope,
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "slug", label: "Slug" },
      { name: "code", label: "Code" },
      {
        name: "center_id",
        label: "Research Center",
        type: "entity",
        relation: {
          adapter: "researchCenter",
          filters: { is_active: true },
          allowClear: true,
        },
      },
      {
        name: "pi_id",
        label: "Principal Investigator",
        type: "entity",
        relation: {
          adapter: "person",
          filters: { status: "active" },
          allowClear: true,
        },
      },
      { name: "project_type", label: "Project Type" },
      { name: "summary", label: "Summary", type: "textarea" },
      { name: "start_date", label: "Start Date", type: "date" },
      { name: "end_date", label: "End Date", type: "date" },
      { name: "budget", label: "Budget", type: "number" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
      { name: "progress_percentage", label: "Progress %", type: "number" },
      { name: "is_public", label: "Public", type: "boolean" },
      { name: "is_featured", label: "Featured", type: "boolean" },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
    listFilters: [
      {
        name: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
      {
        name: "center_id",
        label: "Center",
        type: "entity",
        relation: { adapter: "researchCenter", filters: { is_active: true } },
      },
    ],
    list: (filters) =>
      researchServiceApi.projects.list({
        ...pageParams,
        fields: "id,title,slug,code,program_id,center_id,project_type,status,is_public,is_featured,is_active",
        include: "center:id,name,code;program:id,name,code",
        ...filters,
      }),
    create: (payload) =>
      researchServiceApi.projects.create(payload as ResearchProjectPayload),
    update: (id, payload) => researchServiceApi.projects.update(id, payload),
    delete: (id) => researchServiceApi.projects.delete(id),
    getRecordTitle: (record) => record.title,
    getRecordMeta: (record) =>
      [
        record.code,
        (record.center as { name?: string } | undefined)?.name,
        (record.program as { name?: string } | undefined)?.name,
        record.project_type,
        record.status,
      ]
        .filter(Boolean)
        .join(" · "),
    emptyMessage: "No research projects were returned.",
    buildPayload: (values) => ({
      ...values,
      project_type: values.project_type || "applied",
      status: values.status || "ongoing",
      currency: values.currency || "KES",
    }),
    viewScopes: ["research.view", "research.view_projects"],
    manageScopes: ["research.manage_projects"],
  } as PortalResourceConfig<ResearchProject, ResearchProjectPayload>,
  centers: genericResearchResource(
    "centers",
    "Research Centers",
    "Manage research centers and institutes.",
    researchServiceApi.centers,
    ["research.manage_centers", "research.manage_projects"],
  ),
  farms: {
    ...genericResearchResource(
      "farms",
      "Research Farms",
      "Manage research farms and field sites.",
      researchServiceApi.farms,
      ["research.manage_projects"],
    ),
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "slug", label: "Slug" },
      { name: "code", label: "Code" },
      {
        name: "center_id",
        label: "Research Center",
        type: "entity",
        relation: { adapter: "researchCenter", filters: { is_active: true }, allowClear: true },
      },
      { name: "farm_type", label: "Farm Type", placeholder: "university" },
      {
        name: "manager_id",
        label: "Manager",
        type: "entity",
        relation: { adapter: "person", filters: { status: "active" }, allowClear: true },
      },
      { name: "summary", label: "Summary", type: "textarea" },
      { name: "about", label: "About", type: "textarea" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "activities", label: "Activities", type: "textarea" },
      { name: "products", label: "Products", type: "textarea" },
      { name: "facilities", label: "Facilities", type: "textarea" },
      { name: "size_hectares", label: "Size Hectares", type: "number" },
      { name: "capacity_info", label: "Capacity Info", type: "textarea" },
      { name: "location", label: "Location" },
      { name: "county", label: "County" },
      { name: "address", label: "Address", type: "textarea" },
      { name: "manager_name", label: "Manager Name" },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Phone" },
      { name: "cover_image_url", label: "Cover Image URL", type: "url" },
      { name: "status", label: "Status", placeholder: "active" },
      { name: "is_active", label: "Active", type: "boolean" },
      { name: "is_public", label: "Public", type: "boolean" },
      { name: "is_featured", label: "Featured", type: "boolean" },
    ],
    getRecordMeta: (record) => metaOf(record, ["code", "farm_type", "status"]),
    buildPayload: (values) => ({
      ...values,
      farm_type: values.farm_type || "university",
      status: values.status || "active",
      is_public: values.is_public ?? true,
    }),
  } as PortalResourceConfig<ResearchGenericRecord, ResearchGenericPayload>,
  programs: {
    ...genericResearchResource(
      "programs",
      "Research Programs",
      "Manage research programs.",
      researchServiceApi.programs,
      ["research.manage_projects", "research_program.manage"],
    ),
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "slug", label: "Slug" },
      { name: "code", label: "Code" },
      {
        name: "center_id",
        label: "Research Center",
        type: "entity",
        relation: { adapter: "researchCenter", filters: { is_active: true }, allowClear: true },
      },
      {
        name: "lead_id",
        label: "Lead",
        type: "entity",
        relation: { adapter: "person", filters: { status: "active" }, allowClear: true },
      },
      { name: "start_date", label: "Start Date", type: "date" },
      { name: "end_date", label: "End Date", type: "date" },
      { name: "summary", label: "Summary", type: "textarea" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "objectives", label: "Objectives", type: "textarea" },
      { name: "expected_outcomes", label: "Expected Outcomes", type: "textarea" },
      { name: "methodology", label: "Methodology", type: "textarea" },
      { name: "budget", label: "Budget", type: "number" },
      { name: "currency", label: "Currency", placeholder: "KES" },
      { name: "cover_image_url", label: "Cover Image URL", type: "url" },
      { name: "status", label: "Status", placeholder: "active" },
      { name: "is_active", label: "Active", type: "boolean" },
      { name: "is_featured", label: "Featured", type: "boolean" },
    ],
    getRecordMeta: (record) => metaOf(record, ["code", "status", "start_date"]),
    buildPayload: (values) => ({
      ...values,
      currency: values.currency || "KES",
      status: values.status || "active",
    }),
  } as PortalResourceConfig<ResearchGenericRecord, ResearchGenericPayload>,
  themes: genericResearchResource(
    "themes",
    "Research Themes",
    "Manage research themes and classifications.",
    researchServiceApi.themes,
    ["research.manage_projects", "research_theme.manage"],
  ),
  "focus-areas": genericResearchResource(
    "focus-areas",
    "Focus Areas",
    "Manage research focus areas.",
    researchServiceApi.focusAreas,
    ["research.manage_projects"],
  ),
  "expertise-tags": genericResearchResource(
    "expertise-tags",
    "Expertise Tags",
    "Manage research expertise tags.",
    researchServiceApi.expertiseTags,
    ["research.manage_projects"],
  ),
  grants: {
    key: "grants",
    title: "Grants",
    description: "Manage research grants, calls, and funding opportunities.",
    backHref: "/research",
    queryKey: ["research-portal", "grants"],
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "slug", label: "Slug" },
      { name: "code", label: "Code" },
      { name: "grant_type", label: "Grant Type" },
      { name: "category", label: "Category" },
      { name: "funder_name", label: "Funder" },
      { name: "summary", label: "Summary", type: "textarea" },
      { name: "deadline", label: "Deadline", type: "date" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
      { name: "is_active", label: "Active", type: "boolean" },
      { name: "is_featured", label: "Featured", type: "boolean" },
    ],
    listFilters: [
      {
        name: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
    ],
    list: (filters) =>
      researchServiceApi.grants.list({ ...pageParams, ...filters }),
    create: (payload) =>
      researchServiceApi.grants.create(payload as ResearchGrantPayload),
    update: (id, payload) => researchServiceApi.grants.update(id, payload),
    delete: (id) => researchServiceApi.grants.delete(id),
    getRecordTitle: (record) => record.title,
    getRecordMeta: (record) => metaOf(record, ["code", "grant_type", "status"]),
    emptyMessage: "No grants were returned.",
    buildPayload: (values) => ({
      ...values,
      grant_type: values.grant_type || "internal",
      status: values.status || "open",
    }),
    viewScopes: ["research.view", "funding.view"],
    manageScopes: ["research.manage_grants", "funding.manage"],
  } as PortalResourceConfig<ResearchGrant, ResearchGrantPayload>,
  "grant-applications": {
    ...genericResearchResource(
      "grant-applications",
      "Grant Applications",
      "Manage submitted grant applications.",
      researchServiceApi.grantApplications,
      ["research.manage_grants", "research.review_grants"],
    ),
    fields: [
      {
        name: "grant_id",
        label: "Grant",
        type: "entity",
        required: true,
        relation: {
          adapter: "researchGrant",
          filters: { is_active: true },
          allowClear: false,
        },
      },
      {
        name: "applicant_id",
        label: "Applicant",
        type: "entity",
        required: true,
        relation: {
          adapter: "person",
          filters: { status: "active" },
          allowClear: false,
        },
      },
      { name: "project_title", label: "Project Title", required: true },
      { name: "summary", label: "Summary", type: "textarea" },
      { name: "objectives", label: "Objectives", type: "textarea" },
      { name: "requested_amount", label: "Requested Amount", type: "number" },
      { name: "currency", label: "Currency", placeholder: "KES" },
      { name: "proposed_start_date", label: "Proposed Start", type: "date" },
      { name: "proposed_end_date", label: "Proposed End", type: "date" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
    ],
    getRecordMeta: (record) =>
      metaOf(record, ["application_number", "requested_amount", "status"]),
    buildPayload: (values) => ({
      ...values,
      currency: values.currency || "KES",
      status: values.status || "draft",
    }),
  } as PortalResourceConfig<ResearchGenericRecord, ResearchGenericPayload>,
  "grant-reviews": {
    ...genericResearchResource(
      "grant-reviews",
      "Grant Reviews",
      "Manage grant review records.",
      researchServiceApi.grantReviews,
      ["research.review_grants"],
    ),
    fields: [
      {
        name: "application_id",
        label: "Application",
        type: "entity",
        required: true,
        relation: { adapter: "researchGrantApplication", allowClear: false },
      },
      {
        name: "reviewer_id",
        label: "Reviewer",
        type: "entity",
        required: true,
        relation: {
          adapter: "person",
          filters: { status: "active" },
          allowClear: false,
        },
      },
      { name: "overall_score", label: "Overall Score", type: "number" },
      { name: "strengths", label: "Strengths", type: "textarea" },
      { name: "weaknesses", label: "Weaknesses", type: "textarea" },
      { name: "comments", label: "Comments", type: "textarea" },
      { name: "recommendation", label: "Recommendation", placeholder: "approve" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
    ],
    getRecordMeta: (record) =>
      metaOf(record, ["overall_score", "recommendation", "status"]),
    buildPayload: (values) => ({
      ...values,
      status: values.status || "pending",
    }),
  } as PortalResourceConfig<ResearchGenericRecord, ResearchGenericPayload>,
  "grant-reports": {
    ...genericResearchResource(
      "grant-reports",
      "Grant Reports",
      "Manage grant progress and close-out reports.",
      researchServiceApi.grantReports,
      ["research.manage_reports", "research.submit_reports"],
    ),
    fields: [
      {
        name: "grant_id",
        label: "Grant",
        type: "entity",
        required: true,
        relation: {
          adapter: "researchGrant",
          filters: { is_active: true },
          allowClear: false,
        },
      },
      {
        name: "application_id",
        label: "Application",
        type: "entity",
        relation: { adapter: "researchGrantApplication", allowClear: true },
      },
      {
        name: "project_id",
        label: "Project",
        type: "entity",
        relation: {
          adapter: "researchProject",
          filters: { is_active: true },
          allowClear: true,
        },
      },
      {
        name: "submitter_id",
        label: "Submitter",
        type: "entity",
        required: true,
        relation: {
          adapter: "person",
          filters: { status: "active" },
          allowClear: false,
        },
      },
      { name: "report_type", label: "Report Type", placeholder: "progress" },
      { name: "title", label: "Title", required: true },
      { name: "reporting_period_start", label: "Period Start", type: "date" },
      { name: "reporting_period_end", label: "Period End", type: "date" },
      { name: "summary", label: "Summary", type: "textarea" },
      { name: "amount_spent", label: "Amount Spent", type: "number" },
      { name: "balance", label: "Balance", type: "number" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
    ],
    getRecordMeta: (record) =>
      metaOf(record, ["report_type", "status", "submitted_at"]),
    buildPayload: (values) => ({
      ...values,
      report_type: values.report_type || "progress",
      status: values.status || "draft",
    }),
  } as PortalResourceConfig<ResearchGenericRecord, ResearchGenericPayload>,
  funders: genericResearchResource(
    "funders",
    "Funders",
    "Manage research funder profiles.",
    researchServiceApi.funders,
    ["funding.manage"],
  ),
  endowments: genericResearchResource(
    "endowments",
    "Endowments",
    "Manage research endowments.",
    researchServiceApi.endowments,
    ["research.manage_endowments", "funding.manage"],
  ),
  "grant-guidelines": genericResearchResource(
    "grant-guidelines",
    "Grant Guidelines",
    "Manage funding guidance and eligibility records.",
    researchServiceApi.grantGuidelines,
    ["research.manage_grant_guidelines", "research.manage_guidelines"],
  ),
  partnerships: genericResearchResource(
    "partnerships",
    "Partnerships",
    "Manage research partners and collaborations.",
    researchServiceApi.partners,
    ["research.manage_collaborations", "partnerships.manage"],
  ),
  innovations: {
    ...genericResearchResource(
      "innovations",
      "Innovation",
      "Manage innovations, disclosures, and startup pipeline records.",
      researchServiceApi.innovations,
      ["innovation.review_disclosure", "innovation.manage_ecosystem"],
    ),
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "slug", label: "Slug" },
      { name: "code", label: "Code" },
      { name: "innovation_type", label: "Innovation Type", placeholder: "invention" },
      { name: "category", label: "Category" },
      {
        name: "project_id",
        label: "Source Project",
        type: "entity",
        relation: { adapter: "researchProject", filters: { is_active: true }, allowClear: true },
      },
      {
        name: "center_id",
        label: "Research Center",
        type: "entity",
        relation: { adapter: "researchCenter", filters: { is_active: true }, allowClear: true },
      },
      {
        name: "lead_inventor_id",
        label: "Lead Inventor",
        type: "entity",
        relation: { adapter: "person", filters: { status: "active" }, allowClear: true },
      },
      { name: "summary", label: "Summary", type: "textarea" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "problem_addressed", label: "Problem Addressed", type: "textarea" },
      { name: "solution", label: "Solution", type: "textarea" },
      { name: "benefits", label: "Benefits", type: "textarea" },
      { name: "applications", label: "Applications", type: "textarea" },
      { name: "target_users", label: "Target Users", type: "textarea" },
      { name: "ip_status", label: "IP Status" },
      { name: "patent_number", label: "Patent Number" },
      { name: "patent_filing_date", label: "Patent Filing Date", type: "date" },
      { name: "patent_grant_date", label: "Patent Grant Date", type: "date" },
      { name: "license_type", label: "License Type" },
      { name: "commercialization_status", label: "Commercialization Status" },
      { name: "commercial_value", label: "Commercial Value", type: "number" },
      { name: "revenue_generated", label: "Revenue Generated", type: "number" },
      { name: "currency", label: "Currency", placeholder: "KES" },
      { name: "development_stage", label: "Development Stage", placeholder: "research" },
      { name: "trl_level", label: "TRL Level", type: "number" },
      { name: "invention_date", label: "Invention Date", type: "date" },
      { name: "cover_image_url", label: "Cover Image URL", type: "url" },
      { name: "video_url", label: "Video URL", type: "url" },
      { name: "status", label: "Status", placeholder: "draft" },
      { name: "is_active", label: "Active", type: "boolean" },
      { name: "is_featured", label: "Featured", type: "boolean" },
      { name: "is_public", label: "Public", type: "boolean" },
    ],
    buildPayload: (values) => ({
      ...values,
      innovation_type: values.innovation_type || "invention",
      currency: values.currency || "KES",
      development_stage: values.development_stage || "research",
      status: values.status || "draft",
      is_public: values.is_public ?? true,
    }),
  } as PortalResourceConfig<ResearchGenericRecord, ResearchGenericPayload>,
  outputs: genericResearchResource(
    "outputs",
    "Research Outputs",
    "Manage research outputs and reports.",
    researchServiceApi.outputs,
    ["research.manage_reports", "research.submit_reports"],
  ),
  impact: genericResearchResource(
    "impact",
    "Impact Metrics",
    "Manage research impact metrics and stories.",
    researchServiceApi.impactMetrics,
    ["research.manage_impact"],
  ),
  stories: genericResearchResource(
    "stories",
    "Research Stories",
    "Manage research impact stories.",
    researchServiceApi.stories,
    ["research.manage_impact", "content.manage_news"],
  ),
  sustainability: genericResearchResource(
    "sustainability",
    "Sustainability",
    "Manage sustainability research initiatives.",
    researchServiceApi.sustainability,
    ["research.manage_projects"],
  ),
  consultancies: genericResearchResource(
    "consultancies",
    "Consultancies",
    "Manage research consultancy records.",
    researchServiceApi.consultancies,
    ["research.manage_services"],
  ),
  donors: genericResearchResource(
    "donors",
    "Donors",
    "Manage research donor profiles.",
    researchServiceApi.donors as any,
    ["funding.manage"],
  ),
  donations: {
    ...genericResearchResource(
      "donations",
      "Donations",
      "Manage research donation records.",
      researchServiceApi.donations,
      ["funding.manage"],
    ),
    fields: [
      {
        name: "donor_id",
        label: "Donor",
        type: "entity",
        required: true,
        relation: { adapter: "researchDonor", filters: { is_active: true }, allowClear: false },
      },
      { name: "amount", label: "Amount", type: "number", required: true },
      { name: "currency", label: "Currency", placeholder: "KES" },
      {
        name: "donation_type",
        label: "Donation Type",
        type: "select",
        options: [
          { label: "One Time", value: "one_time" },
          { label: "Recurring", value: "recurring" },
          { label: "Pledge", value: "pledge" },
          { label: "In Kind", value: "in_kind" },
        ],
      },
      {
        name: "designation",
        label: "Designation",
        type: "select",
        options: [
          { label: "Unrestricted", value: "unrestricted" },
          { label: "Research Project", value: "research_project" },
          { label: "Scholarship", value: "scholarship" },
          { label: "Equipment", value: "equipment" },
          { label: "Endowment", value: "endowment" },
        ],
      },
      { name: "purpose", label: "Purpose" },
      { name: "donation_date", label: "Donation Date", type: "date", required: true },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Pending", value: "pending" },
          { label: "Completed", value: "completed" },
          { label: "Failed", value: "failed" },
          { label: "Cancelled", value: "cancelled" },
          { label: "Refunded", value: "refunded" },
        ],
      },
    ],
    getRecordMeta: (record) => metaOf(record, ["amount", "currency", "status"]),
    getRecordWorkflowActions: (record) => {
      const status = String(record.status ?? "").toLowerCase();
      if (status === "completed") {
        return [
          {
            label: "Mark Refunded",
            variant: "outline",
            payload: { status: "refunded" },
            successMessage: "Donation marked as refunded",
          },
        ];
      }
      if (status === "cancelled" || status === "failed" || status === "refunded") {
        return [
          {
            label: "Reopen Pending",
            variant: "secondary",
            payload: { status: "pending" },
            successMessage: "Donation reopened as pending",
          },
        ];
      }
      return [
        {
          label: "Confirm Donation",
          payload: { status: "completed" },
          successMessage: "Donation confirmed",
        },
        {
          label: "Cancel Donation",
          variant: "outline",
          className: "text-destructive",
          payload: { status: "cancelled" },
          successMessage: "Donation cancelled",
        },
      ];
    },
    buildPayload: (values) => ({
      ...values,
      currency: values.currency || "KES",
      donation_type: values.donation_type || "one_time",
      designation: values.designation || "unrestricted",
      status: values.status || "completed",
    }),
  } as PortalResourceConfig<ResearchGenericRecord, ResearchGenericPayload>,
  "donation-impacts": {
    ...genericResearchResource(
      "donation-impacts",
      "Donation Impacts",
      "Manage donation impact records.",
      researchServiceApi.donationImpacts,
      ["funding.manage", "research.manage_impact"],
    ),
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "slug", label: "Slug" },
      { name: "impact_type", label: "Impact Type", placeholder: "project" },
      {
        name: "project_id",
        label: "Project",
        type: "entity",
        relation: { adapter: "researchProject", filters: { is_active: true }, allowClear: true },
      },
      {
        name: "center_id",
        label: "Research Center",
        type: "entity",
        relation: { adapter: "researchCenter", filters: { is_active: true }, allowClear: true },
      },
      { name: "summary", label: "Summary", type: "textarea" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "total_raised", label: "Total Raised", type: "number" },
      { name: "currency", label: "Currency", placeholder: "KES" },
      { name: "reporting_year", label: "Reporting Year", type: "number" },
      { name: "status", label: "Status", placeholder: "published" },
      { name: "is_active", label: "Active", type: "boolean" },
      { name: "is_featured", label: "Featured", type: "boolean" },
    ],
    getRecordMeta: (record) =>
      metaOf(record, ["impact_type", "reporting_year", "status"]),
    buildPayload: (values) => ({
      ...values,
      impact_type: values.impact_type || "project",
      currency: values.currency || "KES",
      status: values.status || "published",
    }),
  } as PortalResourceConfig<ResearchGenericRecord, ResearchGenericPayload>,
  "donation-stories": {
    ...genericResearchResource(
      "donation-stories",
      "Donation Stories",
      "Manage donor stories.",
      researchServiceApi.donationStories,
      ["funding.manage", "content.manage_news"],
    ),
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "slug", label: "Slug" },
      {
        name: "donor_id",
        label: "Donor",
        type: "entity",
        relation: { adapter: "researchDonor", filters: { is_active: true }, allowClear: true },
      },
      { name: "donor_name", label: "Donor Name" },
      { name: "donor_organization", label: "Donor Organization" },
      { name: "summary", label: "Summary", type: "textarea" },
      { name: "story", label: "Story", type: "textarea" },
      { name: "quote", label: "Quote", type: "textarea" },
      { name: "photo_url", label: "Photo URL", type: "url" },
      { name: "status", label: "Status", placeholder: "published" },
      { name: "is_active", label: "Active", type: "boolean" },
      { name: "is_featured", label: "Featured", type: "boolean" },
    ],
    getRecordMeta: (record) =>
      metaOf(record, ["donor_name", "donor_organization", "status"]),
    buildPayload: (values) => ({
      ...values,
      status: values.status || "published",
    }),
  } as PortalResourceConfig<ResearchGenericRecord, ResearchGenericPayload>,
  "donation-settings": genericResearchResource(
    "donation-settings",
    "Donation Settings",
    "Manage donation portal settings.",
    researchServiceApi.donationSettings,
    ["funding.manage"],
  ),
  training: {
    ...genericResearchResource(
      "training",
      "Training",
      "Manage research training records.",
      researchServiceApi.training,
      ["research.manage_services"],
    ),
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "slug", label: "Slug" },
      { name: "code", label: "Code" },
      { name: "program_type", label: "Program Type", placeholder: "workshop" },
      { name: "category", label: "Category", placeholder: "research_methods" },
      {
        name: "center_id",
        label: "Research Center",
        type: "entity",
        relation: { adapter: "researchCenter", filters: { is_active: true }, allowClear: true },
      },
      {
        name: "organizer_id",
        label: "Organizer",
        type: "entity",
        relation: { adapter: "person", filters: { status: "active" }, allowClear: true },
      },
      { name: "summary", label: "Summary", type: "textarea" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "objectives", label: "Objectives", type: "textarea" },
      { name: "target_audience", label: "Target Audience", type: "textarea" },
      { name: "prerequisites", label: "Prerequisites", type: "textarea" },
      { name: "curriculum", label: "Curriculum", type: "textarea" },
      { name: "outcomes", label: "Outcomes", type: "textarea" },
      { name: "start_date", label: "Start Date", type: "date" },
      { name: "end_date", label: "End Date", type: "date" },
      { name: "schedule", label: "Schedule", type: "textarea" },
      { name: "duration_hours", label: "Duration Hours", type: "number" },
      { name: "delivery_mode", label: "Delivery Mode", placeholder: "in_person" },
      { name: "venue", label: "Venue" },
      { name: "platform", label: "Platform" },
      { name: "meeting_link", label: "Meeting Link", type: "url" },
      { name: "registration_deadline", label: "Registration Deadline", type: "datetime-local" },
      { name: "max_participants", label: "Max Participants", type: "number" },
      { name: "is_free", label: "Free", type: "boolean" },
      { name: "fee", label: "Fee", type: "number" },
      { name: "currency", label: "Currency", placeholder: "KES" },
      { name: "offers_certificate", label: "Offers Certificate", type: "boolean" },
      { name: "cpd_points", label: "CPD Points", type: "number" },
      { name: "contact_name", label: "Contact Name" },
      { name: "contact_email", label: "Contact Email", type: "email" },
      { name: "contact_phone", label: "Contact Phone" },
      { name: "cover_image_url", label: "Cover Image URL", type: "url" },
      { name: "brochure_url", label: "Brochure URL", type: "url" },
      { name: "status", label: "Status", placeholder: "draft" },
      { name: "is_active", label: "Active", type: "boolean" },
      { name: "is_featured", label: "Featured", type: "boolean" },
    ],
    buildPayload: (values) => ({
      ...values,
      program_type: values.program_type || "workshop",
      delivery_mode: values.delivery_mode || "in_person",
      currency: values.currency || "KES",
      is_free: values.is_free ?? true,
      status: values.status || "draft",
    }),
  } as PortalResourceConfig<ResearchGenericRecord, ResearchGenericPayload>,
  mentorship: {
    ...genericResearchResource(
      "mentorship",
      "Mentorship",
      "Manage mentorship programs.",
      researchServiceApi.mentorship,
      ["research.manage_services"],
    ),
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "slug", label: "Slug" },
      { name: "code", label: "Code" },
      { name: "program_type", label: "Program Type", placeholder: "research" },
      {
        name: "center_id",
        label: "Research Center",
        type: "entity",
        relation: { adapter: "researchCenter", filters: { is_active: true }, allowClear: true },
      },
      {
        name: "coordinator_id",
        label: "Coordinator",
        type: "entity",
        relation: { adapter: "person", filters: { status: "active" }, allowClear: true },
      },
      { name: "summary", label: "Summary", type: "textarea" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "objectives", label: "Objectives", type: "textarea" },
      { name: "benefits", label: "Benefits", type: "textarea" },
      { name: "mentor_requirements", label: "Mentor Requirements", type: "textarea" },
      { name: "mentee_requirements", label: "Mentee Requirements", type: "textarea" },
      { name: "expectations", label: "Expectations", type: "textarea" },
      { name: "guidelines", label: "Guidelines", type: "textarea" },
      { name: "duration_months", label: "Duration Months", type: "number" },
      { name: "commitment_hours_weekly", label: "Weekly Commitment Hours", type: "number" },
      { name: "application_open", label: "Application Open", type: "date" },
      { name: "application_deadline", label: "Application Deadline", type: "datetime-local" },
      { name: "cohort_start_date", label: "Cohort Start Date", type: "date" },
      { name: "cohort_end_date", label: "Cohort End Date", type: "date" },
      { name: "max_mentees", label: "Max Mentees", type: "number" },
      { name: "max_mentors", label: "Max Mentors", type: "number" },
      { name: "contact_email", label: "Contact Email", type: "email" },
      { name: "contact_phone", label: "Contact Phone" },
      { name: "cover_image_url", label: "Cover Image URL", type: "url" },
      { name: "brochure_url", label: "Brochure URL", type: "url" },
      { name: "status", label: "Status", placeholder: "active" },
      { name: "is_active", label: "Active", type: "boolean" },
      { name: "is_featured", label: "Featured", type: "boolean" },
    ],
    buildPayload: (values) => ({
      ...values,
      program_type: values.program_type || "research",
      status: values.status || "active",
    }),
  } as PortalResourceConfig<ResearchGenericRecord, ResearchGenericPayload>,
  "mentorship-applications": {
    ...genericResearchResource(
      "mentorship-applications",
      "Mentorship Applications",
      "Manage mentorship applications.",
      researchServiceApi.mentorshipApplications,
      ["research.manage_services"],
    ),
    fields: [
      {
        name: "program_id",
        label: "Mentorship Program",
        type: "entity",
        required: true,
        relation: {
          adapter: "researchMentorship",
          filters: { is_active: true },
          allowClear: false,
        },
      },
      {
        name: "applicant_id",
        label: "Applicant",
        type: "entity",
        required: true,
        relation: {
          adapter: "person",
          filters: { status: "active" },
          allowClear: false,
        },
      },
      { name: "application_type", label: "Application Type", required: true },
      { name: "motivation", label: "Motivation", type: "textarea" },
      { name: "experience", label: "Experience", type: "textarea" },
      { name: "goals", label: "Goals", type: "textarea" },
      { name: "availability", label: "Availability", type: "textarea" },
      { name: "preferred_communication", label: "Preferred Communication" },
      { name: "looking_for", label: "Looking For", type: "textarea" },
      { name: "cv_url", label: "CV URL", type: "url" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
    ],
    getRecordMeta: (record) =>
      metaOf(record, ["application_type", "status", "submitted_at"]),
    buildPayload: (values) => ({
      ...values,
      application_type: values.application_type || "mentee",
      status: values.status || "draft",
    }),
  } as PortalResourceConfig<ResearchGenericRecord, ResearchGenericPayload>,
  "mentorship-matches": {
    ...genericResearchResource(
      "mentorship-matches",
      "Mentorship Matches",
      "Manage mentorship matches.",
      researchServiceApi.mentorshipMatches,
      ["research.manage_services"],
    ),
    fields: [
      {
        name: "program_id",
        label: "Mentorship Program",
        type: "entity",
        required: true,
        relation: {
          adapter: "researchMentorship",
          filters: { is_active: true },
          allowClear: false,
        },
      },
      {
        name: "mentor_id",
        label: "Mentor",
        type: "entity",
        required: true,
        relation: {
          adapter: "person",
          filters: { status: "active" },
          allowClear: false,
        },
      },
      {
        name: "mentee_id",
        label: "Mentee",
        type: "entity",
        required: true,
        relation: {
          adapter: "person",
          filters: { status: "active" },
          allowClear: false,
        },
      },
      { name: "match_date", label: "Match Date", type: "date", required: true },
      { name: "start_date", label: "Start Date", type: "date" },
      { name: "end_date", label: "End Date", type: "date" },
      { name: "goals", label: "Goals", type: "textarea" },
      { name: "meeting_schedule", label: "Meeting Schedule", type: "textarea" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
    ],
    getRecordMeta: (record) =>
      metaOf(record, ["status", "match_date", "meeting_schedule"]),
    buildPayload: (values) => ({
      ...values,
      status: values.status || "active",
    }),
  } as PortalResourceConfig<ResearchGenericRecord, ResearchGenericPayload>,
  scholarships: {
    ...genericResearchResource(
      "scholarships",
      "Scholarships",
      "Manage research scholarships.",
      researchServiceApi.scholarships,
      ["funding.manage"],
    ),
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "slug", label: "Slug" },
      { name: "code", label: "Code" },
      { name: "scholarship_type", label: "Scholarship Type", placeholder: "research" },
      { name: "funder_name", label: "Funder" },
      { name: "funder_logo_url", label: "Funder Logo URL", type: "url" },
      {
        name: "endowment_fund_id",
        label: "Endowment Fund",
        type: "entity",
        relation: { adapter: "researchEndowment", filters: { is_active: true }, allowClear: true },
      },
      { name: "summary", label: "Summary", type: "textarea" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "eligibility", label: "Eligibility", type: "textarea" },
      { name: "requirements", label: "Requirements", type: "textarea" },
      { name: "benefits", label: "Benefits", type: "textarea" },
      { name: "obligations", label: "Obligations", type: "textarea" },
      { name: "selection_criteria", label: "Selection Criteria", type: "textarea" },
      { name: "value", label: "Value", type: "number" },
      { name: "currency", label: "Currency", placeholder: "KES" },
      { name: "covers_tuition", label: "Covers Tuition", type: "boolean" },
      { name: "covers_stipend", label: "Covers Stipend", type: "boolean" },
      { name: "covers_travel", label: "Covers Travel", type: "boolean" },
      { name: "covers_research", label: "Covers Research", type: "boolean" },
      { name: "duration_months", label: "Duration Months", type: "number" },
      { name: "renewable", label: "Renewable", type: "boolean" },
      { name: "application_open", label: "Application Open", type: "date" },
      { name: "application_deadline", label: "Application Deadline", type: "datetime-local" },
      { name: "award_date", label: "Award Date", type: "date" },
      { name: "start_date", label: "Start Date", type: "date" },
      { name: "number_available", label: "Number Available", type: "number" },
      { name: "external_url", label: "External URL", type: "url" },
      { name: "application_url", label: "Application URL", type: "url" },
      { name: "contact_name", label: "Contact Name" },
      { name: "contact_email", label: "Contact Email", type: "email" },
      { name: "contact_phone", label: "Contact Phone" },
      { name: "cover_image_url", label: "Cover Image URL", type: "url" },
      { name: "status", label: "Status", placeholder: "open" },
      { name: "is_active", label: "Active", type: "boolean" },
      { name: "is_featured", label: "Featured", type: "boolean" },
    ],
    buildPayload: (values) => ({
      ...values,
      scholarship_type: values.scholarship_type || "research",
      currency: values.currency || "KES",
      status: values.status || "open",
    }),
  } as PortalResourceConfig<ResearchGenericRecord, ResearchGenericPayload>,
  "scholarship-applications": {
    ...genericResearchResource(
      "scholarship-applications",
      "Scholarship Applications",
      "Manage scholarship applications.",
      researchServiceApi.scholarshipApplications,
      ["funding.manage"],
    ),
    fields: [
      {
        name: "scholarship_id",
        label: "Scholarship",
        type: "entity",
        required: true,
        relation: {
          adapter: "researchScholarship",
          filters: { is_active: true },
          allowClear: false,
        },
      },
      {
        name: "applicant_id",
        label: "Applicant",
        type: "entity",
        required: true,
        relation: {
          adapter: "person",
          filters: { status: "active" },
          allowClear: false,
        },
      },
      { name: "research_proposal", label: "Research Proposal", type: "textarea" },
      { name: "personal_statement", label: "Personal Statement", type: "textarea" },
      { name: "research_experience", label: "Research Experience", type: "textarea" },
      { name: "career_goals", label: "Career Goals", type: "textarea" },
      { name: "budget_justification", label: "Budget Justification", type: "textarea" },
      { name: "cv_url", label: "CV URL", type: "url" },
      { name: "transcripts_url", label: "Transcripts URL", type: "url" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
    ],
    getRecordMeta: (record) =>
      metaOf(record, ["application_number", "status", "submitted_at"]),
    buildPayload: (values) => ({
      ...values,
      status: values.status || "draft",
    }),
  } as PortalResourceConfig<ResearchGenericRecord, ResearchGenericPayload>,
  "office-staff": {
    ...genericResearchResource(
      "office-staff",
      "Research Office Staff",
      "Manage research office staff records.",
      researchServiceApi.officeStaff,
      ["research.manage_office"],
    ),
    fields: [
      {
        name: "office_id",
        label: "Research Office",
        type: "entity",
        required: true,
        relation: { adapter: "researchOffice", filters: { is_active: true }, allowClear: false },
      },
      {
        name: "staff_assignment_id",
        label: "Staff Assignment",
        type: "entity",
        required: true,
        relation: { adapter: "staffAssignment", filters: { status: "active" }, allowClear: false },
      },
      {
        name: "staff_type",
        label: "Staff Type",
        type: "select",
        options: [
          { label: "Leadership", value: "leadership" },
          { label: "Staff", value: "staff" },
          { label: "Coordinator", value: "coordinator" },
          { label: "Administrator", value: "administrator" },
        ],
      },
      {
        name: "role",
        label: "Role",
        type: "select",
        required: true,
        options: [
          { label: "Director", value: "director" },
          { label: "Deputy Director", value: "deputy_director" },
          { label: "Coordinator", value: "coordinator" },
          { label: "Officer", value: "officer" },
          { label: "Administrator", value: "administrator" },
        ],
      },
      { name: "title_override", label: "Title Override" },
      { name: "responsibilities", label: "Responsibilities", type: "textarea" },
      { name: "leadership_rank", label: "Leadership Rank", type: "number" },
      { name: "start_date", label: "Start Date", type: "date" },
      { name: "end_date", label: "End Date", type: "date" },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
    getRecordMeta: (record) =>
      metaOf(record, ["staff_type", "role", "is_active"]),
    buildPayload: (values) => ({
      ...values,
      staff_type: values.staff_type || "staff",
    }),
  } as PortalResourceConfig<ResearchGenericRecord, ResearchGenericPayload>,
  resources: genericResearchResource(
    "resources",
    "Research Resources",
    "Manage research office resources.",
    researchServiceApi.resources,
    ["research.manage_resources", "research.manage_guidelines"],
  ),
  services: genericResearchResource(
    "services",
    "Research Services",
    "Manage research office services.",
    researchServiceApi.services,
    ["research.manage_services"],
  ),
  guidelines: genericResearchResource(
    "guidelines",
    "Research Guidelines",
    "Manage research guidelines and policy help.",
    researchServiceApi.guidelines,
    ["research.manage_guidelines"],
  ),
  boards: genericResearchResource(
    "boards",
    "Research Boards",
    "Manage research boards and committees.",
    researchServiceApi.boards,
    ["research.manage_boards"],
  ),
  "board-members": {
    ...genericResearchResource(
      "board-members",
      "Research Board Members",
      "Manage research board membership.",
      researchServiceApi.boardMembers,
      ["research.manage_boards", "research.manage_committees"],
    ),
    fields: [
      {
        name: "board_id",
        label: "Research Board",
        type: "entity",
        required: true,
        relation: { adapter: "researchBoard", filters: { is_active: true }, allowClear: false },
      },
      {
        name: "person_id",
        label: "Person",
        type: "entity",
        relation: { adapter: "person", filters: { status: "active" }, allowClear: true },
      },
      { name: "name", label: "Name", required: true },
      { name: "title", label: "Title" },
      { name: "affiliation", label: "Affiliation" },
      { name: "email", label: "Email", type: "email" },
      { name: "bio", label: "Bio", type: "textarea" },
      { name: "role", label: "Role", placeholder: "member" },
      { name: "representation", label: "Representation" },
      { name: "term_start", label: "Term Start", type: "date" },
      { name: "term_end", label: "Term End", type: "date" },
      { name: "photo_url", label: "Photo URL", type: "url" },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
    getRecordMeta: (record) => metaOf(record, ["role", "affiliation", "is_active"]),
    buildPayload: (values) => ({
      ...values,
      role: values.role || "member",
    }),
  } as PortalResourceConfig<ResearchGenericRecord, ResearchGenericPayload>,
  "research-articles": genericResearchResource(
    "research-articles",
    "Research Articles",
    "Manage research article records.",
    researchServiceApi.articles,
    ["content.manage_news", "research.view"],
  ),
  "research-events": genericResearchResource(
    "research-events",
    "Research Events",
    "Manage research-scoped events.",
    researchServiceApi.events,
    ["content.manage_events", "research.view"],
  ),
  "research-sliders": genericResearchResource(
    "research-sliders",
    "Research Sliders",
    "Manage research portal sliders.",
    researchServiceApi.sliders,
    ["marketing.manage_sliders"],
  ),
};

function genericResearchResource(
  key: string,
  title: string,
  description: string,
  api: {
    list: (params?: any) => Promise<{ data?: ResearchGenericRecord[] }>;
    create: (payload: ResearchGenericPayload) => Promise<unknown>;
    update: (
      id: string,
      payload: Partial<ResearchGenericPayload>,
    ) => Promise<unknown>;
    delete: (id: string) => Promise<unknown>;
  },
  manageScopes: string[],
): PortalResourceConfig<ResearchGenericRecord, ResearchGenericPayload> {
  return {
    key,
    title,
    description,
    backHref: "/research",
    queryKey: ["research-portal", key],
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "name", label: "Name" },
      { name: "slug", label: "Slug" },
      { name: "code", label: "Code" },
      { name: "summary", label: "Summary", type: "textarea" },
      { name: "description", label: "Description", type: "textarea" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
      { name: "is_active", label: "Active", type: "boolean" },
      { name: "is_featured", label: "Featured", type: "boolean" },
      { name: "is_public", label: "Public", type: "boolean" },
    ],
    listFilters: [
      {
        name: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
      ...yesNoFilters,
    ],
    list: (filters) => api.list({ ...pageParams, ...filters }),
    create: api.create,
    update: api.update,
    delete: api.delete,
    getRecordTitle: titleOf,
    getRecordMeta: (record) => metaOf(record, ["code", "status", "updated_at"]),
    emptyMessage: `No ${title.toLowerCase()} records were returned.`,
    buildPayload: (values) => ({
      ...values,
      title:
        normalizeText(values.title) ?? normalizeText(values.name) ?? "Untitled",
      name: normalizeText(values.name),
      status: values.status || "active",
    }),
    viewScopes: ["research.view", ...manageScopes],
    manageScopes,
  };
}

const libraryResources: Record<string, PortalResourceConfig<any, any>> = {
  branches: {
    key: "branches",
    title: "Library Branches",
    description:
      "Manage library branches, descriptions, contacts, and public status.",
    backHref: "/library",
    queryKey: ["library-portal", "branches"],
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "short_name", label: "Short Name" },
      { name: "slug", label: "Slug" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Phone" },
      { name: "library_type", label: "Library Type" },
      { name: "is_public", label: "Public", type: "boolean" },
      { name: "is_active", label: "Active", type: "boolean" },
      { name: "sort_order", label: "Sort Order", type: "number" },
    ],
    listFilters: yesNoFilters,
    list: (filters) =>
      libraryServiceApi.branches.list({
        ...pageParams,
        active_only: false,
        ...filters,
      }),
    create: (payload) => libraryServiceApi.branches.create(payload as any),
    update: (id, payload) => libraryServiceApi.branches.update(id, payload),
    delete: (id) => libraryServiceApi.branches.delete(id),
    getRecordTitle: (record) => record.name,
    getRecordMeta: (record) =>
      metaOf(record, ["short_name", "library_type", "updated_at"]),
    emptyMessage: "No library branches were returned.",
    viewScopes: ["library.view"],
    manageScopes: ["library.manage_services"],
  } as PortalResourceConfig<LibraryBranch>,
  "branch-hours": {
    key: "branch-hours",
    title: "Branch Hours",
    description: "Review branch operating hours from the library service.",
    backHref: "/library",
    queryKey: ["library-portal", "branch-hours"],
    portalScope: libraryBranchPortalScope,
    fields: [
      { name: "day_type", label: "Day Type" },
      { name: "opens_at", label: "Opens At" },
      { name: "closes_at", label: "Closes At" },
      { name: "is_closed", label: "Closed", type: "boolean" },
      { name: "note", label: "Note", type: "textarea" },
    ],
    list: async (filters) => {
      const libraryId = filters?.library_id || (await firstLibraryId());
      if (!libraryId) return { data: [] };
      return libraryServiceApi.branches.hours(String(libraryId));
    },
    create: async () => {
      throw new Error("Branch hours are read-only in the current API client.");
    },
    update: async () => {
      throw new Error("Branch hours are read-only in the current API client.");
    },
    getRecordTitle: (record) => record.day_type ?? "Branch hours",
    getRecordMeta: (record) =>
      metaOf(record, ["opens_at", "closes_at", "note"]),
    emptyMessage: "No branch hours were returned.",
    viewScopes: ["library.view"],
    manageScopes: ["library.manage_services"],
    canCreate: false,
    canEdit: false,
    canDelete: false,
    readOnlyMessage:
      "Branch hour editing is not exposed by the current library API client.",
  } as PortalResourceConfig,
  "branch-links": {
    key: "branch-links",
    title: "Branch Links",
    description: "Review external links configured for a library branch.",
    backHref: "/library",
    queryKey: ["library-portal", "branch-links"],
    portalScope: libraryBranchPortalScope,
    fields: [
      { name: "label", label: "Label" },
      { name: "url", label: "URL", type: "url" },
      { name: "link_type", label: "Link Type" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
    list: async (filters) => {
      const libraryId = filters?.library_id || (await firstLibraryId());
      if (!libraryId) return { data: [] };
      return libraryServiceApi.branches.links(String(libraryId), {
        active_only: false,
      });
    },
    create: async () => {
      throw new Error("Branch links are read-only in the current API client.");
    },
    update: async () => {
      throw new Error("Branch links are read-only in the current API client.");
    },
    getRecordTitle: (record) => record.label ?? "Branch link",
    getRecordMeta: (record) =>
      metaOf(record, ["link_type", "url", "is_active"]),
    emptyMessage: "No branch links were returned.",
    viewScopes: ["library.view"],
    manageScopes: ["library.manage_services"],
    canCreate: false,
    canEdit: false,
    canDelete: false,
    readOnlyMessage:
      "Branch link editing is not exposed by the current library API client.",
  } as PortalResourceConfig,
  "branch-files": {
    key: "branch-files",
    title: "Branch Files",
    description: "Review files attached to a library branch.",
    backHref: "/library",
    queryKey: ["library-portal", "branch-files"],
    portalScope: libraryBranchPortalScope,
    fields: [
      { name: "title", label: "Title" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "file_category", label: "Category" },
      { name: "access_level", label: "Access Level" },
      { name: "is_public", label: "Public", type: "boolean" },
    ],
    list: async (filters) => {
      const libraryId = filters?.library_id || (await firstLibraryId());
      if (!libraryId) return { data: [] };
      return libraryServiceApi.branches.files(String(libraryId));
    },
    create: async () => {
      throw new Error("Branch files are read-only in the current API client.");
    },
    update: async () => {
      throw new Error("Branch files are read-only in the current API client.");
    },
    getRecordTitle: titleOf,
    getRecordMeta: (record) =>
      metaOf(record, ["file_category", "access_level", "is_public"]),
    emptyMessage: "No branch files were returned.",
    viewScopes: ["library.view"],
    manageScopes: ["library.manage_services"],
    canCreate: false,
    canEdit: false,
    canDelete: false,
    readOnlyMessage:
      "Branch file editing is not exposed by the current library API client.",
  } as PortalResourceConfig,
  "today-hours": {
    key: "today-hours",
    title: "Today Hours",
    description: "Review today's open/closed status across library branches.",
    backHref: "/library",
    queryKey: ["library-portal", "today-hours"],
    fields: [
      { name: "library_name", label: "Library" },
      { name: "day_type", label: "Day Type" },
      { name: "opens_at", label: "Opens At" },
      { name: "closes_at", label: "Closes At" },
      { name: "is_open", label: "Open", type: "boolean" },
      { name: "note", label: "Note", type: "textarea" },
    ],
    list: async () => {
      const response = await libraryServiceApi.todayHours();
      return {
        data: response.data?.map((record, index) => ({
          ...record,
          id: String(record.library_id ?? record.library_name ?? index),
        })),
      };
    },
    create: async () => {
      throw new Error("Today hours are read-only.");
    },
    update: async () => {
      throw new Error("Today hours are read-only.");
    },
    getRecordTitle: (record) => record.library_name ?? "Library hours",
    getRecordMeta: (record) =>
      metaOf(record, ["day_type", "opens_at", "closes_at", "checked_at"]),
    emptyMessage: "No today-hours records were returned.",
    viewScopes: ["library.view"],
    manageScopes: ["library.manage_services"],
    canCreate: false,
    canEdit: false,
    canDelete: false,
    readOnlyMessage: "Today hours are generated by the library service.",
  } as PortalResourceConfig,
  catalog: {
    key: "catalog",
    title: "Catalog Resources",
    description:
      "Manage branch-scoped books, journals, and digital catalog resources.",
    backHref: "/library",
    queryKey: ["library-portal", "catalog"],
    portalScope: libraryBranchPortalScope,
    fields: [
      {
        name: "library_id",
        label: "Library Branch",
        required: true,
        type: "entity",
        relation: { adapter: "libraryBranch", filters: { active_only: false } },
      },
      { name: "title", label: "Title", required: true },
      { name: "subtitle", label: "Subtitle" },
      { name: "authors", label: "Authors" },
      { name: "publisher", label: "Publisher" },
      { name: "publication_year", label: "Publication Year", type: "number" },
      { name: "isbn", label: "ISBN" },
      { name: "resource_type", label: "Resource Type" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Available", value: "available" },
          { label: "Checked Out", value: "checked_out" },
          { label: "Overdue", value: "overdue" },
          { label: "Archived", value: "archived" },
        ],
      },
      { name: "total_copies", label: "Total Copies", type: "number" },
      { name: "available_copies", label: "Available Copies", type: "number" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "is_loanable", label: "Loanable", type: "boolean" },
      { name: "is_reference_only", label: "Reference Only", type: "boolean" },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
    listFilters: [
      {
        name: "library_id",
        label: "Library Branch",
        type: "entity",
        relation: { adapter: "libraryBranch", filters: { active_only: false } },
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Available", value: "available" },
          { label: "Checked Out", value: "checked_out" },
          { label: "Overdue", value: "overdue" },
        ],
      },
    ],
    list: async (filters) => {
      const libraryId = filters?.library_id || (await firstLibraryId());
      if (!libraryId) return { data: [] };
      return libraryServiceApi.resources.list({
        ...pageParams,
        ...filters,
        library_id: String(libraryId),
      });
    },
    create: (payload) =>
      libraryServiceApi.resources.create(payload as LibraryResourcePayload),
    update: (id, payload) => libraryServiceApi.resources.update(id, payload),
    delete: (id) => libraryServiceApi.resources.delete(id),
    getRecordTitle: (record) => record.title,
    getRecordMeta: (record) =>
      metaOf(record, ["authors", "resource_type", "status"]),
    emptyMessage:
      "No catalog resources were returned. Create a library branch first if none exists.",
    buildPayload: (values) => ({
      ...values,
      total_copies: values.total_copies ?? 1,
      available_copies: values.available_copies ?? 1,
    }),
    viewScopes: ["library.view", "library.manage_resources"],
    manageScopes: ["library.manage_resources", "library.manage_collections"],
  } as PortalResourceConfig<LibraryResource, LibraryResourcePayload>,
  loans: {
    key: "loans",
    title: "Loans",
    description: "Manage circulation loan records and renewals.",
    backHref: "/library",
    queryKey: ["library-portal", "loans"],
    portalScope: libraryBranchPortalScope,
    fields: [
      {
        name: "resource_id",
        label: "Resource",
        required: true,
        type: "entity",
        relation: { adapter: "libraryResource" },
      },
      {
        name: "borrower_person_id",
        label: "Borrower",
        required: true,
        type: "entity",
        relation: { adapter: "person", filters: { status: "active" } },
      },
      { name: "borrowed_at", label: "Borrowed At", type: "datetime-local" },
      { name: "due_at", label: "Due At", type: "datetime-local" },
      { name: "returned_at", label: "Returned At", type: "datetime-local" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Borrowed", value: "borrowed" },
          { label: "Returned", value: "returned" },
          { label: "Overdue", value: "overdue" },
          { label: "Lost", value: "lost" },
        ],
      },
      { name: "max_renewals", label: "Max Renewals", type: "number" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
    listFilters: [
      {
        name: "library_id",
        label: "Library Branch",
        type: "entity",
        relation: { adapter: "libraryBranch", filters: { active_only: false } },
      },
      {
        name: "resource_id",
        label: "Resource",
        type: "entity",
        relation: { adapter: "libraryResource" },
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Borrowed", value: "borrowed" },
          { label: "Returned", value: "returned" },
          { label: "Overdue", value: "overdue" },
        ],
      },
    ],
    list: async (filters) => {
      const libraryId = filters?.library_id || (await firstLibraryId());
      if (!libraryId) return { data: [] };
      return libraryServiceApi.loans.list({
        ...pageParams,
        ...filters,
        library_id: String(libraryId),
      });
    },
    create: (payload) => libraryServiceApi.loans.create(payload as any),
    update: (id, payload) => libraryServiceApi.loans.update(id, payload as any),
    getRecordTitle: (record) => record.resource?.title ?? `Loan ${record.status ?? "record"}`,
    getRecordMeta: (record) =>
      [
        record.resource?.authors,
        record.borrowed_at ? `Borrowed ${formatDateTime(record.borrowed_at)}` : null,
        record.due_at ? `Due ${formatDateTime(record.due_at)}` : null,
      ]
        .filter(Boolean)
        .join(" · "),
    getRecordWorkflowActions: () => [
      {
        label: "Renew",
        successMessage: "Loan renewed",
        payload: {},
        run: (record) => libraryServiceApi.loans.renew(record.id),
        confirmTitle: "Renew loan?",
        confirmDescription:
          "This will extend the loan using the backend circulation rules.",
      },
      {
        label: "Mark Returned",
        successMessage: "Loan marked as returned",
        payload: () => ({
          status: "returned",
          returned_at: new Date().toISOString(),
        }),
      },
    ],
    emptyMessage: "No loan records were returned.",
    buildPayload: (values) => ({
      ...values,
      borrowed_at: values.borrowed_at || new Date().toISOString(),
      due_at: values.due_at || new Date().toISOString(),
      max_renewals: values.max_renewals ?? 0,
    }),
    viewScopes: ["library.view", "library.manage_loans"],
    manageScopes: ["library.manage_loans"],
    canDelete: false,
  } as PortalResourceConfig<LibraryLoan>,
  reservations: {
    key: "reservations",
    title: "Reservations",
    description: "Manage resource reservation queue records.",
    backHref: "/library",
    queryKey: ["library-portal", "reservations"],
    portalScope: libraryBranchPortalScope,
    fields: [
      {
        name: "resource_id",
        label: "Resource",
        required: true,
        type: "entity",
        relation: { adapter: "libraryResource" },
      },
      {
        name: "requester_person_id",
        label: "Requester",
        required: true,
        type: "entity",
        relation: { adapter: "person", filters: { status: "active" } },
      },
      { name: "expires_at", label: "Expires At", type: "datetime-local" },
      { name: "ready_at", label: "Ready At", type: "datetime-local" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Pending", value: "pending" },
          { label: "Ready", value: "ready" },
          { label: "Fulfilled", value: "fulfilled" },
          { label: "Cancelled", value: "cancelled" },
        ],
      },
      { name: "queue_position", label: "Queue Position", type: "number" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
    listFilters: [
      {
        name: "library_id",
        label: "Library Branch",
        type: "entity",
        relation: { adapter: "libraryBranch", filters: { active_only: false } },
      },
      {
        name: "resource_id",
        label: "Resource",
        type: "entity",
        relation: { adapter: "libraryResource" },
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Pending", value: "pending" },
          { label: "Ready", value: "ready" },
          { label: "Fulfilled", value: "fulfilled" },
          { label: "Cancelled", value: "cancelled" },
        ],
      },
    ],
    list: async (filters) => {
      const libraryId = filters?.library_id || (await firstLibraryId());
      if (!libraryId) return { data: [] };
      return libraryServiceApi.reservations.list({
        ...pageParams,
        ...filters,
        library_id: String(libraryId),
      });
    },
    create: (payload) => libraryServiceApi.reservations.create(payload as any),
    update: (id, payload) =>
      libraryServiceApi.reservations.update(id, payload as any),
    delete: (id) => libraryServiceApi.reservations.cancel(id),
    getRecordTitle: (record) => record.resource?.title ?? `Reservation ${record.status ?? "record"}`,
    getRecordMeta: (record) =>
      [
        record.resource?.authors,
        record.queue_position ? `Queue ${record.queue_position}` : null,
        record.expires_at ? `Expires ${formatDateTime(record.expires_at)}` : null,
      ]
        .filter(Boolean)
        .join(" · "),
    getRecordWorkflowActions: () => [
      {
        label: "Mark Ready",
        successMessage: "Reservation marked ready",
        payload: () => ({
          status: "ready",
          ready_at: new Date().toISOString(),
        }),
        confirmTitle: "Mark reservation ready?",
        confirmDescription:
          "This tells library staff the reserved item is ready for collection.",
      },
      {
        label: "Fulfill",
        successMessage: "Reservation fulfilled",
        payload: { status: "fulfilled" },
        confirmTitle: "Fulfill reservation?",
        confirmDescription: "This closes the reservation as fulfilled.",
      },
      {
        label: "Cancel",
        variant: "destructive",
        successMessage: "Reservation cancelled",
        payload: { status: "cancelled" },
        run: (record) => libraryServiceApi.reservations.cancel(record.id),
        confirmTitle: "Cancel reservation?",
        confirmDescription:
          "This will cancel the reservation through the library reservation endpoint.",
      },
    ],
    emptyMessage: "No reservations were returned.",
    buildPayload: (values) => ({
      ...values,
      queue_position: values.queue_position ?? 1,
    }),
    viewScopes: ["library.view", "library.manage_loans"],
    manageScopes: ["library.manage_loans"],
  } as PortalResourceConfig<LibraryReservation>,
  charges: {
    key: "charges",
    title: "Charges",
    description: "Manage branch-specific library charges and rates.",
    backHref: "/library",
    queryKey: ["library-portal", "charges"],
    portalScope: libraryBranchPortalScope,
    fields: [
      {
        name: "library_id",
        label: "Library Branch",
        required: true,
        type: "entity",
        relation: { adapter: "libraryBranch", filters: { active_only: false } },
      },
      { name: "name", label: "Name", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "charge_type", label: "Charge Type", required: true },
      { name: "amount", label: "Amount", required: true },
      { name: "rate_unit", label: "Rate Unit" },
      { name: "currency", label: "Currency" },
      { name: "effective_from", label: "Effective From", type: "date" },
      { name: "effective_to", label: "Effective To", type: "date" },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
    listFilters: [
      {
        name: "library_id",
        label: "Library Branch",
        type: "entity",
        relation: { adapter: "libraryBranch", filters: { active_only: false } },
      },
      { name: "active_only", label: "Active Only", type: "boolean" },
    ],
    list: async (filters) => {
      const libraryId = filters?.library_id || (await firstLibraryId());
      if (!libraryId) return { data: [] };
      const response = await libraryServiceApi.charges.list({
        ...filters,
        library_id: String(libraryId),
      });
      return { data: response.data };
    },
    create: (payload) =>
      libraryServiceApi.charges.create(payload as LibraryChargePayload),
    update: (id, payload) => libraryServiceApi.charges.update(id, payload),
    delete: (id) => libraryServiceApi.charges.delete(id),
    getRecordTitle: (record) => record.name,
    getRecordMeta: (record) =>
      metaOf(record, ["charge_type", "amount", "currency"]),
    emptyMessage: "No charges were returned.",
    buildPayload: (values) => ({
      ...values,
      rate_unit: values.rate_unit || "item",
      currency: values.currency || "KES",
      is_active: values.is_active,
    }),
    viewScopes: ["library.view", "library.manage_services"],
    manageScopes: ["library.manage_services"],
  } as PortalResourceConfig<LibraryCharge, LibraryChargePayload>,
  electronic: libraryGenericResource(
    "electronic",
    "Electronic Resources",
    "Manage databases, e-resources, and access links.",
    libraryServiceApi.databases,
    ["library.manage_resources"],
  ),
  services: {
    ...libraryGenericResource(
      "services",
      "Library Services",
      "Manage library service records.",
      libraryServiceApi.services,
      ["library.manage_services"],
    ),
    list: async (filters) => {
      const libraryId = filters?.library_id || (await firstLibraryId());
      if (!libraryId) return { data: [] };
      return libraryServiceApi.services.list({
        ...pageParams,
        ...filters,
        library_id: String(libraryId),
      });
    },
  },
  regulations: {
    ...libraryGenericResource(
      "regulations",
      "Regulations",
      "Manage library regulations and policies.",
      libraryServiceApi.regulations,
      ["library.manage_regulations"],
    ),
    portalScope: libraryBranchPortalScope,
    fields: [
      {
        name: "library_id",
        label: "Library Branch",
        type: "entity",
        relation: {
          adapter: "libraryBranch",
          filters: { active_only: false },
          allowClear: true,
        },
      },
      { name: "title", label: "Title", required: true },
      { name: "slug", label: "Slug" },
      { name: "category", label: "Category" },
      { name: "content", label: "Content", type: "textarea" },
      { name: "effective_date", label: "Effective Date", type: "date" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
      { name: "is_public", label: "Public", type: "boolean" },
    ],
  } as PortalResourceConfig<LibraryRegulation, LibraryGenericPayload>,
  inquiries: {
    ...libraryGenericResource(
      "inquiries",
      "Inquiries",
      "Manage library inquiry status and responses.",
      libraryServiceApi.inquiries,
      ["library.manage_services"],
    ),
    portalScope: libraryBranchPortalScope,
    fields: [
      {
        name: "library_id",
        label: "Library Branch",
        type: "entity",
        relation: {
          adapter: "libraryBranch",
          filters: { active_only: false },
          allowClear: true,
        },
      },
      { name: "sender_name", label: "Sender Name", required: true },
      {
        name: "sender_email",
        label: "Sender Email",
        required: true,
        type: "email",
      },
      { name: "sender_phone", label: "Sender Phone" },
      { name: "subject", label: "Subject", required: true },
      { name: "message", label: "Message", type: "textarea" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Open", value: "open" },
          { label: "In Progress", value: "in_progress" },
          { label: "Replied", value: "replied" },
          { label: "Closed", value: "closed" },
        ],
      },
      { name: "reply_message", label: "Reply Message", type: "textarea" },
    ],
    update: (id, payload) =>
      payload.reply_message
        ? libraryServiceApi.inquiries.reply(id, {
            reply_message: String(payload.reply_message),
          })
        : libraryServiceApi.inquiries.update(id, payload as any),
    getRecordWorkflowActions: (record) => [
      {
        label: "Mark Replied",
        successMessage: "Inquiry marked as replied",
        payload: { status: "replied" },
        confirmTitle: "Mark inquiry replied?",
        confirmDescription: `This updates "${titleOf(record)}" to replied status.`,
      },
      {
        label: "Close",
        variant: "outline",
        successMessage: "Inquiry closed",
        payload: { status: "closed" },
        confirmTitle: "Close inquiry?",
        confirmDescription: `This closes "${titleOf(record)}" in the library inquiry queue.`,
      },
    ],
    getRecordTitle: (record) => record.subject ?? "Library inquiry",
    getRecordMeta: (record) =>
      [
        record.sender_name,
        record.sender_email,
        libraryLabelOf(record),
        record.status,
      ]
        .filter(Boolean)
        .join(" · "),
  } as PortalResourceConfig<LibraryInquiry, LibraryGenericPayload>,
  tickets: {
    ...libraryGenericResource(
      "tickets",
      "Support Tickets",
      "Manage library support tickets.",
      libraryServiceApi.tickets,
      ["library.manage_services"],
    ),
    fields: [
      { name: "requester_name", label: "Requester Name" },
      { name: "requester_email", label: "Requester Email", type: "email" },
      { name: "subject", label: "Subject", required: true },
      { name: "description", label: "Description", type: "textarea", required: true },
      {
        name: "category",
        label: "Category",
        type: "select",
        options: [
          { label: "Library Service", value: "library_service" },
          { label: "Access Issue", value: "access_issue" },
          { label: "Resource Request", value: "resource_request" },
          { label: "Complaint", value: "complaint" },
          { label: "Other", value: "other" },
        ],
      },
      {
        name: "priority",
        label: "Priority",
        type: "select",
        options: [
          { label: "Low", value: "low" },
          { label: "Medium", value: "medium" },
          { label: "High", value: "high" },
          { label: "Critical", value: "critical" },
        ],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Open", value: "open" },
          { label: "In Progress", value: "in_progress" },
          { label: "Resolved", value: "resolved" },
          { label: "Closed", value: "closed" },
          { label: "Rejected", value: "rejected" },
        ],
      },
      {
        name: "target_entity",
        label: "Related Library Record",
        type: "entity-record",
        entityRecord: {
          typeName: "target_entity_type",
          idName: "target_entity_id",
          typePlaceholder: "Select record type",
          recordPlaceholder: "Select related record",
          configs: [
            { value: "library", label: "Library branch", adapter: "libraryBranch", filters: { active_only: false } },
            { value: "electronic_resource", label: "Electronic resource", adapter: "libraryElectronicResource" },
            { value: "library_resource", label: "Catalog resource", adapter: "libraryResource" },
          ],
        },
      },
      {
        name: "assigned_to_person_id",
        label: "Assigned Staff",
        type: "entity",
        relation: { adapter: "person", filters: { status: "active" }, allowClear: true },
      },
      { name: "resolved_at", label: "Resolved At", type: "datetime-local" },
      { name: "resolution_notes", label: "Resolution Notes", type: "textarea" },
    ],
    getRecordTitle: (record) => record.subject ?? "Support ticket",
    getRecordMeta: (record) =>
      [
        record.requester_name ?? record.requester_email,
        (record.target as { label?: string } | undefined)?.label,
        record.category,
        record.priority,
        record.status,
      ]
        .filter(Boolean)
        .join(" · "),
    buildPayload: (values, editingRecord) =>
      editingRecord
        ? {
            status: values.status,
            priority: values.priority,
            assigned_to_person_id: values.assigned_to_person_id || undefined,
            resolved_at: values.resolved_at || undefined,
            resolution_notes: normalizeText(values.resolution_notes),
          }
        : {
            requester_name: normalizeText(values.requester_name),
            requester_email: normalizeText(values.requester_email),
            subject: normalizeText(values.subject),
            description: normalizeText(values.description),
            category: values.category || "other",
            priority: values.priority || "medium",
            target_entity_type: values.target_entity_type || undefined,
            target_entity_id: values.target_entity_id || undefined,
          },
  } as PortalResourceConfig<LibrarySupportTicket, LibraryGenericPayload>,
  statistics: {
    ...libraryGenericResource(
      "statistics",
      "Statistics",
      "Manage library statistics displayed on public surfaces.",
      libraryServiceApi.statistics,
      ["library.manage_statistics"],
    ),
    portalScope: libraryBranchPortalScope,
    list: async (filters) => {
      const libraryId = filters?.library_id || (await firstLibraryId());
      if (!libraryId) return { data: [] };
      return libraryServiceApi.statistics.list({
        ...pageParams,
        ...filters,
        library_id: String(libraryId),
      });
    },
  },
  guides: {
    key: "guides",
    title: "Library Guides",
    description:
      "Manage public subject, course, database, and research guides for each branch.",
    backHref: "/library",
    queryKey: ["library-portal", "guides"],
    portalScope: libraryBranchPortalScope,
    fields: [
      {
        name: "library_id",
        label: "Library Branch",
        type: "entity",
        relation: {
          adapter: "libraryBranch",
          filters: { active_only: false },
          allowClear: true,
        },
      },
      { name: "title", label: "Title", required: true },
      { name: "slug", label: "Slug", required: true },
      {
        name: "guide_type",
        label: "Guide Type",
        type: "select",
        options: libraryGuideTypeOptions,
      },
      { name: "summary", label: "Summary", type: "textarea" },
      { name: "subject", label: "Subject" },
      { name: "course_code", label: "Course Code" },
      { name: "audience", label: "Audience" },
      {
        name: "school_id",
        label: "School",
        type: "entity",
        relation: { adapter: "school", filters: { is_active: true }, allowClear: true },
      },
      {
        name: "department_id",
        label: "Department",
        type: "entity",
        relation: { adapter: "department", filters: { is_active: true }, allowClear: true },
      },
      {
        name: "owner_staff_id",
        label: "Guide Owner",
        type: "entity",
        relation: { adapter: "libraryStaff", allowClear: true },
      },
      { name: "is_public", label: "Public", type: "boolean" },
      { name: "is_active", label: "Active", type: "boolean" },
      { name: "sort_order", label: "Sort Order", type: "number" },
    ],
    listFilters: [
      {
        name: "library_id",
        label: "Library Branch",
        type: "entity",
        relation: { adapter: "libraryBranch", filters: { active_only: false } },
      },
      {
        name: "guide_type",
        label: "Guide Type",
        type: "select",
        options: libraryGuideTypeOptions,
      },
      ...yesNoFilters,
    ],
    list: async (filters) => {
      const libraryId = filters?.library_id || (await firstLibraryId());
      if (!libraryId) return { data: [] };
      return libraryServiceApi.guides.list({
        ...pageParams,
        ...filters,
        library_id: String(libraryId),
      });
    },
    create: (payload) => libraryServiceApi.guides.create(payload),
    update: (id, payload) => libraryServiceApi.guides.update(id, payload),
    delete: (id) => libraryServiceApi.guides.delete(id),
    getRecordTitle: (record) => record.title,
    getRecordMeta: (record) =>
      metaOf(record, ["guide_type", "subject", "course_code", "is_public"]),
    emptyMessage: "No library guides were returned.",
    buildPayload: (values) => ({
      ...values,
      guide_type: values.guide_type || "subject",
      is_public: values.is_public,
      is_active: values.is_active,
      sort_order: values.sort_order ?? 100,
    }),
    viewScopes: ["library.view", "library.manage_services"],
    manageScopes: ["library.manage_services"],
  } as PortalResourceConfig<LibraryGuide, LibraryGenericPayload>,
  specialists: {
    key: "specialists",
    title: "Library Specialists",
    description:
      "Assign public specialist support areas to library staff without typing staff IDs.",
    backHref: "/library",
    queryKey: ["library-portal", "specialists"],
    portalScope: libraryBranchPortalScope,
    fields: [
      {
        name: "library_id",
        label: "Library Branch",
        type: "entity",
        relation: {
          adapter: "libraryBranch",
          filters: { active_only: false },
          allowClear: true,
        },
      },
      {
        name: "staff_id",
        label: "Library Staff",
        type: "entity",
        relation: { adapter: "libraryStaff", allowClear: true },
      },
      {
        name: "subjects",
        label: "Subjects",
        type: "textarea",
        placeholder: "One subject per line or comma-separated",
      },
      {
        name: "schools",
        label: "Schools",
        type: "textarea",
        placeholder: "One school per line or comma-separated",
      },
      {
        name: "departments",
        label: "Departments",
        type: "textarea",
        placeholder: "One department per line or comma-separated",
      },
      {
        name: "support_areas",
        label: "Support Areas",
        type: "textarea",
        placeholder: "Referencing, literature search, repository deposits",
      },
      { name: "booking_url", label: "Booking URL", type: "url" },
      { name: "is_public", label: "Public", type: "boolean" },
      { name: "is_active", label: "Active", type: "boolean" },
      { name: "sort_order", label: "Sort Order", type: "number" },
    ],
    listFilters: [
      {
        name: "library_id",
        label: "Library Branch",
        type: "entity",
        relation: { adapter: "libraryBranch", filters: { active_only: false } },
      },
      ...yesNoFilters,
    ],
    list: async (filters) => {
      const libraryId = filters?.library_id || (await firstLibraryId());
      if (!libraryId) return { data: [] };
      return libraryServiceApi.specialists.list({
        ...pageParams,
        ...filters,
        library_id: String(libraryId),
      });
    },
    create: (payload) => libraryServiceApi.specialists.create(payload),
    update: (id, payload) => libraryServiceApi.specialists.update(id, payload),
    delete: (id) => libraryServiceApi.specialists.delete(id),
    getRecordTitle: (record) =>
      [
        ...(record.subjects ?? []),
        ...(record.support_areas ?? []),
      ][0] ?? "Library specialist",
    getRecordMeta: (record) =>
      [
        libraryLabelOf(record),
        (record.schools ?? []).join(", "),
        (record.departments ?? []).join(", "),
        record.is_public ? "Public" : "Private",
      ]
        .filter(Boolean)
        .join(" · "),
    emptyMessage: "No library specialists were returned.",
    buildPayload: (values) => ({
      ...values,
      subjects: splitList(values.subjects),
      schools: splitList(values.schools),
      departments: splitList(values.departments),
      support_areas: splitList(values.support_areas),
      is_public: values.is_public,
      is_active: values.is_active,
      sort_order: values.sort_order ?? 100,
    }),
    viewScopes: ["library.view", "library.manage_staff"],
    manageScopes: ["library.manage_staff"],
  } as PortalResourceConfig<LibrarySpecialist, LibraryGenericPayload>,
  workflows: {
    key: "workflows",
    title: "Library Workflows",
    description:
      "Manage public borrowing, clearance, research, and repository workflows.",
    backHref: "/library",
    queryKey: ["library-portal", "workflows"],
    portalScope: libraryBranchPortalScope,
    fields: [
      {
        name: "library_id",
        label: "Library Branch",
        type: "entity",
        relation: {
          adapter: "libraryBranch",
          filters: { active_only: false },
          allowClear: true,
        },
      },
      { name: "title", label: "Title", required: true },
      { name: "slug", label: "Slug", required: true },
      {
        name: "workflow_type",
        label: "Workflow Type",
        type: "select",
        options: libraryWorkflowTypeOptions,
      },
      { name: "summary", label: "Summary", type: "textarea" },
      { name: "audience", label: "Audience" },
      { name: "is_public", label: "Public", type: "boolean" },
      { name: "is_active", label: "Active", type: "boolean" },
      { name: "sort_order", label: "Sort Order", type: "number" },
    ],
    listFilters: [
      {
        name: "library_id",
        label: "Library Branch",
        type: "entity",
        relation: { adapter: "libraryBranch", filters: { active_only: false } },
      },
      {
        name: "workflow_type",
        label: "Workflow Type",
        type: "select",
        options: libraryWorkflowTypeOptions,
      },
      ...yesNoFilters,
    ],
    list: async (filters) => {
      const libraryId = filters?.library_id || (await firstLibraryId());
      if (!libraryId) return { data: [] };
      return libraryServiceApi.workflows.list({
        ...pageParams,
        ...filters,
        library_id: String(libraryId),
      });
    },
    create: (payload) => libraryServiceApi.workflows.create(payload),
    update: (id, payload) => libraryServiceApi.workflows.update(id, payload),
    delete: (id) => libraryServiceApi.workflows.delete(id),
    getRecordTitle: (record) => record.title,
    getRecordMeta: (record) =>
      metaOf(record, ["workflow_type", "audience", "is_public"]),
    emptyMessage: "No library workflows were returned.",
    buildPayload: (values) => ({
      ...values,
      workflow_type: values.workflow_type || "other",
      is_public: values.is_public,
      is_active: values.is_active,
      sort_order: values.sort_order ?? 100,
    }),
    viewScopes: ["library.view", "library.manage_services"],
    manageScopes: ["library.manage_services"],
  } as PortalResourceConfig<LibraryWorkflow, LibraryGenericPayload>,
  policies: {
    key: "policies",
    title: "Library Policies",
    description:
      "Manage public library policy pages, including borrowing and access rules.",
    backHref: "/library",
    queryKey: ["library-portal", "policies"],
    portalScope: libraryBranchPortalScope,
    fields: [
      {
        name: "library_id",
        label: "Library Branch",
        type: "entity",
        relation: {
          adapter: "libraryBranch",
          filters: { active_only: false },
          allowClear: true,
        },
      },
      { name: "title", label: "Title", required: true },
      { name: "slug", label: "Slug", required: true },
      {
        name: "policy_type",
        label: "Policy Type",
        type: "select",
        options: libraryPolicyTypeOptions,
      },
      { name: "content", label: "Content", type: "textarea" },
      {
        name: "file_id",
        label: "Policy File",
        type: "entity",
        relation: { adapter: "media", allowClear: true },
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: libraryPolicyStatusOptions,
      },
      { name: "is_public", label: "Public", type: "boolean" },
      { name: "sort_order", label: "Sort Order", type: "number" },
    ],
    listFilters: [
      {
        name: "library_id",
        label: "Library Branch",
        type: "entity",
        relation: { adapter: "libraryBranch", filters: { active_only: false } },
      },
      {
        name: "policy_type",
        label: "Policy Type",
        type: "select",
        options: libraryPolicyTypeOptions,
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: libraryPolicyStatusOptions,
      },
      { name: "is_public", label: "Public", type: "boolean" },
    ],
    list: async (filters) => {
      const libraryId = filters?.library_id || (await firstLibraryId());
      if (!libraryId) return { data: [] };
      return libraryServiceApi.policies.list({
        ...pageParams,
        ...filters,
        library_id: String(libraryId),
      });
    },
    create: (payload) => libraryServiceApi.policies.create(payload),
    update: (id, payload) => libraryServiceApi.policies.update(id, payload),
    delete: (id) => libraryServiceApi.policies.delete(id),
    getRecordTitle: (record) => record.title,
    getRecordMeta: (record) =>
      metaOf(record, ["policy_type", "status", "is_public"]),
    emptyMessage: "No library policies were returned.",
    buildPayload: (values) => ({
      ...values,
      policy_type: values.policy_type || "other",
      status: values.status || "draft",
      is_public: values.is_public,
      sort_order: values.sort_order ?? 100,
    }),
    viewScopes: ["library.view", "library.manage_regulations"],
    manageScopes: ["library.manage_regulations"],
  } as PortalResourceConfig<LibraryPolicyPage, LibraryGenericPayload>,
  staff: {
    ...libraryGenericResource(
      "staff",
      "Library Staff",
      "Manage library staff profiles and assignments.",
      libraryServiceApi.staff as any,
      ["library.manage_staff"],
    ),
    portalScope: libraryBranchPortalScope,
    list: async (filters) => {
      const libraryId = filters?.library_id || (await firstLibraryId());
      if (!libraryId) return { data: [] };
      return libraryServiceApi.staff.list({
        ...filters,
        library_id: String(libraryId),
      });
    },
    fields: [
      {
        name: "library_id",
        label: "Library Branch",
        required: true,
        type: "entity",
        relation: { adapter: "libraryBranch", filters: { active_only: false } },
      },
      {
        name: "person_id",
        label: "Person",
        required: true,
        type: "entity",
        relation: { adapter: "person", filters: { status: "active" } },
      },
      { name: "job_title", label: "Job Title" },
      { name: "department", label: "Department" },
      { name: "role", label: "Role" },
      { name: "bio", label: "Bio", type: "textarea" },
      { name: "is_public", label: "Public", type: "boolean" },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
  } as PortalResourceConfig<LibraryStaff, LibraryGenericPayload>,
};

async function firstLibraryId() {
  const branches = await libraryServiceApi.branches.list({
    active_only: false,
    page: 1,
    per_page: 1,
  });
  return branches.data?.[0]?.id;
}

function libraryGenericResource<
  TRecord extends PortalRecord = LibraryGenericRecord,
>(
  key: string,
  title: string,
  description: string,
  api: {
    list: (params?: any) => Promise<{ data?: TRecord[] }>;
    create: (payload: any) => Promise<unknown>;
    update: (
      id: string,
      payload: Partial<LibraryGenericPayload>,
    ) => Promise<unknown>;
    delete?: (id: string) => Promise<unknown>;
  },
  manageScopes: string[],
): PortalResourceConfig<TRecord, LibraryGenericPayload> {
  return {
    key,
    title,
    description,
    backHref: "/library",
    queryKey: ["library-portal", key],
    portalScope: libraryBranchPortalScope,
    fields: [
      {
        name: "library_id",
        label: "Library Branch",
        type: "entity",
        relation: {
          adapter: "libraryBranch",
          filters: { active_only: false },
          allowClear: true,
        },
      },
      { name: "title", label: "Title" },
      { name: "name", label: "Name" },
      { name: "slug", label: "Slug" },
      { name: "description", label: "Description", type: "textarea" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
      { name: "is_public", label: "Public", type: "boolean" },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
    listFilters: [
      {
        name: "library_id",
        label: "Library Branch",
        type: "entity",
        relation: { adapter: "libraryBranch", filters: { active_only: false } },
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
    ],
    list: (filters) => api.list({ ...pageParams, ...filters }),
    create: api.create,
    update: api.update,
    delete: api.delete,
    getRecordTitle: titleOf,
    getRecordMeta: (record) =>
      metaOf(record, ["status", "updated_at"]),
    emptyMessage: `No ${title.toLowerCase()} records were returned.`,
    buildPayload: (values) => ({
      ...values,
      title: normalizeText(values.title),
      name: normalizeText(values.name) ?? normalizeText(values.title),
      status: values.status || "active",
    }),
    viewScopes: ["library.view", ...manageScopes],
    manageScopes,
  };
}

const publicationResources: Record<string, PortalResourceConfig<any, any>> = {
  submissions: publicationResource(
    "submissions",
    "My Submissions",
    "Submit and maintain article or paper records.",
    { status: "draft" },
    ["publications.submit", "publications.manage"],
  ),
  "school-review": publicationResource(
    "school-review",
    "School Review Queue",
    "Validate researcher submissions at school level.",
    { status: "submitted" },
    ["publications.review"],
  ),
  "office-review": publicationResource(
    "office-review",
    "Research Office Review",
    "Approve school-validated publication submissions.",
    { status: "school_approved" },
    ["publications.approve", "research.manage_publications"],
  ),
  published: publicationResource(
    "published",
    "Published Records",
    "Manage records already visible on the public publications page.",
    { status: "published" },
    ["publications.manage", "research.manage_publications"],
  ),
  journals: genericResearchResource(
    "journals",
    "Journals",
    "Manage journals referenced by publications.",
    researchServiceApi.journals,
    ["research.manage_journals", "research.manage_publications"],
  ),
  authors: {
    key: "authors",
    title: "Authors",
    description: "Manage researcher profiles that can own publication records.",
    backHref: "/publications",
    queryKey: ["publications", "authors"],
    fields: [
      { name: "first_name", label: "First Name", required: true },
      { name: "last_name", label: "Last Name", required: true },
      { name: "full_name", label: "Full Name" },
      { name: "email", label: "Email", required: true, type: "email" },
      {
        name: "department_id",
        label: "Department",
        type: "entity",
        relation: {
          adapter: "department",
          filters: { is_active: true },
          allowClear: true,
        },
      },
      { name: "academic_rank", label: "Academic Rank" },
      { name: "research_interests", label: "Research Interests" },
      { name: "orcid", label: "ORCID" },
      { name: "google_scholar_url", label: "Google Scholar URL", type: "url" },
      { name: "is_researcher", label: "Researcher", type: "boolean" },
      { name: "is_active", label: "Active", type: "boolean" },
      { name: "is_public", label: "Public", type: "boolean" },
    ],
    listFilters: [
      {
        name: "department_id",
        label: "Department",
        type: "entity",
        relation: { adapter: "department", filters: { is_active: true } },
      },
      { name: "is_researcher", label: "Researcher", type: "boolean" },
    ],
    list: (filters) =>
      personsApi.listAdmin({
        ...pageParams,
        is_researcher: true,
        ...filters,
      }),
    create: (payload) => personsApi.create(payload as any),
    update: (id, payload) => personsApi.update(id, payload as any),
    delete: (id) => personsApi.delete(id),
    getRecordTitle: (record) =>
      record.full_name ||
      [record.first_name, record.last_name].filter(Boolean).join(" "),
    getRecordMeta: (record) =>
      metaOf(record, ["email", "academic_rank", "department_name"]),
    emptyMessage: "No researcher author profiles were returned.",
    buildPayload: (values) => ({
      ...values,
      full_name:
        values.full_name ||
        [values.first_name, values.last_name].filter(Boolean).join(" "),
      is_researcher: true,
    }),
    viewScopes: ["persons.view", "publications.view"],
    manageScopes: ["persons.manage", "publications.manage"],
  } as PortalResourceConfig<Person>,
};

function publicationResource(
  key: string,
  title: string,
  description: string,
  defaultFilters: PortalPayload,
  manageScopes: string[],
): PortalResourceConfig<ResearchPublication, ResearchPublicationPayload> {
  return {
    key,
    title,
    description,
    backHref: "/publications",
    queryKey: ["publications", key],
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "slug", label: "Slug" },
      {
        name: "publication_type",
        label: "Publication Type",
        type: "select",
        options: [
          { label: "Journal Article", value: "journal_article" },
          { label: "Conference Paper", value: "conference_paper" },
          { label: "Book", value: "book" },
          { label: "Book Chapter", value: "book_chapter" },
          { label: "Report", value: "report" },
          { label: "Working Paper", value: "working_paper" },
        ],
      },
      { name: "abstract", label: "Abstract", type: "textarea" },
      { name: "journal_name", label: "Journal Name" },
      { name: "publisher", label: "Publisher" },
      { name: "year", label: "Year", type: "number" },
      { name: "doi", label: "DOI" },
      { name: "url", label: "URL", type: "url" },
      { name: "pdf_url", label: "PDF URL", type: "url" },
      { name: "publication_date", label: "Publication Date", type: "date" },
      { name: "submission_date", label: "Submission Date", type: "date" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          ...statusOptions,
          { label: "School Approved", value: "school_approved" },
          {
            label: "Returned for Correction",
            value: "returned_for_correction",
          },
        ],
      },
      { name: "is_open_access", label: "Open Access", type: "boolean" },
      { name: "is_featured", label: "Featured", type: "boolean" },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
    listFilters: [
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          ...statusOptions,
          { label: "School Approved", value: "school_approved" },
          {
            label: "Returned for Correction",
            value: "returned_for_correction",
          },
        ],
      },
      {
        name: "publication_type",
        label: "Type",
        type: "select",
        options: [
          { label: "Journal Article", value: "journal_article" },
          { label: "Conference Paper", value: "conference_paper" },
        ],
      },
    ],
    list: (filters) =>
      researchServiceApi.publications.list({
        ...pageParams,
        fields: "id,title,slug,publication_type,project_id,center_id,journal_id,journal_name,year,status,is_open_access,is_featured,is_active",
        include: "project:id,title,code;center:id,name,code;journal:id,name,abbreviation",
        ...defaultFilters,
        ...filters,
      }),
    create: (payload) => researchServiceApi.publications.create(payload),
    update: (id, payload) =>
      researchServiceApi.publications.update(id, payload),
    delete: (id) => researchServiceApi.publications.delete(id),
    getRecordTitle: (record) => record.title,
    getRecordMeta: (record) =>
      [
        record.publication_type,
        (record.project as { title?: string } | undefined)?.title,
        (record.center as { name?: string } | undefined)?.name,
        (record.journal as { name?: string } | undefined)?.name ??
          record.journal_name,
        record.status,
        record.year,
      ]
        .filter(Boolean)
        .join(" · "),
    getRecordWorkflowActions: (record) => {
      const actions = [];
      if (["draft", "returned_for_correction"].includes(record.status ?? "")) {
        actions.push({
          label: "Submit",
          successMessage: "Submission sent for school validation",
          payload: {
            status: "submitted",
            submission_date: new Date().toISOString().slice(0, 10),
          },
          confirmTitle: "Submit publication?",
          confirmDescription: `This will send "${record.title}" to the school validation queue.`,
        });
      }
      if (record.status === "submitted") {
        actions.push(
          {
            label: "School Approve",
            successMessage: "Submission moved to research office review",
            payload: { status: "school_approved" },
            confirmTitle: "Approve at school level?",
            confirmDescription: `This confirms school validation for "${record.title}" and moves it to research office review.`,
          },
          {
            label: "Return",
            variant: "outline" as const,
            successMessage: "Submission returned for correction",
            payload: { status: "returned_for_correction" },
            confirmTitle: "Return submission?",
            confirmDescription: `This returns "${record.title}" to the researcher for correction.`,
          },
        );
      }
      if (record.status === "school_approved") {
        actions.push(
          {
            label: "Approve",
            successMessage: "Publication approved",
            payload: { status: "approved" },
            confirmTitle: "Approve publication?",
            confirmDescription: `This marks "${record.title}" as approved by the research office.`,
          },
          {
            label: "Return",
            variant: "outline" as const,
            successMessage: "Submission returned for correction",
            payload: { status: "returned_for_correction" },
            confirmTitle: "Return submission?",
            confirmDescription: `This returns "${record.title}" from research office review for correction.`,
          },
        );
      }
      if (["approved", "published"].includes(record.status ?? "")) {
        actions.push({
          label: record.status === "published" ? "Unpublish" : "Publish",
          variant:
            record.status === "published" ? ("outline" as const) : undefined,
          successMessage:
            record.status === "published"
              ? "Publication unpublished"
              : "Publication published",
          payload:
            record.status === "published"
              ? { status: "approved", is_active: true }
              : {
                  status: "published",
                  is_active: true,
                  publication_date:
                    record.publication_date ??
                    new Date().toISOString().slice(0, 10),
                },
          confirmTitle:
            record.status === "published"
              ? "Unpublish publication?"
              : "Publish publication?",
          confirmDescription:
            record.status === "published"
              ? `This removes "${record.title}" from the public publications page.`
              : `This makes "${record.title}" visible on the public publications page.`,
        });
      }
      return actions;
    },
    emptyMessage: `No ${title.toLowerCase()} records were returned.`,
    buildPayload: (values) => ({
      ...values,
      publication_type: values.publication_type || "journal_article",
      status: values.status || defaultFilters.status || "draft",
    }),
    viewScopes: ["publications.view", ...manageScopes],
    manageScopes,
    deleteScopes: ["publications.manage", "research.manage_publications"],
    canDelete: key === "submissions" || key === "published",
  };
}

export const portalConfigs: Record<string, PortalConfig> = {
  "institutional-administration": {
    key: "institutional-administration",
    title: "Institutional Administration Portal",
    shortTitle: "Administration",
    description:
      "VC office, DVC divisions, registrar offices, directorates, administrative wings, documents, services, contacts, and staff assignments.",
    service: "main",
    baseHref: "/institutional-administration",
    icon: Building2,
    accentClassName: "text-sky-700 bg-sky-50 border-sky-100",
    nav: [
      {
        title: "Dashboard",
        href: "/institutional-administration",
        icon: PanelsTopLeft,
        scope: "administration.view",
      },
      {
        title: "DVC Divisions",
        href: "/institutional-administration/divisions",
        icon: Building2,
        scope: "administration.manage_units",
      },
      {
        title: "Registrar Offices",
        href: "/institutional-administration/offices",
        icon: Landmark,
        scope: ["office.view", "office.manage_content"],
      },
      {
        title: "Staff Assignments",
        href: "/institutional-administration/staff-assignments",
        icon: UserCheck,
        scope: ["office.manage_staff", "staff.view_assignments"],
      },
      {
        title: "Office News",
        href: "/institutional-administration/news",
        icon: Newspaper,
        scope: ["office.manage_content", "content.manage_news"],
      },
      {
        title: "Office Notices",
        href: "/institutional-administration/notices",
        icon: Megaphone,
        scope: ["office.manage_content", "content.manage_announcements"],
      },
      {
        title: "Office Events",
        href: "/institutional-administration/events",
        icon: CalendarDays,
        scope: ["office.manage_content", "content.manage_events"],
      },
      {
        title: "Documents & Media",
        href: "/institutional-administration/documents",
        icon: ScrollText,
        scope: ["office.manage_content", "administration.manage_content", "policy.view"],
      },
      {
        title: "Office FAQs",
        href: "/institutional-administration/faqs",
        icon: ClipboardCheck,
        scope: ["office.manage_content", "support.manage_faqs"],
      },
      {
        title: "Office Contacts",
        href: "/institutional-administration/contacts",
        icon: Users,
        scope: ["office.manage_content", "support.manage_contacts"],
      },
    ],
    dashboard: dashboard(
      "Institutional Administration",
      "Manage administrative offices with scoped ownership instead of one shared governance workspace.",
      [
        stat(
          "DVC Divisions",
          "Divisions and directorates",
          "/institutional-administration/divisions",
          Building2,
          ["administration.view"],
          ["institutional-administration", "divisions"],
          () => divisionsApi.listAdmin(countParams),
        ),
        stat(
          "Registrar Offices",
          "Wings and offices",
          "/institutional-administration/offices",
          Landmark,
          ["office.view"],
          ["institutional-administration", "offices"],
          () => wingsApi.listAdmin(countParams),
        ),
        stat(
          "Assignments",
          "Office staff roles",
          "/institutional-administration/staff-assignments",
          UserCheck,
          ["staff.view_assignments"],
          ["institutional-administration", "staff"],
          () => staffApi.listAssignments({ entity_type: "division" }),
        ),
        stat(
          "Office News",
          "Scoped updates",
          "/institutional-administration/news",
          Newspaper,
          ["office.view"],
          ["institutional-administration", "news"],
          () => newsApi.listAdmin({ ...countParams }),
        ),
        stat(
          "Office Notices",
          "Scoped announcements",
          "/institutional-administration/notices",
          Megaphone,
          ["office.view"],
          ["institutional-administration", "notices"],
          () => announcementsApi.listAdmin({ ...countParams }),
        ),
        stat(
          "Office Events",
          "Scoped calendar",
          "/institutional-administration/events",
          CalendarDays,
          ["office.view"],
          ["institutional-administration", "events"],
          () => eventsApi.listAdmin({ ...countParams }),
        ),
        stat(
          "Documents",
          "Office files",
          "/institutional-administration/documents",
          ScrollText,
          ["office.view"],
          ["institutional-administration", "documents"],
          () => documentsApi.listAdmin({ ...countParams }),
        ),
        stat(
          "Office FAQs",
          "Public help content",
          "/institutional-administration/faqs",
          ClipboardCheck,
          ["office.view"],
          ["institutional-administration", "faqs"],
          () => faqsApi.listAdmin({ ...countParams }),
        ),
        stat(
          "Office Contacts",
          "Public contact entries",
          "/institutional-administration/contacts",
          Users,
          ["office.view"],
          ["institutional-administration", "contacts"],
          () => contactsApi.listAdmin({ ...countParams }),
        ),
      ],
      administrationResources,
      [
        "administration.manage_units",
        "office.manage_content",
        "office.manage_staff",
      ],
    ),
    resources: administrationResources,
  },
  governance: {
    key: "governance",
    title: "Governance Portal",
    shortTitle: "Governance",
    description:
      "Council, UMB, DVCs, registrars, deputy registrars, policies, and governance approvals.",
    service: "main",
    baseHref: "/governance",
    icon: Landmark,
    accentClassName: "text-blue-700 bg-blue-50 border-blue-100",
    nav: [
      {
        title: "Dashboard",
        href: "/governance",
        icon: PanelsTopLeft,
        scope: "governance.view",
      },
      {
        title: "Council & Boards",
        href: "/governance/council",
        icon: Landmark,
        scope: "governance.manage_boards",
      },
      {
        title: "Divisions",
        href: "/governance/divisions",
        icon: Building2,
        scope: ["governance.manage_divisions", "organization.manage_divisions"],
      },
      {
        title: "Division Wings",
        href: "/governance/wings",
        icon: Building2,
        scope: ["governance.manage_divisions", "organization.manage_divisions"],
      },
      {
        title: "Staff Assignments",
        href: "/governance/staff-assignments",
        icon: UserCheck,
        scope: "staff.manage_assignments",
      },
      {
        title: "Policies & Documents",
        href: "/governance/documents",
        icon: ScrollText,
        scope: ["policy.manage", "policy.view"],
      },
    ],
    dashboard: dashboard(
      "Governance Dashboard",
      "Manage leadership structures, governance documents, and approval state.",
      [
        stat(
          "Council & Boards",
          "Governance bodies",
          "/governance/council",
          Landmark,
          ["governance.view"],
          ["governance", "boards"],
          () => governanceApi.listBoards(),
        ),
        stat(
          "Divisions",
          "Administrative divisions",
          "/governance/divisions",
          Building2,
          ["governance.view"],
          ["governance", "divisions"],
          () => divisionsApi.listAdmin(countParams),
        ),
        stat(
          "Documents",
          "Policies and charters",
          "/governance/documents",
          ScrollText,
          ["policy.view"],
          ["governance", "documents"],
          () => documentsApi.listAdmin({ ...countParams, scope_type: "governance" }),
        ),
        stat(
          "Assignments",
          "Leadership assignments",
          "/governance/staff-assignments",
          UserCheck,
          ["staff.view_assignments"],
          ["governance", "staff"],
          () => staffApi.listAssignments({ entity_type: "board" }),
        ),
      ],
      governanceResources,
      ["governance.manage_boards", "policy.publish", "workflow.approve"],
    ),
    resources: governanceResources,
  },
  schools: {
    key: "schools",
    title: "Schools Portal",
    shortTitle: "Schools",
    description:
      "School profiles, programmes, departments, staff, content, and school validation.",
    service: "main",
    baseHref: "/schools",
    icon: GraduationCap,
    accentClassName: "text-blue-700 bg-blue-50 border-blue-100",
    nav: [
      {
        title: "Dashboard",
        href: "/schools",
        icon: PanelsTopLeft,
        scope: "academic.view",
      },
      {
        title: "School Profiles",
        href: "/schools/profiles",
        icon: GraduationCap,
        scope: "academic.manage_schools",
      },
      {
        title: "Departments",
        href: "/schools/departments",
        icon: Building2,
        scope: "academic.manage_departments",
      },
      {
        title: "Programmes",
        href: "/schools/programmes",
        icon: BookOpen,
        scope: "academic.manage_programmes",
      },
      {
        title: "Calendars",
        href: "/schools/calendars",
        icon: CalendarDays,
        scope: "academic.manage_calendars",
      },
      {
        title: "Intakes",
        href: "/schools/intakes",
        icon: ClipboardCheck,
        scope: "academic.manage_intakes",
      },
      {
        title: "Staff",
        href: "/schools/staff",
        icon: Users,
        scope: "staff.view_assignments",
      },
      {
        title: "News",
        href: "/schools/news",
        icon: Newspaper,
        scope: "content.manage_news",
      },
      {
        title: "Events",
        href: "/schools/events",
        icon: CalendarDays,
        scope: "content.manage_events",
      },
      {
        title: "School Validation",
        href: "/schools/validation",
        icon: ClipboardCheck,
        scope: "publications.review",
      },
    ],
    dashboard: dashboard(
      "School Dashboard",
      "Manage school mini-sites, academic structures, and validation queues.",
      [
        stat(
          "Schools",
          "School records",
          "/schools/profiles",
          GraduationCap,
          ["academic.view"],
          ["schools", "profiles"],
          () => schoolsApi.listAdmin(countParams),
        ),
        stat(
          "Programmes",
          "School programmes",
          "/schools/programmes",
          BookOpen,
          ["academic.view"],
          ["schools", "programmes"],
          () => programmesApi.listAdmin(countParams),
        ),
        stat(
          "Departments",
          "Academic departments",
          "/schools/departments",
          Building2,
          ["academic.view"],
          ["schools", "departments"],
          () => departmentsApi.listAdmin(countParams),
        ),
        stat(
          "Validation Queue",
          "Submitted publications",
          "/schools/validation",
          ClipboardCheck,
          ["publications.review"],
          ["schools", "validation"],
          () =>
            researchServiceApi.publications.list({
              ...countParams,
              status: "submitted",
            }),
        ),
      ],
      schoolResources,
      [
        "academic.manage_schools",
        "academic.manage_programmes",
        "publications.review",
      ],
    ),
    resources: schoolResources,
  },
  departments: {
    key: "departments",
    title: "Departmental Portal",
    shortTitle: "Departments",
    description:
      "Academic and administrative department profiles, staff, services, content, and resources.",
    service: "main",
    baseHref: "/departments",
    icon: Building2,
    accentClassName: "text-cyan-700 bg-cyan-50 border-cyan-100",
    nav: [
      {
        title: "Dashboard",
        href: "/departments",
        icon: PanelsTopLeft,
        scope: "academic.view",
      },
      {
        title: "Department Profiles",
        href: "/departments/profiles",
        icon: Building2,
        scope: "academic.manage_departments",
      },
      {
        title: "Staff",
        href: "/departments/staff",
        icon: Users,
        scope: "staff.view_assignments",
      },
      {
        title: "Programmes",
        href: "/departments/programmes",
        icon: BookOpen,
        scope: "academic.manage_programmes",
      },
      {
        title: "Notices",
        href: "/departments/notices",
        icon: Megaphone,
        scope: "content.manage_announcements",
      },
      {
        title: "Events",
        href: "/departments/events",
        icon: CalendarDays,
        scope: "content.manage_events",
      },
      {
        title: "Resources",
        href: "/departments/resources",
        icon: FileArchive,
        scope: "content.manage_pages",
      },
      {
        title: "FAQs",
        href: "/departments/faqs",
        icon: ScrollText,
        scope: "content.manage",
      },
      {
        title: "Contacts",
        href: "/departments/contacts",
        icon: Users,
        scope: "content.manage",
      },
    ],
    dashboard: dashboard(
      "Department Dashboard",
      "Operate department profiles, staff assignments, notices, events, and resources.",
      [
        stat(
          "Departments",
          "Profiles",
          "/departments/profiles",
          Building2,
          ["academic.view"],
          ["departments", "profiles"],
          () => departmentsApi.listAdmin(countParams),
        ),
        stat(
          "Programmes",
          "Department programmes",
          "/departments/programmes",
          BookOpen,
          ["academic.view"],
          ["departments", "programmes"],
          () => programmesApi.listAdmin(countParams),
        ),
        stat(
          "Notices",
          "Department notices",
          "/departments/notices",
          Megaphone,
          ["content.view"],
          ["departments", "notices"],
          () =>
            announcementsApi.listAdmin({ ...countParams, scope_type: "department" }),
        ),
        stat(
          "Events",
          "Department events",
          "/departments/events",
          CalendarDays,
          ["content.view"],
          ["departments", "events"],
          () => eventsApi.listAdmin({ ...countParams, scope_type: "department" }),
        ),
      ],
      departmentalResources,
      [
        "academic.manage_departments",
        "staff.manage_assignments",
        "content.manage_announcements",
      ],
    ),
    resources: departmentalResources,
  },
  "corporate-communication": {
    key: "corporate-communication",
    title: "Corporate Communication Portal",
    shortTitle: "Corporate Comms",
    description:
      "Newsroom, public notices, media library, homepage features, and publishing approvals.",
    service: "main",
    baseHref: "/corporate-communication",
    icon: Megaphone,
    accentClassName: "text-orange-700 bg-orange-50 border-orange-100",
    nav: [
      {
        title: "Dashboard",
        href: "/corporate-communication",
        icon: PanelsTopLeft,
        scope: "content.view",
      },
      {
        title: "Newsroom",
        href: "/corporate-communication/news",
        icon: Newspaper,
        scope: "content.manage_news",
      },
      {
        title: "Press Releases",
        href: "/corporate-communication/press-releases",
        icon: FileText,
        scope: "content.manage_blogs",
      },
      {
        title: "Public Notices",
        href: "/corporate-communication/notices",
        icon: Megaphone,
        scope: "content.manage_announcements",
      },
      {
        title: "Events",
        href: "/corporate-communication/events",
        icon: CalendarDays,
        scope: "content.manage_events",
      },
      {
        title: "Homepage Features",
        href: "/corporate-communication/homepage-features",
        icon: PanelsTopLeft,
        scope: "marketing.manage_sliders",
      },
      {
        title: "Slider Items",
        href: "/corporate-communication/sliders",
        icon: PanelsTopLeft,
        scope: "marketing.manage_sliders",
      },
      {
        title: "Media Folders",
        href: "/corporate-communication/media-folders",
        icon: ImageIcon,
        scope: "media.manage",
      },
      {
        title: "Media Assets",
        href: "/corporate-communication/media-assets",
        icon: ImageIcon,
        scope: "media.view",
      },
      {
        title: "FAQs",
        href: "/corporate-communication/faqs",
        icon: ScrollText,
        scope: "content.manage",
      },
      {
        title: "Contacts",
        href: "/corporate-communication/contacts",
        icon: Users,
        scope: "content.manage",
      },
      {
        title: "Testimonials",
        href: "/corporate-communication/testimonials",
        icon: BadgeCheck,
        scope: "content.manage",
      },
    ],
    dashboard: dashboard(
      "Newsroom Dashboard",
      "Coordinate public publishing, homepage features, and media assets.",
      [
        stat(
          "News",
          "Newsroom records",
          "/corporate-communication/news",
          Newspaper,
          ["content.view"],
          ["corporate", "news"],
          () => newsApi.listAdmin({ ...countParams, is_main: true }),
        ),
        stat(
          "Public Notices",
          "Announcements",
          "/corporate-communication/notices",
          Megaphone,
          ["content.view"],
          ["corporate", "notices"],
          () => announcementsApi.listAdmin({ ...countParams, is_main: true }),
        ),
        stat(
          "Events",
          "Public calendar",
          "/corporate-communication/events",
          CalendarDays,
          ["content.view"],
          ["corporate", "events"],
          () => eventsApi.listAdmin({ ...countParams, is_main: true }),
        ),
        stat(
          "Media",
          "Media assets",
          "/corporate-communication/media-assets",
          ImageIcon,
          ["media.view"],
          ["corporate", "media"],
          () => mediaApi.list(countParams),
        ),
      ],
      corporateResources,
      ["content.publish", "media.manage", "marketing.manage_sliders"],
    ),
    resources: corporateResources,
  },
  research: {
    key: "research",
    title: "Research Portal",
    shortTitle: "Research",
    description:
      "Research projects, grants, centers, outputs, partnerships, innovation, and impact.",
    service: "research",
    baseHref: "/research",
    icon: FlaskConical,
    accentClassName: "text-green-700 bg-green-50 border-green-100",
    nav: [
      {
        title: "Dashboard",
        href: "/research",
        icon: PanelsTopLeft,
        scope: "research.view",
      },
      {
        title: "Projects",
        href: "/research/projects",
        icon: FlaskConical,
        scope: "research.view_projects",
      },
      {
        title: "Centers",
        href: "/research/centers",
        icon: Building2,
        scope: "research.view",
      },
      {
        title: "Programs",
        href: "/research/programs",
        icon: BookOpen,
        scope: "research.view",
      },
      {
        title: "Themes",
        href: "/research/themes",
        icon: ScrollText,
        scope: "research.view",
      },
      {
        title: "Grants",
        href: "/research/grants",
        icon: BadgeCheck,
        scope: "research.manage_grants",
      },
      {
        title: "Grant Applications",
        href: "/research/grant-applications",
        icon: ClipboardCheck,
        scope: "research.manage_grants",
      },
      {
        title: "Grant Reviews",
        href: "/research/grant-reviews",
        icon: ClipboardCheck,
        scope: "research.review_grants",
      },
      {
        title: "Grant Reports",
        href: "/research/grant-reports",
        icon: FileText,
        scope: "research.manage_reports",
      },
      {
        title: "Grant Guidelines",
        href: "/research/grant-guidelines",
        icon: ScrollText,
        scope: "research.manage_grant_guidelines",
      },
      {
        title: "Funders",
        href: "/research/funders",
        icon: Users,
        scope: "funding.manage",
      },
      {
        title: "Partnerships",
        href: "/research/partnerships",
        icon: Users,
        scope: "partnerships.manage",
      },
      {
        title: "Innovation",
        href: "/research/innovations",
        icon: Boxes,
        scope: "innovation.review_disclosure",
      },
      {
        title: "Outputs",
        href: "/research/outputs",
        icon: FileText,
        scope: "research.manage_reports",
      },
      {
        title: "Impact",
        href: "/research/impact",
        icon: ClipboardCheck,
        scope: "research.manage_impact",
      },
      {
        title: "Research Resources",
        href: "/research/resources",
        icon: BookOpen,
        scope: "research.manage_resources",
      },
      {
        title: "Research Services",
        href: "/research/services",
        icon: ClipboardCheck,
        scope: "research.manage_services",
      },
      {
        title: "Guidelines",
        href: "/research/guidelines",
        icon: ScrollText,
        scope: "research.manage_guidelines",
      },
      {
        title: "Boards",
        href: "/research/boards",
        icon: Users,
        scope: "research.manage_boards",
      },
      {
        title: "Board Members",
        href: "/research/board-members",
        icon: UserCheck,
        scope: "research.manage_boards",
      },
      {
        title: "Office Staff",
        href: "/research/office-staff",
        icon: UserCheck,
        scope: "research.manage_office",
      },
      {
        title: "Research News",
        href: "/research/content/news",
        icon: Newspaper,
        scope: "content.manage_news",
      },
      {
        title: "Research Events",
        href: "/research/research-events",
        icon: CalendarDays,
        scope: "content.manage_events",
      },
    ],
    dashboard: dashboard(
      "Research Office Dashboard",
      "Manage the research office pipeline without mixing publication submissions into the main office screen.",
      [
        stat(
          "Projects",
          "Active projects",
          "/research/projects",
          FlaskConical,
          ["research.view"],
          ["research", "admin-stats", "active_projects"],
          () => researchAdminCount("active_projects"),
        ),
        stat(
          "Grants",
          "Funding records",
          "/research/grants",
          BadgeCheck,
          ["research.view"],
          ["research", "admin-stats", "grants"],
          () => researchAdminCount("grants"),
        ),
        stat(
          "Centers",
          "Research centers",
          "/research/centers",
          Building2,
          ["research.view"],
          ["research", "admin-stats", "centres"],
          () => researchAdminCount("centres"),
        ),
        stat(
          "Outputs",
          "Research outputs",
          "/research/outputs",
          FileText,
          ["research.view"],
          ["research", "admin-stats", "outputs"],
          () => researchAdminCount("outputs"),
        ),
      ],
      researchResources,
      ["research.manage_projects", "research.review_grants", "funding.manage"],
    ),
    resources: researchResources,
  },
  library: {
    key: "library",
    title: "Library Portal",
    shortTitle: "Library",
    description:
      "Branches, catalog, circulation, e-resources, inquiries, regulations, staff, and services.",
    service: "library",
    baseHref: "/library",
    icon: Library,
    accentClassName: "text-amber-700 bg-amber-50 border-amber-100",
    nav: [
      {
        title: "Dashboard",
        href: "/library",
        icon: PanelsTopLeft,
        scope: "library.view",
      },
      {
        title: "Branches",
        href: "/library/branches",
        icon: Building2,
        scope: "library.manage_services",
      },
      {
        title: "Today Hours",
        href: "/library/today-hours",
        icon: CalendarDays,
        scope: "library.view",
      },
      {
        title: "Branch Hours",
        href: "/library/branch-hours",
        icon: CalendarDays,
        scope: "library.view",
      },
      {
        title: "Branch Links",
        href: "/library/branch-links",
        icon: LinkIcon,
        scope: "library.view",
      },
      {
        title: "Branch Files",
        href: "/library/branch-files",
        icon: FileText,
        scope: "library.view",
      },
      {
        title: "Catalog",
        href: "/library/catalog",
        icon: Library,
        scope: "library.manage_resources",
      },
      {
        title: "Loans",
        href: "/library/loans",
        icon: BookOpen,
        scope: "library.manage_loans",
      },
      {
        title: "Reservations",
        href: "/library/reservations",
        icon: ClipboardCheck,
        scope: "library.manage_loans",
      },
      {
        title: "Charges",
        href: "/library/charges",
        icon: BadgeCheck,
        scope: "library.manage_services",
      },
      {
        title: "Electronic",
        href: "/library/electronic",
        icon: BookOpen,
        scope: "library.manage_resources",
      },
      {
        title: "Services",
        href: "/library/services",
        icon: ClipboardCheck,
        scope: "library.manage_services",
      },
      {
        title: "Regulations",
        href: "/library/regulations",
        icon: ScrollText,
        scope: "library.manage_regulations",
      },
      {
        title: "Inquiries",
        href: "/library/inquiries",
        icon: Megaphone,
        scope: "library.manage_services",
      },
      {
        title: "Tickets",
        href: "/library/tickets",
        icon: ClipboardCheck,
        scope: "library.manage_services",
      },
      {
        title: "Staff",
        href: "/library/staff",
        icon: Users,
        scope: "library.manage_staff",
      },
      {
        title: "Statistics",
        href: "/library/statistics",
        icon: FileText,
        scope: "library.manage_statistics",
      },
    ],
    dashboard: dashboard(
      "Library Dashboard",
      "Operate branch services, resources, requests, and public library content.",
      [
        stat(
          "Branches",
          "Library locations",
          "/library/branches",
          Building2,
          ["library.view"],
          ["library", "admin-stats", "active_branches"],
          () => libraryAdminCount("active_branches"),
        ),
        stat(
          "Catalog",
          "Branch resources",
          "/library/catalog",
          Library,
          ["library.view"],
          ["library", "admin-stats", "catalogue_resources"],
          () => libraryAdminCount("catalogue_resources"),
        ),
        stat(
          "Regulations",
          "Library rules",
          "/library/regulations",
          ScrollText,
          ["library.view"],
          ["library", "admin-stats", "active_regulations"],
          () => libraryAdminCount("active_regulations"),
        ),
        stat(
          "Loans",
          "Circulation records",
          "/library/loans",
          BookOpen,
          ["library.view"],
          ["library", "admin-stats", "loans"],
          () => libraryAdminCount("loans"),
        ),
      ],
      libraryResources,
      [
        "library.manage_resources",
        "library.manage_services",
        "library.manage_loans",
      ],
    ),
    resources: libraryResources,
  },
  publications: {
    key: "publications",
    title: "Publications Portal",
    shortTitle: "Publications",
    description:
      "Researcher submissions, school validation, research office approval, and public publication records.",
    service: "research",
    baseHref: "/publications",
    icon: BookOpen,
    accentClassName: "text-blue-700 bg-blue-50 border-blue-100",
    nav: [
      {
        title: "Dashboard",
        href: "/publications",
        icon: PanelsTopLeft,
        scope: "publications.view",
      },
      {
        title: "My Submissions",
        href: "/publications/submissions",
        icon: FileText,
        scope: "publications.submit",
      },
      {
        title: "School Review",
        href: "/publications/school-review",
        icon: ClipboardCheck,
        scope: "publications.review",
      },
      {
        title: "Office Review",
        href: "/publications/office-review",
        icon: ShieldCheck,
        scope: "publications.approve",
      },
      {
        title: "Published Records",
        href: "/publications/published",
        icon: BookOpen,
        scope: "publications.manage",
      },
      {
        title: "Journals",
        href: "/publications/journals",
        icon: Library,
        scope: "research.manage_journals",
      },
      {
        title: "Authors",
        href: "/publications/authors",
        icon: Users,
        scope: "persons.view",
      },
    ],
    dashboard: dashboard(
      "Publication Pipeline",
      "Run submission, school validation, research office approval, and publishing as its own portal.",
      [
        stat(
          "Submissions",
          "Draft and submitted papers",
          "/publications/submissions",
          FileText,
          ["publications.submit"],
          ["publications", "submissions"],
          () =>
            researchServiceApi.publications.list({
              ...countParams,
              status: "draft",
            }),
        ),
        stat(
          "School Review",
          "School validation",
          "/publications/school-review",
          ClipboardCheck,
          ["publications.review"],
          ["publications", "school-review"],
          () =>
            researchServiceApi.publications.list({
              ...countParams,
              status: "submitted",
            }),
        ),
        stat(
          "Office Review",
          "Research office approval",
          "/publications/office-review",
          ShieldCheck,
          ["publications.approve"],
          ["publications", "office-review"],
          () =>
            researchServiceApi.publications.list({
              ...countParams,
              status: "school_approved",
            }),
        ),
        stat(
          "Published",
          "Publications page records",
          "/publications/published",
          BookOpen,
          ["publications.view"],
          ["publications", "published"],
          () =>
            researchServiceApi.publications.list({
              ...countParams,
              status: "published",
            }),
        ),
      ],
      publicationResources,
      ["publications.submit", "publications.review", "publications.approve"],
    ),
    resources: publicationResources,
  },
};

function stat(
  title: string,
  description: string,
  href: string,
  icon: PortalConfig["icon"],
  scopes: string[],
  queryKey: readonly unknown[],
  query: () => Promise<unknown>,
) {
  return { title, description, href, icon, scopes, queryKey, query };
}

function dashboard(
  title: string,
  description: string,
  stats: PortalConfig["dashboard"]["stats"],
  resources: Record<string, PortalResourceConfig<any, any>>,
  scopeBadges: string[],
) {
  return {
    title,
    description,
    stats,
    scopeBadges,
    panels: Object.values(resources).map((resource) => ({
      title: resource.title,
      description: resource.description,
      href: `${resource.backHref}/${resource.key}`,
      icon: FileText,
      scopes: resource.viewScopes,
    })),
  };
}

export function getPortalConfig(key: string) {
  return portalConfigs[key];
}

export function getPortalResource(portalKey: string, resourceKey: string) {
  return portalConfigs[portalKey]?.resources[resourceKey];
}
