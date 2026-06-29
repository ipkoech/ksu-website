import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { researchServiceApi } from "@ksu/api-client";
import {
  ResearchDetailHero,
  ResearchDetailSidebar,
} from "../../../components/research-detail";
import { ResearchSection, StatusMessage } from "../../../components/research-ui";
import {
  compactText,
  formatDate,
  generateSlugParams,
  getEndowmentBySlug,
} from "../../../lib/research-public-data";
import { getNarrativeSections, getRecordSummary, getRecordTitle } from "../../../lib/research-page-model";

export const revalidate = 300;

export async function generateStaticParams() {
  return generateSlugParams(researchServiceApi.endowments.list);
}

export default async function EndowmentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data, error } = await getEndowmentBySlug(slug);
  if (!data) notFound();

  const fund = data as ResearchGenericRecord;
  const title = getRecordTitle(fund, "Endowment fund");
  const storySections = getNarrativeSections(fund, [
    { title: "Purpose of the fund", fields: ["purpose", "description", "summary"] },
    { title: "Who it supports", fields: ["eligibility", "beneficiaries", "target_beneficiaries"] },
    { title: "How funds are used", fields: ["use_guidelines", "distribution_policy", "annual_distribution_notes"] },
    { title: "Donor story", fields: ["donor_message", "donor_background", "recognition_notes"] },
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero
        eyebrow="Endowment"
        title={title}
        body={compactText(fund.purpose) || getRecordSummary(fund)}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Endowments", href: "/endowments" },
          { label: title },
        ]}
        labels={[fund.fund_type, fund.status, fund.is_accepting_contributions ? "accepting contributions" : null, fund.is_featured ? "featured" : null]}
        facts={[
          { label: "Current value", value: formatMoney(fund.current_value, fund.currency) },
          { label: "Annual distribution", value: formatMoney(fund.annual_distribution, fund.currency) },
          { label: "Established", value: formatDate(fund.established_date) },
          { label: "Donor", value: fund.donor_name },
        ]}
        actions={[
          { label: "Back to endowments", href: "/endowments", variant: "secondary" },
          ...(compactText(fund.contribution_url) ? [{ label: "Contribute", href: compactText(fund.contribution_url) }] : []),
        ]}
        imageSrc="/images/research/research-projects-hero.svg"
        imageAlt="Research endowment fund purpose and contribution information"
      />

      {error ? (
        <section className="px-4 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1680px]">
            <StatusMessage tone="error">{error}</StatusMessage>
          </div>
        </section>
      ) : null}

      <ResearchSection
        eyebrow="Fund Information"
        title="Purpose, eligibility, and contribution status"
        body="Published fund fields are arranged into a compact story about purpose, beneficiaries, fund use, and donor context."
        tone="white"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            <EndowmentStory sections={storySections} />
          </div>
          <ResearchDetailSidebar
            labels={[fund.fund_type ?? "fund", fund.status, fund.is_accepting_contributions ? "Accepting contributions" : null]}
            facts={[
              { label: "Principal amount", value: formatMoney(fund.principal_amount, fund.currency) },
              { label: "Current value", value: formatMoney(fund.current_value, fund.currency) },
              { label: "Annual distribution", value: formatMoney(fund.annual_distribution, fund.currency) },
              { label: "Established", value: formatDate(fund.established_date) },
              { label: "Contact", value: [fund.contact_name, fund.contact_email].map(compactText).filter(Boolean).join(" · ") },
            ]}
            actions={
              compactText(fund.contribution_url)
                ? [{ label: "Contribute", href: compactText(fund.contribution_url) }]
                : []
            }
          />
        </div>
      </ResearchSection>
    </main>
  );
}

function EndowmentStory({ sections }: { sections: Array<{ title: string; body: string }> }) {
  if (sections.length === 0) {
    return <StatusMessage>The fund story appears when purpose, eligibility, use, or donor fields are published.</StatusMessage>;
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

function formatMoney(value?: string | number | null, currency?: string | null) {
  if (value === null || value === undefined || value === "") return "";
  const amount = Number(value);
  if (Number.isNaN(amount)) return compactText(value);
  return `${currency ?? "KES"} ${new Intl.NumberFormat("en-KE").format(amount)}`;
}
