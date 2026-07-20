import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  Award,
  Bell,
  BookOpenCheck,
  CalendarDays,
  Facebook,
  FileDown,
  GraduationCap,
  Handshake,
  Instagram,
  Landmark,
  Linkedin,
  Lightbulb,
  Mail,
  MapPin,
  Newspaper,
  PlayCircle,
  Trophy,
  Users,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import { AdmissionsCountdown } from "@/components/home/admissions-countdown";
import { ImageCurtainReveal } from "@/components/about/image-curtain-reveal";
import { CampusLifeHorizontalScroller } from "@/components/home/campus-life-horizontal-scroller";
import { NewsletterSubscribeForm } from "@/components/home/newsletter-subscribe-form";
import { ProgrammeFinderInteractive } from "@/components/home/programme-finder-interactive";
import { WhyKisiiSection } from "@/components/home/why-kisii-section";
import { PublicImage } from "@/components/public/public-image";
import type {
  HomeCard,
  HomeIntake,
  HomeProgrammeCard,
  HomeSchoolCard,
  HomeSocialLinks,
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
  eventsSection?: HomepageSection | null;
  programmeFinderData?: ProgrammeFinderData;
  featuredStories?: HomeCard[];
  socialLinks?: HomeSocialLinks;
};

export type ProgrammeFinderData = {
  schools: HomeSchoolCard[];
  programmes: HomeProgrammeCard[];
  intakes: HomeIntake[];
};

export function FeaturedStoriesSection({
  stories,
}: {
  stories?: HomeCard[];
}) {
  const items = (stories ?? []).slice(0, 4);
  if (!items.length) return null;
  const [lead, ...secondary] = items;

  return (
    <section className="relative isolate overflow-hidden border-y border-primary/10 py-12 lg:py-14">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_12%,hsl(var(--primary)/.10),transparent_34%),linear-gradient(180deg,rgba(255,255,255,.78),hsl(var(--surface-subtle)/.72))]"
        aria-hidden
      />
      <div className="mx-auto grid max-w-[1680px] gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(340px,0.55fr)] lg:px-8 xl:px-10 2xl:px-12">
        <div>
          <SectionEyebrow value="Featured stories" />
          <div className="mt-3 grid gap-5 md:grid-cols-[0.78fr_1fr] md:items-end">
            <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-[0.95] text-primary sm:text-5xl">
              Voices and work shaping Kisii University.
            </h2>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              Student, staff, alumni, partner, and community stories reviewed
              by Corporate Communication before publication.
            </p>
          </div>
          {lead ? (
            <LinkWrapper
              href={lead.href}
              className="group mt-7 grid overflow-hidden border-y border-primary/15 bg-white/70 transition hover:border-primary/30 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)]"
            >
              <ImageCurtainReveal
                className="min-h-[270px] bg-primary/10"
                direction="right"
              >
                <PublicImage
                  src={lead.imageUrl}
                  alt={lead.title}
                  ratio="fill"
                  fallbackContent={<Newspaper className="h-10 w-10" />}
                  sizes="(min-width: 1024px) 48vw, 100vw"
                  className="absolute inset-0 h-full w-full"
                  imageClassName="object-cover transition duration-700 group-hover:scale-[1.035]"
                />
                <span className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-primary/40 to-transparent" />
              </ImageCurtainReveal>
              <div className="flex min-h-[270px] flex-col justify-end p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-primary/70">
                  {lead.eyebrow ? <span>{lead.eyebrow}</span> : null}
                  {lead.meta ? <span>{lead.meta}</span> : null}
                </div>
                <h3 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-primary">
                  {lead.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {lead.body}
                </p>
                <span className="mt-6 inline-flex items-center gap-3 text-sm font-bold text-secondary">
                  Read story
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </div>
            </LinkWrapper>
          ) : null}
        </div>

        <div className="flex flex-col justify-end">
          <div className="divide-y divide-primary/10 border-y border-primary/15">
            {secondary.map((story, index) => (
              <LinkWrapper
                key={story.id ?? story.href}
                href={story.href}
                className="group grid gap-4 py-5 sm:grid-cols-[112px_minmax(0,1fr)]"
              >
                <ImageCurtainReveal
                  className="h-24 rounded-sm bg-primary/10"
                  direction={index % 2 === 0 ? "right" : "left"}
                >
                  <PublicImage
                    src={story.imageUrl}
                    alt={story.title}
                    ratio="fill"
                    fallbackContent={<Newspaper className="h-5 w-5" />}
                    sizes="112px"
                    className="absolute inset-0 h-full w-full"
                    imageClassName="object-cover transition duration-500 group-hover:scale-105"
                  />
                </ImageCurtainReveal>
                <div>
                  <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.14em] text-primary/65">
                    <span>{String(index + 2).padStart(2, "0")}</span>
                    {story.eyebrow ? <span>{story.eyebrow}</span> : null}
                  </div>
                  <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-bold leading-tight text-primary">
                    {story.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {story.body}
                  </p>
                </div>
              </LinkWrapper>
            ))}
          </div>
          <LinkWrapper
            href="/stories"
            className="mt-6 inline-flex w-fit items-center gap-3 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primary/90"
          >
            Explore all stories
            <ArrowRight className="h-4 w-4" />
          </LinkWrapper>
        </div>
      </div>
    </section>
  );
}

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
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-full bg-[linear-gradient(90deg,rgba(1,8,22,.48)_0%,rgba(1,8,22,.24)_34%,transparent_72%)] sm:w-[82%] lg:w-[68%]"
        aria-hidden
      />

      <div
        className={`relative z-10 mx-auto grid min-h-[clamp(390px,calc(100svh-13rem),580px)] max-w-[1680px] items-center gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16 xl:px-10 2xl:px-12 ${
          showAdmissions
            ? "lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]"
            : "lg:grid-cols-1"
        }`}
      >
        <div className="max-w-2xl self-end [text-shadow:0_2px_14px_rgba(0,0,0,.55)]">
          <h1 className="line-clamp-2 max-w-2xl text-balance font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
            {headline}
            {highlight ? (
              <span className="text-secondary"> {highlight}</span>
            ) : null}
          </h1>
          <SectionBody
            value={description}
            light
            className="mt-4 line-clamp-2 max-w-xl text-base leading-7 text-white/90 sm:text-lg sm:leading-8"
          />
          {actions.length ? (
            <div className="mt-6 flex flex-wrap gap-3">
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
      className="w-full max-w-md justify-self-start rounded-md border border-white/20 bg-primary/95 p-5 shadow-xl shadow-primary/20 sm:p-6 lg:justify-self-end"
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
      className="border-b border-border bg-white/[0.82] py-10 backdrop-blur-[1px] lg:py-12"
    >
      <div className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="relative">
            <ImageCurtainReveal
              className="min-h-[280px] lg:min-h-[360px]"
              direction="left"
            >
              <PublicImage
                src={mediaUrl(image) ?? heriAfricaLaunchImage}
                alt={mediaAlt(
                  image,
                  title ?? "Kisii University and Heri Africa partnership",
                )}
                ratio="fill"
                className="absolute inset-0 h-full w-full rounded-none"
                imageClassName="object-cover object-[50%_38%]"
              />
            </ImageCurtainReveal>
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
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-foreground sm:text-4xl lg:text-5xl">
              {title ?? "Partnership spotlight"}
            </h2>
            <SectionBody
              value={summary}
              className="mt-4 max-w-2xl text-base leading-7"
            />
            <div className="mt-7 divide-y divide-blue-100 border-y border-border">
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
  const journey = displayItems(section).filter(
    (item) => itemContentText(item, "group") === "journey",
  );
  const dateItems = academicDatesSection
    ? displayItems(academicDatesSection).slice(0, 4)
    : [];
  const intakes = programmeFinderData?.intakes ?? [];
  const programmes = programmeFinderData?.programmes ?? [];
  const schools = programmeFinderData?.schools ?? [];
  const hasAdmissionDates = dateItems.length > 0 || intakes.length > 0;

  return (
    <section
      id={section.section_key}
      className="programme-discovery-mosaic relative isolate overflow-hidden border-b border-border bg-white/[0.82] py-8 backdrop-blur-[1px] sm:py-10 lg:py-12"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,hsl(var(--accent)/.55),transparent)]" />
      <div className="relative mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="programme-mosaic-grid grid overflow-hidden border border-primary/10 bg-white/[0.95] shadow-[0_24px_70px_-48px_hsl(var(--primary)/.45)] lg:grid-cols-12">
          <header className="programme-mosaic-intro relative flex flex-col justify-between overflow-hidden bg-primary p-6 text-white sm:p-8 lg:col-span-4 lg:row-start-1">
            <div
              className="absolute -right-20 -top-24 h-52 w-52 rounded-full border border-white/10"
              aria-hidden
            />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
                {section.subtitle ?? "Programmes and academic pathways"}
              </p>
              <h2 className="mt-3 max-w-sm font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.04] text-white sm:text-5xl">
                What will you become?
              </h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/75 sm:text-base sm:leading-7">
                {section.description ??
                  "Search programmes built around your interests, ambitions and future."}
              </p>
            </div>
            <div className="relative mt-8 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white/65">
              <span className="h-px w-12 bg-secondary" />
              Search. Discover. Apply.
            </div>
          </header>

          <ProgrammeFinderInteractive
            programmes={programmes}
            schools={schools}
          />

          <figure className="programme-mosaic-image relative min-h-48 overflow-hidden bg-primary lg:col-start-1 lg:col-end-4 lg:row-start-2 lg:min-h-0">
            <PublicImage
              src="/images/Home/OurKSU-82.jpg"
              alt="Kisii University students exploring their academic future"
              ratio="fill"
              className="absolute inset-0 h-full w-full rounded-none"
              imageClassName="object-cover object-center transition duration-700 hover:scale-[1.03]"
              sizes="(min-width: 1024px) 25vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/75 via-transparent to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-0 p-5 text-sm font-semibold text-white">
              Learn in a community built for discovery.
            </figcaption>
          </figure>

          {hasAdmissionDates ? (
            <aside className="programme-mosaic-dates relative overflow-hidden bg-primary p-5 text-white sm:p-7 lg:col-start-10 lg:col-end-13 lg:row-start-2">
              <div className="absolute inset-x-0 top-0 h-1 bg-secondary" />
              <SectionEyebrow
                value={
                  academicDatesSection?.subtitle ?? "Admissions and reporting"
                }
                light
              />
              <div className="mt-2 flex items-center justify-between gap-4">
                <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-white">
                  Key dates
                </h3>
                <CalendarDays className="h-6 w-6 text-secondary" aria-hidden />
              </div>

              {intakes.slice(0, 1).map((intake) => (
                <LinkWrapper
                  key={intake.id}
                  href={intake.href}
                  className="mt-4 block border-y border-white/20 py-3 transition hover:border-secondary/70"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-secondary">
                    {intake.isOpen ? "Open intake" : "Intake"}
                  </p>
                  <h4 className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold text-white">
                    {intake.name}
                  </h4>
                  <p className="mt-1 text-xs leading-5 text-white/72">
                    {formatDateRange(
                      intake.applicationStart,
                      intake.applicationEnd ?? intake.lateApplicationEnd,
                    )}
                  </p>
                </LinkWrapper>
              ))}

              <div className="mt-1 divide-y divide-white/15">
                {dateItems
                  .slice(0, intakes.length ? 3 : 4)
                  .map((item, index) => (
                    <AdmissionDateLine
                      key={item.id}
                      item={item}
                      index={index}
                    />
                  ))}
              </div>

              <LinkWrapper
                href="/admissions"
                className="mt-4 inline-flex min-h-10 w-fit items-center justify-center gap-2 border-b border-secondary pb-1 text-sm font-bold text-white transition hover:text-secondary"
              >
                Explore admissions
                <ArrowRight className="h-4 w-4" aria-hidden />
              </LinkWrapper>
            </aside>
          ) : (
            <div className="hidden bg-primary lg:col-start-10 lg:col-end-13 lg:row-start-2 lg:block" />
          )}

          <div className="programme-mosaic-journey border-t border-primary/10 bg-accent/35 p-5 sm:p-7 lg:col-span-12 lg:row-start-3 lg:px-8 lg:py-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <SectionEyebrow value="Your journey to Kisii University" />
                <h3 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-primary sm:text-3xl">
                  Five clear steps. One destination.
                </h3>
              </div>
              <LinkWrapper
                href="/admissions/how-to-apply"
                className="inline-flex min-h-10 w-fit shrink-0 items-center justify-center gap-2 text-sm font-bold text-primary transition hover:text-secondary"
              >
                Application guide
                <ArrowRight className="h-4 w-4" aria-hidden />
              </LinkWrapper>
            </div>

            <div className="relative mt-7 grid gap-1 sm:grid-cols-2 lg:grid-cols-5 lg:gap-0">
              <span
                className="programme-journey-line absolute left-[10%] right-[10%] top-5 hidden h-px origin-left bg-primary/20 lg:block"
                aria-hidden
              />
              {journey.slice(0, 5).map((item, index) => (
                <div
                  key={item.id}
                  className="programme-journey-step group relative flex gap-4 border-b border-primary/10 py-4 last:border-b-0 sm:border-b-0 sm:px-2 lg:block lg:px-3 lg:py-0 lg:text-center"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-white ring-8 ring-accent transition group-hover:bg-secondary lg:mx-auto">
                    {itemContentNumber(item, "step") ?? index + 1}
                  </span>
                  <div className="min-w-0 lg:mt-4">
                    <h4 className="text-sm font-bold text-foreground">
                      {item.title}
                    </h4>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {item.body_text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function DateTimelineSection({ section }: SectionVariantProps) {
  const items = displayItems(section).slice(0, 4);
  return (
    <section
      id={section.section_key}
      className="border-b border-border bg-white/[0.82] py-10 backdrop-blur-[1px] lg:py-12"
    >
      <div className="mx-auto grid max-w-[1680px] gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(280px,0.36fr)_minmax(0,0.64fr)] lg:px-8 xl:px-10 2xl:px-12">
        <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4">
          <SectionEyebrow value={section.subtitle ?? "Important dates"} />
          <h2 className="mt-2 max-w-md font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            {section.title ?? "Important academic dates"}
          </h2>
          <SectionBody value={section.description} className="mt-3 max-w-md" />
        </div>
        <div className="divide-y divide-blue-100 border-y border-border motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:delay-150">
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
      className="campus-life-scroll-scene relative isolate border-b border-border bg-white/[0.82] py-12 backdrop-blur-[1px] lg:min-h-[285vh] lg:py-0"
    >
      <div className="absolute inset-y-0 right-0 -z-10 hidden w-1/2 bg-accent/70 lg:block" />
      <div className="campus-life-sticky-frame mx-auto max-w-[1680px] px-4 sm:px-6 lg:sticky lg:top-[var(--public-header-offset,96px)] lg:flex lg:min-h-[calc(100svh-var(--public-header-offset,96px))] lg:max-w-none lg:items-center lg:px-0 xl:px-0 2xl:px-0">
        <CampusLifeHorizontalScroller>
          <div className="lg:flex lg:w-max lg:items-stretch lg:gap-4 lg:pr-[12vw]">
            <div className="campus-life-editorial lg:w-screen lg:shrink-0 lg:snap-start lg:px-8 xl:px-10 2xl:px-12">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,0.58fr)_minmax(360px,0.42fr)] lg:items-stretch">
                <CampusMosaicFeature item={feature} section={section} />
                <div className="flex flex-col justify-center motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-6 motion-safe:delay-150">
                  <div className="max-w-xl">
                    <SectionEyebrow value={section.subtitle ?? "Campus life"} />
                    <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-foreground sm:text-4xl lg:text-5xl">
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
                  <div className="student-life-rhythm mt-8 border-y border-border">
                    {rhythm.map((item, index) => (
                      <div
                        key={item.label}
                        className="grid gap-3 py-4 sm:grid-cols-[96px_minmax(0,1fr)]"
                      >
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                          {item.label}
                        </p>
                        <div>
                          <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold leading-tight text-foreground">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
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
      <ImageCurtainReveal className="absolute inset-0 h-full" direction="right">
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
      </ImageCurtainReveal>
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
      className="group relative min-h-[250px] overflow-hidden bg-primary text-white transition duration-500 hover:-translate-y-0.5 lg:min-h-[560px] lg:w-[min(420px,78vw)] lg:snap-start motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4"
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
        className="absolute inset-0 h-full rounded-none"
        imageClassName="object-cover transition duration-700 group-hover:scale-105"
        sizes="(min-width: 1024px) 20vw, 90vw"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,23,57,.02),rgba(3,23,57,.28)_42%,rgba(3,23,57,.88))]" />
      <div className="relative flex min-h-[250px] flex-col justify-end p-4 sm:p-5 lg:min-h-[560px]">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-secondary">
          {lane.audience}
        </p>
        <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-white">
          {lane.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/76">
          {lane.body}
        </p>
        <span className="mt-5 inline-flex text-sm font-semibold text-secondary">
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
  const [featuredActivity, ...supportingActivities] = activities;
  return (
    <section
      id={section.section_key}
      className="overflow-hidden border-b border-primary/10 bg-surface/[0.86] backdrop-blur-[1px]"
    >
      <div className="mx-auto grid max-w-[1680px] lg:h-[720px] lg:grid-cols-[minmax(300px,0.34fr)_minmax(0,0.66fr)] xl:h-[740px] 2xl:h-[760px]">
        <div className="relative border-b border-primary/10 lg:grid lg:h-full lg:min-h-0 lg:grid-rows-[52%_48%] lg:border-b-0 lg:border-r">
          <div className="relative min-h-[300px] overflow-hidden bg-primary lg:min-h-0">
            <div className="absolute -left-24 top-10 h-72 w-72 rounded-full border border-secondary/20" />
            <div className="absolute left-10 top-20 h-56 w-56 border border-secondary/15 [clip-path:polygon(50%_0,100%_28%,100%_100%,0_100%,0_28%)]" />
            <ImageCurtainReveal
              className="absolute inset-x-0 bottom-0 h-[94%] bg-transparent"
              direction="right"
            >
              <PublicImage
                src={leaderImage}
                alt={`${leaderName}, ${leaderTitle}`}
                ratio="fill"
                className="absolute inset-0 h-full rounded-none bg-transparent"
                imageClassName="object-contain object-bottom"
                sizes="(min-width: 1024px) 34vw, 100vw"
              />
            </ImageCurtainReveal>
          </div>
          <div className="flex h-full min-h-0 flex-col px-5 py-6 sm:px-8 lg:overflow-hidden lg:px-8 lg:py-6 xl:px-10">
            <SectionEyebrow value={section.title ?? "Leadership in action"} />
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-primary">
              {leaderTitle}
            </p>
            <h2 className="mt-2 max-w-md font-[family-name:var(--font-display)] text-3xl font-semibold leading-[1.05] text-foreground sm:text-4xl lg:text-[2rem] xl:text-4xl">
              {leaderName}
            </h2>
            <div className="mt-3 h-px w-12 bg-secondary" />
            <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground lg:line-clamp-3">
              {leaderMessage}
            </p>
            <Link
              href={leaderHref}
              className="mt-5 inline-flex min-h-10 w-fit items-center gap-3 border-b border-secondary pb-1 text-sm font-bold text-primary transition hover:gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:mt-auto"
            >
              Meet the Vice Chancellor
              <ArrowRight className="h-4 w-4 text-secondary" aria-hidden />
            </Link>
          </div>
        </div>
        <div className="flex min-h-0 flex-col px-4 py-8 sm:px-8 lg:h-full lg:overflow-hidden lg:px-10 lg:py-7 xl:px-12 xl:py-8 2xl:px-14">
          <div className="shrink-0">
            <h3 className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-none text-primary sm:text-5xl lg:text-[2.75rem] xl:text-5xl">
              Recent activities
            </h3>
            <div className="mt-3 h-0.5 w-14 bg-secondary" />
          </div>
          {featuredActivity ? (
            <FeaturedActivity item={featuredActivity} />
          ) : (
            <p className="mt-7 border-y border-primary/10 py-6 text-sm text-muted-foreground">
              Published leadership activities will appear here.
            </p>
          )}
          {supportingActivities.length ? (
            <div className="min-h-0 divide-y divide-primary/15 border-b border-primary/15 lg:flex lg:flex-1 lg:flex-col">
              {supportingActivities.map((item, index) => (
                <ActivityLineItem key={item.id} item={item} index={index + 1} />
              ))}
            </div>
          ) : null}
          {activities.length ? (
            <Link
              href="/media/news"
              className="mt-4 inline-flex min-h-10 w-fit shrink-0 items-center gap-3 border-b border-secondary pb-1 text-sm font-bold text-primary transition hover:gap-4 lg:mt-auto"
            >
              View all activities
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
    <article className="group border border-white/25 bg-brand-overlay/20 p-4 text-white transition duration-300 hover:-translate-y-0.5 hover:border-secondary/45 hover:bg-brand-overlay/32">
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

export function NewsGridSection({
  section,
  eventsSection,
  socialLinks,
}: SectionVariantProps) {
  const items = displayItems(section).slice(0, 4);
  const eventItems = eventsSection
    ? displayItems(eventsSection).slice(0, 3)
    : [];
  const [featured, ...rest] = items;
  return (
    <section
      id={section.section_key}
      className="border-b border-primary/10 bg-[linear-gradient(180deg,hsl(var(--surface-subtle)/.86)_0%,rgba(255,255,255,.80)_54%,hsl(var(--surface-muted)/.82)_100%)] py-12 backdrop-blur-[1px] lg:py-14"
    >
      <div className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mb-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <SectionEyebrow
              value={section.subtitle ?? "Kisii University Updates"}
            />
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold leading-[0.95] text-primary sm:text-5xl lg:text-6xl">
              {section.title ?? "Stories, News & Events"}
            </h2>
            <SectionBody
              value={
                section.description ??
                "Discover what is happening across campus—partnerships that create impact, achievements that inspire, and events that bring us together."
              }
              className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground"
            />
          </div>
          <nav
            className="flex flex-wrap items-center gap-4 text-sm font-bold text-primary sm:gap-7"
            aria-label="University updates"
          >
            {[
              ["News", "/media/news"],
              ["Events", "/media/events"],
              ["Articles", "/media/articles"],
            ].map(([label, href], index) => (
              <LinkWrapper
                key={href}
                href={href}
                className={`group inline-flex min-h-11 items-center gap-3 ${
                  index > 0 ? "sm:border-l sm:border-primary/20 sm:pl-7" : ""
                }`}
              >
                {label}
                <ArrowRight className="h-4 w-4 text-secondary transition group-hover:translate-x-1" />
              </LinkWrapper>
            ))}
          </nav>
        </div>

        <div className="grid items-stretch gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(280px,0.72fr)_minmax(300px,0.78fr)]">
          {featured ? <FeaturedUpdateItem item={featured} /> : null}

          <div className="min-w-0 bg-white/50 xl:px-2">
            <SectionKicker title="Latest stories" />
            <div className="mt-5 divide-y divide-primary/10">
              {rest.map((item, index) => (
                <UpdateListItem key={item.id} item={item} index={index} />
              ))}
            </div>
          </div>

          <UpcomingComposedEvents items={eventItems} />
        </div>

        <div className="mt-8 grid gap-6 rounded-md border border-primary/10 bg-white/80 px-5 py-5 shadow-sm xl:grid-cols-[minmax(0,1fr)_1px_minmax(420px,0.75fr)] xl:items-center xl:px-8">
          <div className="grid gap-4 md:grid-cols-[auto_minmax(0,280px)_minmax(280px,1fr)] md:items-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20">
              <Mail className="h-7 w-7" aria-hidden />
            </span>
            <div>
              <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-primary">
                Subscribe to updates
              </h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Get the latest news, events, and stories straight to your inbox.
              </p>
            </div>
            <NewsletterSubscribeForm />
          </div>
          <span className="hidden h-24 w-px bg-primary/15 xl:block" />
          <div className="grid gap-4 sm:grid-cols-2">
            <LinkWrapper
              href="/contact"
              className="group flex items-center gap-4 rounded-md p-2 transition hover:bg-primary/5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20">
                <Mail className="h-5 w-5" aria-hidden />
              </span>
              <span>
                <span className="block font-[family-name:var(--font-display)] text-xl font-bold text-primary">
                  Contact us
                </span>
                <span className="mt-1 block text-sm leading-5 text-muted-foreground">
                  Reach the university for official support and enquiries.
                </span>
                <span className="mt-1 inline-flex items-center gap-2 text-sm font-bold text-secondary">
                  Get in touch
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </span>
            </LinkWrapper>
            <LinkWrapper
              href="/contact"
              className="group flex items-center gap-4 rounded-md p-2 transition hover:bg-primary/5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-white shadow-lg shadow-secondary/25">
                <Newspaper className="h-5 w-5" aria-hidden />
              </span>
              <span>
                <span className="block font-[family-name:var(--font-display)] text-xl font-bold text-primary">
                  Submit a story
                </span>
                <span className="mt-1 block text-sm leading-5 text-muted-foreground">
                  Share a story with Corporate Communication.
                </span>
                <span className="mt-1 inline-flex items-center gap-2 text-sm font-bold text-secondary">
                  Submit story
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </span>
            </LinkWrapper>
            <ComposedSocialMediaLinks
              links={socialLinks}
              className="sm:col-span-2"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ComposedSocialMediaLinks({
  links,
  className,
}: {
  links?: HomeSocialLinks;
  className?: string;
}) {
  type SocialLinkItem = {
    label: string;
    href?: string;
    icon: ComponentType<{ className?: string }>;
    colorClassName: string;
  };
  const allItems: SocialLinkItem[] = [
    {
      label: "Facebook",
      href: links?.facebook,
      icon: Facebook,
      colorClassName: "text-[#1877F2]",
    },
    {
      label: "X",
      href: links?.twitter,
      icon: XSocialIcon,
      colorClassName: "text-black",
    },
    {
      label: "Instagram",
      href: links?.instagram,
      icon: Instagram,
      colorClassName: "text-[#E4405F]",
    },
    {
      label: "YouTube",
      href: links?.youtube,
      icon: Youtube,
      colorClassName: "text-[#FF0000]",
    },
    {
      label: "LinkedIn",
      href: links?.linkedin,
      icon: Linkedin,
      colorClassName: "text-[#0A66C2]",
    },
  ];
  const items = allItems.filter(
    (item): item is SocialLinkItem & { href: string } => Boolean(item.href),
  );

  if (!items.length) return null;

  return (
    <div className={className}>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
        Follow Kisii University
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map(({ label, href, icon: Icon, colorClassName }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Follow Kisii University on ${label}`}
            className={[
              "inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/15 bg-white transition hover:border-current hover:bg-surface-subtle",
              colorClassName,
            ].join(" ")}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </a>
        ))}
      </div>
    </div>
  );
}

function XSocialIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.53 3H21l-7.58 8.66L22.34 21h-6.99l-5.47-6.74L3.62 21H.15l8.1-9.25L-.3 3h7.16l4.95 6.18L17.53 3Zm-1.22 16.35h1.92L5.81 4.56H3.75l12.56 14.79Z" />
    </svg>
  );
}

function FeaturedUpdateItem({ item }: { item: HomepageSectionItem }) {
  const content = (
    <article className="group relative min-h-[360px] overflow-hidden rounded-md bg-primary text-white sm:min-h-[420px] xl:h-full">
      <ImageCurtainReveal className="absolute inset-0 h-full" direction="left">
        <PublicImage
          src={updateImageUrl(item)}
          alt={item.media_alt_text ?? item.title ?? "University story"}
          ratio="fill"
          fallbackContent={<Newspaper className="h-10 w-10" aria-hidden />}
          sizes="(min-width: 1280px) 42vw, 100vw"
          className="absolute inset-0 h-full w-full"
          imageClassName="object-cover transition duration-700 group-hover:scale-105"
        />
      </ImageCurtainReveal>
      <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05)_10%,rgba(0,53,37,0.88)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
          <span className="rounded-full bg-secondary px-3 py-1 text-white">
            {itemCategoryLabel(item)}
          </span>
          {itemDateLabel(item) ? (
            <span className="text-white/85">{itemDateLabel(item)}</span>
          ) : null}
        </div>
        <h3 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold leading-tight sm:text-3xl">
          {item.title}
        </h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85">
          {item.body_text ?? item.cta_description}
        </p>
        <span className="mt-5 inline-flex items-center gap-3 text-sm font-bold text-secondary">
          Read story
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );

  return item.cta_url ? (
    <LinkWrapper href={item.cta_url}>{content}</LinkWrapper>
  ) : (
    content
  );
}

function UpdateListItem({
  item,
  index,
}: {
  item: HomepageSectionItem;
  index: number;
}) {
  const content = (
    <article className="group grid min-w-0 grid-cols-[84px_minmax(0,1fr)] gap-3 py-4 sm:grid-cols-[116px_minmax(0,1fr)_auto] sm:gap-4">
      <PublicImage
        src={updateImageUrl(item)}
        alt={item.media_alt_text ?? item.title ?? `Story ${index + 1}`}
        ratio="news"
        fallbackContent={<Newspaper className="h-5 w-5" aria-hidden />}
        sizes="116px"
        className="h-20 rounded-sm sm:h-24"
        imageClassName="object-cover"
      />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
          <span>{itemCategoryLabel(item)}</span>
          {itemDateLabel(item) ? (
            <span className="font-medium normal-case tracking-normal text-muted-foreground">
              {itemDateLabel(item)}
            </span>
          ) : null}
        </div>
        <h3 className="mt-2 line-clamp-2 font-[family-name:var(--font-display)] text-lg font-bold leading-5 text-foreground transition group-hover:text-primary">
          {item.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">
          {item.body_text ?? item.cta_description}
        </p>
      </div>
      <ArrowRight className="mt-10 hidden h-5 w-5 text-secondary transition group-hover:translate-x-1 sm:block" />
    </article>
  );

  return item.cta_url ? (
    <LinkWrapper href={item.cta_url}>{content}</LinkWrapper>
  ) : (
    content
  );
}

function UpcomingComposedEvents({ items }: { items: HomepageSectionItem[] }) {
  return (
    <aside className="h-full rounded-md bg-primary px-5 py-6 text-white shadow-xl shadow-primary/15 sm:px-7">
      <SectionKicker title="Upcoming events" light />
      {items.length ? (
        <div className="relative mt-6 space-y-0 pl-5 before:absolute before:left-[11px] before:top-4 before:h-[calc(100%-2rem)] before:w-px before:bg-secondary">
          {items.map((item, index) => (
            <ComposedEventAgendaItem key={item.id} item={item} index={index} />
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-md border border-white/15 bg-white/10 p-4 text-sm leading-6 text-white/80">
          Upcoming events are being refreshed. Open the events calendar for
          current listings.
        </p>
      )}
      <LinkWrapper
        href="/media/events"
        className="mt-6 inline-flex min-h-11 items-center gap-3 border-t border-white/15 pt-5 text-sm font-bold text-white hover:text-secondary"
      >
        View all events
        <ArrowRight className="h-4 w-4" aria-hidden />
      </LinkWrapper>
    </aside>
  );
}

function ComposedEventAgendaItem({
  item,
  index,
}: {
  item: HomepageSectionItem;
  index: number;
}) {
  const dateParts = composedEventDateParts(item, index);
  const content = (
    <article className="group relative grid grid-cols-[60px_minmax(0,1fr)] gap-4 border-b border-white/15 py-5 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:gap-5">
      <span className="absolute -left-[19px] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-secondary bg-primary" />
      <div className="rounded-md bg-white px-2 py-3 text-center text-primary shadow-sm">
        <span className="block text-xs font-bold uppercase tracking-[0.18em]">
          {dateParts.month}
        </span>
        <span className="block font-[family-name:var(--font-display)] text-3xl font-bold leading-none">
          {dateParts.day}
        </span>
        <span className="block text-xs font-bold uppercase">
          {dateParts.weekday}
        </span>
      </div>
      <div className="min-w-0">
        <h3 className="font-[family-name:var(--font-display)] text-xl font-bold leading-tight text-secondary">
          {item.title}
        </h3>
        <p className="mt-3 flex items-center gap-2 text-sm text-white/85">
          <CalendarDays className="h-4 w-4" aria-hidden />
          {dateParts.time}
        </p>
        {dateParts.location ? (
          <p className="mt-2 flex items-center gap-2 text-sm text-white/85">
            <MapPin className="h-4 w-4" aria-hidden />
            {dateParts.location}
          </p>
        ) : null}
      </div>
      <ArrowRight className="mt-10 hidden h-5 w-5 text-secondary transition group-hover:translate-x-1 sm:block" />
    </article>
  );

  return item.cta_url ? (
    <LinkWrapper href={item.cta_url}>{content}</LinkWrapper>
  ) : (
    content
  );
}

export function EventsListSection({ section }: SectionVariantProps) {
  const items = displayItems(section).slice(0, 4);
  return (
    <section
      id={section.section_key}
      className="border-b border-border bg-accent/35 py-12 lg:py-14"
    >
      <div className="mx-auto grid max-w-[1680px] gap-7 px-4 sm:px-6 lg:grid-cols-[minmax(280px,0.3fr)_minmax(0,0.7fr)] lg:px-8 xl:px-10 2xl:px-12">
        <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4">
          <SectionEyebrow value={section.subtitle ?? "Upcoming events"} />
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
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
      className="relative isolate overflow-hidden border-b border-border bg-white/[0.84] py-12 backdrop-blur-[1px] lg:py-14"
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

        <div className="group relative mt-9 overflow-hidden border-y border-border py-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:delay-150">
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
        partner?.logo_url ??
        itemContentText(item, "logoUrl") ??
        itemImageUrl(item) ??
        undefined;
      const name =
        itemContentText(item, "label") ??
        partnerName ??
        item.title ??
        "Partner";

      return {
        id: item.id,
        name,
        href:
          item.cta_url ??
          partner?.website ??
          itemContentText(item, "url") ??
          undefined,
        logoUrl,
        logoAlt:
          item.media_alt_text ?? partner?.name ?? item.title ?? "Partner logo",
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
      className="group/logo flex h-20 w-48 shrink-0 items-center justify-center border-r border-border px-7 sm:w-56 lg:w-64"
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
        className="pointer-events-none absolute left-1/2 top-2 z-20 max-w-56 -translate-x-1/2 -translate-y-1 rounded-full bg-primary px-3 py-1 text-center text-xs font-semibold leading-tight text-white opacity-0 shadow-lg shadow-primary/15 transition duration-200 group-hover/partnerlink:translate-y-0 group-hover/partnerlink:opacity-100 group-focus-visible/partnerlink:translate-y-0 group-focus-visible/partnerlink:opacity-100"
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
      className="border-b border-border bg-accent/35 py-12 lg:py-14"
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
          <div className="flex flex-col justify-center border border-border p-6 sm:p-8 lg:border-l-0 lg:p-10">
            <SectionEyebrow value={section.subtitle ?? "Alumni impact"} />
            <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
              {item?.title ?? section.title ?? "Alumni story"}
            </h2>
            <p className="mt-5 max-w-4xl border-l-4 border-secondary pl-5 font-[family-name:var(--font-display)] text-xl leading-8 text-muted-foreground">
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
        className="mt-8 rounded-md border border-border"
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
          ? "border-b border-border bg-accent/45 py-14 lg:py-16"
          : "border-b border-border bg-white py-14 lg:py-16"
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
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground sm:text-4xl">
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
      className={`group h-full overflow-hidden rounded-md border shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${dark ? "border-white/15 bg-white/10" : "border-border bg-white"}`}
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
            className={`flex h-7 w-7 items-center justify-center rounded-full ${dark ? "bg-white/15 text-secondary" : "bg-accent text-primary"}`}
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
          className={`mt-3 font-[family-name:var(--font-display)] font-semibold ${compact ? "text-base" : "text-xl"} ${dark ? "text-white" : "text-foreground"}`}
        >
          {item.title ?? "Learn more"}
        </h3>
        {!compact && (item.body_text || item.subtitle) ? (
          <p
            className={`mt-2 text-sm leading-6 ${dark ? "text-white/70" : "text-muted-foreground"}`}
          >
            {item.body_text ?? item.subtitle}
          </p>
        ) : null}
        {date && category ? (
          <p
            className={`mt-3 text-xs ${dark ? "text-white/60" : "text-muted-foreground"}`}
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
    <article className="group grid gap-4 py-5 transition hover:bg-accent/60 sm:grid-cols-[80px_minmax(0,1fr)_auto] sm:items-center sm:px-4">
      <span className="font-[family-name:var(--font-display)] text-3xl font-semibold text-primary/25 transition group-hover:text-primary">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary">
          {date ?? "Academic date"}
        </p>
        <h3 className="mt-1 font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">
          {item.title}
        </h3>
        {item.body_text ? (
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
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

function AdmissionDateLine({
  item,
  index,
}: {
  item: HomepageSectionItem;
  index: number;
}) {
  const body = (
    <article className="group grid grid-cols-[auto_minmax(0,1fr)] gap-3 py-3 transition">
      <span className="pt-0.5 font-[family-name:var(--font-display)] text-sm font-semibold text-secondary">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/60">
          {itemContentText(item, "date") ?? item.subtitle ?? "Important date"}
        </p>
        <h4 className="mt-1 text-sm font-semibold leading-5 text-white transition group-hover:text-secondary">
          {item.title}
        </h4>
      </div>
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
    date: formatPublicDate(
      linked.type === "event" ? linked.start_date : linked.published_at,
    ),
  };
}

function FeaturedActivity({ item }: { item: HomepageSectionItem }) {
  const details = activityDetails(item);
  if (!details) return null;
  const { href, title, summary, altText, imageUrl, typeLabel, date } = details;
  return (
    <Link
      href={href}
      className="group mt-5 block shrink-0 border-b border-primary/15 pb-4"
    >
      <div className="relative h-[190px] overflow-hidden bg-primary/8 sm:h-[230px] lg:h-[180px] xl:h-[185px] 2xl:h-[200px]">
        {imageUrl ? (
          <PublicImage
            src={imageUrl}
            alt={altText}
            ratio="fill"
            className="absolute inset-0 rounded-none"
            imageClassName="object-cover object-top transition duration-700 group-hover:scale-[1.025]"
            sizes="(min-width: 1024px) 66vw, 100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-primary">
            <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(135deg,transparent_40%,rgba(255,255,255,.15)_40%,rgba(255,255,255,.15)_42%,transparent_42%)] [background-size:28px_28px]" />
          </div>
        )}
      </div>
      <div className="grid gap-3 pt-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
            {typeLabel}
            {date ? (
              <span className="ml-4 font-medium text-muted-foreground">
                {date}
              </span>
            ) : null}
          </p>
          <h4 className="mt-1.5 line-clamp-2 max-w-4xl font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-foreground transition group-hover:text-primary lg:text-[1.45rem] xl:text-2xl">
            {title}
          </h4>
          {summary ? (
            <p className="mt-1.5 line-clamp-2 max-w-3xl text-sm leading-5 text-muted-foreground lg:line-clamp-1 xl:line-clamp-2">
              {summary}
            </p>
          ) : null}
        </div>
        <ArrowRight
          className="h-7 w-7 text-primary transition group-hover:translate-x-1"
          aria-hidden
        />
      </div>
    </Link>
  );
}

function ActivityLineItem({
  item,
  index,
}: {
  item: HomepageSectionItem;
  index: number;
}) {
  const details = activityDetails(item);
  if (!details) return null;
  const { href, title, altText, imageUrl, typeLabel, date } = details;
  const body = (
    <article className="group grid gap-3 py-2 transition sm:grid-cols-[104px_minmax(0,1fr)_auto] sm:items-center lg:h-full lg:min-h-0 lg:overflow-hidden xl:grid-cols-[116px_minmax(0,1fr)_auto]">
      {imageUrl ? (
        <PublicImage
          src={imageUrl}
          alt={altText}
          ratio="fill"
          className="hidden h-16 rounded-none sm:block"
          imageClassName="object-cover transition duration-500 group-hover:scale-[1.03]"
          sizes="116px"
        />
      ) : (
        <div className="hidden h-16 items-center justify-center bg-primary text-xs font-bold tracking-[0.18em] text-white sm:flex">
          {String(index + 1).padStart(2, "0")}
        </div>
      )}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
          {[typeLabel, date].filter(Boolean).join(" · ")}
        </p>
        <h4 className="mt-1 line-clamp-2 font-[family-name:var(--font-display)] text-lg font-semibold leading-tight text-foreground transition group-hover:text-primary lg:text-base xl:text-[1.05rem]">
          {title}
        </h4>
      </div>
      <ArrowRight className="hidden h-5 w-5 justify-self-end text-primary transition group-hover:translate-x-1 sm:block" />
    </article>
  );
  return (
    <LinkWrapper href={href} className="lg:block lg:min-h-0 lg:flex-1">
      {body}
    </LinkWrapper>
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
    <article className="group flex min-h-36 gap-4 border border-border bg-white p-4 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm">
      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center bg-primary text-center text-white">
        <span className="text-xs font-bold uppercase tracking-[0.12em]">
          {date?.split(" ")[0] ?? String(index + 1).padStart(2, "0")}
        </span>
        <CalendarDays className="mt-1 h-4 w-4 text-secondary" aria-hidden />
      </div>
      <div className="min-w-0">
        <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold leading-tight text-foreground">
          {item.title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
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

function SectionKicker({
  title,
  light = false,
}: {
  title: string;
  light?: boolean;
}) {
  return (
    <div>
      <h3
        className={`text-xs font-bold uppercase tracking-[0.24em] ${
          light ? "text-white" : "text-primary"
        }`}
      >
        {title}
      </h3>
      <span className="mt-2 block h-px w-12 bg-secondary" />
    </div>
  );
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
        light ? "text-white/82" : "text-muted-foreground",
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

function linkedContent(item: HomepageSectionItem | undefined) {
  return item?.content_enriched?.linked_content;
}

function linkedMediaUrl(item: HomepageSectionItem | undefined) {
  const media = linkedContent(item)?.featured_media;
  return (
    media?.cdn_url ??
    media?.public_url ??
    media?.url ??
    media?.thumbnail_url ??
    null
  );
}

function updateImageUrl(item: HomepageSectionItem | undefined) {
  return itemImageUrl(item) ?? linkedMediaUrl(item) ?? undefined;
}

function itemCategoryLabel(item: HomepageSectionItem) {
  const linked = linkedContent(item);
  return (
    itemContentText(item, "category") ??
    (linked?.type === "blog"
      ? "Article"
      : linked?.type === "event"
        ? "Event"
        : undefined) ??
    item.item_type ??
    "Update"
  );
}

function itemDateLabel(item: HomepageSectionItem) {
  const linked = linkedContent(item);
  return (
    itemContentText(item, "date") ??
    item.subtitle ??
    formatPublicDate(
      linked?.type === "event" ? linked?.start_date : linked?.published_at,
    ) ??
    undefined
  );
}

function composedEventDateParts(item: HomepageSectionItem, index: number) {
  const linked = linkedContent(item);
  const rawDate =
    itemContentText(item, "date") ??
    linked?.start_date ??
    item.subtitle ??
    null;
  const date = new Date(rawDate ?? "");
  const linkedEventLocation = linked as
    | { venue?: string | null; location?: string | null }
    | undefined;
  const location =
    itemContentText(item, "venue") ??
    itemContentText(item, "location") ??
    linkedEventLocation?.venue ??
    linkedEventLocation?.location ??
    item.cta_description;

  if (Number.isNaN(date.getTime())) {
    return {
      month: "Event",
      day: String(index + 1).padStart(2, "0"),
      weekday: "",
      time: rawDate
        ? (formatPublicDate(rawDate) ?? rawDate)
        : "Time to be confirmed",
      location,
    };
  }

  return {
    month: date.toLocaleDateString("en-KE", { month: "short" }),
    day: date.toLocaleDateString("en-KE", { day: "2-digit" }),
    weekday: date.toLocaleDateString("en-KE", { weekday: "short" }),
    time: date.toLocaleTimeString("en-KE", {
      hour: "numeric",
      minute: "2-digit",
    }),
    location,
  };
}

function settingText(section: HomepageSection, key: string) {
  const value = section.settings?.[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}
