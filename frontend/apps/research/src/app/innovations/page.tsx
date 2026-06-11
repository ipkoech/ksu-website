import type { Metadata } from "next";
import {
  Badge,
  FilledBadge,
  IconCard,
  ResearchHero,
  ResearchSection,
  StatusMessage,
} from "../../components/research-ui";
import {
  compactText,
  formatLabel,
  getInnovations,
} from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Innovations",
  description: "Research innovations, prototypes, software, and technology transfer outputs.",
};

export default async function InnovationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const innovations = await getInnovations(params?.q);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchHero
        eyebrow="Innovations"
        title="Research translated into tools, prototypes, and public value."
        body="Explore innovations, intellectual property status, commercialization stages, and practical applications."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Research", href: "/" },
          { label: "Innovations" },
        ]}
      />
      <ResearchSection
        eyebrow="Technology Transfer"
        title="Innovation portfolio"
        body="These records exercise the Research service innovation endpoints and public visibility controls."
        tone="white"
      >
        {innovations.error ? <StatusMessage tone="error">{innovations.error}</StatusMessage> : null}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {innovations.data.map((innovation) => (
            <article
              key={innovation.id}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap gap-2">
                <Badge>{formatLabel(innovation.innovation_type ?? "innovation")}</Badge>
                <Badge>{formatLabel(innovation.commercialization_status ?? innovation.status)}</Badge>
                {innovation.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
              </div>
              <h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">
                {innovation.title}
              </h2>
              {compactText(innovation.summary) || compactText(innovation.problem_addressed) ? (
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {compactText(innovation.summary) || compactText(innovation.problem_addressed)}
                </p>
              ) : null}
              {innovation.trl_level ? (
                <p className="mt-5 rounded-md bg-slate-50 p-3 text-sm font-semibold text-slate-700">
                  Technology readiness level {innovation.trl_level}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </ResearchSection>
      <ResearchSection
        eyebrow="Startups & Entrepreneurship"
        title="Commercialization pathways"
        body="The public innovation page now covers licensing, invention disclosure, startup support, competitions, and ecosystem storytelling."
      >
        <div className="grid gap-5 md:grid-cols-3">
          <IconCard
            icon="lightbulb"
            title="Technology transfer"
            body="Show available technologies, patent status, licensing opportunities, and invention disclosure guidance."
          />
          <IconCard
            icon="target"
            title="Startups and competitions"
            body="Promote incubator access, accelerator pathways, affiliated startups, and student innovation challenges."
          />
          <IconCard
            icon="handshake"
            title="Innovation ecosystem"
            body="Connect partner networks, commercialization stories, and industry collaboration opportunities."
            href="/partners"
            action="Open partners"
          />
        </div>
      </ResearchSection>
    </main>
  );
}
