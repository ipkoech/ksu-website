import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import {
  ResearchDetailHero,
  ResearchDetailSidebar,
  ResearchRecordPanel,
  ResearchRelationshipCard,
  ResearchTextPanel,
} from "../../../components/research-detail";
import { ResearchSection, StatusMessage } from "../../../components/research-ui";
import {
  compactText,
  formatDate,
  getCenters,
  getConsultancyBySlug,
  getPartners,
} from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

export default async function ConsultancyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data, error } = await getConsultancyBySlug(slug);
  if (!data) notFound();

  const consultancy = data as ResearchGenericRecord;
  const [partners, centers] = await Promise.all([getPartners(), getCenters()]);
  const partner = partners.data.find((item) => item.id === consultancy.partner_id);
  const center = centers.data.find((item) => item.id === consultancy.center_id);
  const team = Array.isArray(consultancy.team_members)
    ? (consultancy.team_members as ResearchGenericRecord[])
    : [];
  const documents = Array.isArray(consultancy.documents)
    ? (consultancy.documents as ResearchGenericRecord[])
    : [];

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero
        eyebrow="Consultancy"
        title={consultancy.title ?? "Consultancy"}
        body={compactText(consultancy.summary) || compactText(consultancy.description)}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Consultancies", href: "/consultancies" },
          { label: consultancy.title ?? "Consultancy" },
        ]}
        labels={[consultancy.consultancy_type, consultancy.client_type, consultancy.status]}
        facts={[
          { label: "Client", value: consultancy.client_name },
          { label: "Value", value: formatMoney(consultancy.contract_value, consultancy.currency) },
          { label: "Start", value: formatDate(consultancy.start_date) },
          { label: "End", value: formatDate(consultancy.end_date) },
        ]}
        actions={[
          { label: "Back to consultancies", href: "/consultancies", variant: "secondary" },
          ...(partner?.slug ? [{ label: "View partner", href: `/partners/${partner.slug}` }] : []),
        ]}
        imageSrc="/images/research/registrar-reirm-imagegen.webp"
        imageAlt="Consultancy engagement profile and deliverables"
      />

      {[error, partners.error, centers.error].filter(Boolean).map((message) => (
        <section key={message} className="px-4 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1680px]">
            <StatusMessage tone="error">{message}</StatusMessage>
          </div>
        </section>
      ))}

      <ResearchSection
        eyebrow="Engagement Profile"
        title="Scope, methods, and public outcomes"
        body="Consultancy detail focuses on client needs, deliverables, outcomes, impact, and the university units involved."
        tone="white"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            <ResearchTextPanel
              title="Summary"
              fields={[
                ["Summary", consultancy.summary],
                ["Description", consultancy.description],
                ["Objectives", consultancy.objectives],
              ]}
            />
            <ResearchTextPanel
              title="Method, deliverables, and impact"
              fields={[
                ["Methodology", consultancy.methodology],
                ["Deliverables", consultancy.deliverables],
                ["Outcomes", consultancy.outcomes],
                ["Impact", consultancy.impact],
              ]}
            />
          </div>
          <ResearchDetailSidebar
            labels={[consultancy.consultancy_type ?? "consultancy", consultancy.client_type, consultancy.status]}
            facts={[
              { label: "Client", value: compactText(consultancy.client_name) },
              { label: "Value", value: formatMoney(consultancy.contract_value, consultancy.currency) },
              { label: "Start", value: formatDate(consultancy.start_date) },
              { label: "End", value: formatDate(consultancy.end_date) },
              { label: "Location", value: [consultancy.location, consultancy.country].map(compactText).filter(Boolean).join(" · ") },
            ]}
            actions={
              partner?.slug ? [{ label: "View partner", href: `/partners/${partner.slug}` }] : []
            }
          />
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Relationships"
        title="Partner, center, team, and documents"
        body="Related work is shown when linked public records are available."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <ResearchRelationshipCard title="Partner" record={partner} hrefBase="/partners" empty="No public partner is linked." />
          <ResearchRelationshipCard title="Center" record={center} hrefBase="/centers" empty="No public center is linked." />
          <ResearchRecordPanel title="Team" records={team} />
          <ResearchRecordPanel title="Documents" records={documents} />
        </div>
      </ResearchSection>
    </main>
  );
}

function formatMoney(value?: string | number | null, currency?: string | null) {
  if (value === null || value === undefined || value === "") return "";
  const amount = Number(value);
  if (Number.isNaN(amount)) return compactText(value);
  return `${currency ?? "KES"} ${new Intl.NumberFormat("en-KE").format(amount)}`;
}
