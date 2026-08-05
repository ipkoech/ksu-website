"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CalendarClock, ExternalLink, FileDown, Megaphone } from "lucide-react";
import {
  useIntakeHomepageAdmission,
  useUpdateIntakeHomepageAdmission,
  type IntakeHomepageActionConfig,
  type IntakeHomepageAdmission,
  type IntakeHomepageAdmissionUpdate,
} from "@ksu/api-client";
import { toast } from "@ksu/ui";
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@ksu/ui/components";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { formatInstantInTimeZone, zonedDateTimeToIso } from "./homepage-admission-timezone";

type ActionKey =
  | "apply"
  | "check_requirements"
  | "explore_programmes"
  | "admission_letter"
  | "reporting_instructions";

function actionValues(action: IntakeHomepageActionConfig | null | undefined, timezone: string): IntakeHomepageActionConfig {
  return {
    enabled: action?.enabled ?? false,
    label: action?.label ?? "",
    url: action?.url ?? "",
    starts_at: formatInstantInTimeZone(action?.starts_at, timezone),
    ends_at: formatInstantInTimeZone(action?.ends_at, timezone),
  };
}

function formValues(data: IntakeHomepageAdmission): IntakeHomepageAdmission {
  const timezone = data.timezone || "Africa/Nairobi";
  return {
    ...data,
    timezone,
    application_opens_at: formatInstantInTimeZone(data.application_opens_at, timezone),
    application_closes_at: formatInstantInTimeZone(data.application_closes_at, timezone),
    late_application_closes_at: formatInstantInTimeZone(data.late_application_closes_at, timezone),
    override_expires_at: formatInstantInTimeZone(data.override_expires_at, timezone),
    apply: actionValues(data.apply, timezone),
    check_requirements: actionValues(data.check_requirements, timezone),
    explore_programmes: actionValues(data.explore_programmes, timezone),
    admission_letter: actionValues(data.admission_letter, timezone),
    reporting_instructions: actionValues(data.reporting_instructions, timezone),
    reporting: {
      ...data.reporting,
      starts_at: formatInstantInTimeZone(data.reporting.starts_at, timezone),
      ends_at: formatInstantInTimeZone(data.reporting.ends_at, timezone),
      location: data.reporting.location ?? "",
      instructions_url: data.reporting.instructions_url ?? "",
    },
  };
}

function validate(values: IntakeHomepageAdmission) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: values.timezone }).format();
  } catch {
    return "Enter a valid IANA timezone, such as Africa/Nairobi.";
  }
  if (!values.application_opens_at || !values.application_closes_at) {
    return "Application opening and closing times are required.";
  }
  if (new Date(values.application_closes_at) < new Date(values.application_opens_at)) {
    return "Applications must close after they open.";
  }
  if (
    values.late_applications_enabled &&
    values.late_application_closes_at &&
    values.late_application_closes_at < values.application_closes_at
  ) {
    return "Late applications must close after the normal application deadline.";
  }
  if (values.application_override !== "automatic" && !values.override_expires_at) {
    return "An override expiry is required for a manual application override.";
  }
  const actionNames: Array<[ActionKey, string]> = [
    ["apply", "Apply Now"],
    ["check_requirements", "Check Requirements"],
    ["explore_programmes", "Explore Programmes"],
    ["admission_letter", "Admission Letter"],
    ["reporting_instructions", "Reporting Instructions"],
  ];
  for (const [key, title] of actionNames) {
    const action = values[key];
    if (action.enabled && (!action.label?.trim() || !action.url?.trim())) {
      return `${title} requires both a label and URL when enabled.`;
    }
    if (action.starts_at && action.ends_at && action.ends_at < action.starts_at) {
      return `${title} must end after it starts.`;
    }
  }
  if (values.reporting.enabled && (!values.reporting.title.trim() || !values.reporting.starts_at)) {
    return "Reporting requires a title and reporting date when enabled.";
  }
  if (values.reporting.starts_at && values.reporting.ends_at && values.reporting.ends_at < values.reporting.starts_at) {
    return "Reporting must end after it starts.";
  }
  return null;
}

function changed<T>(current: T, baseline: T) {
  return current !== baseline;
}

function buildPatch(current: IntakeHomepageAdmission, baseline: IntakeHomepageAdmission): IntakeHomepageAdmissionUpdate {
  const patch: IntakeHomepageAdmissionUpdate = {};
  const timezoneChanged = current.timezone !== baseline.timezone;
  for (const key of ["is_featured_on_homepage", "homepage_priority", "late_applications_enabled", "application_override", "timezone"] as const) {
    if (changed(current[key], baseline[key])) Object.assign(patch, { [key]: current[key] });
  }
  for (const key of ["application_opens_at", "application_closes_at"] as const) {
    if (timezoneChanged || changed(current[key], baseline[key])) patch[key] = zonedDateTimeToIso(current[key], current.timezone) ?? undefined;
  }
  for (const key of ["late_application_closes_at", "override_expires_at"] as const) {
    if (timezoneChanged || changed(current[key], baseline[key])) patch[key] = zonedDateTimeToIso(current[key] ?? "", current.timezone);
  }

  for (const key of ["apply", "check_requirements", "explore_programmes", "admission_letter", "reporting_instructions"] as const) {
    const next: Partial<IntakeHomepageActionConfig> = {};
    for (const field of ["enabled", "label", "url"] as const) {
      if (changed(current[key][field], baseline[key][field])) Object.assign(next, { [field]: current[key][field] });
    }
    for (const field of ["starts_at", "ends_at"] as const) {
      if (timezoneChanged || changed(current[key][field], baseline[key][field])) {
        next[field] = zonedDateTimeToIso(current[key][field] ?? "", current.timezone);
      }
    }
    if (Object.keys(next).length) patch[key] = next;
  }

  const reporting: NonNullable<IntakeHomepageAdmissionUpdate["reporting"]> = {};
  for (const field of ["enabled", "title", "location", "instructions_url"] as const) {
    if (changed(current.reporting[field], baseline.reporting[field])) Object.assign(reporting, { [field]: current.reporting[field] });
  }
  for (const field of ["starts_at", "ends_at"] as const) {
    if (timezoneChanged || changed(current.reporting[field], baseline.reporting[field])) {
      reporting[field] = zonedDateTimeToIso(current.reporting[field] ?? "", current.timezone);
    }
  }
  if (Object.keys(reporting).length) patch.reporting = reporting;
  return patch;
}

function ActionEditor({
  actionKey,
  title,
  description,
  value,
  onChange,
}: {
  actionKey: ActionKey;
  title: string;
  description: string;
  value: IntakeHomepageActionConfig;
  onChange: (value: IntakeHomepageActionConfig) => void;
}) {
  const id = `homepage-${actionKey.replaceAll("_", "-")}`;
  return (
    <div className="space-y-4 rounded-xl border p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Label htmlFor={`${id}-enabled`} className="font-semibold">{title}</Label>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Switch
          id={`${id}-enabled`}
          checked={value.enabled}
          onCheckedChange={(enabled) => onChange({ ...value, enabled })}
        />
      </div>
      {value.enabled ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`${id}-label`}>Button label</Label>
            <Input
              id={`${id}-label`}
              value={value.label ?? ""}
              onChange={(event) => onChange({ ...value, label: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-url`}>Destination URL</Label>
            <Input
              id={`${id}-url`}
              type="url"
              placeholder="https://"
              value={value.url ?? ""}
              onChange={(event) => onChange({ ...value, url: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-starts`}>Available from</Label>
            <Input
              id={`${id}-starts`}
              type="datetime-local"
              value={value.starts_at ?? ""}
              onChange={(event) => onChange({ ...value, starts_at: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-ends`}>Available until</Label>
            <Input
              id={`${id}-ends`}
              type="datetime-local"
              value={value.ends_at ?? ""}
              onChange={(event) => onChange({ ...value, ends_at: event.target.value })}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function HomepageAdmissionForm({ intakeId }: { intakeId: string }) {
  const query = useIntakeHomepageAdmission(intakeId);
  const update = useUpdateIntakeHomepageAdmission();
  const [values, setValues] = useState<IntakeHomepageAdmission | null>(null);
  const [baseline, setBaseline] = useState<IntakeHomepageAdmission | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (query.data?.data && !isDirty) {
      const next = formValues(query.data.data);
      setValues(next);
      setBaseline(next);
    }
  }, [isDirty, query.data]);

  if (query.isLoading || !values) {
    if (query.isError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>Homepage admission settings could not be loaded.</span>
            <Button type="button" variant="outline" size="sm" onClick={() => query.refetch()}>Retry</Button>
          </AlertDescription>
        </Alert>
      );
    }
    return <LoadingSkeleton rows={6} />;
  }

  const updateValues = (updater: (current: IntakeHomepageAdmission) => IntakeHomepageAdmission) => {
    setValues((current) => current ? updater(current) : current);
    setIsDirty(true);
  };

  const setAction = (key: ActionKey, action: IntakeHomepageActionConfig) => {
    updateValues((current) => ({ ...current, [key]: action }));
  };

  const save = async () => {
    const error = validate(values);
    if (error) {
      toast.error(error);
      return;
    }
    if (!baseline) return;
    const payload = buildPatch(values, baseline);
    if (!Object.keys(payload).length) {
      setIsDirty(false);
      toast.info("No changes to save");
      return;
    }
    try {
      const response = await update.mutateAsync({ id: intakeId, data: payload });
      const next = formValues(response.data);
      setValues(next);
      setBaseline(next);
      setIsDirty(false);
      toast.success("Homepage admission settings updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update homepage admission settings");
    }
  };

  return (
    <section className="space-y-6" aria-labelledby="homepage-admission-title">
      <div>
        <h2 id="homepage-admission-title" className="text-xl font-semibold">Homepage Admission</h2>
        <p className="text-sm text-muted-foreground">
          Control when this intake appears in the homepage hero and which applicant actions are available.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5" /> Homepage Visibility</CardTitle>
          <CardDescription>If disabled, this intake is ignored by the homepage admissions panel.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4 md:col-span-2">
            <div>
              <Label htmlFor="homepage-featured">Feature this intake on the homepage</Label>
              <p className="mt-1 text-sm text-muted-foreground">The lowest priority number wins when several intakes qualify.</p>
            </div>
            <Switch
              id="homepage-featured"
              checked={values.is_featured_on_homepage}
              onCheckedChange={(is_featured_on_homepage) => updateValues((current) => ({ ...current, is_featured_on_homepage }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="homepage-priority">Homepage priority</Label>
            <Input
              id="homepage-priority"
              type="number"
              min={0}
              value={values.homepage_priority}
              onChange={(event) => updateValues((current) => ({ ...current, homepage_priority: Number(event.target.value) }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="homepage-timezone">Timezone</Label>
            <Input
              id="homepage-timezone"
              value={values.timezone}
              onChange={(event) => updateValues((current) => ({ ...current, timezone: event.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5" /> Application Window</CardTitle>
          <CardDescription>The countdown is calculated from these timezone-aware dates.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="applications-open-at">Applications open</Label>
            <Input id="applications-open-at" type="datetime-local" value={values.application_opens_at} onChange={(event) => updateValues((current) => ({ ...current, application_opens_at: event.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="applications-close-at">Applications close</Label>
            <Input id="applications-close-at" type="datetime-local" value={values.application_closes_at} onChange={(event) => updateValues((current) => ({ ...current, application_closes_at: event.target.value }))} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4 md:col-span-2">
            <Label htmlFor="late-applications-enabled">Enable late applications</Label>
            <Switch id="late-applications-enabled" checked={values.late_applications_enabled} onCheckedChange={(late_applications_enabled) => updateValues((current) => ({ ...current, late_applications_enabled }))} />
          </div>
          {values.late_applications_enabled ? (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="late-applications-close-at">Late applications close</Label>
              <Input id="late-applications-close-at" type="datetime-local" value={values.late_application_closes_at ?? ""} onChange={(event) => updateValues((current) => ({ ...current, late_application_closes_at: event.target.value }))} />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label>Application override</Label>
            <Select value={values.application_override} onValueChange={(application_override) => updateValues((current) => ({ ...current, application_override: application_override as IntakeHomepageAdmission["application_override"] }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="automatic">Automatic</SelectItem>
                <SelectItem value="force_open">Force open temporarily</SelectItem>
                <SelectItem value="force_hidden">Hide temporarily</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {values.application_override !== "automatic" ? (
            <div className="space-y-2">
              <Label htmlFor="override-expires-at">Override expires</Label>
              <Input id="override-expires-at" type="datetime-local" value={values.override_expires_at ?? ""} onChange={(event) => updateValues((current) => ({ ...current, override_expires_at: event.target.value }))} />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ExternalLink className="h-5 w-5" /> Application Actions</CardTitle>
          <CardDescription>Only enabled actions with valid destinations can appear in the hero.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-3">
          <ActionEditor actionKey="apply" title="Apply Now" description="Open the application portal." value={values.apply} onChange={(action) => setAction("apply", action)} />
          <ActionEditor actionKey="check_requirements" title="Check Requirements" description="Review admission requirements." value={values.check_requirements} onChange={(action) => setAction("check_requirements", action)} />
          <ActionEditor actionKey="explore_programmes" title="Explore Programmes" description="Browse programmes available to applicants." value={values.explore_programmes} onChange={(action) => setAction("explore_programmes", action)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileDown className="h-5 w-5" /> Admission Letter</CardTitle>
          <CardDescription>This admin-controlled action is shown only when enabled and available.</CardDescription>
        </CardHeader>
        <CardContent>
          <ActionEditor actionKey="admission_letter" title="Download Admission Letter" description="Send admitted students to the official letter service." value={values.admission_letter} onChange={(action) => setAction("admission_letter", action)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reporting</CardTitle>
          <CardDescription>Publish the reporting date and optional instructions for this intake.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <Label htmlFor="reporting-enabled">Publish reporting information</Label>
            <Switch id="reporting-enabled" checked={values.reporting.enabled} onCheckedChange={(enabled) => updateValues((current) => ({ ...current, reporting: { ...current.reporting, enabled } }))} />
          </div>
          {values.reporting.enabled ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="reporting-title">Title</Label>
                <Input id="reporting-title" value={values.reporting.title} onChange={(event) => updateValues((current) => ({ ...current, reporting: { ...current.reporting, title: event.target.value } }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reporting-starts-at">Reporting date</Label>
                <Input id="reporting-starts-at" type="datetime-local" value={values.reporting.starts_at ?? ""} onChange={(event) => updateValues((current) => ({ ...current, reporting: { ...current.reporting, starts_at: event.target.value } }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reporting-location">Location</Label>
                <Input id="reporting-location" value={values.reporting.location ?? ""} onChange={(event) => updateValues((current) => ({ ...current, reporting: { ...current.reporting, location: event.target.value } }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reporting-url">Instructions URL</Label>
                <Input id="reporting-url" type="url" placeholder="https://" value={values.reporting.instructions_url ?? ""} onChange={(event) => updateValues((current) => ({ ...current, reporting: { ...current.reporting, instructions_url: event.target.value } }))} />
              </div>
            </div>
          ) : null}
          <ActionEditor actionKey="reporting_instructions" title="Reporting Instructions" description="Optional CTA linking directly to detailed reporting guidance." value={values.reporting_instructions} onChange={(action) => setAction("reporting_instructions", action)} />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="button" onClick={save} disabled={update.isPending || !isDirty}>
          {update.isPending ? "Saving..." : "Save Homepage Admission"}
        </Button>
      </div>
    </section>
  );
}
