import { SiteSettingsWorkspace } from "../_components/site-settings-workspace";
import { HeriSettingsNavigationEditor } from "../_components/heri-settings-navigation-editor";
import { HeriCrudWorkspace } from "../_components/heri-crud-workspace";

export default function HeriSettingsPage() {
  return (
    <div className="space-y-8">
      <SiteSettingsWorkspace />
      <div className="px-6 pb-10 md:px-10">
        <HeriSettingsNavigationEditor />
      </div>
      <HeriCrudWorkspace
        config={{
          resource: "footer",
          title: "Footer links",
          description: "Manage public footer groups, destinations, visibility, and display order.",
          permission: "heri.content.write",
          fields: [
            { name: "label", label: "Label", required: true },
            { name: "href", label: "Destination", required: true },
            { name: "column", label: "Link group" },
            { name: "position", label: "Display order", type: "number" },
            { name: "is_visible", label: "Visible", type: "boolean" },
          ],
        }}
      />
    </div>
  );
}
