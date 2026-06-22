"use client";

import { EditableServiceResourcePage } from "@/components/dashboard/editable-service-resource-page";
import {
  libraryServiceApi,
  type LibrarySupportTicket,
  type LibrarySupportTicketPayload,
  type LibrarySupportTicketUpdatePayload,
} from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";

const statusOptions = [
  { label: "Open", value: "open" },
  { label: "In progress", value: "in_progress" },
  { label: "Resolved", value: "resolved" },
  { label: "Closed", value: "closed" },
  { label: "Rejected", value: "rejected" },
];

const priorityOptions = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Critical", value: "critical" },
];

const categoryOptions = [
  { label: "Library service", value: "library_service" },
  { label: "Access issue", value: "access_issue" },
  { label: "Resource request", value: "resource_request" },
  { label: "Complaint", value: "complaint" },
  { label: "Other", value: "other" },
];

type TicketPayload = LibrarySupportTicketPayload | LibrarySupportTicketUpdatePayload;

export default function LibraryTicketsPage() {
  const { hasScope } = usePermissions();
  const canManage =
    hasScope("library.manage_services") || hasScope("library:write");

  return (
    <EditableServiceResourcePage<LibrarySupportTicket, TicketPayload>
      title="Library Support Tickets"
      description="Manage library service, access, resource request, complaint, and other support tickets."
      backHref="/library"
      queryKey={["library", "tickets"]}
      fields={[
        { name: "requester_name", label: "Requester Name" },
        { name: "requester_email", label: "Requester Email", type: "email" },
        { name: "subject", label: "Subject", required: true },
        { name: "description", label: "Description", type: "textarea", required: true },
        { name: "category", label: "Category", type: "select", options: categoryOptions },
        { name: "priority", label: "Priority", type: "select", options: priorityOptions },
        { name: "status", label: "Status", type: "select", options: statusOptions },
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
      ]}
      listFilters={[
        { name: "status", label: "Status", type: "select", options: statusOptions },
        { name: "category", label: "Category", type: "select", options: categoryOptions },
      ]}
      list={(filters) =>
        libraryServiceApi.tickets.list({
          status: typeof filters?.status === "string" ? filters.status : undefined,
          category: typeof filters?.category === "string" ? filters.category : undefined,
          page: 1,
          per_page: 100,
        })
      }
      create={(payload) =>
        libraryServiceApi.tickets.create(payload as LibrarySupportTicketPayload)
      }
      update={(id, payload) =>
        libraryServiceApi.tickets.update(
          id,
          payload as Partial<LibrarySupportTicketUpdatePayload>,
        )
      }
      delete={(id) => libraryServiceApi.tickets.delete(id)}
      canCreate={canManage}
      canEdit={canManage}
      canDelete={canManage}
      getRecordTitle={(record) => record.subject}
      getRecordMeta={(record) =>
        [
          record.requester_name ?? record.requester_email,
          record.target?.label,
          record.category?.replace(/_/g, " "),
          record.priority,
          record.status?.replace(/_/g, " "),
        ]
          .filter(Boolean)
          .join(" · ")
      }
      emptyMessage="No support tickets were returned by the library service."
      buildPayload={(values, editingRecord) => {
        if (editingRecord) {
          return {
            status: values.status,
            priority: values.priority,
            assigned_to_person_id: values.assigned_to_person_id,
            resolved_at: values.resolved_at,
            resolution_notes: values.resolution_notes,
          };
        }

        return {
          requester_name: values.requester_name,
          requester_email: values.requester_email,
          subject: values.subject,
          description: values.description,
          category: values.category || "other",
          priority: values.priority || "medium",
          target_entity_type: values.target_entity_type,
          target_entity_id: values.target_entity_id,
        };
      }}
    />
  );
}
