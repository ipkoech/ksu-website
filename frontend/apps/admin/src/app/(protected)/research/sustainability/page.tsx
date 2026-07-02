"use client";

import { Calendar, FlaskConical, HeartHandshake } from "lucide-react";
import { ResearchSectionIndex } from "../_components/research-section-index";
import { SustainabilityWorkspaceHeader } from "./_components/sustainability-workspace";

export default function SustainabilityPage() {
  return (
    <div>
      <ResearchSectionIndex
        title="Sustainability and Climate Change"
        description="Projects, partners, activities, and content for sustainability work."
        hideHeader
        summarySlot={<SustainabilityWorkspaceHeader />}
        links={[
          { title: "Projects", description: "Climate and sustainability initiatives.", href: "/research/sustainability/projects", icon: FlaskConical },
          { title: "Partners", description: "Sustainability partners.", href: "/research/sustainability/partners", icon: HeartHandshake },
          { title: "Activities", description: "Sustainability activities and events.", href: "/research/sustainability/activities", icon: Calendar },
        ]}
      />
    </div>
  );
}
