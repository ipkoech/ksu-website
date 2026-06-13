import { notFound } from "next/navigation";
import Link from "next/link";
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
  getRelatedOutputs,
  getSustainabilityActivities,
  getSustainabilityBySlug,
  getSustainabilityPartners,
} from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

export default async function SustainabilityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data, error } = await getSustainabilityBySlug(slug);
  if (!data) notFound();

  const initiative = data as ResearchGenericRecord;
  const [partners, activities, outputs] = await Promise.all([
    getSustainabilityPartners(),
    getSustainabilityActivities(),
    initiative.project_id ? getRelatedOutputs({ projectId: initiative.project_id }) : Promise.resolve({ data: [], error: null }),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchPageIntro
        eyebrow="Sustainability"
        title={initiative.name ?? initiative.title ?? "Sustainability initiative"}
        body={compactText(initiative.summary) || compactText(initiative.description)}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Sustainability", href: "/sustainability" },
          { label: initiative.name ?? initiative.title ?? "Initiative" },
        ]}
      />

      {[error, partners.error, activities.error, outputs.error]
        .filter(Boolean)
        .map((message) => (
          <section key={message} className="px-4 pt-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1680px]">
              <StatusMessage tone="error">{message}</StatusMessage>
            </div>
          </section>
        ))}

      <ResearchSection
        eyebrow="Initiative Profile"
        title="Sustainability focus and public value"
        body="Sustainability details describe objectives, approach, activities, impact, SDG alignment, and public contact points."
        tone="white"
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <TextPanel
              title="Overview"
              fields={[
                ["Summary", initiative.summary],
                ["Description", initiative.description],
                ["Objectives", initiative.objectives],
              ]}
            />
            <TextPanel
              title="Approach and impact"
              fields={[
                ["Approach", initiative.approach],
                ["Activities", initiative.activities],
                ["Impact", initiative.impact],
                ["SDG goals", Array.isArray(initiative.sdg_goals) ? initiative.sdg_goals.join(", ") : initiative.sdg_goals],
              ]}
            />
          </div>
          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <Badge>{formatLabel(initiative.initiative_type ?? "sustainability")}</Badge>
              {initiative.status ? <Badge>{formatLabel(initiative.status)}</Badge> : null}
            </div>
            <dl className="mt-5 grid gap-3 text-sm">
              <Fact label="Start" value={formatDate(initiative.start_date)} />
              <Fact label="End" value={formatDate(initiative.end_date)} />
              <Fact label="Contact" value={compactText(initiative.contact_email)} />
              <Fact label="Website" value={compactText(initiative.website)} />
            </dl>
          </aside>
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Delivery Network"
        title="Partners, activities, and outputs"
        body="Related records show who participates and what public outputs are available."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <RecordPanel title="Partners" records={partners.data} hrefBase="/partners" />
          <RecordPanel title="Activities" records={activities.data} hrefBase="/events" />
          <RecordPanel title="Outputs" records={outputs.data} hrefBase="/outputs" />
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
      <dd className="mt-1 break-words font-semibold text-slate-950">
        {value || "Not published"}
      </dd>
    </div>
  );
}

function RecordPanel({
  title,
  records,
  hrefBase,
}: {
  title: string;
  records: Array<Record<string, any>>;
  hrefBase: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      <div className="mt-4 divide-y divide-slate-200">
        {records.slice(0, 6).map((record) => (
          <article key={record.id} className="py-4 first:pt-0 last:pb-0">
            <h3 className="text-base font-semibold text-slate-950">
              {record.slug ? (
                <Link href={`${hrefBase}/${record.slug}`} className="transition hover:text-primary">
                  {record.title ?? record.name}
                </Link>
              ) : (
                record.title ?? record.name
              )}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {compactText(record.summary) ||
                compactText(record.about) ||
                compactText(record.description) ||
                "Additional details are not published yet."}
            </p>
          </article>
        ))}
        {records.length === 0 ? (
          <p className="py-4 text-sm text-slate-600">No public records are linked yet.</p>
        ) : null}
      </div>
    </section>
  );
}
