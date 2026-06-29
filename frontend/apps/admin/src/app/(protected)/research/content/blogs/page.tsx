"use client";

import { blogsApi } from "@ksu/api-client";
import { ResearchContentResourcePage } from "../../_components/research-content-resource-page";
import { ContentWorkspaceHeader, contentColumns, contentFilters } from "../_components/content-workspace";

export default function ResearchBlogsPage() {
  return (
    <ResearchContentResourcePage
      title="Research Blogs"
      description="Manage blog records scoped to research."
      queryKey={["research", "content", "blogs"]}
      resource={{ list: blogsApi.listAdmin, create: blogsApi.create, update: blogsApi.update, delete: blogsApi.delete }}
      summarySlot={<ContentWorkspaceHeader />}
      listFilters={contentFilters}
      recordColumns={contentColumns}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "content", label: "Content", type: "textarea" },
        { name: "category", label: "Category" },
        { name: "author_id", label: "Author", type: "entity", relation: { adapter: "person", filters: { status: "active" } } },
        { name: "status", label: "Status", type: "select", options: [
          { label: "Draft", value: "draft" },
          { label: "Published", value: "published" },
          { label: "Scheduled", value: "scheduled" },
          { label: "Archived", value: "archived" },
        ] },
        { name: "is_published", label: "Published", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ status: "draft", is_published: false }}
      emptyMessage="No research blog records were returned by the main content service."
    />
  );
}
