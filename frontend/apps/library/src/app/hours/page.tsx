import {
  LibraryHero,
  LibraryContentBand,
  LibrarySectionHeading,
  PrimaryLink,
  SecondaryLink,
  SidePanel,
  StatusMessage,
} from "../../components/library-ui";
import {
  formatLabel,
  getLibraryHoursData,
} from "../../lib/library-public-data";

export const metadata = {
  title: "Hours",
  description: "Kisii University Library branch operating hours.",
};

export const dynamic = "force-dynamic";

export default async function LibraryHoursPage() {
  const { branches, groupedHours, errors } = await getLibraryHoursData();
  const publishedCount = groupedHours.reduce(
    (total, item) => total + item.hours.length,
    0,
  );

  return (
    <main id="library-main" className="min-h-screen bg-white">
      <LibraryHero
        eyebrow="Library Hours"
        title="Plan your visit around published branch hours."
        body="Check branch opening times, closures, and notes before visiting a library service point."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Library", href: "/" },
          { label: "Hours" },
        ]}
        actions={
          <>
            <PrimaryLink href="/services">View services</PrimaryLink>
            <SecondaryLink href="/catalog">Search catalog</SecondaryLink>
          </>
        }
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
            Published schedules
          </p>
          <p className="mt-3 text-4xl font-bold sm:text-5xl">{publishedCount}</p>
          <p className="mt-2 text-sm leading-6 text-white/75">
            Hour records across {branches.data.length} public branch
            {branches.data.length === 1 ? "" : "es"}.
          </p>
        </div>
      </LibraryHero>

      {errors.map((error) => (
        <section key={error} className="px-4 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1320px]">
            <StatusMessage tone="error">{error}</StatusMessage>
          </div>
        </section>
      ))}

      <LibraryContentBand>
        <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Today
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            Check the branch schedule below before visiting.
          </p>
        </div>
        <LibrarySectionHeading
          eyebrow="Schedules"
          title="Branch operating hours"
          body="Hours are shown when the library team has published a schedule for the branch."
        />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="grid gap-5 lg:grid-cols-2">
          {groupedHours.length === 0 ? (
            <StatusMessage>No public library branches are available yet.</StatusMessage>
          ) : (
            groupedHours.map(({ branch, hours }) => (
              <article
                key={branch.id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                  {formatLabel(branch.library_type ?? "library")}
                </p>
                <h2 className="mt-3 text-xl font-semibold text-slate-950">
                  {branch.name}
                </h2>
                {hours.length === 0 ? (
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    Hours for this branch are being updated.
                  </p>
                ) : (
                  <dl className="mt-5 divide-y divide-slate-200 text-sm">
                    {hours.map((item) => (
                      <div
                        key={item.id}
                        className="grid gap-2 py-3 sm:grid-cols-[160px_1fr]"
                      >
                        <dt className="font-semibold text-slate-950">
                          {formatLabel(item.day_type)}
                        </dt>
                        <dd className="text-slate-600">
                          {item.is_closed
                            ? "Closed"
                            : `${item.opens_at ?? "Opening time pending"} - ${
                                item.closes_at ?? "Closing time pending"
                              }`}
                          {item.note ? (
                            <span className="block text-xs text-slate-500">
                              {item.note}
                            </span>
                          ) : null}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </article>
            ))
          )}
          </div>
          <SidePanel title="Service points" eyebrow="Hours">
            <div className="divide-y divide-slate-200">
              {branches.data.slice(0, 6).map((branch) => (
                <article key={branch.id} className="py-3 first:pt-0">
                  <p className="text-sm font-semibold text-slate-950">{branch.name}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {branch.address ?? branch.short_name ?? "Location being updated"}
                  </p>
                </article>
              ))}
            </div>
          </SidePanel>
        </div>
      </LibraryContentBand>
    </main>
  );
}
