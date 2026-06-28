import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import {
  ResearchDetailHero,
  ResearchDetailSidebar,
  ResearchRecordPanel,
  ResearchTextPanel,
} from "../../../components/research-detail";
import { ResearchSection, StatusMessage } from "../../../components/research-ui";
import {
  compactText,
  formatDate,
  getConsultanciesFiltered,
  getPartnerBySlug,
} from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

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

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero
        eyebrow="Research Partner"
        title={partner.name ?? "Research partner"}
        body={compactText(partner.about) || compactText(partner.collaboration_areas)}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Partners", href: "/partners" },
          { label: partner.name ?? "Partner" },
        ]}
        labels={[partner.partner_type, partner.partnership_level, partner.status]}
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

      {[error, consultancies.error].filter(Boolean).map((message) => (
        <section key={message} className="px-4 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1680px]">
            <StatusMessage tone="error">{message}</StatusMessage>
          </div>
        </section>
      ))}

      <ResearchSection
        eyebrow="Partner Profile"
        title="Collaboration profile"
        body="Partner profiles show what the organization supports, how they collaborate, and where public engagement records exist."
        tone="white"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            <ResearchTextPanel
              title="About"
              fields={[
                ["About", partner.about],
                ["Collaboration areas", partner.collaboration_areas],
                ["Key achievements", partner.key_achievements],
              ]}
            />
            <ResearchTextPanel
              title="Partnership timeline"
              fields={[
                ["Partnership start", formatDate(partner.partnership_start)],
                ["Partnership end", formatDate(partner.partnership_end)],
                ["MOU signed", formatDate(partner.mou_signed_date)],
                ["MOU expiry", formatDate(partner.mou_expiry_date)],
              ]}
            />
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
          <ResearchTextPanel
            title="Documents and links"
            fields={[
              ["Partner document", partner.document_url],
              ["Website", partner.website],
              ["Address", partner.address],
            ]}
          />
        </div>
      </ResearchSection>
    </main>
  );
}
