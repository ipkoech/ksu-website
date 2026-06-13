import { notFound } from "next/navigation";
import Link from "next/link";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchDetailHero } from "../../../components/research-detail";
import {
  Badge,
  ResearchSection,
  StatusMessage,
} from "../../../components/research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
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
        imageSrc="/images/research/registrar-reirm-imagegen.png"
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
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <TextPanel
              title="Summary"
              fields={[
                ["Summary", consultancy.summary],
                ["Description", consultancy.description],
                ["Objectives", consultancy.objectives],
              ]}
            />
            <TextPanel
              title="Method, deliverables, and impact"
              fields={[
                ["Methodology", consultancy.methodology],
                ["Deliverables", consultancy.deliverables],
                ["Outcomes", consultancy.outcomes],
                ["Impact", consultancy.impact],
              ]}
            />
          </div>
          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <Badge>{formatLabel(consultancy.consultancy_type ?? "consultancy")}</Badge>
              {consultancy.client_type ? <Badge>{formatLabel(consultancy.client_type)}</Badge> : null}
              {consultancy.status ? <Badge>{formatLabel(consultancy.status)}</Badge> : null}
            </div>
            <dl className="mt-5 grid gap-3 text-sm">
              <Fact label="Client" value={compactText(consultancy.client_name)} />
              <Fact label="Value" value={formatMoney(consultancy.contract_value, consultancy.currency)} />
              <Fact label="Start" value={formatDate(consultancy.start_date)} />
              <Fact label="End" value={formatDate(consultancy.end_date)} />
              <Fact label="Location" value={[consultancy.location, consultancy.country].map(compactText).filter(Boolean).join(" · ")} />
            </dl>
          </aside>
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Relationships"
        title="Partner, center, team, and documents"
        body="Related records are shown when the public API exposes linked IDs or embedded lists."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <RelationshipCard title="Partner" record={partner} hrefBase="/partners" empty="No public partner is linked." />
          <RelationshipCard title="Center" record={center} hrefBase="/centers" empty="No public center is linked." />
          <RecordPanel title="Team" records={team} />
          <RecordPanel title="Documents" records={documents} />
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

function RelationshipCard({
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
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      {record ? (
        <>
          <h3 className="mt-4 text-base font-semibold text-slate-950">
            {record.slug ? (
              <Link href={`${hrefBase}/${record.slug}`} className="transition hover:text-primary">
                {record.name ?? record.title}
              </Link>
            ) : (
              record.name ?? record.title
            )}
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            {compactText(record.about) ||
              compactText(record.summary) ||
              compactText(record.description) ||
              "Additional relationship details are not published yet."}
          </p>
        </>
      ) : (
        <p className="mt-3 text-sm leading-7 text-slate-600">{empty}</p>
      )}
    </section>
  );
}

function RecordPanel({ title, records }: { title: string; records: ResearchGenericRecord[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      <div className="mt-4 divide-y divide-slate-200">
        {records.slice(0, 6).map((record, index) => {
          const href = compactText(record.document_url) || compactText(record.url) || compactText(record.file_url);
          return (
            <article key={record.id ?? `${title}-${index}`} className="py-4 first:pt-0 last:pb-0">
              <h3 className="text-base font-semibold text-slate-950">
                {record.title ?? record.name ?? record.full_name ?? record.document_name ?? `Record ${index + 1}`}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {compactText(record.role) ||
                  compactText(record.summary) ||
                  compactText(record.description) ||
                  "Additional details are not published yet."}
              </p>
              {href ? (
                <a href={href} className="mt-2 inline-flex text-sm font-semibold text-primary">
                  Download
                </a>
              ) : null}
            </article>
          );
        })}
        {records.length === 0 ? (
          <p className="py-4 text-sm text-slate-600">No public records are linked yet.</p>
        ) : null}
      </div>
    </section>
  );
}

function formatMoney(value?: string | number | null, currency?: string | null) {
  if (value === null || value === undefined || value === "") return "";
  const amount = Number(value);
  if (Number.isNaN(amount)) return compactText(value);
  return `${currency ?? "KES"} ${new Intl.NumberFormat("en-KE").format(amount)}`;
}
