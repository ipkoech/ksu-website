"use client";

import { useQuery } from "@tanstack/react-query";
import {
  schoolPortalApi,
  schoolPortalQueryKeys,
  type SchoolTeamRole,
} from "@ksu/api-client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ksu/ui/components";
import { useSchoolPortal } from "@/components/schools/school-portal-provider";

export function SchoolDepartmentSelect({
  value,
  onChange,
  allowSchoolWide = true,
  disabled,
  triggerId,
}: {
  value?: string | null;
  onChange: (value: string | null) => void;
  allowSchoolWide?: boolean;
  disabled?: boolean;
  triggerId?: string;
}) {
  const { school } = useSchoolPortal();
  const departments = useQuery({
    queryKey: [...schoolPortalQueryKeys.departments(school.id), { purpose: "reference-selector" }],
    queryFn: () => schoolPortalApi.departments.list({ page: 1, per_page: 100, is_active: true }),
    staleTime: 5 * 60 * 1000,
  });
  const fallback = allowSchoolWide ? "school-wide" : "";

  return (
    <Select
      value={value || fallback}
      disabled={disabled}
      onValueChange={(next) => onChange(next === "school-wide" ? null : next)}
    >
      <SelectTrigger id={triggerId}><SelectValue placeholder={departments.isPending ? "Loading departments…" : "Select department"} /></SelectTrigger>
      <SelectContent>
        {allowSchoolWide ? <SelectItem value="school-wide">School-wide</SelectItem> : null}
        {departments.data?.data.map((department) => (
          <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function SchoolTeamSelect({
  value,
  onChange,
  valueMode,
  placeholder,
  roles,
  allowUnassigned = true,
  disabled,
  triggerId,
}: {
  value?: string | null;
  onChange: (value: string | null) => void;
  valueMode: "person" | "user";
  placeholder: string;
  roles?: SchoolTeamRole[];
  allowUnassigned?: boolean;
  disabled?: boolean;
  triggerId?: string;
}) {
  const { school } = useSchoolPortal();
  const team = useQuery({
    queryKey: [...schoolPortalQueryKeys.team(school.id), { purpose: "reference-selector" }],
    queryFn: () => schoolPortalApi.team.list({ page: 1, per_page: 100, status: "active" }),
    staleTime: 5 * 60 * 1000,
  });
  const options = (team.data?.data ?? []).filter((member) => {
    const reference = valueMode === "person" ? member.person_id : member.user_id;
    return Boolean(reference) && (!roles || roles.includes(member.role));
  });

  return (
    <Select
      value={value || (allowUnassigned ? "unassigned" : "")}
      disabled={disabled}
      onValueChange={(next) => onChange(next === "unassigned" ? null : next)}
    >
      <SelectTrigger id={triggerId}>
        <SelectValue placeholder={team.isPending ? "Loading school team…" : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allowUnassigned ? <SelectItem value="unassigned">Unassigned</SelectItem> : null}
        {options.map((member) => (
          <SelectItem
            key={member.id}
            value={(valueMode === "person" ? member.person_id : member.user_id)!}
          >
            {member.full_name || member.email || "Unnamed team member"} · {member.role.replaceAll("_", " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
