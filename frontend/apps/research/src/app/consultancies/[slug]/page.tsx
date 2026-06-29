import Link from "next/link";
import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { researchServiceApi } from "@ksu/api-client";
import {
  ResearchDetailHero,
  ResearchDetailSidebar,
  ResearchRecordPanel,
} from "../../../components/research-detail";
import { ResearchSection, StatusMessage } from "../../../components/research-ui";
import {
  compactText,
  formatDate,
  generateSlugParams,
  getCenters,
  getConsultancyBySlug,
  getPartners,
} from "../../../lib/research-public-data";
import { getNarrativeSections, getRecordSummary, getRecordTitle } from "../../../lib/research-page-model";

export const revalidate = 300;

export async function generateStaticParams() {
  return generateSlugParams(researchServiceApi.consultancies.list);
}

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
  const title = getRecordTitle(consultancy, "Consultancy");
  const storySections = getNarrativeSections(consultancy, [
    { title: "Client challenge", fields: ["summary", "description", "client_need"] },
    { title: "How the team worked", fields: ["objectives", "methodology", "approach"] },
    { title: "What was delivered", fields: ["deliverables", "outputs", "outcomes"] },
    { title: "Public value", fields: ["impact", "public_value", "lessons_learned"] },
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero
        eyebrow="Consultancy"
        title={title}
        body={getRecordSummary(consultancy)}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Consultancies", href: "/consultancies" },
          { label: title },
        ]}
        labels={[consultancy.consultancy_type, consultancy.client_type, consultancy.status, consultancy.is_featured ? "featured" : null]}
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
        imageSrc="/images/research/research-about-hero.svg"
        imageAlt="Consultancy engagement profile and deliverables"
      />

      {[error, partners.error, centers.error].filter(Boolean).map((message, i) => (
        <section key={i} className="px-4 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1680px]">
            <StatusMessage tone="error">{message}</StatusMessage>
          </div>
        </section>
      ))}

      <ResearchSection
        eyebrow="Engagement Profile"
        title="Scope, methods, and public outcomes"
        body="Published fields are arranged into a consultancy story from client challenge to delivered public value."
        tone="white"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            <ConsultancyStory sections={storySections} />
            <ResearchRecordPanel title="Documents and outputs" records={documents} empty="No public consultancy documents are published yet." />
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
        eyebrow="Delivery Context"
        title="Partner, host center, team, and files"
        body="Linked public records appear only when the backend connects them to this consultancy."
      >
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
          <ContextCard title="Partner" record={partner} hrefBase="/partners" empty="No public partner is linked." />
          <ContextCard title="Center" record={center} hrefBase="/centers" empty="No public center is linked." />
          <ResearchRecordPanel title="Team" records={team} />
          <ResearchRecordPanel title="Documents" records={documents} />
        </div>
      </ResearchSection>
    </main>
  );
}

function ConsultancyStory({ sections }: { sections: Array<{ title: string; body: string }> }) {
  if (sections.length === 0) {
    return <StatusMessage>The consultancy story appears when challenge, method, deliverable, or impact fields are published.</StatusMessage>;
  }

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      {sections.map((section, index) => (
        <details key={section.title} className="group border-b border-slate-200 last:border-b-0" open={index === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-base font-semibold text-slate-950 transition hover:bg-slate-50">
            {section.title}
            <span className="text-primary transition group-open:rotate-45">+</span>
          </summary>
          <p className="px-5 pb-5 text-sm leading-7 text-slate-600">{section.body}</p>
        </details>
      ))}
    </section>
  );
}

function ContextCard({
  title,
  record,
  hrefBase,
  empty,
}: {
  title: string;
  record?: ResearchGenericRecord;
  hrefBase: string;
  empty: string;
}) {
  return (
    <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      {record ? (
        <>
          <h3 className="mt-4 text-base font-semibold text-slate-950">
            {record.slug ? (
              <Link href={`${hrefBase}/${record.slug}`} className="transition hover:text-primary">
                {getRecordTitle(record, title)}
              </Link>
            ) : (
              getRecordTitle(record, title)
            )}
          </h3>
          {getRecordSummary(record) ? (
            <p className="mt-2 text-sm leading-7 text-slate-600">{getRecordSummary(record)}</p>
          ) : null}
        </>
      ) : (
        <p className="mt-3 text-sm leading-7 text-slate-600">{empty}</p>
      )}
    </section>
  );
}

function formatMoney(value?: string | number | null, currency?: string | null) {
  if (value === null || value === undefined || value === "") return "";
  const amount = Number(value);
  if (Number.isNaN(amount)) return compactText(value);
  return `${currency ?? "KES"} ${new Intl.NumberFormat("en-KE").format(amount)}`;
}
