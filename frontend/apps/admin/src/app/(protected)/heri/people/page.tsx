import { HeriCrudWorkspace } from "../_components/heri-crud-workspace";
import { TeamWorkspace } from "../_components/team-workspace";

export default function HeriPeoplePage() {
  return (
    <div className="min-h-full bg-slate-50/70">
      <header className="border-b border-slate-200 bg-white px-6 py-8 md:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">HERI Africa administration</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">People & partners</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Present the chair’s research network with accurate profiles, institutional relationships, visibility controls, and public ordering.</p>
      </header>
      <div className="space-y-8 py-8">
      <TeamWorkspace />
      <HeriCrudWorkspace
        config={{
          resource: "partners",
          title: "Partners and centre relationships",
          description:
            "Manage the HERI partner projection and synchronize it with the canonical Research Service. Use the Sync from Research Service action to refresh partner records and centre relationships without entering IDs.",
          permission: "heri.content.write",
          fields: [
            { name: "name", label: "Name", required: true },
            { name: "slug", label: "Slug", required: true },
            {
              name: "description",
              label: "Public description",
              type: "textarea",
            },
            { name: "about", label: "About", type: "textarea" },
            { name: "logo_url", label: "Logo URL" },
            { name: "website_url", label: "Website URL" },
            { name: "country", label: "Country" },
            { name: "partner_type", label: "Partner type" },
            { name: "partnership_level", label: "Partnership level" },
            {
              name: "collaboration_areas",
              label: "Collaboration areas (JSON)",
              type: "textarea",
            },
            {
              name: "partnership_start",
              label: "Partnership start",
              type: "date",
            },
            { name: "partnership_end", label: "Partnership end", type: "date" },
            { name: "mou_signed_date", label: "MOU signed", type: "date" },
            { name: "mou_expiry_date", label: "MOU expiry", type: "date" },
            { name: "relationship_status", label: "Relationship status" },
            {
              name: "relationship_notes",
              label: "Relationship notes",
              type: "textarea",
            },
            { name: "display_order", label: "Display order", type: "number" },
            { name: "is_featured", label: "Featured", type: "boolean" },
            { name: "is_active", label: "Active", type: "boolean" },
          ],
        }}
      />
      </div>
    </div>
  );
}
