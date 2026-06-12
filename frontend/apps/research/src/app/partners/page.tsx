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
  formatLabel,
  getPartners,
} from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Research Partners",
  description: "Research partners and collaboration networks at Kisii University.",
};

export default async function PartnersPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const partners = await getPartners(params?.q);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchPageIntro
        eyebrow="Partners"
        title="Academic, industry, community, and funder collaborations."
        body="See the partner network supporting Kisii University research, innovation, and capacity building."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Research", href: "/" },
          { label: "Partners" },
        ]}
      />
      <ResearchSection
        eyebrow="Collaboration"
        title="Research partners"
        body="Partner profiles are loaded from the Research service with active status and featured ordering."
        tone="white"
      >
        {partners.error ? <StatusMessage tone="error">{partners.error}</StatusMessage> : null}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {partners.data.map((partner) => (
            <article
              key={partner.id}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap gap-2">
                <Badge>{formatLabel(partner.partner_type ?? "partner")}</Badge>
                <Badge>{formatLabel(partner.partnership_level ?? partner.status)}</Badge>
                {partner.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
              </div>
              <h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">
                {partner.slug ? (
                  <a href={`/partners/${partner.slug}`} className="transition hover:text-primary">
                    {partner.name}
                  </a>
                ) : (
                  partner.name
                )}
              </h2>
              {compactText(partner.about) || compactText(partner.collaboration_areas) ? (
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {compactText(partner.about) || compactText(partner.collaboration_areas)}
                </p>
              ) : null}
              {partner.country ? (
                <p className="mt-5 rounded-md bg-slate-50 p-3 text-sm font-semibold text-slate-700">
                  {compactText(partner.country)}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </ResearchSection>
      <ResearchSection
        eyebrow="For Industry Partners"
        title="How to partner with Kisii University"
        body="Partnership guidance is organized around research collaboration, talent pipelines, and philanthropic support."
      >
        <div id="how-to-partner" className="grid gap-5 md:grid-cols-3">
          <IconCard
            icon="flask"
            title="Research partnerships"
            body="Define a challenge, identify experts or centers, agree scope and data terms, then launch joint work."
            href="/connect#partnership"
            action="Start inquiry"
          />
          <IconCard
            icon="users"
            title="Talent partnerships"
            body="Build student projects, internships, mentorship, training, and graduate talent pipelines."
            href="/capacity"
            action="View capacity"
          />
          <IconCard
            icon="award"
            title="Philanthropic partnerships"
            body="Support facilities, scholarships, innovation funds, community work, and endowed programmes."
            href="/connect#donate"
            action="Donate"
          />
        </div>
      </ResearchSection>
      <ResearchSection
        eyebrow="Research Capacity Development"
        title="Training and talent pipeline initiatives"
        body="Partners can sponsor customized training, professional development, and research talent pipelines."
        tone="white"
      >
        <div className="grid gap-5 md:grid-cols-3">
          <IconCard
            icon="book"
            title="Customized training"
            body="Package research methods, sector-specific evidence use, ethics, data, and innovation training for partners."
          />
          <IconCard
            icon="target"
            title="Professional development"
            body="Create professional development tracks for researchers, practitioners, and technical teams."
          />
          <IconCard
            icon="handshake"
            title="Partner showcase"
            body="Use featured partner records for case studies, testimonials, and corporate collaboration stories."
          />
        </div>
      </ResearchSection>
    </main>
  );
}
