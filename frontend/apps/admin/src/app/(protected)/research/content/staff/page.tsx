"use client";

import type { ReactNode } from "react";
import { staffApi, type StaffAssignment } from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";
import { EditableServiceResourcePage, type EditableListFilter, type EditableRecordColumn, type EditableRecordWorkflowAction } from "@/components/dashboard/editable-service-resource-page";
import { DateValue, StatusBadge, titleOf } from "../../_components/research-workspace";
import { ResearchSettingsWorkspaceHeader } from "../../settings/_components/settings-workspace";
import {
  getResearchGuidance,
  ResearchSectionGuide,
} from "../../_components/research-guidance";
import { withResearchFieldHelp } from "../../_components/research-resource-page";

const staffFilters: EditableListFilter[] = [
  { name: "status", label: "Status", type: "select", options: [
    { label: "Active", value: "active" },
    { label: "Pending", value: "pending" },
    { label: "Ended", value: "ended" },
    { label: "Inactive", value: "inactive" },
  ] },
  { name: "person_id", label: "Person", type: "entity", relation: { adapter: "person", filters: { status: "active" } } },
];

type StaffRecord = StaffAssignment & Record<string, any>;

const staffColumns: Array<EditableRecordColumn<StaffRecord>> = [
  { key: "person", label: "Staff Member", className: "min-w-[240px]", render: (record) => <span className="font-medium">{record.person?.full_name ?? titleOf(record)}</span> },
  { key: "role", label: "Role", className: "hidden min-w-[180px] md:table-cell", render: (record) => <span>{record.role_display ?? record.title ?? record.role}</span> },
  { key: "term", label: "Term", className: "hidden min-w-[180px] lg:table-cell", render: (record) => <span>{record.term_display ?? "Current assignment"}</span> },
  { key: "start", label: "Start", className: "hidden w-[130px] xl:table-cell", render: (record) => <DateValue value={record.start_date} /> },
  { key: "status", label: "Status", className: "w-[120px]", render: (record) => <StatusBadge value={record.status} /> },
];

function staffWorkflowActions(record: StaffRecord): Array<EditableRecordWorkflowAction<StaffRecord, Record<string, any>>> {
  if (record.status === "active") {
    return [
      {
        label: "End",
        payload: { status: "ended", end_date: new Date().toISOString().slice(0, 10) },
        successMessage: "Research staff assignment ended",
        confirmTitle: "End assignment?",
        confirmDescription: "This keeps the assignment record and marks it as ended.",
      },
    ];
  }
  return [
    {
      label: "Activate",
      payload: { status: "active", start_date: record.start_date ?? new Date().toISOString().slice(0, 10) },
      successMessage: "Research staff assignment activated",
    },
  ];
}

function StaffMobileRecord(record: StaffRecord, actions: ReactNode) {
  return (
    <div className="rounded-lg border bg-background p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{record.person?.full_name ?? titleOf(record)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {[record.role_display ?? record.title ?? record.role, record.term_display].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="shrink-0">{actions}</div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="rounded-md border px-2 py-1 capitalize">{record.status ?? "unknown"}</span>
        {record.start_date ? <span className="rounded-md border px-2 py-1">Since {record.start_date.slice(0, 10)}</span> : null}
      </div>
    </div>
  );
}

export default function ResearchStaffPage() {
  const { hasScope } = usePermissions();
  const canManage = ["people.manage", "staff.manage", "content.manage", "research:write"].some((scope) => hasScope(scope));
  const guidance = getResearchGuidance("Research Content");

  return (
    <EditableServiceResourcePage<StaffRecord, Record<string, any>>
      title="Research Administration Staff"
      description="Manage staff assignments attached to the research administrative unit."
      backHref="/research/content"
      queryKey={["research", "content", "staff"]}
      summarySlot={
        <div className="space-y-4">
          <ResearchSettingsWorkspaceHeader />
        </div>
      }
      listFilters={staffFilters}
      recordColumns={staffColumns}
      editorMode="sheet"
      tableLayout="compact"
      actionsInMenuOnly
      defaultSort={{ label: "Recently updated", sort: "updated_at", order: "desc" }}
      sortOptions={[
        { label: "Recently updated", sort: "updated_at", order: "desc" },
        { label: "Display order", sort: "display_order", order: "asc" },
      ]}
      toolbarSlot={<ResearchSectionGuide title="Research Content" className="sm:ml-auto" />}
      renderMobileRecord={StaffMobileRecord}
      fields={withResearchFieldHelp([
        { name: "person_id", label: "Person", type: "entity", required: true, relation: { adapter: "person", filters: { status: "active" } } },
        { name: "role", label: "Role", required: true, type: "select", options: [
          { label: "Director", value: "director" },
          { label: "Coordinator", value: "coordinator" },
          { label: "Research Officer", value: "research_officer" },
          { label: "Administrator", value: "administrator" },
          { label: "Member", value: "member" },
        ] },
        { name: "title", label: "Display Title" },
        { name: "hierarchy_level", label: "Hierarchy Level", type: "number" },
        { name: "reports_to_id", label: "Reports To", type: "entity", relation: { adapter: "staffAssignment", filters: { entity_type: "research", status: "active" }, allowClear: true } },
        { name: "is_primary", label: "Primary Assignment", type: "boolean" },
        { name: "is_acting", label: "Acting", type: "boolean" },
        { name: "is_public", label: "Public", type: "boolean" },
        { name: "start_date", label: "Start Date", type: "date" },
        { name: "end_date", label: "End Date", type: "date" },
        { name: "term_years", label: "Term Years", type: "number" },
        { name: "term_renewable", label: "Term Renewable", type: "boolean" },
        { name: "show_term_dates", label: "Show Term Dates", type: "boolean" },
        { name: "status", label: "Status", type: "select", options: [
          { label: "Active", value: "active" },
          { label: "Pending", value: "pending" },
          { label: "Ended", value: "ended" },
          { label: "Inactive", value: "inactive" },
        ] },
        { name: "display_order", label: "Display Order", type: "number" },
        { name: "notes", label: "Notes", type: "textarea" },
      ])}
      list={(filters) => staffApi.listAssignments({ page: 1, per_page: 50, status: "all", entity_type: "research", ...filters })}
      create={(payload) => staffApi.createAssignment({ hierarchy_level: 100, status: "active", display_order: 100, ...payload, entity_type: "research", entity_id: null } as any)}
      update={(id, payload) => {
        const { person_id: _personId, ...nextPayload } = payload;
        return staffApi.updateAssignment(id, { ...nextPayload, entity_type: "research", entity_id: null } as any);
      }}
      delete={(id) => staffApi.deleteAssignment(id)}
      getRecordTitle={(record) => record.person?.full_name ?? record.title ?? record.role}
      getRecordMeta={(record) => [record.role_display ?? record.role, record.status, record.entity_type].filter(Boolean).join(" · ")}
      getRecordWorkflowActions={staffWorkflowActions}
      emptyMessage="No research staff assignments were returned by the staff service."
      emptyState={guidance?.emptyState}
      buildPayload={(values) => ({ hierarchy_level: 100, status: "active", display_order: 100, ...values, entity_type: "research", entity_id: null })}
      getRecordDetailHref={(record) => `/research/content/staff/${record.id}`}
      canCreate={canManage}
      canEdit={canManage}
      canDelete={canManage}
      resourceKey="content"
    />
  );
}
