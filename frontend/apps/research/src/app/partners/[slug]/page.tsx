import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import type { ResearchGenericRecord } from "@ksu/api-client/server";
import { ArrowRight, ExternalLink, Handshake, Mail, Phone } from "lucide-react";
import { Badge, FilledBadge, StatusMessage } from "../../../components/research-ui";
import { ResearchStoryAccordion } from "../../../components/research-rich-text";
import {
  compactText,
  formatDate,
  formatLabel,
  getPartnerBySlug,
  getPartnerRelationshipBundle,
} from "../../../lib/research-public-data";
import { getNarrativeSections, getRecordSummary, getRecordTitle } from "../../../lib/research-page-model";

import { researchRecordMetadata } from "../../../lib/research-metadata";
import {
  PartnerRelationshipsDisplay,
  type PartnerRelationshipGroupDto,
} from "../../../components/partner-relationships-display";

export const revalidate = 300;
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data } = await getPartnerBySlug(slug);
  return researchRecordMetadata(data, { fallbackTitle: "Partner", pathname: "/partners/" + slug });
}

export default async function PartnerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data, error } = await getPartnerBySlug(slug);
  if (!data) notFound();

  const partner = data as ResearchGenericRecord;
  const bundle = await getPartnerRelationshipBundle(String(partner.id));
  const title = getRecordTitle(partner, "Research partner");
  const storySections = getNarrativeSections(partner, [
    { title: "Who they are", fields: ["about", "description", "summary"] },
    { title: "Where collaboration happens", fields: ["collaboration_areas", "focus_areas"] },
    { title: "What has changed", fields: ["key_achievements", "impact", "outcomes"] },
    { title: "Engagement window", fields: ["partnership_start", "partnership_end", "mou_signed_date", "mou_expiry_date"] },
  ]);
  const errors = error ? [error] : [];
  const relationshipGroups: PartnerRelationshipGroupDto[] = [
    ["Projects", "/projects", bundle.projects.data],
    ["Startups", "/startups", bundle.startups.data],
    ["Incubation records", "/incubation", bundle.incubationRecords.data],
    ["Technology transfer", "/technology-transfer", bundle.technologyTransferCases.data],
    ["Consultancies", "/consultancies", bundle.consultancies.data],
    ["Competitions", "/competitions", bundle.competitionEntries.data],
    ["Sustainability", "/sustainability", bundle.sustainability.data],
    ["Impact stories", "/community-impact", bundle.impactStories.data],
    ["Activities", "/events", bundle.activities.data],
    ["Impact metrics", "/impact-metrics", bundle.impactMetrics.data],
  ].map(([groupTitle, hrefBase, records]) => ({
    title: groupTitle as string,
    records: (records as ResearchGenericRecord[]).slice(0, 5).map((record, index) => ({
      id: String(record.id ?? record.slug ?? `${groupTitle}-${index}`),
      title: getRecordTitle(record, groupTitle as string),
      href: recordDetailRoutes.has(hrefBase as string) && record.slug ? `${hrefBase}/${record.slug}` : hrefBase as string,
      meta: relationshipMeta(record),
    })),
  }));

  return (
    <main id="research-main" className="min-h-screen bg-white text-foreground">
      <PartnerDetailHero partner={partner} title={title} bundle={bundle} />

      {errors.length > 0 ? (
        <section className="px-4 pt-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="mx-auto max-w-[1680px]">
            {errors.map((message) => (
              <div key={message} className="mb-3">
                <StatusMessage tone="error">{message}</StatusMessage>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--surface-subtle))_48%,hsl(var(--background))_100%)] px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto grid max-w-[1680px] gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
              <div className="mb-4">
                <p className="text-sm font-semibold uppercase tracking-eyebrow text-secondary">Partnership story</p>
                <h2 className="mt-2 font-display text-xl font-semibold text-foreground">Collaboration profile</h2>
              </div>
              <ResearchStoryAccordion
                sections={storySections}
                empty="This partner profile will show story sections when collaboration, achievement, or timeline fields are published."
              />
            </section>

            <section className="mt-5 rounded-lg border border-border bg-white p-5 shadow-sm">
              <div className="mb-4">
                <p className="text-sm font-semibold uppercase tracking-eyebrow text-secondary">Linked work</p>
                <h2 className="mt-2 font-display text-xl font-semibold text-foreground">Work with Kisii University</h2>
              </div>
              <PartnerRelationshipsDisplay groups={relationshipGroups} />
            </section>
          </div>

          <PartnerFactsSidebar partner={partner} />
        </div>
      </section>
    </main>
  );
}

function PartnerDetailHero({
  partner,
  title,
  bundle,
}: {
  partner: ResearchGenericRecord;
  title: string;
  bundle: Awaited<ReturnType<typeof getPartnerRelationshipBundle>>;
}) {
  const logo = compactText(partner.logo_url);
  const body = getRecordSummary(partner) || compactText(partner.collaboration_areas) || compactText(partner.about);
  const facts = [
    { label: "Projects", value: bundle.projects.data.length },
    { label: "Startups", value: bundle.startups.data.length },
    { label: "Transfer cases", value: bundle.technologyTransferCases.data.length },
    { label: "Consultancies", value: bundle.consultancies.data.length },
    { label: "Stories", value: bundle.impactStories.data.length },
  ].filter((fact) => fact.value > 0);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-[hsl(var(--brand-overlay))] px-4 py-7 text-white sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(115deg,hsl(var(--brand-overlay))_0%,hsl(var(--primary)/.82)_48%,hsl(var(--primary)/.62)_100%)]" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:42px_42px] opacity-60" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--brand-overlay))]/95 via-[hsl(var(--brand-overlay))]/70 to-[hsl(var(--brand-overlay))]/20" />
        <div className="relative mx-auto grid min-h-[230px] max-w-[1680px] gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
          <div className="min-w-0">
            <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-white/70">
              <Link href="/" className="transition hover:text-white">Home</Link>
              <span>/</span>
              <Link href="/partners" className="transition hover:text-white">Partners</Link>
              <span>/</span>
              <span aria-current="page" className="text-white">{title}</span>
            </nav>
            <div className="flex flex-wrap gap-2">
              {partner.partner_type ? <Badge>{formatLabel(partner.partner_type)}</Badge> : null}
              {partner.partnership_level ? <Badge>{formatLabel(partner.partnership_level)}</Badge> : null}
              {partner.status ? <FilledBadge>{formatLabel(partner.status)}</FilledBadge> : null}
            </div>
            <h1 className="mt-4 max-w-4xl font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">{title}</h1>
            {body ? <p className="mt-3 max-w-3xl text-base leading-7 text-white/90">{body}</p> : null}
            <div className="mt-5 flex flex-wrap gap-3">
              {compactText(partner.website) ? <HeroButton href={compactText(partner.website)} primary>Open website</HeroButton> : null}
              <HeroButton href="/connect#partnership">Contact research office</HeroButton>
              <HeroButton href="/partners">Back to partners</HeroButton>
            </div>
          </div>
          <div className="hidden rounded-lg border border-white/25 bg-white/10 p-5 backdrop-blur lg:block">
            {logo ? (
              <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-md bg-white p-3">
                <Image src={logo} alt={`${title} logo`} fill sizes="128px" className="object-contain p-3" />
              </div>
            ) : (
              <div className="mx-auto grid h-32 w-32 place-items-center rounded-md bg-white/15 text-3xl font-semibold text-white">{title.slice(0, 2).toUpperCase()}</div>
            )}
            <p className="mt-4 text-center text-sm font-semibold text-white/85">{compactText(partner.country) || "Research partner"}</p>
          </div>
        </div>
      </section>
      {facts.length > 0 ? (
        <section className="border-b border-border bg-white px-4 py-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <dl className="mx-auto grid max-w-[1680px] gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {facts.map((fact) => (
              <div key={fact.label} className="rounded-md border border-border bg-surface-subtle px-3 py-2">
                <dt className="text-[11px] font-semibold uppercase text-muted-foreground">{fact.label}</dt>
                <dd className="mt-1 text-lg font-semibold text-primary">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </>
  );
}

function HeroButton({ href, primary = false, children }: { href: string; primary?: boolean; children: ReactNode }) {
  return (
    <a
      href={href}
      className={
        primary
          ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
          : "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
      }
    >
      {children}
      {href.startsWith("http") ? <ExternalLink aria-hidden className="h-4 w-4" /> : <ArrowRight aria-hidden className="h-4 w-4" />}
    </a>
  );
}

const recordDetailRoutes = new Set([
  "/projects",
  "/consultancies",
  "/sustainability",
  "/events",
  "/innovations",
  "/outputs",
  "/publications",
]);

function PartnerFactsSidebar({ partner }: { partner: ResearchGenericRecord }) {
  const facts = [
    { label: "Country", value: compactText(partner.country) },
    { label: "Website", value: compactText(partner.website) },
    { label: "Email", value: compactText(partner.email) },
    { label: "Phone", value: compactText(partner.phone) },
    { label: "Contact person", value: [partner.contact_person_name, partner.contact_person_title].map(compactText).filter(Boolean).join(" · ") },
    { label: "Partnership start", value: formatDate(partner.partnership_start) },
    { label: "MOU signed", value: formatDate(partner.mou_signed_date) },
    { label: "MOU expiry", value: formatDate(partner.mou_expiry_date) },
  ].filter((fact) => fact.value);

  return (
    <aside className="grid gap-4 xl:sticky xl:top-24">
      <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <h2 className="font-display text-xl font-semibold text-foreground">Partner facts</h2>
        {facts.length > 0 ? (
          <dl className="mt-3 divide-y divide-border">
            {facts.map((fact) => (
              <div key={fact.label} className="grid grid-cols-[112px_minmax(0,1fr)] gap-3 py-3 text-sm">
                <dt className="font-semibold text-muted-foreground">{fact.label}</dt>
                <dd className="break-words font-semibold text-foreground [overflow-wrap:anywhere]">{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Public partner facts are not published yet.</p>
        )}
      </section>

      <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <h2 className="font-display text-xl font-semibold text-foreground">Quick paths</h2>
        <div className="mt-2 divide-y divide-border">
          {[
            { href: "/partners/how-to-partner", label: "How to partner" },
            { href: "/partners/stories", label: "Case studies" },
            { href: "/partners", label: "Partner directory" },
          ].map((link) => (
            <Link key={link.href} href={link.href} className="group flex items-center justify-between gap-3 py-3 text-sm font-semibold text-primary underline-offset-4 hover:underline">
              {link.label}
              <ArrowRight aria-hidden className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-primary/20 bg-accent/70 p-5 shadow-sm">
        <Handshake aria-hidden className="h-7 w-7 text-primary" />
        <h2 className="mt-3 font-display text-xl font-semibold text-foreground">Engage this partner pathway</h2>
        <div className="mt-3 grid gap-2 text-sm font-semibold text-primary">
          {compactText(partner.email) ? (
            <a href={`mailto:${compactText(partner.email)}`} className="inline-flex items-center gap-2">
              <Mail aria-hidden className="h-4 w-4" />
              Email partner
            </a>
          ) : null}
          {compactText(partner.phone) ? (
            <a href={`tel:${compactText(partner.phone)}`} className="inline-flex items-center gap-2">
              <Phone aria-hidden className="h-4 w-4" />
              Call partner
            </a>
          ) : null}
          <Link href="/connect#partnership" className="inline-flex items-center gap-2">
            Contact research office
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </aside>
  );
}

function relationshipMeta(record: ResearchGenericRecord) {
  return [
    formatLabel(record.project_type),
    formatLabel(record.consultancy_type),
    formatLabel(record.venture_stage),
    formatLabel(record.case_type),
    formatLabel(record.entry_status),
    formatLabel(record.status),
    formatDate(record.start_date),
    formatDate(record.event_date),
    formatDate(record.agreement_date),
  ].filter(Boolean).slice(0, 2).join(" · ");
}
