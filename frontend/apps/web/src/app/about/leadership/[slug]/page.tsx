import { notFound } from "next/navigation";
import {
  AboutIllustration,
  aboutIllustrations,
} from "@/components/about/AboutIllustration";
import { BreadcrumbTrail, PageHeading, PageShell } from "@/components/site-shell";
import { getLeaderProfile } from "@/lib/about-data";

export default async function LeaderProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const leader = await getLeaderProfile(slug);

  if (!leader) {
    notFound();
  }

  return (
    <PageShell>
      <section className="container py-10 md:py-14">
        <BreadcrumbTrail
          items={[
            { label: "Home", href: "/" },
            { label: "About", href: "/about" },
            { label: "Leadership", href: "/about/leadership" },
            { label: leader.name },
          ]}
        />
        <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 md:grid md:grid-cols-[240px_1fr] md:gap-8 md:p-8 xl:grid-cols-[240px_minmax(0,1fr)_340px]">
          <div className="flex items-start justify-center">
            {leader.photoUrl ? (
              <img
                src={leader.photoUrl}
                alt={leader.name}
                className="h-64 w-full max-w-[240px] rounded-[1.75rem] object-cover"
              />
            ) : (
              <div className="flex h-64 w-full max-w-[240px] items-center justify-center rounded-[1.75rem] bg-[linear-gradient(135deg,#dbeafe,#bfdbfe_55%,#f8fafc)] font-[family-name:var(--font-display)] text-6xl text-primary">
                {leader.name
                  .split(" ")
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")}
              </div>
            )}
          </div>
          <div className="mt-6 md:mt-0">
            <PageHeading
              eyebrow={leader.role}
              title={leader.name}
              body={leader.credentials || "Institutional profile"}
            />
            <div className="mt-6 flex flex-col gap-2 text-sm text-slate-500">
              {leader.email ? <span>{leader.email}</span> : null}
              {leader.phone ? <span>{leader.phone}</span> : null}
            </div>
          </div>
          <AboutIllustration
            src={aboutIllustrations.leadership}
            alt="Academic leadership on a university campus"
            priority
            className="mt-6 aspect-[4/3] min-h-[240px] md:col-span-2 xl:col-span-1 xl:mt-0"
          />
        </div>
      </section>

      <section className="container grid gap-6 pb-12 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-xl shadow-slate-300/30">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">
            Message
          </p>
          <blockquote className="mt-5 font-[family-name:var(--font-display)] text-3xl leading-tight">
            {leader.message}
          </blockquote>
        </article>
        <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">
            Biography
          </p>
          <p className="mt-5 text-base leading-8 text-slate-600">{leader.biography}</p>
        </article>
      </section>

      <section className="container pb-16">
        <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">
            Education
          </p>
          <ul className="mt-6 space-y-4 text-base leading-7 text-slate-600">
            {leader.education.length ? (
              leader.education.map((item) => <li key={item}>• {item}</li>)
            ) : (
              <li>No public education records are currently published for this profile.</li>
            )}
          </ul>
        </article>
      </section>
    </PageShell>
  );
}
