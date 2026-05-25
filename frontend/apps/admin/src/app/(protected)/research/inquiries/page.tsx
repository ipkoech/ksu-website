"use client";

import { EditableServiceResourcePage } from "@/components/dashboard/editable-service-resource-page";
import { researchServiceApi, type ResearchGenericPayload, type ResearchGenericRecord } from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";

export default function ResearchInquiriesPage() {
  const { hasScope } = usePermissions();
  const canManage = hasScope("research.manage_inquiries") || hasScope("research:write");

  return (
    <EditableServiceResourcePage<ResearchGenericRecord, ResearchGenericPayload>
      title="Research Consultancies"
      description="Manage consultancy inquiries, clients, and engagement records."
      backHref="/research"
      queryKey={["research", "consultancies"]}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "consultancy_type", label: "Consultancy Type", placeholder: "research" },
        { name: "client_name", label: "Client Name" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "status", label: "Status", placeholder: "ongoing" },
        { name: "contract_value", label: "Contract Value", type: "number" },
        { name: "is_public", label: "Public", type: "boolean" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      list={() => researchServiceApi.consultancies.list({ page: 1, per_page: 50 })}
      create={(payload) => researchServiceApi.consultancies.create(payload)}
      update={(id, payload) => researchServiceApi.consultancies.update(id, payload)}
      delete={(id) => researchServiceApi.consultancies.delete(id)}
      canCreate={canManage}
      canEdit={canManage}
      canDelete={canManage}
      getRecordTitle={(record) => record.title ?? "Untitled consultancy"}
      getRecordMeta={(record) => [record.code, record.client_name, record.status].filter(Boolean).join(" · ")}
      emptyMessage="No consultancy records were returned by the research service."
      buildPayload={(values) => ({
        title: values.title,
        slug: values.slug,
        code: values.code,
        consultancy_type: values.consultancy_type || "research",
        client_name: values.client_name,
        summary: values.summary,
        status: values.status || "ongoing",
        contract_value: values.contract_value,
        currency: "KES",
        is_public: values.is_public,
        is_active: values.is_active,
        is_featured: values.is_featured,
      })}
    />
  );
}
