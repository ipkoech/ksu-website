import { CalendarDays, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { PublicImage } from "@/components/public/public-image";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { getPublicVcGallery } from "@/lib/vice-chancellor-data";

export default async function ViceChancellorGalleryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const gallery = await getPublicVcGallery(slug);
  if (!gallery) notFound();
  const date = gallery.event_date ? new Intl.DateTimeFormat("en-KE", { dateStyle: "long" }).format(new Date(gallery.event_date)) : null;
  return (
    <PageShell><section className="bg-primary text-white"><div className="container py-6"><BreadcrumbTrail items={[{ label: "Home", href: "/" }, { label: "Meet the VC", href: "/about/vice-chancellor" }, { label: "Gallery", href: "/about/vice-chancellor#gallery" }, { label: gallery.title }]} /></div><div className="container pb-14 pt-8"><p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Photo story</p><h1 className="mt-5 max-w-5xl font-[family-name:var(--font-display)] text-5xl font-semibold sm:text-6xl">{gallery.title}</h1>{gallery.summary ? <p className="mt-5 max-w-3xl text-lg leading-8 text-white/75">{gallery.summary}</p> : null}<div className="mt-6 flex flex-wrap gap-5 text-sm text-white/75">{date ? <span className="flex items-center gap-2"><CalendarDays className="size-4 text-secondary" />{date}</span> : null}{gallery.location ? <span className="flex items-center gap-2"><MapPin className="size-4 text-secondary" />{gallery.location}</span> : null}</div></div></section><section className="container py-14"><div className="columns-1 gap-5 sm:columns-2 lg:columns-3">{gallery.media?.length ? gallery.media.map((media) => <figure key={media.id} className="mb-5 break-inside-avoid overflow-hidden rounded-[1.5rem] border border-border bg-white shadow-sm"><PublicImage src={media.url} alt={media.alt_text || media.caption || gallery.title} ratio="card" className="rounded-none" />{media.caption ? <figcaption className="p-4 text-sm leading-6 text-muted-foreground">{media.caption}</figcaption> : null}</figure>) : <div className="rounded-[2rem] border border-dashed border-border p-10 text-muted-foreground">Images for this album are being prepared.</div>}</div></section></PageShell>
  );
}
