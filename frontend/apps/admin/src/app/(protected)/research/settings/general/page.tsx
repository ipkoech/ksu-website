"use client";

import type { EditableListFilter, EditableRecordColumn } from "@/components/dashboard/editable-service-resource-page";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";
import { labelize, StatusBadge } from "../../publications/_components/publication-workspace";
import { ResearchSettingsWorkspaceHeader } from "../_components/settings-workspace";

const settingFilters: EditableListFilter[] = [
  { name: "search", label: "Search", type: "text", placeholder: "Search keys or descriptions" },
  { name: "setting_type", label: "Setting Type", type: "text", placeholder: "general, donation, visibility" },
  { name: "is_active", label: "Active", type: "boolean" },
];

const settingColumns: EditableRecordColumn<ResearchGenericRecord>[] = [
  {
    key: "setting",
    label: "Setting",
    className: "min-w-[260px]",
    render: (record) => (
      <div className="space-y-1">
        <p className="font-medium">{record.key}</p>
        <p className="line-clamp-1 text-xs text-muted-foreground">{record.description || "No description"}</p>
      </div>
    ),
  },
  {
    key: "type",
    label: "Type",
    className: "w-[150px]",
    render: (record) => <span>{labelize(record.setting_type)}</span>,
  },
  {
    key: "value",
    label: "Value",
    className: "hidden min-w-[240px] lg:table-cell",
    render: (record) => <span className="line-clamp-1 text-sm text-muted-foreground">{record.value || "No value"}</span>,
  },
  {
    key: "status",
    label: "Status",
    className: "w-[120px]",
    render: (record) => <StatusBadge value={record.is_active ? "active" : "inactive"} />,
  },
];

export default function ResearchGeneralSettingsPage() {
  return (
    <ResearchResourcePage
      title="Research Settings"
      description="Manage research donation and public-facing configuration values."
      queryKey={["research", "donation-settings"]}
      resource={researchServiceApi.donationSettings}
      manageScopes={["donations.settings", "donations.manage", "research:write"]}
      summarySlot={<ResearchSettingsWorkspaceHeader />}
      fields={[
        { name: "key", label: "Key", required: true },
        { name: "value", label: "Value", type: "textarea" },
        { name: "setting_type", label: "Setting Type", placeholder: "general" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "is_active", label: "Active", type: "boolean" },
      ]}
      defaults={{ setting_type: "general" }}
      listFilters={settingFilters}
      recordColumns={settingColumns}
      emptyMessage="No research settings were returned by the research service."
      metaFields={["setting_type", "is_active"]}
      detailHref={(record) => `/research/settings/general/${record.id}`}
      editorMode="sheet"
    />
  );
}
