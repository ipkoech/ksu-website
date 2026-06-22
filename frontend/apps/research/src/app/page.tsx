import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, FileText, Handshake, Quote, Search, Send, Sprout } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ScrollReveal, ScrollRevealGroup } from "@ksu/ui/components";
import { ResearchClusterHero } from "../components/research-cluster";
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
    body: "Explore research areas, expertise, facilities, and active work across the university.",
    href: "/projects",
    label: "Browse research areas",
    icon: Search,
    tone: "green",
    links: [
      { label: "Explore projects", href: "/projects" },
      { label: "Find experts", href: "/expertise" },
      { label: "Access facilities", href: "/facilities" },
      { label: "View centers", href: "/centers" },
    ],
  },
  {
    title: "Support Research",
    body: "Get the guidance, funding routes, training, and services needed to move work forward.",
    href: "/funding",
    label: "Find funding opportunities",
    icon: FileText,
    tone: "navy",
    links: [
      { label: "Find funding", href: "/funding" },
      { label: "Research policies", href: "/guidelines" },
      { label: "Training and mentorship", href: "/training" },
      { label: "Support services", href: "/services" },
    ],
  },
  {
    title: "Translate Research",
    body: "Turn ideas into solutions that benefit industry, society, communities, and the environment.",
    href: "/innovations",
    label: "Open innovation",
    icon: Sprout,
    tone: "gold",
    links: [
      { label: "Innovation and commercialization", href: "/innovations" },
      { label: "Consultancy services", href: "/consultancies" },
      { label: "Community impact", href: "/community-impact" },
      { label: "Partnerships", href: "/partners" },
    ],
  },
];

const ecosystemCards = [
  {
    title: "Centers & Institutes",
    href: "/centers",
    image: "/images/research/research-hero-imagegen.png",
  },
  {
    title: "Facilities & Labs",
    href: "/facilities",
    image: "/images/research/research-hero-imagegen.png",
  },
  {
    title: "Expertise Directory",
    href: "/expertise",
    image: "/images/research/innovation-partnerships.png",
  },
  {
    title: "Partners & Collaborators",
    href: "/partners",
    image: "/images/research/research-demo-imagegen.png",
  },
  {
    title: "Consultancy Services",
    href: "/consultancies",
    image: "/images/research/registrar-reirm-imagegen.png",
  },
  {
    title: "Community Impact",
    href: "/community-impact",
    image: "/images/research/research-demo-imagegen.png",
  },
];

const homeLinks = [
  {
    label: "Projects",
    href: "/projects",
    description: "Browse funded, applied, action, and collaborative work.",
    icon: Search,
  },
  {
    label: "Publications",
    href: "/publications",
    description: "Read articles, reports, briefs, books, and research outputs.",
    icon: FileText,
  },
  {
    label: "Funding",
    href: "/funding",
    description: "Find grant calls, support services, forms, and guidelines.",
    icon: Sprout,
  },
  {
    label: "Partnerships",
    href: "/partners",
    description: "Explore collaborations, sponsors, consultancies, and endowments.",
    icon: Handshake,
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
      <ResearchClusterHero
        eyebrow="Kisii University Research"
        title="Research that connects discovery, innovation, and public service."
        body="Explore the work of the Directorate of Research, Extension, Innovation and Resource Mobilization: projects, publications, partnerships, grants, outputs, community impact, and the evidence behind Kisii University scholarship."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Research" },
        ]}
        imageSrc="/images/research/research-hero-imagegen.png"
        imageAlt="University researchers collaborating across laboratory, data, and field research"
        links={homeLinks}
        primaryAction={{ label: "Explore research", href: "/projects" }}
        stats={topStats.map((item) => ({
          label: item.label,
          value: `${item.value}${item.suffix ?? ""}`,
        }))}
      />

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

      <ScrollReveal as="section" className="bg-white px-4 py-14 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto max-w-[1680px] text-center">
          <SectionKicker>Core Research Workflows</SectionKicker>
          <h2 className="mx-auto mt-3 max-w-4xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
            Our core research workflows
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            A seamless journey from discovery to impact, organized around the
            work researchers, students, funders, and partners come here to do.
          </p>
        </div>

        <ScrollRevealGroup
          className="mx-auto mt-8 grid max-w-[1680px] gap-6 md:grid-cols-3"
          staggerDelay={80}
        >
          {workflowCards.map((card) => (
            <WorkflowCard key={card.title} {...card} />
          ))}
        </ScrollRevealGroup>
      </ScrollReveal>

      <ScrollReveal as="section" className="border-y border-slate-200 bg-slate-50 px-4 py-14 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto grid max-w-[1680px] gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-center">
          <div className="relative min-h-[360px] overflow-hidden rounded-lg bg-slate-200 shadow-sm lg:min-h-[520px]">
            <Image
              src="/images/research/registrar-reirm-imagegen.png"
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
              <ActionLink href="/services" variant="outline">Our services</ActionLink>
              <ActionLink href="/partners" variant="outline">Partner with us</ActionLink>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal as="section" className="bg-white px-4 py-14 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto max-w-[1680px]">
          <div className="mx-auto max-w-3xl text-center">
            <SectionKicker>Live Research Records</SectionKicker>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
              Real-time updates from our research ecosystem.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Projects, publications, funding calls, and updates are published
              from the same research records used across the portal.
            </p>
          </div>

          <ScrollRevealGroup className="mt-6 grid gap-5 xl:grid-cols-3" staggerDelay={70}>
            <RecordPanel
              title="Active Projects"
              href="/projects"
              image="/images/research/research-demo-imagegen.png"
              emptyLabel="No active projects have been published yet."
              tone="green"
              isEmpty={projects.data.length === 0}
            >
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
            <RecordPanel
              title="Recent Publications"
              href="/publications"
              image="/images/research/research-hero-imagegen.png"
              emptyLabel="No publications have been published yet."
              tone="navy"
              isEmpty={publications.data.length === 0}
            >
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
            <RecordPanel
              title="Funding & Opportunities"
              href="/funding"
              image="/images/research/research-demo-imagegen.png"
              emptyLabel="No funding calls or updates have been published yet."
              tone="gold"
              isEmpty={grants.data.length === 0 && updates.data.length === 0}
            >
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

      <ScrollReveal as="section" className="border-y border-slate-200 bg-[linear-gradient(180deg,#f7fbf9_0%,#ffffff_100%)] px-4 py-14 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto max-w-[1680px]">
          <div className="mx-auto max-w-3xl text-center">
            <SectionKicker>Research Ecosystem</SectionKicker>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
              Discover the people, places, and partnerships that drive our research.
            </h2>
          </div>

          <ScrollRevealGroup className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3" staggerDelay={75}>
            {ecosystemCards.map((card) => (
              <EcosystemCard key={card.title} {...card} />
            ))}
          </ScrollRevealGroup>

          <ScrollRevealGroup className="mt-8 grid gap-5 lg:grid-cols-2" staggerDelay={70}>
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

      <ScrollReveal as="section" className="bg-primary px-4 py-12 text-white sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto max-w-[1680px] text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight sm:text-4xl">
            Start a research conversation
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-white/80 sm:text-base">
            Have an idea, need support, or looking for a partner? The REIRM
            office can connect you to the right research pathway.
          </p>
          <div className="mx-auto mt-7 grid max-w-4xl gap-3 md:grid-cols-3">
            <CtaAction href="/connect" icon={Send} title="Submit an inquiry" body="Tell us about your idea" />
            <CtaAction href="/expertise" icon={Search} title="Find expertise" body="Connect with experts" />
            <CtaAction href="/partners" icon={Handshake} title="Partner with us" body="Explore collaboration" />
          </div>
        </div>
      </ScrollReveal>
    </main>
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
  variant?: "primary" | "outline" | "light" | "gold";
}) {
  const className =
    variant === "light"
      ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/50 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
      : variant === "gold"
        ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-secondary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary/90"
      : variant === "outline"
        ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-primary/25 bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
        : "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90";

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
  links,
  tone,
}: {
  title: string;
  body: string;
  href: string;
  label: string;
  icon: LucideIcon;
  links: { label: string; href: string }[];
  tone: string;
}) {
  const toneClass =
    tone === "gold"
      ? "bg-secondary text-white"
      : tone === "navy"
        ? "bg-primary text-white"
        : "bg-green-700 text-white";

  return (
    <Link
      href={href}
      className="group flex min-h-[360px] flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)]"
    >
      <span className={`inline-flex h-14 w-14 items-center justify-center rounded-full shadow-sm ${toneClass}`}>
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <h3 className="mt-5 font-[family-name:var(--font-display)] text-xl font-semibold leading-7 text-slate-950">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
      <ul className="mt-5 space-y-3">
        {links.map((item) => (
          <li key={item.href} className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <ArrowRight aria-hidden className="h-3.5 w-3.5 text-primary" />
            {item.label}
          </li>
        ))}
      </ul>
      <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-primary">
        {label}
        <ArrowRight aria-hidden className="h-4 w-4 transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

function EcosystemCard({
  title,
  href,
  image,
}: {
  title: string;
  href: string;
  image: string;
}) {
  return (
    <Link
      href={href}
      className="group relative min-h-[220px] overflow-hidden rounded-lg border border-white/30 bg-primary shadow-sm transition hover:-translate-y-1 hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)]"
    >
      <Image
        src={image}
        alt={title}
        fill
        sizes="(min-width: 1280px) 31vw, (min-width: 768px) 50vw, 100vw"
        className="object-cover opacity-80 transition duration-500 group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,20,49,0.12)_0%,rgba(2,20,49,0.86)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
        <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold leading-7 text-white">
          {title}
        </h3>
        <ArrowRight aria-hidden className="h-5 w-5 shrink-0 text-white transition group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

function RecordPanel({
  title,
  href,
  image,
  children,
  emptyLabel,
  isEmpty,
  tone,
}: {
  title: string;
  href: string;
  image: string;
  children: ReactNode;
  emptyLabel: string;
  isEmpty: boolean;
  tone: "green" | "navy" | "gold";
}) {
  const headerClass =
    tone === "gold"
      ? "bg-secondary"
      : tone === "green"
        ? "bg-green-700"
        : "bg-primary";

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className={`flex min-h-12 items-center justify-between gap-4 px-4 py-3 text-white ${headerClass}`}>
        <h3 className="text-sm font-semibold">{title}</h3>
        <Link href={href} className="inline-flex items-center gap-1 text-xs font-semibold text-white/90 hover:text-white">
          View all
          <ArrowRight aria-hidden className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="p-5">
        <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-md bg-slate-100">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(min-width: 1280px) 31vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="divide-y divide-slate-200">
          {isEmpty ? <EmptyRecordState>{emptyLabel}</EmptyRecordState> : children}
        </div>
        <Link href={href} className="mt-4 inline-flex w-full items-center justify-center gap-2 border-t border-slate-200 pt-4 text-sm font-semibold text-primary">
          Explore {title.toLowerCase()}
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function EmptyRecordState({ children }: { children: ReactNode }) {
  return (
    <p className="py-5 text-sm leading-6 text-slate-500">
      {children}
    </p>
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

function CtaAction({
  href,
  icon: Icon,
  title,
  body,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-lg border border-white/25 bg-white/5 p-4 text-left transition hover:border-secondary/80 hover:bg-white/10"
    >
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-secondary text-white">
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <span>
        <span className="block text-sm font-semibold text-white">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-white/70">{body}</span>
      </span>
      <ArrowRight aria-hidden className="ml-auto h-4 w-4 shrink-0 text-white/70 transition group-hover:translate-x-1 group-hover:text-white" />
    </Link>
  );
}
