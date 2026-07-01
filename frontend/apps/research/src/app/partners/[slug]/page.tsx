import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { researchServiceApi } from "@ksu/api-client";
import {
  ResearchDetailHero,
  ResearchDetailSidebar,
  ResearchRecordPanel,
} from "../../../components/research-detail";
import { ResearchSection, StatusMessage } from "../../../components/research-ui";
import { ResearchStoryAccordion } from "../../../components/research-rich-text";
import {
  compactText,
  formatDate,
  generateSlugParams,
  getConsultanciesFiltered,
  getPartnerBySlug,
} from "../../../lib/research-public-data";
import { getNarrativeSections, getRecordSummary, getRecordTitle } from "../../../lib/research-page-model";

export const revalidate = 300;

export async function generateStaticParams() {
  return generateSlugParams(researchServiceApi.partners.list);
}

export default async function PartnerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data, error } = await getPartnerBySlug(slug);
  if (!data) notFound();

  const partner = data as ResearchGenericRecord;
  const consultancies = await getConsultanciesFiltered({ partnerId: partner.id });
  const title = getRecordTitle(partner, "Research partner");
  const storySections = getNarrativeSections(partner, [
    { title: "Who they are", fields: ["about", "description", "summary"] },
    { title: "Where collaboration happens", fields: ["collaboration_areas", "focus_areas"] },
    { title: "What has changed", fields: ["key_achievements", "impact", "outcomes"] },
    { title: "Engagement window", fields: ["partnership_start", "partnership_end", "mou_expiry_date"] },
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero
        eyebrow="Research Partner"
        title={title}
        body={getRecordSummary(partner) || compactText(partner.collaboration_areas)}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Partners", href: "/partners" },
          { label: title },
        ]}
        labels={[partner.partner_type, partner.partnership_level, partner.status, partner.is_featured ? "featured" : null]}
        facts={[
          { label: "Country", value: partner.country },
          { label: "Start", value: formatDate(partner.partnership_start) },
          { label: "MOU expiry", value: formatDate(partner.mou_expiry_date) },
          { label: "Engagements", value: consultancies.data.length },
        ]}
        actions={[
          { label: "Back to partners", href: "/partners", variant: "secondary" },
          ...(compactText(partner.website) ? [{ label: "Open website", href: compactText(partner.website) }] : []),
        ]}
        imageSrc="/images/research/research-innovation-hero.svg"
        imageAlt="Research partner profile and collaboration context"
      />

      {[error, consultancies.error].filter(Boolean).map((message, i) => (
        <section key={i} className="px-4 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1680px]">
            <StatusMessage tone="error">{message}</StatusMessage>
          </div>
        </section>
      ))}

      <ResearchSection
        eyebrow="Partner Profile"
        title="Collaboration profile"
        body="Published partner fields are grouped into a profile story about identity, collaboration areas, achievements, and engagement window."
        tone="white"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            <PartnerStory sections={storySections} />
            <ResearchRecordPanel title="Consultancies and engagements" records={consultancies.data} hrefBase="/consultancies" empty="No public consultancy records are linked to this partner yet." />
          </div>
          <ResearchDetailSidebar
            labels={[partner.partner_type ?? "partner", partner.partnership_level, partner.status]}
            facts={[
              { label: "Country", value: compactText(partner.country) },
              { label: "Website", value: compactText(partner.website) },
              { label: "Email", value: compactText(partner.email) },
              { label: "Phone", value: compactText(partner.phone) },
              { label: "Contact person", value: [partner.contact_person_name, partner.contact_person_title].map(compactText).filter(Boolean).join(" · ") },
            ]}
            actions={
              compactText(partner.website)
                ? [{ label: "Open partner website", href: compactText(partner.website) }]
                : []
            }
          />
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Partner Activity"
        title="What this partner supports"
        body="Linked work is shown when related public records are available."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <ResearchRecordPanel
            title="Consultancies and engagements"
            records={consultancies.data}
            hrefBase="/consultancies"
            empty="No public consultancy records are linked to this partner yet."
          />
          <InfoPanel title="Documents and links" fields={[["Partner document", partner.document_url], ["Website", partner.website], ["Address", partner.address]]} />
        </div>
      </ResearchSection>
    </main>
  );
}

function PartnerStory({ sections }: { sections: Array<{ title: string; body: string }> }) {
  return (
    <ResearchStoryAccordion
      sections={sections}
      empty="The partner story appears when profile, collaboration, achievement, or timeline fields are published."
    />
  );
}

function InfoPanel({ title, fields }: { title: string; fields: Array<[string, unknown]> }) {
  const entries = fields.map(([label, value]) => [label, compactText(value as string | number | null | undefined)] as const).filter(([, value]) => value);

  return (
    <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      {entries.length ? (
        <dl className="mt-4 grid gap-3 text-sm">
          {entries.map(([label, value]) => <div key={label} className="rounded-md bg-slate-50 p-3"><dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt><dd className="mt-1 break-words font-semibold text-slate-950">{value}</dd></div>)}
        </dl>
      ) : <p className="mt-3 text-sm leading-7 text-slate-600">No public details are published yet.</p>}
    </section>
  );
}
