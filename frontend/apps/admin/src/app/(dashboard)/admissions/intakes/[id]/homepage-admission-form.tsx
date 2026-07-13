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

type ActionKey =
  | "apply"
  | "check_requirements"
  | "explore_programmes"
  | "admission_letter"
  | "reporting_instructions";

function toLocalDateTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function toIso(value: string) {
  return value ? new Date(value).toISOString() : null;
}

function actionValues(action?: IntakeHomepageActionConfig | null): IntakeHomepageActionConfig {
  return {
    enabled: action?.enabled ?? false,
    label: action?.label ?? "",
    url: action?.url ?? "",
    starts_at: toLocalDateTime(action?.starts_at),
    ends_at: toLocalDateTime(action?.ends_at),
  };
}

function formValues(data: IntakeHomepageAdmission): IntakeHomepageAdmission {
  return {
    ...data,
    application_opens_at: toLocalDateTime(data.application_opens_at),
    application_closes_at: toLocalDateTime(data.application_closes_at),
    late_application_closes_at: toLocalDateTime(data.late_application_closes_at),
    override_expires_at: toLocalDateTime(data.override_expires_at),
    apply: actionValues(data.apply),
    check_requirements: actionValues(data.check_requirements),
    explore_programmes: actionValues(data.explore_programmes),
    admission_letter: actionValues(data.admission_letter),
    reporting_instructions: actionValues(data.reporting_instructions),
    reporting: {
      ...data.reporting,
      starts_at: toLocalDateTime(data.reporting.starts_at),
      ends_at: toLocalDateTime(data.reporting.ends_at),
      location: data.reporting.location ?? "",
      instructions_url: data.reporting.instructions_url ?? "",
    },
  };
}

function actionPayload(action: IntakeHomepageActionConfig) {
  return {
    enabled: action.enabled,
    label: action.label || null,
    url: action.url || null,
    starts_at: toIso(action.starts_at ?? ""),
    ends_at: toIso(action.ends_at ?? ""),
  };
}

function validate(values: IntakeHomepageAdmission) {
  if (!values.application_opens_at || !values.application_closes_at) {
    return "Application opening and closing times are required.";
  }
  if (new Date(values.application_closes_at) < new Date(values.application_opens_at)) {
    return "Applications must close after they open.";
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
  }
  if (values.reporting.enabled && (!values.reporting.title.trim() || !values.reporting.starts_at)) {
    return "Reporting requires a title and reporting date when enabled.";
  }
  return null;
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

  useEffect(() => {
    if (query.data?.data) setValues(formValues(query.data.data));
  }, [query.data]);

  if (query.isLoading || !values) {
    if (query.isError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Homepage admission settings could not be loaded. Please try again.</AlertDescription>
        </Alert>
      );
    }
    return <LoadingSkeleton rows={6} />;
  }

  const setAction = (key: ActionKey, action: IntakeHomepageActionConfig) => {
    setValues((current) => current ? { ...current, [key]: action } : current);
  };

  const save = async () => {
    const error = validate(values);
    if (error) {
      toast.error(error);
      return;
    }
    const payload: IntakeHomepageAdmissionUpdate = {
      is_featured_on_homepage: values.is_featured_on_homepage,
      homepage_priority: Number(values.homepage_priority),
      application_opens_at: toIso(values.application_opens_at) ?? undefined,
      application_closes_at: toIso(values.application_closes_at) ?? undefined,
      late_application_closes_at: toIso(values.late_application_closes_at ?? ""),
      late_applications_enabled: values.late_applications_enabled,
      application_override: values.application_override,
      override_expires_at: toIso(values.override_expires_at ?? ""),
      timezone: values.timezone,
      apply: actionPayload(values.apply),
      check_requirements: actionPayload(values.check_requirements),
      explore_programmes: actionPayload(values.explore_programmes),
      admission_letter: actionPayload(values.admission_letter),
      reporting_instructions: actionPayload(values.reporting_instructions),
      reporting: {
        enabled: values.reporting.enabled,
        title: values.reporting.title,
        starts_at: toIso(values.reporting.starts_at ?? ""),
        ends_at: toIso(values.reporting.ends_at ?? ""),
        location: values.reporting.location || null,
        instructions_url: values.reporting.instructions_url || null,
      },
    };
    try {
      const response = await update.mutateAsync({ id: intakeId, data: payload });
      setValues(formValues(response.data));
      toast.success("Homepage admission settings updated");
    } catch {
      toast.error("Failed to update homepage admission settings");
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
              onCheckedChange={(is_featured_on_homepage) => setValues({ ...values, is_featured_on_homepage })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="homepage-priority">Homepage priority</Label>
            <Input
              id="homepage-priority"
              type="number"
              min={0}
              value={values.homepage_priority}
              onChange={(event) => setValues({ ...values, homepage_priority: Number(event.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="homepage-timezone">Timezone</Label>
            <Input
              id="homepage-timezone"
              value={values.timezone}
              onChange={(event) => setValues({ ...values, timezone: event.target.value })}
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
            <Input id="applications-open-at" type="datetime-local" value={values.application_opens_at} onChange={(event) => setValues({ ...values, application_opens_at: event.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="applications-close-at">Applications close</Label>
            <Input id="applications-close-at" type="datetime-local" value={values.application_closes_at} onChange={(event) => setValues({ ...values, application_closes_at: event.target.value })} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4 md:col-span-2">
            <Label htmlFor="late-applications-enabled">Enable late applications</Label>
            <Switch id="late-applications-enabled" checked={values.late_applications_enabled} onCheckedChange={(late_applications_enabled) => setValues({ ...values, late_applications_enabled })} />
          </div>
          {values.late_applications_enabled ? (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="late-applications-close-at">Late applications close</Label>
              <Input id="late-applications-close-at" type="datetime-local" value={values.late_application_closes_at ?? ""} onChange={(event) => setValues({ ...values, late_application_closes_at: event.target.value })} />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label>Application override</Label>
            <Select value={values.application_override} onValueChange={(application_override) => setValues({ ...values, application_override: application_override as IntakeHomepageAdmission["application_override"] })}>
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
              <Input id="override-expires-at" type="datetime-local" value={values.override_expires_at ?? ""} onChange={(event) => setValues({ ...values, override_expires_at: event.target.value })} />
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
            <Switch id="reporting-enabled" checked={values.reporting.enabled} onCheckedChange={(enabled) => setValues({ ...values, reporting: { ...values.reporting, enabled } })} />
          </div>
          {values.reporting.enabled ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="reporting-title">Title</Label>
                <Input id="reporting-title" value={values.reporting.title} onChange={(event) => setValues({ ...values, reporting: { ...values.reporting, title: event.target.value } })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reporting-starts-at">Reporting date</Label>
                <Input id="reporting-starts-at" type="datetime-local" value={values.reporting.starts_at ?? ""} onChange={(event) => setValues({ ...values, reporting: { ...values.reporting, starts_at: event.target.value } })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reporting-location">Location</Label>
                <Input id="reporting-location" value={values.reporting.location ?? ""} onChange={(event) => setValues({ ...values, reporting: { ...values.reporting, location: event.target.value } })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reporting-url">Instructions URL</Label>
                <Input id="reporting-url" type="url" placeholder="https://" value={values.reporting.instructions_url ?? ""} onChange={(event) => setValues({ ...values, reporting: { ...values.reporting, instructions_url: event.target.value } })} />
              </div>
            </div>
          ) : null}
          <ActionEditor actionKey="reporting_instructions" title="Reporting Instructions" description="Optional CTA linking directly to detailed reporting guidance." value={values.reporting_instructions} onChange={(action) => setAction("reporting_instructions", action)} />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="button" onClick={save} disabled={update.isPending}>
          {update.isPending ? "Saving..." : "Save Homepage Admission"}
        </Button>
      </div>
    </section>
  );
}
