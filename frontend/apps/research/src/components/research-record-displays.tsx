"use client";

import Link from "next/link";
import {
  ArrowRight,
  Handshake,
  Rocket,
  Trophy,
  UsersRound,
} from "lucide-react";
import { Badge, FilledBadge } from "./research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
  type ResearchRecordDisplayDto,
} from "../lib/research-formatters";
export type { ResearchRecordDisplayDto } from "../lib/research-formatters";

function recordTitle(record: ResearchRecordDisplayDto, fallback: string) {
  return compactText(record.title) || compactText(record.name) || compactText(record.code) || fallback;
}

function recordSummary(record: ResearchRecordDisplayDto) {
  return (
    compactText(record.summary) ||
    compactText(record.description) ||
    compactText(record.about) ||
    compactText(record.abstract) ||
    compactText(record.mission) ||
    "Details will appear when published."
  );
}

export function CentersDisplay({
  centers,
}: {
  centers: ResearchRecordDisplayDto[];
}) {
  return (
    <div data-server-data-display="research-centers">
      {centers.length > 0 ? (
        <div className="mt-6 overflow-hidden rounded-lg border border-border bg-white shadow-sm">
          <div className="hidden grid-cols-[minmax(320px,1fr)_150px_150px] gap-4 border-b border-border bg-surface-subtle px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid">
            <span>Center</span><span>Type</span><span>Status</span>
          </div>
          <div className="divide-y divide-border">
            {centers.map((center) => {
              const href = center.slug ? `/centers/${center.slug}` : "/centers";
              const status = center.status
                ? formatLabel(center.status)
                : center.is_active === false
                  ? "Inactive"
                  : "Active";
              return (
                <Link key={center.id} href={href} className="group grid gap-2 px-4 py-3 transition hover:bg-surface-subtle/80 md:grid-cols-[minmax(320px,1fr)_150px_150px] md:items-center">
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold leading-6 text-foreground transition group-hover:text-primary">{recordTitle(center, "Research center")}</h2>
                    {center.code ? <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">{compactText(center.code)}</p> : null}
                  </div>
                  <div className="text-xs font-medium text-muted-foreground md:text-sm">{formatLabel(compactText(center.center_type) || "research center")}</div>
                  <div className="flex flex-wrap items-center gap-2"><Badge>{status}</Badge>{center.is_featured ? <FilledBadge>Featured</FilledBadge> : null}</div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : <div className="mt-7 rounded-lg border border-border bg-white p-5 text-sm text-muted-foreground">No published research centers match the current filters.</div>}
    </div>
  );
}

export function CenterFacilitiesDisplay({ facilities }: { facilities: ResearchRecordDisplayDto[] }) {
  return <div data-server-data-display="research-center-facilities" className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
    {facilities.slice(0, 8).map((facility) => (
      <Link key={facility.id} href={facility.slug ? `/farm/${facility.slug}` : "/farm"} className="rounded-lg border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
        <Badge>{formatLabel(compactText(facility.farm_type) || "facility")}</Badge>
        <h3 className="mt-3 text-base font-semibold leading-6 text-foreground">{recordTitle(facility, "Research facility")}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{recordSummary(facility)}</p>
      </Link>
    ))}
  </div>;
}

export function FacilitiesDisplay({
  facilities,
}: {
  facilities: ResearchRecordDisplayDto[];
}) {
  return (
    <div data-server-data-display="research-facilities">
      {facilities.length > 0 ? (
        <div className="mt-6 overflow-hidden rounded-lg border border-border bg-white shadow-sm">
          <div className="hidden grid-cols-[minmax(320px,1fr)_150px_150px] gap-4 border-b border-border bg-surface-subtle px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground md:grid"><span>Facility</span><span>Type</span><span>Status</span></div>
          <div className="divide-y divide-border">
            {facilities.map((facility) => <FacilityRow key={facility.id} facility={facility} />)}
          </div>
        </div>
      ) : <div className="mt-7 rounded-lg border border-border bg-white p-5 text-sm text-muted-foreground">No facilities match the current filters.</div>}
    </div>
  );
}

export function ServicesDisplay({ services }: { services: ResearchRecordDisplayDto[] }) {
  return <div data-server-data-display="research-facility-services" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
    {services.slice(0, 6).map((service) => (
      <Link key={service.id} href={service.slug ? `/services/${service.slug}` : "/services"} className="block rounded-lg border border-border bg-white p-5 shadow-sm transition hover:border-primary/30">
        <Badge>{formatLabel(service.service_type ?? service.type ?? "service")}</Badge>
        <h3 className="mt-4 text-xl font-semibold text-foreground">{recordTitle(service, "Research service")}</h3>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">{recordSummary(service)}</p>
        <p className="mt-5 rounded-md bg-surface-subtle p-3 text-sm font-semibold text-muted-foreground">{compactText(service.turnaround_time) || compactText(service.contact_email) || "Access details not published"}</p>
      </Link>
    ))}
  </div>;
}

function FacilityRow({ facility }: { facility: ResearchRecordDisplayDto }) {
  const href = facility.slug ? `/farm/${facility.slug}` : "/farm";
  return (
    <Link href={href} className="group grid gap-2 px-4 py-3 transition hover:bg-surface-subtle/80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 md:grid-cols-[minmax(320px,1fr)_150px_150px] md:items-center">
      <div className="min-w-0"><h2 className="truncate text-sm font-semibold leading-6 text-foreground transition group-hover:text-primary">{recordTitle(facility, "Research facility")}</h2>{facility.code ? <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">{compactText(facility.code)}</p> : null}</div>
      <div className="text-xs font-medium text-muted-foreground md:text-sm">{formatLabel(compactText(facility.farm_type) || "facility")}</div>
      <div className="flex flex-wrap items-center gap-2"><Badge>{formatLabel(compactText(facility.status) || (facility.is_active === false ? "inactive" : "active"))}</Badge>{facility.is_featured ? <FilledBadge>Featured</FilledBadge> : null}</div>
    </Link>
  );
}

export function ProgramsDisplay({ programs }: { programs: ResearchRecordDisplayDto[] }) {
  return (
    <div data-server-data-display="research-programs">
      <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
        <div className="hidden grid-cols-[minmax(320px,1fr)_150px_150px] gap-4 border-b border-border bg-surface-subtle px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid"><span>Program</span><span>Type</span><span>Status</span></div>
        <div className="divide-y divide-border">{programs.map((program) => {
          const href = program.slug ? `/programs/${program.slug}` : "/programs";
          return <Link key={program.id} href={href} className="group grid gap-2 px-4 py-3 transition hover:bg-surface-subtle/80 md:grid-cols-[minmax(320px,1fr)_150px_150px] md:items-center"><div className="min-w-0"><h2 className="truncate text-sm font-semibold leading-6 text-foreground transition group-hover:text-primary">{recordTitle(program, "Research program")}</h2>{program.code ? <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">{compactText(program.code)}</p> : null}</div><div className="text-xs font-medium text-muted-foreground md:text-sm">{formatLabel(compactText(program.program_type) || "program")}</div><div className="flex flex-wrap items-center gap-2"><Badge>{formatLabel(program.status ?? (program.is_active === false ? "inactive" : "active"))}</Badge>{program.is_featured ? <FilledBadge>Featured</FilledBadge> : null}</div></Link>;
        })}</div>
      </div>
    </div>
  );
}

export function OutputsDisplay({
  outputs,
  projectNames,
  centerNames,
}: {
  outputs: ResearchRecordDisplayDto[];
  projectNames: Record<string, string>;
  centerNames: Record<string, string>;
}) {
  return (
    <div data-server-data-display="research-outputs" className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
      {outputs.map((output) => {
        const href = output.slug ? `/outputs/${output.slug}` : "/outputs";
        const title = recordTitle(output, "Research output");
        const source = projectNames[String(output.project_id ?? "")] || centerNames[String(output.center_id ?? "")] || compactText(output.project_name) || compactText(output.center_name);
        const image = compactText(output.cover_image_url) || compactText(output.image_url);
        return <Link key={output.id} href={href} className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
          {image ? <div className="aspect-[4/3] bg-cover bg-center" style={{ backgroundImage: `url('${image}')` }} /> : <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(135deg,hsl(var(--brand-overlay)),hsl(var(--primary)))]"><div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:22px_22px] opacity-60" /></div>}
          <div className="p-3"><div className="flex flex-wrap gap-1.5"><span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">{formatLabel(compactText(output.output_type) || "output")}</span><span className="rounded-md bg-secondary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-secondary">{formatLabel(compactText(output.access_type) || compactText(output.status) || "published")}</span></div><h2 className="mt-2 line-clamp-2 min-h-[2.5rem] text-xs font-semibold leading-5 text-foreground transition group-hover:text-primary sm:text-sm">{title}</h2><p className="mt-1 line-clamp-2 text-[11px] leading-4 text-muted-foreground">{source || recordSummary(output)}</p></div>
        </Link>;
      })}
    </div>
  );
}

export function PartnersDisplay({
  allPartners,
  featuredPartner,
  directoryPartners,
}: {
  allPartners: ResearchRecordDisplayDto[];
  featuredPartner?: ResearchRecordDisplayDto;
  directoryPartners: ResearchRecordDisplayDto[];
}) {
  return (
    <div data-server-data-display="research-partners">
      {allPartners.length > 0 ? <section className="border-y border-border bg-surface-subtle px-4 py-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12"><div className="mx-auto flex max-w-[1680px] gap-3 overflow-x-auto">{allPartners.slice(0, 18).map((partner) => <PartnerLink key={partner.id} partner={partner} />)}</div></section> : null}
      {featuredPartner ? <FeaturedPartnerCard partner={featuredPartner} /> : null}
      {directoryPartners.length > 0 ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{directoryPartners.map((partner) => <PartnerCard key={partner.id} partner={partner} />)}</div> : null}
    </div>
  );
}

function PartnerLink({ partner }: { partner: ResearchRecordDisplayDto }) {
  return <Link href={partner.slug ? `/partners/${partner.slug}` : "/partners"} className="flex min-w-[210px] items-center gap-3 rounded-md border border-border bg-white px-3 py-2 shadow-sm"><PartnerMark partner={partner} /><span className="min-w-0"><span className="block truncate text-sm font-semibold text-primary">{recordTitle(partner, "Partner")}</span><span className="block truncate text-xs text-muted-foreground">{formatLabel(partner.partner_type)}</span></span></Link>;
}

function PartnerMark({ partner }: { partner: ResearchRecordDisplayDto }) {
  const initials = recordTitle(partner, "P").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary text-xs font-bold text-white">{initials || "P"}</span>;
}

function FeaturedPartnerCard({ partner }: { partner: ResearchRecordDisplayDto }) {
  const href = partner.slug ? `/partners/${partner.slug}` : "/partners";
  return <Link href={href} className="group my-4 grid gap-4 rounded-lg border border-primary/25 bg-white p-4 shadow-sm transition hover:border-primary/50 md:grid-cols-[76px_minmax(0,1fr)_220px_auto] md:items-center"><PartnerMark partner={partner} /><div className="min-w-0"><div className="flex flex-wrap gap-2"><Badge>Featured partner</Badge>{partner.partner_type ? <FilledBadge>{formatLabel(partner.partner_type)}</FilledBadge> : null}</div><h3 className="mt-2 truncate text-xl font-semibold text-primary group-hover:text-secondary">{recordTitle(partner, "Partner")}</h3><p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{recordSummary(partner)}</p></div><div className="text-sm text-muted-foreground"><span className="block font-semibold text-primary">{formatLabel(partner.partnership_level) || "Collaboration"}</span><span className="mt-1 block">{compactText(partner.country) || compactText(partner.region) || "Kisii University network"}</span></div><ArrowRight aria-hidden className="h-5 w-5 text-primary" /></Link>;
}

function PartnerCard({ partner }: { partner: ResearchRecordDisplayDto }) {
  return <Link href={partner.slug ? `/partners/${partner.slug}` : "/partners"} className="group rounded-lg border border-border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"><div className="flex items-start justify-between gap-3"><PartnerMark partner={partner}/><ArrowRight aria-hidden className="h-4 w-4 text-primary transition group-hover:translate-x-1"/></div><h3 className="mt-4 line-clamp-2 text-lg font-semibold text-primary group-hover:text-secondary">{recordTitle(partner, "Partner")}</h3><p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{recordSummary(partner)}</p><div className="mt-4 flex flex-wrap gap-2">{partner.partner_type ? <Badge>{formatLabel(partner.partner_type)}</Badge> : null}{partner.partnership_level ? <FilledBadge>{formatLabel(partner.partnership_level)}</FilledBadge> : null}</div></Link>;
}

export type PathwayDisplayKind = "startups" | "incubation" | "competitions" | "technology-transfer";
export type PathwayDisplayConfig = {
  kind: PathwayDisplayKind;
  featuredLabel: string;
  allTitle: string;
  secondaryAction: string;
  secondaryHref: string;
};

export function PathwayRecordsDisplay({
  config,
  featuredRecord,
  cardRecords,
  context,
}: {
  config: PathwayDisplayConfig;
  featuredRecord?: ResearchRecordDisplayDto;
  cardRecords: ResearchRecordDisplayDto[];
  context: { innovations: Record<string, string>; partners: Record<string, string>; startups: Record<string, string> };
}) {
  return <div data-server-data-display={`research-${config.kind}`}>
    {featuredRecord ? <div className="mt-4"><PathwayFeaturedCard config={config} record={featuredRecord} context={context}/></div> : null}
    {cardRecords.length > 0 ? <div className="mt-3 grid gap-4 lg:grid-cols-2">{cardRecords.map((record) => <PathwayRecordCard key={record.id} config={config} record={record} context={context}/>)}</div> : null}
  </div>;
}

function PathwayFeaturedCard({ config, record, context }: { config: PathwayDisplayConfig; record: ResearchRecordDisplayDto; context: { innovations: Record<string, string>; partners: Record<string, string>; startups: Record<string, string> } }) {
  return <article className="overflow-hidden rounded-lg border border-border bg-white shadow-sm"><div className="grid lg:grid-cols-[250px_minmax(0,1fr)_310px]"><PathwayVisual config={config} featured label={config.featuredLabel}/><div className="border-y border-border p-5 lg:border-x lg:border-y-0"><div className="flex flex-wrap gap-2">{primaryBadge(config.kind, record) ? <Badge>{primaryBadge(config.kind, record)}</Badge> : null}{secondaryBadge(config.kind, record) ? <FilledBadge>{secondaryBadge(config.kind, record)}</FilledBadge> : null}</div><h2 className="mt-3 font-display text-2xl font-semibold leading-tight text-foreground">{recordTitle(record, config.allTitle)}</h2><p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{pathwaySummary(config.kind, record)}</p><PathwayProgress kind={config.kind} record={record} className="mt-7"/></div><div className="grid content-between gap-4 p-5"><dl className="divide-y divide-border text-sm">{featureFacts(config.kind, record, context).map((fact) => <StoryFact key={fact.label} {...fact}/>)}</dl><Link href={config.secondaryHref} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90">{config.secondaryAction}<ArrowRight aria-hidden className="h-4 w-4"/></Link></div></div></article>;
}

function PathwayRecordCard({ config, record, context }: { config: PathwayDisplayConfig; record: ResearchRecordDisplayDto; context: { innovations: Record<string, string>; partners: Record<string, string>; startups: Record<string, string> } }) {
  return <article className="grid min-h-[158px] overflow-hidden rounded-lg border border-border bg-white shadow-sm transition hover:border-primary/30 hover:shadow-md sm:grid-cols-[112px_minmax(0,1fr)_170px]"><PathwayVisual config={config}/><div className="min-w-0 border-y border-border p-4 sm:border-x sm:border-y-0"><div className="flex flex-wrap gap-1.5">{primaryBadge(config.kind, record) ? <Badge>{primaryBadge(config.kind, record)}</Badge> : null}{secondaryBadge(config.kind, record) ? <FilledBadge>{secondaryBadge(config.kind, record)}</FilledBadge> : null}</div><h3 className="mt-2 line-clamp-2 font-display text-base font-semibold leading-6 text-foreground">{recordTitle(record, config.allTitle)}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{pathwaySummary(config.kind, record)}</p><PathwayProgress kind={config.kind} record={record} compact className="mt-3"/></div><div className="grid content-between gap-3 p-4 text-xs"><div className="space-y-3"><MiniMeta label="Innovation" value={context.innovations[String(record.innovation_id ?? "")] ?? ""}/><MiniMeta label="Partner" value={context.partners[String(record.partner_id ?? "")] ?? ""}/>{config.kind !== "startups" ? <MiniMeta label="Startup" value={context.startups[String(record.startup_id ?? "")] ?? ""}/> : null}</div><span className="font-semibold text-primary">{formatLabel(record.status) || "Active"}</span></div></article>;
}

function PathwayVisual({ config, featured = false, label }: { config: PathwayDisplayConfig; featured?: boolean; label?: string }) {
  const Icon = config.kind === "startups" ? Rocket : config.kind === "competitions" ? Trophy : config.kind === "technology-transfer" ? Handshake : UsersRound;
  return <div className={`relative min-h-[118px] overflow-hidden bg-[linear-gradient(135deg,hsl(var(--brand-overlay)),hsl(var(--primary)/.62))] ${featured ? "lg:min-h-[230px]" : ""}`}>{label ? <span className="absolute left-3 top-3 z-10 rounded-md bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">{label}</span> : null}<div aria-hidden className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:24px_24px]"/><div className="absolute inset-0 grid place-items-center"><span className={`${featured ? "h-20 w-20" : "h-14 w-14"} grid place-items-center rounded-full border border-secondary/45 bg-white/10 text-secondary backdrop-blur`}><Icon aria-hidden className={featured ? "h-10 w-10" : "h-7 w-7"}/></span></div></div>;
}

function PathwayProgress({ kind, record, compact = false, className = "" }: { kind: PathwayDisplayKind; record: ResearchRecordDisplayDto; compact?: boolean; className?: string }) {
  const value = compactText(kind === "startups" ? record.venture_stage : kind === "incubation" ? record.stage : kind === "technology-transfer" ? record.transfer_status : record.entry_status).toLowerCase();
  const active = /deploy|implemented|transferred|closed|market|scal|winner|award|completed/.test(value) ? 3 : /license|licensed|pilot|demo|final|presented/.test(value) ? 2 : /protect|protected|review|register|mentor|active|short/.test(value) ? 1 : 0;
  const steps = kind === "startups" ? ["Idea", "Registered", "Pilot", "Market"] : kind === "incubation" ? ["Intake", "Mentor", "Demo", "Scale"] : kind === "technology-transfer" ? ["Disclose", "Protect", "License", "Deploy"] : ["Submitted", "Shortlist", "Final", "Award"];
  return <div className={`grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-start gap-2 ${className}`}>{steps.map((step, index) => <div key={step} className="contents"><div className="grid justify-items-center gap-1"><span className={`${compact ? "h-6 w-6" : "h-9 w-9"} grid place-items-center rounded-full border text-[10px] font-bold ${index === active ? "border-primary bg-primary text-white" : "border-border bg-white text-muted-foreground"}`}>{index + 1}</span><span className={`${compact ? "text-[9px]" : "text-[11px]"} text-center font-semibold text-muted-foreground`}>{step}</span></div>{index < steps.length - 1 ? <span className="mt-2 text-center text-xs font-semibold text-muted-foreground/70">→</span> : null}</div>)}</div>;
}

function primaryBadge(kind: PathwayDisplayKind, record: ResearchRecordDisplayDto) {
  return formatLabel(kind === "startups" ? record.venture_stage : kind === "incubation" ? record.incubation_type : kind === "technology-transfer" ? record.case_type : record.entry_type);
}

function secondaryBadge(kind: PathwayDisplayKind, record: ResearchRecordDisplayDto) {
  return formatLabel(kind === "startups" ? record.registration_status : kind === "incubation" ? record.stage : kind === "technology-transfer" ? record.transfer_status : record.entry_status);
}

function pathwaySummary(kind: PathwayDisplayKind, record: ResearchRecordDisplayDto) {
  return recordSummary(record) || compactText(kind === "startups" ? record.solution : kind === "incubation" ? record.support_received : kind === "technology-transfer" ? record.public_benefit : record.pitch_summary);
}

function featureFacts(kind: PathwayDisplayKind, record: ResearchRecordDisplayDto, context: { innovations: Record<string, string>; partners: Record<string, string>; startups: Record<string, string> }) {
  if (kind === "startups") return [{ label: "Sector", value: compactText(record.sector) }, { label: "Registration", value: formatLabel(record.registration_status) }, { label: "Linked innovation", value: context.innovations[String(record.innovation_id ?? "")] ?? "" }, { label: "Partner", value: context.partners[String(record.partner_id ?? "")] ?? "" }, { label: "Funding raised", value: money(record.funding_raised, record.currency) }].filter((fact) => fact.value);
  if (kind === "incubation") return [{ label: "Programme", value: compactText(record.program_name) }, { label: "Cohort", value: compactText(record.cohort) }, { label: "Timeline", value: [formatDate(record.start_date as string), formatDate(record.end_date as string)].filter(Boolean).join(" - ") }, { label: "Startup", value: context.startups[String(record.startup_id ?? "")] ?? "" }, { label: "Mentors", value: mentorCount(record.mentor_ids) }].filter((fact) => fact.value);
  if (kind === "technology-transfer") return [{ label: "Case type", value: formatLabel(record.case_type) }, { label: "Transfer status", value: formatLabel(record.transfer_status) }, { label: "Agreement date", value: formatDate(record.agreement_date as string) || formatDate(record.disclosure_date as string) }, { label: "IP reference", value: compactText(record.ip_reference) || compactText(record.agreement_reference) }, { label: "Partner", value: context.partners[String(record.partner_id ?? "")] ?? "" }, { label: "Revenue generated", value: money(record.revenue_generated, record.currency) }].filter((fact) => fact.value);
  return [{ label: "Competition", value: compactText(record.competition_name) }, { label: "Event date", value: formatDate(record.event_date as string) }, { label: "Result", value: [formatLabel(record.entry_status), compactText(record.award), compactText(record.position)].filter(Boolean).join(" · ") }, { label: "Startup", value: context.startups[String(record.startup_id ?? "")] ?? "" }, { label: "Innovation", value: context.innovations[String(record.innovation_id ?? "")] ?? "" }].filter((fact) => fact.value);
}

function StoryFact({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return <div className="py-3 first:pt-0"><dt className="font-semibold text-primary">{label}</dt><dd className="mt-1 line-clamp-2 leading-5 text-muted-foreground">{value}</dd></div>;
}

function MiniMeta({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return <div><p className="font-semibold text-primary">{label}</p><p className="mt-0.5 line-clamp-2 leading-4 text-muted-foreground">{value}</p></div>;
}

function mentorCount(value: unknown) {
  if (typeof value === "string") return value;
  return "";
}

function money(value: unknown, currency: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "";
  return `${compactText(currency as string) || "KES"} ${new Intl.NumberFormat("en").format(amount)}`;
}

export function InnovationsDisplay({
  featured,
  records,
  projectNames,
  centerNames,
}: {
  featured?: ResearchRecordDisplayDto;
  records: ResearchRecordDisplayDto[];
  projectNames: Record<string, string>;
  centerNames: Record<string, string>;
}) {
  return <div data-server-data-display="research-innovations">{featured ? <InnovationFeatured innovation={featured} projectNames={projectNames} centerNames={centerNames}/> : null}<div className="mt-3 grid gap-4 lg:grid-cols-2">{records.map((record) => <InnovationCard key={record.id} innovation={record} projectNames={projectNames} centerNames={centerNames}/>)}</div></div>;
}

function InnovationFeatured({ innovation, projectNames, centerNames }: { innovation: ResearchRecordDisplayDto; projectNames: Record<string, string>; centerNames: Record<string, string> }) {
  const href = innovation.slug ? `/innovations/${innovation.slug}` : "/innovations";
  const summary = recordSummary(innovation);
  return <article className="overflow-hidden rounded-lg border border-border bg-white shadow-sm"><div className="grid lg:grid-cols-[280px_minmax(0,1fr)_330px]"><InnovationThumbnail large/><div className="border-y border-border p-5 lg:border-x lg:border-y-0"><div className="flex flex-wrap gap-2"><Badge>{formatLabel(compactText(innovation.development_stage) || "field tested")}</Badge>{innovation.ip_status ? <Badge>{formatLabel(innovation.ip_status)}</Badge> : null}{innovation.commercialization_status ? <Badge>{formatLabel(innovation.commercialization_status)}</Badge> : null}</div><Link href={href} className="group mt-3 block"><h2 className="text-2xl font-semibold leading-tight text-primary group-hover:text-secondary">{recordTitle(innovation, "Innovation")}</h2></Link><p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{summary}</p><ReadinessTrail innovation={innovation} className="mt-7"/></div><div className="grid content-between gap-4 p-5"><dl className="divide-y divide-border text-sm"><StoryFact label="Problem it solves" value={compactText(innovation.problem_addressed) || compactText(innovation.problem) || summary}/><StoryFact label="Current readiness" value={[formatLabel(innovation.development_stage), innovation.trl_level ? `TRL ${innovation.trl_level}` : "", formatLabel(innovation.commercialization_status)].filter(Boolean).join(" · ")}/><StoryFact label="Linked project" value={projectNames[String(innovation.project_id ?? "")] || ""}/><StoryFact label="Lead center" value={centerNames[String(innovation.center_id ?? "")] || ""}/></dl><Link href="/partners" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90">Partner with the team<ArrowRight aria-hidden className="h-4 w-4"/></Link></div></div></article>;
}

function InnovationCard({ innovation, projectNames, centerNames }: { innovation: ResearchRecordDisplayDto; projectNames: Record<string, string>; centerNames: Record<string, string> }) {
  const href = innovation.slug ? `/innovations/${innovation.slug}` : "/innovations";
  return <Link href={href} className="group grid min-h-[154px] overflow-hidden rounded-lg border border-border bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md sm:grid-cols-[118px_minmax(0,1fr)_170px]"><InnovationThumbnail/><div className="min-w-0 border-y border-border p-4 sm:border-x sm:border-y-0"><div className="flex flex-wrap gap-1.5">{innovation.development_stage ? <Badge>{formatLabel(innovation.development_stage)}</Badge> : null}{innovation.ip_status ? <FilledBadge>{formatLabel(innovation.ip_status)}</FilledBadge> : null}</div><h3 className="mt-2 line-clamp-2 text-base font-semibold leading-6 text-primary group-hover:text-secondary">{recordTitle(innovation, "Innovation")}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{recordSummary(innovation)}</p><ReadinessTrail innovation={innovation} compact className="mt-3"/></div><div className="grid content-between gap-3 p-4 text-xs"><div className="space-y-3"><MiniMeta label="Project" value={projectNames[String(innovation.project_id ?? "")] || ""}/><MiniMeta label="Center" value={centerNames[String(innovation.center_id ?? "")] || ""}/></div><span className="font-semibold text-primary">{innovation.is_active === false ? "Inactive" : "Active"}</span></div></Link>;
}

function InnovationThumbnail({ large = false }: { large?: boolean }) {
  return <div className={`relative h-full min-h-[118px] overflow-hidden bg-[linear-gradient(135deg,hsl(var(--primary)/.62),#166534)] ${large ? "min-h-[230px]" : ""}`}><div aria-hidden className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:24px_24px]"/><div className="absolute inset-0 grid place-items-center text-6xl text-secondary/60">✦</div></div>;
}

function ReadinessTrail({ innovation, compact = false, className = "" }: { innovation: ResearchRecordDisplayDto; compact?: boolean; className?: string }) {
  const stage = compactText(innovation.development_stage).toLowerCase();
  const commercial = compactText(innovation.commercialization_status).toLowerCase();
  const trl = Number(innovation.trl_level ?? 0);
  const active = commercial.includes("market") || commercial.includes("commercial") || trl >= 8 ? 3 : stage.includes("testing") || stage.includes("validation") || commercial.includes("pilot") || trl >= 5 ? 2 : stage.includes("development") || commercial.includes("prototype") || trl >= 3 ? 1 : 0;
  const steps = ["Idea", "Prototype", "Field tested", "Partner-ready"];
  return <div className={`grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-start gap-2 ${className}`}>{steps.map((step, index) => <div key={step} className="contents"><div className="grid justify-items-center gap-1"><span className={`${compact ? "h-7 w-7" : "h-9 w-9"} grid place-items-center rounded-full border text-[10px] font-bold ${index === active ? "border-primary bg-primary text-white" : "border-border bg-white text-muted-foreground"}`}>{index + 1}</span><span className={`${compact ? "text-[9px]" : "text-[11px]"} text-center font-semibold text-muted-foreground`}>{step}</span></div>{index < steps.length - 1 ? <span className="mt-2 text-center text-xs font-semibold text-muted-foreground/70">→</span> : null}</div>)}</div>;
}
