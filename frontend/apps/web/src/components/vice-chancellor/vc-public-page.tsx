import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import type { StaffAssignment, VcPublicHub } from "@ksu/api-client";
import { PublicImage } from "@/components/public/public-image";
import { BreadcrumbTrail } from "@/components/site-shell";
import { VcPublicSection } from "./vc-public-sections";
import { VcVideoPlayer } from "./vc-video-player";

export function VcPublicPage({ hub, assignment }: { hub: VcPublicHub; assignment: StaffAssignment | null }) {
  const person = assignment?.person;
  const name = person?.full_name || "The Vice Chancellor";
  const portrait = hub.hero_media?.url || person?.photo_url;
  return (
    <>
      <section className="relative overflow-hidden bg-primary text-white">
        <div className="absolute inset-0 opacity-15 [background-image:radial-gradient(circle_at_20%_10%,white_0,transparent_35%),radial-gradient(circle_at_80%_90%,hsl(var(--secondary))_0,transparent_30%)]" />
        <div className="container relative py-6"><BreadcrumbTrail items={[{ label: "Home", href: "/" }, { label: "About", href: "/about" }, { label: "Meet the Vice Chancellor" }]} /></div>
        <div className="container relative grid min-h-[680px] items-center gap-10 pb-16 pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,520px)] lg:pb-20">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-secondary">{hub.eyebrow}</p>
            <h1 className="mt-5 font-[family-name:var(--font-display)] text-5xl font-semibold leading-[0.98] sm:text-6xl lg:text-7xl xl:text-8xl">{hub.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">{hub.introduction || `Meet ${name} and explore the ideas, engagements, and moments shaping Kisii University's next chapter.`}</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link href={hub.professional_profile_url} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-secondary px-6 font-bold text-white transition-colors hover:bg-white hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60">Professional profile <ArrowRight className="size-4" /></Link><a href="#vc-story" className="inline-flex min-h-12 items-center rounded-full border border-white/35 px-6 font-semibold text-white transition-colors hover:bg-white/10">Explore the story</a></div>
          </div>
          <div className="relative mx-auto w-full max-w-[500px]"><div className="absolute -inset-4 rounded-[2.5rem] border border-white/15" /><PublicImage src={portrait} alt={hub.hero_media?.alt_text || name} ratio="profile" priority sizes="(min-width: 1024px) 42vw, 90vw" className="min-h-[480px] rounded-[2rem] border border-white/15" imageClassName="object-cover object-top" /><div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/20 bg-primary/90 p-5 backdrop-blur"><p className="font-[family-name:var(--font-display)] text-2xl font-semibold">{name}</p><p className="mt-1 text-sm uppercase tracking-[0.16em] text-secondary">{assignment?.title || "Vice Chancellor"}</p></div></div>
        </div>
      </section>

      <section id="vc-story" className="bg-white py-16 sm:py-24"><div className="container grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">A welcome from the office</p><h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold text-primary sm:text-5xl">{hub.welcome_title || "A conversation about our shared future"}</h2></div><blockquote className="relative rounded-[2rem] bg-surface-subtle p-8 text-lg leading-8 text-foreground sm:p-10"><Quote className="absolute right-7 top-7 size-16 text-primary/10" /><p className="relative">{hub.welcome_message || person?.leadership_message || "Kisii University advances through a community committed to academic excellence, research, innovation, integrity, and service."}</p></blockquote></div>{hub.welcome_video ? <div className="container mt-12"><VcVideoPlayer title={hub.welcome_video.title} embedUrl={hub.welcome_video.embed_url} posterUrl={hub.welcome_video.thumbnail_url} className="mx-auto max-w-5xl" /></div> : null}</section>

      {hub.section_order.map((section) => hub.section_visibility[section] !== false ? <VcPublicSection key={section} section={section} items={hub.sections[section] || []} /> : null)}
    </>
  );
}
