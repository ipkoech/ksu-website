"use client";

import { BookOpen, BriefcaseBusiness, GraduationCap, School, Star, UserRound } from "lucide-react";
import { useState, type ReactNode } from "react";

type BioIcon = "profile" | "qualification" | "education" | "experience" | "skills" | "teaching";

const icons = {
  profile: UserRound,
  qualification: GraduationCap,
  education: BookOpen,
  experience: BriefcaseBusiness,
  skills: Star,
  teaching: School,
} as const;

export type BioSection = {
  id: string;
  label: string;
  icon: BioIcon;
  content: ReactNode;
};

export function BioSectionSwitcher({ sections }: { sections: BioSection[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const activeSection = sections.find((section) => section.id === activeId) ?? sections[0];

  if (!activeSection) return null;

  return (
    <div className="grid gap-6 xl:grid-cols-[230px_minmax(0,1fr)]">
      <nav aria-label="Profile overview" className="border-b border-border pb-4 xl:border-b-0 xl:border-r xl:pb-0 xl:pr-5">
        <div className="grid gap-1">
          {sections.map((section) => {
            const Icon = icons[section.icon];
            const active = section.id === activeSection.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveId(section.id)}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold transition-colors",
                  active
                    ? "bg-primary/[0.08] text-primary"
                    : "text-foreground hover:bg-primary/[0.08] hover:text-primary",
                ].join(" ")}
              >
                <Icon aria-hidden className="h-5 w-5 shrink-0" />
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      <div key={activeSection.id} className="min-w-0 animate-in fade-in duration-200">
        {activeSection.content}
      </div>
    </div>
  );
}
