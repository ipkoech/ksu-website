import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  CalendarDays,
  GraduationCap,
  Landmark,
  Newspaper,
  PlayCircle,
  Search,
  Users,
} from "lucide-react";
import { PublicImage } from "@/components/public/public-image";
import {
  background,
  gallery,
  heroImage,
  logos,
  mediaAlt,
  mediaUrl,
  mobileImage,
  poster,
  video,
  type HomepagePartnershipSpotlight,
  type HomepageSection,
  type HomepageSectionItem,
} from "@/lib/homepage-sections";

type SectionVariantProps = {
  section: HomepageSection;
  partnershipSpotlights?: HomepagePartnershipSpotlight[];
};

export function HeroAdmissionsSection({ section }: SectionVariantProps) {
  const image = heroImage(section) ?? background(section);
  const mobile = mobileImage(section);
  const primary = firstCta(section.items);

  return (
    <section className="relative min-h-[520px] overflow-hidden bg-primary text-white">
      <PublicImage
        src={mediaUrl(image)}
        alt={mediaAlt(image, section.title ?? "Kisii University")}
        ratio="fill"
        priority
        className="absolute inset-0 h-full w-full"
        imageClassName="object-cover"
      />
      {mobile ? (
        <span className="sr-only">
          Mobile image available: {mediaAlt(mobile, section.title ?? "")}
        </span>
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,20,49,0.82),rgba(2,20,49,0.28)_60%,rgba(2,20,49,0.06))]" />
      <div className="relative z-10 mx-auto flex min-h-[520px] max-w-[1680px] items-end px-4 py-14 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="max-w-3xl">
          <SectionEyebrow value={section.subtitle ?? "Admissions"} light />
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            {section.title ?? "Kisii University"}
          </h1>
          <SectionBody value={section.description} light className="mt-5 max-w-2xl text-base sm:text-lg" />
          {primary ? <CtaLink item={primary} className="mt-8" prominent /> : null}
        </div>
      </div>
    </section>
  );
}

export function PulseStripSection({ section }: SectionVariantProps) {
  return (
    <section className="border-y border-blue-100 bg-white py-6">
      <div className="mx-auto grid max-w-[1680px] gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8 xl:px-10 2xl:px-12">
        {displayItems(section).slice(0, 4).map((item) => (
          <FactTile key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export function FeaturedPartnershipSection({
  section,
  partnershipSpotlights = [],
}: SectionVariantProps) {
  const spotlight = partnershipSpotlights[0];
  const image = spotlight ? heroImage(spotlight) ?? background(spotlight) : heroImage(section);
  const title = spotlight?.headline ?? section.title;
  const summary = spotlight?.summary ?? section.description;
  const cta = spotlight?.primary_cta?.href
    ? {
        id: spotlight.id,
        title: spotlight.primary_cta.label ?? "Explore partnership",
        cta_label: spotlight.primary_cta.label ?? "Explore partnership",
        cta_url: spotlight.primary_cta.href,
      }
    : firstCta(section.items);

  return (
    <SectionFrame section={section} tinted>
      <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <SectionEyebrow value={section.subtitle ?? "Featured partnership"} />
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-slate-950 sm:text-4xl">
            {title ?? "Partnership spotlight"}
          </h2>
          <SectionBody value={summary} className="mt-4 max-w-3xl" />
          {cta ? <CtaLink item={cta} className="mt-6" /> : null}
        </div>
        <PublicImage
          src={mediaUrl(image)}
          alt={mediaAlt(image, title ?? "Partnership image")}
          ratio="news"
          className="rounded-md border border-blue-100 shadow-sm"
        />
      </div>
    </SectionFrame>
  );
}

export function ProgrammeFinderSection({ section }: SectionVariantProps) {
  return (
    <SectionFrame section={section}>
      <SectionHeading section={section} fallback="Find a programme" icon={Search} />
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {displayItems(section).slice(0, 6).map((item) => (
          <ArticleCard key={item.id} item={item} icon={GraduationCap} />
        ))}
      </div>
    </SectionFrame>
  );
}

export function DateTimelineSection({ section }: SectionVariantProps) {
  return (
    <SectionFrame section={section} tinted>
      <SectionHeading section={section} fallback="Important dates" icon={CalendarDays} />
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {displayItems(section).slice(0, 6).map((item) => (
          <TimelineItem key={item.id} item={item} />
        ))}
      </div>
    </SectionFrame>
  );
}

export function PillarGridSection({ section }: SectionVariantProps) {
  return (
    <SectionFrame section={section}>
      <SectionHeading section={section} fallback="University pillars" icon={Landmark} />
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {displayItems(section).slice(0, 8).map((item) => (
          <ArticleCard key={item.id} item={item} icon={Landmark} />
        ))}
      </div>
    </SectionFrame>
  );
}

export function MediaMosaicSection({ section }: SectionVariantProps) {
  const images = gallery(section);
  return (
    <SectionFrame section={section} tinted>
      <SectionHeading section={section} fallback="Campus moments" icon={PlayCircle} />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {images.slice(0, 5).map((image, index) => (
          <PublicImage
            key={image.id ?? image.media_id ?? index}
            src={mediaUrl(image)}
            alt={mediaAlt(image, section.title ?? "Campus image")}
            ratio={index === 0 ? "hero" : "news"}
            className={index === 0 ? "rounded-md md:col-span-2 md:row-span-2" : "rounded-md"}
          />
        ))}
      </div>
    </SectionFrame>
  );
}

export function LeadershipActivitySection({ section }: SectionVariantProps) {
  return (
    <SectionFrame section={section}>
      <SectionHeading section={section} fallback="Leadership activity" icon={Users} />
      <div className="mt-8 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <PublicImage
          src={mediaUrl(heroImage(section))}
          alt={mediaAlt(heroImage(section), section.title ?? "Leadership activity")}
          ratio="news"
          className="rounded-md border border-blue-100"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {displayItems(section).slice(0, 4).map((item) => (
            <ArticleCard key={item.id} item={item} icon={Users} />
          ))}
        </div>
      </div>
    </SectionFrame>
  );
}

export function ResearchCardsSection({ section }: SectionVariantProps) {
  return (
    <SectionFrame section={section} tinted>
      <SectionHeading section={section} fallback="Research and innovation" icon={Landmark} />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {displayItems(section).slice(0, 6).map((item) => (
          <ArticleCard key={item.id} item={item} icon={Landmark} />
        ))}
      </div>
    </SectionFrame>
  );
}

export function NewsGridSection({ section }: SectionVariantProps) {
  return (
    <SectionFrame section={section}>
      <SectionHeading section={section} fallback="Latest news" icon={Newspaper} />
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {displayItems(section).slice(0, 6).map((item) => (
          <ArticleCard key={item.id} item={item} icon={Newspaper} />
        ))}
      </div>
    </SectionFrame>
  );
}

export function EventsListSection({ section }: SectionVariantProps) {
  return (
    <SectionFrame section={section} tinted>
      <SectionHeading section={section} fallback="Upcoming events" icon={CalendarDays} />
      <div className="mt-8 grid gap-3">
        {displayItems(section).slice(0, 6).map((item) => (
          <TimelineItem key={item.id} item={item} compact />
        ))}
      </div>
    </SectionFrame>
  );
}

export function LogoCarouselSection({ section }: SectionVariantProps) {
  const logoItems = logos(section);
  return (
    <SectionFrame section={section}>
      <SectionHeading section={section} fallback="Partners and collaborators" />
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {logoItems.map((logo, index) => (
          <div
            key={logo.id ?? logo.media_id ?? index}
            className="flex min-h-28 items-center justify-center rounded-md border border-blue-100 bg-white p-4 shadow-sm"
          >
            <PublicImage
              src={mediaUrl(logo)}
              alt={mediaAlt(logo, "Partner logo")}
              ratio="logo"
              className="bg-white"
              imageClassName="object-contain"
            />
          </div>
        ))}
      </div>
    </SectionFrame>
  );
}

export function AlumniStorySection({ section }: SectionVariantProps) {
  const item = displayItems(section)[0];
  const image = heroImage(section) ?? poster(section);
  return (
    <SectionFrame section={section} tinted>
      <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <PublicImage
          src={mediaUrl(image)}
          alt={mediaAlt(image, section.title ?? "Alumni story")}
          ratio="news"
          className="rounded-md border border-blue-100"
        />
        <div>
          <SectionEyebrow value={section.subtitle ?? "Alumni"} />
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-slate-950 sm:text-4xl">
            {item?.title ?? section.title ?? "Alumni story"}
          </h2>
          <SectionBody value={item?.body_text ?? section.description} className="mt-4" />
          {item ? <CtaLink item={item} className="mt-6" /> : null}
        </div>
      </div>
    </SectionFrame>
  );
}

export function FactsStripSection({ section }: SectionVariantProps) {
  return (
    <section className="bg-primary py-10 text-white">
      <div className="mx-auto grid max-w-[1680px] gap-5 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8 xl:px-10 2xl:px-12">
        {displayItems(section).slice(0, 4).map((item) => (
          <div key={item.id} className="border-l border-white/20 pl-5">
            <p className="font-[family-name:var(--font-display)] text-3xl font-semibold">
              {item.title}
            </p>
            <p className="mt-2 text-sm leading-6 text-white/75">
              {item.body_text ?? item.subtitle}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function VideoFeatureSection({ section }: SectionVariantProps) {
  const media = video(section) ?? poster(section);
  return (
    <SectionFrame section={section}>
      <SectionHeading section={section} fallback="Featured video" icon={PlayCircle} />
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

function ArticleCard({
  item,
  icon: Icon,
}: {
  item: HomepageSectionItem;
  icon: typeof Landmark;
}) {
  const content = (
    <article className="h-full rounded-md border border-blue-100 bg-white p-5 shadow-sm shadow-blue-100/60 transition hover:border-primary/30 hover:shadow-md">
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-primary">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">
        {item.title ?? "Learn more"}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {item.body_text ?? item.subtitle ?? item.cta_description}
      </p>
      {item.cta_label ? (
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          {item.cta_label}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </span>
      ) : null}
    </article>
  );
  return item.cta_url ? <LinkWrapper href={item.cta_url}>{content}</LinkWrapper> : content;
}

function TimelineItem({
  item,
  compact = false,
}: {
  item: HomepageSectionItem;
  compact?: boolean;
}) {
  const body = (
    <article className="rounded-md border border-blue-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary">
        {item.subtitle ?? item.cta_description ?? "Update"}
      </p>
      <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">
        {item.title}
      </h3>
      {!compact ? (
        <p className="mt-2 text-sm leading-6 text-slate-600">{item.body_text}</p>
      ) : null}
    </article>
  );
  return item.cta_url ? <LinkWrapper href={item.cta_url}>{body}</LinkWrapper> : body;
}

function FactTile({ item }: { item: HomepageSectionItem }) {
  return (
    <div className="rounded-md border border-blue-100 bg-blue-50/50 p-5">
      <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-primary">
        {item.title}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {item.body_text ?? item.subtitle}
      </p>
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

function firstCta(items: HomepageSectionItem[] | undefined) {
  return displayItems({ items } as HomepageSection).find((item) => item.cta_url);
}
