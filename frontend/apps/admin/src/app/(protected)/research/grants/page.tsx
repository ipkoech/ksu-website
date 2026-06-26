"use client";

import Link from "next/link";
import { Upload } from "lucide-react";
import { Button } from "@ksu/ui/components";
import { EditableServiceResourcePage, type EditableListFilter } from "@/components/dashboard/editable-service-resource-page";
import { researchServiceApi, type ResearchGrant, type ResearchGrantPayload } from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";

const grantListFilters: EditableListFilter[] = [
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

export default function ResearchGrantsPage() {
  const { hasScope } = usePermissions();
  const canManage = hasScope("research.manage_projects") || hasScope("funding.manage") || hasScope("research:write") || hasScope("funding:write");

  return (
    <EditableServiceResourcePage<ResearchGrant, ResearchGrantPayload>
      title="Grants"
      description="Create, edit, and close grant records from the research service."
      backHref="/research"
      queryKey={["research", "grants"]}
      listFilters={grantListFilters}
      fields={[
        { name: "title", label: "Title", required: true, placeholder: "Grant title" },
        { name: "slug", label: "Slug", placeholder: "grant-slug" },
        { name: "code", label: "Code" },
        { name: "grant_type", label: "Grant Type", placeholder: "internal" },
        { name: "category", label: "Category", placeholder: "research" },
        { name: "funder_name", label: "Funder" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "deadline", label: "Deadline", type: "datetime-local" },
        { name: "status", label: "Status", placeholder: "draft" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      list={(filters) => researchServiceApi.grants.list({ page: 1, per_page: 50, ...filters })}
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
        deadline: values.deadline,
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
