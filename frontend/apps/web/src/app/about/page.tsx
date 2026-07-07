import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  History,
  Lightbulb,
  Scale,
  ShieldCheck,
  Target,
} from "lucide-react";
import { PublicImage } from "@/components/public/public-image";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import {
  getOverviewData,
  normalizeQuickFacts,
  splitCoreValues,
} from "@/lib/about-data";
import { publicFileUrl } from "@/lib/public-media";

function EmptyBlock({ label }: { label: string }) {
  return (
    <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-500">
      {label} has not been published yet.
    </p>
  );
}

export default async function AboutPage() {
  const overview = await getOverviewData();
  const coreValues = splitCoreValues(overview?.core_values);
  const facts = normalizeQuickFacts(overview?.quick_facts);
  const coverImageUrl = publicFileUrl(overview?.cover_image_id);

  return (
    <PageShell>
      <AboutPageLenis>
        <section className="border-b border-slate-200 bg-white px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1440px]">
            <BreadcrumbTrail
              items={[
                { label: "Home", href: "/" },
                { label: "About Us" },
              ]}
            />

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-secondary">
                  About Us
                </p>
                <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
                  {overview?.name ?? "University profile"}
                </h1>
                {overview?.motto ? (
                  <p className="mt-2 text-sm font-semibold text-primary">
                    {overview.motto}
                  </p>
                ) : null}
                {overview?.overview ? (
                  <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-700">
                    {overview.overview}
                  </p>
                ) : (
                  <EmptyBlock label="University description" />
                )}
                <Link
                  href="/about/history"
                  className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary"
                >
                  View institutional history
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </Link>
              </div>

              <aside className="rounded-lg border border-slate-200 bg-slate-950 p-3 text-white shadow-sm">
                {coverImageUrl ? (
                  <PublicImage
                    src={coverImageUrl}
                    alt={overview?.name ?? "Kisii University"}
                    ratio="card"
                    priority
                    sizes="(min-width: 1024px) 360px, 100vw"
                    className="rounded-md"
                  />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center rounded-md border border-white/10 bg-white/5 px-4 text-center text-sm text-white/60">
                    Cover image has not been published.
                  </div>
                )}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {facts.slice(0, 4).map((fact) => (
                    <div
                      key={fact.label}
                      className="rounded-md border border-white/10 bg-white/[0.04] p-3"
                    >
                      <p className="text-lg font-semibold leading-none">
                        {fact.value}
                      </p>
                      <p className="mt-1 text-xs text-white/60">{fact.label}</p>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1440px] gap-4 lg:grid-cols-2">
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <Target aria-hidden className="h-5 w-5 text-primary" />
              <h2 className="mt-3 text-xl font-semibold text-slate-950">
                Mission
              </h2>
              {overview?.mission ? (
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  {overview.mission}
                </p>
              ) : (
                <EmptyBlock label="Mission" />
              )}
            </article>

            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <Lightbulb aria-hidden className="h-5 w-5 text-primary" />
              <h2 className="mt-3 text-xl font-semibold text-slate-950">
                Vision
              </h2>
              {overview?.vision ? (
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  {overview.vision}
                </p>
              ) : (
                <EmptyBlock label="Vision" />
              )}
            </article>

            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <Scale aria-hidden className="h-5 w-5 text-primary" />
              <h2 className="mt-3 text-xl font-semibold text-slate-950">
                Core Values
              </h2>
              {coreValues.length ? (
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {coreValues.map((value) => (
                    <li
                      key={value}
                      className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"
                    >
                      {value}
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyBlock label="Core values" />
              )}
            </article>

            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <BookOpenCheck aria-hidden className="h-5 w-5 text-primary" />
              <h2 className="mt-3 text-xl font-semibold text-slate-950">
                Philosophy
              </h2>
              <EmptyBlock label="Philosophy" />
            </article>
          </div>
        </section>

        <section className="bg-white px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1440px] gap-3 md:grid-cols-4">
            {[
              {
                title: "History",
                href: "/about/history",
                icon: History,
                body: "Institutional history and published facts.",
              },
              {
                title: "Governance",
                href: "/about/governance",
                icon: ShieldCheck,
                body: "Boards, mandates, and public membership.",
              },
              {
                title: "Management",
                href: "/about/university-management",
                icon: Building2,
                body: "Leadership and management board structure.",
              },
              {
                title: "Quality Assurance",
                href: "/about/quality-assurance",
                icon: BookOpenCheck,
                body: "Quality, planning, and service accountability.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-primary/30"
                >
                  <Icon aria-hidden className="h-5 w-5 text-primary" />
                  <h3 className="mt-3 text-sm font-bold text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-slate-600">
                    {item.body}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      </AboutPageLenis>
    </PageShell>
  );
}
