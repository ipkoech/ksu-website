"use client";

import { useEffect, useMemo, useState } from "react";
import { useMyProfile, useUpdateMyProfile } from "@ksu/api-client";
import type { MyProfile, MyProfileUpdatePayload } from "@ksu/api-client";
import {
  Alert,
  AlertDescription,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Input,
  Label,
  Skeleton,
  Switch,
  Textarea,
} from "@ksu/ui/components";
import { toast } from "@ksu/ui";
import { cn } from "@ksu/ui/lib";
import { Plus, Save, Trash2 } from "lucide-react";
import { MediaPicker } from "@/components/media/media-picker";

type QualificationRow = {
  id: string;
  degree: string;
  field: string;
  institution: string;
  year: string;
};

type OfficeHourRow = {
  id: string;
  day: string;
  hours: string;
};

type ProfileRecordRow = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  year: string;
};

type ProfileFormValues = {
  title: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  alternative_email: string;
  alternative_phone: string;
  bio: string;
  full_bio: string;
  qualifications: QualificationRow[];
  specialization: string;
  research_interests: string;
  teaching_areas: string;
  office_location: string;
  office_hours: OfficeHourRow[];
  office_phone: string;
  courses_taught: string;
  website_url: string;
  linkedin_url: string;
  google_scholar_id: string;
  google_scholar_url: string;
  orcid: string;
  researchgate_url: string;
  scopus_id: string;
  education_background: ProfileRecordRow[];
  professional_memberships: ProfileRecordRow[];
  awards_honors: ProfileRecordRow[];
  is_researcher: boolean;
  photo_id: string;
  cv_file_id: string;
};

const emptyValues: ProfileFormValues = {
  title: "",
  first_name: "",
  middle_name: "",
  last_name: "",
  full_name: "",
  email: "",
  phone: "",
  alternative_email: "",
  alternative_phone: "",
  bio: "",
  full_bio: "",
  qualifications: [],
  specialization: "",
  research_interests: "",
  teaching_areas: "",
  office_location: "",
  office_hours: [],
  office_phone: "",
  courses_taught: "",
  website_url: "",
  linkedin_url: "",
  google_scholar_id: "",
  google_scholar_url: "",
  orcid: "",
  researchgate_url: "",
  scopus_id: "",
  education_background: [],
  professional_memberships: [],
  awards_honors: [],
  is_researcher: false,
  photo_id: "",
  cv_file_id: "",
};

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function nullable(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function lines(value: string) {
  const items = value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length ? items : null;
}

let rowId = 0;

function nextRowId() {
  rowId += 1;
  return `profile-row-${rowId}`;
}

function valueText(value: unknown) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function toObjectRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function isFilled(values: string[]) {
  return values.some((value) => value.trim().length > 0);
}

function qualificationRows(value: MyProfile["qualifications"]): QualificationRow[] {
  return (value ?? []).map((item) => ({
    id: nextRowId(),
    degree: valueText(item.degree),
    field: valueText(item.field),
    institution: valueText(item.institution),
    year: valueText(item.year),
  }));
}

function officeHourRows(value: MyProfile["office_hours"]): OfficeHourRow[] {
  const source = toObjectRecord(value);
  return Object.entries(source).map(([day, hours]) => ({
    id: nextRowId(),
    day,
    hours: valueText(hours),
  }));
}

function profileRecordRows(value: Record<string, unknown>[] | null | undefined): ProfileRecordRow[] {
  return (value ?? []).map((item) => {
    const record = toObjectRecord(item);
    return {
      id: nextRowId(),
      title: valueText(record.title ?? record.name ?? record.degree ?? record.award ?? record.membership),
      subtitle: valueText(record.subtitle ?? record.institution ?? record.organization ?? record.body),
      description: valueText(record.description ?? record.detail ?? record.details ?? record.notes),
      year: valueText(record.year ?? record.date),
    };
  });
}

function qualificationPayload(rows: QualificationRow[]) {
  const items = rows
    .filter((row) => isFilled([row.degree, row.field, row.institution, row.year]))
    .map((row) => {
      if (!row.degree.trim() || !row.institution.trim()) {
        throw new Error("Each qualification needs at least a degree and institution.");
      }

      return {
        degree: row.degree.trim(),
        field: nullable(row.field),
        institution: row.institution.trim(),
        year: nullable(row.year),
      };
    });

  return items.length ? items : null;
}

function officeHoursPayload(rows: OfficeHourRow[]) {
  const entries = rows
    .filter((row) => isFilled([row.day, row.hours]))
    .map((row) => {
      if (!row.day.trim() || !row.hours.trim()) {
        throw new Error("Each office-hour row needs both a day and hours.");
      }

      return [row.day.trim(), row.hours.trim()] as const;
    });

  return entries.length ? Object.fromEntries(entries) : null;
}

function profileRecordPayload(label: string, rows: ProfileRecordRow[]) {
  const items = rows
    .filter((row) => isFilled([row.title, row.subtitle, row.description, row.year]))
    .map((row) => {
      if (!row.title.trim()) {
        throw new Error(`Each ${label} row needs a title.`);
      }

      return {
        title: row.title.trim(),
        subtitle: nullable(row.subtitle),
        description: nullable(row.description),
        year: nullable(row.year),
      };
    });

  return items.length ? items : null;
}

function valuesFromProfile(profile: MyProfile): ProfileFormValues {
  return {
    title: text(profile.title),
    first_name: text(profile.first_name),
    middle_name: text(profile.middle_name),
    last_name: text(profile.last_name),
    full_name: text(profile.full_name),
    email: text(profile.email),
    phone: text(profile.phone),
    alternative_email: text(profile.alternative_email),
    alternative_phone: text(profile.alternative_phone),
    bio: text(profile.bio),
    full_bio: text(profile.full_bio),
    qualifications: qualificationRows(profile.qualifications),
    specialization: text(profile.specialization),
    research_interests: (profile.research_interests ?? []).join("\n"),
    teaching_areas: (profile.teaching_areas ?? []).join("\n"),
    office_location: text(profile.office_location),
    office_hours: officeHourRows(profile.office_hours),
    office_phone: text(profile.office_phone),
    courses_taught: (profile.courses_taught ?? []).join("\n"),
    website_url: text(profile.website_url),
    linkedin_url: text(profile.linkedin_url),
    google_scholar_id: text(profile.google_scholar_id),
    google_scholar_url: text(profile.google_scholar_url),
    orcid: text(profile.orcid),
    researchgate_url: text(profile.researchgate_url),
    scopus_id: text(profile.scopus_id),
    education_background: profileRecordRows(profile.education_background),
    professional_memberships: profileRecordRows(profile.professional_memberships),
    awards_honors: profileRecordRows(profile.awards_honors),
    is_researcher: Boolean(profile.is_researcher),
    photo_id: text(profile.photo_id),
    cv_file_id: text(profile.cv_file_id),
  };
}

function payloadFromValues(values: ProfileFormValues): MyProfileUpdatePayload {
  return {
    title: nullable(values.title),
    first_name: values.first_name.trim(),
    middle_name: nullable(values.middle_name),
    last_name: values.last_name.trim(),
    full_name: values.full_name.trim(),
    email: values.email.trim(),
    phone: nullable(values.phone),
    alternative_email: nullable(values.alternative_email),
    alternative_phone: nullable(values.alternative_phone),
    bio: nullable(values.bio),
    full_bio: nullable(values.full_bio),
    qualifications: qualificationPayload(values.qualifications),
    specialization: nullable(values.specialization),
    research_interests: lines(values.research_interests),
    teaching_areas: lines(values.teaching_areas),
    office_location: nullable(values.office_location),
    office_hours: officeHoursPayload(values.office_hours),
    office_phone: nullable(values.office_phone),
    courses_taught: lines(values.courses_taught),
    website_url: nullable(values.website_url),
    linkedin_url: nullable(values.linkedin_url),
    google_scholar_id: nullable(values.google_scholar_id),
    google_scholar_url: nullable(values.google_scholar_url),
    orcid: nullable(values.orcid),
    researchgate_url: nullable(values.researchgate_url),
    scopus_id: nullable(values.scopus_id),
    education_background: profileRecordPayload("education background", values.education_background),
    professional_memberships: profileRecordPayload("professional membership", values.professional_memberships),
    awards_honors: profileRecordPayload("award or honor", values.awards_honors),
    is_researcher: values.is_researcher,
    photo_id: nullable(values.photo_id),
    cv_file_id: nullable(values.cv_file_id),
  };
}

export function ProfileForm() {
  const profileQuery = useMyProfile();
  const updateProfile = useUpdateMyProfile();
  const profile = profileQuery.data?.data;
  const [values, setValues] = useState<ProfileFormValues>(emptyValues);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setValues(valuesFromProfile(profile));
    }
  }, [profile]);

  const initials = useMemo(() => {
    const source = values.full_name || `${values.first_name} ${values.last_name}`;
    return source
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [values.first_name, values.full_name, values.last_name]);

  const setField = <K extends keyof ProfileFormValues>(key: K, value: ProfileFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const addQualification = () => {
    setField("qualifications", [
      ...values.qualifications,
      { id: nextRowId(), degree: "", field: "", institution: "", year: "" },
    ]);
  };

  const updateQualification = (index: number, patch: Partial<QualificationRow>) => {
    setField(
      "qualifications",
      values.qualifications.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)),
    );
  };

  const removeQualification = (index: number) => {
    setField(
      "qualifications",
      values.qualifications.filter((_, rowIndex) => rowIndex !== index),
    );
  };

  const addOfficeHour = () => {
    setField("office_hours", [...values.office_hours, { id: nextRowId(), day: "", hours: "" }]);
  };

  const updateOfficeHour = (index: number, patch: Partial<OfficeHourRow>) => {
    setField(
      "office_hours",
      values.office_hours.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)),
    );
  };

  const removeOfficeHour = (index: number) => {
    setField(
      "office_hours",
      values.office_hours.filter((_, rowIndex) => rowIndex !== index),
    );
  };

  const addProfileRecord = (field: "education_background" | "professional_memberships" | "awards_honors") => {
    setField(field, [
      ...values[field],
      { id: nextRowId(), title: "", subtitle: "", description: "", year: "" },
    ]);
  };

  const updateProfileRecord = (
    field: "education_background" | "professional_memberships" | "awards_honors",
    index: number,
    patch: Partial<ProfileRecordRow>,
  ) => {
    setField(
      field,
      values[field].map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)),
    );
  };

  const removeProfileRecord = (
    field: "education_background" | "professional_memberships" | "awards_honors",
    index: number,
  ) => {
    setField(
      field,
      values[field].filter((_, rowIndex) => rowIndex !== index),
    );
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      const response = await updateProfile.mutateAsync(payloadFromValues(values));
      setValues(valuesFromProfile(response.data));
      toast.success("Profile updated");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Profile update failed";
      setError(message);
      toast.error(message);
    }
  }

  if (profileQuery.isLoading) {
    return <ProfileLoading />;
  }

  if (profileQuery.isError) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <Alert variant="destructive">
          <AlertDescription>
            {profileQuery.error instanceof Error
              ? profileQuery.error.message
              : "Unable to load your staff profile."}
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage src={profile?.photo_url} />
              <AvatarFallback>{initials || "ST"}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-semibold tracking-normal">Profile settings</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Changes are published to the public website after saving.
              </p>
            </div>
          </div>
          <Button type="submit" disabled={updateProfile.isPending}>
            <Save data-icon="inline-start" />
            {updateProfile.isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Section title="Basic Details">
          <Field label="Title">
            <Input value={values.title} onChange={(event) => setField("title", event.target.value)} />
          </Field>
          <Field label="First name">
            <Input required value={values.first_name} onChange={(event) => setField("first_name", event.target.value)} />
          </Field>
          <Field label="Middle name">
            <Input value={values.middle_name} onChange={(event) => setField("middle_name", event.target.value)} />
          </Field>
          <Field label="Last name">
            <Input required value={values.last_name} onChange={(event) => setField("last_name", event.target.value)} />
          </Field>
          <Field label="Full name" className="md:col-span-2">
            <Input required value={values.full_name} onChange={(event) => setField("full_name", event.target.value)} />
          </Field>
        </Section>

        <Section title="Contact">
          <Field label="Email">
            <Input type="email" required value={values.email} onChange={(event) => setField("email", event.target.value)} />
          </Field>
          <Field label="Phone">
            <Input value={values.phone} onChange={(event) => setField("phone", event.target.value)} />
          </Field>
          <Field label="Alternative email">
            <Input type="email" value={values.alternative_email} onChange={(event) => setField("alternative_email", event.target.value)} />
          </Field>
          <Field label="Alternative phone">
            <Input value={values.alternative_phone} onChange={(event) => setField("alternative_phone", event.target.value)} />
          </Field>
        </Section>

        <Section title="Biography">
          <Field label="Short bio" className="md:col-span-2">
            <Textarea rows={4} value={values.bio} onChange={(event) => setField("bio", event.target.value)} />
          </Field>
          <Field label="Full bio" className="md:col-span-2">
            <Textarea rows={8} value={values.full_bio} onChange={(event) => setField("full_bio", event.target.value)} />
          </Field>
        </Section>

        <Section title="Academic Profile">
          <QualificationEditor
            rows={values.qualifications}
            onAdd={addQualification}
            onRemove={removeQualification}
            onUpdate={updateQualification}
          />
          <Field label="Specialization" className="md:col-span-2">
            <Textarea rows={3} value={values.specialization} onChange={(event) => setField("specialization", event.target.value)} />
          </Field>
          <Field label="Teaching areas">
            <Textarea rows={5} value={values.teaching_areas} onChange={(event) => setField("teaching_areas", event.target.value)} />
          </Field>
          <Field label="Courses taught">
            <Textarea rows={5} value={values.courses_taught} onChange={(event) => setField("courses_taught", event.target.value)} />
          </Field>
        </Section>

        <Section title="Office">
          <Field label="Office location">
            <Input value={values.office_location} onChange={(event) => setField("office_location", event.target.value)} />
          </Field>
          <Field label="Office phone">
            <Input value={values.office_phone} onChange={(event) => setField("office_phone", event.target.value)} />
          </Field>
          <OfficeHoursEditor
            rows={values.office_hours}
            onAdd={addOfficeHour}
            onRemove={removeOfficeHour}
            onUpdate={updateOfficeHour}
          />
        </Section>

        <section className="rounded-lg border bg-background p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold">Researcher profile</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Enable this to manage research profile links and interests.
              </p>
            </div>
            <Switch checked={values.is_researcher} onCheckedChange={(checked) => setField("is_researcher", checked)} />
          </div>
        </section>

        {values.is_researcher ? (
          <Section title="Research Profiles">
            <Field label="Research interests" className="md:col-span-2">
              <Textarea rows={5} value={values.research_interests} onChange={(event) => setField("research_interests", event.target.value)} />
            </Field>
            <Field label="Website URL">
              <Input value={values.website_url} onChange={(event) => setField("website_url", event.target.value)} />
            </Field>
            <Field label="LinkedIn URL">
              <Input value={values.linkedin_url} onChange={(event) => setField("linkedin_url", event.target.value)} />
            </Field>
            <Field label="Google Scholar ID">
              <Input value={values.google_scholar_id} onChange={(event) => setField("google_scholar_id", event.target.value)} />
            </Field>
            <Field label="Google Scholar URL">
              <Input value={values.google_scholar_url} onChange={(event) => setField("google_scholar_url", event.target.value)} />
            </Field>
            <Field label="ORCID">
              <Input value={values.orcid} onChange={(event) => setField("orcid", event.target.value)} />
            </Field>
            <Field label="ResearchGate URL">
              <Input value={values.researchgate_url} onChange={(event) => setField("researchgate_url", event.target.value)} />
            </Field>
            <Field label="Scopus ID">
              <Input value={values.scopus_id} onChange={(event) => setField("scopus_id", event.target.value)} />
            </Field>
          </Section>
        ) : null}

        <Section title="Extended Profile">
          <ProfileRecordEditor
            title="Education background"
            rows={values.education_background}
            titlePlaceholder="Degree, certification, or study area"
            subtitlePlaceholder="Institution"
            descriptionPlaceholder="Notes or distinction"
            onAdd={() => addProfileRecord("education_background")}
            onRemove={(index) => removeProfileRecord("education_background", index)}
            onUpdate={(index, patch) => updateProfileRecord("education_background", index, patch)}
          />
          <ProfileRecordEditor
            title="Professional memberships"
            rows={values.professional_memberships}
            titlePlaceholder="Membership or association"
            subtitlePlaceholder="Organization"
            descriptionPlaceholder="Role, chapter, or membership details"
            onAdd={() => addProfileRecord("professional_memberships")}
            onRemove={(index) => removeProfileRecord("professional_memberships", index)}
            onUpdate={(index, patch) => updateProfileRecord("professional_memberships", index, patch)}
          />
          <ProfileRecordEditor
            title="Awards and honors"
            rows={values.awards_honors}
            titlePlaceholder="Award or honor"
            subtitlePlaceholder="Issuing body"
            descriptionPlaceholder="Citation, category, or context"
            onAdd={() => addProfileRecord("awards_honors")}
            onRemove={(index) => removeProfileRecord("awards_honors", index)}
            onUpdate={(index, patch) => updateProfileRecord("awards_honors", index, patch)}
          />
        </Section>

        <Section title="Files">
          <Field label="Profile photo">
            <MediaPicker
              value={values.photo_id}
              onChange={(value) => setField("photo_id", value)}
              mediaType="image"
              label="Profile photo"
              helperText="Choose or upload a public profile image."
              placeholder="No profile photo selected"
              accept="image/*"
              maxSize={5 * 1024 * 1024}
              isPublic
              uploadEntityType="person"
              uploadEntityId={profile?.id}
              uploadRole="profile-photo"
            />
          </Field>
          <Field label="CV file">
            <MediaPicker
              value={values.cv_file_id}
              onChange={(value) => setField("cv_file_id", value)}
              mediaType="document"
              label="CV file"
              helperText="Choose or upload a PDF or document for your profile."
              placeholder="No CV file selected"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              maxSize={20 * 1024 * 1024}
              isPublic
              uploadEntityType="person"
              uploadEntityId={profile?.id}
              uploadRole="profile-cv"
            />
          </Field>
        </Section>
      </form>
    </main>
  );
}

function EmptyRows({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function RemoveRowButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button type="button" variant="ghost" size="icon" aria-label={label} onClick={onClick}>
      <Trash2 />
    </Button>
  );
}

function QualificationEditor({
  rows,
  onAdd,
  onRemove,
  onUpdate,
}: {
  rows: QualificationRow[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, patch: Partial<QualificationRow>) => void;
}) {
  return (
    <div className="flex flex-col gap-3 md:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <Label>Qualifications</Label>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus data-icon="inline-start" />
          Add qualification
        </Button>
      </div>
      {rows.length ? (
        <div className="flex flex-col gap-3">
          {rows.map((row, index) => (
            <div key={row.id} className="grid gap-3 rounded-md border p-3 md:grid-cols-[1fr_1fr_1fr_8rem_auto]">
              <Field label="Degree">
                <Input
                  value={row.degree}
                  placeholder="PhD"
                  onChange={(event) => onUpdate(index, { degree: event.target.value })}
                />
              </Field>
              <Field label="Field">
                <Input
                  value={row.field}
                  placeholder="Computer Science"
                  onChange={(event) => onUpdate(index, { field: event.target.value })}
                />
              </Field>
              <Field label="Institution">
                <Input
                  value={row.institution}
                  placeholder="Kisii University"
                  onChange={(event) => onUpdate(index, { institution: event.target.value })}
                />
              </Field>
              <Field label="Year">
                <Input
                  value={row.year}
                  placeholder="2024"
                  onChange={(event) => onUpdate(index, { year: event.target.value })}
                />
              </Field>
              <div className="flex items-end">
                <RemoveRowButton label="Remove qualification" onClick={() => onRemove(index)} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyRows message="No qualifications added." />
      )}
    </div>
  );
}

function OfficeHoursEditor({
  rows,
  onAdd,
  onRemove,
  onUpdate,
}: {
  rows: OfficeHourRow[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, patch: Partial<OfficeHourRow>) => void;
}) {
  return (
    <div className="flex flex-col gap-3 md:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <Label>Office hours</Label>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus data-icon="inline-start" />
          Add hours
        </Button>
      </div>
      {rows.length ? (
        <div className="flex flex-col gap-3">
          {rows.map((row, index) => (
            <div key={row.id} className="grid gap-3 rounded-md border p-3 md:grid-cols-[minmax(10rem,16rem)_1fr_auto]">
              <Field label="Day">
                <Input
                  value={row.day}
                  placeholder="Monday"
                  onChange={(event) => onUpdate(index, { day: event.target.value })}
                />
              </Field>
              <Field label="Hours">
                <Input
                  value={row.hours}
                  placeholder="9:00 AM - 4:00 PM"
                  onChange={(event) => onUpdate(index, { hours: event.target.value })}
                />
              </Field>
              <div className="flex items-end">
                <RemoveRowButton label="Remove office hours" onClick={() => onRemove(index)} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyRows message="No office hours added." />
      )}
    </div>
  );
}

function ProfileRecordEditor({
  title,
  rows,
  titlePlaceholder,
  subtitlePlaceholder,
  descriptionPlaceholder,
  onAdd,
  onRemove,
  onUpdate,
}: {
  title: string;
  rows: ProfileRecordRow[];
  titlePlaceholder: string;
  subtitlePlaceholder: string;
  descriptionPlaceholder: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, patch: Partial<ProfileRecordRow>) => void;
}) {
  return (
    <div className="flex flex-col gap-3 md:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <Label>{title}</Label>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus data-icon="inline-start" />
          Add row
        </Button>
      </div>
      {rows.length ? (
        <div className="flex flex-col gap-3">
          {rows.map((row, index) => (
            <div key={row.id} className="grid gap-3 rounded-md border p-3 md:grid-cols-[1fr_1fr_8rem_auto]">
              <Field label="Title">
                <Input
                  value={row.title}
                  placeholder={titlePlaceholder}
                  onChange={(event) => onUpdate(index, { title: event.target.value })}
                />
              </Field>
              <Field label="Source">
                <Input
                  value={row.subtitle}
                  placeholder={subtitlePlaceholder}
                  onChange={(event) => onUpdate(index, { subtitle: event.target.value })}
                />
              </Field>
              <Field label="Year">
                <Input
                  value={row.year}
                  placeholder="2024"
                  onChange={(event) => onUpdate(index, { year: event.target.value })}
                />
              </Field>
              <div className="flex items-end">
                <RemoveRowButton label={`Remove ${title.toLowerCase()} row`} onClick={() => onRemove(index)} />
              </div>
              <Field label="Details" className="md:col-span-4">
                <Textarea
                  rows={3}
                  value={row.description}
                  placeholder={descriptionPlaceholder}
                  onChange={(event) => onUpdate(index, { description: event.target.value })}
                />
              </Field>
            </div>
          ))}
        </div>
      ) : (
        <EmptyRows message={`No ${title.toLowerCase()} added.`} />
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border bg-background p-4">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ProfileLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4 border-b pb-5">
          <Skeleton className="size-16 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-80" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </main>
  );
}
