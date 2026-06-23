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
import { Save } from "lucide-react";
import { MediaPicker } from "@/components/media/media-picker";

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
  qualifications: string;
  specialization: string;
  research_interests: string;
  teaching_areas: string;
  office_location: string;
  office_hours: string;
  office_phone: string;
  courses_taught: string;
  website_url: string;
  linkedin_url: string;
  google_scholar_id: string;
  google_scholar_url: string;
  orcid: string;
  researchgate_url: string;
  scopus_id: string;
  education_background: string;
  professional_memberships: string;
  awards_honors: string;
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
  qualifications: "[]",
  specialization: "",
  research_interests: "",
  teaching_areas: "",
  office_location: "",
  office_hours: "{}",
  office_phone: "",
  courses_taught: "",
  website_url: "",
  linkedin_url: "",
  google_scholar_id: "",
  google_scholar_url: "",
  orcid: "",
  researchgate_url: "",
  scopus_id: "",
  education_background: "[]",
  professional_memberships: "[]",
  awards_honors: "[]",
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

function prettyJson(value: unknown, fallback: "[]" | "{}") {
  if (value == null) return fallback;
  return JSON.stringify(value, null, 2);
}

function parseJsonField<T>(label: string, value: string, fallback: T): T {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    throw new Error(`${label} must be valid JSON.`);
  }
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
    qualifications: prettyJson(profile.qualifications, "[]"),
    specialization: text(profile.specialization),
    research_interests: (profile.research_interests ?? []).join("\n"),
    teaching_areas: (profile.teaching_areas ?? []).join("\n"),
    office_location: text(profile.office_location),
    office_hours: prettyJson(profile.office_hours, "{}"),
    office_phone: text(profile.office_phone),
    courses_taught: (profile.courses_taught ?? []).join("\n"),
    website_url: text(profile.website_url),
    linkedin_url: text(profile.linkedin_url),
    google_scholar_id: text(profile.google_scholar_id),
    google_scholar_url: text(profile.google_scholar_url),
    orcid: text(profile.orcid),
    researchgate_url: text(profile.researchgate_url),
    scopus_id: text(profile.scopus_id),
    education_background: prettyJson(profile.education_background, "[]"),
    professional_memberships: prettyJson(profile.professional_memberships, "[]"),
    awards_honors: prettyJson(profile.awards_honors, "[]"),
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
    qualifications: parseJsonField("Qualifications", values.qualifications, []),
    specialization: nullable(values.specialization),
    research_interests: lines(values.research_interests),
    teaching_areas: lines(values.teaching_areas),
    office_location: nullable(values.office_location),
    office_hours: parseJsonField("Office hours", values.office_hours, {}),
    office_phone: nullable(values.office_phone),
    courses_taught: lines(values.courses_taught),
    website_url: nullable(values.website_url),
    linkedin_url: nullable(values.linkedin_url),
    google_scholar_id: nullable(values.google_scholar_id),
    google_scholar_url: nullable(values.google_scholar_url),
    orcid: nullable(values.orcid),
    researchgate_url: nullable(values.researchgate_url),
    scopus_id: nullable(values.scopus_id),
    education_background: parseJsonField("Education background", values.education_background, []),
    professional_memberships: parseJsonField("Professional memberships", values.professional_memberships, []),
    awards_honors: parseJsonField("Awards and honors", values.awards_honors, []),
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
          <Field label="Qualifications JSON" className="md:col-span-2">
            <Textarea rows={6} value={values.qualifications} onChange={(event) => setField("qualifications", event.target.value)} />
          </Field>
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
          <Field label="Office hours JSON" className="md:col-span-2">
            <Textarea rows={6} value={values.office_hours} onChange={(event) => setField("office_hours", event.target.value)} />
          </Field>
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
          <Field label="Education background JSON" className="md:col-span-2">
            <Textarea rows={7} value={values.education_background} onChange={(event) => setField("education_background", event.target.value)} />
          </Field>
          <Field label="Professional memberships JSON" className="md:col-span-2">
            <Textarea rows={7} value={values.professional_memberships} onChange={(event) => setField("professional_memberships", event.target.value)} />
          </Field>
          <Field label="Awards and honors JSON" className="md:col-span-2">
            <Textarea rows={7} value={values.awards_honors} onChange={(event) => setField("awards_honors", event.target.value)} />
          </Field>
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
