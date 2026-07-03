"use client";

import { Building2, FileText, Image, Settings } from "lucide-react";
import { ResearchSectionIndex } from "../_components/research-section-index";
import { ResearchSettingsWorkspaceHeader } from "./_components/settings-workspace";

export default function ResearchSettingsPage() {
  return (
    <div>
      <div className="p-4 sm:p-6">
        <ResearchSettingsWorkspaceHeader />
      </div>
      <ResearchSectionIndex
        title="Research Administration"
        description="Manage the research administrative unit profile, staff, services, documents, policies, media, and settings."
        links={[
          { title: "Profile", description: "Manage the research administrative unit profile, leadership, mandates, and cover image.", href: "/research/settings/profile", icon: Building2 },
          { title: "Documents", description: "Manage research resources, forms, facilities, and access documents.", href: "/research/settings/resources", icon: FileText },
          { title: "Services", description: "Maintain research support services and how to access them.", href: "/research/settings/services", icon: FileText },
          { title: "Policies", description: "Maintain research policies, procedures, forms, and public requirements.", href: "/research/settings/guidelines", icon: FileText },
          { title: "Media", description: "Manage research-scoped slider and visual records.", href: "/research/settings/sliders", icon: Image },
          { title: "Settings", description: "Manage public-facing and operational configuration values.", href: "/research/settings/general", icon: Settings },
        ]}
      />
    </div>
  );
}
