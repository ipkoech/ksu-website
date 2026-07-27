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
import type { PublicPageConfig } from "./section-page";
import { PublicImage } from "./public-image";

const quickLinks = [
  ["Find a programme", "/academics/programmes", BookOpen],
  ["Apply now", "/admissions/how-to-apply", GraduationCap],
  ["Admissions guide", "/admissions", Landmark],
  ["Academic calendar", "/academics/calendar", CalendarDays],
  ["Examinations", "/academics/examinations", ClipboardCheck],
] as const;

function cardsFor(config: PublicPageConfig, label: string) {
  return (
    config.sections.find((section) =>
      section.eyebrow.toLowerCase().includes(label),
    )?.cards ?? []
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
        className={`relative shrink-0 overflow-hidden rounded-full bg-primary/10 ${small ? "h-9 w-9" : "h-16 w-16"}`}
      >
        <PublicImage
          src={photo}
          alt={name}
          ratio="fill"
          className="h-full w-full rounded-full"
          sizes={small ? "36px" : "64px"}
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

export function FlowingAcademicsLanding({
  config,
  academicLeadership,
  activeIntake,
}: {
  config: PublicPageConfig;
  academicLeadership?: AcademicOrganization | null;
  activeIntake?: ActiveIntake | null;
}) {
  const programmeCards = cardsFor(config, "programme finder").slice(0, 4);
  const schoolCards = cardsFor(config, "academic schools").slice(0, 8);
  const dvc = academicLeadership?.tiers.find((tier) => tier.key === "dvc")
    ?.members[0];
  const registrar = academicLeadership?.tiers.find(
    (tier) => tier.key === "registrar",
  )?.members[0];
  const deans =
    academicLeadership?.tiers
      .find((tier) => tier.key === "deans")
      ?.members.slice(0, 8) ?? [];

  return (
    <div className="flowing-academics bg-[#f6f3eb]">
      <nav
        aria-label="Academic and admissions quick links"
        className="mx-auto max-w-[1680px] px-4 py-6 sm:px-6 lg:px-8"
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-primary/15 py-4">
          <span className="mr-2 text-xs font-bold uppercase tracking-[0.18em] text-secondary">
            Quick access
          </span>
          {quickLinks.map(([label, href, Icon]) => (
            <Link
              key={href}
              href={href}
              className="group inline-flex items-center gap-2 text-sm font-semibold text-foreground transition hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              <Icon aria-hidden className="h-4 w-4 text-primary" />
              {label}
              <ArrowRight
                aria-hidden
                className="h-3 w-3 text-secondary transition group-hover:translate-x-1"
              />
            </Link>
          ))}
        </div>
      </nav>

      <section className="mx-auto max-w-[1680px] px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              Academic leadership
            </p>
            <h2 className="mt-3 max-w-xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
              The people guiding learning and scholarship.
            </h2>
            <div className="mt-8 border-l-2 border-secondary pl-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary">
                Message from the DVC, Academic, Research and Student Affairs
              </p>
              <p className="mt-4 text-lg leading-8 text-foreground">
                {config.body}
              </p>
              {dvc ? (
                <div className="mt-7 flex items-center gap-4">
                  <PublicImage
                    src={dvc.photo_url}
                    alt={dvc.name}
                    ratio="profile"
                    className="h-14 w-14 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-semibold">{dvc.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {dvc.title ?? dvc.position ?? "DVC · ARSA"}
                    </p>
                  </div>
                </div>
              ) : null}
              {dvc?.profile_url ? (
                <Link
                  href={dvc.profile_url}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                >
                  Read the full message{" "}
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
          </div>
          <div className="relative border-l border-primary/20 pl-6 sm:pl-10">
            <div className="absolute -left-1 top-0 h-16 w-0.5 bg-secondary" />
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
              Leadership hierarchy
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="border-b border-primary/15 pb-5">
                {dvc ? (
                  <Leader
                    name={dvc.name}
                    title={dvc.title ?? dvc.position ?? "DVC · ARSA"}
                    photo={dvc.photo_url}
                    href={dvc.profile_url}
                  />
                ) : null}
              </div>
              <div className="border-b border-primary/15 pb-5">
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
                ) : null}
              </div>
            </div>
            <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-secondary">
              Deans of schools
            </p>
            <div className="mt-4 grid gap-x-6 sm:grid-cols-2">
              {deans.map((leader) => (
                <div
                  key={leader.id}
                  className="border-b border-primary/10 py-4"
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

      <section className="border-y border-primary/10 bg-white px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto grid max-w-[1680px] gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              Academic discovery
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-foreground sm:text-5xl">
              Start with a programme. Find your school.
            </h2>
            <div className="mt-8 overflow-hidden rounded-2xl">
              <PublicImage
                src="/images/Home/OurKSU-82.jpg"
                alt="Students at Kisii University"
                ratio="hero"
                className="h-[360px]"
                imageClassName="object-cover"
                sizes="(min-width: 1024px) 65vw, 100vw"
              />
            </div>
          </div>
          <div className="lg:pt-16">
            <div className="border-t border-primary/15">
              {programmeCards.map((card, index) =>
                card.href ? (
                  <Link
                    key={card.title}
                    href={card.href}
                    className="group block border-b border-primary/15 py-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <span className="flex items-start gap-4">
                      <span className="pt-1 text-xs font-bold text-secondary">
                        0{index + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-[family-name:var(--font-display)] text-xl font-semibold text-foreground group-hover:text-primary">
                          {card.title}
                        </span>
                        <span className="mt-2 block text-sm leading-6 text-muted-foreground">
                          {card.body}
                        </span>
                      </span>
                      <ArrowRight
                        aria-hidden
                        className="mt-1 h-4 w-4 shrink-0 text-primary transition group-hover:translate-x-1"
                      />
                    </span>
                  </Link>
                ) : null,
              )}
            </div>
            <div className="mt-8 border-l-2 border-secondary pl-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                Admissions
              </p>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
                {activeIntake ? activeIntake.name : "Plan your application"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {activeIntake?.endDate
                  ? `Applications close ${activeIntake.endDate}.`
                  : "Review requirements, dates, and the application process."}
              </p>
              <Link
                href={activeIntake ? "/admissions/how-to-apply" : "/admissions"}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
              >
                {activeIntake ? "Apply now" : "View admissions"}
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1680px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.55fr_1.45fr] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              Schools
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-foreground">
              The communities behind the programmes.
            </h2>
            <Link
              href="/academics/schools"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
              View all schools <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-x-8 border-y border-primary/15 sm:grid-cols-2">
            {schoolCards.map((card, index) =>
              card.href ? (
                <Link
                  key={card.title}
                  href={card.href}
                  className="group flex gap-4 border-b border-primary/10 py-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <span className="text-xs font-bold text-secondary">
                    0{index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-foreground group-hover:text-primary">
                      {card.title}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">
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
              Next step
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold">
              Choose your academic path.
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
