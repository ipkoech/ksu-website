"use client";

import { Building2, FileText, Image, Settings, UserCheck } from "lucide-react";
import { ResearchSectionIndex } from "../_components/research-section-index";

export default function ResearchSettingsPage() {
  return (
    <ResearchSectionIndex
      title="Research Settings"
      description="Research office profile, support services, guidelines, boards, sliders, and configuration."
      links={[
        { title: "Research Office", description: "Office profile, mandate, services, objectives, and leadership content.", href: "/research/office", icon: Building2 },
        { title: "Office Staff", description: "Research office staff assignments from the main staff service.", href: "/research/office/staff", icon: UserCheck },
        { title: "Resources", description: "Research resources, equipment, facilities, and access details.", href: "/research/settings/resources", icon: FileText },
        { title: "Services", description: "Research support services and how to access them.", href: "/research/settings/services", icon: FileText },
        { title: "Guidelines", description: "Research policies, forms, and procedures.", href: "/research/settings/guidelines", icon: FileText },
        { title: "Boards", description: "Research boards and committee records.", href: "/research/settings/boards", icon: Building2 },
        { title: "Board Members", description: "Membership records for research boards.", href: "/research/settings/board-members", icon: UserCheck },
        { title: "Sliders", description: "Research slider records.", href: "/research/settings/sliders", icon: Image },
        { title: "General Settings", description: "Donation and public-facing configuration values.", href: "/research/settings/general", icon: Settings },
      ]}
    />
  );
}
