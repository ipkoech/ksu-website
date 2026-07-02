"use client";

import { BadgeCheck, FileText, HandCoins, Users } from "lucide-react";
import type { ReactNode } from "react";
import type { EditableRecordColumn } from "@/components/dashboard/editable-service-resource-page";
import type { ResearchGenericRecord } from "@ksu/api-client";
import {
  DateValue,
  MoneyValue,
  RelationCell,
  researchCount,
  ResearchWorkspaceHeader,
  StatusBadge,
  titleOf,
} from "../../_components/research-workspace";
import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";

export const donationTabs = [
  { label: "Records", href: "/research/donations?tab=records" },
  { label: "Donors", href: "/research/donations?tab=donors" },
  { label: "Impacts", href: "/research/donations/impacts" },
  { label: "Stories", href: "/research/donations/stories" },
];

export function DonationsWorkspaceHeader() {
  return (
    <ResearchWorkspaceHeader
      metrics={[
        { title: "Total Donations", queryKey: ["research", "donations", "metrics", "records"], queryFn: () => researchCount("donations", {}), icon: <HandCoins className="h-4 w-4" /> },
        { title: "Donors", queryKey: ["research", "donations", "metrics", "donors"], queryFn: () => researchCount("donors", { is_active: true }), icon: <Users className="h-4 w-4" /> },
        { title: "Impact Records", queryKey: ["research", "donations", "metrics", "impacts"], queryFn: () => researchCount("donationImpacts", { is_active: true }), icon: <BadgeCheck className="h-4 w-4" /> },
        { title: "Stories Published", queryKey: ["research", "donations", "metrics", "stories"], queryFn: () => researchCount("donationStories", { status: "published" }), icon: <FileText className="h-4 w-4" /> },
      ]}
    />
  );
}

export const donationRecordColumns: Array<EditableRecordColumn<ResearchGenericRecord>> = [
  { key: "donor", label: "Donor", className: "min-w-[220px]", render: (record) => <RelationCell id={record.donor_id} adapterKey="researchDonor" emptyLabel="No donor" /> },
  { key: "amount", label: "Amount", className: "w-[150px]", render: (record) => <MoneyValue amount={record.amount} currency={record.currency} /> },
  { key: "purpose", label: "Purpose", className: "hidden min-w-[180px] lg:table-cell", render: (record) => <span>{record.purpose ?? record.designation ?? "Unrestricted"}</span> },
  { key: "linked", label: "Project / Program", className: "hidden min-w-[190px] xl:table-cell", render: (record) => (
    record.project_id ? <RelationCell id={record.project_id} adapterKey="researchProject" emptyLabel="No project" /> :
    record.scholarship_id ? <RelationCell id={record.scholarship_id} adapterKey="researchScholarship" emptyLabel="No scholarship" /> :
    <span className="text-muted-foreground">Unrestricted</span>
  ) },
  { key: "date", label: "Date", className: "hidden w-[150px] xl:table-cell", render: (record) => <DateValue value={record.donation_date} /> },
  { key: "status", label: "Status", className: "w-[130px]", render: (record) => <StatusBadge value={record.status} /> },
];

export const donorColumns: Array<EditableRecordColumn<ResearchGenericRecord>> = [
  { key: "name", label: "Name", className: "min-w-[240px]", render: (record) => <span className="font-medium">{titleOf(record)}</span> },
  { key: "type", label: "Type", className: "w-[130px]", render: (record) => <span>{record.donor_type ?? "individual"}</span> },
  { key: "contact", label: "Contact", className: "hidden min-w-[220px] lg:table-cell", render: (record) => <span>{[record.email, record.phone, record.country].filter(Boolean).join(" · ") || "No contact"}</span> },
  { key: "total", label: "Total Contributions", className: "hidden w-[180px] xl:table-cell", render: (record) => <MoneyValue amount={record.total_donated} currency="KES" /> },
  { key: "impacts", label: "Linked Impacts", className: "hidden w-[150px] xl:table-cell", render: (record) => <span>{record.impact_count ?? record.donation_count ?? 0}</span> },
  { key: "status", label: "Status", className: "w-[130px]", render: (record) => <StatusBadge value={record.is_active === false ? "inactive" : "active"} /> },
];

const donationStatusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "Failed", value: "failed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Refunded", value: "refunded" },
];

const recurringFrequencyOptions = [
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Yearly", value: "yearly" },
];

export function DonationRecordsResource({ summarySlot }: { summarySlot?: ReactNode }) {
  return (
    <ResearchResourcePage
      title="Donation Records"
      description="Track research donation records and donor-funded support."
      queryKey={["research", "donations"]}
      resource={researchServiceApi.donations}
      manageScopes={["donations.manage", "donations.confirm", "research:write"]}
      importResource="research-donations"
      summarySlot={summarySlot}
      recordColumns={donationRecordColumns}
      listFilters={[
        { name: "donor_id", label: "Donor", type: "entity", relation: { adapter: "researchDonor", filters: { is_active: true } } },
        { name: "project_id", label: "Project", type: "entity", relation: { adapter: "researchProject", filters: { is_active: true } } },
        { name: "status", label: "Status", type: "select", options: donationStatusOptions },
        { name: "recurring_frequency", label: "Recurring Frequency", type: "select", options: recurringFrequencyOptions },
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
        { name: "recurring_frequency", label: "Recurring Frequency", type: "select", placeholder: "Recurring frequency", options: recurringFrequencyOptions },
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

export function DonorsResource({ summarySlot }: { summarySlot?: ReactNode }) {
  return (
    <ResearchResourcePage
      title="Donors"
      description="Manage donor profiles for research donations and giving stories."
      queryKey={["research", "donors"]}
      resource={researchServiceApi.donors}
      manageScopes={["donations.manage", "research:write"]}
      importResource="research-donors"
      summarySlot={summarySlot}
      recordColumns={donorColumns}
      listFilters={[
        { name: "search", label: "Search", type: "text", placeholder: "Search donor name, organization, or email" },
        { name: "donor_type", label: "Donor Type", type: "select", options: [
          { label: "Individual", value: "individual" },
          { label: "Organization", value: "organization" },
          { label: "Corporate", value: "corporate" },
          { label: "Foundation", value: "foundation" },
        ] },
        { name: "is_active", label: "Active", type: "boolean" },
      ]}
      fields={[
        { name: "donor_type", label: "Donor Type", type: "select", placeholder: "Select type", options: [
          { label: "Individual", value: "individual" },
          { label: "Organization", value: "organization" },
          { label: "Corporate", value: "corporate" },
          { label: "Foundation", value: "foundation" },
        ] },
        { name: "display_name", label: "Display Name" },
        { name: "first_name", label: "First Name" },
        { name: "last_name", label: "Last Name" },
        { name: "organization_name", label: "Organization Name" },
        { name: "organization_type", label: "Organization Type" },
        { name: "email", label: "Email", type: "email" },
        { name: "phone", label: "Phone" },
        { name: "tier", label: "Tier" },
        { name: "notes", label: "Notes", type: "textarea" },
        { name: "is_anonymous", label: "Anonymous", type: "boolean" },
        { name: "is_active", label: "Active", type: "boolean" },
      ]}
      defaults={{ donor_type: "individual" }}
      emptyMessage="No donors were returned by the research service."
      metaFields={["donor_type", "tier", "donation_count"]}
      detailHref={(record) => `/research/donations/donors/${record.id}`}
    />
  );
}
