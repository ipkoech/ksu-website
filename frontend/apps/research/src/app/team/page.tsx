import type { Metadata } from "next";
import { Building2, Contact, Mail, Search } from "lucide-react";
import type { InstitutionalLink } from "../../components/research-institutional";
import {
  ResearchInstitutionalHero,
} from "../../components/research-institutional";
import {
  StatusMessage,
} from "../../components/research-ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Research Team",
  description: "Research office staff and contact directory.",
};

const localLinks: InstitutionalLink[] = [];

const relatedLinks = [
  {
    label: "About Research",
    href: "/about",
    description: "Understand office structure and governance.",
    icon: Building2,
  },
  {
    label: "Expertise Directory",
    href: "/expertise",
    description: "Search specialists by skill, focus area, and theme.",
    icon: Search,
  },
  {
    label: "Research Services",
    href: "/services",
    description: "Find support routes for research work.",
    icon: Contact,
  },
  {
    label: "Contact REIRM",
    href: "/connect",
    description: "Send a public enquiry to the research office.",
    icon: Mail,
  },
];

export default async function TeamPage() {

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchInstitutionalHero
        eyebrow="Research Team"
        title="Find the people and offices that support research work."
        body="The team directory presents office staff records as a public service directory for researchers, students, partners, and funders."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Team" }]}
        localLinks={localLinks}
        relatedLinks={relatedLinks}
        imageSrc="/images/research/research-projects-hero.svg"
        imageAlt="Kisii University research staff coordinating project support"
        primaryAction={{ label: "Search expertise", href: "/expertise" }}
        secondaryAction={{ label: "Contact REIRM", href: "/connect" }}
        facts={[
          { label: "Research staff", value: "Main Service" },
          { label: "Department", value: "REIRM" },
          { label: "Contact", value: "Public" },
        ]}
      />

      <section className="px-4 pt-16 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto flex max-w-[1680px] flex-col gap-3">
          <StatusMessage tone="neutral">
            Research team records are now managed through the main university directory. Visit the university staff directory for the latest research team information.
          </StatusMessage>
        </div>
      </section>
    </main>
  );
}
