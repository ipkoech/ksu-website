import { Fragment } from "react";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import type {
  StaffAssignment,
  VcPublicHub,
  VcPublicMedia,
} from "@ksu/api-client";
import { personDisplayName } from "@/lib/person-name";
import { PublicImage } from "@/components/public/public-image";
import {
  VcActivitiesSection,
  VcEventsSection,
  VcGallerySection,
} from "./vc-public-sections";
import { VcAboutSection } from "./vc-about-section";
import { VcPodium } from "./vc-podium";
import { VcHero } from "./vc-hero";
import { VcVideoPlayer } from "./vc-video-player";

type VcSection =
  | "story"
  | "activities"
  | "speeches"
  | "videos"
  | "events"
  | "gallery";

/**
 * Placeholder welcome, shown only until the Office of the Vice-Chancellor
 * supplies its own.
 *
 * The blockquote signs this with the Vice-Chancellor's name, so the text has
 * to read as something a Vice-Chancellor could sign. It is deliberately
 * confined to what the University's own record already states — the mandate,
 * the inclusivity and borderlessness framing, and the research and teaching
 * mission — and makes no claim about rankings, numbers, dates or partnerships.
 *
 * It is a fallback, never an override: `leadership_message` on the person
 * record wins the moment his office fills it in, and nothing here needs to be
 * deleted for that to happen.
 *
 * DRAFT — pending approval by the Office of the Vice-Chancellor.
 */
const DRAFT_WELCOME = [
  "Welcome to Kisii University. Whether you are considering joining us, already studying here, or working with us from elsewhere, I am glad you have come to look more closely at what we do.",
  "Ours is a university built on inclusivity and borderlessness: the conviction that talent is everywhere, that a good idea does not need a passport, and that a university earns its place by opening doors rather than guarding them. That belief shapes how we teach, who we admit, and the partnerships we choose.",
  "What you will find here is a community that takes research seriously, teaches with care, and measures itself by what our graduates go on to do. I invite you to explore these pages, and to get in touch.",
];

const DEFAULT_SECTION_ORDER: VcSection[] = [
  "story",
  "activities",
  "speeches",
  "videos",
  "events",
  "gallery",
];

// "speeches" and "videos" are separate studio sections but render as one band on
// the page, so the pair collapses to a single nav entry and a single anchor.
const NAV_LABELS: Record<VcSection, { label: string; href: string }> = {
  story: { label: "Welcome", href: "#vc-story" },
  activities: { label: "In Action", href: "#vc-activities" },
  speeches: { label: "Speeches", href: "#vc-speeches" },
  videos: { label: "Speeches", href: "#vc-speeches" },
  events: { label: "Events", href: "#vc-events" },
  gallery: { label: "Gallery", href: "#vc-gallery" },
};

export function VcPublicPage({
  hub,
  assignment,
  galleryMedia = [],
}: {
  hub: VcPublicHub;
  assignment: StaffAssignment | null;
  galleryMedia?: VcPublicMedia[];
}) {
  const person = assignment?.person;
  const name = personDisplayName(person, "The Vice Chancellor");
  const role = assignment?.title || "Vice Chancellor";
  const portrait = hub.hero_media?.url || person?.photo_url;
  const activities = hub.sections.activities || [];
  const speeches = hub.sections.speeches || [];
  const videos = hub.sections.videos || [];
  const events = hub.sections.events || [];
  const galleries = hub.sections.gallery || [];
  const isVisible = (section: VcSection) =>
    hub.section_visibility[section] !== false;

  // The blockquote carries his name, so his own words come first.
  // `hub.welcome_message` is studio copy describing the page ("Explore recent
  // addresses…") rather than a statement he made, so it cannot be signed and
  // is not used here.
  const welcomeSource = person?.leadership_message?.trim();
  const welcomeParagraphs = welcomeSource
    ? welcomeSource.split(/\n{2,}/).filter(Boolean)
    : DRAFT_WELCOME;

  // The studio owns the running order. Anything it does not list falls back to
  // the default sequence so a partial payload can never blank the page.
  const sectionOrder = (
    hub.section_order?.length ? hub.section_order : DEFAULT_SECTION_ORDER
  ).filter((section): section is VcSection =>
    DEFAULT_SECTION_ORDER.includes(section as VcSection),
  );
  const podiumAnchor = sectionOrder.find(
    (section) => section === "speeches" || section === "videos",
  );

  const hasContent = (section: VcSection) => {
    if (section === "story") return true;
    if (section === "activities") return activities.length > 0;
    if (section === "speeches" || section === "videos")
      return (
        (isVisible("speeches") && speeches.length > 0) ||
        (isVisible("videos") && videos.length > 0)
      );
    if (section === "gallery")
      return galleries.length > 0 || galleryMedia.length > 0;
    return events.length > 0;
  };

  const visibleNavigation = sectionOrder
    .filter((section) => {
      if (section === "videos" && podiumAnchor !== "videos") return false;
      if (section === "speeches" && podiumAnchor !== "speeches") return false;
      return isVisible(section) && hasContent(section);
    })
    .map((section) => ({ section, ...NAV_LABELS[section] }));

  return (
    <>
      <VcHero
        professionalProfileUrl={hub.professional_profile_url}
        hasWelcomeVideo={Boolean(hub.welcome_video)}
        title={hub.title}
        introduction={hub.introduction}
        heroImageUrl={hub.hero_media?.url}
        heroImageAlt={hub.hero_media?.alt_text || `${name}, ${role}`}
      />

      <nav
        aria-label="Vice Chancellor page sections"
        className="sticky top-0 z-30 border-b border-border bg-white/95 shadow-sm backdrop-blur-sm"
      >
        <div className="container overflow-x-auto">
          <ul className="flex min-w-max items-center justify-center gap-8 sm:gap-14">
            {visibleNavigation.map((item, index) => (
              <li key={item.section}>
                <a
                  href={item.href}
                  className={`relative inline-flex min-h-14 items-center px-1 text-sm font-medium transition-colors hover:text-primary ${
                    index === 0
                      ? "text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-secondary"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {sectionOrder.map((section) => (
        <Fragment key={section}>
          {renderSection(section)}
          {/* "Who is he?" follows the welcome message: the reader has just
              heard from him, so the record about him lands next. It is not a
              studio-ordered section because it is not studio content — it is
              the person record. */}
          {section === "story" && isVisible("story") ? (
            <VcAboutSection assignment={assignment} portraitUrl={portrait} />
          ) : null}
        </Fragment>
      ))}

      <section className="bg-primary py-8 text-white">
        <div className="container flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <p className="max-w-xl font-[family-name:var(--font-display)] text-xl leading-snug sm:text-2xl">
            For formal credentials, career details and academic leadership
            record, visit the official professional profile.
          </p>
          <Link
            href={hub.professional_profile_url}
            className="inline-flex min-h-12 shrink-0 items-center gap-3 border border-secondary px-6 font-semibold text-secondary transition-colors duration-200 hover:bg-secondary hover:text-secondary-foreground active:scale-[0.98]"
          >
            View professional profile <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );

  function renderSection(section: VcSection) {
    if (!isVisible(section) || !hasContent(section)) return null;

    if (section === "activities")
      return <VcActivitiesSection items={activities} />;
    if (section === "events") return <VcEventsSection items={events} />;
    if (section === "gallery")
      return <VcGallerySection albums={galleries} media={galleryMedia} />;
    if (section === "speeches" || section === "videos") {
      // rendered once, at whichever of the pair the studio ordered first
      if (section !== podiumAnchor) return null;
      return (
        <VcPodium
          speeches={isVisible("speeches") ? speeches : []}
          videos={isVisible("videos") ? videos : []}
        />
      );
    }

    return (
      <section
        id="vc-story"
        aria-labelledby="vc-story-heading"
        className="scroll-mt-24 bg-white py-14 sm:py-20"
      >
        <div className="container">
          {/* The section says what it is before it says anything else. The
              studio's `welcome_title` is a slogan ("Leadership that listens,
              connects and acts") and reads as a banner rather than a label, so
              it runs underneath the plain heading as the standfirst it is. */}
          <div className="max-w-3xl">
            <h2
              id="vc-story-heading"
              className="font-[family-name:var(--font-display)] text-4xl font-normal tracking-tight text-primary sm:text-5xl"
            >
              A word from the <em className="italic">Vice-Chancellor</em>
            </h2>
            {hub.welcome_title?.trim() ? (
              <p className="mt-5 max-w-[52ch] font-[family-name:var(--font-display)] text-2xl font-normal leading-snug text-muted-foreground">
                {hub.welcome_title.trim()}
              </p>
            ) : null}
          </div>
        </div>
        <div className="container mt-10 grid gap-9 lg:mt-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)] lg:items-start">
          <div>
            {hub.welcome_video ? (
              <VcVideoPlayer
                title={hub.welcome_video.title}
                embedUrl={hub.welcome_video.embed_url}
                posterUrl={
                  hub.welcome_video.cover?.url ||
                  hub.welcome_video.thumbnail_url
                }
              />
            ) : (
              <PublicImage
                src={portrait}
                alt={`${name} in conversation`}
                ratio="news"
                imageClassName="object-top"
                sizes="(min-width: 1024px) 58vw, 100vw"
              />
            )}
          </div>
          <div className="px-1 sm:px-5 lg:pl-8">
            <blockquote className="relative border-l-2 border-secondary pl-7">
              <Quote
                className="absolute -left-3 -top-2 size-6 fill-white text-secondary"
                aria-hidden
              />
              {welcomeParagraphs.map((para, index) => (
                <p
                  key={index}
                  className={`text-base leading-8 text-foreground${index ? " mt-4" : ""}`}
                >
                  {para}
                </p>
              ))}
            </blockquote>
            <div className="mt-8 pl-7">
              <p className="font-[family-name:var(--font-display)] text-2xl italic text-primary">
                {name}
              </p>
              <p className="mt-2 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                {role}
              </p>
              <span className="mt-3 block h-0.5 w-12 bg-secondary" />
            </div>
          </div>
        </div>
      </section>
    );
  }
}
