import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import {
  ResearchDetailHero,
  ResearchFact,
  ResearchTextPanel,
} from "../../../components/research-detail";
import {
  Badge,
  ResearchSection,
  StatusMessage,
} from "../../../components/research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
  getEndowmentBySlug,
} from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

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
        imageSrc="/images/research/research-demo-imagegen.png"
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
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
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
          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <Badge>{formatLabel(fund.fund_type ?? "fund")}</Badge>
              {fund.status ? <Badge>{formatLabel(fund.status)}</Badge> : null}
              {fund.is_accepting_contributions ? <Badge>Accepting contributions</Badge> : null}
            </div>
            <dl className="mt-5 grid gap-3 text-sm">
              <ResearchFact label="Principal amount" value={formatMoney(fund.principal_amount, fund.currency)} />
              <ResearchFact label="Current value" value={formatMoney(fund.current_value, fund.currency)} />
              <ResearchFact label="Annual distribution" value={formatMoney(fund.annual_distribution, fund.currency)} />
              <ResearchFact label="Established" value={formatDate(fund.established_date)} />
              <ResearchFact label="Contact" value={[fund.contact_name, fund.contact_email].map(compactText).filter(Boolean).join(" · ")} />
            </dl>
          </aside>
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
