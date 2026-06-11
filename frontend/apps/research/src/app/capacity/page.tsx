import type { Metadata } from "next";
import {
  Badge,
  FilledBadge,
  ResearchHero,
  ResearchSection,
  StatusMessage,
} from "../../components/research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
  getMentorship,
  getScholarships,
  getTraining,
} from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Research Capacity",
  description: "Training, mentorship, and scholarship opportunities for research capacity building.",
};

export default async function CapacityPage() {
  const [training, mentorship, scholarships] = await Promise.all([
    getTraining(),
    getMentorship(),
    getScholarships(),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchHero
        eyebrow="Capacity"
        title="Training, mentorship, and scholarships for research growth."
        body="Find structured opportunities that help staff, students, and collaborators build research methods, writing, ethics, and leadership capacity."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Research", href: "/" },
          { label: "Capacity" },
        ]}
      />
      <ResearchSection
        eyebrow="Training"
        title="Capacity building programmes"
        body="Upcoming and published programmes are pulled from the Research service."
        tone="white"
      >
        {training.error ? <StatusMessage tone="error">{training.error}</StatusMessage> : null}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {training.data.map((item) => (
            <article
              key={item.id}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap gap-2">
                <Badge>{formatLabel(item.program_type ?? "training")}</Badge>
                <Badge>{formatLabel(item.delivery_mode ?? item.status)}</Badge>
                {item.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
              </div>
              <h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">
                {item.title}
              </h2>
              {compactText(item.summary) ? (
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {compactText(item.summary)}
                </p>
              ) : null}
              {formatDate(item.start_date) || compactText(item.venue) ? (
                <p className="mt-5 rounded-md bg-slate-50 p-3 text-sm font-semibold text-slate-700">
                  {formatDate(item.start_date) || compactText(item.venue)}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </ResearchSection>
      <ResearchSection
        eyebrow="Mentorship and Scholarships"
        title="Structured research support"
        body="Mentorship cohorts and scholarship calls complete the public capacity-building surface."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <SupportPanel title="Mentorship" records={mentorship.data} error={mentorship.error} />
        <SupportPanel title="Scholarships" records={scholarships.data} error={scholarships.error} />
      </div>
      </ResearchSection>
      <ResearchSection
        eyebrow="Research Mentorship Programme"
        title="Mentor and mentee sign-up"
        body="Mentorship programmes are supported by Research service records and the public sign-up entry point in Connect & Engage."
        tone="white"
      >
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="max-w-3xl text-sm leading-7 text-slate-600">
            Prospective mentors and mentees can start from the public contact flow while administrators process mentorship applications, matches, and cohorts in the research service.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <a
              href="/connect#mentorship"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Mentor sign-up
            </a>
            <a
              href="/connect#mentorship"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Mentee sign-up
            </a>
          </div>
        </div>
      </ResearchSection>
    </main>
  );
}

function SupportPanel({
  title,
  records,
  error,
}: {
  title: string;
  records: Array<Record<string, any>>;
  error: string | null;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      {error ? <div className="mt-4"><StatusMessage tone="error">{error}</StatusMessage></div> : null}
      <div className="mt-4 divide-y divide-slate-200">
        {records.map((record) => (
          <article key={record.id} className="py-4">
            <h3 className="text-base font-semibold leading-6 text-slate-950">
              {record.title ?? record.name}
            </h3>
            {compactText(record.summary) || compactText(record.description) ? (
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {compactText(record.summary) || compactText(record.description)}
              </p>
            ) : null}
            <p className="mt-2 text-xs font-semibold uppercase text-slate-500">
              {formatLabel(record.status)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
