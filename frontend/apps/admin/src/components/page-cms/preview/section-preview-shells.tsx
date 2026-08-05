import { FileImage, ImageIcon, Play, SquareArrowOutUpRight } from "lucide-react";
import type { ReactNode } from "react";
import type { PagePreviewItem, PagePreviewMediaLink, PagePreviewSection } from "@/lib/api/page-cms";

export type PreviewViewport = "desktop" | "tablet" | "mobile";

export type PreviewShellProps = {
  section: PagePreviewSection;
  viewport: PreviewViewport;
};

type LinkProps = {
  href?: string | null;
  label?: string | null;
  className?: string;
};

function visibleItems(section: PagePreviewSection) {
  return section.items.filter((item) => item.is_enabled).sort((left, right) => left.display_order - right.display_order);
}

function itemTitle(item: PagePreviewItem, fallback = "Untitled item") {
  return item.title || item.source?.label || fallback;
}

function itemBody(item: PagePreviewItem) {
  return item.body_text || item.subtitle || item.cta_description || item.source?.secondary_label || null;
}

function firstMedia(section: PagePreviewSection, ...roles: string[]) {
  for (const role of roles) {
    const media = section.media[role]?.[0];
    if (media) return media;
  }
  return undefined;
}

function mediaUrl(link?: PagePreviewMediaLink) {
  const media = link?.media;
  return media?.cdn_url || media?.public_url || media?.url || media?.thumbnail_url || null;
}

export function safeHref(value?: string | null) {
  if (!value) return null;
  if (value.startsWith("/")) return { href: value, external: false };
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? { href: url.toString(), external: true }
      : null;
  } catch {
    return null;
  }
}

export function PreviewLink({ href, label, className = "" }: LinkProps) {
  const destination = safeHref(href);
  if (!destination || !label) return null;
  return (
    <a
      href={destination.href}
      className={`inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-2 hover:underline ${className}`}
      {...(destination.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {label}
      {destination.external ? <SquareArrowOutUpRight className="size-3" aria-hidden /> : null}
    </a>
  );
}

export function MissingMediaPlaceholder({ role, className = "" }: { role: string; className?: string }) {
  return (
    <div className={`flex min-h-24 items-center justify-center border border-dashed border-muted-foreground/40 bg-muted/50 p-3 text-center text-xs text-muted-foreground ${className}`}>
      <ImageIcon className="mr-2 size-4" aria-hidden />
      Missing media: {role.replace(/_/g, " ")}
    </div>
  );
}

export function PreviewMedia({ link, role, className = "" }: { link?: PagePreviewMediaLink; role: string; className?: string }) {
  const url = mediaUrl(link);
  if (!url) return <MissingMediaPlaceholder role={role} className={className} />;
  return (
    <figure className={`overflow-hidden border border-border bg-muted ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={link?.media.alt_text || link?.media.title || role.replace(/_/g, " ")} className="h-full w-full object-cover" />
    </figure>
  );
}

function SectionFrame({ children, tinted = false }: { children: ReactNode; tinted?: boolean }) {
  return <section className={tinted ? "border-b border-border bg-muted/35 p-5" : "border-b border-border bg-background p-5"}>{children}</section>;
}

function SectionHeading({ section, fallback }: { section: PagePreviewSection; fallback: string }) {
  return <div><p className="text-[11px] font-semibold uppercase text-muted-foreground">{section.subtitle || section.layout_variant.replace(/_/g, " ")}</p><h3 className="mt-1 text-xl font-semibold">{section.title || fallback}</h3>{section.description ? <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{section.description}</p> : null}</div>;
}

function Cards({ items, viewport, media = false }: { items: PagePreviewItem[]; viewport: PreviewViewport; media?: boolean }) {
  const columns = viewport === "desktop" ? "grid-cols-3" : viewport === "tablet" ? "grid-cols-2" : "grid-cols-1";
  return <div className={`grid gap-3 ${columns}`}>{items.slice(0, 6).map((item) => <article key={item.id} className="min-w-0 border border-border bg-background p-3">{media ? <div className="mb-3 flex aspect-[16/9] items-center justify-center bg-muted text-muted-foreground"><FileImage className="size-5" aria-hidden /></div> : null}<h4 className="text-sm font-semibold">{itemTitle(item)}</h4>{itemBody(item) ? <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{itemBody(item)}</p> : null}<PreviewLink href={item.cta_url} label={item.cta_label || "Open"} className="mt-3" /></article>)}</div>;
}

function Timeline({ items }: { items: PagePreviewItem[] }) {
  return <div className="space-y-2">{items.slice(0, 6).map((item) => <article key={item.id} className="border-l-2 border-primary px-3 py-2"><p className="text-[11px] font-medium uppercase text-muted-foreground">{item.subtitle || item.cta_description || "Update"}</p><h4 className="text-sm font-semibold">{itemTitle(item)}</h4>{itemBody(item) ? <p className="mt-1 text-xs text-muted-foreground">{itemBody(item)}</p> : null}<PreviewLink href={item.cta_url} label={item.cta_label || "Details"} className="mt-2" /></article>)}</div>;
}

function Facts({ items }: { items: PagePreviewItem[] }) {
  return <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4">{items.slice(0, 4).map((item) => <article key={item.id} className="bg-background p-3"><p className="text-lg font-semibold text-primary">{itemTitle(item, "0")}</p><p className="mt-1 text-xs text-muted-foreground">{itemBody(item) || "Metric"}</p></article>)}</div>;
}

function settingCta(section: PagePreviewSection, key: string) {
  const value = section.settings?.[key];
  if (!value || typeof value !== "object") return null;
  const cta = value as Record<string, unknown>;
  return { label: typeof cta.label === "string" ? cta.label : null, href: typeof cta.href === "string" ? cta.href : null };
}

export function HeroAdmissionsPreview({ section }: PreviewShellProps) {
  const primary = settingCta(section, "primary_cta");
  return <SectionFrame><div className="grid gap-4 bg-primary p-5 text-primary-foreground"><div><p className="text-xs font-semibold uppercase text-primary-foreground/75">{section.subtitle || "Admissions"}</p><h3 className="mt-2 text-2xl font-semibold">{section.title || "Kisii University"}</h3>{section.description ? <p className="mt-2 max-w-xl text-sm text-primary-foreground/80">{section.description}</p> : null}<PreviewLink href={primary?.href} label={primary?.label} className="mt-4 text-primary-foreground" /></div><PreviewMedia link={firstMedia(section, "hero_image", "background")} role="hero_image" className="aspect-[16/6]" /></div></SectionFrame>;
}

export function PulseStripPreview({ section }: PreviewShellProps) { return <SectionFrame><Facts items={visibleItems(section)} /></SectionFrame>; }

export function FeaturedPartnershipPreview({ section }: PreviewShellProps) { const item = visibleItems(section)[0]; return <SectionFrame tinted><div className="grid gap-4 sm:grid-cols-2"><div><SectionHeading section={section} fallback="Partnership spotlight" /><PreviewLink href={item?.cta_url} label={item?.cta_label || "Explore partnership"} className="mt-4" /></div><PreviewMedia link={firstMedia(section, "hero_image", "background")} role="hero_image" className="aspect-[4/3]" /></div></SectionFrame>; }

export function ProgrammeFinderPreview({ section, viewport }: PreviewShellProps) { return <SectionFrame><SectionHeading section={section} fallback="Find a programme" /><div className="mt-4"><Cards items={visibleItems(section)} viewport={viewport} /></div></SectionFrame>; }

export function DateTimelinePreview({ section }: PreviewShellProps) { return <SectionFrame tinted><SectionHeading section={section} fallback="Important dates" /><div className="mt-4"><Timeline items={visibleItems(section)} /></div></SectionFrame>; }

export function PillarGridPreview({ section, viewport }: PreviewShellProps) { return <SectionFrame><SectionHeading section={section} fallback="University pillars" /><div className="mt-4"><Cards items={visibleItems(section)} viewport={viewport} /></div></SectionFrame>; }

export function MediaMosaicPreview({ section, viewport }: PreviewShellProps) {
  const media = section.media.gallery ?? [];
  const columns = viewport === "desktop" ? "grid-cols-3" : viewport === "tablet" ? "grid-cols-2" : "grid-cols-1";
  return <SectionFrame tinted><SectionHeading section={section} fallback="Campus moments" /><div className={`mt-4 grid gap-2 ${columns}`}>{media.length ? media.slice(0, 5).map((link) => <PreviewMedia key={link.id} link={link} role="gallery" className="aspect-[4/3]" />) : <MissingMediaPlaceholder role="gallery" className="col-span-full" />}</div></SectionFrame>;
}

export function LeadershipActivityPreview({ section, viewport }: PreviewShellProps) { return <SectionFrame><SectionHeading section={section} fallback="Leadership activity" /><div className="mt-4 grid gap-4 sm:grid-cols-2"><PreviewMedia link={firstMedia(section, "hero_image", "background")} role="hero_image" className="aspect-[4/3]" /><Cards items={visibleItems(section)} viewport={viewport === "mobile" ? "mobile" : "tablet"} /></div></SectionFrame>; }

export function ResearchCardsPreview({ section, viewport }: PreviewShellProps) { return <SectionFrame tinted><SectionHeading section={section} fallback="Research and innovation" /><div className="mt-4"><Cards items={visibleItems(section)} viewport={viewport} media /></div></SectionFrame>; }

export function NewsGridPreview({ section, viewport }: PreviewShellProps) { return <SectionFrame><SectionHeading section={section} fallback="Latest news" /><div className="mt-4"><Cards items={visibleItems(section)} viewport={viewport} media /></div></SectionFrame>; }

export function EventsListPreview({ section }: PreviewShellProps) { return <SectionFrame tinted><SectionHeading section={section} fallback="Upcoming events" /><div className="mt-4"><Timeline items={visibleItems(section)} /></div></SectionFrame>; }

export function LogoCarouselPreview({ section, viewport }: PreviewShellProps) {
  const logos = section.media.logo ?? [];
  const columns = viewport === "desktop" ? "grid-cols-6" : viewport === "tablet" ? "grid-cols-3" : "grid-cols-2";
  return <SectionFrame><SectionHeading section={section} fallback="Partners and collaborators" /><div className={`mt-4 grid gap-2 ${columns}`}>{logos.length ? logos.map((link) => <PreviewMedia key={link.id} link={link} role="logo" className="aspect-[3/2]" />) : <MissingMediaPlaceholder role="logo" className="col-span-full" />}</div></SectionFrame>;
}

export function AlumniStoryPreview({ section }: PreviewShellProps) { const item = visibleItems(section)[0]; const body = item ? itemBody(item) : section.description; return <SectionFrame tinted><div className="grid gap-4 sm:grid-cols-2"><PreviewMedia link={firstMedia(section, "hero_image", "poster")} role="hero_image" className="aspect-[4/3]" /><div><SectionHeading section={{ ...section, title: item?.title || section.title }} fallback="Alumni story" />{body ? <p className="mt-3 text-sm text-muted-foreground">{body}</p> : null}<PreviewLink href={item?.cta_url} label={item?.cta_label || "Read story"} className="mt-4" /></div></div></SectionFrame>; }

export function FactsStripPreview({ section }: PreviewShellProps) { return <SectionFrame><div className="bg-primary p-4 text-primary-foreground"><Facts items={visibleItems(section)} /></div></SectionFrame>; }

export function EmptyVariantPreview({ section }: PreviewShellProps) { return <SectionFrame><SectionHeading section={section} fallback="Section" /><div className="mt-4 flex items-center gap-2 border border-dashed p-4 text-sm text-muted-foreground"><Play className="size-4" aria-hidden />This layout variant is not available in the draft preview.</div></SectionFrame>; }
