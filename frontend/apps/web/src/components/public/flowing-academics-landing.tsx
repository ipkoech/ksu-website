import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  FileText,
  GraduationCap,
  Landmark,
} from "lucide-react";
import type { AcademicOrganization } from "@/lib/public-team-data";
import type { PublicCard, PublicPageConfig } from "./section-page";
import { PublicActionLink } from "./public-primitives";
import { PublicImage } from "./public-image";
import { PageShell } from "@/components/site-shell";

const quickLinkIcons = [
  Landmark,
  BookOpen,
  GraduationCap,
  CalendarDays,
  FileText,
];

function sectionByEyebrow(config: PublicPageConfig, value: string) {
  return config.sections.find((section) =>
    section.eyebrow.toLowerCase().includes(value),
  );
}

function linkedCard(card: PublicCard, className: string) {
  if (!card.href) return <div className={className}>{card.title}</div>;
  return (
    <Link href={card.href} className={className}>
      {card.title}
      <ArrowRight aria-hidden className="h-4 w-4" />
    </Link>
  );
}

function LeaderNode({
  name,
  title,
  photo,
  href,
  compact = false,
}: {
  name: string;
  title?: string | null;
  photo?: string | null;
  href?: string | null;
  compact?: boolean;
}) {
  const content = (
    <>
      <div
        className={`relative overflow-hidden rounded-full bg-primary/10 ${compact ? "h-11 w-11" : "h-16 w-16"}`}
      >
        <PublicImage
          src={photo}
          alt={name}
          ratio="fill"
          className="h-full w-full rounded-full"
          imageClassName="object-cover"
          sizes={compact ? "44px" : "64px"}
        />
      </div>
      <div className="min-w-0">
        <p
          className={`font-semibold text-foreground ${compact ? "text-sm" : "text-base"}`}
        >
          {name}
        </p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {title ?? "Academic leader"}
        </p>
      </div>
      {href ? (
        <ChevronRight
          aria-hidden
          className="ml-auto h-4 w-4 shrink-0 text-primary"
        />
      ) : null}
    </>
  );
  return href ? (
    <Link
      href={href}
      className="group flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
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
}: {
  config: PublicPageConfig;
  academicLeadership?: AcademicOrganization | null;
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
  const quickLinks = config.navItems.filter((item) => item.href).slice(0, 5);
  const featuredProgrammes = programmes?.cards.slice(0, 3) ?? [];
  const schoolCards = schools?.cards.slice(0, 8) ?? [];

  return (
    <PageShell>
      <div className="flowing-academics overflow-hidden bg-[#f6f3eb]">
        <section className="relative bg-primary text-white">
          <div className="mx-auto grid max-w-[1680px] lg:min-h-[560px] lg:grid-cols-[0.88fr_1.12fr]">
            <div className="relative z-10 flex flex-col justify-center px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-secondary">
                {config.eyebrow}
              </p>
              <h1 className="mt-5 max-w-xl font-[family-name:var(--font-display)] text-5xl font-semibold leading-[0.96] sm:text-6xl lg:text-7xl">
                Learn. Lead. Transform.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-8 text-white/75">
                {config.body}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {config.primaryAction ? (
                  <Link
                    href={config.primaryAction.href}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-secondary px-5 py-3 text-sm font-semibold text-primary shadow-sm transition hover:bg-secondary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                  >
                    {config.primaryAction.label}
                    <ArrowRight aria-hidden className="h-4 w-4" />
                  </Link>
                ) : null}
                {config.secondaryActions?.slice(0, 1).map((action) => (
                  <PublicActionLink key={action.label} action={action} />
                ))}
              </div>
            </div>
            <div className="relative min-h-[320px] overflow-hidden lg:min-h-0">
              <PublicImage
                src="/images/homepage/kisii-administration-campus.jpg"
                alt="Kisii University campus"
                ratio="fill"
                className="absolute inset-0 h-full w-full"
                imageClassName="object-cover"
                priority
                sizes="(min-width: 1024px) 56vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/10 to-transparent lg:from-primary/70 lg:via-primary/10" />
              <div className="absolute bottom-6 left-5 border-l-2 border-secondary pl-4 text-xs font-semibold uppercase tracking-[0.16em] text-white sm:left-8">
                Schools · Programmes · People
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-1/2 hidden h-10 w-10 -translate-x-1/2 translate-y-1/2 rotate-45 bg-[#f6f3eb] lg:block" />
        </section>

        <nav
          aria-label="Academic quick links"
          className="relative z-10 mx-auto -mt-1 max-w-[1320px] px-4 sm:px-6 lg:-mt-10"
        >
          <div className="grid border border-primary/10 bg-white shadow-xl shadow-primary/10 sm:grid-cols-2 lg:grid-cols-5">
            {quickLinks.map((item, index) => {
              const Icon = quickLinkIcons[index % quickLinkIcons.length];
              return item.href ? (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex min-h-20 items-center gap-3 border-b border-primary/10 px-4 py-4 transition hover:bg-primary hover:text-white sm:border-r lg:border-b-0 last:border-r-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-secondary"
                >
                  <span className="text-xs font-bold text-secondary">
                    0{index + 1}
                  </span>
                  <Icon
                    aria-hidden
                    className="h-5 w-5 text-primary group-hover:text-secondary"
                  />
                  <span className="min-w-0 text-sm font-semibold">
                    {item.title}
                  </span>
                  <ArrowRight
                    aria-hidden
                    className="ml-auto h-4 w-4 opacity-60 transition group-hover:translate-x-1"
                  />
                </Link>
              ) : null;
            })}
          </div>
        </nav>

        <section className="mx-auto grid max-w-[1320px] gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:py-28">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
              From academic leadership
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
              A connected academic community.
            </h2>
            <div className="mt-6 h-px w-20 bg-secondary" />
          </div>
          <div className="relative grid gap-6 rounded-[1.75rem] bg-white p-6 shadow-xl shadow-primary/10 sm:grid-cols-[auto_1fr] sm:items-center sm:p-10">
            {dvc ? (
              <LeaderNode
                name={dvc.name}
                title={dvc.title ?? dvc.position}
                photo={dvc.photo_url}
                href={dvc.profile_url}
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
                KSU
              </div>
            )}
            <div className="sm:border-l sm:border-primary/10 sm:pl-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                Message from the DVC, Academic, Research and Student Affairs
              </p>
              <p className="mt-4 text-lg leading-8 text-foreground">
                {config.body}
              </p>
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
        </section>

        <section className="relative bg-[#0a3b30] px-4 py-20 text-white sm:px-6 lg:py-28">
          <div className="mx-auto max-w-[1320px]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
              Academic leadership
            </p>
            <div className="mt-4 grid gap-12 lg:grid-cols-[0.34fr_0.66fr]">
              <h2 className="max-w-sm font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight sm:text-5xl">
                The structure behind learning and scholarship.
              </h2>
              <div className="relative min-w-0 border-l border-secondary/50 pl-6 sm:pl-10">
                <div className="border-b border-white/15 pb-7">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                    DVC · ARSA
                  </p>
                  {dvc ? (
                    <div className="mt-5 max-w-sm rounded-2xl bg-white p-5 text-foreground">
                      <LeaderNode
                        name={dvc.name}
                        title={dvc.title ?? dvc.position}
                        photo={dvc.photo_url}
                        href={dvc.profile_url}
                      />
                    </div>
                  ) : null}
                </div>
                <div className="border-b border-white/15 py-7">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                    Registrar · Academics
                  </p>
                  {registrar ? (
                    <div className="mt-5 max-w-sm rounded-2xl bg-white p-5 text-foreground">
                      <LeaderNode
                        name={registrar.name}
                        title={registrar.title ?? registrar.position}
                        photo={registrar.photo_url}
                        href={registrar.profile_url}
                      />
                    </div>
                  ) : null}
                </div>
                <div className="pt-7">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                    Deans of Schools
                  </p>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {deans.slice(0, 6).map((leader) => (
                      <div
                        key={leader.id}
                        className="rounded-2xl border border-white/10 bg-white/[0.08] p-4"
                      >
                        <div className="[&_*]:text-white">
                          <LeaderNode
                            name={leader.name}
                            title={
                              leader.entity?.name ??
                              leader.title ??
                              leader.position
                            }
                            photo={leader.photo_url}
                            href={leader.profile_url}
                            compact
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1320px] px-4 py-20 sm:px-6 lg:py-28">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
                Programme finder
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold text-foreground sm:text-5xl">
                Highlighted programmes.
              </h2>
            </div>
            <Link
              href="/academics/programmes"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
              Browse all programmes{" "}
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            {featuredProgrammes[0] ? (
              <Link
                href={featuredProgrammes[0].href ?? "/academics/programmes"}
                className="group relative min-h-[340px] overflow-hidden rounded-[1.5rem] bg-primary p-7 text-white sm:p-10"
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
                    {featuredProgrammes[0].eyebrow ?? "Featured programme"}
                  </p>
                  <h3 className="mt-3 max-w-xl font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl">
                    {featuredProgrammes[0].title}
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-white/75">
                    {featuredProgrammes[0].body}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-secondary">
                    {featuredProgrammes[0].action ?? "View programme"}
                    <ArrowRight
                      aria-hidden
                      className="h-4 w-4 transition group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </Link>
            ) : null}
            <div className="grid gap-5">
              {featuredProgrammes.slice(1).map((card) => (
                <div
                  key={card.title}
                  className="rounded-[1.5rem] border border-primary/10 bg-white p-6 shadow-sm"
                >
                  {linkedCard(
                    card,
                    "group flex items-center justify-between gap-4 text-lg font-semibold text-foreground transition hover:text-primary",
                  )}
                  {card.body ? (
                    <p className="mt-4 text-sm leading-7 text-muted-foreground">
                      {card.body}
                    </p>
                  ) : null}
                  <span className="mt-6 block text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                    Programme record
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto grid max-w-[1320px] gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
            <div className="relative min-h-[380px] overflow-hidden rounded-[1.5rem]">
              <PublicImage
                src="/images/Home/KSUGreenLandscaping.jpg"
                alt="Kisii University campus grounds"
                ratio="fill"
                className="absolute inset-0 h-full w-full"
                imageClassName="object-cover"
                sizes="(min-width: 1024px) 45vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent" />
              <p className="absolute bottom-6 left-6 text-xs font-bold uppercase tracking-[0.18em] text-white">
                Our academic schools
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
                Schools
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold text-foreground sm:text-5xl">
                Find the community behind your programme.
              </h2>
              <div className="mt-8 divide-y divide-primary/10 border-y border-primary/10">
                {schoolCards.map((card, index) =>
                  card.href ? (
                    <Link
                      key={card.title}
                      href={card.href}
                      className="group flex items-center gap-4 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      <span className="w-8 text-xs font-bold text-secondary">
                        0{index + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-base font-semibold text-foreground group-hover:text-primary">
                          {card.title}
                        </span>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          {card.body}
                        </span>
                      </span>
                      <ArrowRight
                        aria-hidden
                        className="h-4 w-4 text-primary transition group-hover:translate-x-1"
                      />
                    </Link>
                  ) : null,
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-primary px-4 py-16 text-white sm:px-6 lg:py-20">
          <div className="mx-auto flex max-w-[1320px] flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
                Next step
              </p>
              <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-4xl font-semibold sm:text-5xl">
                Find your place at Kisii University.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/academics/programmes"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-secondary px-5 py-3 text-sm font-semibold text-primary shadow-sm transition hover:bg-secondary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
              >
                Browse all programmes{" "}
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
              <Link
                href="/admissions/how-to-apply"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-transparent px-5 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
              >
                Start application <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
