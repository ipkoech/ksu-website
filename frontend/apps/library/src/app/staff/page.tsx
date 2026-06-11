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
  title: "Staff",
  description: "Kisii University Library public staff directory.",
};

export const dynamic = "force-dynamic";

export default async function LibraryStaffPage() {
  const { groupedStaff, errors } = await getLibraryStaffData();
  const staff = groupedStaff.flatMap(({ branch, staff: members }) =>
    members.map((member) => ({ ...member, branch })),
  );

  return (
    <main id="library-main" className="min-h-screen bg-white">
      <LibraryHero
        eyebrow="Library Staff"
        title="Find public library staff and support specializations."
        body="Browse public staff records by branch, role, department, and specialization."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Library", href: "/" },
          { label: "Staff" },
        ]}
        actions={
          <>
            <PrimaryLink href="/services">View services</PrimaryLink>
            <SecondaryLink href="/leadership">Leadership</SecondaryLink>
          </>
        }
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
            Public staff
          </p>
          <p className="mt-3 text-5xl font-bold">{staff.length}</p>
          <p className="mt-2 text-sm leading-6 text-white/75">
            Active public staff records across branches.
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
        eyebrow="Directory"
        title="Public staff directory"
        body="Staff profile names depend on person records from the main service; library-specific roles and specializations appear here."
        tone="white"
      >
        {staff.length === 0 ? (
          <StatusMessage>No public library staff records are available yet.</StatusMessage>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {staff.map((member) => (
              <StaffCard key={member.id} member={member} />
            ))}
          </div>
        )}
      </LibrarySection>
    </main>
  );
}

function StaffCard({ member }: { member: Record<string, any> }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
        {formatLabel(member.role ?? "library staff")}
      </p>
      <h2 className="mt-3 text-xl font-semibold text-slate-950">
        {member.job_title ?? formatLabel(member.role ?? "Library staff")}
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        {compactText(member.bio) ||
          "Public staff profile details are being updated."}
      </p>
      <dl className="mt-5 grid gap-3 text-sm text-slate-600">
        <Meta label="Branch" value={member.branch?.name} />
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
