import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  Award,
  Bell,
  BookOpenCheck,
  CalendarDays,
  FileDown,
  GraduationCap,
  Handshake,
  Landmark,
  Lightbulb,
  Newspaper,
  PlayCircle,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { AdmissionsCountdown } from "@/components/home/admissions-countdown";
import { CampusLifeHorizontalScroller } from "@/components/home/campus-life-horizontal-scroller";
import { ProgrammeFinderInteractive } from "@/components/home/programme-finder-interactive";
import { WhyKisiiSection } from "@/components/home/why-kisii-section";
import { PublicImage } from "@/components/public/public-image";
import type {
  HomeIntake,
  HomeProgrammeCard,
  HomeSchoolCard,
} from "@/lib/homepage-data";
import {
  background,
  heroImage,
  logos,
  mediaAlt,
  mediaUrl,
  poster,
  video,
  type HomepageHeroAction,
  type HomepagePartnershipSpotlight,
  type HomepageResolvedHero,
  type HomepageSection,
  type HomepageSectionItem,
} from "@/lib/homepage-sections";

type SectionVariantProps = {
  section: HomepageSection;
  hero?: HomepageResolvedHero | null;
  factsSection?: HomepageSection | null;
  partnershipSpotlights?: HomepagePartnershipSpotlight[];
  academicDatesSection?: HomepageSection | null;
  programmeFinderData?: ProgrammeFinderData;
};

export type ProgrammeFinderData = {
  schools: HomeSchoolCard[];
  programmes: HomeProgrammeCard[];
  intakes: HomeIntake[];
};

const campusHeroImage = "/images/homepage/kisii-administration-campus.jpg";
const heriAfricaLaunchImage = "/images/HERIAfricaLaunch.jpg";
const researchImpactBackground = "/images/research/research-impact-bg.png";

export function HeroAdmissionsSection({ section, hero }: SectionVariantProps) {
  const content = hero?.content;
  const admissions = hero?.admissions;
  const showAdmissions = Boolean(
    admissions?.visible &&
    (admissions.state === "applications_open" ||
      admissions.state === "admission_letters_available"),
  );
  const desktopMedia = hero?.media?.desktop ?? heroImage(section);
  const mobileMedia = hero?.media?.mobile;
  const videoMedia = hero?.media?.video;
  const posterMedia = hero?.media?.poster ?? desktopMedia;
  const videoSrc = mediaUrl(videoMedia);
  const desktopImageSrc = mediaUrl(desktopMedia) ?? campusHeroImage;
  const mobileImageSrc = mediaUrl(mobileMedia);
  const mediaAltText = mediaAlt(
    desktopMedia,
    "Kisii University central administration campus",
  );
  const headline = content?.headline ?? section.title ?? "Kisii University";
  const highlight = content?.highlight;
  const description =
    content?.description ??
    section.subtitle ??
    section.description ??
    "Advancing inclusive education, research, innovation and community impact.";
  const actions = heroActions(content?.actions, section.items, admissions);

  return (
    <section className="relative isolate min-h-[clamp(390px,calc(100svh-13rem),580px)] overflow-hidden bg-primary text-white">
      {videoSrc ? (
        <video
          className="absolute inset-0 h-full w-full object-cover object-[50%_55%]"
          autoPlay
          muted
          loop
          playsInline
          poster={mediaUrl(posterMedia) ?? desktopImageSrc}
          aria-hidden="true"
        >
          <source src={videoSrc} />
        </video>
      ) : (
        <>
          {mobileImageSrc ? (
            <PublicImage
              src={mobileImageSrc}
              alt={mediaAlt(mobileMedia, mediaAltText)}
              ratio="fill"
              priority
              className="absolute inset-0 h-full w-full md:hidden"
              imageClassName="object-cover object-[50%_54%]"
              sizes="100vw"
            />
          ) : null}
          <PublicImage
            src={desktopImageSrc}
            alt={mediaAltText}
            ratio="fill"
            priority
            className={`absolute inset-0 h-full w-full ${
              mobileImageSrc ? "hidden md:block" : ""
            }`}
            imageClassName="object-cover object-[50%_55%]"
            sizes="100vw"
          />
        </>
      )}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--primary)/.78)_0%,hsl(var(--primary)/.58)_36%,rgba(2,6,23,.18)_64%,rgba(2,6,23,.04)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,.24)_0%,rgba(2,6,23,0)_38%,rgba(2,6,23,.2)_100%)]" />

      <div
        className={`relative z-10 mx-auto grid min-h-[clamp(390px,calc(100svh-13rem),580px)] max-w-[1680px] items-center gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16 xl:px-10 2xl:px-12 ${
          showAdmissions
            ? "lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]"
            : "lg:grid-cols-1"
        }`}
      >
        <div className="max-w-3xl">
          <SectionEyebrow
            value={content?.eyebrow ?? section.subtitle ?? "Kisii University"}
            light
          />
          <h1 className="mt-4 max-w-3xl text-balance font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
            {headline}
            {highlight ? (
              <span className="mt-1 block text-secondary">{highlight}</span>
            ) : null}
          </h1>
          <SectionBody
            value={description}
            light
            className="mt-5 max-w-2xl text-base leading-7 text-white/90 sm:text-lg sm:leading-8"
          />
          {actions.length ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {actions.slice(0, 2).map((action, index) => (
                <HeroActionLink
                  key={action.key ?? `${action.href}-${index}`}
                  action={action}
                  prominent={action.style === "primary" || index === 0}
                />
              ))}
            </div>
          ) : null}
        </div>

        {showAdmissions && admissions ? (
          <AdmissionsPanel admissions={admissions} />
        ) : null}
      </div>
    </section>
  );
}

function AdmissionsPanel({
  admissions,
}: {
  admissions: HomepageResolvedHero["admissions"];
}) {
  const isApplicationsOpen = admissions.state === "applications_open";
  const isLettersAvailable = admissions.state === "admission_letters_available";
  const intakeName = admissions.intake?.name ?? "Current intake";

  return (
    <aside
      aria-label="Admissions update"
      className="w-full max-w-md justify-self-start rounded-md border border-white/20 bg-primary/95 p-5 shadow-xl shadow-slate-950/20 sm:p-6 lg:justify-self-end"
    >
      <div className="flex items-center gap-3 border-b border-white/15 pb-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-white">
          {isLettersAvailable ? (
            <FileDown className="h-5 w-5" aria-hidden />
          ) : (
            <CalendarDays className="h-5 w-5" aria-hidden />
          )}
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/70">
            Admissions update
          </p>
          <h2 className="mt-1 text-balance font-[family-name:var(--font-display)] text-xl font-semibold text-white">
            {intakeName}
          </h2>
        </div>
      </div>

      {isApplicationsOpen ? (
        <div className="pt-5">
          <p className="text-center text-xs font-bold uppercase tracking-[0.14em] text-white/75">
            Applications close in
          </p>
          {admissions.countdown_target ? (
            <div className="mt-4">
              <AdmissionsCountdown target={admissions.countdown_target} />
            </div>
          ) : admissions.closing_at ? (
            <p className="mt-3 text-center text-sm font-semibold text-white">
              {formatPublicDate(admissions.closing_at)}
            </p>
          ) : null}
          {admissions.application_phase === "late" ? (
            <p className="mt-4 rounded-md bg-white/10 px-3 py-2 text-center text-xs font-semibold text-white/85">
              Late applications are currently being accepted.
            </p>
          ) : null}
        </div>
      ) : null}

      {isLettersAvailable ? (
        <div className="pt-5 text-center">
          <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-white">
            Admission letters are available
          </p>
          {admissions.reporting?.starts_at ? (
            <p className="mt-3 text-sm leading-6 text-white/75">
              {admissions.reporting.title ?? "Reporting"}:{" "}
              <span className="font-semibold text-white">
                {formatPublicDate(admissions.reporting.starts_at)}
              </span>
            </p>
          ) : null}
        </div>
      ) : null}

      {admissions.primary_action ? (
        <div className="mt-6">
          <HeroActionLink
            action={{
              ...admissions.primary_action,
              href: normalizeHeroHref(admissions.primary_action.href),
            }}
            prominent
            fullWidth
          />
        </div>
      ) : null}

      {(admissions.secondary_actions?.length ?? 0) > 0 ? (
        <div className="mt-4 flex flex-col items-center gap-3">
          {admissions.secondary_actions?.slice(0, 2).map((action, index) => (
            <HeroActionLink
              key={action.key ?? `${action.href}-${index}`}
              action={{ ...action, href: normalizeHeroHref(action.href) }}
              subtle
            />
          ))}
        </div>
      ) : null}
    </aside>
  );
}

function HeroActionLink({
  action,
  prominent = false,
  subtle = false,
  fullWidth = false,
}: {
  action: HomepageHeroAction;
  prominent?: boolean;
  subtle?: boolean;
  fullWidth?: boolean;
}) {
  return (
    <Link
      href={action.href}
      target={action.open_in_new_tab ? "_blank" : undefined}
      rel={action.open_in_new_tab ? "noopener noreferrer" : undefined}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary ${
        fullWidth ? "w-full" : ""
      } ${
        prominent
          ? "bg-secondary text-white shadow-sm hover:bg-secondary/90"
          : subtle
            ? "px-2 py-1 text-white/85 hover:text-white"
            : "border border-white/35 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
      }`}
    >
      {action.label}
      <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}

function heroActions(
  resolvedActions: HomepageHeroAction[] | undefined,
  items: HomepageSectionItem[] | undefined,
  admissions: HomepageResolvedHero["admissions"] | undefined,
) {
  const actions = resolvedActions?.length
    ? resolvedActions.filter((action) => action.label && action.href)
    : [];
  const sectionActions = displayItems({ items } as HomepageSection)
    .filter((item) => item.is_enabled !== false)
    .filter((item) => item.cta_label && item.cta_url)
    .map(
      (item): HomepageHeroAction => ({
        key: item.id,
        label: heroActionLabel(item),
        href: normalizeHeroHref(item.cta_url!),
        style: item.content?.intent === "primary" ? "primary" : "secondary",
      }),
    );

  const admissionAction = admissions?.primary_action?.href
    ? {
        ...admissions.primary_action,
        label: "Apply Now",
        href: normalizeHeroHref(admissions.primary_action.href),
        style: "primary" as const,
      }
    : null;
  const merged = [
    ...(admissionAction ? [admissionAction] : []),
    ...actions,
    ...sectionActions,
    {
      key: "fallback-apply",
      label: "Apply Now",
      href: "/admissions/how-to-apply",
      style: "primary" as const,
    },
    {
      key: "fallback-programmes",
      label: "Explore Programmes",
      href: "/academics/programmes",
      style: "secondary" as const,
    },
  ];
  const seen = new Set<string>();
  return merged.filter((action) => {
    const identity = normalizeHeroHref(action.href);
    if (!action.label || !identity || seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
}

function heroActionLabel(item: HomepageSectionItem) {
  const text = `${item.title ?? ""} ${item.cta_label ?? ""}`;
  if (/apply|how to apply/i.test(text)) return "Apply Now";
  if (/programme|program/i.test(text)) return "Explore Programmes";
  return item.cta_label!;
}

function normalizeHeroHref(href: string) {
  if (href.startsWith("/admission/")) {
    return href.replace(/^\/admission\//, "/admissions/");
  }
  if (href === "/programmes") {
    return "/academics/programmes";
  }
  return href;
}

function formatPublicDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "long",
    timeZone: "Africa/Nairobi",
  }).format(date);
}

export function PulseStripSection({ section }: SectionVariantProps) {
  const items = officialPulseItems(section);
  const maxItems =
    typeof section.settings?.maxItems === "number"
      ? section.settings.maxItems
      : 5;

  return (
    <section
      aria-label={section.title ?? "University pulse"}
      className="border-y border-primary/10 bg-primary text-white"
    >
      <div className="mx-auto grid max-w-[1680px] gap-0 px-4 sm:px-6 lg:grid-cols-[190px_minmax(0,1fr)] lg:px-8 xl:px-10 2xl:px-12">
        <div className="flex min-h-[86px] items-center gap-3 border-b border-white/10 py-4 lg:border-b-0 lg:border-r lg:pr-5">
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-secondary">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary/25" />
            <Activity className="relative h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold leading-tight text-white">
              {section.title ?? "University pulse"}
            </h2>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/55">
              Live updates
            </p>
          </div>
        </div>

        <div className="-mx-4 flex snap-x gap-0 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:auto-cols-fr lg:grid-flow-col lg:divide-x lg:divide-white/10 lg:overflow-visible lg:px-0">
          {items.slice(0, maxItems).map((item, index) => (
            <PulseItem key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

const officialPulseFallbackItems: HomepageSectionItem[] = [
  {
    id: "official-pulse-admissions",
    title: "Admissions and reporting",
    body_text:
      "Check active intakes, reporting dates and official application guidance.",
    cta_url: "/admissions",
    display_order: 10,
    content: { icon: "admissions" },
  },
  {
    id: "official-pulse-graduation",
    title: "Graduation updates",
    body_text:
      "Follow graduation notices, ceremony dates and clearance information.",
    cta_url: "/news",
    display_order: 20,
    content: { icon: "graduation" },
  },
  {
    id: "official-pulse-research",
    title: "Research and innovation",
    body_text:
      "See grants, research launches and community-impact work from KSU.",
    cta_url: "/research",
    display_order: 30,
    content: { icon: "research" },
  },
  {
    id: "official-pulse-partnerships",
    title: "Strategic partnerships",
    body_text:
      "Track MoUs and collaborations advancing teaching, enterprise and impact.",
    cta_url: "/research/partnerships",
    display_order: 40,
    content: { icon: "partnership" },
  },
  {
    id: "official-pulse-events",
    title: "Public lectures and events",
    body_text:
      "Find official lectures, conferences, student activities and university events.",
    cta_url: "/events",
    display_order: 50,
    content: { icon: "calendar" },
  },
];

function officialPulseItems(section: HomepageSection) {
  const sourceItems = displayItems(section);
  const officialItems = sourceItems
    .filter(isHighSignalPulseItem)
    .sort(
      (first, second) =>
        pulsePriority(first) - pulsePriority(second) ||
        (first.display_order ?? 100) - (second.display_order ?? 100),
    );

  return officialItems.length ? officialItems : officialPulseFallbackItems;
}

function isHighSignalPulseItem(item: HomepageSectionItem) {
  const text = [
    item.item_type,
    item.title,
    item.subtitle,
    item.body_text,
    item.cta_label,
    itemContentText(item, "icon"),
    itemContentText(item, "category"),
    itemContentText(item, "type"),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return /admission|intake|application|reporting|graduation|research|grant|innovation|partnership|mou|vice chancellor|\bvc\b|leadership|public lecture|lecture|conference|event|award|achievement/.test(
    text,
  );
}

function pulsePriority(item: HomepageSectionItem) {
  const text = [
    item.title,
    item.subtitle,
    item.body_text,
    itemContentText(item, "icon"),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/admission|intake|application|reporting/.test(text)) return 10;
  if (/graduation/.test(text)) return 20;
  if (/research|grant|innovation/.test(text)) return 30;
  if (/partnership|mou/.test(text)) return 40;
  if (/vice chancellor|\bvc\b|leadership/.test(text)) return 50;
  if (/public lecture|lecture|conference|event/.test(text)) return 60;
  if (/award|achievement/.test(text)) return 70;
  return 100;
}

export function FeaturedPartnershipSection({
  section,
  partnershipSpotlights = [],
}: SectionVariantProps) {
  const spotlight = partnershipSpotlights[0];
  const image = spotlight
    ? (heroImage(spotlight) ?? background(spotlight))
    : heroImage(section);
  const title = spotlight?.headline ?? section.title;
  const summary = spotlight?.summary ?? section.description;
  const cta = spotlight?.primary_cta?.href
    ? {
        id: spotlight.id,
        title: spotlight.primary_cta.label ?? "Explore partnership",
        cta_label: spotlight.primary_cta.label ?? "Explore partnership",
        cta_url: spotlight.primary_cta.href,
      }
    : {
        title: "Read More",
        cta_label: "Read More",
        cta_url: "/research/partnerships",
      };

  const pillars = spotlight?.pillars?.length
    ? spotlight.pillars
    : [
        { label: "Innovation programmes" },
        { label: "Entrepreneurship & incubation" },
        { label: "Regional development" },
        { label: "Capacity building" },
      ];

  return (
    <section
      id={section.section_key}
      className="border-b border-blue-100 bg-white py-10 lg:py-12"
    >
      <div className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="relative">
            <PublicImage
              src={mediaUrl(image) ?? heriAfricaLaunchImage}
              alt={mediaAlt(
                image,
                title ?? "Kisii University and Heri Africa partnership",
              )}
              ratio="news"
              className="min-h-[280px] rounded-none lg:min-h-[360px]"
              imageClassName="object-cover object-[50%_38%]"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-primary/88 p-4 text-white backdrop-blur-sm sm:left-auto sm:right-5 sm:w-[min(360px,calc(100%-2.5rem))]">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                Strategic partnership
              </p>
              <p className="mt-1 text-sm leading-6 text-white/78">
                Building Africa together through research, enterprise and
                community impact.
              </p>
            </div>
          </div>

          <div className="max-w-3xl">
            <SectionEyebrow
              value={section.subtitle ?? "Featured partnership"}
            />
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
              {title ?? "Partnership spotlight"}
            </h2>
            <SectionBody
              value={summary}
              className="mt-4 max-w-2xl text-base leading-7"
            />
            <div className="mt-7 divide-y divide-blue-100 border-y border-blue-100">
              {pillars.slice(0, 4).map((pillar, index) => (
                <div
                  key={`${String(pillar.label)}-${index}`}
                  className="flex items-center gap-4 py-3"
                >
                  <span className="font-[family-name:var(--font-display)] text-sm font-semibold text-secondary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm font-semibold leading-6 text-primary">
                    {String(pillar.label ?? "Partnership opportunity")}
                  </p>
                </div>
              ))}
            </div>
            {cta ? <CtaLink item={cta} className="mt-7" /> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProgrammeFinderSection({
  section,
  academicDatesSection,
  programmeFinderData,
}: SectionVariantProps) {
  const categories = displayItems(section).filter(
    (item) => itemContentText(item, "group") === "category",
  );
  const journey = displayItems(section).filter(
    (item) => itemContentText(item, "group") === "journey",
  );
  const dateItems = academicDatesSection
    ? displayItems(academicDatesSection).slice(0, 4)
    : [];
  const intakes = programmeFinderData?.intakes ?? [];
  const programmes = programmeFinderData?.programmes ?? [];
  const schools = programmeFinderData?.schools ?? [];
  const categoryLinks = categories.map((item) => ({
    id: item.id,
    title: item.title,
    href: item.cta_url ?? "/academics/programmes",
  }));
  const hasAdmissionDates = dateItems.length > 0 || intakes.length > 0;

  return (
    <section
      id={section.section_key}
      className="relative isolate border-b border-blue-100 bg-blue-50/40 py-12 lg:py-16"
    >
      <PublicImage
        src="/images/Home/KSUGreenLandscaping.jpg"
        alt=""
        ratio="fill"
        className="absolute inset-0 -z-20 h-full w-full opacity-10"
        imageClassName="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(255,255,255,.94),rgba(239,246,255,.88)_48%,rgba(255,255,255,.96))]" />
      <div className="programme-scroll-scene mx-auto max-w-[1680px] px-4 sm:px-6 lg:min-h-[280vh] lg:px-8 xl:px-10 2xl:px-12">
        <nav
          aria-label="Programme finder steps"
          className="mb-6 flex gap-2 overflow-x-auto scroll-smooth lg:sticky lg:top-[calc(var(--public-header-offset,96px)+1rem)] lg:z-40"
        >
          {[
            ["Find programme", "#programme-search"],
            ["How to join", "#programme-journey"],
            ...(hasAdmissionDates
              ? ([["Admissions dates", "#programme-dates"]] as const)
              : []),
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="inline-flex min-h-9 shrink-0 items-center rounded-full border border-blue-100 bg-white/85 px-3 text-xs font-bold text-primary shadow-sm transition hover:border-primary/25 hover:bg-white"
            >
              {label}
            </a>
          ))}
        </nav>

        <div
          id="programme-search"
          className="programme-panel scroll-mt-28 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-6 lg:sticky lg:top-[calc(var(--public-header-offset,96px)+4.5rem)] lg:z-10 lg:flex lg:min-h-[calc(100svh-var(--public-header-offset,96px)-4.5rem)] lg:w-screen lg:ml-[calc(50%-50vw)] lg:items-center lg:bg-white lg:px-8 lg:py-10 xl:px-10 2xl:px-12"
        >
          <div className="mx-auto grid w-full max-w-[1680px] overflow-hidden bg-white shadow-xl shadow-primary/10 transition duration-500 lg:grid-cols-[0.42fr_0.58fr] lg:shadow-2xl lg:shadow-primary/12">
            <PublicImage
              src="/images/Home/OurKSU-82.jpg"
              alt="Kisii University students in an academic setting"
              ratio="news"
              className="hidden min-h-[440px] rounded-none lg:block"
              imageClassName="object-cover"
            />
            <div className="flex flex-col justify-center p-5 sm:p-7 lg:p-8">
              <SectionEyebrow value={section.subtitle} />
              <h2 className="mt-2 max-w-2xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
                {section.title ?? "Find a programme"}
              </h2>
              <SectionBody
                value={
                  section.description ??
                  "Search programmes, compare schools and choose the route that fits your goals."
                }
                className="mt-3 max-w-2xl"
              />
              <div className="mt-7">
                <ProgrammeFinderInteractive
                  programmes={programmes}
                  schools={schools}
                  categories={categoryLinks}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          id="programme-journey"
          className="programme-panel relative z-20 mt-6 scroll-mt-28 lg:sticky lg:top-[calc(var(--public-header-offset,96px)+4.5rem)] lg:mt-0 lg:flex lg:min-h-[calc(100svh-var(--public-header-offset,96px)-4.5rem)] lg:w-screen lg:ml-[calc(50%-50vw)] lg:items-center lg:bg-blue-50 lg:px-8 lg:py-10 xl:px-10 2xl:px-12 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-6 motion-safe:delay-150"
        >
          <div className="mx-auto grid w-full max-w-[1680px] overflow-hidden bg-white shadow-xl shadow-primary/10 transition duration-500 lg:grid-cols-[0.6fr_0.4fr] lg:shadow-2xl lg:shadow-primary/14">
            <div className="flex flex-col justify-center p-5 sm:p-7 lg:p-8">
              <SectionEyebrow value="How to join Kisii University" />
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950">
                From choice to campus reporting.
              </h3>
              <div className="mt-7 grid gap-3 sm:grid-cols-5 lg:grid-cols-1">
                {journey.slice(0, 5).map((item, index) => (
                  <div
                    key={item.id}
                    className="group flex gap-4 border-l-2 border-blue-100 py-2 pl-4 transition hover:border-primary sm:block sm:border-l-0 sm:border-t-2 sm:pl-0 sm:pt-4 lg:flex lg:border-l-2 lg:border-t-0 lg:py-2 lg:pl-4 lg:pt-2"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-white transition group-hover:bg-secondary">
                      {itemContentNumber(item, "step") ?? index + 1}
                    </span>
                    <div className="min-w-0 sm:mt-3 lg:mt-0">
                      <h4 className="text-sm font-semibold text-slate-950">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        {item.body_text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <LinkWrapper
                href="/admissions/how-to-apply"
                className="mt-7 inline-flex min-h-11 w-fit items-center justify-center gap-2 bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90"
              >
                View application guide
                <ArrowRight className="h-4 w-4" aria-hidden />
              </LinkWrapper>
            </div>
            <PublicImage
              src="/images/Home/um-hero.jpg"
              alt="Kisii University administration building"
              ratio="news"
              className="hidden min-h-[360px] rounded-none lg:block"
              imageClassName="object-cover"
            />
          </div>
        </div>

        {hasAdmissionDates ? (
          <div
            id="programme-dates"
            className="programme-panel relative z-30 mt-6 scroll-mt-28 lg:sticky lg:top-[calc(var(--public-header-offset,96px)+4.5rem)] lg:mt-0 lg:flex lg:min-h-[calc(100svh-var(--public-header-offset,96px)-4.5rem)] lg:w-screen lg:ml-[calc(50%-50vw)] lg:items-center lg:bg-primary lg:px-8 lg:py-10 xl:px-10 2xl:px-12 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-6 motion-safe:delay-300"
          >
            <div className="mx-auto grid w-full max-w-[1680px] overflow-hidden bg-primary text-white shadow-xl shadow-primary/15 transition duration-500 lg:grid-cols-[0.42fr_0.58fr] lg:shadow-2xl lg:shadow-primary/20">
              <PublicImage
                src="/images/Home/KSUGreenLandscaping.jpg"
                alt="Kisii University green campus"
                ratio="news"
                className="hidden min-h-[320px] rounded-none lg:block"
                imageClassName="object-cover"
              />
              <div className="p-5 sm:p-7 lg:p-8">
                <SectionEyebrow
                  value={
                    academicDatesSection?.subtitle ?? "Admissions and reporting"
                  }
                  light
                />
                <h3 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-white">
                  Key admission dates
                </h3>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {intakes.slice(0, 2).map((intake) => (
                    <LinkWrapper
                      key={intake.id}
                      href={intake.href}
                      className="border border-white/15 bg-white/10 p-4 transition hover:bg-white/15"
                    >
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary">
                        {intake.isOpen ? "Open intake" : "Intake"}
                      </p>
                      <h4 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold text-white">
                        {intake.name}
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-white/72">
                        {formatDateRange(
                          intake.applicationStart,
                          intake.applicationEnd ?? intake.lateApplicationEnd,
                        )}
                      </p>
                    </LinkWrapper>
                  ))}
                  {dateItems.map((item, index) => (
                    <DateMiniItem key={item.id} item={item} index={index} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function DateTimelineSection({ section }: SectionVariantProps) {
  const items = displayItems(section).slice(0, 4);
  return (
    <section
      id={section.section_key}
      className="border-b border-blue-100 bg-white py-10 lg:py-12"
    >
      <div className="mx-auto grid max-w-[1680px] gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(280px,0.36fr)_minmax(0,0.64fr)] lg:px-8 xl:px-10 2xl:px-12">
        <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4">
          <SectionEyebrow value={section.subtitle ?? "Important dates"} />
          <h2 className="mt-2 max-w-md font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
            {section.title ?? "Important academic dates"}
          </h2>
          <SectionBody value={section.description} className="mt-3 max-w-md" />
        </div>
        <div className="divide-y divide-blue-100 border-y border-blue-100 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:delay-150">
          {items.map((item, index) => (
            <DateLineItem key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function PillarGridSection({
  section,
  factsSection,
}: SectionVariantProps) {
  if (section.section_key === "why-kisii") {
    return <WhyKisiiSection section={section} factsSection={factsSection} />;
  }

  return (
    <SectionFrame section={section}>
      <SectionHeading
        section={section}
        fallback="University pillars"
        icon={Landmark}
      />
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {displayItems(section)
          .slice(0, 4)
          .map((item) => (
            <ImageArticleCard key={item.id} item={item} icon={Landmark} />
          ))}
      </div>
    </SectionFrame>
  );
}

export function MediaMosaicSection({ section }: SectionVariantProps) {
  const items = displayItems(section);
  const feature = items[0];
  const lanes = campusLifeLanes(items);
  const rhythm = [
    {
      label: "Learn",
      title: "Lectures, labs and study time",
      body: "Move between class, library time and practical learning spaces.",
    },
    {
      label: "Connect",
      title: "Clubs, friends and leadership",
      body: "Find communities that match your interests and ambitions.",
    },
    {
      label: "Recharge",
      title: "Sports, culture and campus moments",
      body: "Make room for recreation, creativity, events and wellbeing.",
    },
  ];
  return (
    <section
      id={section.section_key}
      className="campus-life-scroll-scene relative isolate border-b border-blue-100 bg-white py-12 lg:min-h-[320vh] lg:py-0"
    >
      <div className="absolute inset-y-0 right-0 -z-10 hidden w-1/2 bg-blue-50/70 lg:block" />
      <div className="campus-life-sticky-frame mx-auto max-w-[1680px] px-4 sm:px-6 lg:sticky lg:top-[var(--public-header-offset,96px)] lg:flex lg:min-h-[calc(100svh-var(--public-header-offset,96px))] lg:max-w-none lg:items-center lg:px-0 xl:px-0 2xl:px-0">
        <CampusLifeHorizontalScroller>
          <div className="lg:flex lg:w-max lg:items-stretch lg:gap-4 lg:pr-[12vw]">
            <div className="campus-life-editorial lg:w-screen lg:shrink-0 lg:snap-start lg:px-8 xl:px-10 2xl:px-12">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,0.58fr)_minmax(360px,0.42fr)] lg:items-stretch">
                <CampusMosaicFeature item={feature} section={section} />
                <div className="flex flex-col justify-center motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-6 motion-safe:delay-150">
                  <div className="max-w-xl">
                    <SectionEyebrow value={section.subtitle ?? "Campus life"} />
                    <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
                      Campus life at KSU, clearly mapped.
                    </h2>
                    <SectionBody
                      value={
                        section.description ??
                        "See how students belong, stay active, access support and navigate daily life beyond the lecture room."
                      }
                      className="mt-4 text-base leading-8"
                    />
                    <CtaLink
                      item={{
                        title: "Explore campus life",
                        cta_label: "Explore campus life",
                        cta_url: "/campus-life",
                      }}
                      className="mt-7"
                    />
                  </div>
                  <div className="student-life-rhythm mt-8 border-y border-blue-100">
                    {rhythm.map((item, index) => (
                      <div
                        key={item.label}
                        className="grid gap-3 py-4 sm:grid-cols-[96px_minmax(0,1fr)]"
                      >
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                          {item.label}
                        </p>
                        <div>
                          <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold leading-tight text-slate-950">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            {item.body}
                          </p>
                        </div>
                        <span
                          className="hidden"
                          aria-hidden="true"
                          style={{ animationDelay: `${index * 80}ms` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="student-life-lanes mt-7 grid gap-3 sm:grid-cols-2 lg:mt-0 lg:flex lg:w-max lg:gap-4">
              {lanes.map((lane, index) => (
                <CampusLifeLane key={lane.title} lane={lane} index={index} />
              ))}
            </div>
          </div>
        </CampusLifeHorizontalScroller>
      </div>
    </section>
  );
}

function CampusMosaicFeature({
  item,
  section,
}: {
  item?: HomepageSectionItem;
  section: HomepageSection;
}) {
  const body = (
    <article className="group relative min-h-[420px] overflow-hidden bg-primary text-white shadow-2xl shadow-primary/15 sm:min-h-[520px] lg:min-h-[640px] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-6">
      <PublicImage
        src={itemImageUrl(item) ?? mediaUrl(heroImage(section))}
        alt={
          itemContentText(item, "imageAlt") ??
          item?.media_alt_text ??
          item?.title ??
          "Kisii University campus life"
        }
        ratio="fill"
        className="absolute inset-0 h-full rounded-none"
        imageClassName="h-full object-cover transition duration-700 group-hover:scale-[1.03]"
        sizes="(min-width: 1024px) 58vw, 100vw"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,23,57,.04),rgba(3,23,57,.22)_35%,rgba(3,23,57,.86))]" />
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 lg:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
          {item?.subtitle ?? "Campus life"}
        </p>
        <h3 className="mt-2 max-w-2xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-white sm:text-4xl">
          {item?.title ?? "A campus built for belonging"}
        </h3>
        <p className="mt-3 max-w-xl text-sm leading-7 text-white/76">
          {item?.body_text ??
            item?.cta_description ??
            "Student communities, sports, culture, accommodation and support services shape everyday life at Kisii University."}
        </p>
        <span className="mt-5 inline-flex min-h-10 items-center gap-2 border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur transition group-hover:bg-white/15">
          {item?.cta_label ?? "See campus life"}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </span>
      </div>
    </article>
  );

  return item?.cta_url ? (
    <LinkWrapper href={item.cta_url}>{body}</LinkWrapper>
  ) : (
    body
  );
}

function CampusLifeLane({
  lane,
  index,
}: {
  lane: CampusLifeLaneData;
  index: number;
}) {
  const body = (
    <article
      className="group flex min-h-[250px] flex-col overflow-hidden border border-blue-100 bg-white transition duration-500 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/10 lg:min-h-[560px] lg:w-[min(420px,78vw)] lg:snap-start motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4"
      style={{ animationDelay: `${Math.min(index, 5) * 80}ms` }}
    >
      <PublicImage
        src={lane.imageUrl}
        alt={
          lane.imageAlt ??
          lane.source?.media_alt_text ??
          lane.source?.title ??
          "Campus life"
        }
        ratio="fill"
        className="min-h-36 rounded-none lg:min-h-64"
        imageClassName="object-cover transition duration-700 group-hover:scale-105"
        sizes="(min-width: 1024px) 20vw, 50vw"
      />
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-secondary">
          {lane.audience}
        </p>
        <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold leading-tight text-slate-950">
          {lane.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
          {lane.body}
        </p>
        <span className="mt-auto inline-flex pt-4 text-sm font-semibold text-primary">
          {lane.ctaLabel}
        </span>
      </div>
    </article>
  );

  return lane.href ? <LinkWrapper href={lane.href}>{body}</LinkWrapper> : body;
}

type CampusLifeLaneData = {
  title: string;
  audience: string;
  body: string;
  ctaLabel: string;
  href: string;
  imageUrl?: string;
  imageAlt?: string;
  source?: HomepageSectionItem;
};

function campusLifeLanes(items: HomepageSectionItem[]): CampusLifeLaneData[] {
  const fallbackImages = [
    "/images/Home/OurKSU-82.jpg",
    "/images/Home/KSUGreenLandscaping.jpg",
    "/images/Home/um-hero.jpg",
  ];
  const sourceItems = items.slice(1);
  const laneDefaults = [
    {
      title: "Where you belong",
      audience: "Prospective students",
      body: "Explore clubs, societies and peer communities where students build friendships and confidence.",
      ctaLabel: "Find clubs and societies",
      href: "/campus-life/clubs",
    },
    {
      title: "Sports and recreation",
      audience: "Current students",
      body: "Join teams, train, compete or use recreation to balance academic life.",
      ctaLabel: "Explore sports",
      href: "/campus-life/sports",
    },
    {
      title: "Plan your stay",
      audience: "Parents and guardians",
      body: "Understand accommodation options and the practical steps around settling into campus.",
      ctaLabel: "View accommodation",
      href: "/campus-life/accommodation",
    },
    {
      title: "Health and support",
      audience: "Current students",
      body: "Access wellness, counselling, accessibility and student-support services when you need help.",
      ctaLabel: "Get support",
      href: "/campus-life/support",
    },
    {
      title: "Culture and arts",
      audience: "Visitors and partners",
      body: "Take part in performances, cultural activities and creative spaces that make campus memorable.",
      ctaLabel: "See gallery",
      href: "/campus-life/gallery",
    },
    {
      title: "Student leadership",
      audience: "Student leaders",
      body: "Understand representation, student governance and opportunities to lead within the university.",
      ctaLabel: "Student life",
      href: "/campus-life/student-life",
    },
    {
      title: "Innovation and talent",
      audience: "Alumni and community",
      body: "Build ideas, showcase talent and connect academic learning with practical opportunities.",
      ctaLabel: "Explore opportunities",
      href: "/campus-life",
    },
    {
      title: "Daily campus moments",
      audience: "Life on campus",
      body: "Preview the spaces, routines and activities that shape everyday student experience at KSU.",
      ctaLabel: "View campus life",
      href: "/campus-life",
    },
  ];

  return laneDefaults.map((lane, index) => {
    const source = sourceItems[index];
    return {
      ...lane,
      imageUrl:
        itemImageUrl(source) ?? fallbackImages[index % fallbackImages.length],
      imageAlt: itemContentText(source, "imageAlt"),
      source,
    };
  });
}

export function LeadershipActivitySection({ section }: SectionVariantProps) {
  const staff = section.settings_enriched?.staff_profile;
  const leaderName =
    staff?.display_name ??
    staff?.full_name ??
    settingText(section, "leaderName") ??
    "Prof. Charles O. Ong’ondo, PhD";
  const leaderTitle =
    staff?.institutional_role === "vc" ||
    staff?.institutional_role === "vice_chancellor"
      ? "Vice Chancellor"
      : (staff?.institutional_role ??
        settingText(section, "leaderTitle") ??
        "Vice Chancellor");
  const leaderImage =
    staff?.photo_url ??
    settingText(section, "leaderImage") ??
    mediaUrl(heroImage(section)) ??
    "/images/Home/VCProfSUKUBA.jpg";
  const leaderMessage =
    staff?.leadership_message ??
    section.description ??
    "Guiding Kisii University with integrity, vision and a commitment to academic excellence and community impact.";
  const leaderHref =
    staff?.profile_href ??
    (staff?.id ? `/staff/${staff.id}` : "/about/vice-chancellor");
  const activities = displayItems(section)
    .filter(
      (item) => item.content_enriched?.linked_content?.is_published === true,
    )
    .slice(0, 4);
  return (
    <section
      id={section.section_key}
      className="overflow-hidden border-b border-primary/10 bg-[#fbfaf6]"
    >
      <div className="mx-auto grid max-w-[1680px] lg:h-[576px] lg:grid-cols-[minmax(300px,0.34fr)_minmax(0,0.66fr)] xl:h-[592px] 2xl:h-[608px]">
        <div className="relative border-b border-primary/10 lg:grid lg:h-full lg:min-h-0 lg:grid-rows-[56%_44%] lg:border-b-0 lg:border-r">
          <div className="relative min-h-[300px] overflow-hidden bg-primary lg:min-h-0">
            <div className="absolute -left-24 top-10 h-72 w-72 rounded-full border border-secondary/20" />
            <div className="absolute left-10 top-20 h-56 w-56 border border-secondary/15 [clip-path:polygon(50%_0,100%_28%,100%_100%,0_100%,0_28%)]" />
            <PublicImage
              src={leaderImage}
              alt={`${leaderName}, ${leaderTitle}`}
              ratio="fill"
              className="absolute inset-x-0 bottom-0 h-[94%] rounded-none bg-transparent"
              imageClassName="object-contain object-bottom"
              sizes="(min-width: 1024px) 34vw, 100vw"
            />
          </div>
          <div className="flex h-full min-h-0 flex-col px-5 py-6 sm:px-8 lg:overflow-hidden lg:px-8 lg:py-4 xl:px-10 xl:py-5">
            <SectionEyebrow value="Leadership in action" />
            <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
              {leaderTitle}
            </p>
            <h2 className="mt-1.5 max-w-md font-[family-name:var(--font-display)] text-3xl font-semibold leading-[1.05] text-slate-950 sm:text-4xl lg:text-[1.75rem] xl:text-[2rem]">
              {leaderName}
            </h2>
            <div className="mt-2.5 h-px w-12 bg-secondary" />
            <p className="mt-2.5 max-w-md text-sm leading-5 text-slate-600 lg:line-clamp-2">
              {leaderMessage}
            </p>
            <Link
              href={leaderHref}
              className="mt-4 inline-flex min-h-9 w-fit items-center gap-3 border-b border-secondary pb-1 text-sm font-bold text-primary transition hover:gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:mt-auto"
            >
              Meet the Vice Chancellor
              <ArrowRight className="h-4 w-4 text-secondary" aria-hidden />
            </Link>
          </div>
        </div>
        <div className="flex min-h-0 flex-col px-4 py-8 sm:px-8 lg:h-full lg:overflow-hidden lg:px-8 lg:py-5 xl:px-10 xl:py-6 2xl:px-12">
          <div className="shrink-0">
            <h3 className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-none text-primary sm:text-5xl lg:text-[2.35rem] xl:text-[2.65rem]">
              VC&apos;s Corner
            </h3>
            <div className="mt-2.5 h-0.5 w-14 bg-secondary" />
          </div>
          {activities.length ? (
            <div className="mt-3 grid min-h-0 flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-12 lg:grid-rows-3">
              {activities.map((item, index) => (
                <LeadershipActivityTile
                  key={item.id}
                  item={item}
                  featured={index === 0}
                />
              ))}
            </div>
          ) : (
            <p className="mt-5 flex-1 border-y border-primary/10 py-6 text-sm text-slate-600">
              Published leadership activities will appear here.
            </p>
          )}
          {activities.length ? (
            <Link
              href="/media"
              className="mt-2 inline-flex min-h-8 w-fit shrink-0 items-center gap-3 border-b border-secondary pb-0.5 text-sm font-bold text-primary transition hover:gap-4"
            >
              Explore news &amp; events
              <ArrowRight className="h-4 w-4 text-secondary" aria-hidden />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function ResearchCardsSection({ section }: SectionVariantProps) {
  const items = researchFocusItems(section);
  const backgroundImage =
    settingText(section, "backgroundImage") ??
    mediaUrl(background(section)) ??
    researchImpactBackground;
  return (
    <section
      id={section.section_key}
      className="relative isolate overflow-hidden border-b border-white/10 bg-primary py-14 text-white lg:py-20"
    >
      <PublicImage
        src={backgroundImage}
        alt=""
        ratio="fill"
        className="absolute inset-0 -z-20 h-full w-full rounded-none"
        imageClassName="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(2,6,23,.76)_0%,rgba(2,6,23,.54)_34%,rgba(2,6,23,.18)_58%,rgba(2,6,23,.04)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(2,6,23,.04),rgba(2,6,23,.16))]" />

      <div className="mx-auto grid max-w-[1680px] gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(280px,0.38fr)_minmax(0,0.62fr)] lg:items-end lg:px-8 xl:px-10 2xl:px-12">
        <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4">
          <SectionEyebrow
            value={section.subtitle ?? "Research and innovation"}
            light
          />
          <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
            {section.title ?? "Transforming Communities Through Research"}
          </h2>
          <SectionBody
            value={
              section.description ??
              "Kisii University research addresses practical challenges across health, agriculture, digital systems, governance, energy and community development."
            }
            light
            className="mt-5 max-w-xl text-white/78"
          />
          <CtaLink
            item={{
              title: "Explore research",
              cta_label: "Explore research",
              cta_url: "/research",
            }}
            className="mt-7"
            prominent
          />
        </div>

        <div
          aria-label="Research focus areas"
          className="grid gap-3 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:delay-150 sm:grid-cols-2"
        >
          {items.map((item, index) => (
            <ResearchFocusArea key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

const researchFocusFallbackItems: HomepageSectionItem[] = [
  {
    id: "research-focus-agriculture",
    title: "Climate-resilient agriculture",
    body_text: "Improving food security through practical farming innovation.",
    cta_url: "/research",
    display_order: 10,
  },
  {
    id: "research-focus-health",
    title: "Health and medical innovation",
    body_text: "Advancing solutions for healthier communities.",
    cta_url: "/research",
    display_order: 20,
  },
  {
    id: "research-focus-digital",
    title: "AI, data and digital transformation",
    body_text: "Developing intelligent systems for African futures.",
    cta_url: "/research",
    display_order: 30,
  },
  {
    id: "research-focus-energy",
    title: "Renewable energy and sustainability",
    body_text: "Building cleaner and more resilient energy pathways.",
    cta_url: "/research",
    display_order: 40,
  },
  {
    id: "research-focus-governance",
    title: "Law, governance and social justice",
    body_text: "Promoting justice, equity and accountable institutions.",
    cta_url: "/research",
    display_order: 50,
  },
  {
    id: "research-focus-community",
    title: "Enterprise and community development",
    body_text: "Turning knowledge into local opportunity and social impact.",
    cta_url: "/research",
    display_order: 60,
  },
];

function researchFocusItems(section: HomepageSection) {
  const items = displayItems(section).slice(0, 6);
  return items.length ? items : researchFocusFallbackItems;
}

function ResearchFocusArea({
  item,
  index,
}: {
  item: HomepageSectionItem;
  index: number;
}) {
  const body = (
    <article className="group border border-white/25 bg-slate-950/20 p-4 text-white transition duration-300 hover:-translate-y-0.5 hover:border-secondary/45 hover:bg-slate-950/32">
      <div className="flex gap-4">
        <span className="font-[family-name:var(--font-display)] text-sm font-semibold text-secondary">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold leading-tight text-white">
            {item.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/68">
            {item.body_text ?? item.cta_description}
          </p>
        </div>
      </div>
    </article>
  );

  return item.cta_url ? (
    <LinkWrapper href={item.cta_url}>{body}</LinkWrapper>
  ) : (
    body
  );
}

export function NewsGridSection({ section }: SectionVariantProps) {
  const items = displayItems(section).slice(0, 5);
  const [featured, ...rest] = items;
  return (
    <section
      id={section.section_key}
      className="border-b border-blue-100 bg-white py-12 lg:py-14"
    >
      <div className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(320px,0.44fr)_minmax(0,0.56fr)]">
          <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4">
            <SectionEyebrow value={section.subtitle ?? "Latest news"} />
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
              {section.title ?? "Latest news and stories"}
            </h2>
            <SectionBody value={section.description} className="mt-3" />
            {featured ? (
              <NewsLineItem item={featured} index={0} featured />
            ) : null}
          </div>
          <div className="divide-y divide-blue-100 border-y border-blue-100 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:delay-150">
            {rest.map((item, index) => (
              <NewsLineItem key={item.id} item={item} index={index + 1} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function EventsListSection({ section }: SectionVariantProps) {
  const items = displayItems(section).slice(0, 4);
  return (
    <section
      id={section.section_key}
      className="border-b border-blue-100 bg-blue-50/35 py-12 lg:py-14"
    >
      <div className="mx-auto grid max-w-[1680px] gap-7 px-4 sm:px-6 lg:grid-cols-[minmax(280px,0.3fr)_minmax(0,0.7fr)] lg:px-8 xl:px-10 2xl:px-12">
        <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4">
          <SectionEyebrow value={section.subtitle ?? "Upcoming events"} />
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
            {section.title ?? "Upcoming events"}
          </h2>
          <SectionBody value={section.description} className="mt-3" />
        </div>
        <div className="grid gap-3 md:grid-cols-2 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:delay-150">
          {items.map((item, index) => (
            <EventLineItem key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function LogoCarouselSection({ section }: SectionVariantProps) {
  const partnerItems = partnerDisplayItems(section);
  const marqueeItems =
    partnerItems.length > 1 ? [...partnerItems, ...partnerItems] : partnerItems;
  return (
    <section
      id={section.section_key}
      className="relative isolate overflow-hidden border-b border-blue-100 bg-white py-12 lg:py-14"
    >
      <div className="pointer-events-none absolute right-0 top-0 -z-10 h-full w-1/2 bg-[radial-gradient(circle_at_70%_25%,rgba(3,71,52,.08),transparent_38%)]" />
      <div className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="max-w-4xl motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4">
          <SectionEyebrow value={section.subtitle ?? "Our partners"} />
          <h2 className="mt-3 max-w-4xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-primary sm:text-4xl lg:text-5xl">
            {section.title ??
              "A network advancing learning, research and community impact."}
          </h2>
          <SectionBody
            value={
              section.description ??
              "Kisii University works with academic, industry, government and development partners to expand opportunity and translate knowledge into public value."
            }
            className="mt-4 max-w-3xl text-base leading-7"
          />
          <CtaLink
            item={{
              title: "Explore partnerships",
              cta_label: "Explore partnerships",
              cta_url: "/research/partnerships",
            }}
            className="mt-6"
          />
        </div>

        <div className="group relative mt-9 overflow-hidden border-y border-blue-100 py-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:delay-150">
          <style>
            {`
              @keyframes homepage-partner-rail {
                from { transform: translate3d(0, 0, 0); }
                to { transform: translate3d(-50%, 0, 0); }
              }
              @media (prefers-reduced-motion: reduce) {
                .homepage-partner-rail {
                  animation: none !important;
                  transform: none !important;
                }
              }
            `}
          </style>
          <div className="overflow-x-auto [scrollbar-width:none] motion-reduce:overflow-x-auto [&::-webkit-scrollbar]:hidden">
            <div
              className={[
                "homepage-partner-rail flex w-max min-w-full items-center gap-0",
                partnerItems.length > 1
                  ? "[animation:homepage-partner-rail_42s_linear_infinite] group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {marqueeItems.map((partner, index) => (
                <PartnerLogoRailItem
                  key={`${partner.id}-${index}`}
                  partner={partner}
                  duplicate={index >= partnerItems.length}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type PartnerDisplayItem = {
  id: string;
  name: string;
  href?: string;
  logoUrl?: string;
  logoAlt?: string;
};

function partnerDisplayItems(section: HomepageSection): PartnerDisplayItem[] {
  const logoItems = logos(section)
    .map((logo, index): PartnerDisplayItem | null => {
      const logoUrl = mediaUrl(logo);
      if (!logoUrl) return null;
      return {
        id: logo.id ?? logo.media_id ?? `section-logo-${index}`,
        name: mediaAlt(logo, "Partner logo"),
        logoAlt: mediaAlt(logo, "Partner logo"),
        logoUrl,
      };
    })
    .filter((item): item is PartnerDisplayItem => item !== null);

  if (logoItems.length) return logoItems;

  return displayItems(section)
    .slice(0, 16)
    .map((item) => {
      const partner = item.content_enriched?.research_partner;
      const partnerName = partner?.acronym ?? partner?.name ?? null;
      const logoUrl =
        partner?.logo_url ?? itemContentText(item, "logoUrl") ?? itemImageUrl(item) ?? undefined;
      const name = itemContentText(item, "label") ?? partnerName ?? item.title ?? "Partner";

      return {
        id: item.id,
        name,
        href: item.cta_url ?? partner?.website ?? itemContentText(item, "url") ?? undefined,
        logoUrl,
        logoAlt: item.media_alt_text ?? partner?.name ?? item.title ?? "Partner logo",
      };
    });
}

function PartnerLogoRailItem({
  partner,
  duplicate,
}: {
  partner: PartnerDisplayItem;
  duplicate: boolean;
}) {
  const external = partner.href ? /^https?:\/\//i.test(partner.href) : false;
  const content = (
    <div
      className="group/logo flex h-20 w-48 shrink-0 items-center justify-center border-r border-blue-100 px-7 sm:w-56 lg:w-64"
      aria-hidden={duplicate ? "true" : undefined}
    >
      {partner.logoUrl ? (
        <PublicImage
          src={partner.logoUrl}
          alt={duplicate ? "" : (partner.logoAlt ?? partner.name)}
          ratio="logo"
          sizes="220px"
          className="h-12 bg-transparent"
          imageClassName="object-contain"
        />
      ) : (
        <span className="text-center font-[family-name:var(--font-display)] text-xl font-semibold leading-tight text-primary">
          {partner.name}
        </span>
      )}
    </div>
  );

  if (!partner.href) return content;

  return (
    <Link
      href={partner.href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      title={partner.name}
      tabIndex={duplicate ? -1 : undefined}
      aria-hidden={duplicate ? "true" : undefined}
      className="group/partnerlink relative block shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
    >
      {content}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-2 z-20 max-w-56 -translate-x-1/2 -translate-y-1 rounded-full bg-primary px-3 py-1 text-center text-xs font-semibold leading-tight text-white opacity-0 shadow-lg shadow-slate-900/15 transition duration-200 group-hover/partnerlink:translate-y-0 group-hover/partnerlink:opacity-100 group-focus-visible/partnerlink:translate-y-0 group-focus-visible/partnerlink:opacity-100"
      >
        {partner.name}
      </span>
    </Link>
  );
}

export function AlumniStorySection({ section }: SectionVariantProps) {
  const item = displayItems(section)[0];
  const image = heroImage(section) ?? poster(section);
  const imageUrl =
    itemImageUrl(item) ?? settingText(section, "imageUrl") ?? mediaUrl(image);
  return (
    <section
      id={section.section_key}
      className="border-b border-blue-100 bg-blue-50/35 py-12 lg:py-14"
    >
      <div className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="grid overflow-hidden bg-white lg:grid-cols-[0.38fr_0.62fr] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4">
          <PublicImage
            src={imageUrl}
            alt={mediaAlt(image, section.title ?? "Alumni story")}
            ratio="news"
            className="min-h-[320px] rounded-none"
            imageClassName="object-cover"
          />
          <div className="flex flex-col justify-center border border-blue-100 p-6 sm:p-8 lg:border-l-0 lg:p-10">
            <SectionEyebrow value={section.subtitle ?? "Alumni impact"} />
            <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
              {item?.title ?? section.title ?? "Alumni story"}
            </h2>
            <p className="mt-5 max-w-4xl border-l-4 border-secondary pl-5 font-[family-name:var(--font-display)] text-xl leading-8 text-slate-700">
              “{item?.body_text ?? section.description}”
            </p>
            <p className="mt-4 text-sm font-semibold text-primary">
              {item?.subtitle}
            </p>
            {item ? <CtaLink item={item} className="mt-6" /> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export function FactsStripSection({ section }: SectionVariantProps) {
  return (
    <section className="bg-primary py-10 text-white">
      <div className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <SectionEyebrow
          value={section.title ?? "Kisii University at a glance"}
          light
        />
        <div className="mt-5 grid grid-cols-2 gap-y-6 sm:grid-cols-4 lg:grid-cols-7">
          {displayItems(section)
            .slice(0, 7)
            .map((item) => (
              <div
                key={item.id}
                className="border-l border-white/20 px-4 first:border-l-0 first:pl-0"
              >
                <p className="font-[family-name:var(--font-display)] text-3xl font-semibold">
                  {item.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  {item.body_text ?? item.subtitle}
                </p>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}

export function VideoFeatureSection({ section }: SectionVariantProps) {
  const media = video(section) ?? poster(section);
  return (
    <SectionFrame section={section}>
      <SectionHeading
        section={section}
        fallback="Featured video"
        icon={PlayCircle}
      />
      <PublicImage
        src={mediaUrl(media)}
        alt={mediaAlt(media, section.title ?? "Featured video")}
        ratio="hero"
        className="mt-8 rounded-md border border-blue-100"
      />
    </SectionFrame>
  );
}

function SectionFrame({
  section,
  children,
  tinted = false,
}: {
  section: HomepageSection;
  children: ReactNode;
  tinted?: boolean;
}) {
  return (
    <section
      id={section.section_key}
      className={
        tinted
          ? "border-b border-blue-100 bg-blue-50/45 py-14 lg:py-16"
          : "border-b border-blue-100 bg-white py-14 lg:py-16"
      }
    >
      <div className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        {children}
      </div>
    </section>
  );
}

function SectionHeading({
  section,
  fallback,
  icon: Icon,
}: {
  section: HomepageSection;
  fallback: string;
  icon?: typeof Landmark;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <SectionEyebrow value={section.subtitle} />
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-slate-950 sm:text-4xl">
          {section.title ?? fallback}
        </h2>
        <SectionBody value={section.description} className="mt-3 max-w-3xl" />
      </div>
      {Icon ? (
        <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary text-white sm:flex">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      ) : null}
    </div>
  );
}

function ImageArticleCard({
  item,
  icon: Icon,
  compact = false,
  dark = false,
}: {
  item: HomepageSectionItem;
  icon: typeof Landmark;
  compact?: boolean;
  dark?: boolean;
}) {
  const category = itemContentText(item, "category");
  const date = itemContentText(item, "date");
  const content = (
    <article
      className={`group h-full overflow-hidden rounded-md border shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${dark ? "border-white/15 bg-white/10" : "border-blue-100 bg-white"}`}
    >
      <PublicImage
        src={itemImageUrl(item)}
        alt={
          itemContentText(item, "imageAlt") ??
          item.media_alt_text ??
          item.title ??
          "Kisii University"
        }
        ratio="news"
        className={compact ? "min-h-32 rounded-none" : "rounded-none"}
        imageClassName="transition duration-500 group-hover:scale-[1.04]"
      />
      <div className={compact ? "p-4" : "p-5"}>
        <div className="flex items-center gap-2">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full ${dark ? "bg-white/15 text-secondary" : "bg-blue-50 text-primary"}`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
          </span>
          {category || date ? (
            <p
              className={`text-[10px] font-bold uppercase tracking-[0.12em] ${dark ? "text-white/65" : "text-secondary"}`}
            >
              {category ?? date}
            </p>
          ) : null}
        </div>
        <h3
          className={`mt-3 font-[family-name:var(--font-display)] font-semibold ${compact ? "text-base" : "text-xl"} ${dark ? "text-white" : "text-slate-950"}`}
        >
          {item.title ?? "Learn more"}
        </h3>
        {!compact && (item.body_text || item.subtitle) ? (
          <p
            className={`mt-2 text-sm leading-6 ${dark ? "text-white/70" : "text-slate-600"}`}
          >
            {item.body_text ?? item.subtitle}
          </p>
        ) : null}
        {date && category ? (
          <p
            className={`mt-3 text-xs ${dark ? "text-white/60" : "text-slate-500"}`}
          >
            {date}
          </p>
        ) : null}
      </div>
    </article>
  );
  return item.cta_url ? (
    <LinkWrapper href={item.cta_url}>{content}</LinkWrapper>
  ) : (
    content
  );
}

function DateLineItem({
  item,
  index,
}: {
  item: HomepageSectionItem;
  index: number;
}) {
  const date = itemContentText(item, "date") ?? item.subtitle;
  const body = (
    <article className="group grid gap-4 py-5 transition hover:bg-blue-50/60 sm:grid-cols-[80px_minmax(0,1fr)_auto] sm:items-center sm:px-4">
      <span className="font-[family-name:var(--font-display)] text-3xl font-semibold text-primary/25 transition group-hover:text-primary">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary">
          {date ?? "Academic date"}
        </p>
        <h3 className="mt-1 font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">
          {item.title}
        </h3>
        {item.body_text ? (
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {item.body_text}
          </p>
        ) : null}
      </div>
      <ArrowRight className="hidden h-4 w-4 text-primary opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100 sm:block" />
    </article>
  );
  return item.cta_url ? (
    <LinkWrapper href={item.cta_url}>{body}</LinkWrapper>
  ) : (
    body
  );
}

function DateMiniItem({
  item,
  index,
}: {
  item: HomepageSectionItem;
  index: number;
}) {
  const body = (
    <article className="group border border-white/15 bg-white/10 p-4 transition hover:bg-white/15">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary">
        {itemContentText(item, "date") ?? item.subtitle ?? `Date ${index + 1}`}
      </p>
      <h4 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold text-white">
        {item.title}
      </h4>
      <p className="mt-2 text-sm leading-6 text-white/72">
        {item.body_text ?? item.cta_description}
      </p>
    </article>
  );

  return item.cta_url ? (
    <LinkWrapper href={item.cta_url}>{body}</LinkWrapper>
  ) : (
    body
  );
}

function formatDateRange(start?: string | null, end?: string | null) {
  const startDate = formatPublicDate(start);
  const endDate = formatPublicDate(end);
  if (startDate && endDate) return `${startDate} – ${endDate}`;
  return startDate ?? endDate ?? "See admission notice";
}

function activityDetails(item: HomepageSectionItem) {
  const linked = item.content_enriched?.linked_content;
  if (!linked?.is_published || !linked.title || !linked.href) return null;
  const rawDate =
    linked.type === "event" ? linked.start_date : linked.published_at;
  return {
    href: linked.href,
    title: linked.title,
    summary: linked.summary,
    altText: linked.featured_media?.alt_text ?? linked.title,
    imageUrl:
      linked.featured_media?.cdn_url ??
      linked.featured_media?.public_url ??
      linked.featured_media?.url ??
      linked.featured_media?.thumbnail_url ??
      null,
    typeLabel:
      linked.type === "blog"
        ? "Story"
        : linked.type === "event"
          ? "Event"
          : "News",
    isEvent: linked.type === "event",
    rawDate,
    date: formatPublicDate(rawDate),
  };
}

function leadershipEventDateParts(value?: string | null) {
  if (!value) return { day: "—", month: "Upcoming" };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { day: "—", month: value };
  return {
    day: new Intl.DateTimeFormat("en-KE", {
      day: "2-digit",
      timeZone: "Africa/Nairobi",
    }).format(date),
    month: new Intl.DateTimeFormat("en-KE", {
      month: "short",
      timeZone: "Africa/Nairobi",
    })
      .format(date)
      .toUpperCase(),
  };
}

function LeadershipActivityTile({
  item,
  featured,
}: {
  item: HomepageSectionItem;
  featured: boolean;
}) {
  const details = activityDetails(item);
  if (!details) return null;
  const {
    href,
    title,
    summary,
    altText,
    imageUrl,
    typeLabel,
    isEvent,
    rawDate,
    date,
  } = details;
  const placement = featured
    ? "min-h-[280px] sm:col-span-2 lg:col-span-7 lg:row-span-3 lg:min-h-0"
    : "min-h-[170px] lg:col-span-5 lg:min-h-0";

  if (isEvent) {
    const eventDate = leadershipEventDateParts(rawDate);
    return (
      <Link
        href={href}
        className={`group relative isolate overflow-hidden bg-primary text-white transition-colors hover:bg-primary/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 ${placement}`}
      >
        {imageUrl ? (
          <PublicImage
            src={imageUrl}
            alt={altText}
            ratio="fill"
            className="absolute inset-y-0 right-0 -z-20 h-full w-[48%] rounded-none opacity-35"
            imageClassName="object-cover transition duration-700 group-hover:scale-[1.025]"
            sizes={featured ? "32vw" : "18vw"}
          />
        ) : null}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,hsl(var(--primary))_0%,hsl(var(--primary))_54%,hsl(var(--primary)/.72)_100%)]" />
        <div className="absolute -bottom-12 -right-8 -z-10 h-40 w-40 rounded-full border border-secondary/25" />
        <article className="flex h-full min-h-0 flex-col p-4 xl:p-5">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden />
            Event
          </p>
          <div
            className={`mt-auto grid items-end gap-3 ${featured ? "grid-cols-[72px_minmax(0,1fr)] xl:grid-cols-[82px_minmax(0,1fr)]" : "grid-cols-[58px_minmax(0,1fr)]"}`}
          >
            <div className="border-l-2 border-secondary pl-3">
              <span
                className={`block font-[family-name:var(--font-display)] font-semibold leading-none text-white ${featured ? "text-5xl" : "text-3xl"}`}
              >
                {eventDate.day}
              </span>
              <span className="mt-1 block text-[10px] font-bold tracking-[0.16em] text-secondary">
                {eventDate.month}
              </span>
            </div>
            <div className="min-w-0">
              <h4
                className={`line-clamp-2 font-[family-name:var(--font-display)] font-semibold leading-tight text-white ${featured ? "text-2xl xl:text-3xl" : "text-base xl:text-lg"}`}
              >
                {title}
              </h4>
              {featured && summary ? (
                <p className="mt-2 line-clamp-2 text-sm leading-5 text-white/72">
                  {summary}
                </p>
              ) : null}
            </div>
          </div>
          <ArrowRight
            className="absolute right-4 top-4 h-5 w-5 text-secondary transition group-hover:translate-x-1"
            aria-hidden
          />
        </article>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`group relative isolate overflow-hidden bg-slate-950 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 ${placement}`}
    >
      {imageUrl ? (
        <PublicImage
          src={imageUrl}
          alt={altText}
          ratio="fill"
          className="absolute inset-0 -z-20 rounded-none"
          imageClassName="object-cover object-top transition duration-700 group-hover:scale-[1.03]"
          sizes={featured ? "46vw" : "28vw"}
        />
      ) : (
        <div className="absolute inset-0 -z-20 bg-primary" />
      )}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(2,6,23,.12)_5%,rgba(2,6,23,.32)_45%,rgba(2,6,23,.92)_100%)]" />
      <article className="flex h-full min-h-0 flex-col p-4 xl:p-5">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/90">
          <Newspaper className="h-3.5 w-3.5 text-secondary" aria-hidden />
          {typeLabel}
          {date ? <span className="font-medium text-white/65">{date}</span> : null}
        </p>
        <div className="mt-auto grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
          <div className="min-w-0">
            <h4
              className={`line-clamp-2 font-[family-name:var(--font-display)] font-semibold leading-tight text-white ${featured ? "text-2xl sm:text-3xl xl:text-[2rem]" : "text-base xl:text-lg"}`}
            >
              {title}
            </h4>
            {featured && summary ? (
              <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-5 text-white/72">
                {summary}
              </p>
            ) : null}
          </div>
          <ArrowRight
            className="h-5 w-5 shrink-0 text-secondary transition group-hover:translate-x-1"
            aria-hidden
          />
        </div>
      </article>
    </Link>
  );
}

function NewsLineItem({
  item,
  index,
  featured = false,
}: {
  item: HomepageSectionItem;
  index: number;
  featured?: boolean;
}) {
  const date = itemContentText(item, "date") ?? item.subtitle;
  const body = featured ? (
    <article className="group mt-6 overflow-hidden border border-blue-100 bg-blue-50/45 transition hover:bg-blue-50">
      <PublicImage
        src={itemImageUrl(item)}
        alt={item.media_alt_text ?? item.title ?? "News story"}
        ratio="news"
        className="rounded-none"
        imageClassName="object-cover transition duration-700 group-hover:scale-105"
      />
      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary">
          {date ?? "Featured"}
        </p>
        <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-slate-950">
          {item.title}
        </h3>
      </div>
    </article>
  ) : (
    <article className="group grid gap-4 py-5 transition hover:bg-blue-50/60 sm:grid-cols-[56px_minmax(0,1fr)_auto] sm:items-center sm:px-4">
      <span className="font-[family-name:var(--font-display)] text-2xl font-semibold text-primary/25 transition group-hover:text-primary">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary">
          {date ?? "News"}
        </p>
        <h3 className="mt-1 font-[family-name:var(--font-display)] text-xl font-semibold leading-tight text-slate-950">
          {item.title}
        </h3>
      </div>
      <ArrowRight className="hidden h-4 w-4 text-primary opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100 sm:block" />
    </article>
  );
  return item.cta_url ? (
    <LinkWrapper href={item.cta_url}>{body}</LinkWrapper>
  ) : (
    body
  );
}

function EventLineItem({
  item,
  index,
}: {
  item: HomepageSectionItem;
  index: number;
}) {
  const date = itemContentText(item, "date") ?? item.subtitle;
  const venue = itemContentText(item, "venue") ?? item.cta_description;
  const body = (
    <article className="group flex min-h-36 gap-4 border border-blue-100 bg-white p-4 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm">
      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center bg-primary text-center text-white">
        <span className="text-xs font-bold uppercase tracking-[0.12em]">
          {date?.split(" ")[0] ?? String(index + 1).padStart(2, "0")}
        </span>
        <CalendarDays className="mt-1 h-4 w-4 text-secondary" aria-hidden />
      </div>
      <div className="min-w-0">
        <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold leading-tight text-slate-950">
          {item.title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {venue ?? item.body_text}
        </p>
      </div>
    </article>
  );
  return item.cta_url ? (
    <LinkWrapper href={item.cta_url}>{body}</LinkWrapper>
  ) : (
    body
  );
}

function PulseItem({
  item,
  index,
}: {
  item: HomepageSectionItem;
  index: number;
}) {
  const Icon = pulseIcon(item, index);
  const body = (
    <div className="group flex min-h-[86px] min-w-[250px] snap-start items-center gap-3 border-r border-white/10 px-4 py-4 transition hover:bg-white/[0.06] sm:min-w-[285px] lg:min-w-0 lg:border-r-0">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/10 text-secondary transition group-hover:bg-white/15">
        <Icon className="h-[18px] w-[18px]" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="line-clamp-1 text-sm font-semibold text-white">
          {item.title}
        </p>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/65">
          {item.body_text ?? item.subtitle}
        </p>
      </div>
    </div>
  );
  return item.cta_url ? (
    <LinkWrapper href={item.cta_url}>{body}</LinkWrapper>
  ) : (
    body
  );
}

function pulseIcon(item: HomepageSectionItem, index: number): LucideIcon {
  const icon = itemContentText(item, "icon")?.toLowerCase();
  const icons: Record<string, LucideIcon> = {
    achievement: Trophy,
    admissions: CalendarDays,
    award: Award,
    calendar: CalendarDays,
    graduation: GraduationCap,
    news: Newspaper,
    partnership: Handshake,
    research: Lightbulb,
    students: Users,
    update: Bell,
  };
  const fallback = [
    CalendarDays,
    Lightbulb,
    Handshake,
    Trophy,
    GraduationCap,
    BookOpenCheck,
  ];
  return (icon && icons[icon]) || fallback[index % fallback.length];
}

function SectionEyebrow({
  value,
  light = false,
}: {
  value?: string | null;
  light?: boolean;
}) {
  if (!value) return null;
  return (
    <p
      className={
        light
          ? "text-xs font-bold uppercase tracking-[0.16em] text-white/75"
          : "text-xs font-bold uppercase tracking-[0.16em] text-secondary"
      }
    >
      {value}
    </p>
  );
}

function SectionBody({
  value,
  className,
  light = false,
}: {
  value?: string | null;
  className?: string;
  light?: boolean;
}) {
  if (!value) return null;
  return (
    <p
      className={[
        "text-sm leading-7",
        light ? "text-white/82" : "text-slate-600",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {value}
    </p>
  );
}

function CtaLink({
  item,
  className,
  prominent = false,
}: {
  item: Pick<HomepageSectionItem, "cta_label" | "cta_url" | "title">;
  className?: string;
  prominent?: boolean;
}) {
  if (!item.cta_url) return null;
  const label = item.cta_label ?? item.title ?? "Learn more";
  return (
    <LinkWrapper
      href={item.cta_url}
      className={[
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 text-sm font-semibold transition",
        prominent
          ? "bg-secondary text-white hover:bg-secondary/90"
          : "bg-primary text-white hover:bg-primary/90",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label}
      <ArrowRight className="h-4 w-4" aria-hidden />
    </LinkWrapper>
  );
}

function LinkWrapper({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const external = /^https?:\/\//i.test(href);
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={className}
    >
      {children}
    </Link>
  );
}

function displayItems(section: HomepageSection) {
  return (section.items ?? [])
    .filter((item) => item.is_enabled !== false)
    .sort(
      (first, second) =>
        (first.display_order ?? 100) - (second.display_order ?? 100),
    );
}

function itemContentText(item: HomepageSectionItem | undefined, key: string) {
  const value = item?.content?.[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function itemContentNumber(item: HomepageSectionItem | undefined, key: string) {
  const value = item?.content?.[key];
  return typeof value === "number" ? value : undefined;
}

function itemImageUrl(item: HomepageSectionItem | undefined) {
  return itemContentText(item, "imageUrl");
}

function settingText(section: HomepageSection, key: string) {
  const value = section.settings?.[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}
