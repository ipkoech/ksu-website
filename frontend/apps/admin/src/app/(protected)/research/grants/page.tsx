"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  EditableServiceResourcePage,
  type EditableListFilter,
  type EditableRecordColumn,
} from "@/components/dashboard/editable-service-resource-page";
import {
  ResearchBulkActions,
  withResearchFieldHelp,
} from "../_components/research-resource-page";
import {
  getResearchGuidance,
  ResearchSectionGuide,
} from "../_components/research-guidance";
import { researchServiceApi, type ResearchGrant, type ResearchGrantPayload } from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";
import {
  formatFundingDate,
  FundingWorkspaceHeader,
  labelize,
  MoneyValue,
  StatusBadge,
} from "../fundings/_components/funding-workspace";

const grantListFilters: EditableListFilter[] = [
  { name: "search", label: "Search", type: "text", placeholder: "Search grants" },
  {
    name: "grant_type",
    label: "Grant Type",
    type: "select",
    options: [
      { label: "Internal", value: "internal" },
      { label: "External", value: "external" },
      { label: "Seed", value: "seed" },
      { label: "Collaborative", value: "collaborative" },
    ],
  },
  {
    name: "category",
    label: "Category",
    type: "select",
    options: [
      { label: "Research", value: "research" },
      { label: "Innovation", value: "innovation" },
      { label: "Capacity", value: "capacity" },
      { label: "Infrastructure", value: "infrastructure" },
    ],
  },
  { name: "funder_id", label: "Funder", type: "entity", relation: { adapter: "researchFunder", filters: { is_active: true } } },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Draft", value: "draft" },
      { label: "Open", value: "open" },
      { label: "Closed", value: "closed" },
      { label: "Awarded", value: "awarded" },
      { label: "Archived", value: "archived" },
    ],
  },
  { name: "is_active", label: "Active", type: "boolean" },
  { name: "is_featured", label: "Featured", type: "boolean" },
];

const grantColumns: EditableRecordColumn<ResearchGrant>[] = [
  {
    key: "title",
    label: "Grant Title",
    className: "min-w-[260px]",
    render: (record) => (
      <div className="space-y-1">
        <Link href={record.slug ? `/research/grants/${record.slug}` : "#"} className="font-medium hover:underline">
          {record.title}
        </Link>
        <p className="text-xs text-muted-foreground">{[record.code, labelize(record.grant_type)].filter(Boolean).join(" · ")}</p>
      </div>
    ),
  },
  {
    key: "funder",
    label: "Funder",
    render: (record) => <span className="text-sm">{record.funder_name || "No funder named"}</span>,
  },
  {
    key: "status",
    label: "Status",
    render: (record) => <StatusBadge value={record.status} />,
  },
  {
    key: "amount",
    label: "Amount",
    render: (record) => <MoneyValue amount={(record as any).total_budget ?? (record as any).max_award} currency={(record as any).currency} />,
  },
  {
    key: "deadline",
    label: "Deadline",
    render: (record) => <span className="text-sm text-muted-foreground">{formatFundingDate(record.deadline) || "No deadline"}</span>,
  },
  {
    key: "project",
    label: "Linked Project",
    render: () => <span className="text-sm text-muted-foreground">Linked through applications/reports</span>,
  },
  {
    key: "review",
    label: "Review State",
    render: (record) => <span className="text-sm text-muted-foreground">{record.status === "reviewing" ? "Under review" : "By application"}</span>,
  },
];

function GrantMobileRecord(record: ResearchGrant, actions: ReactNode) {
  return (
    <div className="rounded-lg border bg-background p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{record.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {[record.code, record.funder_name || "No funder", labelize(record.grant_type)].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="shrink-0">{actions}</div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="rounded-md border px-2 py-1">{labelize(record.status) || "Unspecified"}</span>
        {record.deadline ? <span className="rounded-md border px-2 py-1">Due {formatFundingDate(record.deadline)}</span> : null}
      </div>
    </div>
  );
}

export default function ResearchGrantsPage() {
  const { hasScope } = usePermissions();
  const canManage = hasScope("research.manage_projects") || hasScope("funding.manage") || hasScope("research:write") || hasScope("funding:write");
  const guidance = getResearchGuidance("Grants");

  return (
    <EditableServiceResourcePage<ResearchGrant, ResearchGrantPayload>
      title="Grants"
      description="Create, edit, and close grant records from the research service."
      backHref="/research"
      queryKey={["research", "grants"]}
      summarySlot={
        <div className="space-y-4">
          <ResearchSectionGuide title="Grants" />
          <FundingWorkspaceHeader />
        </div>
      }
      listFilters={grantListFilters}
      recordColumns={grantColumns}
      editorMode="sheet"
      renderMobileRecord={GrantMobileRecord}
      fields={withResearchFieldHelp([
        { name: "title", label: "Title", required: true, placeholder: "Grant title" },
        { name: "slug", label: "Slug", placeholder: "grant-slug" },
        { name: "code", label: "Code" },
        { name: "grant_type", label: "Grant Type", type: "select", options: [
          { label: "Internal", value: "internal" },
          { label: "External", value: "external" },
          { label: "Seed", value: "seed" },
          { label: "Collaborative", value: "collaborative" },
        ] },
        { name: "category", label: "Category", type: "select", options: [
          { label: "Research", value: "research" },
          { label: "Innovation", value: "innovation" },
          { label: "Capacity", value: "capacity" },
          { label: "Infrastructure", value: "infrastructure" },
        ] },
        { name: "funder_id", label: "Funder", type: "entity", relation: { adapter: "researchFunder", filters: { is_active: true } } },
        { name: "funder_name", label: "Funder Name", placeholder: "Fallback display name" },
        { name: "summary", label: "Summary", type: "richtext" },
        { name: "description", label: "Description", type: "richtext" },
        { name: "eligibility", label: "Eligibility", type: "richtext" },
        { name: "requirements", label: "Requirements", type: "richtext" },
        {
          name: "cover_image_id",
          label: "Cover Image",
          type: "media",
          media: { mediaType: "image", accept: "image/*", uploadEntityType: "research_grant", uploadRole: "grant-cover" },
        },
        {
          name: "logo_id",
          label: "Funder Logo",
          type: "media",
          media: { mediaType: "image", accept: "image/*", uploadEntityType: "research_grant", uploadRole: "grant-logo" },
        },
        {
          name: "attachment_media_ids",
          label: "File Attachments",
          type: "entity-multi",
          relation: { adapter: "media", description: "Attach call documents, award letters, budget files, and supporting media." },
          placeholder: "Add attachment",
        },
        {
          name: "document_media_ids",
          label: "Supporting Documents",
          type: "entity-multi",
          relation: { adapter: "media", description: "Select existing media documents linked to this grant." },
          placeholder: "Add document",
        },
        { name: "total_budget", label: "Total Budget", type: "number" },
        { name: "min_award", label: "Minimum Award", type: "number" },
        { name: "max_award", label: "Maximum Award", type: "number" },
        { name: "currency", label: "Currency", placeholder: "KES" },
        { name: "open_date", label: "Open Date", type: "date" },
        { name: "deadline", label: "Deadline", type: "datetime-local" },
        { name: "external_url", label: "External URL", type: "url" },
        { name: "application_url", label: "Application URL", type: "url" },
        { name: "status", label: "Status", type: "select", options: [
          { label: "Draft", value: "draft" },
          { label: "Open", value: "open" },
          { label: "Closed", value: "closed" },
          { label: "Reviewing", value: "reviewing" },
          { label: "Awarded", value: "awarded" },
          { label: "Archived", value: "archived" },
        ] },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ])}
      list={(filters) => researchServiceApi.grants.list({ page: 1, per_page: 25, ...filters })}
      create={(payload) => researchServiceApi.grants.create(payload)}
      update={(id, payload) => researchServiceApi.grants.update(id, payload)}
      delete={(id) => researchServiceApi.grants.delete(id)}
      canCreate={canManage}
      canEdit={canManage}
      canDelete={canManage}
      getRecordTitle={(record) => record.title}
      getRecordMeta={(record) => [record.code, record.funder_name, record.status].filter(Boolean).join(" · ")}
      getRecordDetailHref={(record) => record.slug ? `/research/grants/${record.slug}` : null}
      emptyMessage="No grants were returned by the research service."
      emptyState={guidance?.emptyState}
      buildPayload={(values) => ({
        title: values.title,
        slug: values.slug,
        code: values.code,
        grant_type: values.grant_type || "internal",
        category: values.category || "research",
        funder_id: values.funder_id || null,
        funder_name: values.funder_name,
        summary: values.summary,
        description: values.description,
        eligibility: values.eligibility,
        requirements: values.requirements,
        cover_image_id: values.cover_image_id,
        logo_id: values.logo_id,
        attachment_media_ids: values.attachment_media_ids,
        document_media_ids: values.document_media_ids,
        total_budget: values.total_budget,
        min_award: values.min_award,
        max_award: values.max_award,
        currency: values.currency || "KES",
        open_date: values.open_date,
        deadline: values.deadline,
        external_url: values.external_url,
        application_url: values.application_url,
        status: values.status || "draft",
        is_active: values.is_active,
        is_featured: values.is_featured,
      })}
      toolbarSlot={<ResearchBulkActions resourceKey="research-grants" />}
      resourceKey="research-grants"
    />
  );
}
