import type { StaffAssignment } from "@ksu/api-client";
import { resolvePublicMediaUrl } from "@/lib/public-media";
import { Mail, Network } from "lucide-react";

type OrganogramProps = {
  assignments: StaffAssignment[];
  title?: string;
  description?: string;
};

type AssignmentGroup = {
  level: number;
  label: string;
  assignments: StaffAssignment[];
};

const hierarchyLabels: Record<number, string> = {
  1: "Governing lead",
  2: "University leadership",
  3: "Deputy leadership",
  4: "Registrar or officer",
  5: "Dean or director",
  6: "Deputy leadership",
  7: "Head",
  8: "Coordinator",
  9: "Senior staff",
  10: "Staff",
  11: "Assistant staff",
};

function present(value?: string | number | null) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

function initialsFromName(name: string) {
  const parts = name
    .split(/\s+/)
    .map((part) => part.replace(/[^A-Za-z]/g, ""))
    .filter(Boolean)
    .filter(
      (part) =>
        !new Set(["dr", "prof", "mr", "mrs", "ms", "rev", "eng"]).has(
          part.toLowerCase(),
        ),
    );

  if (!parts.length) return "S";

  const selected = parts.length === 1 ? [parts[0]] : [parts[0], parts.at(-1)!];
  return selected.map((part) => part[0]).join("").toUpperCase();
}

function personDisplayName(assignment: StaffAssignment) {
  const person = assignment.person;
  const fullName = present(person?.full_name);
  if (fullName) return fullName;

  const personName = [
    person?.title,
    person?.first_name,
    person?.middle_name,
    person?.last_name,
  ]
    .map((value) => present(value))
    .filter(Boolean)
    .join(" ");

  return personName || "Staff record";
}

function roleDisplay(assignment: StaffAssignment) {
  return (
    present(assignment.role_display) ??
    present(assignment.title) ??
    present(assignment.role?.replace(/_/g, " ")) ??
    "Staff assignment"
  );
}

function photoSource(assignment: StaffAssignment) {
  const photoUrl = present(assignment.person?.photo_url);
  return resolvePublicMediaUrl(photoUrl);
}

function formatDate(value?: string | null) {
  const text = present(value);
  if (!text) return null;

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function assignmentSort(first: StaffAssignment, second: StaffAssignment) {
  return (
    Number(first.hierarchy_level ?? 99) - Number(second.hierarchy_level ?? 99) ||
    Number(first.display_order ?? 100) - Number(second.display_order ?? 100) ||
    personDisplayName(first).localeCompare(personDisplayName(second))
  );
}

function groupAssignments(assignments: StaffAssignment[]): AssignmentGroup[] {
  const visible = assignments
    .filter((assignment) => assignment.is_public !== false)
    .filter((assignment) => !["ended", "inactive"].includes(assignment.status))
    .slice()
    .sort(assignmentSort);
  const groups = new Map<number, StaffAssignment[]>();

  for (const assignment of visible) {
    const level = Number(assignment.hierarchy_level ?? 10);
    groups.set(level, [...(groups.get(level) ?? []), assignment]);
  }

  return Array.from(groups.entries())
    .sort(([first], [second]) => first - second)
    .map(([level, levelAssignments]) => ({
      level,
      label: hierarchyLabels[level] ?? `Level ${level}`,
      assignments: levelAssignments,
    }));
}

function SectionKicker({ children }: { children: string }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
      {children}
    </p>
  );
}

function Avatar({ assignment }: { assignment: StaffAssignment }) {
  const name = personDisplayName(assignment);
  const image = photoSource(assignment);

  if (image) {
    return <img src={image} alt={name} className="h-full w-full object-cover" />;
  }

  return (
    <span className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#dbeafe,#eef4ff_56%,#fff7ed)] font-[family-name:var(--font-display)] text-xl font-semibold text-primary">
      {initialsFromName(name)}
    </span>
  );
}

function AssignmentCard({
  assignment,
  reportsTo,
  directReports,
}: {
  assignment: StaffAssignment;
  reportsTo?: StaffAssignment;
  directReports: number;
}) {
  const name = personDisplayName(assignment);
  const email = present(assignment.person?.email);
  const level = Number(assignment.hierarchy_level ?? 10);
  const term =
    assignment.show_term_dates && (assignment.start_date || assignment.end_date)
      ? [formatDate(assignment.start_date), formatDate(assignment.end_date)]
          .filter(Boolean)
          .join(" to ")
      : null;

  return (
    <article className="min-w-0 rounded-[1.1rem] border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex min-w-0 gap-3">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
          <Avatar assignment={assignment} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-slate-950">{name}</h3>
          <p className="mt-1 line-clamp-2 text-xs font-semibold capitalize leading-5 text-primary">
            {roleDisplay(assignment)}
          </p>
          {email ? (
            <a
              href={`mailto:${email}`}
              className="mt-1 inline-flex max-w-full items-center gap-1 text-xs font-semibold text-slate-600 transition hover:text-primary"
            >
              <Mail aria-hidden className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{email}</span>
            </a>
          ) : null}
        </div>
      </div>

      <dl className="mt-3 grid gap-2 border-t border-slate-100 pt-3 text-xs">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <dt className="font-semibold text-slate-500">Hierarchy</dt>
          <dd className="rounded-full bg-primary/[0.08] px-2 py-1 font-bold text-primary">
            Level {level}
          </dd>
        </div>
        {reportsTo ? (
          <div className="min-w-0">
            <dt className="font-semibold text-slate-500">Reports to</dt>
            <dd className="mt-0.5 truncate font-semibold text-slate-700">
              {personDisplayName(reportsTo)}
            </dd>
          </div>
        ) : null}
        <div className="flex min-w-0 flex-wrap gap-1.5">
          {assignment.is_acting ? (
            <span className="rounded-full bg-orange-50 px-2 py-1 font-bold text-orange-700">
              Acting
            </span>
          ) : null}
          {assignment.is_primary ? (
            <span className="rounded-full bg-slate-100 px-2 py-1 font-bold text-slate-700">
              Primary
            </span>
          ) : null}
          {directReports ? (
            <span className="rounded-full bg-slate-100 px-2 py-1 font-bold text-slate-700">
              {directReports} direct report{directReports === 1 ? "" : "s"}
            </span>
          ) : null}
          {term ? (
            <span className="rounded-full bg-slate-100 px-2 py-1 font-bold text-slate-700">
              {term}
            </span>
          ) : null}
        </div>
      </dl>
    </article>
  );
}

export function Organogram({
  assignments,
  title = "Organogram",
  description = "Public assignments are grouped by the public hierarchy level and reporting lines.",
}: OrganogramProps) {
  const groups = groupAssignments(assignments);
  const assignmentById = new Map(
    assignments.map((assignment) => [assignment.id, assignment]),
  );
  const directReportCounts = new Map<string, number>();

  for (const assignment of assignments) {
    if (!assignment.reports_to_id) continue;
    directReportCounts.set(
      assignment.reports_to_id,
      (directReportCounts.get(assignment.reports_to_id) ?? 0) + 1,
    );
  }

  if (!groups.length) return null;

  return (
    <section className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <SectionKicker>{title}</SectionKicker>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-xl bg-primary/[0.08] px-3 py-2 text-xs font-bold text-primary">
          <Network aria-hidden className="h-4 w-4" />
          {assignments.length} assignment{assignments.length === 1 ? "" : "s"}
        </div>
      </div>

      <ol className="mt-4 space-y-4">
        {groups.map((group, groupIndex) => (
          <li
            key={group.level}
            className="relative grid gap-3 lg:grid-cols-[9.5rem_minmax(0,1fr)]"
          >
            {groupIndex > 0 ? (
              <span
                aria-hidden
                className="absolute -top-4 left-5 hidden h-4 border-l border-slate-200 lg:block"
              />
            ) : null}
            <div className="flex items-start gap-2 lg:block">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
                {group.level}
              </span>
              <div className="min-w-0 lg:mt-2">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                  Level {group.level}
                </p>
                <p className="mt-1 text-sm font-bold text-slate-950">
                  {group.label}
                </p>
              </div>
            </div>
            <div className="grid min-w-0 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
              {group.assignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  reportsTo={
                    assignment.reports_to_id
                      ? assignmentById.get(assignment.reports_to_id)
                      : undefined
                  }
                  directReports={directReportCounts.get(assignment.id) ?? 0}
                />
              ))}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
