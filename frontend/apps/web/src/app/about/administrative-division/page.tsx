import { BreadcrumbTrail, PageHeading, PageShell } from "@/components/site-shell";
import { getAdministrativeDivisions } from "@/lib/about-data";

export default async function AdministrativeDivisionPage() {
  const divisions = await getAdministrativeDivisions();

  return (
    <PageShell>
      <section className="container py-10 md:py-14">
        <BreadcrumbTrail
          items={[
            { label: "Home", href: "/" },
            { label: "About", href: "/about" },
            { label: "Administrative Division" },
          ]}
        />
        <div className="mt-8">
          <PageHeading
            eyebrow="Administrative Division"
            title="Administrative structure should reflect actual divisions and units, not abstract placeholders."
            body="This page summarizes the main administrative divisions and their public-facing units using the same structure seeded into the main service."
          />
        </div>
      </section>

      <section className="container pb-16">
        <div className="grid gap-6 lg:grid-cols-3">
          {divisions.map((division) => (
            <article
              key={division.code}
              className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
                {division.code}
              </p>
              <h2 className="mt-4 text-2xl font-semibold text-slate-950">
                {division.title}
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                {division.description}
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-600">
                {division.units.map((unit) => (
                  <li key={unit}>• {unit}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
