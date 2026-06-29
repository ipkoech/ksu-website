"use client";

import { Calendar, FlaskConical, HeartHandshake, Newspaper } from "lucide-react";
import { ResearchSectionIndex } from "../_components/research-section-index";
import { SustainabilityDashboard, SustainabilityWorkspaceHeader } from "./_components/sustainability-workspace";

export default function SustainabilityPage() {
  return (
    <div>
      <div className="p-4 sm:p-6">
        <SustainabilityWorkspaceHeader />
      </div>
      <ResearchSectionIndex
        title="Sustainability and Climate Change"
        description="Projects, partners, activities, and content for sustainability work."
        links={[
          { title: "Projects", description: "Climate and sustainability initiatives.", href: "/research/sustainability/projects", icon: FlaskConical },
          { title: "Partners", description: "Sustainability partners.", href: "/research/sustainability/partners", icon: HeartHandshake },
          { title: "Activities", description: "Sustainability activities and events.", href: "/research/sustainability/activities", icon: Calendar },
          { title: "Content", description: "Research-scoped content records.", href: "/research/content", icon: Newspaper },
        ]}
      />
      <SustainabilityDashboard />
    </div>
  );
}
