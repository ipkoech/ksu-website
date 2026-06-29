"use client";

import Link from "next/link";
import { Upload } from "lucide-react";
import { Button } from "@ksu/ui/components";
import {
  EditableServiceResourcePage,
  type EditableListFilter,
  type EditableRecordColumn,
} from "@/components/dashboard/editable-service-resource-page";
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

export default function ResearchGrantsPage() {
  const { hasScope } = usePermissions();
  const canManage = hasScope("research.manage_projects") || hasScope("funding.manage") || hasScope("research:write") || hasScope("funding:write");

  return (
    <EditableServiceResourcePage<ResearchGrant, ResearchGrantPayload>
      title="Grants"
      description="Create, edit, and close grant records from the research service."
      backHref="/research"
      queryKey={["research", "grants"]}
      summarySlot={<FundingWorkspaceHeader />}
      listFilters={grantListFilters}
      recordColumns={grantColumns}
      fields={[
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
        { name: "funder_name", label: "Funder Name" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "eligibility", label: "Eligibility", type: "textarea" },
        { name: "requirements", label: "Requirements", type: "textarea" },
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
      ]}
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
      buildPayload={(values) => ({
        title: values.title,
        slug: values.slug,
        code: values.code,
        grant_type: values.grant_type || "internal",
        category: values.category || "research",
        funder_name: values.funder_name,
        summary: values.summary,
        description: values.description,
        eligibility: values.eligibility,
        requirements: values.requirements,
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
      toolbarSlot={
        <Button variant="outline" size="sm" asChild>
          <Link href="/imports/research-grants">
            <Upload className="mr-1.5 h-4 w-4" />
            Import
          </Link>
        </Button>
      }
    />
  );
}
