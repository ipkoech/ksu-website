import Link from "next/link";
import { ArrowRight, Play, Quote } from "lucide-react";
import type {
  StaffAssignment,
  VcPublicHub,
  VcPublicMedia,
} from "@ksu/api-client";
import { PublicImage } from "@/components/public/public-image";
import {
  VcActivitiesSection,
  VcEventsSection,
  VcGallerySection,
  VcPodiumSection,
} from "./vc-public-sections";
import { VcVideoPlayer } from "./vc-video-player";

const navigation = [
  { section: "story", label: "Story", href: "#vc-story" },
  { section: "activities", label: "In Action", href: "#vc-activities" },
  { section: "speeches", label: "Speeches", href: "#vc-speeches" },
  { section: "gallery", label: "Gallery", href: "#vc-gallery" },
  { section: "events", label: "Events", href: "#vc-events" },
] as const;

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
  const name = person?.full_name || "The Vice Chancellor";
  const role = assignment?.title || "Vice Chancellor";
  const portrait = hub.hero_media?.url || person?.photo_url;
  const activities = hub.sections.activities || [];
  const speeches = hub.sections.speeches || [];
  const videos = hub.sections.videos || [];
  const events = hub.sections.events || [];
  const galleries = hub.sections.gallery || [];
  const isVisible = (section: keyof VcPublicHub["section_visibility"]) =>
    hub.section_visibility[section] !== false;
  const visibleNavigation = navigation.filter(({ section }) => {
    if (!isVisible(section)) return false;
    if (section === "story") return true;
    if (section === "activities") return activities.length > 0;
    if (section === "speeches")
      return speeches.length > 0 || (isVisible("videos") && videos.length > 0);
    if (section === "gallery") return galleries.length > 0;
    return events.length > 0;
  });

  return (
    <>
      <section className="relative isolate min-h-[620px] overflow-hidden bg-primary text-white lg:min-h-[700px]">
        <PublicImage
          src={portrait}
          alt={hub.hero_media?.alt_text || name}
          ratio="fill"
          priority
          sizes="100vw"
          className="absolute inset-0"
          imageClassName="object-cover object-[68%_center] sm:object-[72%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--primary)/.98)_0%,hsl(var(--primary)/.93)_28%,hsl(var(--primary)/.54)_50%,hsl(var(--primary)/.06)_78%)]" />
        <div className="absolute inset-y-0 left-0 w-1/2 bg-[radial-gradient(circle_at_15%_20%,hsl(var(--secondary)/.13),transparent_42%)]" />
        <div className="container relative flex min-h-[620px] items-center py-16 lg:min-h-[700px]">
          <div className="hidden w-16 shrink-0 items-center self-stretch border-r border-secondary/70 lg:flex">
            <p className="-rotate-90 whitespace-nowrap text-[0.68rem] font-bold uppercase tracking-[0.2em] text-secondary">
              {hub.eyebrow || "Leadership in motion"}
            </p>
          </div>
          <div className="max-w-[690px] py-10 lg:pl-16">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary lg:hidden">
              {hub.eyebrow || "Leadership in motion"}
            </p>
            <h1 className="mt-5 max-w-[650px] font-[family-name:var(--font-display)] text-5xl font-semibold leading-[0.95] sm:text-6xl lg:mt-0 lg:text-7xl xl:text-8xl">
              {hub.title}
            </h1>
            <p className="mt-7 max-w-[560px] text-base leading-7 text-white/90 sm:text-lg sm:leading-8">
              {hub.introduction ||
                `Meet ${name} and discover the ideas, engagements and moments shaping Kisii University.`}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              {hub.welcome_video ? (
                <a
                  href="#vc-story"
                  className="inline-flex min-h-12 items-center gap-3 bg-secondary px-6 font-bold text-secondary-foreground transition-colors hover:bg-white hover:text-primary"
                >
                  <span className="grid size-6 place-items-center rounded-full bg-primary text-white">
                    <Play
                      className="ml-0.5 size-3.5 fill-current"
                      aria-hidden
                    />
                  </span>
                  Watch the welcome
                </a>
              ) : null}
              <Link
                href={hub.professional_profile_url}
                className="inline-flex min-h-12 items-center gap-3 border border-white/65 bg-black/10 px-6 font-semibold text-white transition-colors hover:bg-white hover:text-primary"
              >
                View professional profile
              </Link>
            </div>
            <p className="mt-8 text-sm text-white/75">
              <span className="font-semibold text-white">{name}</span>
              <span className="mx-2 text-secondary">—</span>
              {role}
            </p>
          </div>
        </div>
      </section>

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

      <section id="vc-story" className="scroll-mt-24 bg-white py-14 sm:py-20">
        <div className="container grid gap-9 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)] lg:items-center">
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
            <h2 className="max-w-sm font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.02] text-primary sm:text-5xl">
              {hub.welcome_title || "A conversation with the VC"}
            </h2>
            <blockquote className="relative mt-7 border-l-2 border-secondary pl-7">
              <Quote
                className="absolute -left-3 -top-2 size-6 fill-white text-secondary"
                aria-hidden
              />
              <p className="text-base leading-8 text-foreground">
                {hub.welcome_message ||
                  person?.leadership_message ||
                  "Together, we are building knowledge, shaping character and transforming lives."}
              </p>
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

      {isVisible("activities") ? (
        <VcActivitiesSection items={activities} />
      ) : null}
      {isVisible("speeches") || isVisible("videos") ? (
        <VcPodiumSection
          speeches={isVisible("speeches") ? speeches : []}
          videos={isVisible("videos") ? videos : []}
        />
      ) : null}
      {isVisible("events") ? <VcEventsSection items={events} /> : null}
      {isVisible("gallery") ? (
        <VcGallerySection albums={galleries} media={galleryMedia} />
      ) : null}

      <section className="bg-primary py-8 text-white">
        <div className="container flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <p className="max-w-xl font-[family-name:var(--font-display)] text-xl leading-snug sm:text-2xl">
            For formal credentials, career details and academic leadership
            record, visit the official professional profile.
          </p>
          <Link
            href={hub.professional_profile_url}
            className="inline-flex min-h-12 shrink-0 items-center gap-3 border border-secondary px-6 font-semibold text-secondary transition-colors hover:bg-secondary hover:text-secondary-foreground"
          >
            View professional profile <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
