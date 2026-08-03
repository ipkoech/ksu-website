import { PageSectionsWorkspace } from "../_components/page-sections-workspace";
import { HeriCrudWorkspace } from "../_components/heri-crud-workspace";

const statuses = [
  "draft",
  "in_review",
  "approved",
  "scheduled",
  "published",
  "archived",
];

export default function HeriResearchPage() {
  return (
    <div className="space-y-8">
      <HeriCrudWorkspace
        config={{
          resource: "themes",
          title: "Research themes",
          description:
            "Organise the chair’s research portfolio into publishable themes.",
          permission: "heri.content.write",
          workflow: true,
          fields: [
            { name: "name", label: "Name", required: true },
            { name: "slug", label: "Slug", required: true },
            { name: "description", label: "Description", type: "textarea" },
            {
              name: "status",
              label: "Status",
              type: "select",
              options: statuses,
            },
          ],
        }}
      />
      <HeriCrudWorkspace
        config={{
          resource: "projects",
          title: "Research projects",
          description:
            "Maintain research projects and their publication readiness.",
          permission: "heri.content.write",
          workflow: true,
          fields: [
            { name: "title", label: "Title", required: true },
            { name: "slug", label: "Slug", required: true },
            { name: "summary", label: "Summary", type: "textarea" },
            {
              name: "status",
              label: "Status",
              type: "select",
              options: statuses,
            },
            { name: "theme_id", label: "Theme ID" },
          ],
        }}
      />
      <HeriCrudWorkspace
        config={{
          resource: "publications",
          title: "Publications",
          description:
            "Manage research outputs, abstracts, citations, and public resource links.",
          permission: "heri.content.write",
          workflow: true,
          fields: [
            { name: "title", label: "Title", required: true },
            { name: "slug", label: "Slug", required: true },
            { name: "abstract", label: "Abstract", type: "textarea" },
            { name: "citation", label: "Citation", type: "textarea" },
            { name: "resource_url", label: "Resource URL" },
            {
              name: "status",
              label: "Status",
              type: "select",
              options: statuses,
            },
          ],
        }}
      />
      <HeriCrudWorkspace
        config={{
          resource: "impact-metrics",
          title: "Our Work impact metrics",
          description:
            "Manage the published metric cards displayed on the public Our Work page.",
          permission: "heri.content.write",
          fields: [
            { name: "label", label: "Label", required: true },
            { name: "value", label: "Value", required: true },
            { name: "unit", label: "Unit" },
            { name: "description", label: "Description", type: "textarea" },
            { name: "position", label: "Position", type: "number" },
            { name: "is_visible", label: "Visible", type: "boolean" },
          ],
        }}
      />
      <PageSectionsWorkspace />
    </div>
  );
}
