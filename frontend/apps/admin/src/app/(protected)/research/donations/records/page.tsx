"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";
import { donationRecordColumns, DonationsWorkspaceHeader } from "../_components/donations-workspace";

const donationStatusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "Failed", value: "failed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Refunded", value: "refunded" },
];

export default function ResearchDonationRecordsPage() {
  return (
    <ResearchResourcePage
      title="Donation Records"
      description="Track research donation records and donor-funded support."
      queryKey={["research", "donations"]}
      resource={researchServiceApi.donations}
      manageScopes={["donations.manage", "donations.confirm", "research:write"]}
      summarySlot={<DonationsWorkspaceHeader />}
      recordColumns={donationRecordColumns}
      listFilters={[
        { name: "donor_id", label: "Donor", type: "entity", relation: { adapter: "researchDonor", filters: { is_active: true } } },
        { name: "project_id", label: "Project", type: "entity", relation: { adapter: "researchProject", filters: { is_active: true } } },
        { name: "status", label: "Status", type: "select", options: donationStatusOptions },
        { name: "donation_date", label: "Donation Date", type: "date" },
      ]}
      fields={[
        { name: "donor_id", label: "Donor", type: "entity", required: true, relation: { adapter: "researchDonor", filters: { is_active: true }, allowClear: false } },
        { name: "amount", label: "Amount", type: "number", required: true },
        { name: "currency", label: "Currency", placeholder: "KES" },
        { name: "donation_type", label: "Donation Type", type: "select", placeholder: "Donation type", options: [
          { label: "One Time", value: "one_time" },
          { label: "Recurring", value: "recurring" },
          { label: "Pledge", value: "pledge" },
          { label: "In Kind", value: "in_kind" },
        ] },
        { name: "designation", label: "Designation", type: "select", placeholder: "Designation", options: [
          { label: "Unrestricted", value: "unrestricted" },
          { label: "Research Project", value: "research_project" },
          { label: "Scholarship", value: "scholarship" },
          { label: "Equipment", value: "equipment" },
          { label: "Endowment", value: "endowment" },
        ] },
        { name: "purpose", label: "Purpose" },
        { name: "project_id", label: "Linked Project", type: "entity", relation: { adapter: "researchProject", filters: { is_active: true }, allowClear: true } },
        { name: "scholarship_id", label: "Linked Scholarship", type: "entity", relation: { adapter: "researchScholarship", filters: { is_active: true }, allowClear: true } },
        { name: "donation_date", label: "Donation Date", type: "date", required: true },
        { name: "status", label: "Status", type: "select", placeholder: "Status", options: donationStatusOptions },
      ]}
      defaults={{ currency: "KES", donation_type: "one_time", designation: "unrestricted", status: "completed" }}
      emptyMessage="No donations were returned by the research service."
      detailHref={(record) => `/research/donations/records/${record.id}`}
      getRecordWorkflowActions={(record) => {
        const status = String(record.status ?? "").toLowerCase();

        if (status === "completed") {
          return [
            {
              label: "Mark Refunded",
              variant: "outline",
              payload: { status: "refunded" },
              successMessage: "Donation marked as refunded",
            },
          ];
        }

        if (status === "cancelled" || status === "failed" || status === "refunded") {
          return [
            {
              label: "Reopen Pending",
              variant: "secondary",
              payload: { status: "pending" },
              successMessage: "Donation reopened as pending",
            },
          ];
        }

        return [
          {
            label: "Confirm Donation",
            variant: "default",
            payload: { status: "completed" },
            successMessage: "Donation confirmed",
          },
          {
            label: "Cancel Donation",
            variant: "outline",
            className: "text-destructive",
            payload: { status: "cancelled" },
            successMessage: "Donation cancelled",
          },
        ];
      }}
    />
  );
}
