"use client";

import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, FileText, Lightbulb, Rocket, Trophy, Waypoints } from "lucide-react";
import type { ReactNode } from "react";
import type { EditableListFilter, EditableRecordColumn } from "@/components/dashboard/editable-service-resource-page";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";
import {
  formatPublicationDate,
  labelize,
  PublicationRelationCell,
  StatusBadge,
} from "../../publications/_components/publication-workspace";

const statusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Active", value: "active" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
  { label: "Discontinued", value: "discontinued" },
];

const visibilityFields = [
  { name: "status", label: "Status", type: "select" as const, options: statusOptions },
  { name: "is_active", label: "Active", type: "boolean" as const },
  { name: "is_public", label: "Public", type: "boolean" as const },
  { name: "is_featured", label: "Featured", type: "boolean" as const },
];

const innovationFilters: EditableListFilter[] = [
  { name: "search", label: "Search", type: "text", placeholder: "Search innovations, patent numbers, or inventors" },
  { name: "innovation_type", label: "Innovation Type", type: "select", options: [
    { label: "Product", value: "product" },
    { label: "Process", value: "process" },
    { label: "Service", value: "service" },
    { label: "Technology", value: "technology" },
    { label: "Software", value: "software" },
    { label: "Patent", value: "patent" },
    { label: "Prototype", value: "prototype" },
  ] },
  { name: "project_id", label: "Source Project", type: "entity", relation: { adapter: "researchProject", filters: { is_active: true } } },
  { name: "center_id", label: "Research Center", type: "entity", relation: { adapter: "researchCenter", filters: { is_active: true } } },
  { name: "status", label: "Status", type: "select", options: statusOptions },
  { name: "is_public", label: "Public", type: "boolean" },
  { name: "is_featured", label: "Featured", type: "boolean" },
];

const innovationColumns: EditableRecordColumn<ResearchGenericRecord>[] = [
  {
    key: "innovation",
    label: "Innovation",
    className: "min-w-[280px]",
    render: (record) => (
      <div className="space-y-1">
        <p className="font-medium">{record.title}</p>
        <p className="text-xs text-muted-foreground">{[record.code, labelize(record.innovation_type), labelize(record.development_stage)].filter(Boolean).join(" · ")}</p>
      </div>
    ),
  },
  { key: "project", label: "Source Project", className: "hidden min-w-[220px] lg:table-cell", render: (record) => <PublicationRelationCell id={record.project_id} adapterKey="researchProject" emptyLabel="No source project" /> },
  { key: "inventor", label: "Lead", className: "hidden min-w-[180px] xl:table-cell", render: (record) => <PublicationRelationCell id={record.lead_inventor_id} adapterKey="person" emptyLabel="No lead inventor" /> },
  { key: "ip", label: "IP / Commercial", className: "hidden min-w-[180px] xl:table-cell", render: (record) => <span>{[labelize(record.ip_status), labelize(record.commercialization_status)].filter(Boolean).join(" · ") || "Not recorded"}</span> },
  { key: "status", label: "Status", className: "w-[120px]", render: (record) => <StatusBadge value={record.status} /> },
];

const startupColumns: EditableRecordColumn<ResearchGenericRecord>[] = [
  {
    key: "startup",
    label: "Startup",
    className: "min-w-[260px]",
    render: (record) => (
      <div className="space-y-1">
        <p className="font-medium">{record.name}</p>
        <p className="text-xs text-muted-foreground">{[record.code, record.sector, labelize(record.venture_stage)].filter(Boolean).join(" · ")}</p>
      </div>
    ),
  },
  { key: "innovation", label: "Innovation", className: "hidden min-w-[220px] lg:table-cell", render: (record) => <PublicationRelationCell id={record.innovation_id} adapterKey="researchInnovation" emptyLabel="No innovation" /> },
  { key: "partner", label: "Partner", className: "hidden min-w-[180px] xl:table-cell", render: (record) => <PublicationRelationCell id={record.partner_id} adapterKey="researchPartner" emptyLabel="No partner" /> },
  { key: "registration", label: "Registration", className: "hidden w-[150px] xl:table-cell", render: (record) => <span>{labelize(record.registration_status)}</span> },
  { key: "status", label: "Status", className: "w-[120px]", render: (record) => <StatusBadge value={record.status} /> },
];

const incubationColumns: EditableRecordColumn<ResearchGenericRecord>[] = [
  {
    key: "record",
    label: "Incubation Record",
    className: "min-w-[280px]",
    render: (record) => (
      <div className="space-y-1">
        <p className="font-medium">{record.title}</p>
        <p className="text-xs text-muted-foreground">{[record.program_name, record.cohort, labelize(record.incubation_type)].filter(Boolean).join(" · ")}</p>
      </div>
    ),
  },
  { key: "innovation", label: "Innovation", className: "hidden min-w-[220px] lg:table-cell", render: (record) => <PublicationRelationCell id={record.innovation_id} adapterKey="researchInnovation" emptyLabel="No innovation" /> },
  { key: "startup", label: "Startup", className: "hidden min-w-[180px] xl:table-cell", render: (record) => <PublicationRelationCell id={record.startup_id} adapterKey="researchStartup" emptyLabel="No startup" /> },
  { key: "stage", label: "Stage", className: "w-[130px]", render: (record) => <span>{labelize(record.stage)}</span> },
  { key: "status", label: "Status", className: "w-[120px]", render: (record) => <StatusBadge value={record.status} /> },
];

const competitionColumns: EditableRecordColumn<ResearchGenericRecord>[] = [
  {
    key: "entry",
    label: "Entry",
    className: "min-w-[280px]",
    render: (record) => (
      <div className="space-y-1">
        <p className="font-medium">{record.title}</p>
        <p className="text-xs text-muted-foreground">{[record.competition_name, labelize(record.entry_type), record.award].filter(Boolean).join(" · ")}</p>
      </div>
    ),
  },
  { key: "innovation", label: "Innovation", className: "hidden min-w-[220px] lg:table-cell", render: (record) => <PublicationRelationCell id={record.innovation_id} adapterKey="researchInnovation" emptyLabel="No innovation" /> },
  { key: "event", label: "Event Date", className: "hidden w-[130px] xl:table-cell", render: (record) => <span>{formatPublicationDate(record.event_date) || "No date"}</span> },
  { key: "entry_status", label: "Entry Status", className: "w-[140px]", render: (record) => <span>{labelize(record.entry_status)}</span> },
  { key: "status", label: "Status", className: "w-[120px]", render: (record) => <StatusBadge value={record.status} /> },
];

const transferColumns: EditableRecordColumn<ResearchGenericRecord>[] = [
  {
    key: "case",
    label: "Transfer Case",
    className: "min-w-[280px]",
    render: (record) => (
      <div className="space-y-1">
        <p className="font-medium">{record.title}</p>
        <p className="text-xs text-muted-foreground">{[record.code, labelize(record.case_type), record.ip_reference].filter(Boolean).join(" · ")}</p>
      </div>
    ),
  },
  { key: "innovation", label: "Innovation", className: "hidden min-w-[220px] lg:table-cell", render: (record) => <PublicationRelationCell id={record.innovation_id} adapterKey="researchInnovation" emptyLabel="No innovation" /> },
  { key: "partner", label: "Partner", className: "hidden min-w-[180px] xl:table-cell", render: (record) => <PublicationRelationCell id={record.partner_id} adapterKey="researchPartner" emptyLabel="No partner" /> },
  { key: "transfer_status", label: "Transfer Status", className: "w-[150px]", render: (record) => <span>{labelize(record.transfer_status)}</span> },
  { key: "status", label: "Status", className: "w-[120px]", render: (record) => <StatusBadge value={record.status} /> },
];

const outputColumns: EditableRecordColumn<ResearchGenericRecord>[] = [
  {
    key: "title",
    label: "Output",
    className: "min-w-[260px]",
    render: (record) => (
      <div className="space-y-1">
        <p className="font-medium">{record.title}</p>
        <p className="text-xs text-muted-foreground">{[record.doi ? `DOI ${record.doi}` : null, labelize(record.output_type)].filter(Boolean).join(" · ")}</p>
      </div>
    ),
  },
  { key: "project", label: "Linked Project", className: "hidden min-w-[220px] lg:table-cell", render: (record) => <PublicationRelationCell id={record.project_id} adapterKey="researchProject" emptyLabel="No linked project" /> },
  { key: "released", label: "Released", className: "hidden w-[130px] xl:table-cell", render: (record) => <span>{formatPublicationDate(record.release_date) || "No date"}</span> },
  { key: "access", label: "Access", className: "w-[130px]", render: (record) => <span>{labelize(record.access_type)}</span> },
  { key: "status", label: "Status", className: "w-[130px]", render: (record) => <StatusBadge value={record.status} /> },
];

export function InnovationOutputSummary() {
  const metrics = [
    { title: "Innovations", icon: <Lightbulb className="h-4 w-4" />, queryKey: ["research", "innovation-output", "innovations"], queryFn: () => researchServiceApi.innovations.list({ page: 1, per_page: 1, fields: "id" }) },
    { title: "Startups", icon: <Rocket className="h-4 w-4" />, queryKey: ["research", "innovation-output", "startups"], queryFn: () => researchServiceApi.startups.list({ page: 1, per_page: 1, fields: "id" }) },
    { title: "Incubation", icon: <Waypoints className="h-4 w-4" />, queryKey: ["research", "innovation-output", "incubation"], queryFn: () => researchServiceApi.incubationRecords.list({ page: 1, per_page: 1, fields: "id" }) },
    { title: "Hackathons", icon: <Trophy className="h-4 w-4" />, queryKey: ["research", "innovation-output", "competitions"], queryFn: () => researchServiceApi.competitionEntries.list({ page: 1, per_page: 1, fields: "id" }) },
    { title: "Transfers", icon: <BadgeCheck className="h-4 w-4" />, queryKey: ["research", "innovation-output", "transfers"], queryFn: () => researchServiceApi.technologyTransferCases.list({ page: 1, per_page: 1, fields: "id" }) },
    { title: "Outputs", icon: <FileText className="h-4 w-4" />, queryKey: ["research", "innovation-output", "outputs"], queryFn: () => researchServiceApi.outputs.list({ page: 1, per_page: 1, fields: "id" }) },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {metrics.map((metric) => <MetricChip key={metric.title} {...metric} />)}
    </div>
  );
}

function MetricChip({
  title,
  icon,
  queryKey,
  queryFn,
}: {
  title: string;
  icon: ReactNode;
  queryKey: readonly unknown[];
  queryFn: () => Promise<{ meta?: { total?: number }; data?: unknown[] }>;
}) {
  const query = useQuery({ queryKey, queryFn });
  const value = query.data?.meta?.total ?? query.data?.data?.length ?? 0;
  return (
    <div className="inline-flex min-h-10 items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm shadow-sm">
      <span className="flex size-7 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">{icon}</span>
      <span className="text-muted-foreground">{title}</span>
      <span className="font-semibold">{query.isLoading ? "--" : value.toLocaleString()}</span>
    </div>
  );
}

type WorkflowResource = {
  approve: (id: string) => Promise<unknown>;
  archive: (id: string) => Promise<unknown>;
  feature: (id: string) => Promise<unknown>;
  publish: (id: string) => Promise<unknown>;
  unfeature: (id: string) => Promise<unknown>;
  unpublish: (id: string) => Promise<unknown>;
};

function commonWorkflowActions(resource: WorkflowResource) {
  return (record: ResearchGenericRecord) => {
    const isPublished = record.is_public === true || record.status === "published";
    const isFeatured = record.is_featured === true;
    return [
      { label: "Approve", variant: "outline" as const, payload: {}, run: () => resource.approve(record.id), successMessage: "Record approved" },
      isPublished
        ? { label: "Unpublish", variant: "outline" as const, payload: {}, run: () => resource.unpublish(record.id), successMessage: "Record unpublished" }
        : { label: "Publish", variant: "default" as const, payload: {}, run: () => resource.publish(record.id), successMessage: "Record published" },
      isFeatured
        ? { label: "Unfeature", variant: "outline" as const, payload: {}, run: () => resource.unfeature(record.id), successMessage: "Record unfeatured" }
        : { label: "Feature", variant: "outline" as const, payload: {}, run: () => resource.feature(record.id), successMessage: "Record featured" },
      { label: "Archive", variant: "outline" as const, className: "text-destructive", payload: {}, run: () => resource.archive(record.id), successMessage: "Record archived" },
    ];
  };
}

export function InnovationsResource({ summarySlot }: { summarySlot?: ReactNode }) {
  return (
    <ResearchResourcePage
      title="Innovations"
      description="Manage inventions, disclosures, prototypes, IP status, and commercialization readiness."
      queryKey={["research", "innovations"]}
      resource={researchServiceApi.innovations}
      manageScopes={["innovation.review_disclosure", "innovation.manage_ecosystem", "research:write"]}
      summarySlot={summarySlot}
      listFilters={innovationFilters}
      recordColumns={innovationColumns}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "innovation_type", label: "Innovation Type", type: "select", options: innovationFilters[1].options },
        { name: "category", label: "Category" },
        { name: "project_id", label: "Source Project", type: "entity", relation: { adapter: "researchProject", filters: { is_active: true }, allowClear: true } },
        { name: "center_id", label: "Research Center", type: "entity", relation: { adapter: "researchCenter", filters: { is_active: true }, allowClear: true } },
        { name: "lead_inventor_id", label: "Lead Inventor", type: "entity", relation: { adapter: "person", filters: { status: "active" }, allowClear: true } },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "problem_addressed", label: "Problem Addressed", type: "textarea" },
        { name: "solution", label: "Solution", type: "textarea" },
        { name: "benefits", label: "Benefits", type: "textarea" },
        { name: "applications", label: "Applications", type: "textarea" },
        { name: "target_users", label: "Target Users", type: "textarea" },
        { name: "ip_status", label: "IP Status" },
        { name: "commercialization_status", label: "Commercialization Status" },
        { name: "development_stage", label: "Development Stage" },
        { name: "trl_level", label: "TRL Level", type: "number" },
        { name: "invention_date", label: "Invention Date", type: "date" },
        { name: "cover_image_url", label: "Cover Image URL", type: "url" },
        ...visibilityFields,
      ]}
      defaults={{ innovation_type: "product", currency: "KES", development_stage: "research", status: "active", is_public: true }}
      emptyMessage="No innovations were returned by the research service."
      metaFields={["innovation_type", "development_stage", "ip_status", "status"]}
      importResource="research-innovations"
      detailHref={(record) => `/research/innovations/${record.id}`}
      editorMode="sheet"
    />
  );
}

export function StartupsResource({ summarySlot }: { summarySlot?: ReactNode }) {
  return (
    <ResearchResourcePage
      title="Startups"
      description="Manage startup ventures and spinouts built around research innovations."
      queryKey={["research", "startups"]}
      resource={researchServiceApi.startups}
      manageScopes={["innovation.manage_startups", "research:write"]}
      summarySlot={summarySlot}
      listFilters={[
        { name: "search", label: "Search", type: "text", placeholder: "Search startups" },
        { name: "innovation_id", label: "Innovation", type: "entity", relation: { adapter: "researchInnovation", filters: { is_active: true } } },
        { name: "venture_stage", label: "Venture Stage", type: "text", placeholder: "idea, validation, growth" },
        { name: "status", label: "Status", type: "select", options: statusOptions },
      ]}
      recordColumns={startupColumns}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "innovation_id", label: "Innovation", type: "entity", required: true, relation: { adapter: "researchInnovation", filters: { is_active: true }, allowClear: false } },
        { name: "partner_id", label: "Partner", type: "entity", relation: { adapter: "researchPartner", filters: { is_active: true }, allowClear: true } },
        { name: "center_id", label: "Research Center", type: "entity", relation: { adapter: "researchCenter", filters: { is_active: true }, allowClear: true } },
        { name: "lead_founder_id", label: "Lead Founder", type: "entity", relation: { adapter: "person", filters: { status: "active" }, allowClear: true } },
        { name: "venture_stage", label: "Venture Stage" },
        { name: "registration_status", label: "Registration Status" },
        { name: "registration_number", label: "Registration Number" },
        { name: "incorporation_date", label: "Incorporation Date", type: "date" },
        { name: "sector", label: "Sector" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "problem", label: "Problem", type: "textarea" },
        { name: "solution", label: "Solution", type: "textarea" },
        { name: "business_model", label: "Business Model", type: "textarea" },
        { name: "market", label: "Market", type: "textarea" },
        { name: "traction", label: "Traction", type: "textarea" },
        { name: "funding_raised", label: "Funding Raised", type: "number" },
        { name: "website", label: "Website", type: "url" },
        { name: "pitch_deck_url", label: "Pitch Deck URL", type: "url" },
        { name: "cover_image_url", label: "Cover Image URL", type: "url" },
        ...visibilityFields,
      ]}
      defaults={{ venture_stage: "idea", registration_status: "not_registered", currency: "KES", status: "active", is_public: true }}
      emptyMessage="No startups were returned by the research service."
      metaFields={["venture_stage", "registration_status", "sector", "status"]}
      detailHref={(record) => `/research/innovations/startups/${record.id}`}
      getRecordWorkflowActions={commonWorkflowActions(researchServiceApi.startups)}
      editorMode="sheet"
    />
  );
}

export function IncubationRecordsResource({ summarySlot }: { summarySlot?: ReactNode }) {
  return (
    <ResearchResourcePage
      title="Incubation"
      description="Track incubation, acceleration, mentorship, and commercialization support."
      queryKey={["research", "incubation-records"]}
      resource={researchServiceApi.incubationRecords}
      manageScopes={["innovation.manage_startups", "research:write"]}
      summarySlot={summarySlot}
      recordColumns={incubationColumns}
      listFilters={[
        { name: "search", label: "Search", type: "text", placeholder: "Search incubation records" },
        { name: "innovation_id", label: "Innovation", type: "entity", relation: { adapter: "researchInnovation", filters: { is_active: true } } },
        { name: "startup_id", label: "Startup", type: "entity", relation: { adapter: "researchStartup", filters: { is_active: true } } },
        { name: "stage", label: "Stage", type: "text", placeholder: "active, completed" },
      ]}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "innovation_id", label: "Innovation", type: "entity", required: true, relation: { adapter: "researchInnovation", filters: { is_active: true }, allowClear: false } },
        { name: "startup_id", label: "Startup", type: "entity", relation: { adapter: "researchStartup", filters: { is_active: true }, allowClear: true } },
        { name: "partner_id", label: "Partner", type: "entity", relation: { adapter: "researchPartner", filters: { is_active: true }, allowClear: true } },
        { name: "center_id", label: "Research Center", type: "entity", relation: { adapter: "researchCenter", filters: { is_active: true }, allowClear: true } },
        { name: "program_name", label: "Program Name" },
        { name: "cohort", label: "Cohort" },
        { name: "incubation_type", label: "Incubation Type" },
        { name: "start_date", label: "Start Date", type: "date" },
        { name: "end_date", label: "End Date", type: "date" },
        { name: "stage", label: "Stage" },
        { name: "support_received", label: "Support Received", type: "textarea" },
        { name: "outcomes", label: "Outcomes", type: "textarea" },
        { name: "next_steps", label: "Next Steps", type: "textarea" },
        ...visibilityFields,
      ]}
      defaults={{ incubation_type: "incubation", stage: "active", status: "active", is_public: true }}
      emptyMessage="No incubation records were returned by the research service."
      metaFields={["program_name", "cohort", "stage", "status"]}
      detailHref={(record) => `/research/innovations/incubation/${record.id}`}
      getRecordWorkflowActions={commonWorkflowActions(researchServiceApi.incubationRecords)}
      editorMode="sheet"
    />
  );
}

export function CompetitionEntriesResource({ summarySlot }: { summarySlot?: ReactNode }) {
  return (
    <ResearchResourcePage
      title="Hackathons & Competitions"
      description="Manage hackathons, competitions, showcases, demo days, and pitch entries."
      queryKey={["research", "competition-entries"]}
      resource={researchServiceApi.competitionEntries}
      manageScopes={["innovation.manage_competitions", "research:write"]}
      summarySlot={summarySlot}
      recordColumns={competitionColumns}
      listFilters={[
        { name: "search", label: "Search", type: "text", placeholder: "Search events or entries" },
        { name: "innovation_id", label: "Innovation", type: "entity", relation: { adapter: "researchInnovation", filters: { is_active: true } } },
        { name: "entry_type", label: "Entry Type", type: "select", options: [
          { label: "Hackathon", value: "hackathon" },
          { label: "Competition", value: "competition" },
          { label: "Challenge", value: "challenge" },
          { label: "Showcase", value: "showcase" },
          { label: "Demo Day", value: "demo_day" },
        ] },
        { name: "entry_status", label: "Entry Status", type: "text", placeholder: "submitted, finalist, winner" },
      ]}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "innovation_id", label: "Innovation", type: "entity", required: true, relation: { adapter: "researchInnovation", filters: { is_active: true }, allowClear: false } },
        { name: "startup_id", label: "Startup", type: "entity", relation: { adapter: "researchStartup", filters: { is_active: true }, allowClear: true } },
        { name: "partner_id", label: "Partner", type: "entity", relation: { adapter: "researchPartner", filters: { is_active: true }, allowClear: true } },
        { name: "center_id", label: "Research Center", type: "entity", relation: { adapter: "researchCenter", filters: { is_active: true }, allowClear: true } },
        { name: "entry_type", label: "Entry Type", type: "select", options: [
          { label: "Hackathon", value: "hackathon" },
          { label: "Competition", value: "competition" },
          { label: "Challenge", value: "challenge" },
          { label: "Showcase", value: "showcase" },
          { label: "Demo Day", value: "demo_day" },
        ] },
        { name: "competition_name", label: "Competition Name" },
        { name: "organizer_name", label: "Organizer" },
        { name: "venue", label: "Venue" },
        { name: "country", label: "Country" },
        { name: "event_date", label: "Event Date", type: "date" },
        { name: "application_deadline", label: "Application Deadline", type: "date" },
        { name: "entry_status", label: "Entry Status" },
        { name: "award", label: "Award" },
        { name: "position", label: "Position" },
        { name: "prize_value", label: "Prize Value", type: "number" },
        { name: "pitch_summary", label: "Pitch Summary", type: "textarea" },
        { name: "judges_feedback", label: "Judges Feedback", type: "textarea" },
        { name: "public_url", label: "Public URL", type: "url" },
        { name: "pitch_deck_url", label: "Pitch Deck URL", type: "url" },
        ...visibilityFields,
      ]}
      defaults={{ entry_type: "hackathon", entry_status: "submitted", currency: "KES", status: "active", is_public: true }}
      emptyMessage="No hackathon or competition entries were returned by the research service."
      metaFields={["entry_type", "competition_name", "entry_status", "status"]}
      detailHref={(record) => `/research/innovations/competitions/${record.id}`}
      getRecordWorkflowActions={commonWorkflowActions(researchServiceApi.competitionEntries)}
      editorMode="sheet"
    />
  );
}

export function TechnologyTransferCasesResource({ summarySlot }: { summarySlot?: ReactNode }) {
  return (
    <ResearchResourcePage
      title="Technology Transfer"
      description="Manage disclosures, protection, licensing, adoption, and commercialization cases."
      queryKey={["research", "technology-transfer-cases"]}
      resource={researchServiceApi.technologyTransferCases}
      manageScopes={["innovation.manage_transfers", "research:write"]}
      summarySlot={summarySlot}
      recordColumns={transferColumns}
      listFilters={[
        { name: "search", label: "Search", type: "text", placeholder: "Search transfer cases" },
        { name: "innovation_id", label: "Innovation", type: "entity", relation: { adapter: "researchInnovation", filters: { is_active: true } } },
        { name: "case_type", label: "Case Type", type: "text", placeholder: "disclosure, license, adoption" },
        { name: "transfer_status", label: "Transfer Status", type: "text", placeholder: "disclosed, licensed" },
      ]}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "innovation_id", label: "Innovation", type: "entity", required: true, relation: { adapter: "researchInnovation", filters: { is_active: true }, allowClear: false } },
        { name: "partner_id", label: "Partner", type: "entity", relation: { adapter: "researchPartner", filters: { is_active: true }, allowClear: true } },
        { name: "center_id", label: "Research Center", type: "entity", relation: { adapter: "researchCenter", filters: { is_active: true }, allowClear: true } },
        { name: "lead_officer_id", label: "Lead Officer", type: "entity", relation: { adapter: "person", filters: { status: "active" }, allowClear: true } },
        { name: "case_type", label: "Case Type" },
        { name: "transfer_status", label: "Transfer Status" },
        { name: "disclosure_date", label: "Disclosure Date", type: "date" },
        { name: "protection_date", label: "Protection Date", type: "date" },
        { name: "agreement_date", label: "Agreement Date", type: "date" },
        { name: "expiry_date", label: "Expiry Date", type: "date" },
        { name: "ip_reference", label: "IP Reference" },
        { name: "agreement_reference", label: "Agreement Reference" },
        { name: "license_type", label: "License Type" },
        { name: "territory", label: "Territory" },
        { name: "exclusivity", label: "Exclusivity" },
        { name: "commercial_terms", label: "Commercial Terms", type: "textarea" },
        { name: "revenue_terms", label: "Revenue Terms", type: "textarea" },
        { name: "upfront_value", label: "Upfront Value", type: "number" },
        { name: "annual_value", label: "Annual Value", type: "number" },
        { name: "revenue_generated", label: "Revenue Generated", type: "number" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "public_benefit", label: "Public Benefit", type: "textarea" },
        { name: "next_steps", label: "Next Steps", type: "textarea" },
        ...visibilityFields,
      ]}
      defaults={{ case_type: "disclosure", transfer_status: "disclosed", currency: "KES", status: "active", is_public: true }}
      emptyMessage="No technology transfer cases were returned by the research service."
      metaFields={["case_type", "transfer_status", "agreement_date", "status"]}
      detailHref={(record) => `/research/innovations/transfers/${record.id}`}
      getRecordWorkflowActions={commonWorkflowActions(researchServiceApi.technologyTransferCases)}
      editorMode="sheet"
    />
  );
}

export function OutputsResource({ summarySlot }: { summarySlot?: ReactNode }) {
  return (
    <ResearchResourcePage
      title="Research Outputs"
      description="Manage datasets, software, tools, reports, briefs, methodologies, models, and published deliverables."
      queryKey={["research", "outputs"]}
      resource={researchServiceApi.outputs}
      manageScopes={["research.manage_reports", "research.submit_reports", "research:write"]}
      summarySlot={summarySlot}
      recordColumns={outputColumns}
      listFilters={[
        { name: "search", label: "Search", type: "text", placeholder: "Search title, DOI, summary, or type" },
        { name: "output_type", label: "Output Type", type: "select", options: [
          { label: "Dataset", value: "dataset" },
          { label: "Software", value: "software" },
          { label: "Tool", value: "tool" },
          { label: "Report", value: "report" },
          { label: "Brief", value: "brief" },
          { label: "Model", value: "model" },
        ] },
        { name: "project_id", label: "Linked Project", type: "entity", relation: { adapter: "researchProject", filters: { is_active: true } } },
        { name: "center_id", label: "Research Center", type: "entity", relation: { adapter: "researchCenter", filters: { is_active: true } } },
        { name: "status", label: "Status", type: "select", options: statusOptions },
      ]}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "output_type", label: "Output Type" },
        { name: "project_id", label: "Linked Project", type: "entity", relation: { adapter: "researchProject", filters: { is_active: true }, allowClear: true } },
        { name: "center_id", label: "Research Center", type: "entity", relation: { adapter: "researchCenter", filters: { is_active: true }, allowClear: true } },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "methodology", label: "Methodology", type: "textarea" },
        { name: "usage_notes", label: "Usage Notes", type: "textarea" },
        { name: "citation", label: "Citation", type: "textarea" },
        { name: "access_type", label: "Access Type" },
        { name: "access_url", label: "Access URL", type: "url" },
        { name: "download_url", label: "Download URL", type: "url" },
        { name: "repository_url", label: "Repository URL", type: "url" },
        { name: "doi", label: "DOI" },
        { name: "version", label: "Version" },
        { name: "license", label: "License" },
        { name: "release_date", label: "Release Date", type: "date" },
        { name: "last_updated", label: "Last Updated", type: "date" },
        { name: "cover_image_url", label: "Cover Image URL", type: "url" },
        { name: "status", label: "Status", type: "select", options: statusOptions },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ output_type: "dataset", access_type: "open", status: "published", is_active: true }}
      emptyMessage="No research outputs were returned by the research service."
      metaFields={["output_type", "access_type", "release_date", "status"]}
      importResource="research-outputs"
      detailHref={(record) => `/research/outputs/${record.id}`}
      editorMode="sheet"
    />
  );
}
