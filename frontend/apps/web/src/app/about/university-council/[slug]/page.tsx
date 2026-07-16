import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, CheckCircle2, Landmark } from "lucide-react";
import { PublicImage } from "@/components/public/public-image";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { getUniversityCouncilProfile } from "@/lib/about-data";

function detail(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length ? trimmed : null;
}

export default async function UniversityCouncilProfileRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await getUniversityCouncilProfile(slug);

  if (!profile) {
    notFound();
  }

  const facts = [
    ["Council role", profile.role],
    ["Official designation", detail(profile.official_designation)],
    ["Represented institution", detail(profile.represented_institution)],
    ["Current office", detail(profile.current_office)],
    ["Appointment category", detail(profile.appointment_category)],
    ["Ex-officio", profile.is_ex_officio ? "Yes" : null],
    ["Voting member", profile.is_voting_member === false ? "No" : profile.is_voting_member ? "Yes" : null],
  ].filter((item): item is [string, string] => Boolean(item[1]));

  return (
    <PageShell>
      <main className="bg-white">
        <section className="border-b border-border bg-surface-subtle px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <BreadcrumbTrail
              items={[
                { label: "Home", href: "/" },
                { label: "About", href: "/about" },
                { label: "University Council", href: "/about/university-council" },
                { label: profile.name },
              ]}
            />
            <Link
              href="/about/university-council"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <ArrowLeft aria-hidden className="h-4 w-4" />
              Back to University Council
            </Link>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[22rem_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
                <PublicImage
                  src={profile.portrait?.url}
                  alt={profile.portrait?.alt || `${profile.name}, ${profile.role}`}
                  ratio="profile"
                  sizes="(min-width: 1024px) 22rem, 100vw"
                />
                <div className="p-5">
                  <p className="inline-flex rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-primary">
                    {profile.role}
                  </p>
                  <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-foreground">
                    {profile.name}
                  </h1>
                </div>
              </div>
            </aside>

            <div className="min-w-0 space-y-8">
              <article className="rounded-lg border border-border bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                  Council Profile
                </p>
                <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
                  Public profile
                </h2>
                <p className="mt-4 text-base leading-8 text-muted-foreground">
                  {detail(profile.profile_summary) || "Public profile summary is not currently published."}
                </p>
              </article>

              <section className="grid gap-4 sm:grid-cols-2" aria-label="Council member details">
                {facts.map(([label, value]) => (
                  <article key={label} className="rounded-lg border border-border bg-surface-subtle p-5">
                    <div className="flex items-center gap-3">
                      {label.includes("institution") || label.includes("office") ? (
                        <Building2 aria-hidden className="h-5 w-5 text-primary" />
                      ) : label.includes("member") ? (
                        <CheckCircle2 aria-hidden className="h-5 w-5 text-primary" />
                      ) : (
                        <Landmark aria-hidden className="h-5 w-5 text-primary" />
                      )}
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                        {label}
                      </p>
                    </div>
                    <p className="mt-3 text-sm font-semibold leading-6 text-foreground">
                      {value}
                    </p>
                  </article>
                ))}
              </section>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
