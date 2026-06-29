"use client";

import { BookOpen, FileText, GraduationCap, MessageSquare, UserCheck } from "lucide-react";
import { ResearchSectionIndex } from "../_components/research-section-index";
import { CapacityWorkspaceHeader } from "./_components/capacity-workspace";

export default function CapacityBuildingPage() {
  return (
    <div>
      <div className="p-4 sm:p-6">
        <CapacityWorkspaceHeader />
      </div>
      <ResearchSectionIndex
        title="Capacity Building"
        description="Training, mentorship, scholarships, and consultancy records."
        links={[
          { title: "Training Programs", description: "Workshops, courses, seminars, and bootcamps.", href: "/research/capacity/training", icon: GraduationCap },
          { title: "Mentorship Programs", description: "Research mentorship programs.", href: "/research/capacity/mentorship", icon: UserCheck },
          { title: "Mentorship Applications", description: "Mentor and mentee applications.", href: "/research/capacity/mentorship-applications", icon: FileText },
          { title: "Mentorship Matches", description: "Mentor and mentee pairings.", href: "/research/capacity/mentorship-matches", icon: UserCheck },
          { title: "Scholarships", description: "Research scholarship opportunities.", href: "/research/capacity/scholarships", icon: BookOpen },
          { title: "Scholarship Applications", description: "Scholarship application submissions.", href: "/research/capacity/scholarship-applications", icon: FileText },
          { title: "Consultancies", description: "Research consultancy engagements.", href: "/research/capacity/consultancies", icon: MessageSquare },
        ]}
      />
    </div>
  );
}
