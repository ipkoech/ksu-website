import { Mail, Phone } from "lucide-react";
import { notFound } from "next/navigation";
import { PublicImage } from "@/components/public/public-image";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { getActiveViceChancellor } from "@/lib/vice-chancellor-data";

export default async function ViceChancellorProfilePage() {
  const assignment = await getActiveViceChancellor();
  const person = assignment?.person;
  if (!assignment || !person) notFound();
  const qualifications = person.qualifications || [];
  return (
    <PageShell>
      <section className="bg-primary text-white"><div className="container py-6"><BreadcrumbTrail items={[{ label: "Home", href: "/" }, { label: "Meet the VC", href: "/about/vice-chancellor" }, { label: "Professional profile" }]} /></div><div className="container grid gap-10 pb-16 pt-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-end"><PublicImage src={person.photo_url} alt={person.full_name || "Vice Chancellor"} ratio="profile" priority sizes="320px" className="rounded-[2rem] border border-white/20" imageClassName="object-top" /><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{assignment.title || "Vice Chancellor"}</p><h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl font-semibold sm:text-6xl">{person.full_name}</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-white/75">{person.bio || person.institutional_role || "Executive and academic leadership of Kisii University."}</p><div className="mt-7 flex flex-wrap gap-5 text-sm text-white/85">{person.email ? <a href={`mailto:${person.email}`} className="flex items-center gap-2 hover:text-secondary"><Mail className="size-4" />{person.email}</a> : null}{person.phone ? <a href={`tel:${person.phone}`} className="flex items-center gap-2 hover:text-secondary"><Phone className="size-4" />{person.phone}</a> : null}</div></div></div></section>
      <section className="container grid gap-8 py-16 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,.75fr)]"><article className="rounded-[2rem] border border-border bg-white p-8 shadow-sm sm:p-10"><p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Biography</p><h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold text-primary">Academic and professional journey</h2><div className="mt-7 whitespace-pre-line text-base leading-8 text-muted-foreground">{person.full_bio || person.bio || "A detailed professional biography will be published here."}</div></article><aside className="space-y-6"><div className="rounded-[2rem] bg-surface-subtle p-7"><p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Qualifications</p><ul className="mt-5 space-y-4 text-sm leading-6 text-foreground">{qualifications.length ? qualifications.map((item) => <li key={`${item.degree}-${item.institution}`} className="border-b border-border pb-4 last:border-0"><strong className="block text-primary">{item.degree}{item.field ? `, ${item.field}` : ""}</strong><span className="text-muted-foreground">{item.institution}{item.year ? ` · ${item.year}` : ""}</span></li>) : <li className="text-muted-foreground">Qualifications will be published here.</li>}</ul></div>{person.leadership_message ? <blockquote className="rounded-[2rem] bg-primary p-7 font-[family-name:var(--font-display)] text-2xl leading-tight text-white">“{person.leadership_message}”</blockquote> : null}</aside></section>
    </PageShell>
  );
}
