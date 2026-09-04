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
    <div className="min-h-full bg-slate-50/70">
      <header className="border-b border-slate-200 bg-white px-6 py-8 md:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">HERI Africa administration</p>
        <div className="mt-2 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div><h1 className="text-3xl font-bold tracking-tight text-slate-950">Research portfolio</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Shape the Language Education Research Chair’s themes, projects, publications, impact evidence, and public page sections from one workspace.</p></div>
          <span className="inline-flex w-fit items-center rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">Live public content controls</span>
        </div>
      </header>
      <div className="space-y-8 py-8">
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
            { name: "cover_image_url", label: "Cover image URL", type: "media" },
            { name: "start_date", label: "Start date", type: "date" },
            { name: "end_date", label: "End date", type: "date" },
            { name: "objectives", label: "Objectives", type: "richtext" },
            { name: "methodology", label: "Methodology", type: "richtext" },
            { name: "is_featured", label: "Featured", type: "boolean" },
            { name: "position", label: "Position", type: "number" },
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
            { name: "abstract", label: "Abstract", type: "richtext" },
            { name: "citation", label: "Citation", type: "richtext" },
            { name: "resource_url", label: "Resource URL" },
            { name: "cover_image_url", label: "Cover image URL", type: "media" },
            { name: "publication_date", label: "Publication date", type: "date" },
            { name: "publication_type", label: "Publication type" },
            { name: "theme_id", label: "Theme ID" },
            { name: "is_featured", label: "Featured", type: "boolean" },
            { name: "position", label: "Position", type: "number" },
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
    </div>
  );
}
