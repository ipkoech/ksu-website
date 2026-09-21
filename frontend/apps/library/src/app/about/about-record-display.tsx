"use client";

import Link from "next/link";
import Image from "next/image";
import { resolveMainMediaUrl } from "@ksu/api-client/media";
import { ArrowRight, Mail, Users } from "lucide-react";
import type { LibraryBranch, LibraryStaff } from "@ksu/api-client";
import { EditorialSection } from "../../components/library-page-sections";
import { StatusMessage } from "../../components/library-ui";

export type LibraryStaffGroup = {
  branch: LibraryBranch;
  staff: LibraryStaff[];
};

export function AboutRecordDisplay({
  branches,
  leaders,
  staffGroups,
}: {
  branches: LibraryBranch[];
  leaders: LibraryStaff[];
  staffGroups: LibraryStaffGroup[];
}) {
  return (
    <div data-server-data-display="library-about-records">
      <div id="leadership" className="scroll-mt-24">
        <EditorialSection
          eyebrow="Leadership"
          title="People who support your academic journey"
          body="Meet the library leadership who guide services for students, researchers, and staff."
          tone="soft"
        >
          {leaders[0] ? (
            <LeadershipFeature member={leaders[0]} />
          ) : (
            <StatusMessage>No public library leadership records are available yet.</StatusMessage>
          )}
          {leaders.length > 1 ? (
            <div className="mt-10 grid gap-x-8 divide-y divide-border sm:grid-cols-2 sm:divide-y-0">
              {leaders.slice(1).map((member) => <StaffRow key={member.id} member={member} />)}
            </div>
          ) : null}
        </EditorialSection>
      </div>

      <div id="staff" className="scroll-mt-24">
        <EditorialSection title="Library team by branch" body="Public library staff records grouped by the branch where they are based.">
          {staffGroups.length === 0 ? (
            <StatusMessage>No public library staff records are available yet.</StatusMessage>
          ) : (
            <div className="grid gap-10">
              {staffGroups.map((group) => (
                <div key={group.branch.id}>
                  <h3 className="text-xl font-semibold text-foreground">{group.branch.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{formatLabel(group.branch.library_type ?? "library")}</p>
                  <div className="mt-4 grid gap-x-8 divide-y divide-border sm:grid-cols-2 sm:divide-y-0 xl:grid-cols-3">
                    {group.staff.map((member) => <StaffRow key={member.id} member={member} />)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </EditorialSection>
      </div>

      <EditorialSection title="Access points across the University" body="Each public branch record is maintained by the library team and reused across the catalog, services, and contact journeys.">
        <div className="divide-y divide-border border-y border-border">
          {branches.length === 0 ? (
            <StatusMessage>No public library branches are available yet.</StatusMessage>
          ) : (
            branches.map((branch) => (
              <div key={branch.id} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{branch.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{branch.address ?? branch.location ?? "Location being updated"}</p>
                </div>
                <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary">Contact this branch <ArrowRight aria-hidden className="h-4 w-4" /></Link>
              </div>
            ))
          )}
        </div>
      </EditorialSection>
    </div>
  );
}

function LeadershipFeature({ member }: { member: LibraryStaff }) {
  return (
    <div className="grid gap-8 border-b border-border pb-10 lg:grid-cols-[220px_1fr] lg:items-center">
      <StaffPhoto member={member} large />
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">Library leadership</p>
        <h3 className="mt-3 text-3xl font-semibold text-foreground">{member.person?.full_name ?? "Library leader"}</h3>
        <p className="mt-2 text-base font-medium text-primary">{member.job_title ?? member.role ?? "Library leadership"}</p>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">{compactText(member.bio) || compactText(member.specialization) || "Leadership information is maintained by the library team."}</p>
        {member.person?.email ? <a href={`mailto:${member.person.email}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary"><Mail aria-hidden className="h-4 w-4" />{member.person.email}</a> : null}
      </div>
    </div>
  );
}

function StaffRow({ member }: { member: LibraryStaff }) {
  return <div className="flex gap-3 border-b border-border py-4 last:border-b-0"><StaffPhoto member={member} /><div><p className="font-semibold text-foreground">{member.person?.full_name ?? "Library staff member"}</p><p className="mt-1 text-sm text-muted-foreground">{member.job_title ?? member.role ?? member.department ?? "Library team"}</p></div></div>;
}

function StaffPhoto({ member, large = false }: { member: LibraryStaff; large?: boolean }) {
  const src = resolveMainMediaUrl(member.person?.photo_url ?? member.person?.photo);
  return <span className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-primary/10 text-primary ${large ? "h-52 w-52" : "h-9 w-9"}`}>
    {src ? <Image src={src} alt={member.person?.full_name ?? "Library staff member"} fill sizes={large ? "208px" : "36px"} className="object-cover" unoptimized /> : <Users aria-hidden className={large ? "h-16 w-16" : "h-4 w-4"} />}
  </span>;
}

function compactText(value?: string | number | null) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function formatLabel(value?: string | null) {
  return compactText(value).replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
