import type { Metadata } from "next";
import {
  Badge,
  IconCard,
  ResearchPageIntro,
  ResearchSection,
  StatusMessage,
} from "../../components/research-ui";
import {
  compactText,
  formatLabel,
  getImpactMetrics,
  getStories,
  getSustainability,
} from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Impact & Metrics",
  description: "Research impact dashboard, metrics, success stories, and downloadable reports.",
};

export default async function ImpactMetricsPage() {
  const [metrics, stories, sustainability] = await Promise.all([
    getImpactMetrics(),
    getStories(),
    getSustainability(),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchPageIntro
        eyebrow="Impact & Metrics"
        title="A public dashboard for research outcomes."
        body="Monitor research funding, outputs, patents, startups, jobs, success stories, and partner-facing reports."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Research", href: "/" },
          { label: "Impact & Metrics" },
        ]}
      />
      <ResearchSection
        eyebrow="Impact Dashboard"
        title="Live metrics from the Research service"
        body="Impact metric records can represent funding, publications, patents, startups, jobs, community reach, and partner return on investment."
        tone="white"
      >
        {metrics.error ? <StatusMessage tone="error">{metrics.error}</StatusMessage> : null}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.data.map((metric) => (
            <article key={metric.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
                {formatLabel(metric.category ?? metric.metric_type ?? "metric")}
              </p>
              <p className="mt-4 text-4xl font-bold text-slate-950">
                {metric.value}
                {metric.unit ? <span className="text-2xl">{metric.unit}</span> : null}
              </p>
              <h2 className="mt-3 text-base font-semibold leading-6 text-slate-950">
                {metric.title ?? metric.name ?? metric.label}
              </h2>
              {compactText(metric.description) ? (
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {compactText(metric.description)}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </ResearchSection>
      <ResearchSection
        eyebrow="Success Stories"
        title="Narratives behind the numbers"
        body="Impact and sustainability stories provide the qualitative evidence that complements the dashboard."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[...stories.data, ...sustainability.data].map((record) => (
            <article key={record.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <Badge>{formatLabel(record.story_type ?? record.initiative_type ?? "story")}</Badge>
              <h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">
                {record.title ?? record.name}
              </h2>
              {compactText(record.summary) || compactText(record.description) ? (
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {compactText(record.summary) || compactText(record.description)}
                </p>
              ) : null}
            </article>
          ))}
        </div>
        {[stories.error, sustainability.error].filter(Boolean).map((error, index) => (
          <div key={`${error}-${index}`} className="mt-4">
            <StatusMessage tone="error">{error}</StatusMessage>
          </div>
        ))}
      </ResearchSection>
      <ResearchSection
        eyebrow="Download Reports"
        title="Reports partners expect"
        body="The report surface should host annual impact reports, economic contribution studies, and ROI summaries."
        tone="white"
      >
        <div className="grid gap-5 md:grid-cols-3">
          <IconCard
            icon="book"
            title="Annual impact reports"
            body="Publish annual research performance, funding, outputs, and community impact summaries."
            href="/resources-tools"
            action="Open library"
          />
          <IconCard
            icon="target"
            title="Economic contribution studies"
            body="Place regional economic value, jobs, and social contribution reports in the resource library."
            href="/resources-tools"
            action="Find studies"
          />
          <IconCard
            icon="handshake"
            title="Partner ROI reports"
            body="Provide partner-specific evidence packs for research, talent, and philanthropic collaborations."
            href="/connect#partnership"
            action="Request report"
          />
        </div>
      </ResearchSection>
    </main>
  );
}
