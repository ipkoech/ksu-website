"use client";

import { BadgeCheck, FileText, HandCoins, Users } from "lucide-react";
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

export const donationTabs = [
  { label: "Records", href: "/research/donations/records" },
  { label: "Donors", href: "/research/donations/donors" },
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
