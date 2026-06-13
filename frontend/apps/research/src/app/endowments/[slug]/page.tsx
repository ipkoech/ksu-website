import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import {
  Badge,
  ResearchPageIntro,
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
      <ResearchPageIntro
        eyebrow="Endowment"
        title={fund.name ?? fund.title ?? "Endowment fund"}
        body={compactText(fund.purpose) || compactText(fund.description)}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Endowments", href: "/endowments" },
          { label: fund.name ?? fund.title ?? "Endowment" },
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
        body="Endowment pages publish information clearly without workflow complexity."
        tone="white"
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <TextPanel
              title="Purpose"
              fields={[
                ["Purpose", fund.purpose],
                ["Description", fund.description],
                ["Eligibility", fund.eligibility],
                ["Use guidelines", fund.use_guidelines],
              ]}
            />
            <TextPanel
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
              <Fact label="Principal amount" value={formatMoney(fund.principal_amount, fund.currency)} />
              <Fact label="Current value" value={formatMoney(fund.current_value, fund.currency)} />
              <Fact label="Annual distribution" value={formatMoney(fund.annual_distribution, fund.currency)} />
              <Fact label="Established" value={formatDate(fund.established_date)} />
              <Fact label="Contact" value={[fund.contact_name, fund.contact_email].map(compactText).filter(Boolean).join(" · ")} />
            </dl>
          </aside>
        </div>
      </ResearchSection>
    </main>
  );
}

function TextPanel({
  title,
  fields,
}: {
  title: string;
  fields: Array<[string, string | number | null | undefined]>;
}) {
  const entries = fields
    .map(([label, value]) => [label, compactText(value)] as const)
    .filter(([, value]) => value);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">
        {title}
      </h2>
      {entries.length > 0 ? (
        <div className="mt-4 space-y-4">
          {entries.map(([label, value]) => (
            <div key={label}>
              <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
              <p className="mt-1 whitespace-pre-line text-sm leading-7 text-slate-600">
                {value}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm leading-7 text-slate-600">
          This information has not been published yet.
        </p>
      )}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 break-words font-semibold text-slate-950">{value || "Not published"}</dd>
    </div>
  );
}

function formatMoney(value?: string | number | null, currency?: string | null) {
  if (value === null || value === undefined || value === "") return "";
  const amount = Number(value);
  if (Number.isNaN(amount)) return compactText(value);
  return `${currency ?? "KES"} ${new Intl.NumberFormat("en-KE").format(amount)}`;
}
