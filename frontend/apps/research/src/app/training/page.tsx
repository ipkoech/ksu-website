import type { Metadata } from "next";
import { BookOpenCheck, CalendarDays, Newspaper, Users } from "lucide-react";
import { ResearchClusterHero } from "../../components/research-cluster";
import { ResearchFilterForm, ResearchListCard } from "../../components/research-listing";
import { ResearchSection, StatusMessage } from "../../components/research-ui";
import {
  compactText,
  formatDate,
  getCenters,
  getTraining,
  getTrainingFiltered,
} from "../../lib/research-public-data";
import type { ResearchGenericRecord } from "@ksu/api-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Training Programs",
  description: "Research training programmes, workshops, and bootcamps.",
};

type TrainingSearchParams = {
  q?: string;
  type?: string;
  mode?: string;
  category?: string;
  status?: string;
  center?: string;
  year?: string;
  sort?: string;
};

const programTypes = ["workshop", "course", "seminar", "webinar", "bootcamp", "conference", "retreat"];
const deliveryModes = ["in_person", "online", "hybrid"];
const categories = ["research_methods", "writing", "grant_writing", "data_analysis", "leadership", "ethics", "career"];
const statuses = ["draft", "published", "ongoing", "completed", "cancelled", "postponed"];

const learningLinks = [
  { label: "Training", href: "/training", description: "Workshops, courses, bootcamps, and seminars.", icon: BookOpenCheck },
  { label: "Mentorship", href: "/mentorship", description: "Mentor and mentee pathways for research growth.", icon: Users },
  { label: "Events", href: "/events", description: "Public calendar for forums, workshops, and conferences.", icon: CalendarDays },
  { label: "News", href: "/news", description: "Research updates, notices, stories, and articles.", icon: Newspaper },
];

export default async function TrainingPage({ searchParams }: { searchParams?: Promise<TrainingSearchParams> }) {
  const params = (await searchParams) ?? {};
  const [training, allTraining, centers] = await Promise.all([
    getTrainingFiltered({
      search: params.q,
      programType: params.type,
      deliveryMode: params.mode,
      category: params.category,
      status: params.status,
      centerId: params.center,
      year: params.year,
      sort: params.sort || "start_date",
      order: params.sort === "title" ? "asc" : "desc",
    }),
    getTraining(),
    getCenters(),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchClusterHero
        eyebrow="Learning"
        title="Research training, workshops, seminars, and bootcamps."
        body="Find research methods, writing, ethics, grant writing, data, innovation, and leadership capacity-building programmes."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Learning", href: "/training" }, { label: "Training" }]}
        imageSrc="/images/research/research-demo-imagegen.webp"
        imageAlt="Research training workshop with staff and postgraduate students"
        links={learningLinks}
        primaryAction={{ label: "View events", href: "/events" }}
        stats={[
          { label: "Training results", value: training.data.length },
          { label: "Published training", value: allTraining.data.length },
          { label: "Centers", value: centers.data.length },
          { label: "Delivery modes", value: deliveryModes.length },
        ]}
      />
      <ResearchSection
        eyebrow="Training Catalogue"
        title="Training programs"
        body="Browse training opportunities by type, mode, center, status, year, and keyword."
        tone="white"
      >
        <TrainingFilters params={params} years={getYears(allTraining.data)} centers={centers.data} />
        {[training.error, allTraining.error, centers.error].filter(Boolean).map((error) => (
          <div key={error} className="mt-5"><StatusMessage tone="error">{error}</StatusMessage></div>
        ))}
        {training.data.length > 0 ? (
          <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {training.data.map((item) => <TrainingCard key={item.id} item={item} />)}
          </div>
        ) : (
          <div className="mt-7"><StatusMessage>No training programs match the current filters.</StatusMessage></div>
        )}
      </ResearchSection>
    </main>
  );
}

function TrainingFilters({ params, years, centers }: { params: TrainingSearchParams; years: string[]; centers: ResearchGenericRecord[] }) {
  return (
    <ResearchFilterForm
      action="/training"
      resetHref="/training"
      searchValue={params.q}
      searchPlaceholder="Title, curriculum, audience"
      selects={[
        { name: "type", label: "Type", value: params.type, options: programTypes },
        { name: "mode", label: "Mode", value: params.mode, options: deliveryModes },
        { name: "category", label: "Category", value: params.category, options: categories },
        { name: "status", label: "Status", value: params.status, options: statuses },
        { name: "year", label: "Year", value: params.year, options: years },
      ]}
      centers={centers}
      centerValue={params.center}
      sortValue={params.sort ?? "start_date"}
      sortOptions={[
        { value: "start_date", label: "Start date" },
        { value: "registration_deadline", label: "Registration deadline" },
        { value: "created_at", label: "Newest" },
        { value: "title", label: "Title" },
      ]}
    />
  );
}

function TrainingCard({ item }: { item: ResearchGenericRecord }) {
  return (
    <ResearchListCard
      href={item.slug ? `/training/${item.slug}` : "/training"}
      title={item.title}
      description={compactText(item.summary) || compactText(item.target_audience) || "Training details will appear when published."}
      badges={[item.program_type ?? "training", item.delivery_mode ?? item.status]}
      filledBadges={item.offers_certificate ? ["Certificate"] : []}
      facts={[
        { label: "Starts", value: formatDate(item.start_date) },
        { label: "Registration", value: formatDate(item.registration_deadline) },
      ]}
    />
  );
}

function getYears(records: ResearchGenericRecord[]) {
  const years = records.flatMap((record) => [record.start_date, record.end_date, record.created_at]).map((value) => value ? new Date(value).getFullYear() : null).filter((year): year is number => Boolean(year) && !Number.isNaN(year));
  return Array.from(new Set(years)).sort((a, b) => b - a).map(String);
}
