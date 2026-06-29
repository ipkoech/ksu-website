"use client";

import { FileText, HandCoins, Settings, Users } from "lucide-react";
import { ResearchSectionIndex } from "../_components/research-section-index";
import { DonationsWorkspaceHeader } from "./_components/donations-workspace";

export default function ResearchDonationsPage() {
  return (
    <div>
      <div className="p-4 sm:p-6">
        <DonationsWorkspaceHeader />
      </div>
      <ResearchSectionIndex
        title="Donations"
        description="Donor profiles, gifts, impact records, giving stories, and donation settings."
        links={[
          { title: "Donation Records", description: "Donation payments and designations.", href: "/research/donations/records", icon: HandCoins },
          { title: "Donors", description: "Donor profiles and organizations.", href: "/research/donations/donors", icon: Users },
          { title: "Impacts", description: "Donor-funded impact records.", href: "/research/donations/impacts", icon: FileText },
          { title: "Stories", description: "Public donor stories and testimonials.", href: "/research/donations/stories", icon: FileText },
          { title: "Settings", description: "Donation configuration values.", href: "/research/donations/settings", icon: Settings },
        ]}
      />
    </div>
  );
}
