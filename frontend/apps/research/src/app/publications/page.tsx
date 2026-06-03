import type { Metadata } from "next";
import {
  Badge,
  FilledBadge,
  ResearchHero,
  ResearchSection,
  StatusMessage,
} from "../../components/research-ui";
import {
  compactText,
  formatLabel,
  getPublications,
} from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Publications",
  description: "Browse Kisii University research publications and scholarly outputs.",
};

export default async function PublicationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const publications = await getPublications(params?.q);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchHero
        eyebrow="Publications"
        title="Scholarly outputs and open access records."
        body="Find journal articles, conference papers, reports, and books published through Kisii University research activity."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Research", href: "/" },
          { label: "Publications" },
        ]}
      />
      <ResearchSection
        eyebrow="Output Catalogue"
        title="Research publications"
        body="Publication records are served by the Research API with status, journal, DOI, and access metadata."
        tone="white"
      >
        {publications.error ? <StatusMessage tone="error">{publications.error}</StatusMessage> : null}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {publications.data.map((publication) => (
            <article
              key={publication.id}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap gap-2">
                <Badge>{formatLabel(publication.publication_type ?? "publication")}</Badge>
                {publication.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
              </div>
              <h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">
                {publication.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {[
                  publication.journal_name,
                  publication.year,
                ]
                  .map(compactText)
                  .filter(Boolean)
                  .join(" · ") || "Publication source details are being updated."}
              </p>
              {publication.doi ? (
                <p className="mt-5 rounded-md bg-slate-50 p-3 text-sm font-semibold text-slate-700">
                  DOI: {publication.doi}
                </p>
              ) : null}
            </article>
          ))}
        </div>
        {!publications.error && publications.data.length === 0 ? (
          <StatusMessage>No publication records matched this view.</StatusMessage>
        ) : null}
      </ResearchSection>
    </main>
  );
}
