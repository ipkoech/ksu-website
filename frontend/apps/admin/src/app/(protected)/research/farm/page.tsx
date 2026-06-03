"use client";

import { Calendar, FileText, FlaskConical, HeartHandshake, Leaf, Sprout } from "lucide-react";
import { ResearchSectionIndex } from "../_components/research-section-index";

export default function UniversityFarmPage() {
  return (
    <ResearchSectionIndex
      title="University Farm"
      description="Farm projects, partnerships, impact stories, activities, and focus areas."
      links={[
        { title: "Farm Profiles", description: "University farm profile and operational records.", href: "/research/farm/farms", icon: Sprout },
        { title: "Projects", description: "Farm-linked research projects.", href: "/research/farm/projects", icon: FlaskConical },
        { title: "Partnerships", description: "Farm partnerships.", href: "/research/farm/partnerships", icon: HeartHandshake },
        { title: "Impact Stories", description: "Farm impact stories.", href: "/research/farm/impact-stories", icon: FileText },
        { title: "Activities", description: "Farm activities and events.", href: "/research/farm/activities", icon: Calendar },
        { title: "Focus Areas", description: "Farm focus areas.", href: "/research/farm/focus-areas", icon: Leaf },
      ]}
    />
  );
}
