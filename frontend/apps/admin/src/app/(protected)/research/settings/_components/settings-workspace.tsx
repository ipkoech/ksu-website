"use client";

import { FileText, ImageIcon, MessageSquare, Settings } from "lucide-react";
import { slidersApi } from "@ksu/api-client";
import {
  researchCount,
  ResearchWorkspaceHeader,
} from "../../_components/research-workspace";

export const settingsTabs = [
  { label: "General", href: "/research/settings/general" },
  { label: "Services", href: "/research/settings/services" },
  { label: "Resources", href: "/research/settings/resources" },
  { label: "Guidelines", href: "/research/settings/guidelines" },
  { label: "Sliders", href: "/research/settings/sliders" },
];

export function ResearchSettingsWorkspaceHeader() {
  return (
    <ResearchWorkspaceHeader
      tabs={settingsTabs}
      metrics={[
        { title: "General Settings", queryKey: ["research", "settings", "metrics", "general"], queryFn: () => researchCount("donationSettings", { is_active: true }), icon: <Settings className="h-4 w-4" /> },
        { title: "Services", queryKey: ["research", "settings", "metrics", "services"], queryFn: () => researchCount("services", { is_active: true }), icon: <MessageSquare className="h-4 w-4" /> },
        { title: "Resources", queryKey: ["research", "settings", "metrics", "resources"], queryFn: () => researchCount("resources", { is_active: true }), icon: <FileText className="h-4 w-4" /> },
        { title: "Guidelines", queryKey: ["research", "settings", "metrics", "guidelines"], queryFn: () => researchCount("guidelines", { is_active: true }), icon: <FileText className="h-4 w-4" /> },
        { title: "Sliders", queryKey: ["research", "settings", "metrics", "sliders"], queryFn: () => slidersApi.listAdminSliders({ scope_type: "research" }), icon: <ImageIcon className="h-4 w-4" /> },
      ]}
    />
  );
}
