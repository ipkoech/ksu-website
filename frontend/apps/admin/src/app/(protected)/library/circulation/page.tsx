"use client";

import { EditableServiceResourcePage } from "@/components/dashboard/editable-service-resource-page";
import { libraryServiceApi, type LibraryLoan, type LibraryLoanPayload } from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";

export default function LibraryCirculationPage() {
  const { hasScope } = usePermissions();
  const canManage = hasScope("library.manage_loans") || hasScope("library:write");

  return (
    <EditableServiceResourcePage<LibraryLoan, LibraryLoanPayload>
      title="Circulation"
      description="Issue loans and update circulation records."
      backHref="/library"
      queryKey={["library", "loans"]}
      fields={[
        { name: "resource_id", label: "Resource ID", required: true, placeholder: "UUID" },
        { name: "borrower_person_id", label: "Borrower Person ID", required: true, placeholder: "UUID" },
        { name: "borrowed_at", label: "Borrowed At", type: "datetime-local", required: true },
        { name: "due_at", label: "Due At", type: "datetime-local", required: true },
        { name: "max_renewals", label: "Max Renewals", type: "number" },
        { name: "notes", label: "Notes", type: "textarea" },
      ]}
      list={() => libraryServiceApi.loans.list({ page: 1, per_page: 50 })}
      create={(payload) => libraryServiceApi.loans.create(payload)}
      update={(id, payload) => libraryServiceApi.loans.update(id, payload)}
      canCreate={canManage}
      canEdit={canManage}
      getRecordTitle={(record) => record.resource_id}
      getRecordMeta={(record) => [record.borrower_person_id, record.status, record.due_at].filter(Boolean).join(" · ")}
      emptyMessage="No loan records were returned by the library service."
      buildPayload={(values) => ({
        resource_id: values.resource_id,
        borrower_person_id: values.borrower_person_id,
        borrowed_at: values.borrowed_at,
        due_at: values.due_at,
        max_renewals: values.max_renewals ?? 2,
        notes: values.notes,
      })}
    />
  );
}
