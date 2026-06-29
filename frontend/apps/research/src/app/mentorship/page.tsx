import type { Metadata } from "next";
import { BookOpenCheck, CalendarDays, Newspaper, Users } from "lucide-react";
import { ResearchClusterHero } from "../../components/research-cluster";
import { ResearchFilterForm, ResearchListCard } from "../../components/research-listing";
import { ResearchSection, StatusMessage } from "../../components/research-ui";
import { compactText, formatDate, getCenters, getMentorship, getMentorshipFiltered } from "../../lib/research-public-data";
import type { ResearchGenericRecord } from "@ksu/api-client";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Research Mentorship",
  description: "Research mentorship programmes and sign-up pathways.",
};

type MentorshipSearchParams = { q?: string; type?: string; status?: string; center?: string; year?: string; sort?: string };
const programTypes = ["research", "career", "academic", "writing", "grant_writing", "leadership"];
const statuses = ["draft", "accepting_applications", "matching", "active", "completed", "suspended"];

const learningLinks = [
  { label: "Training", href: "/training", description: "Workshops, courses, bootcamps, and seminars.", icon: BookOpenCheck },
  { label: "Mentorship", href: "/mentorship", description: "Mentor and mentee pathways for research growth.", icon: Users },
  { label: "Events", href: "/events", description: "Public calendar for forums, workshops, and conferences.", icon: CalendarDays },
  { label: "News", href: "/news", description: "Research updates, notices, stories, and articles.", icon: Newspaper },
];

export default async function MentorshipPage({ searchParams }: { searchParams?: Promise<MentorshipSearchParams> }) {
  const params = (await searchParams) ?? {};
  const [mentorship, allMentorship, centers] = await Promise.all([
    getMentorshipFiltered({
      search: params.q,
      programType: params.type,
      status: params.status,
      centerId: params.center,
      year: params.year,
      sort: params.sort || "application_deadline",
      order: params.sort === "name" ? "asc" : "desc",
    }),
    getMentorship(),
    getCenters(),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchClusterHero eyebrow="Learning" title="Mentor and mentee pathways for research growth." body="Find structured mentorship programmes for researchers, students, writers, grant applicants, and emerging leaders." breadcrumbs={[{ label: "Home", href: "/" }, { label: "Learning", href: "/training" }, { label: "Mentorship" }]} imageSrc="/images/research/research-about-hero.svg" imageAlt="Mentorship session for researchers and postgraduate students" links={learningLinks} primaryAction={{ label: "View training", href: "/training" }} stats={[{ label: "Mentorship results", value: mentorship.data.length }, { label: "Published mentorship", value: allMentorship.data.length }, { label: "Centers", value: centers.data.length }, { label: "Program types", value: programTypes.length }]} />
      <ResearchSection eyebrow="Mentorship Pathways" title="Mentorship programmes" body="Browse mentorship programmes by type, center, status, year, and keyword." tone="white">
        <MentorshipFilters params={params} years={getYears(allMentorship.data)} centers={centers.data} />
        {[mentorship.error, allMentorship.error, centers.error].filter(Boolean).map((error, i) => <div key={i} className="mt-5"><StatusMessage tone="error">{error}</StatusMessage></div>)}
        {mentorship.data.length > 0 ? <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{mentorship.data.map((item) => <MentorshipCard key={item.id} item={item} />)}</div> : <div className="mt-7"><StatusMessage>No mentorship programmes match the current filters.</StatusMessage></div>}
      </ResearchSection>
    </main>
  );
}

function MentorshipFilters({ params, years, centers }: { params: MentorshipSearchParams; years: string[]; centers: ResearchGenericRecord[] }) {
  return (
    <ResearchFilterForm
      action="/mentorship"
      resetHref="/mentorship"
      searchValue={params.q}
      searchPlaceholder="Programme, requirements, benefits"
      selects={[
        { name: "type", label: "Type", value: params.type, options: programTypes },
        { name: "status", label: "Status", value: params.status, options: statuses },
        { name: "year", label: "Year", value: params.year, options: years },
      ]}
      centers={centers}
      centerValue={params.center}
      sortValue={params.sort ?? "application_deadline"}
      sortOptions={[
        { value: "application_deadline", label: "Application deadline" },
        { value: "cohort_start_date", label: "Cohort start" },
        { value: "created_at", label: "Newest" },
        { value: "name", label: "Name" },
      ]}
    />
  );
}

function MentorshipCard({ item }: { item: ResearchGenericRecord }) {
  return (
    <ResearchListCard
      href={item.slug ? `/mentorship/${item.slug}` : "/mentorship"}
      title={item.name ?? item.title}
      description={compactText(item.summary) || compactText(item.benefits) || "Mentorship details will appear when published."}
      badges={[item.program_type ?? "mentorship", item.status ?? "active"]}
      filledBadges={item.is_featured ? ["Featured"] : []}
      facts={[
        { label: "Deadline", value: formatDate(item.application_deadline) },
        { label: "Cohort", value: formatDate(item.cohort_start_date) },
      ]}
    />
  );
}

function getYears(records: ResearchGenericRecord[]) {
  const years = records.flatMap((record) => [record.application_open, record.application_deadline, record.cohort_start_date, record.created_at]).map((value) => value ? new Date(value).getFullYear() : null).filter((year): year is number => Boolean(year) && !Number.isNaN(year));
  return Array.from(new Set(years)).sort((a, b) => b - a).map(String);
}
