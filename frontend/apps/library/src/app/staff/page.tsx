import type { LibraryBranch, LibraryStaff } from "@ksu/api-client";
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
      />

      {errors.map((error) => (
        <section key={error} className="px-4 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1320px]">
            <StatusMessage tone="error">{error}</StatusMessage>
          </div>
        </section>
      ))}

      <LibraryContentBand tone="soft">
        <LibrarySectionHeading
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
              <div className="flex flex-col gap-3 text-sm leading-6 text-muted-foreground">
                {groupedStaff.map(({ branch, staff: members }) => (
                  <p key={branch.id} className="flex justify-between gap-4">
                    <span>{branch.name}</span>
                    <span className="font-semibold text-foreground">{members.length}</span>
                  </p>
                ))}
              </div>
            </SidePanel>
          </div>
        )}
      </LibraryContentBand>
    </main>
  );
}

function StaffCard({ member }: { member: PublishedStaff }) {
  return (
    <article className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-md bg-primary/10 text-lg font-bold text-primary">
        {(member.job_title ?? member.role ?? "LS").slice(0, 2).toUpperCase()}
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
        {formatLabel(member.role ?? "library staff")}
      </p>
      <h2 className="mt-3 text-xl font-semibold text-foreground">
        {member.job_title ?? formatLabel(member.role ?? "Library staff")}
      </h2>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">
        {compactText(member.bio) ||
          "Public staff profile details are being updated."}
      </p>
      <dl className="mt-5 grid gap-3 text-sm text-muted-foreground">
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
      <dt className="font-semibold text-foreground">{label}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}
