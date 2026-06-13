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
  formatLabel,
  getFarmActivities,
  getFarmBySlug,
  getFarmPartners,
  getFarmProjects,
} from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

export default async function FarmDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data, error } = await getFarmBySlug(slug);
  if (!data) notFound();

  const farm = data as ResearchGenericRecord;
  const center = farm.center as ResearchGenericRecord | undefined;
  const [projects, partners, activities] = await Promise.all([
    getFarmProjects(),
    getFarmPartners(),
    getFarmActivities(),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchPageIntro
        eyebrow="University Farm"
        title={farm.name ?? farm.title ?? "University farm"}
        body={compactText(farm.about) || compactText(farm.activities)}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "University Farm", href: "/farm" },
          { label: farm.name ?? farm.title ?? "Farm" },
        ]}
      />

      {[error, projects.error, partners.error, activities.error]
        .filter(Boolean)
        .map((message) => (
          <section key={message} className="px-4 pt-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1680px]">
              <StatusMessage tone="error">{message}</StatusMessage>
            </div>
          </section>
        ))}

      <ResearchSection
        eyebrow="Farm Profile"
        title="Applied research, demonstration, and extension"
        body="Farm records describe the facilities, activities, products, capacity, contact points, and center relationship."
        tone="white"
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <TextPanel
              title="About the farm"
              fields={[
                ["About", farm.about],
                ["Activities", farm.activities],
                ["Products", farm.products],
                ["Facilities", farm.facilities],
                ["Capacity", farm.capacity_info],
              ]}
            />
          </div>
          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <Badge>{formatLabel(farm.farm_type ?? "farm")}</Badge>
              {farm.status ? <Badge>{formatLabel(farm.status)}</Badge> : null}
            </div>
            <dl className="mt-5 grid gap-3 text-sm">
              <Fact label="Size" value={farm.size_hectares ? `${compactText(farm.size_hectares)} hectares` : ""} />
              <Fact label="Location" value={compactText(farm.location) || compactText(farm.county)} />
              <Fact label="Manager" value={compactText(farm.manager_name)} />
              <Fact label="Email" value={compactText(farm.email)} />
              <Fact label="Phone" value={compactText(farm.phone)} />
            </dl>
            {center ? (
              <div className="mt-5 rounded-md bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase text-slate-500">Connected center</p>
                <Link
                  href={center.slug ? `/centers/${center.slug}` : "/centers"}
                  className="mt-1 block font-semibold text-primary"
                >
                  {center.name ?? center.title}
                </Link>
              </div>
            ) : null}
          </aside>
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Farm Network"
        title="Projects, partners, and public activities"
        body="These records show how the farm connects to research work and community engagement."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <RecordPanel title="Farm-linked projects" records={projects.data} hrefBase="/projects" />
          <RecordPanel title="Partners" records={partners.data} hrefBase="/partners" />
          <RecordPanel title="Activities" records={activities.data} hrefBase="/events" />
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
