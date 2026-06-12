import type { Metadata } from "next";
import {
  Badge,
  FilledBadge,
  IconCard,
  ResearchPageIntro,
  ResearchSection,
  StatusMessage,
} from "../../components/research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
  getGrants,
} from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Funding",
  description: "Research grant opportunities and funding calls at Kisii University.",
};

export default async function FundingPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const grants = await getGrants(params?.q);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchPageIntro
        eyebrow="Funding"
        title="Grant calls and research support opportunities."
        body="Review open and featured funding opportunities, eligibility notes, funders, and application deadlines."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Research", href: "/" },
          { label: "Funding" },
        ]}
      />
      <ResearchSection
        eyebrow="Grant Registry"
        title="Funding opportunities"
        body="Grant records come directly from the Research service so public calls stay aligned with administrative records."
        tone="white"
      >
        {grants.error ? <StatusMessage tone="error">{grants.error}</StatusMessage> : null}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {grants.data.map((grant) => (
            <article
              key={grant.id}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap gap-2">
                <Badge>{formatLabel(grant.category ?? "research")}</Badge>
                <Badge>{formatLabel(grant.status ?? "open")}</Badge>
                {grant.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
              </div>
              <h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">
                {grant.slug ? (
                  <a href={`/funding/${grant.slug}`} className="transition hover:text-primary">
                    {grant.title}
                  </a>
                ) : (
                  grant.title
                )}
              </h2>
              {compactText(grant.summary) ? (
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {compactText(grant.summary)}
                </p>
              ) : null}
              <dl className="mt-5 grid gap-3 text-sm">
                {grant.funder_name ? (
                  <div className="rounded-md bg-slate-50 p-3">
                    <dt className="text-xs font-semibold uppercase text-slate-500">Funder</dt>
                    <dd className="mt-1 font-semibold text-slate-950">
                      {grant.funder_name}
                    </dd>
                  </div>
                ) : null}
                {grant.deadline ? (
                  <div className="rounded-md bg-slate-50 p-3">
                    <dt className="text-xs font-semibold uppercase text-slate-500">Deadline</dt>
                    <dd className="mt-1 font-semibold text-slate-950">
                      {formatDate(grant.deadline)}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </article>
          ))}
        </div>
      </ResearchSection>
      <ResearchSection
        eyebrow="Funding & Grants"
        title="Grant support model"
        body="The funding page covers major awards, internal calls, funder records, and partner-backed funding models."
      >
        <div className="grid gap-5 md:grid-cols-3">
          <IconCard
            icon="award"
            title="Major grants awarded"
            body="Use featured and awarded grant records to highlight institutional funding success."
          />
          <IconCard
            icon="book"
            title="Internal funding opportunities"
            body="Publish internal calls, guidelines, reviews, and reports through the grants and resource endpoints."
            href="/resources-tools"
            action="Open resources"
          />
          <IconCard
            icon="handshake"
            title="Partnership funding models"
            body="Connect industry, foundation, and donor-backed funding routes to partnership inquiries."
            href="/partners"
            action="View partners"
          />
        </div>
      </ResearchSection>
    </main>
  );
}
