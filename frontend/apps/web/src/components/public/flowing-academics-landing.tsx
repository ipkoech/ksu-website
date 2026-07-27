import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  Landmark,
} from "lucide-react";
import type { ActiveIntake } from "@/lib/get-academics";
import type { AcademicOrganization } from "@/lib/public-team-data";
import type { PublicCard, PublicPageConfig } from "./section-page";
import { PublicImage } from "./public-image";

const quickLinks = [
  ["Find a programme", "/academics/programmes", BookOpen],
  ["Apply now", "/admissions/how-to-apply", GraduationCap],
  ["Admissions guide", "/admissions", Landmark],
  ["Academic calendar", "/academics/calendar", CalendarDays],
  ["Examinations", "/academics/examinations", ClipboardCheck],
] as const;

function sectionByEyebrow(config: PublicPageConfig, value: string) {
  return config.sections.find((section) =>
    section.eyebrow.toLowerCase().includes(value),
  );
}

function Leader({
  name,
  title,
  photo,
  href,
  small = false,
}: {
  name: string;
  title?: string | null;
  photo?: string | null;
  href?: string | null;
  small?: boolean;
}) {
  const content = (
    <>
      <div
        className={`relative shrink-0 overflow-hidden rounded-full bg-primary/10 ${small ? "h-10 w-10" : "h-14 w-14"}`}
      >
        <PublicImage
          src={photo}
          alt={name}
          ratio="fill"
          className="h-full w-full rounded-full"
          sizes={small ? "40px" : "56px"}
        />
      </div>
      <span className="min-w-0">
        <span
          className={`block truncate font-semibold text-foreground ${small ? "text-xs" : "text-sm"}`}
        >
          {name}
        </span>
        <span className="mt-1 block truncate text-xs text-muted-foreground">
          {title ?? "Academic leader"}
        </span>
      </span>
      {href ? (
        <ArrowRight
          aria-hidden
          className="ml-auto h-4 w-4 shrink-0 text-primary"
        />
      ) : null}
    </>
  );

  return href ? (
    <Link
      href={href}
      className="group flex min-w-0 items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
    >
      {content}
    </Link>
  ) : (
    <div className="flex min-w-0 items-center gap-3">{content}</div>
  );
}

function MosaicCard({
  card,
  className = "",
}: {
  card: PublicCard;
  className?: string;
}) {
  const inner = (
    <>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary">
        {card.eyebrow ?? "Academic record"}
      </p>
      <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold leading-tight text-foreground">
        {card.title}
      </h3>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
        {card.body}
      </p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
        {card.action ?? "View record"}
        <ArrowRight
          aria-hidden
          className="h-4 w-4 transition group-hover:translate-x-1"
        />
      </span>
    </>
  );

  return card.href ? (
    <Link
      href={card.href}
      className={`group block rounded-2xl border border-primary/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${className}`}
    >
      {inner}
    </Link>
  ) : (
    <div
      className={`rounded-2xl border border-primary/10 bg-white p-5 shadow-sm ${className}`}
    >
      {inner}
    </div>
  );
}

export function FlowingAcademicsLanding({
  config,
  academicLeadership,
  activeIntake,
}: {
  config: PublicPageConfig;
  academicLeadership?: AcademicOrganization | null;
  activeIntake?: ActiveIntake | null;
}) {
  const schools = sectionByEyebrow(config, "academic schools");
  const programmes = sectionByEyebrow(config, "programme finder");
  const dvc = academicLeadership?.tiers.find((tier) => tier.key === "dvc")
    ?.members[0];
  const registrar = academicLeadership?.tiers.find(
    (tier) => tier.key === "registrar",
  )?.members[0];
  const deans =
    academicLeadership?.tiers.find((tier) => tier.key === "deans")?.members ??
    [];
  const featuredProgrammes = programmes?.cards.slice(0, 3) ?? [];
  const schoolCards = schools?.cards.slice(0, 8) ?? [];

  return (
    <div className="flowing-academics bg-[#f6f3eb]">
      <nav
        aria-label="Academic and admissions quick links"
        className="mx-auto max-w-[1680px] px-4 py-5 sm:px-6 lg:px-8"
      >
        <div className="grid overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm sm:grid-cols-2 lg:grid-cols-5">
          {quickLinks.map(([label, href, Icon], index) => (
            <Link
              key={href}
              href={href}
              className="group flex min-h-16 items-center gap-3 border-b border-primary/10 px-4 py-3 transition hover:bg-primary hover:text-white sm:border-r lg:border-b-0 last:border-r-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-secondary"
            >
              <span className="text-[10px] font-bold text-secondary">
                0{index + 1}
              </span>
              <Icon
                aria-hidden
                className="h-4 w-4 text-primary group-hover:text-secondary"
              />
              <span className="min-w-0 text-sm font-semibold">{label}</span>
              <ArrowRight
                aria-hidden
                className="ml-auto h-4 w-4 opacity-60 transition group-hover:translate-x-1"
              />
            </Link>
          ))}
        </div>
      </nav>

      <section className="mx-auto max-w-[1680px] px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative overflow-hidden rounded-3xl bg-primary p-7 text-white sm:p-9">
            <span className="absolute -right-10 -top-16 font-[family-name:var(--font-display)] text-[13rem] leading-none text-white/[0.06]">
              01
            </span>
            <p className="relative text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              From academic leadership
            </p>
            <h2 className="relative mt-4 max-w-xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight sm:text-4xl">
              A connected academic community.
            </h2>
            <p className="relative mt-5 max-w-lg text-sm leading-7 text-white/75">
              {config.body}
            </p>
            {dvc ? (
              <div className="relative mt-8 flex items-center gap-4 border-t border-white/15 pt-6">
                <div className="overflow-hidden rounded-full ring-2 ring-secondary/70">
                  <PublicImage
                    src={dvc.photo_url}
                    alt={dvc.name}
                    ratio="profile"
                    className="h-16 w-16"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold">{dvc.name}</p>
                  <p className="mt-1 text-xs text-white/60">
                    {dvc.title ?? dvc.position ?? "DVC · ARSA"}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm sm:p-9">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-[url('/images/Home/KSUGreenLandscapingMay2026-3885.jpg')] bg-cover bg-center opacity-20" />
            <div className="relative">
              <p className="max-w-2xl text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                Message from the DVC, Academic, Research and Student Affairs
              </p>
              <p className="mt-5 max-w-2xl font-[family-name:var(--font-display)] text-2xl leading-tight text-foreground sm:text-3xl">
                {config.body}
              </p>
              {dvc?.profile_url ? (
                <Link
                  href={dvc.profile_url}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                >
                  Read the full message{" "}
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <div className="relative mt-5 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                Academic structure
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground">
                From the DVC to the schools.
              </h2>
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Leadership hierarchy
            </span>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
            <div className="rounded-2xl border border-primary/10 bg-[#f6f3eb] p-4">
              {dvc ? (
                <Leader
                  name={dvc.name}
                  title={dvc.title ?? dvc.position ?? "DVC · ARSA"}
                  photo={dvc.photo_url}
                  href={dvc.profile_url}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Academic leadership records will appear here.
                </p>
              )}
            </div>
            <div className="hidden h-px w-20 bg-secondary lg:block" />
            <div className="rounded-2xl border border-primary/10 bg-[#f6f3eb] p-4">
              {registrar ? (
                <Leader
                  name={registrar.name}
                  title={
                    registrar.title ??
                    registrar.position ??
                    "Registrar · Academics"
                  }
                  photo={registrar.photo_url}
                  href={registrar.profile_url}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Registrar record unavailable.
                </p>
              )}
            </div>
          </div>
          <div className="mt-5 border-t border-primary/10 pt-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary">
              Deans of schools
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {deans.slice(0, 8).map((leader) => (
                <div
                  key={leader.id}
                  className="rounded-xl border border-primary/10 p-3"
                >
                  <Leader
                    name={leader.name}
                    title={
                      leader.entity?.name ?? leader.title ?? leader.position
                    }
                    photo={leader.photo_url}
                    href={leader.profile_url}
                    small
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1680px] px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="grid gap-5 sm:grid-cols-2">
            {featuredProgrammes[0] ? (
              <Link
                href={featuredProgrammes[0].href ?? "/academics/programmes"}
                className="group relative min-h-[330px] overflow-hidden rounded-3xl bg-primary p-7 text-white sm:col-span-2 sm:p-9"
              >
                <PublicImage
                  src="/images/Home/OurKSU-82.jpg"
                  alt="Students at Kisii University"
                  ratio="fill"
                  className="absolute inset-0 h-full w-full opacity-45"
                  imageClassName="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(min-width: 1024px) 60vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent" />
                <div className="relative flex h-full flex-col justify-end">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                    Highlighted programmes
                  </p>
                  <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl">
                    {featuredProgrammes[0].title}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">
                    {featuredProgrammes[0].body}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-secondary">
                    {featuredProgrammes[0].action ?? "View programme"}
                    <ArrowRight aria-hidden className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ) : null}
            {featuredProgrammes.slice(1).map((card) => (
              <MosaicCard key={card.title} card={card} />
            ))}
          </div>
          <div className="grid gap-5">
            <div className="relative overflow-hidden rounded-3xl bg-secondary p-6 text-primary">
              <p className="text-xs font-bold uppercase tracking-[0.16em]">
                Admissions
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold">
                Your next intake.
              </h2>
              <p className="mt-3 text-sm leading-6">
                {activeIntake
                  ? `${activeIntake.name} is open for applications.`
                  : "Review admissions pathways and current application guidance."}
              </p>
              {activeIntake?.endDate ? (
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.12em]">
                  Applications close {activeIntake.endDate}
                </p>
              ) : null}
              <Link
                href={activeIntake ? "/admissions/how-to-apply" : "/admissions"}
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold"
              >
                {activeIntake ? "Apply now" : "View admissions"}
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </div>
            <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
              <PublicImage
                src="/images/Home/KSUGreenLandscaping.jpg"
                alt="Kisii University campus"
                ratio="news"
                className="h-36"
                imageClassName="object-cover"
              />
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                  Academic resources
                </p>
                <Link
                  href="/academics/calendar"
                  className="mt-3 flex items-center justify-between font-semibold text-foreground"
                >
                  Dates, calendars and examinations{" "}
                  <ArrowRight aria-hidden className="h-4 w-4 text-primary" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto grid max-w-[1680px] gap-8 lg:grid-cols-[0.65fr_1.35fr] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              Academic schools
            </p>
            <h2 className="mt-3 max-w-md font-[family-name:var(--font-display)] text-4xl font-semibold text-foreground">
              Find the school behind your programme.
            </h2>
            <Link
              href="/academics/schools"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
              View all schools <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-x-6 border-y border-primary/10 sm:grid-cols-2">
            {schoolCards.map((card, index) =>
              card.href ? (
                <Link
                  key={card.title}
                  href={card.href}
                  className="group flex items-start gap-3 border-b border-primary/10 py-4 last:border-b-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <span className="pt-1 text-xs font-bold text-secondary">
                    0{index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground group-hover:text-primary">
                      {card.title}
                    </span>
                    <span className="mt-1 block line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {card.body}
                    </span>
                  </span>
                  <ArrowRight
                    aria-hidden
                    className="mt-1 h-4 w-4 shrink-0 text-primary transition group-hover:translate-x-1"
                  />
                </Link>
              ) : null,
            )}
          </div>
        </div>
      </section>

      <section className="bg-primary px-4 py-10 text-white sm:px-6">
        <div className="mx-auto flex max-w-[1680px] flex-wrap items-center justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              Continue
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold">
              Choose your next academic step.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/academics/programmes"
              className="inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-3 text-sm font-semibold text-primary"
            >
              Browse programmes <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            <Link
              href="/admissions/how-to-apply"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white"
            >
              Start application <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
