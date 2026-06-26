"use client";

import { FileText, Image, Settings } from "lucide-react";
import { ResearchSectionIndex } from "../_components/research-section-index";

export default function ResearchSettingsPage() {
  return (
    <ResearchSectionIndex
      title="Research Settings"
      description="Research resources, services, guidelines, and configuration."
      links={[
        { title: "Resources", description: "Research resources, equipment, facilities, and access details.", href: "/research/settings/resources", icon: FileText },
        { title: "Services", description: "Research support services and how to access them.", href: "/research/settings/services", icon: FileText },
        { title: "Guidelines", description: "Research policies, forms, and procedures.", href: "/research/settings/guidelines", icon: FileText },
        { title: "Sliders", description: "Research slider records.", href: "/research/settings/sliders", icon: Image },
        { title: "General Settings", description: "Donation and public-facing configuration values.", href: "/research/settings/general", icon: Settings },
      ]}
    />
  );
}
