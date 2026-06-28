import type { Metadata } from "next";
import Link from "next/link";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { Banknote, ClipboardList, FileText, GraduationCap, LifeBuoy, Wrench } from "lucide-react";
import { ResearchClusterHero } from "../../components/research-cluster";
import { ResearchFact } from "../../components/research-detail";
import { ResearchFilterForm } from "../../components/research-listing";
import { Badge, FilledBadge, ResearchSection, StatusMessage } from "../../components/research-ui";
import { compactText, formatDate, formatLabel, getScholarships, getScholarshipsFiltered } from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Research Scholarships",
  description: "Research scholarship calls and student funding opportunities.",
};

type ScholarshipParams = { q?: string; type?: string; status?: string; year?: string; sort?: string };
const scholarshipTypes = ["research", "postgraduate", "doctoral", "masters", "mobility", "seed", "fellowship"];
const statuses = ["open", "upcoming", "closed", "awarded", "draft"];

const supportLinks = [
  { label: "Funding", href: "/funding", description: "Grant calls, internal funding, and deadlines.", icon: Banknote },
  { label: "Scholarships", href: "/scholarships", description: "Student research funding and fellowship calls.", icon: GraduationCap },
  { label: "Guidelines", href: "/guidelines", description: "Policies, procedures, templates, and grant guidance.", icon: FileText },
  { label: "Forms", href: "/forms", description: "Downloadable forms and research templates.", icon: ClipboardList },
  { label: "Resources", href: "/resources-tools", description: "Tools, platforms, equipment, and access routes.", icon: Wrench },
  { label: "Services", href: "/services", description: "Support services and request pathways.", icon: LifeBuoy },
];

export default async function ScholarshipsPage({ searchParams }: { searchParams?: Promise<ScholarshipParams> }) {
  const params = (await searchParams) ?? {};
  const [scholarships, allScholarships] = await Promise.all([
    getScholarshipsFiltered({
      search: params.q,
      scholarshipType: params.type,
      status: params.status,
      year: params.year,
      sort: params.sort || "application_deadline",
      order: params.sort === "name" ? "asc" : "desc",
    }),
    getScholarships(),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchClusterHero
        eyebrow="Funding / Support"
        title="Research scholarships and student funding opportunities."
        body="Scholarship calls show eligibility, award value, coverage, application deadlines, and direct application links."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Funding", href: "/funding" }, { label: "Scholarships" }]}
        imageSrc="/images/research/research-projects-hero.svg"
        imageAlt="Students and researchers reviewing scholarship support opportunities"
        links={supportLinks}
        primaryAction={{ label: "View funding", href: "/funding" }}
        stats={[
          { label: "Scholarship results", value: scholarships.data.length },
          { label: "Published scholarships", value: allScholarships.data.length },
          { label: "Scholarship types", value: scholarshipTypes.length },
          { label: "Statuses", value: statuses.length },
        ]}
      />
      <ResearchSection eyebrow="Scholarship Calls" title="Open and published opportunities" body="Filter research scholarships by type, status, deadline year, and keyword." tone="white">
        <ScholarshipFilters params={params} years={getYears(allScholarships.data)} />
        {[scholarships.error, allScholarships.error].filter(Boolean).map((error) => <div key={error} className="mt-5"><StatusMessage tone="error">{error}</StatusMessage></div>)}
        {scholarships.data.length > 0 ? (
          <div className="mt-7 grid gap-5 lg:grid-cols-3">
            {scholarships.data.map((item) => <ScholarshipCard key={item.id} item={item} />)}
          </div>
        ) : <div className="mt-7"><StatusMessage>No scholarship calls match the current filters.</StatusMessage></div>}
      </ResearchSection>
    </main>
  );
}

function ScholarshipFilters({ params, years }: { params: ScholarshipParams; years: string[] }) {
  return (
    <ResearchFilterForm
      action="/scholarships"
      resetHref="/scholarships"
      searchValue={params.q}
      searchPlaceholder="Scholarship, funder, eligibility"
      selects={[
        { name: "type", label: "Type", value: params.type, options: scholarshipTypes },
        { name: "status", label: "Status", value: params.status, options: statuses },
        { name: "year", label: "Year", value: params.year, options: years },
      ]}
      sortValue={params.sort}
      sortOptions={[
        { value: "application_deadline", label: "Deadline" },
        { value: "application_open", label: "Opening date" },
        { value: "value", label: "Award value" },
        { value: "name", label: "Name" },
        { value: "created_at", label: "Newest" },
      ]}
    />
  );
}

function ScholarshipCard({ item }: { item: ResearchGenericRecord }) {
  const value = formatMoney(item.value, compactText(item.currency) || "KES");
  const coverage = [
    item.covers_tuition ? "Tuition" : "",
    item.covers_stipend ? "Stipend" : "",
    item.covers_travel ? "Travel" : "",
    item.covers_research ? "Research" : "",
  ].filter(Boolean);
  return (
    <article className="flex min-h-[360px] flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)]">
      <div className="flex flex-wrap gap-2"><Badge>{formatLabel(item.scholarship_type ?? "scholarship")}</Badge>{item.status ? <FilledBadge>{formatLabel(item.status)}</FilledBadge> : null}</div>
      <h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950"><Link href={item.slug ? `/scholarships/${item.slug}` : "/scholarships"} className="transition hover:text-primary">{item.name ?? "Research scholarship"}</Link></h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">{compactText(item.summary) || compactText(item.eligibility) || "Scholarship information will appear when published."}</p>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm"><ResearchFact label="Deadline" value={formatDate(item.application_deadline)} /><ResearchFact label="Value" value={value} /><ResearchFact label="Funder" value={compactText(item.funder_name)} /><ResearchFact label="Available" value={compactText(item.number_available)} /></dl>
      {coverage.length ? <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Covers {coverage.join(", ")}</p> : null}
    </article>
  );
}

function getYears(records: ResearchGenericRecord[]) {
  return Array.from(new Set(records.map((record) => compactText(record.application_deadline ?? record.application_open ?? record.created_at).slice(0, 4)).filter((year) => /^\d{4}$/.test(year)))).sort((a, b) => Number(b) - Number(a));
}

function formatMoney(value?: string | number | null, currency = "KES") {
  if (value === null || value === undefined || value === "") return "";
  const amount = Number(value);
  return Number.isNaN(amount) ? compactText(value) : `${currency} ${new Intl.NumberFormat("en-KE").format(amount)}`;
}
