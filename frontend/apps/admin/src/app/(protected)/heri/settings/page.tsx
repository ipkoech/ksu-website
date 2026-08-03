import { HeriCrudWorkspace } from "../_components/heri-crud-workspace";
import { HeriSettingsNavigationEditor } from "../_components/heri-settings-navigation-editor";

const settingsFields = [
  { name: "name", label: "Site name", required: true },
  { name: "tagline", label: "Tagline" },
  { name: "research_center_slug", label: "Primary research centre slug" },
  { name: "contact", label: "Contact JSON", type: "textarea" as const },
  {
    name: "social_links",
    label: "Social links JSON",
    type: "textarea" as const,
  },
  {
    name: "seo_defaults",
    label: "SEO defaults JSON",
    type: "textarea" as const,
  },
];

export default function HeriSettingsPage() {
  return (
    <div className="space-y-8">
      <HeriCrudWorkspace
        config={{
          resource: "site-settings",
          title: "Site settings",
          description:
            "Manage the public site name, contact details, social links, and SEO defaults. Values are audited on save.",
          permission: "heri.settings.write",
          fields: settingsFields,
        }}
      />
      <div className="px-6 pb-10 md:px-10">
        <HeriSettingsNavigationEditor />
      </div>
    </div>
  );
}
