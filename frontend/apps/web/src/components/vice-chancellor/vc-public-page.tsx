import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
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
import { VcHero } from "./vc-hero";
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
      <VcHero
        professionalProfileUrl={hub.professional_profile_url}
        hasWelcomeVideo={Boolean(hub.welcome_video)}
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
            className="inline-flex min-h-12 shrink-0 items-center gap-3 border border-secondary px-6 font-semibold text-secondary transition-colors duration-200 hover:bg-secondary hover:text-secondary-foreground active:scale-[0.98]"
          >
            View professional profile <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
