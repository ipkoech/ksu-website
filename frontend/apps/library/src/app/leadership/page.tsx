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
  compactText,
  formatLabel,
  getLibraryLeadershipData,
} from "../../lib/library-public-data";

export const metadata = {
  title: "Leadership",
  description: "Kisii University Library leadership and senior staff.",
};

export const dynamic = "force-dynamic";

export default async function LibraryLeadershipPage() {
  const leadership = await getLibraryLeadershipData();
  const leaders = leadership.data;
  const lead = leaders[0];

  return (
    <main id="library-main" className="min-h-screen bg-white">
      <LibraryHero
        eyebrow="Library Leadership"
        title="Leadership and senior public staff records."
        body="Use this page to identify published leadership and senior library support roles."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Library", href: "/" },
          { label: "Leadership" },
        ]}
        actions={
          <>
            <PrimaryLink href="/staff">View all staff</PrimaryLink>
            <SecondaryLink href="/services">View services</SecondaryLink>
          </>
        }
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
            Leadership records
          </p>
          <p className="mt-3 text-4xl font-bold sm:text-5xl">{leaders.length}</p>
          <p className="mt-2 text-sm leading-6 text-white/75">
            Public senior staff records published for library users.
          </p>
        </div>
      </LibraryHero>

      {leadership.error ? (
        <section className="px-4 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1320px]">
            <StatusMessage tone="error">{leadership.error}</StatusMessage>
          </div>
        </section>
      ) : null}

      <LibraryContentBand>
        <LibrarySectionHeading
          eyebrow="Leadership"
          title="Published leadership records"
          body="Names and photos depend on person records from the main service; library role information appears when public staff records are available."
        />
        {leaders.length === 0 ? (
          <StatusMessage>No public leadership records are available yet.</StatusMessage>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-6">
              {lead ? (
                <article className="rounded-lg border border-primary/25 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-5 sm:flex-row">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md bg-primary text-2xl font-bold text-white">
                      {(lead.job_title ?? lead.role ?? "UL").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                        {formatLabel(lead.role ?? "university librarian")}
                      </p>
                      <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                        {lead.job_title ?? formatLabel(lead.role ?? "Library leader")}
                      </h2>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        {compactText(lead.bio) || "Leadership profile details are being updated."}
                      </p>
                    </div>
                  </div>
                </article>
              ) : null}
              <div className="grid gap-5 md:grid-cols-2">
                {leaders.slice(1).map((member) => (
                  <LeaderCard key={member.id} member={member} />
                ))}
              </div>
            </div>
            <SidePanel title="Office of the University Librarian" eyebrow="Leadership office">
              <dl className="grid gap-3 text-sm text-slate-600">
                <Meta label="Role" value={formatLabel(lead?.role ?? "library leadership")} />
                <Meta label="Department" value={lead?.department} />
                <Meta label="Specialization" value={lead?.specialization} />
              </dl>
            </SidePanel>
          </div>
        )}
      </LibraryContentBand>
    </main>
  );
}

function LeaderCard({ member }: { member: { id: string; role?: string | null; job_title?: string | null; bio?: string | null; department?: string | null; specialization?: string | null } }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
        {formatLabel(member.role ?? "library leadership")}
      </p>
      <h2 className="mt-3 text-xl font-semibold text-slate-950">
        {member.job_title ?? formatLabel(member.role ?? "Leader")}
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        {compactText(member.bio) || "Leadership profile details are being updated."}
      </p>
      <dl className="mt-5 grid gap-3 text-sm text-slate-600">
        <Meta label="Department" value={member.department} />
        <Meta label="Specialization" value={member.specialization} />
      </dl>
    </article>
  );
}

function Meta({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  if (!compactText(value)) return null;
  return (
    <div>
      <dt className="font-semibold text-slate-950">{label}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}
