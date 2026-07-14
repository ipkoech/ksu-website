import Link from "next/link";
import { ArrowRight, Award } from "lucide-react";
import type { BoardMember } from "@/components/about/BoardMemberGrid";
import { PublicImage } from "@/components/public/public-image";
import { PageShell } from "@/components/site-shell";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import { getManagementData } from "@/lib/about-data";
import { AboutReveal } from "@/components/about/about-reveal";

function present(value?: string | null) {
  const text = value?.trim();
  return text && text.length ? text : null;
}

function LeadershipCard({ member, featured = false }: { member: BoardMember; featured?: boolean }) {
  const content = (
    <article className={`overflow-hidden rounded-lg border border-slate-200 bg-white text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${featured ? "w-[250px]" : "w-full max-w-[245px]"}`}>
      <PublicImage src={member.photoUrl} alt={`${member.name}, ${member.role}`} ratio="profile" className="aspect-[4/3]" sizes="250px" imageClassName="object-cover object-top" />
      <div className="min-h-[82px] px-3 py-3"><h3 className="font-[family-name:var(--font-display)] text-base font-semibold leading-tight text-slate-950">{member.name}</h3><p className="mt-1.5 text-xs font-semibold leading-5 text-secondary">{member.role}</p></div>
    </article>
  );
  return member.profileHref ? <Link href={member.profileHref} className="block rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">{content}</Link> : content;
}

export default async function UniversityManagementPage() {
  const data = await getManagementData();
  const managementBoard = data.managementBoard;
  const members = managementBoard?.members ?? [];
  const boardDescription = present(managementBoard?.description) ?? present(managementBoard?.mandate) ?? "The University Management Board is responsible for the day-to-day administration and implementation of policies and decisions made by the University Council.";
  const viceChancellor = members[0];
  const deputies = members.slice(1, 3);
  const officers = members.slice(3);

  return (
    <PageShell>
      <AboutPageLenis>
        <section className="relative isolate overflow-hidden bg-primary text-white">
          <div aria-hidden className="absolute inset-0 bg-[url('/images/backgrounds/KSUGreenLandscapingMay2026-9664.jpg')] bg-cover bg-center opacity-65" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/20" />
          <div className="relative mx-auto min-h-[340px] w-full px-5 py-7 sm:px-8 lg:px-10">
            <nav aria-label="Breadcrumb" className="text-xs font-semibold text-white/75"><Link href="/" className="hover:text-white">Home</Link><span className="mx-2">/</span><Link href="/about" className="hover:text-white">About KSU</Link><span className="mx-2">/</span><span>University Management</span></nav>
            <div className="mt-9 max-w-2xl"><h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-white sm:text-5xl">University Management</h1><div className="mt-3 h-0.5 w-10 bg-secondary" /><p className="mt-5 max-w-xl text-sm leading-7 text-white/88">{boardDescription}</p></div>
          </div>
        </section>

        <section className="bg-white px-4 py-10 sm:px-6 lg:px-8">
          <AboutReveal className="mx-auto w-full">
            <div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">Executive leadership</p><h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold uppercase text-primary">Our Leadership Structure</h2><div className="mx-auto mt-2 h-0.5 w-10 bg-secondary" /></div>

            {viceChancellor ? <div className="mt-6 flex justify-center"><LeadershipCard member={viceChancellor} featured /></div> : <p className="mt-8 rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">Management profiles have not been published yet.</p>}

            {deputies.length ? <><div aria-hidden className="mx-auto hidden h-6 w-1/2 border-x border-t border-secondary/70 md:block" /><div className="grid justify-items-center gap-5 md:grid-cols-2">{deputies.map((member) => <LeadershipCard key={`${member.name}-${member.role}`} member={member} />)}</div></> : null}

            {officers.length ? <><div aria-hidden className="mx-auto hidden h-6 w-3/4 border-x border-t border-secondary/70 md:block" /><div className="mt-1 grid justify-items-center gap-5 sm:grid-cols-2 lg:grid-cols-4">{officers.map((member) => <LeadershipCard key={`${member.name}-${member.role}`} member={member} />)}</div></> : null}

            <div className="mt-8 grid gap-5 rounded-xl bg-slate-50 p-5 sm:grid-cols-[3.5rem_1fr_auto] sm:items-center"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-secondary"><Award className="h-6 w-6" aria-hidden /></span><div><h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-primary">Committed to Excellence</h2><p className="mt-1 text-sm leading-6 text-slate-600">Our management team advances academic quality, innovation and dependable service across the University.</p></div><Link href="/about/university-council" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary/90">Our Governance <ArrowRight className="h-4 w-4" aria-hidden /></Link></div>
          </AboutReveal>
        </section>
      </AboutPageLenis>
    </PageShell>
  );
}
