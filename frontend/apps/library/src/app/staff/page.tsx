import type { LibraryBranch, LibraryStaff } from "@ksu/api-client";
import {
  LibraryHero,
  MockupBand,
  MockupHeading,
  PrimaryLink,
  SecondaryLink,
  SidePanel,
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

type PublishedStaff = LibraryStaff & {
  branch: LibraryBranch;
};

export default async function LibraryStaffPage() {
  const { groupedStaff, errors } = await getLibraryStaffData();
  const staff: PublishedStaff[] = groupedStaff.flatMap(({ branch, staff: members }) =>
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
          <p className="mt-3 text-4xl font-bold sm:text-5xl">{staff.length}</p>
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

      <MockupBand>
        <form
          action="/staff"
          className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.55)] lg:grid-cols-[minmax(0,1fr)_220px_220px_auto] lg:items-end"
        >
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-900">Search staff</span>
            <input
              name="q"
              type="search"
              placeholder="Name, role, department, specialization"
              className="flex h-11 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-900">Branch</span>
            <select className="flex h-11 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <option>All branches</option>
              {groupedStaff.map(({ branch }) => (
                <option key={branch.id}>{branch.name}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-900">Role</span>
            <select className="flex h-11 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <option>All roles</option>
              {Array.from(new Set(staff.map((member) => formatLabel(member.role)))).filter(Boolean).map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>
          </label>
          <button className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90">
            Search
          </button>
        </form>
      </MockupBand>

      <MockupBand tone="soft">
        <MockupHeading
          eyebrow="Directory"
          title="Public staff directory"
          body="Staff profile names depend on person records from the main service; library-specific roles and specializations appear here."
        />
        {staff.length === 0 ? (
          <StatusMessage>No public library staff records are available yet.</StatusMessage>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {staff.map((member) => (
                <StaffCard key={member.id} member={member} />
              ))}
            </div>
            <SidePanel title="Directory groups" eyebrow="Staff">
              <div className="space-y-3 text-sm leading-6 text-slate-600">
                {groupedStaff.map(({ branch, staff: members }) => (
                  <p key={branch.id} className="flex justify-between gap-4">
                    <span>{branch.name}</span>
                    <span className="font-semibold text-slate-950">{members.length}</span>
                  </p>
                ))}
              </div>
            </SidePanel>
          </div>
        )}
      </MockupBand>
    </main>
  );
}

function StaffCard({ member }: { member: PublishedStaff }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-md bg-primary/10 text-lg font-bold text-primary">
        {(member.job_title ?? member.role ?? "LS").slice(0, 2).toUpperCase()}
      </div>
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
