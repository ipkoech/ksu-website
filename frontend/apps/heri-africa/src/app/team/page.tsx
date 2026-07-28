import Image from "next/image";
import Link from "next/link";
import { TeamDirectory } from "../../components/team/team-directory";
import { SiteShell } from "../../components/site-shell";
import { getTeam } from "../../lib/api";
import { fallbackTeam } from "../../lib/team-fallback";

export const revalidate = 300;

export default async function TeamPage() {
  const team = await getTeam()
    .then((items) => (items.length ? items : fallbackTeam))
    .catch(() => fallbackTeam);
  const chair = team.find((member) =>
    member.role.toLowerCase().includes("chair"),
  );

  return (
    <SiteShell>
      <main className="bg-white">
        <section className="relative overflow-hidden bg-heri-ink text-white">
          <div className="absolute inset-0 bg-[linear-gradient(115deg,#003c39,#006b62_54%,#07302d)]" />
          <div className="relative mx-auto grid min-h-[430px] max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:px-10">
            <div>
              <p className="text-sm text-white/70">
                Home <span className="mx-2">/</span> Our Team
              </p>
              <p className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-heri-lime">
                People behind the research
              </p>
              <h1 className="mt-4 max-w-xl text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl">
                African Expertise.
                <br />
                Shared Purpose.
                <br />
                <span className="text-heri-lime">Transformative Impact.</span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-white/85">
                A diverse team of researchers, educators and partners driving
                evidence-based solutions for language education and foundational
                literacy across Africa.
              </p>
            </div>
            <div className="relative h-[300px] overflow-hidden rounded-t-[6rem] rounded-bl-[6rem] lg:h-[360px]">
              <Image
                alt="HERI Africa research team"
                className="object-cover"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                src="/images/HERIAfricaLaunch.jpg"
              />
            </div>
          </div>
        </section>

        {chair && (
          <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-[0.45fr_0.55fr] lg:px-10">
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-heri-cream">
              {chair.photo_url ? (
                <Image
                  alt={chair.name}
                  className="object-cover"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  src={chair.photo_url}
                  unoptimized
                />
              ) : null}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-heri-lime">
                Research Chair
              </p>
              <h2 className="mt-4 text-4xl font-bold text-heri-blue">
                {chair.name}
              </h2>
              <p className="mt-2 text-lg font-semibold text-heri-teal">
                {chair.role}
              </p>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
                {chair.biography}
              </p>
              <Link
                className="mt-7 inline-flex rounded-lg bg-heri-lime px-5 py-3 text-xs font-bold text-heri-ink"
                href={`/team/${chair.slug}`}
              >
                VIEW FULL PROFILE <span className="ml-5">→</span>
              </Link>
            </div>
          </section>
        )}

        <section className="bg-slate-50 px-6 py-14">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-heri-teal">
              Meet our team
            </p>
            <h2 className="mt-3 text-4xl font-bold text-heri-blue">
              People driving the work
            </h2>
            <TeamDirectory members={team} />
          </div>
        </section>
        <section className="bg-heri-blue px-6 py-12 text-white">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-heri-lime">
                Join our research community
              </p>
              <h2 className="mt-2 text-3xl font-bold">
                Collaborate. Contribute. Create impact.
              </h2>
            </div>
            <Link
              className="rounded-lg bg-heri-lime px-5 py-3 text-xs font-bold text-heri-ink"
              href="/partner-with-us"
            >
              PARTNER WITH US →
            </Link>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
