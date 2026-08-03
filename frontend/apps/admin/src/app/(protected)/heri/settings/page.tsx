import { SiteSettingsWorkspace } from "../_components/site-settings-workspace";
import { HeriSettingsNavigationEditor } from "../_components/heri-settings-navigation-editor";

export default function HeriSettingsPage() {
  return (
    <div className="space-y-8">
      <SiteSettingsWorkspace />
      <div className="px-6 pb-10 md:px-10">
        <HeriSettingsNavigationEditor />
      </div>
    </div>
  );
}
