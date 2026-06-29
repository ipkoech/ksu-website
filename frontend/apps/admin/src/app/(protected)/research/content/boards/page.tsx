"use client";

import { governanceApi, type Board } from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";
import { EditableServiceResourcePage, type EditableListFilter, type EditableRecordColumn } from "@/components/dashboard/editable-service-resource-page";
import { DateValue, StatusBadge, titleOf } from "../../_components/research-workspace";
import { ContentWorkspaceHeader } from "../_components/content-workspace";

const boardFilters: EditableListFilter[] = [
  { name: "board_type", label: "Board Type", type: "select", options: [
    { label: "Committee", value: "committee" },
    { label: "Advisory", value: "advisory" },
    { label: "Council", value: "council" },
    { label: "Management", value: "management" },
  ] },
];

type BoardRecord = Board & Record<string, any>;

const boardColumns: Array<EditableRecordColumn<BoardRecord>> = [
  { key: "name", label: "Board", className: "min-w-[240px]", render: (record) => <span className="font-medium">{titleOf(record)}</span> },
  { key: "type", label: "Type", className: "hidden w-[140px] md:table-cell", render: (record) => <span>{record.board_type?.replace(/_/g, " ") ?? "Board"}</span> },
  { key: "chair", label: "Chairperson", className: "hidden min-w-[190px] lg:table-cell", render: (record) => <span>{record.chairperson?.full_name ?? "Unassigned"}</span> },
  { key: "members", label: "Members", className: "hidden w-[120px] xl:table-cell", render: (record) => <span>{record.current_members ?? record.member_count ?? 0}</span> },
  { key: "status", label: "Status", className: "w-[120px]", render: (record) => <StatusBadge value={record.status ?? (record.is_active ? "active" : "inactive")} /> },
  { key: "updated", label: "Updated", className: "hidden w-[150px] xl:table-cell", render: (record) => <DateValue value={record.updated_at} /> },
];

export default function ResearchBoardsPage() {
  const { hasScope } = usePermissions();
  const canManage = ["governance.manage", "content.manage", "research:write"].some((scope) => hasScope(scope));

  return (
    <EditableServiceResourcePage<BoardRecord, Record<string, any>>
      title="Research Boards"
      description="Manage governance boards attached to the research portal."
      backHref="/research/content"
      queryKey={["research", "content", "boards"]}
      summarySlot={<ContentWorkspaceHeader />}
      listFilters={boardFilters}
      recordColumns={boardColumns}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "board_type", label: "Board Type", type: "select", options: [
          { label: "Committee", value: "committee" },
          { label: "Advisory", value: "advisory" },
          { label: "Council", value: "council" },
          { label: "Management", value: "management" },
        ] },
        { name: "chairperson_id", label: "Chairperson", type: "entity", relation: { adapter: "person", filters: { status: "active" }, allowClear: true } },
        { name: "vice_chairperson_id", label: "Vice Chairperson", type: "entity", relation: { adapter: "person", filters: { status: "active" }, allowClear: true } },
        { name: "secretary_id", label: "Secretary", type: "entity", relation: { adapter: "person", filters: { status: "active" }, allowClear: true } },
        { name: "mandate", label: "Mandate", type: "textarea" },
        { name: "meeting_schedule", label: "Meeting Schedule" },
        { name: "member_count", label: "Expected Members", type: "number" },
        { name: "quorum", label: "Quorum", type: "number" },
        { name: "standard_term_years", label: "Standard Term Years", type: "number" },
        { name: "max_terms", label: "Maximum Terms", type: "number" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "status", label: "Status", type: "select", options: [
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
          { label: "Archived", value: "archived" },
        ] },
        { name: "is_public", label: "Public", type: "boolean" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "display_order", label: "Display Order", type: "number" },
      ]}
      list={(filters) => governanceApi.listBoards({ page: 1, per_page: 50, parent_entity_type: "research", ...filters })}
      create={(payload) => governanceApi.createBoard({ ...payload, parent_entity_type: "research" })}
      update={(id, payload) => governanceApi.updateBoard(id, { ...payload, parent_entity_type: "research" })}
      delete={(id) => governanceApi.deleteBoard(id)}
      getRecordTitle={(record) => record.name}
      getRecordMeta={(record) => [record.board_type, record.status, record.parent_entity_type].filter(Boolean).join(" · ")}
      emptyMessage="No research boards were returned by the governance service."
      buildPayload={(values) => ({ board_type: "committee", status: "active", is_public: true, is_active: true, display_order: 100, ...values, parent_entity_type: "research" })}
      canCreate={canManage}
      canEdit={canManage}
      canDelete={canManage}
      resourceKey="content"
    />
  );
}
