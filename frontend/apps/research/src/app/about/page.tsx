import type { Metadata } from "next";
import Link from "next/link";
import type { ResearchGenericRecord } from "@ksu/api-client";
import {
  Building2,
  ClipboardList,
  Landmark,
  Mail,
  Scale,
  Users,
} from "lucide-react";
import {
  InstitutionalEmpty,
  InstitutionalPanel,
  ResearchInstitutionalHero,
} from "../../components/research-institutional";
import {
  Badge,
  ResearchSection,
  StatusMessage,
} from "../../components/research-ui";
import {
  compactText,
  formatLabel,
  getBoards,
} from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Research",
  description: "Research office, governance, and REIRM structure.",
};

const localLinks = [
  { label: "Research Offices", href: "#offices", icon: Building2 },
  { label: "Mandate", href: "#mandate", icon: ClipboardList },
  { label: "Governance", href: "#governance", icon: Landmark },
  { label: "Board Members", href: "#members", icon: Users },
];

const relatedLinks = [
  {
    label: "Research Team",
    href: "/team",
    description: "Find the people and offices supporting researchers.",
    icon: Users,
  },
  {
    label: "Expertise Directory",
    href: "/expertise",
    description: "Search for skills, themes, and research focus areas.",
    icon: Scale,
  },
  {
    label: "Research Services",
    href: "/services",
    description: "Review the support routes available to staff and partners.",
    icon: ClipboardList,
  },
  {
    label: "Contact REIRM",
    href: "/connect",
    description: "Start a research, partnership, or support conversation.",
    icon: Mail,
  },
];

export default async function AboutPage() {
  const [boards] = await Promise.all([
    getBoards(),
  ]);
  const errors = [boards.error].filter(Boolean);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchInstitutionalHero
        eyebrow="About REIRM"
        title="The public structure behind Kisii University research support."
        body="Research, Extension, Innovation and Resource Mobilization is presented here as an institutional service: offices, governance, mandate, leadership, and contact pathways."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        localLinks={localLinks}
        relatedLinks={relatedLinks}
        imageSrc="/images/research/research-about-hero.webp"
        imageAlt="Research office leadership and coordination at Kisii University"
        primaryAction={{ label: "Meet the team", href: "/team" }}
        secondaryAction={{ label: "Find expertise", href: "/expertise" }}
        facts={[
          { label: "Governance boards", value: boards.data.length },
          { label: "Department", value: "REIRM" },
        ]}
      />

      {errors.length > 0 ? (
        <section className="px-4 pt-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="mx-auto flex max-w-[1680px] flex-col gap-3">
            {errors.map((error) => (
              <StatusMessage key={error} tone="error">
                {error}
              </StatusMessage>
            ))}
          </div>
        </section>
      ) : null}

      <section className="px-4 pt-8 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto max-w-[1680px]">
          <StatusMessage tone="neutral">
            Research office records and board member details have moved to the main university service. Governance boards remain available below.
          </StatusMessage>
        </div>
      </section>

      <ResearchSection
        eyebrow="Governance"
        title="Boards and advisory structures"
        body="Governance records explain how oversight, advice, and approvals are organized around the research mandate."
        tone="white"
      >
        <div id="governance" className="flex flex-col gap-4">
          {boards.data.length > 0 ? (
            boards.data.map((board) => (
              <InstitutionalPanel key={board.id}>
                <div className="flex flex-wrap gap-2">
                  {board.board_type ? <Badge>{formatLabel(board.board_type)}</Badge> : null}
                  {board.status ? <Badge>{formatLabel(board.status)}</Badge> : null}
                </div>
                <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
                  {recordTitle(board)}
                </h3>
                {recordSummary(board) ? (
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {recordSummary(board)}
                  </p>
                ) : null}
              </InstitutionalPanel>
            ))
          ) : (
            <InstitutionalEmpty>
              No governance board records have been published yet.
            </InstitutionalEmpty>
          )}
        </div>
      </ResearchSection>
    </main>
  );
}

function recordTitle(record?: ResearchGenericRecord | null) {
  return (
    compactText(record?.name) ||
    compactText(record?.title) ||
    compactText(record?.display_name) ||
    compactText(record?.code) ||
    "Published record"
  );
}

function recordSummary(record?: ResearchGenericRecord | null) {
  return (
    compactText(record?.about) ||
    compactText(record?.mandate) ||
    compactText(record?.summary) ||
    compactText(record?.description) ||
    compactText(record?.functions) ||
    compactText(record?.services_summary)
  );
}

