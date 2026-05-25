import { ModuleLanding } from "@/components/dashboard/module-landing";

export default function SettingsPage() {
  return (
    <ModuleLanding
      title="Settings"
      description="Review application settings routes that are currently implemented for the main admin service."
      items={[
        {
          title: "General settings",
          description: "Review global application settings before they are wired to persistent system settings.",
          href: "/settings/general",
          icon: "settings",
          status: "Neutral state; persistent save is not wired in this section.",
        },
        {
          title: "API keys",
          description: "Manage system API keys through the implemented system settings endpoint.",
          href: "/system/settings/api-keys",
          icon: "keyRound",
          status: "Backed by the main service admin API.",
        },
      ]}
      backendNotes={[
        "System settings and API key data are available through the main service admin API.",
        "Main-service general settings must stay neutral until save/update behavior is connected to the settings API.",
      ]}
    />
  );
}
