import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileText,
  GraduationCap,
  Library,
  ListChecks,
  Sparkles,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ScrollReveal } from "@ksu/ui/components";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import type { ProgrammeDetailData } from "@/lib/programme-detail-data";
import { publicFileUrl } from "@/lib/public-media";

type FactItem = {
  label: string;
  value: string;
  icon: LucideIcon;
  href?: string;
};

type DetailSection = {
  id: string;
  title: string;
  body: string;
  icon: LucideIcon;
};

function present(value?: string | number | null) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

function stripHtml(value?: string | null) {
  return (value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function bestText(...values: Array<string | null | undefined>) {
  for (const value of values) {
    const text = stripHtml(value);
    if (text) return text;
  }
  return null;
}

function titleFromSlug(slug: string) {
  const smallWords = new Set(["and", "for", "in", "of", "the", "to", "with"]);

  return slug
    .split("-")
    .filter(Boolean)
    .map((part, index) =>
      index > 0 && smallWords.has(part)
        ? part
        : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(" ");
}

function formatDate(value?: string | null) {
  const text = present(value);
  if (!text) return null;

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatIntakes(values?: string[] | null) {
  if (!values?.length) return null;
  return values.join(", ");
}

function formatLabel(value?: string | null) {
  const text = present(value);
  if (!text) return null;

  return text
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function personDisplayName(person?: {
  title?: string | null;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
} | null) {
  if (!person) return "Published tutor";

  const fullName = present(person.full_name);
  if (fullName) return fullName;

  return (
    [person.title, person.first_name, person.middle_name, person.last_name]
      .map((value) => present(value))
      .filter(Boolean)
      .join(" ") || "Published tutor"
  );
}

function sortedTutors(programme: ProgrammeDetailData["programme"]) {
  return (programme?.tutors ?? [])
    .slice()
    .sort(
      (first, second) =>
        Number(Boolean(second.is_lead)) - Number(Boolean(first.is_lead)) ||
        personDisplayName(first.person).localeCompare(
          personDisplayName(second.person),
        ),
    );
}

function SectionKicker({ children }: { children: string }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
      {children}
    </p>
  );
}

function FactRow({ item }: { item: FactItem }) {
  const Icon = item.icon;
  const content = (
    <>
      <Icon aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-bold text-slate-950">
          {item.label}
        </span>
        <span className="mt-0.5 block break-words text-sm font-medium leading-5 text-primary [overflow-wrap:anywhere]">
          {item.value}
        </span>
      </span>
    </>
  );

  const className =
    "flex w-full min-w-0 gap-3 rounded-xl p-2 transition hover:bg-primary/[0.05]";

  if (item.href) {
    return (
      <Link href={item.href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

function ProgrammeFactsPanel({ facts }: { facts: FactItem[] }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
      <SectionKicker>Programme Facts</SectionKicker>
      <dl className="mt-3 grid min-w-0 gap-1.5">
        {facts.map((item) => (
          <FactRow key={item.label} item={item} />
        ))}
      </dl>
    </section>
  );
}

function SectionNav({ sections }: { sections: DetailSection[] }) {
  return (
    <section className="min-w-0 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
      <SectionKicker>Programme Sections</SectionKicker>
      <nav aria-label="Programme sections" className="mt-3">
        <ul className="divide-y divide-slate-100">
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="group flex min-h-10 items-center gap-3 py-2 text-sm font-medium text-slate-700 transition hover:text-primary"
                >
                  <Icon aria-hidden className="h-4 w-4 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1">{section.title}</span>
                  <ArrowRight
                    aria-hidden
                    className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary"
                  />
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </section>
  );
}

function HeroFactStrip({ facts }: { facts: FactItem[] }) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
      {facts.slice(0, 4).map((item) => {
        const Icon = item.icon;

        return (
          <div key={item.label} className="flex min-h-[5rem] min-w-0 gap-3 bg-white p-4">
            <Icon aria-hidden className="h-5 w-5 shrink-0 text-primary" />
            <span className="min-w-0">
              <span className="block text-[0.68rem] font-bold uppercase leading-4 text-slate-500">
                {item.label}
              </span>
              <span className="mt-1 block break-words text-sm font-bold leading-5 text-slate-950">
                {item.value}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ProgrammeHero({
  title,
  summary,
  brochureId,
  facts,
}: {
  title: string;
  summary: string;
  brochureId?: string | null;
  facts: FactItem[];
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-0 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 px-5 py-6 sm:px-7 lg:px-8">
          <SectionKicker>Programme Overview</SectionKicker>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.05] text-slate-950 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-700 sm:text-base">
            {summary}
          </p>
          <div className="mt-6 flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/admissions/how-to-apply"
              className="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-white shadow-sm transition hover:bg-primary/90"
            >
              How to apply
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            {brochureId ? (
              <a
                href={publicFileUrl(brochureId) ?? undefined}
                className="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-full border border-primary/25 bg-white px-5 text-sm font-bold text-primary transition hover:border-primary hover:bg-primary/[0.06]"
              >
                Programme brief
                <Download aria-hidden className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </div>

        <div className="flex min-h-48 min-w-0 items-center justify-center border-t border-slate-200 bg-[linear-gradient(135deg,#eef4ff,#ffffff)] p-8 text-primary lg:border-l lg:border-t-0">
          <BookOpenCheck aria-hidden className="h-28 w-28 stroke-[1.15]" />
        </div>
      </div>
      <HeroFactStrip facts={facts} />
    </section>
  );
}

function DetailBlock({ section }: { section: DetailSection }) {
  const Icon = section.icon;

  return (
    <section
      id={section.id}
      className="min-w-0 scroll-mt-32 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/[0.08] text-primary ring-1 ring-primary/10">
          <Icon aria-hidden className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-slate-950">
            {section.title}
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-700 [overflow-wrap:anywhere]">
            {section.body}
          </p>
        </div>
      </div>
    </section>
  );
}

function ProgrammeTutors({
  programme,
}: {
  programme: ProgrammeDetailData["programme"];
}) {
  const tutors = sortedTutors(programme);
  if (!tutors.length) return null;

  return (
    <section className="min-w-0 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <SectionKicker>Programme Tutors</SectionKicker>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {tutors.map((tutor) => {
          const name = personDisplayName(tutor.person);
          const role = tutor.is_lead
            ? "Lead tutor"
            : formatLabel(tutor.role) ?? formatLabel(tutor.person?.academic_rank) ?? "Tutor";
          const href = tutor.person?.slug ? `/people/${tutor.person.slug}` : null;
          const content = (
            <>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">
                <Users aria-hidden className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold leading-6 text-slate-950">
                  {name}
                </span>
                <span className="mt-0.5 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  {role}
                </span>
              </span>
            </>
          );

          if (href) {
            return (
              <Link
                key={tutor.id}
                href={href}
                className="group flex gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-primary/30 hover:bg-primary/[0.04]"
              >
                {content}
              </Link>
            );
          }

          return (
            <article key={tutor.id} className="flex min-w-0 gap-3 rounded-2xl border border-slate-200 p-4">
              {content}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ProgrammeIntakes({
  programme,
}: {
  programme: ProgrammeDetailData["programme"];
}) {
  const intakes = programme?.intakes ?? [];
  if (!intakes.length) return null;

  return (
    <section className="min-w-0 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <SectionKicker>Available Intakes</SectionKicker>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {intakes.map((item) => (
          <article key={item.id} className="min-w-0 rounded-2xl border border-slate-200 p-4">
            <div className="flex gap-3">
              <CalendarDays aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <h3 className="text-sm font-bold leading-6 text-slate-950">
                  {present(item.intake?.name) ?? "Published intake"}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600 [overflow-wrap:anywhere]">
                  {[
                    item.intake?.is_open ? "Open" : null,
                    item.slots_available ? `${item.slots_available} slots` : null,
                    item.application_deadline
                      ? `Deadline ${formatDate(item.application_deadline)}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "Availability details are published by admissions."}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AdmissionPathway() {
  const steps = [
    {
      title: "Check requirements",
      body: "Review the entry requirements and minimum qualifications.",
      icon: ClipboardCheck,
    },
    {
      title: "Apply online",
      body: "Submit your application through the university admissions portal.",
      icon: FileText,
    },
    {
      title: "Assessment",
      body: "Complete any interviews, assessments, or document checks when required.",
      icon: Users,
    },
    {
      title: "Receive offer",
      body: "Successful applicants receive admission communication from the university.",
      icon: CheckCircle2,
    },
  ];

  return (
    <section className="min-w-0 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-950 text-white shadow-sm">
      <div className="px-5 py-5 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-secondary">
          Admission Pathway
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight">
          From programme choice to application
        </h2>
      </div>
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-px bg-white/10 md:grid-cols-2">
        {steps.map((step) => {
          const Icon = step.icon;

          return (
            <div key={step.title} className="min-w-0 bg-slate-950 p-5">
              <Icon aria-hidden className="h-5 w-5 text-secondary" />
              <h3 className="mt-3 text-sm font-bold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/70">{step.body}</p>
            </div>
          );
        })}
      </div>
      <div className="border-t border-white/10 p-5 sm:p-6">
        <Link
          href="/admissions/how-to-apply"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-slate-950 transition hover:bg-white/90"
        >
          Start application guidance
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function RelatedProgrammes({
  programmes,
}: {
  programmes: ProgrammeDetailData["relatedProgrammes"];
}) {
  if (!programmes.length) return null;

  return (
    <section className="min-w-0 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <SectionKicker>Related Programmes</SectionKicker>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {programmes.map((programme) => (
          <Link
            key={programme.id}
            href={`/academics/programmes/${programme.slug}`}
            className="group min-w-0 rounded-2xl border border-slate-200 p-4 transition hover:border-primary/30 hover:bg-primary/[0.04]"
          >
            <p className="text-sm font-bold leading-6 text-slate-950">
              {programme.name}
            </p>
            <p className="mt-2 text-xs font-semibold text-slate-500">
              {[programme.level, programme.duration].filter(Boolean).join(" · ") ||
                "View programme"}
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">
              Open programme
              <ArrowRight
                aria-hidden
                className="h-4 w-4 transition group-hover:translate-x-0.5"
              />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function GuidancePanel() {
  return (
    <section className="min-w-0 rounded-[1.5rem] border border-primary/10 bg-primary/[0.06] p-4 shadow-sm">
      <PhoneIcon />
      <h2 className="mt-3 text-sm font-bold text-slate-950">Need guidance?</h2>
      <p className="mt-2 text-sm leading-6 text-slate-700">
        Admissions can help with programme choice, qualifications, and intake
        steps.
      </p>
      <Link
        href="/admissions/contact"
        className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary/90"
      >
        Contact admissions
        <ArrowRight aria-hidden className="h-4 w-4" />
      </Link>
    </section>
  );
}

function PhoneIcon() {
  return (
    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-primary ring-1 ring-primary/15">
      <Users aria-hidden className="h-5 w-5" />
    </span>
  );
}

export function ProgrammeDetailPage({ data }: { data: ProgrammeDetailData }) {
  const programme = data.programme;
  const title = programme?.name ?? titleFromSlug(data.slug);
  const departmentName =
    present(programme?.department?.name) ?? present(programme?.department_name);
  const departmentHref = programme?.department?.slug
    ? `/academics/departments/${programme.department.slug}`
    : undefined;
  const summary =
    bestText(programme?.about, programme?.objectives, programme?.entry_requirements) ??
    "Programme information will appear here when the public record is published.";
  const status = data.sourceBacked ? "Programme record" : "Programme overview";
  const tutors = sortedTutors(programme);
  const leadTutor = tutors.find((tutor) => tutor.is_lead);

  const facts: FactItem[] = [
    { label: "Level", value: present(programme?.level) ?? "Not published", icon: GraduationCap },
    { label: "Duration", value: present(programme?.duration) ?? "Not published", icon: CalendarDays },
    { label: "Mode", value: present(programme?.mode_of_study) ?? "Not published", icon: Users },
    {
      label: "Department",
      value: departmentName ?? "Not published",
      icon: Building2,
      href: departmentHref,
    },
    { label: "Programme code", value: present(programme?.code) ?? "Not published", icon: FileText },
    {
      label: "Intakes",
      value: formatIntakes(programme?.intake_months) ?? "Confirm with admissions",
      icon: CalendarDays,
    },
    {
      label: "Credits",
      value: present(programme?.credits_required) ?? "Not published",
      icon: ListChecks,
    },
    {
      label: "Lead tutor",
      value: leadTutor ? personDisplayName(leadTutor.person) : "Not published",
      icon: Users,
      href: leadTutor?.person?.slug ? `/people/${leadTutor.person.slug}` : undefined,
    },
    {
      label: "Updated",
      value: formatDate(programme?.updated_at) ?? status,
      icon: CheckCircle2,
    },
  ];

  const capacityText = [
    programme?.min_students ? `Minimum cohort: ${programme.min_students}` : null,
    programme?.max_students ? `Maximum cohort: ${programme.max_students}` : null,
  ]
    .filter(Boolean)
    .join(". ");
  const accreditationBody =
    bestText(programme?.accreditation_status, programme?.accrediting_body) ||
    capacityText ||
    "Accreditation and capacity details have not been published yet.";

  const sections: DetailSection[] = [
    {
      id: "requirements",
      title: "Entry requirements",
      body: bestText(programme?.entry_requirements) ?? "Entry requirements have not been published yet. Confirm the current requirement set through admissions before applying.",
      icon: ClipboardCheck,
    },
    {
      id: "curriculum",
      title: "Curriculum overview",
      body: bestText(programme?.curriculum_overview, programme?.objectives) ?? "Curriculum details have not been published yet. The programme record will show learning focus and structure .",
      icon: Library,
    },
    {
      id: "careers",
      title: "Career prospects",
      body: bestText(programme?.career_prospects) ?? "Career pathway information has not been published yet.",
      icon: Sparkles,
    },
    {
      id: "accreditation",
      title: "Accreditation and capacity",
      body: accreditationBody,
      icon: CheckCircle2,
    },
  ];

  return (
    <PageShell>
      <AboutPageLenis>
        <section className="w-full bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_68%,#f6f8fc_100%)] px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <BreadcrumbTrail
            items={[
              { label: "Academics", href: "/academics" },
              { label: "Programmes", href: "/academics/programmes" },
              { label: title },
            ]}
          />

          <div className="mt-5 grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-[minmax(220px,0.2fr)_minmax(0,1fr)_minmax(260px,0.22fr)] 2xl:grid-cols-[minmax(240px,0.18fr)_minmax(0,1fr)_minmax(300px,0.22fr)] xl:items-start">
            <aside className="hidden min-w-0 space-y-4 xl:sticky xl:top-28 xl:block">
              <SectionNav sections={sections} />
            </aside>

            <ScrollReveal as="main" className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4">
              <ProgrammeHero
                title={title}
                summary={summary}
                brochureId={programme?.brochure_id}
                facts={facts}
              />

              <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3 xl:hidden">
                <ProgrammeFactsPanel facts={facts} />
              </div>

              <section
                id="overview"
                className="min-w-0 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <SectionKicker>Learning Focus</SectionKicker>
                <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-slate-950">
                  What this programme covers
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-700 [overflow-wrap:anywhere]">
                  {bestText(programme?.objectives, programme?.about) ??
                    "The programme overview will show learning outcomes and academic focus ."}
                </p>
              </section>

              {sections.map((section) => (
                <DetailBlock key={section.id} section={section} />
              ))}

              <ProgrammeTutors programme={programme} />
              <ProgrammeIntakes programme={programme} />
              <AdmissionPathway />
              <RelatedProgrammes programmes={data.relatedProgrammes} />
            </ScrollReveal>

            <aside className="hidden min-w-0 space-y-4 xl:sticky xl:top-28 xl:block">
              <ProgrammeFactsPanel facts={facts} />
              <GuidancePanel />
            </aside>
          </div>
        </section>
      </AboutPageLenis>
    </PageShell>
  );
}
