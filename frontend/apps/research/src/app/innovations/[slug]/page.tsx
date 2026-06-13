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
  getInnovationBySlug,
  getProjects,
  getRelatedOutputs,
} from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

export default async function InnovationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data, error } = await getInnovationBySlug(slug);
  if (!data) notFound();

  const innovation = data as ResearchGenericRecord;
  const [projects, centers, outputs] = await Promise.all([
    getProjects(),
    getCenters(),
    innovation.project_id
      ? getRelatedOutputs({ projectId: innovation.project_id })
      : Promise.resolve({ data: [], error: null }),
  ]);
  const project = projects.data.find((item) => item.id === innovation.project_id);
  const center = centers.data.find((item) => item.id === innovation.center_id);
  const inventors = Array.isArray(innovation.inventors)
    ? (innovation.inventors as ResearchGenericRecord[])
    : [];
  const awards = Array.isArray(innovation.awards)
    ? (innovation.awards as ResearchGenericRecord[])
    : [];

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero
        eyebrow="Innovation"
        title={innovation.title ?? "Innovation"}
        body={compactText(innovation.summary) || compactText(innovation.problem_addressed)}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Innovations", href: "/innovations" },
          { label: innovation.title ?? "Innovation" },
        ]}
        labels={[innovation.innovation_type, innovation.development_stage, innovation.status]}
        facts={[
          { label: "TRL", value: innovation.trl_level ? `TRL ${innovation.trl_level}` : "" },
          { label: "IP status", value: formatLabel(innovation.ip_status) },
          { label: "Commercialization", value: formatLabel(innovation.commercialization_status) },
          { label: "Outputs", value: outputs.data.length },
        ]}
        actions={[
          { label: "Back to innovations", href: "/innovations", variant: "secondary" },
          ...(project?.slug ? [{ label: "View project", href: `/projects/${project.slug}` }] : []),
        ]}
        imageSrc="/images/research/innovation-partnerships.png"
        imageAlt="Innovation profile with readiness, intellectual property, and adoption context"
      />

      {[error, projects.error, centers.error, outputs.error]
        .filter(Boolean)
        .map((message) => (
          <section key={message} className="px-4 pt-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1680px]">
              <StatusMessage tone="error">{message}</StatusMessage>
            </div>
          </section>
        ))}

      <ResearchSection
        eyebrow="Innovation Profile"
        title="Problem, solution, and adoption pathway"
        body="Innovation detail uses public labels for technology readiness, IP position, commercialization, inventors, and outputs."
        tone="white"
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <TextPanel
              title="Problem and solution"
              fields={[
                ["Problem addressed", innovation.problem_addressed],
                ["Solution", innovation.solution],
                ["Benefits", innovation.benefits],
                ["Applications", innovation.applications],
                ["Target users", innovation.target_users],
              ]}
            />
            <TextPanel
              title="Description"
              fields={[
                ["Summary", innovation.summary],
                ["Description", innovation.description],
              ]}
            />
          </div>
          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <Badge>{formatLabel(innovation.innovation_type ?? "innovation")}</Badge>
              {innovation.development_stage ? <Badge>{formatLabel(innovation.development_stage)}</Badge> : null}
              {innovation.status ? <Badge>{formatLabel(innovation.status)}</Badge> : null}
            </div>
            <dl className="mt-5 grid gap-3 text-sm">
              <Fact label="Technology readiness" value={innovation.trl_level ? `TRL ${innovation.trl_level}` : ""} />
              <Fact label="IP status" value={formatLabel(innovation.ip_status)} />
              <Fact label="Commercialization" value={formatLabel(innovation.commercialization_status)} />
              <Fact label="Patent" value={compactText(innovation.patent_number)} />
              <Fact label="Invention date" value={formatDate(innovation.invention_date)} />
            </dl>
          </aside>
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Relationships"
        title="Research context, sponsors, and outputs"
        body="Relationships are resolved from backend records where the public API exposes linked IDs."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <RelationshipCard
            title="Source project"
            record={project}
            hrefBase="/projects"
            empty="No public project is linked to this innovation."
          />
          <RelationshipCard
            title="Connected center"
            record={center}
            hrefBase="/centers"
            empty="No public center is linked to this innovation."
          />
          <RecordPanel title="Related outputs" records={outputs.data} hrefBase="/outputs" />
          <RecordPanel title="Inventors" records={inventors} />
          <RecordPanel title="Awards" records={awards} />
          <TextPanel
            title="Commercial notes"
            fields={[
              ["License type", innovation.license_type],
              ["Commercial value", formatMoney(innovation.commercial_value, innovation.currency)],
              ["Revenue generated", formatMoney(innovation.revenue_generated, innovation.currency)],
              ["Video", innovation.video_url],
            ]}
          />
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
              <p className="mt-1 break-words whitespace-pre-line text-sm leading-7 text-slate-600">
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
                {record.title ?? record.name}
              </Link>
            ) : (
              record.title ?? record.name
            )}
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            {compactText(record.summary) ||
              compactText(record.about) ||
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

function RecordPanel({
  title,
  records,
  hrefBase,
}: {
  title: string;
  records: ResearchGenericRecord[];
  hrefBase?: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      <div className="mt-4 divide-y divide-slate-200">
        {records.slice(0, 6).map((record, index) => (
          <article key={record.id ?? `${title}-${index}`} className="py-4 first:pt-0 last:pb-0">
            <h3 className="text-base font-semibold text-slate-950">
              {hrefBase && record.slug ? (
                <Link href={`${hrefBase}/${record.slug}`} className="transition hover:text-primary">
                  {record.title ?? record.name}
                </Link>
              ) : (
                record.title ?? record.name ?? record.full_name ?? record.award_name ?? `Record ${index + 1}`
              )}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {compactText(record.summary) ||
                compactText(record.description) ||
                compactText(record.role) ||
                compactText(record.organization) ||
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

function formatMoney(value?: string | number | null, currency?: string | null) {
  if (value === null || value === undefined || value === "") return "";
  const amount = Number(value);
  if (Number.isNaN(amount)) return compactText(value);
  return `${currency ?? "KES"} ${new Intl.NumberFormat("en-KE").format(amount)}`;
}
