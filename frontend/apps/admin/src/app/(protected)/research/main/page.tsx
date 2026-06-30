"use client";

import { BookOpen, Building2, FileText, FlaskConical, HandCoins, HeartHandshake, Leaf, Lightbulb, Settings } from "lucide-react";
import { ResearchSectionIndex } from "../_components/research-section-index";

export default function MainResearchPage() {
  return (
    <ResearchSectionIndex
      title="Main Research"
      description="Core research administration records."
      links={[
        { title: "Projects", description: "Research project records.", href: "/research/projects", icon: FlaskConical },
        { title: "Centers", description: "Research centers and institutes.", href: "/research/centers", icon: Building2 },
        { title: "Programs", description: "Research program records.", href: "/research/programs", icon: FlaskConical },
        { title: "Themes", description: "Research themes and classifications.", href: "/research/themes", icon: Leaf },
        { title: "Expertise Tags", description: "Research expertise classification tags.", href: "/research/expertise-tags", icon: Settings },
        { title: "Fundings", description: "Funding sources and funder records.", href: "/research/fundings", icon: HandCoins },
        { title: "Impact", description: "Research impact metrics.", href: "/research/impact", icon: Leaf },
        { title: "Publications", description: "Publication records.", href: "/research/publications", icon: BookOpen },
        { title: "Journals", description: "Publication venues and journals.", href: "/research/publications/journals", icon: BookOpen },
        { title: "Partnerships", description: "Partner organizations.", href: "/research/partnerships", icon: HeartHandshake },
        { title: "Donations", description: "Donation records.", href: "/research/donations", icon: HandCoins },
        { title: "Innovation", description: "Innovation and disclosure records.", href: "/research/innovations", icon: Lightbulb },
        { title: "Outputs", description: "Research outputs, datasets, tools, and publications support records.", href: "/research/outputs", icon: FileText },
        { title: "Reports", description: "Research report exports, standard reports, and report output workflows.", href: "/research/reports", icon: FileText },
      ]}
    />
  );
}
