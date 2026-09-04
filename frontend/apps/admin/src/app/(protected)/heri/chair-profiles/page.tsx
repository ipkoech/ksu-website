import { HeriCrudWorkspace } from "../_components/heri-crud-workspace";

export default function ChairProfilePage() {
  return (
    <div className="min-h-full bg-slate-50/70">
      <header className="border-b border-slate-200 bg-white px-6 py-8 md:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">HERI Africa administration</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Chair profile</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Maintain the public identity and institutional narrative of the Kisii University-hosted Language Education Research Chair.</p>
      </header>
      <HeriCrudWorkspace
        config={{
        resource: "chair-profiles",
        title: "Language Education Research Chair",
        description:
          "Manage the public identity, purpose, vision, mission, values, and media for the Kisii University-hosted HERI Africa Chair.",
        permission: "heri.content.write",
        workflow: false,
        fields: [
          { name: "name", label: "Chair name", required: true },
          { name: "acronym", label: "Acronym" },
          { name: "host_institution", label: "Host institution", required: true },
          { name: "initiative_name", label: "Wider initiative", required: true },
          { name: "tagline", label: "Tagline" },
          { name: "about", label: "About the Chair", type: "richtext" },
          { name: "vision", label: "Vision", type: "richtext" },
          { name: "mission", label: "Mission", type: "richtext" },
          { name: "mandate", label: "Mandate", type: "richtext" },
          { name: "objectives", label: "Objectives", type: "richtext" },
          { name: "values", label: "Values JSON", type: "textarea" },
          { name: "why_it_matters", label: "Why language education matters", type: "richtext" },
          { name: "logo_url", label: "Logo URL" },
          { name: "cover_image_url", label: "Cover image URL", type: "media" },
          { name: "seo", label: "SEO JSON", type: "textarea" },
          { name: "is_active", label: "Active", type: "boolean" },
        ],
        }}
      />
    </div>
  );
}
