import type { Metadata } from "next";
import Link from "next/link";
import {
  Badge,
  FilledBadge,
  PrimaryLink,
  ResearchSection,
  SecondaryLink,
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

export const revalidate = 300;

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
      <CapacityMasthead
        trainingCount={training.data.length}
        mentorshipCount={mentorship.data.length}
        scholarshipCount={scholarships.data.length}
      />
      <ResearchSection
        eyebrow="Training"
        title="Capacity building programmes"
        body="Upcoming and published programmes are shown for researchers and students."
        tone="white"
      >
        {training.error ? <StatusMessage tone="error">{training.error}</StatusMessage> : null}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {training.data.map((item) => (
            <article
              key={item.id}
              className="rounded-lg border border-border bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap gap-2">
                <Badge>{formatLabel(item.program_type ?? "training")}</Badge>
                <Badge>{formatLabel(item.delivery_mode ?? item.status)}</Badge>
                {item.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
              </div>
              <h2 className="mt-4 text-xl font-semibold leading-7 text-foreground">
                {item.title}
              </h2>
              {compactText(item.summary) ? (
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {compactText(item.summary)}
                </p>
              ) : null}
              {formatDate(item.start_date) || compactText(item.venue) ? (
                <p className="mt-5 rounded-md bg-surface-subtle p-3 text-sm font-semibold text-muted-foreground">
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
        body="Mentorship programmes connect researchers, students, and supervisors through the public sign-up route in Connect & Engage."
        tone="white"
      >
        <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
            Prospective mentors and mentees can start from the public contact flow while programme coordinators guide applications, matches, and cohorts.
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
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-semibold text-muted-foreground"
            >
              Mentee sign-up
            </a>
          </div>
        </div>
      </ResearchSection>
    </main>
  );
}

function CapacityMasthead({
  trainingCount,
  mentorshipCount,
  scholarshipCount,
}: {
  trainingCount: number;
  mentorshipCount: number;
  scholarshipCount: number;
}) {
  const stats = [
    { label: "Training records", value: trainingCount },
    { label: "Mentorship records", value: mentorshipCount },
    { label: "Scholarship records", value: scholarshipCount },
  ];

  return (
    <section className="border-b border-border bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto grid max-w-[1680px] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,460px)] lg:items-end">
        <div>
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="transition hover:text-primary">Home</Link>
            <span className="text-muted-foreground/60">/</span>
            <span className="text-foreground">Capacity</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">Capacity</p>
          <h1 className="mt-3 max-w-5xl text-balance font-[family-name:var(--app-font-display)] text-3xl font-semibold leading-tight text-foreground sm:text-4xl">Training, mentorship, and scholarships for research growth</h1>
          <p className="mt-3 max-w-4xl text-pretty text-sm leading-7 text-muted-foreground sm:text-base">Browse published capacity-building records for researchers, students, and collaborators.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <PrimaryLink href="/training">Open training</PrimaryLink>
            <SecondaryLink href="/mentorship">Mentorship</SecondaryLink>
          </div>
        </div>
        <dl className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-md border border-border bg-surface-subtle px-3 py-2">
              <dt className="text-[11px] font-semibold uppercase text-muted-foreground">{stat.label}</dt>
              <dd className="mt-1 text-lg font-semibold text-foreground">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
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
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      {error ? <div className="mt-4"><StatusMessage tone="error">{error}</StatusMessage></div> : null}
      <div className="mt-4 divide-y divide-border">
        {records.map((record) => (
          <article key={record.id} className="py-4">
            <h3 className="text-base font-semibold leading-6 text-foreground">
              {record.title ?? record.name}
            </h3>
            {compactText(record.summary) || compactText(record.description) ? (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {compactText(record.summary) || compactText(record.description)}
              </p>
            ) : null}
            <p className="mt-2 text-xs font-semibold uppercase text-muted-foreground">
              {formatLabel(record.status)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
