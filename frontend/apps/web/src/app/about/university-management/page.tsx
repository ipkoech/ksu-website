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

function LeadershipCard({ member, featured = false, compact = false }: { member: BoardMember; featured?: boolean; compact?: boolean }) {
  const content = (
    <article className={`group overflow-hidden rounded-lg border border-border bg-white text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg ${featured ? "w-[280px]" : compact ? "w-full max-w-[205px]" : "w-full max-w-[235px]"}`}>
      <PublicImage src={member.photoUrl} alt={`${member.name}, ${member.role}`} ratio="profile" className="aspect-[4/3]" sizes={featured ? "280px" : "235px"} imageClassName="object-cover object-top transition duration-500 group-hover:scale-[1.025]" />
      <div className={featured ? "min-h-[92px] px-4 py-4" : "min-h-[76px] px-3 py-3"}><h3 className={`font-[family-name:var(--font-display)] font-semibold leading-tight text-foreground ${featured ? "text-lg" : compact ? "text-sm" : "text-base"}`}>{member.name}</h3><p className="mt-1.5 text-[11px] font-semibold leading-4 text-secondary">{member.role}</p></div>
    </article>
  );
  return member.profileHref ? <Link href={member.profileHref} className="block rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">{content}</Link> : content;
}

function ManagementBranch({ deputy, reports }: { deputy: BoardMember; reports: BoardMember[] }) {
  return (
    <div className="flex min-w-0 flex-col items-center">
      <span aria-hidden className="h-6 w-px bg-secondary/70" />
      <LeadershipCard member={deputy} />
      {reports.length ? (
        <>
          <span aria-hidden className="h-6 w-px bg-secondary/70" />
          <div className="relative grid w-full grid-cols-2 justify-items-center gap-4 pt-5">
            <span aria-hidden className="absolute left-1/4 right-1/4 top-0 h-px bg-secondary/70" />
            {reports.map((member) => (
              <div key={`${member.name}-${member.role}`} className="relative flex w-full justify-center pt-1 before:absolute before:-top-5 before:h-5 before:w-px before:bg-secondary/70">
                <span aria-hidden className="absolute -top-[1.42rem] h-2 w-2 rounded-full border-2 border-white bg-secondary shadow-sm" />
                <LeadershipCard member={member} compact />
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export default async function UniversityManagementPage() {
  const data = await getManagementData();
  const managementBoard = data.managementBoard;
  const members = managementBoard?.members ?? [];
  const boardDescription = present(managementBoard?.mandate) ?? present(managementBoard?.description) ?? "The University Management Board provides executive leadership for the University, translating Council policy into academic, administrative and financial action while safeguarding quality, accountability and effective service delivery.";
  const viceChancellor = members[0];
  const deputies = members.slice(1, 3);
  const officers = members.slice(3);
  const academicDeputy = deputies.find((member) => /academic|research|student/i.test(member.role)) ?? deputies[0];
  const administrationDeputy = deputies.find((member) => /administration|planning|finance/i.test(member.role)) ?? deputies.find((member) => member !== academicDeputy);
  const academicReports = officers.filter((member) => /academic|\(aa\)|research|innovation|resource mobilisation|reirm/i.test(member.role));
  const administrationReports = officers.filter((member) => !academicReports.includes(member));

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

            {viceChancellor ? <div className="mt-6 flex justify-center"><LeadershipCard member={viceChancellor} featured /></div> : <p className="mt-8 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Management profiles have not been published yet.</p>}

            {deputies.length ? (
              <>
                <div className="hidden md:block">
                  <div aria-hidden className="mx-auto h-7 w-px bg-secondary/70" />
                  <div className="relative mx-auto max-w-5xl">
                    <span aria-hidden className="absolute left-1/4 right-1/4 top-0 h-px bg-secondary/70" />
                    <span aria-hidden className="absolute left-1/2 top-[-4px] h-2 w-2 -translate-x-1/2 rounded-full border-2 border-white bg-secondary shadow-sm" />
                    <div className="grid grid-cols-2 gap-10">
                      {academicDeputy ? <ManagementBranch deputy={academicDeputy} reports={academicReports} /> : null}
                      {administrationDeputy ? <ManagementBranch deputy={administrationDeputy} reports={administrationReports} /> : null}
                    </div>
                  </div>
                </div>
                <div className="mt-6 grid justify-items-center gap-5 sm:grid-cols-2 md:hidden">
                  {[...deputies, ...officers].map((member) => <LeadershipCard key={`${member.name}-${member.role}`} member={member} compact={officers.includes(member)} />)}
                </div>
              </>
            ) : null}

            <div className="mt-8 grid gap-5 rounded-xl bg-surface-subtle p-5 sm:grid-cols-[3.5rem_1fr_auto] sm:items-center"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-secondary"><Award className="h-6 w-6" aria-hidden /></span><div><h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-primary">Committed to Excellence</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Our management team advances academic quality, innovation and dependable service across the University.</p></div><Link href="/about/university-council" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary/90">Our Governance <ArrowRight className="h-4 w-4" aria-hidden /></Link></div>
          </AboutReveal>
        </section>
      </AboutPageLenis>
    </PageShell>
  );
}
