"use client";

import { EditableServiceResourcePage } from "@/components/dashboard/editable-service-resource-page";
import {
  libraryServiceApi,
  type LibraryLoan,
  type LibraryLoanPayload,
} from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";

export default function LibraryCirculationPage() {
  const { hasScope } = usePermissions();
  const canManage =
    hasScope("library.manage_loans") || hasScope("library:write");

  return (
    <EditableServiceResourcePage<LibraryLoan, LibraryLoanPayload>
      title="Circulation"
      description="Issue loans and update circulation records."
      backHref="/library"
      queryKey={["library", "loans"]}
      fields={[
        {
          name: "resource_id",
          label: "Resource",
          type: "entity",
          required: true,
          relation: { adapter: "libraryResource", filters: { status: "available" }, allowClear: false },
        },
        {
          name: "borrower_person_id",
          label: "Borrower",
          type: "entity",
          required: true,
          relation: { adapter: "person", filters: { status: "active" }, allowClear: false },
        },
        {
          name: "borrowed_at",
          label: "Borrowed At",
          type: "datetime-local",
          required: true,
        },
        {
          name: "due_at",
          label: "Due At",
          type: "datetime-local",
          required: true,
        },
        { name: "max_renewals", label: "Max Renewals", type: "number" },
        { name: "notes", label: "Notes", type: "textarea" },
      ]}
      list={() => libraryServiceApi.loans.list({ page: 1, per_page: 50 })}
      create={(payload) => libraryServiceApi.loans.create(payload)}
      update={(id, payload) => libraryServiceApi.loans.update(id, payload)}
      canCreate={canManage}
      canEdit={canManage}
      getRecordTitle={(record) => `Loan ${record.status ?? "record"}`}
      getRecordMeta={(record) =>
        [record.borrowed_at ? `Borrowed ${formatDateTime(record.borrowed_at)}` : null, record.due_at ? `Due ${formatDateTime(record.due_at)}` : null]
          .filter(Boolean)
          .join(" · ")
      }
      emptyMessage="No loan records were returned by the library service."
      validate={(values) => {
        const errors: Record<string, string> = {};
        const borrowedAt = values.borrowed_at
          ? new Date(values.borrowed_at)
          : null;
        const dueAt = values.due_at ? new Date(values.due_at) : null;
        const maxRenewals =
          values.max_renewals === "" || values.max_renewals === null
            ? null
            : Number(values.max_renewals);

        if (borrowedAt && dueAt && dueAt <= borrowedAt) {
          errors.due_at = "Due At must be later than Borrowed At.";
        }
        if (
          maxRenewals !== null &&
          (!Number.isFinite(maxRenewals) || maxRenewals < 0)
        ) {
          errors.max_renewals = "Max Renewals must be zero or greater.";
        }

        return errors;
      }}
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

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
