"use client";

import { BadgeCheck, FileText, HandCoins, Settings, Users } from "lucide-react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { EditableListFilter, EditableRecordColumn } from "@/components/dashboard/editable-service-resource-page";
import type { ResearchGenericRecord } from "@ksu/api-client";
import {
  DateValue,
  MoneyValue,
  RelationCell,
  researchCount,
  StatusBadge,
  titleOf,
} from "../../_components/research-workspace";
import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";

export const donationTabs = [
  { label: "Records", href: "/research/donations?tab=records" },
  { label: "Donors", href: "/research/donations?tab=donors" },
  { label: "Impacts", href: "/research/donations?tab=impacts" },
  { label: "Stories", href: "/research/donations?tab=stories" },
  { label: "Settings", href: "/research/donations?tab=settings" },
];

export function DonationsWorkspaceHeader() {
  const metrics = [
    { title: "Donations", queryKey: ["research", "donations", "metrics", "records"], queryFn: () => researchCount("donations", {}), icon: <HandCoins className="h-4 w-4" /> },
    { title: "Donors", queryKey: ["research", "donations", "metrics", "donors"], queryFn: () => researchCount("donors", { is_active: true }), icon: <Users className="h-4 w-4" /> },
    { title: "Impacts", queryKey: ["research", "donations", "metrics", "impacts"], queryFn: () => researchCount("donationImpacts", { is_active: true }), icon: <BadgeCheck className="h-4 w-4" /> },
    { title: "Stories", queryKey: ["research", "donations", "metrics", "stories"], queryFn: () => researchCount("donationStories", { status: "published" }), icon: <FileText className="h-4 w-4" /> },
    { title: "Settings", queryKey: ["research", "donations", "metrics", "settings"], queryFn: () => researchCount("donationSettings", { is_active: true }), icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {metrics.map((metric) => (
        <DonationMetricChip key={metric.title} {...metric} />
      ))}
    </div>
  );
}

function DonationMetricChip({
  title,
  queryKey,
  queryFn,
  icon,
}: {
  title: string;
  queryKey: readonly unknown[];
  queryFn: () => Promise<{ meta?: { total?: number }; data?: unknown[] }>;
  icon: ReactNode;
}) {
  const query = useQuery({ queryKey, queryFn });
  const value = query.data?.meta?.total ?? query.data?.data?.length ?? 0;

  return (
    <div className="inline-flex min-h-10 items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm shadow-sm">
      <span className="flex size-7 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
        {icon}
      </span>
      <span className="text-muted-foreground">{title}</span>
      <span className="font-semibold">{query.isLoading ? "--" : value.toLocaleString()}</span>
    </div>
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

const donationImpactColumns: Array<EditableRecordColumn<ResearchGenericRecord>> = [
  {
    key: "title",
    label: "Impact",
    className: "min-w-[260px]",
    render: (record) => (
      <div className="space-y-1">
        <span className="font-medium">{titleOf(record)}</span>
        <p className="line-clamp-1 text-xs text-muted-foreground">{record.summary ?? record.impact_type ?? "No summary"}</p>
      </div>
    ),
  },
  { key: "type", label: "Type", className: "hidden w-[150px] lg:table-cell", render: (record) => <span>{labelize(record.impact_type)}</span> },
  { key: "raised", label: "Raised", className: "w-[150px]", render: (record) => <MoneyValue amount={record.total_raised} currency={record.currency} /> },
  { key: "year", label: "Year", className: "hidden w-[100px] xl:table-cell", render: (record) => <span>{record.reporting_year ?? "-"}</span> },
  { key: "status", label: "Status", className: "w-[130px]", render: (record) => <StatusBadge value={record.status} /> },
];

const donationStoryColumns: Array<EditableRecordColumn<ResearchGenericRecord>> = [
  {
    key: "story",
    label: "Story",
    className: "min-w-[280px]",
    render: (record) => (
      <div className="space-y-1">
        <span className="font-medium">{titleOf(record)}</span>
        <p className="line-clamp-1 text-xs text-muted-foreground">{record.summary ?? record.quote ?? "No summary"}</p>
      </div>
    ),
  },
  { key: "donor", label: "Donor", className: "hidden min-w-[200px] lg:table-cell", render: (record) => record.donor_id ? <RelationCell id={record.donor_id} adapterKey="researchDonor" emptyLabel="No donor" /> : <span>{record.donor_name ?? "No donor"}</span> },
  { key: "organization", label: "Organization", className: "hidden min-w-[180px] xl:table-cell", render: (record) => <span>{record.donor_organization ?? "-"}</span> },
  { key: "status", label: "Status", className: "w-[130px]", render: (record) => <StatusBadge value={record.status} /> },
];

const donationSettingFilters: EditableListFilter[] = [
  { name: "search", label: "Search", type: "text", placeholder: "Search keys or descriptions" },
  { name: "setting_type", label: "Setting Type", type: "text", placeholder: "general, donation, visibility" },
  { name: "is_active", label: "Active", type: "boolean" },
];

const donationSettingColumns: Array<EditableRecordColumn<ResearchGenericRecord>> = [
  {
    key: "setting",
    label: "Setting",
    className: "min-w-[260px]",
    render: (record) => (
      <div className="space-y-1">
        <span className="font-medium">{record.key}</span>
        <p className="line-clamp-1 text-xs text-muted-foreground">{record.description || "No description"}</p>
      </div>
    ),
  },
  { key: "type", label: "Type", className: "w-[150px]", render: (record) => <span>{labelize(record.setting_type)}</span> },
  { key: "value", label: "Value", className: "hidden min-w-[240px] lg:table-cell", render: (record) => <span className="line-clamp-1 text-sm text-muted-foreground">{record.value || "No value"}</span> },
  { key: "status", label: "Status", className: "w-[120px]", render: (record) => <StatusBadge value={record.is_active ? "active" : "inactive"} /> },
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

export function DonationImpactsResource({ summarySlot }: { summarySlot?: ReactNode }) {
  return (
    <ResearchResourcePage
      title="Donation Impacts"
      description="Manage impact records showing how research donations were used."
      queryKey={["research", "donation-impacts"]}
      resource={researchServiceApi.donationImpacts}
      manageScopes={["donations.manage", "research.manage_impact", "research:write"]}
      summarySlot={summarySlot}
      recordColumns={donationImpactColumns}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "impact_type", label: "Impact Type", placeholder: "project" },
        { name: "project_id", label: "Project", type: "entity", relation: { adapter: "researchProject", filters: { is_active: true } } },
        { name: "center_id", label: "Research Center", type: "entity", relation: { adapter: "researchCenter", filters: { is_active: true } } },
        { name: "scholarship_id", label: "Scholarship", type: "entity", relation: { adapter: "researchScholarship", filters: { is_active: true } } },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "total_raised", label: "Total Raised", type: "number" },
        { name: "currency", label: "Currency", placeholder: "KES" },
        { name: "reporting_year", label: "Reporting Year", type: "number" },
        { name: "status", label: "Status", placeholder: "published" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ impact_type: "project", currency: "KES", status: "published" }}
      emptyMessage="No donation impacts were returned by the research service."
      metaFields={["impact_type", "reporting_year", "status"]}
      detailHref={(record) => `/research/donations/impacts/${record.id}`}
    />
  );
}

export function DonationStoriesResource({ summarySlot }: { summarySlot?: ReactNode }) {
  return (
    <ResearchResourcePage
      title="Donation Stories"
      description="Manage donor stories, testimonials, and public donation narratives."
      queryKey={["research", "donation-stories"]}
      resource={researchServiceApi.donationStories}
      manageScopes={["donations.manage", "research:write"]}
      exportResource="research-donation-stories"
      summarySlot={summarySlot}
      recordColumns={donationStoryColumns}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "donor_id", label: "Donor", type: "entity", relation: { adapter: "researchDonor", filters: { is_active: true } } },
        { name: "donor_name", label: "Donor Name" },
        { name: "donor_organization", label: "Donor Organization" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "story", label: "Story", type: "textarea" },
        { name: "quote", label: "Quote", type: "textarea" },
        { name: "photo_url", label: "Photo URL", type: "url" },
        { name: "video_url", label: "Video URL", type: "url" },
        { name: "status", label: "Status", placeholder: "published" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ status: "published" }}
      emptyMessage="No donation stories were returned by the research service."
      metaFields={["donor_name", "donor_organization", "status"]}
      detailHref={(record) => `/research/donations/stories/${record.id}`}
    />
  );
}

export function DonationSettingsResource({ summarySlot }: { summarySlot?: ReactNode }) {
  return (
    <ResearchResourcePage
      title="Donation Settings"
      description="Manage donation portal and public-facing configuration values."
      queryKey={["research", "donation-settings"]}
      resource={researchServiceApi.donationSettings}
      manageScopes={["donations.settings", "donations.manage", "research:write"]}
      summarySlot={summarySlot}
      fields={[
        { name: "key", label: "Key", required: true },
        { name: "value", label: "Value", type: "textarea" },
        { name: "setting_type", label: "Setting Type", placeholder: "donation" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "is_active", label: "Active", type: "boolean" },
      ]}
      defaults={{ setting_type: "donation" }}
      listFilters={donationSettingFilters}
      recordColumns={donationSettingColumns}
      emptyMessage="No donation settings were returned by the research service."
      metaFields={["setting_type", "is_active"]}
      detailHref={(record) => `/research/settings/general/${record.id}`}
      editorMode="sheet"
    />
  );
}

function labelize(value?: string | null) {
  if (!value) return "";
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
