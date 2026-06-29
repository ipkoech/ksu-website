"use client";

import { CalendarDays, FileText, ImageIcon, Newspaper, UsersRound } from "lucide-react";
import type { EditableListFilter, EditableRecordColumn } from "@/components/dashboard/editable-service-resource-page";
import { newsApi, slidersApi } from "@ksu/api-client";
import { DateValue, RelationCell, ResearchWorkspaceHeader, StatusBadge, titleOf } from "../../_components/research-workspace";

export const contentTabs = [
  { label: "News", href: "/research/content/news" },
  { label: "Blogs", href: "/research/content/blogs" },
  { label: "Events", href: "/research/content/events" },
  { label: "Announcements", href: "/research/content/announcements" },
  { label: "Sliders", href: "/research/content/sliders" },
  { label: "Boards", href: "/research/content/boards" },
  { label: "Staff", href: "/research/content/staff" },
  { label: "Gallery", href: "/research/content/gallery" },
];

export function ContentWorkspaceHeader() {
  return (
    <ResearchWorkspaceHeader
      tabs={contentTabs}
      metrics={[
        { title: "Published", queryKey: ["research", "content", "metrics", "published"], queryFn: () => newsApi.listAdmin({ page: 1, per_page: 1, scope_type: "research", is_published: true }), icon: <Newspaper className="h-4 w-4" /> },
        { title: "Drafts", queryKey: ["research", "content", "metrics", "drafts"], queryFn: () => newsApi.listAdmin({ page: 1, per_page: 1, scope_type: "research", status: "draft" }), icon: <FileText className="h-4 w-4" /> },
        { title: "Scheduled", queryKey: ["research", "content", "metrics", "scheduled"], queryFn: () => newsApi.listAdmin({ page: 1, per_page: 1, scope_type: "research", status: "scheduled" }), icon: <CalendarDays className="h-4 w-4" /> },
        { title: "Needs Review", queryKey: ["research", "content", "metrics", "review"], queryFn: () => newsApi.listAdmin({ page: 1, per_page: 1, scope_type: "research", status: "review" }), icon: <UsersRound className="h-4 w-4" /> },
        { title: "Recent Updates", queryKey: ["research", "content", "metrics", "recent"], queryFn: () => slidersApi.listGroups({ scope_type: "research" }), icon: <ImageIcon className="h-4 w-4" /> },
      ]}
    />
  );
}

export const contentFilters: EditableListFilter[] = [
  { name: "search", label: "Search", type: "text", placeholder: "Search title or summary" },
  { name: "status", label: "Status", type: "select", options: [
    { label: "Draft", value: "draft" },
    { label: "Published", value: "published" },
    { label: "Scheduled", value: "scheduled" },
    { label: "Archived", value: "archived" },
  ] },
  { name: "is_published", label: "Published", type: "boolean" },
  { name: "is_featured", label: "Featured", type: "boolean" },
  { name: "published_at", label: "Publish Date", type: "date" },
];

export const contentColumns: Array<EditableRecordColumn<Record<string, any> & { id: string }>> = [
  { key: "title", label: "Title", className: "min-w-[260px]", render: (record) => <span className="font-medium">{titleOf(record)}</span> },
  { key: "status", label: "Status", className: "w-[130px]", render: (record) => <StatusBadge value={record.status ?? (record.is_published ? "published" : "draft")} /> },
  { key: "category", label: "Category / Type", className: "hidden min-w-[160px] lg:table-cell", render: (record) => <span>{record.category ?? record.event_type ?? record.location ?? "General"}</span> },
  { key: "publish", label: "Publish Date", className: "hidden w-[150px] xl:table-cell", render: (record) => <DateValue value={record.published_at ?? record.publish_date ?? record.start_date} /> },
  { key: "author", label: "Author / Owner", className: "hidden min-w-[190px] xl:table-cell", render: (record) => <RelationCell id={record.author_user_id} adapterKey="user" emptyLabel="No owner" /> },
  { key: "updated", label: "Updated", className: "hidden w-[150px] xl:table-cell", render: (record) => <DateValue value={record.updated_at} /> },
];
