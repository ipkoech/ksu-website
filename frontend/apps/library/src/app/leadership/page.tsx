import {
  LibraryHero,
  LibrarySection,
  PrimaryLink,
  SecondaryLink,
  StatusMessage,
} from "../../components/library-ui";
import {
  compactText,
  formatLabel,
  getLibraryStaffData,
} from "../../lib/library-public-data";

export const metadata = {
  title: "Leadership",
  description: "Kisii University Library leadership and senior staff.",
};

export const dynamic = "force-dynamic";

const leadershipRoles = new Set([
  "chief_librarian",
  "senior_librarian",
  "librarian",
]);

export default async function LibraryLeadershipPage() {
  const { groupedStaff, errors } = await getLibraryStaffData();
  const leaders = groupedStaff
    .flatMap(({ branch, staff }) => staff.map((member) => ({ ...member, branch })))
    .filter((member) => leadershipRoles.has(String(member.role ?? "")));

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
          <p className="mt-3 text-5xl font-bold">{leaders.length}</p>
          <p className="mt-2 text-sm leading-6 text-white/75">
            Public senior staff records returned by the Library API.
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

      <LibrarySection
        eyebrow="Leadership"
        title="Published leadership records"
        body="Names and photos depend on person records from the main service; library role information appears when public staff records are available."
        tone="white"
      >
        {leaders.length === 0 ? (
          <StatusMessage>No public leadership records are available yet.</StatusMessage>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {leaders.map((member) => (
              <article
                key={member.id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                  {formatLabel(member.role ?? "library leadership")}
                </p>
                <h2 className="mt-3 text-xl font-semibold text-slate-950">
                  {member.job_title ?? formatLabel(member.role ?? "Leader")}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {compactText(member.bio) ||
                    "Leadership profile details are being updated."}
                </p>
                <dl className="mt-5 grid gap-3 text-sm text-slate-600">
                  <Meta label="Branch" value={member.branch?.name} />
                  <Meta label="Department" value={member.department} />
                  <Meta label="Specialization" value={member.specialization} />
                </dl>
              </article>
            ))}
          </div>
        )}
      </LibrarySection>
    </main>
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
