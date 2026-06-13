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
  getConsultanciesFiltered,
  getPartnerBySlug,
} from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

export default async function PartnerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data, error } = await getPartnerBySlug(slug);
  if (!data) notFound();

  const partner = data as ResearchGenericRecord;
  const consultancies = await getConsultanciesFiltered({ partnerId: partner.id });

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero
        eyebrow="Research Partner"
        title={partner.name ?? "Research partner"}
        body={compactText(partner.about) || compactText(partner.collaboration_areas)}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Partners", href: "/partners" },
          { label: partner.name ?? "Partner" },
        ]}
        labels={[partner.partner_type, partner.partnership_level, partner.status]}
        facts={[
          { label: "Country", value: partner.country },
          { label: "Start", value: formatDate(partner.partnership_start) },
          { label: "MOU expiry", value: formatDate(partner.mou_expiry_date) },
          { label: "Engagements", value: consultancies.data.length },
        ]}
        actions={[
          { label: "Back to partners", href: "/partners", variant: "secondary" },
          ...(compactText(partner.website) ? [{ label: "Open website", href: compactText(partner.website) }] : []),
        ]}
        imageSrc="/images/research/innovation-partnerships.png"
        imageAlt="Research partner profile and collaboration context"
      />

      {[error, consultancies.error].filter(Boolean).map((message) => (
        <section key={message} className="px-4 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1680px]">
            <StatusMessage tone="error">{message}</StatusMessage>
          </div>
        </section>
      ))}

      <ResearchSection
        eyebrow="Partner Profile"
        title="Collaboration profile"
        body="Partner profiles show what the organization supports, how they collaborate, and where public engagement records exist."
        tone="white"
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <TextPanel
              title="About"
              fields={[
                ["About", partner.about],
                ["Collaboration areas", partner.collaboration_areas],
                ["Key achievements", partner.key_achievements],
              ]}
            />
            <TextPanel
              title="Partnership timeline"
              fields={[
                ["Partnership start", formatDate(partner.partnership_start)],
                ["Partnership end", formatDate(partner.partnership_end)],
                ["MOU signed", formatDate(partner.mou_signed_date)],
                ["MOU expiry", formatDate(partner.mou_expiry_date)],
              ]}
            />
          </div>
          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <Badge>{formatLabel(partner.partner_type ?? "partner")}</Badge>
              {partner.partnership_level ? <Badge>{formatLabel(partner.partnership_level)}</Badge> : null}
              {partner.status ? <Badge>{formatLabel(partner.status)}</Badge> : null}
            </div>
            <dl className="mt-5 grid gap-3 text-sm">
              <Fact label="Country" value={compactText(partner.country)} />
              <Fact label="Website" value={compactText(partner.website)} />
              <Fact label="Email" value={compactText(partner.email)} />
              <Fact label="Phone" value={compactText(partner.phone)} />
              <Fact label="Contact person" value={[partner.contact_person_name, partner.contact_person_title].map(compactText).filter(Boolean).join(" · ")} />
            </dl>
          </aside>
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Partner Activity"
        title="What this partner supports"
        body="Linked records are shown when they are directly represented in the backend API."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <RecordPanel
            title="Consultancies and engagements"
            records={consultancies.data}
            hrefBase="/consultancies"
            empty="No public consultancy records are linked to this partner yet."
          />
          <TextPanel
            title="Documents and links"
            fields={[
              ["Partner document", partner.document_url],
              ["Website", partner.website],
              ["Address", partner.address],
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

function RecordPanel({
  title,
  records,
  hrefBase,
  empty,
}: {
  title: string;
  records: ResearchGenericRecord[];
  hrefBase: string;
  empty: string;
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
                compactText(record.description) ||
                compactText(record.impact) ||
                "Additional details are not published yet."}
            </p>
          </article>
        ))}
        {records.length === 0 ? <p className="py-4 text-sm text-slate-600">{empty}</p> : null}
      </div>
    </section>
  );
}
