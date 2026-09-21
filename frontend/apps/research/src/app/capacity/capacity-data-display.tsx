"use client";

import {
  Badge,
  FilledBadge,
  ResearchSection,
  StatusMessage,
} from "../../components/research-ui";
import {
  ResearchPageHero,
  ResearchPageHeroStats,
} from "../../components/research-page-hero";

export type CapacityRecordDto = {
  id: string;
  title: string;
  summary: string | null;
  description: string | null;
  status: string | null;
  programType: string | null;
  deliveryMode: string | null;
  startDate: string | null;
  venue: string | null;
  isFeatured: boolean;
};

type CapacityDataDisplayProps = {
  training: CapacityRecordDto[];
  mentorship: CapacityRecordDto[];
  scholarships: CapacityRecordDto[];
  errors: string[];
};

export function CapacityDataDisplay({
  training,
  mentorship,
  scholarships,
  errors,
}: CapacityDataDisplayProps) {
  return (
    <div data-server-data-display="research-capacity">
      <CapacityMasthead
        trainingCount={training.length}
        mentorshipCount={mentorship.length}
        scholarshipCount={scholarships.length}
      />
      <ResearchSection
        eyebrow="Training"
        title="Capacity building programmes"
        body="Upcoming and published programmes are shown for researchers and students."
        tone="white"
      >
        {errors.length > 0 ? (
          <div className="grid gap-2">
            {errors.map((error) => (
              <StatusMessage key={error} tone="error">
                {error}
              </StatusMessage>
            ))}
          </div>
        ) : null}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {training.map((item) => (
            <article
              key={item.id}
              className="rounded-lg border border-border bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap gap-2">
                <Badge>{formatLabel(item.programType ?? "training")}</Badge>
                <Badge>{formatLabel(item.deliveryMode ?? item.status)}</Badge>
                {item.isFeatured ? <FilledBadge>Featured</FilledBadge> : null}
              </div>
              <h2 className="mt-4 text-xl font-semibold leading-7 text-foreground">
                {item.title}
              </h2>
              {compactText(item.summary) ? (
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {compactText(item.summary)}
                </p>
              ) : null}
              {formatDate(item.startDate) || compactText(item.venue) ? (
                <p className="mt-5 rounded-md bg-surface-subtle p-3 text-sm font-semibold text-muted-foreground">
                  {formatDate(item.startDate) || compactText(item.venue)}
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
          <SupportPanel title="Mentorship" records={mentorship} />
          <SupportPanel title="Scholarships" records={scholarships} />
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
    </div>
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
  return (
    <ResearchPageHero
      eyebrow="Capacity"
      title="Training, mentorship, and scholarships for research growth"
      description="Browse published capacity-building records for researchers, students, and collaborators."
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Capacity" }]}
      actions={[
        { label: "Open training", href: "/training" },
        { label: "Mentorship", href: "/mentorship", variant: "secondary" },
      ]}
      imageSrc="/images/research/headers/innovation-week-8020.jpg"
      imageAlt="Kisii University researchers building skills together"
    >
      <ResearchPageHeroStats
        facts={[
          { label: "Training records", value: trainingCount },
          { label: "Mentorship records", value: mentorshipCount },
          { label: "Scholarship records", value: scholarshipCount },
        ]}
      />
    </ResearchPageHero>
  );
}

function SupportPanel({
  title,
  records,
}: {
  title: string;
  records: CapacityRecordDto[];
}) {
  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <div className="mt-4 divide-y divide-border">
        {records.map((record) => (
          <article key={record.id} className="py-4">
            <h3 className="text-base font-semibold leading-6 text-foreground">
              {record.title}
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

function compactText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function formatLabel(value: string | null | undefined) {
  return compactText(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase()) || "—";
}

function formatDate(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);
}
