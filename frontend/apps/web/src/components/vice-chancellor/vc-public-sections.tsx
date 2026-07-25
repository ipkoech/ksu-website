import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin, Mic2, PlayCircle } from "lucide-react";
import type { VcPublicItem, VcSection } from "@ksu/api-client";
import { PublicImage } from "@/components/public/public-image";
import { VcVideoPlayer } from "./vc-video-player";

const sectionCopy: Record<VcSection, { eyebrow: string; title: string; body: string }> = {
  story: { eyebrow: "The office", title: "Leadership with purpose", body: "A closer view of the Vice Chancellor's service and institutional stewardship." },
  activities: { eyebrow: "Leadership in motion", title: "Activities and engagements", body: "Selected moments from partnerships, university life, and public service." },
  speeches: { eyebrow: "In their words", title: "Speeches and addresses", body: "Messages that frame the University's direction, values, and shared ambitions." },
  videos: { eyebrow: "Watch", title: "From the Vice Chancellor", body: "Conversations, addresses, and highlights from across the University." },
  events: { eyebrow: "Calendar", title: "Events and appearances", body: "Upcoming and recent engagements involving the Office of the Vice Chancellor." },
  gallery: { eyebrow: "In pictures", title: "Gallery", body: "Photographic stories from university leadership and community life." },
};

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : new Intl.DateTimeFormat("en-KE", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

function itemHref(section: VcSection, item: VcPublicItem) {
  if (section === "speeches" && item.slug) return `/about/vice-chancellor/speeches/${item.slug}`;
  if (section === "gallery" && item.slug) return `/about/vice-chancellor/galleries/${item.slug}`;
  if (section === "activities" && item.slug) return `/media/news/${item.slug}`;
  if (section === "events" && item.slug) return `/events/${item.slug}`;
  return null;
}

function EditorialCard({ item, section }: { item: VcPublicItem; section: VcSection }) {
  const href = itemHref(section, item);
  const date = formatDate(item.delivered_at || item.event_date || item.start_date);
  const image = item.cover?.url || item.thumbnail_url;
  const content = (
    <article className="group h-full overflow-hidden rounded-[1.5rem] border border-border bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
      <PublicImage src={image} alt={item.cover?.alt_text || item.title} ratio="news" imageClassName="transition duration-500 group-hover:scale-[1.03]" />
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.13em] text-secondary">
          {item.editorial_label ? <span>{item.editorial_label}</span> : null}
          {date ? <span className="flex items-center gap-1.5 text-muted-foreground"><CalendarDays className="size-3.5" />{date}</span> : null}
        </div>
        <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-primary">{item.title}</h3>
        {item.summary ? <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{item.summary}</p> : null}
        {item.location || item.venue ? <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="size-4 text-secondary" />{item.location || item.venue}</p> : null}
        {href ? <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">Explore <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span> : null}
      </div>
    </article>
  );
  return href ? <Link href={href} className="block h-full rounded-[1.5rem] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-secondary/50">{content}</Link> : content;
}

export function VcPublicSection({ section, items }: { section: VcSection; items: VcPublicItem[] }) {
  if (!items.length || section === "story") return null;
  const copy = sectionCopy[section];
  return (
    <section className={`py-16 sm:py-20 ${section === "speeches" || section === "gallery" ? "bg-surface-subtle" : "bg-white"}`}>
      <div className="container">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{copy.eyebrow}</p>
        <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,440px)] lg:items-end">
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-primary sm:text-5xl">{copy.title}</h2>
          <p className="text-base leading-7 text-muted-foreground">{copy.body}</p>
        </div>
        {section === "videos" ? (
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            {items.map((item) => <div key={item.id}><VcVideoPlayer title={item.title} embedUrl={item.embed_url} posterUrl={item.thumbnail_url} /><h3 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold text-primary">{item.title}</h3>{item.summary ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.summary}</p> : null}</div>)}
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => <EditorialCard key={item.id} item={item} section={section} />)}</div>
        )}
      </div>
    </section>
  );
}

export function SpeechTypeIcon() { return <Mic2 className="size-5" aria-hidden />; }
export function VideoTypeIcon() { return <PlayCircle className="size-5" aria-hidden />; }
