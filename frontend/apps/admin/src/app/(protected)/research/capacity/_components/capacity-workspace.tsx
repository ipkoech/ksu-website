"use client";

import { BookOpen, FileClock, GraduationCap, Handshake, UserCheck } from "lucide-react";
import type { EditableListFilter, EditableRecordColumn } from "@/components/dashboard/editable-service-resource-page";
import type { ResearchGenericRecord } from "@ksu/api-client";
import {
  DateValue,
  labelize,
  MoneyValue,
  RelationCell,
  researchCount,
  ResearchWorkspaceHeader,
  StatusBadge,
  titleOf,
} from "../../_components/research-workspace";

export const capacityTabs = [
  { label: "Training", href: "/research/capacity/training" },
  { label: "Mentorship", href: "/research/capacity/mentorship" },
  { label: "Applications", href: "/research/capacity/mentorship-applications" },
  { label: "Matches", href: "/research/capacity/mentorship-matches" },
  { label: "Scholarships", href: "/research/capacity/scholarships" },
  { label: "Consultancies", href: "/research/capacity/consultancies" },
];

export function CapacityWorkspaceHeader() {
  return (
    <ResearchWorkspaceHeader
      tabs={capacityTabs}
      metrics={[
        { title: "Active Training", queryKey: ["research", "capacity", "metrics", "training"], queryFn: () => researchCount("training", { is_active: true }), icon: <GraduationCap className="h-4 w-4" /> },
        { title: "Pending Mentorship", queryKey: ["research", "capacity", "metrics", "mentorship-applications"], queryFn: () => researchCount("mentorshipApplications", { status: "submitted" }), icon: <FileClock className="h-4 w-4" /> },
        { title: "Active Matches", queryKey: ["research", "capacity", "metrics", "matches"], queryFn: () => researchCount("mentorshipMatches", { status: "active" }), icon: <UserCheck className="h-4 w-4" /> },
        { title: "Scholarships Open", queryKey: ["research", "capacity", "metrics", "scholarships"], queryFn: () => researchCount("scholarships", { status: "open" }), icon: <BookOpen className="h-4 w-4" /> },
        { title: "Consultancies", queryKey: ["research", "capacity", "metrics", "consultancies"], queryFn: () => researchCount("consultancies", { is_active: true }), icon: <Handshake className="h-4 w-4" /> },
      ]}
    />
  );
}

export const statusFilter: EditableListFilter = {
  name: "status",
  label: "Status",
  type: "select",
  options: [
    { label: "Draft", value: "draft" },
    { label: "Submitted", value: "submitted" },
    { label: "Under Review", value: "under_review" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
    { label: "Active", value: "active" },
    { label: "Completed", value: "completed" },
    { label: "Open", value: "open" },
    { label: "Closed", value: "closed" },
  ],
};

export const trainingColumns: Array<EditableRecordColumn<ResearchGenericRecord>> = [
  { key: "title", label: "Program", className: "min-w-[260px]", render: (record) => <span className="font-medium">{titleOf(record)}</span> },
  { key: "type", label: "Type", className: "w-[150px]", render: (record) => <span>{labelize(record.program_type)}</span> },
  { key: "dates", label: "Dates", className: "hidden min-w-[150px] lg:table-cell", render: (record) => <DateValue value={record.start_date} /> },
  { key: "mode", label: "Mode", className: "hidden w-[130px] xl:table-cell", render: (record) => <span>{labelize(record.delivery_mode)}</span> },
  { key: "status", label: "Status", className: "w-[130px]", render: (record) => <StatusBadge value={record.status} /> },
];

export const applicationColumns: Array<EditableRecordColumn<ResearchGenericRecord>> = [
  { key: "applicant", label: "Applicant", className: "min-w-[220px]", render: (record) => <RelationCell id={record.applicant_id} adapterKey="person" emptyLabel="No applicant" /> },
  { key: "program", label: "Program", className: "hidden min-w-[220px] lg:table-cell", render: (record) => <RelationCell id={record.program_id ?? record.scholarship_id} adapterKey={record.program_id ? "researchMentorship" : "researchScholarship"} emptyLabel="No program" /> },
  { key: "type", label: "Type", className: "w-[130px]", render: (record) => <span>{labelize(record.application_type)}</span> },
  { key: "submitted", label: "Submitted", className: "hidden w-[150px] xl:table-cell", render: (record) => <DateValue value={record.submitted_at} /> },
  { key: "status", label: "Status", className: "w-[130px]", render: (record) => <StatusBadge value={record.status} /> },
];

export const matchColumns: Array<EditableRecordColumn<ResearchGenericRecord>> = [
  { key: "mentor", label: "Mentor", className: "min-w-[190px]", render: (record) => <RelationCell id={record.mentor_id} adapterKey="person" emptyLabel="No mentor" /> },
  { key: "mentee", label: "Mentee", className: "min-w-[190px]", render: (record) => <RelationCell id={record.mentee_id} adapterKey="person" emptyLabel="No mentee" /> },
  { key: "program", label: "Program", className: "hidden min-w-[220px] lg:table-cell", render: (record) => <RelationCell id={record.program_id} adapterKey="researchMentorship" emptyLabel="No program" /> },
  { key: "date", label: "Match Date", className: "hidden w-[150px] xl:table-cell", render: (record) => <DateValue value={record.match_date} /> },
  { key: "status", label: "Status", className: "w-[130px]", render: (record) => <StatusBadge value={record.status} /> },
];

export const scholarshipColumns: Array<EditableRecordColumn<ResearchGenericRecord>> = [
  { key: "name", label: "Scholarship", className: "min-w-[260px]", render: (record) => <span className="font-medium">{titleOf(record)}</span> },
  { key: "type", label: "Type", className: "w-[150px]", render: (record) => <span>{labelize(record.scholarship_type)}</span> },
  { key: "value", label: "Value", className: "hidden w-[150px] lg:table-cell", render: (record) => <MoneyValue amount={record.value} currency={record.currency} /> },
  { key: "deadline", label: "Deadline", className: "hidden w-[150px] xl:table-cell", render: (record) => <DateValue value={record.application_deadline} /> },
  { key: "status", label: "Status", className: "w-[130px]", render: (record) => <StatusBadge value={record.status} /> },
];

