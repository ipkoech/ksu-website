import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  FlaskConical,
  Handshake,
  Quote,
} from "lucide-react";
import { ScrollReveal, ScrollRevealGroup } from "@ksu/ui/components";
import { Badge, FilledBadge, StatusMessage } from "../components/research-ui";
import {
  compactText,
  formatLabel,
  getResearchOverviewData,
} from "../lib/research-public-data";

export const dynamic = "force-dynamic";

const workflowCards = [
  {
    title: "Discover Research",
    body: "Browse active projects, research programmes, centers, facilities, and expertise that define the university research agenda.",
    href: "/projects",
    label: "Explore projects",
    icon: FlaskConical,
  },
  {
    title: "Publish and Preserve",
    body: "Follow publications, outputs, repositories, reports, datasets, and knowledge products that make research reusable.",
    href: "/publications",
    label: "Browse outputs",
    icon: BookOpenCheck,
  },
  {
    title: "Partner and Fund",
    body: "Connect with grant calls, scholarships, partner networks, endowments, consultancies, and translation pathways.",
    href: "/funding",
    label: "Find opportunities",
    icon: Handshake,
  },
];

const imageCards = [
  {
    title: "Innovation & Commercialization",
    body: "Technology transfer, startups, licensing, prototypes, and partner-supported innovation move discoveries into use.",
    href: "/innovations",
    image: "/images/research/innovation-partnerships.png",
    label: "Open innovation",
  },
  {
    title: "Community Impact",
    body: "Research outcomes connect with farmers, counties, communities, schools, industry, and public institutions.",
    href: "/community-impact",
    image: "/images/research/research-workflows.png",
    label: "View impact",
  },
  {
    title: "Metrics and Evidence",
    body: "Impact metrics, publications, grants, partnerships, and stories show the public value of research activity.",
    href: "/impact-metrics",
    image: "/images/research/research-hero.png",
    label: "View dashboard",
  },
];

export default async function ResearchPage() {
  const {
    projects,
    publications,
    grants,
    innovations,
    partners,
    updates,
    stats,
    errors,
  } = await getResearchOverviewData();
  const topStats = stats?.stats?.slice(0, 4) ?? [];

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchHomeHero topStats={topStats} />

      {errors.length > 0 ? (
        <section className="px-4 pt-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="mx-auto max-w-[1680px] space-y-3">
            {errors.map((error) => (
              <StatusMessage key={error} tone="error">
                {error}
              </StatusMessage>
            ))}
          </div>
        </section>
      ) : null}

      <ScrollReveal as="section" className="bg-white px-4 py-12 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto grid max-w-[1680px] gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <SectionKicker>Core Workflows</SectionKicker>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
              Research support organized around the work people come here to do.
            </h2>
          </div>
          <p className="max-w-4xl text-base leading-8 text-slate-600">
            The Research, Extension, Innovation and Resource Mobilization portal
            brings together discovery, funding, publications, collaboration, and
            impact evidence in one public-facing experience.
          </p>
        </div>

        <ScrollRevealGroup
          className="mx-auto mt-6 grid max-w-[1680px] gap-5 md:grid-cols-3"
          staggerDelay={80}
        >
          {workflowCards.map((card) => (
            <WorkflowCard key={card.title} {...card} />
          ))}
        </ScrollRevealGroup>
      </ScrollReveal>

      <ScrollReveal as="section" className="border-y border-slate-200 bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto grid max-w-[1680px] gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-center">
          <div className="relative min-h-[360px] overflow-hidden rounded-lg bg-slate-200 shadow-sm lg:min-h-[520px]">
            <Image
              src="/images/research/registrar-reirm.png"
              alt="Registrar for research, extension, innovation and resource mobilization in a university office"
              fill
              sizes="(min-width: 1024px) 54vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:p-7">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Quote aria-hidden className="h-5 w-5" />
            </span>
            <SectionKicker className="mt-5">Message from the Registrar, REIRM</SectionKicker>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950">
              Research is our bridge between knowledge, public service, and resource mobilization.
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-700">
              The Directorate of Research, Extension, Innovation and Resource
              Mobilization exists to make scholarly work easier to discover,
              easier to support, and easier to translate into practical value
              for communities, partners, students, and the university.
            </p>
            <p className="mt-4 text-sm font-semibold leading-7 text-slate-600">
              We invite researchers, funders, industry, government, alumni, and
              community partners to use this portal as the front door to Kisii
              University research collaboration.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ActionLink href="/connect">Contact REIRM</ActionLink>
              <ActionLink href="/partners" variant="outline">Partner with us</ActionLink>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal as="section" className="bg-white px-4 py-12 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto max-w-[1680px]">
          <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <SectionKicker>Live Research Records</SectionKicker>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
                Current work from the Research service.
              </h2>
            </div>
            <p className="max-w-4xl text-base leading-8 text-slate-600">
              Projects, publications, funding calls, and updates are pulled from
              the backend service, using the same data contracts as the admin
              interface.
            </p>
          </div>

          <ScrollRevealGroup className="mt-6 grid gap-5 xl:grid-cols-3" staggerDelay={70}>
            <RecordPanel title="Projects" href="/projects" image="/images/research/research-workflows.png">
              {projects.data.slice(0, 4).map((item) => (
                <RecordRow
                  key={item.id}
                  title={item.title}
                  meta={[
                    formatLabel(item.project_type),
                    formatLabel(item.status),
                    `${item.progress_percentage ?? 0}% complete`,
                  ]}
                />
              ))}
            </RecordPanel>
            <RecordPanel title="Publications" href="/publications" image="/images/research/research-hero.png">
              {publications.data.slice(0, 4).map((item) => (
                <RecordRow
                  key={item.id}
                  title={item.title}
                  meta={[
                    item.journal_name,
                    item.year,
                    formatLabel(item.publication_type),
                  ]}
                />
              ))}
            </RecordPanel>
            <RecordPanel title="Funding and updates" href="/funding" image="/images/research/innovation-partnerships.png">
              {[...grants.data.slice(0, 2), ...updates.data.slice(0, 2)].map(
                (item) => (
                  <RecordRow
                    key={item.id}
                    title={
                      compactText(item.title) ||
                      compactText("name" in item ? item.name : undefined) ||
                      compactText(item.id)
                    }
                    meta={[
                      formatLabel(
                        "category" in item
                          ? item.category
                          : "news_type" in item
                            ? item.news_type
                            : undefined,
                      ),
                      formatLabel(item.status),
                    ]}
                  />
                ),
              )}
            </RecordPanel>
          </ScrollRevealGroup>
        </div>
      </ScrollReveal>

      <ScrollReveal as="section" className="border-y border-slate-200 bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto max-w-[1680px]">
          <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <SectionKicker>Innovation and Collaboration</SectionKicker>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
                Translation, partnerships, and public value.
              </h2>
            </div>
            <p className="max-w-4xl text-base leading-8 text-slate-600">
              The portal highlights the people and partnerships that help
              research move from proposal to output, from lab to field, and from
              idea to institutional impact.
            </p>
          </div>

          <ScrollRevealGroup className="mt-6 grid gap-5 md:grid-cols-3" staggerDelay={75}>
            {imageCards.map((card) => (
              <ImageFeatureCard key={card.title} {...card} />
            ))}
          </ScrollRevealGroup>

          <ScrollRevealGroup className="mt-6 grid gap-5 lg:grid-cols-2" staggerDelay={70}>
            {innovations.data.slice(0, 3).map((item) => (
              <article
                key={item.id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)]"
              >
                <div className="flex flex-wrap gap-2">
                  <Badge>{formatLabel(item.innovation_type ?? "innovation")}</Badge>
                  {item.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
                </div>
                <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">
                  {item.title}
                </h3>
                {compactText(item.summary) || compactText(item.description) ? (
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {compactText(item.summary) || compactText(item.description)}
                  </p>
                ) : null}
              </article>
            ))}
            {partners.data.slice(0, 3).map((item) => (
              <article
                key={item.id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)]"
              >
                <div className="flex flex-wrap gap-2">
                  <Badge>{formatLabel(item.partner_type ?? "partner")}</Badge>
                  {item.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
                </div>
                <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">
                  {item.name}
                </h3>
                {compactText(item.about) || compactText(item.collaboration_areas) ? (
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {compactText(item.about) || compactText(item.collaboration_areas)}
                  </p>
                ) : null}
              </article>
            ))}
          </ScrollRevealGroup>
        </div>
      </ScrollReveal>
    </main>
  );
}

function ResearchHomeHero({
  topStats,
}: {
  topStats: Array<{ key: string; label: string; value: number | string; suffix?: string }>;
}) {
  return (
    <section className="relative min-h-[calc(100vh-130px)] overflow-hidden">
      <Image
        src="/images/research/research-hero.png"
        alt="University researchers collaborating across laboratory, data, and field research"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.86)_0%,rgba(15,23,42,0.68)_44%,rgba(15,23,42,0.22)_100%)]" />
      <div className="relative flex min-h-[calc(100vh-130px)] items-end px-4 pb-8 pt-16 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)] lg:items-end">
          <ScrollReveal className="max-w-5xl pb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">
              Kisii University Research
            </p>
            <h1 className="mt-4 max-w-4xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-white sm:text-6xl lg:text-7xl">
              Research that connects discovery, innovation, and public service.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/82 sm:text-lg">
              Explore the work of the Directorate of Research, Extension,
              Innovation and Resource Mobilization: projects, publications,
              partnerships, grants, outputs, community impact, and the evidence
              behind Kisii University scholarship.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ActionLink href="/projects">Explore research</ActionLink>
              <ActionLink href="/publications" variant="light">Browse publications</ActionLink>
            </div>
          </ScrollReveal>

          {topStats.length > 0 ? (
            <ScrollReveal className="grid gap-3 rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-md sm:grid-cols-2">
              {topStats.map((item) => (
                <div key={item.key} className="rounded-md bg-white p-4 shadow-sm">
                  <p className="font-[family-name:var(--font-display)] text-3xl font-semibold text-slate-950">
                    {item.value}
                    {item.suffix}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    {item.label}
                  </p>
                </div>
              ))}
            </ScrollReveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function SectionKicker({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  return (
    <p className={`text-xs font-bold uppercase tracking-[0.08em] text-primary ${className}`}>
      {children}
    </p>
  );
}

function ActionLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline" | "light";
}) {
  const className =
    variant === "light"
      ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
      : variant === "outline"
        ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-primary/25 bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
        : "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90";

  return (
    <Link href={href} className={className}>
      {children}
      <ArrowRight aria-hidden className="h-4 w-4" />
    </Link>
  );
}

function WorkflowCard({
  title,
  body,
  href,
  label,
  icon: Icon,
}: {
  title: string;
  body: string;
  href: string;
  label: string;
  icon: typeof FlaskConical;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-[260px] flex-col rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:bg-white hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)]"
    >
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-white text-primary shadow-sm ring-1 ring-slate-200 transition group-hover:bg-primary group-hover:text-white">
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <h3 className="mt-5 font-[family-name:var(--font-display)] text-xl font-semibold leading-7 text-slate-950">
        {title}
      </h3>
      <p className="mt-4 text-sm leading-7 text-slate-600">{body}</p>
      <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-primary">
        {label}
        <ArrowRight aria-hidden className="h-4 w-4 transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

function ImageFeatureCard({
  title,
  body,
  href,
  image,
  label,
}: {
  title: string;
  body: string;
  href: string;
  image: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)]"
    >
      <div className="relative aspect-[4/3] bg-slate-100">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 1024px) 31vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-5">
        <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold leading-7 text-slate-950">
          {title}
        </h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          {label}
          <ArrowRight aria-hidden className="h-4 w-4 transition group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function RecordPanel({
  title,
  href,
  image,
  children,
}: {
  title: string;
  href: string;
  image: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[16/9] bg-slate-100">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 1280px) 31vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">
            {title}
          </h3>
          <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
            Open
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-4 divide-y divide-slate-200">{children}</div>
      </div>
    </section>
  );
}

function RecordRow({
  title,
  meta,
}: {
  title: string;
  meta: Array<string | number | null | undefined>;
}) {
  const details = meta.map(compactText).filter(Boolean);

  return (
    <article className="py-4">
      <h4 className="text-sm font-semibold leading-6 text-slate-950">{title}</h4>
      {details.length > 0 ? (
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {details.join(" · ")}
        </p>
      ) : null}
    </article>
  );
}
