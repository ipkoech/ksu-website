import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import {
  ResearchDetailHero,
  ResearchDetailSidebar,
  ResearchTextPanel,
} from "../../../components/research-detail";
import { ResearchSection, StatusMessage } from "../../../components/research-ui";
import {
  compactText,
  formatDate,
  getEndowmentBySlug,
} from "../../../lib/research-public-data";

export const revalidate = 300;

export default async function EndowmentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data, error } = await getEndowmentBySlug(slug);
  if (!data) notFound();

  const fund = data as ResearchGenericRecord;

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero
        eyebrow="Endowment"
        title={fund.name ?? fund.title ?? "Endowment fund"}
        body={compactText(fund.purpose) || compactText(fund.description)}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Endowments", href: "/endowments" },
          { label: fund.name ?? fund.title ?? "Endowment" },
        ]}
        labels={[fund.fund_type, fund.status, fund.is_accepting_contributions ? "accepting contributions" : null]}
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
        body="Endowment pages publish information clearly without workflow complexity."
        tone="white"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            <ResearchTextPanel
              title="Purpose"
              fields={[
                ["Purpose", fund.purpose],
                ["Description", fund.description],
                ["Eligibility", fund.eligibility],
                ["Use guidelines", fund.use_guidelines],
              ]}
            />
            <ResearchTextPanel
              title="Donor message"
              fields={[
                ["Donor", fund.donor_name],
                ["Message", fund.donor_message],
              ]}
            />
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

function formatMoney(value?: string | number | null, currency?: string | null) {
  if (value === null || value === undefined || value === "") return "";
  const amount = Number(value);
  if (Number.isNaN(amount)) return compactText(value);
  return `${currency ?? "KES"} ${new Intl.NumberFormat("en-KE").format(amount)}`;
}
