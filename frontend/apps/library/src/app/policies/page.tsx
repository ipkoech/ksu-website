import {
  CompactRecord,
  LibraryContentBand,
  LibraryHero,
  LibrarySectionHeading,
  PrimaryLink,
  SearchPanel,
  SecondaryLink,
  SidePanel,
  StatusMessage,
} from "../../components/library-ui";
import {
  compactText,
  formatLabel,
  getLibraryPoliciesData,
  shortText,
} from "../../lib/library-public-data";

export const metadata = {
  title: "Library Policies",
  description: "Accessibility, copyright, privacy, acceptable use, and conduct policies.",
};

export const dynamic = "force-dynamic";

const policyTypes = [
  "accessibility",
  "copyright",
  "privacy",
  "acceptable_use",
  "conduct",
];

type PoliciesPageProps = {
  searchParams?: Promise<{
    type?: string;
  }>;
};

export default async function LibraryPoliciesPage({ searchParams }: PoliciesPageProps) {
  const params = (await searchParams) ?? {};
  const { policies, policyType, errors } = await getLibraryPoliciesData({
    policyType: params.type,
  });

  return (
    <main id="library-main" className="min-h-screen bg-white">
      <LibraryHero
        eyebrow="Policies"
        title="Library policies for access, use, privacy, and conduct."
        body="Review published library policy pages for accessibility, copyright, privacy, acceptable use, conduct, and related user responsibilities."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Library", href: "/" },
          { label: "Policies" },
        ]}
        actions={
          <>
            <PrimaryLink href="/services">Library services</PrimaryLink>
            <SecondaryLink href="/ask">Ask a librarian</SecondaryLink>
          </>
        }
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
            Active policies
          </p>
          <p className="mt-3 text-4xl font-bold sm:text-5xl">{policies.data.length}</p>
          <p className="mt-2 text-sm leading-6 text-white/75">
            Filter by public policy type.
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
        <SearchPanel>
          <form action="/policies" className="grid gap-4 sm:grid-cols-[260px_auto] sm:items-end">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-900">Policy type</span>
              <select
                name="type"
                defaultValue={policyType}
                className="flex h-11 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">All policy types</option>
                {policyTypes.map((type) => (
                  <option key={type} value={type}>
                    {formatLabel(type)}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
            >
              Filter
            </button>
          </form>
        </SearchPanel>
      </LibraryContentBand>

      <LibraryContentBand tone="soft">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <LibrarySectionHeading
              eyebrow="Policy Library"
              title="Published policy pages"
              body={`${policies.data.length} active polic${policies.data.length === 1 ? "y" : "ies"} matched the current filter.`}
            />
            {policies.data.length === 0 ? (
              <StatusMessage>No public policies are available for this filter yet.</StatusMessage>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {policies.data.map((policy) => (
                  <CompactRecord
                    key={policy.id}
                    icon="shield"
                    eyebrow={formatLabel(policy.policy_type)}
                    title={policy.title}
                    body={shortText(policy.content, "Policy content is being updated.")}
                    meta={[formatLabel(policy.status), policy.is_public ? "Public" : null]}
                    href={`/policies/${policy.slug}`}
                    action="Read policy"
                  />
                ))}
              </div>
            )}
          </div>
          <SidePanel title="Policy types" eyebrow="Scope">
            <div className="flex flex-wrap gap-2">
              {policyTypes.map((type) => (
                <span
                  key={type}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                >
                  {compactText(formatLabel(type))}
                </span>
              ))}
            </div>
          </SidePanel>
        </div>
      </LibraryContentBand>
    </main>
  );
}
