"use client";

import { FileText, HandCoins, MessageSquare, ShieldCheck } from "lucide-react";
import { ResearchSectionIndex } from "../_components/research-section-index";

export default function ResearchFundingsPage() {
  return (
    <ResearchSectionIndex
      title="Fundings"
      description="Grant opportunities, funders, applications, reviews, reports, guidelines, and endowments."
      links={[
        { title: "Funders", description: "Funding sources and sponsor records.", href: "/research/fundings/funders", icon: HandCoins },
        { title: "Grants", description: "Grant opportunities and calls.", href: "/research/grants", icon: HandCoins },
        { title: "Applications", description: "Grant application submissions.", href: "/research/fundings/applications", icon: FileText },
        { title: "Reviews", description: "Application review scores and decisions.", href: "/research/fundings/reviews", icon: ShieldCheck },
        { title: "Reports", description: "Grant progress and final reports.", href: "/research/fundings/reports", icon: FileText },
        { title: "Guidelines", description: "Grant procedures and requirements.", href: "/research/fundings/guidelines", icon: MessageSquare },
        { title: "Endowments", description: "Endowment funds and recurring support.", href: "/research/fundings/endowments", icon: HandCoins },
      ]}
    />
  );
}
