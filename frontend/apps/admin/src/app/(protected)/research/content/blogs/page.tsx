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
      getRecordDetailHref={(record) => `/research/content/blogs/${record.id}`}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "excerpt", label: "Excerpt", type: "textarea" },
        { name: "rich_text", label: "Body", type: "richtext" },
        { name: "featured_media_id", label: "Featured Media", type: "media", media: { mediaType: "image", uploadEntityType: "research", uploadRole: "featured" } },
        { name: "author_user_id", label: "Author", type: "entity", relation: { adapter: "user", filters: { is_active: true } } },
        { name: "published_at", label: "Publish Date", type: "datetime-local" },
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
