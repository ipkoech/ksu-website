import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { researchServiceApi } from "@ksu/api-client";
import { ResearchSection, StatusMessage } from "../../../components/research-ui";
import { ResearchStoryAccordion } from "../../../components/research-rich-text";
import {
  compactText,
  formatDate,
  generateSlugParams,
  getEndowmentBySlug,
} from "../../../lib/research-public-data";
import { getNarrativeSections, getRecordSummary, getRecordTitle } from "../../../lib/research-page-model";
import {
  CompactFactGrid,
  FundingIllustratedHero,
  FundingSidebar,
  formatMoney,
  fundingIcons,
} from "../../../components/funding-ui";

import { researchRecordMetadata } from "../../../lib/research-metadata";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data } = await getEndowmentBySlug(slug);
  return researchRecordMetadata(data, { fallbackTitle: "Endowment fund", pathname: "/endowments/" + slug });
}

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
      <FundingIllustratedHero
        eyebrow="Endowment"
        title={title}
        body={compactText(fund.purpose) || getRecordSummary(fund)}
        tone="endowment"
        facts={[
          { label: "Current value", value: formatMoney(fund.current_value, compactText(fund.currency) || "KES"), icon: fundingIcons.money },
          { label: "Annual distribution", value: formatMoney(fund.annual_distribution, compactText(fund.currency) || "KES"), icon: fundingIcons.award },
          { label: "Established", value: formatDate(fund.established_date), icon: fundingIcons.calendar },
          { label: "Donor", value: fund.donor_name, icon: fundingIcons.bank },
        ]}
        actions={[
          { label: "Back to endowments", href: "/endowments", variant: "secondary" },
          ...(compactText(fund.contribution_url) ? [{ label: "Contribute", href: compactText(fund.contribution_url) }] : []),
        ]}
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
            <CompactFactGrid
              facts={[
                { label: "Principal amount", value: formatMoney(fund.principal_amount, compactText(fund.currency) || "KES"), icon: fundingIcons.money },
                { label: "Current value", value: formatMoney(fund.current_value, compactText(fund.currency) || "KES"), icon: fundingIcons.money },
                { label: "Target value", value: formatMoney(fund.target_value, compactText(fund.currency) || "KES"), icon: fundingIcons.award },
                { label: "Annual distribution", value: formatMoney(fund.annual_distribution, compactText(fund.currency) || "KES"), icon: fundingIcons.check },
              ]}
            />
            <EndowmentStory sections={storySections} />
          </div>
          <FundingSidebar
            title="Fund facts"
            labels={[fund.fund_type ?? "fund", fund.status, fund.is_accepting_contributions ? "Accepting contributions" : null]}
            facts={[
              { label: "Principal amount", value: formatMoney(fund.principal_amount, compactText(fund.currency) || "KES") },
              { label: "Current value", value: formatMoney(fund.current_value, compactText(fund.currency) || "KES") },
              { label: "Annual distribution", value: formatMoney(fund.annual_distribution, compactText(fund.currency) || "KES") },
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
  return (
    <ResearchStoryAccordion
      sections={sections}
      empty="The fund story appears when purpose, eligibility, use, or donor fields are published."
    />
  );
}
