"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "@ksu/ui";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  JsonObjectEditor,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from "@ksu/ui/components";
import {
  AttachmentManager,
  type AttachmentRoleOption,
  type PendingMediaAttachment,
  useCommitPendingAttachments,
} from "@/components/media";
import { ResearchPartnerPicker } from "@/components/relationships/relationship-pickers";
import { DateTimePicker } from "@/components/shared/date-time-picker";
import { PageHeader } from "@/components/shared/page-header";
import { usePermissions } from "@/hooks/use-permissions";
import { PageTransition } from "@/lib/animations";
import {
  PAGE_CMS_MEDIA_ROLES,
  PARTNERSHIP_CTA_SOURCES,
  partnershipSpotlightsApi,
  type PartnershipSpotlight,
  type PartnershipCtaSource,
  type PartnershipSpotlightPayload,
  type PartnershipSpotlightWorkflowAction,
} from "@/lib/api/page-cms";
import { Sparkles } from "lucide-react";

type SpotlightFormState = {
  id?: string;
  source_type: "research_partner";
  source_id: string;
  primary_cta_source: PartnershipCtaSource;
  primary_cta_label: string;
  primary_cta_url: string;
  headline: string;
  summary: string;
  pillars: Record<string, unknown>[];
  opportunities: Record<string, unknown>[];
  is_enabled: boolean;
  valid_from: string;
  valid_to: string;
  status: string;
};

const MEDIA_ROLE_OPTIONS: AttachmentRoleOption[] = PAGE_CMS_MEDIA_ROLES.map((role) => ({
  value: role,
  label: role.replace(/_/g, " "),
  mediaType: role === "video" ? "video" : role === "gallery" ? "image" : undefined,
  accept: role === "video" ? "video/*" : role === "gallery" ? "image/*" : undefined,
  description: `Attach media for the ${role.replace(/_/g, " ")} role.`,
}));

function toDateTimeInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDateTimeInput(value: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function createEmptyForm(): SpotlightFormState {
  return {
    source_type: "research_partner",
    source_id: "",
    primary_cta_source: PARTNERSHIP_CTA_SOURCES[0],
    primary_cta_label: "",
    primary_cta_url: "",
    headline: "",
    summary: "",
    pillars: [],
    opportunities: [],
    is_enabled: true,
    valid_from: "",
    valid_to: "",
    status: "draft",
  };
}

function formFromSpotlight(spotlight: PartnershipSpotlight): SpotlightFormState {
  return {
    id: spotlight.id,
    source_type: "research_partner",
    source_id: spotlight.source_id,
    primary_cta_source: spotlight.primary_cta_source,
    primary_cta_label: spotlight.primary_cta_label ?? "",
    primary_cta_url: spotlight.primary_cta_url ?? "",
    headline: spotlight.headline,
    summary: spotlight.summary ?? "",
    pillars: (spotlight.pillars as Record<string, unknown>[] | null) ?? [],
    opportunities: (spotlight.opportunities as Record<string, unknown>[] | null) ?? [],
    is_enabled: spotlight.is_enabled,
    valid_from: toDateTimeInput(spotlight.valid_from),
    valid_to: toDateTimeInput(spotlight.valid_to),
    status: spotlight.status,
  };
}

function payloadFromForm(form: SpotlightFormState): PartnershipSpotlightPayload {
  return {
    source_type: "research_partner",
    source_id: form.source_id.trim(),
    primary_cta_source: form.primary_cta_source,
    primary_cta_label: form.primary_cta_label.trim() || null,
    primary_cta_url: form.primary_cta_url.trim() || null,
    headline: form.headline.trim(),
    summary: form.summary.trim() || null,
    pillars: form.pillars,
    opportunities: form.opportunities,
    is_enabled: form.is_enabled,
    valid_from: fromDateTimeInput(form.valid_from),
    valid_to: fromDateTimeInput(form.valid_to),
  };
}

function workflowButtonsForStatus(status: string) {
  const buttons: PartnershipSpotlightWorkflowAction[] = [];
  if (status === "draft" || status === "changes_requested") buttons.push("submit");
  if (status === "in_review") buttons.push("approve", "request_changes");
  if (status === "approved") buttons.push("publish");
  if (status === "published") buttons.push("unpublish");
  if (status !== "archived") buttons.push("archive");
  return buttons;
}

export default function PageCmsSpotlightsPage() {
  const { hasAnyPermission } = usePermissions();
  const commitPendingAttachments = useCommitPendingAttachments();
  const [spotlights, setSpotlights] = useState<PartnershipSpotlight[]>([]);
  const [form, setForm] = useState<SpotlightFormState>(createEmptyForm());
  const [pendingAttachments, setPendingAttachments] = useState<PendingMediaAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [workflowBusy, setWorkflowBusy] = useState<PartnershipSpotlightWorkflowAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canManageSpotlights = hasAnyPermission(["partnership_spotlights.manage", "admin:*"]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await partnershipSpotlightsApi.listAdmin({ page: 1, per_page: 100 });
        if (cancelled) return;
        const nextSpotlights = response.data ?? [];
        setSpotlights(nextSpotlights);
        if (nextSpotlights.length) {
          const detail = await partnershipSpotlightsApi.get(nextSpotlights[0].id);
          if (cancelled) return;
          setForm(formFromSpotlight(detail.data));
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load partnership spotlight admin data.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const spotlightSummary = useMemo(() => {
    return `${spotlights.length} partnership spotlight${spotlights.length === 1 ? "" : "s"} ready for editorial review.`;
  }, [spotlights.length]);

  const availableWorkflowActions = useMemo(() => {
    if (!form.id || !canManageSpotlights) return [];
    return workflowButtonsForStatus(form.status);
  }, [canManageSpotlights, form.id, form.status]);

  const selectSpotlight = async (spotlight: PartnershipSpotlight) => {
    try {
      const response = await partnershipSpotlightsApi.get(spotlight.id);
      setForm(formFromSpotlight(response.data));
      setPendingAttachments([]);
    } catch {
      toast.error("Failed to load spotlight details.");
    }
  };

  const handleCreateNew = () => {
    setForm(createEmptyForm());
    setPendingAttachments([]);
  };

  const handleSave = async () => {
    if (!canManageSpotlights) {
      toast.error("You do not have permission to manage partnership spotlights.");
      return;
    }

    if (!form.source_id.trim() || !form.headline.trim()) {
      toast.error("Choose a research partner and add a headline.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = payloadFromForm(form);
      const saved = form.id
        ? (await partnershipSpotlightsApi.update(form.id, payload)).data
        : (await partnershipSpotlightsApi.create(payload)).data;

      if (pendingAttachments.length) {
        await commitPendingAttachments({
          entityType: "partnership_spotlight",
          entityId: saved.id,
          attachments: pendingAttachments,
        });
      }

      setSpotlights((current) => {
        const next = new Map(current.map((item) => [item.id, item]));
        next.set(saved.id, saved);
        return Array.from(next.values());
      });
      setForm(formFromSpotlight(saved));
      setPendingAttachments([]);
      toast.success(form.id ? "Spotlight updated." : "Spotlight created.");
    } catch {
      toast.error("Failed to save partnership spotlight.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleWorkflow = async (action: PartnershipSpotlightWorkflowAction) => {
    if (!form.id) return;
    if (!canManageSpotlights) {
      toast.error("You do not have permission to manage partnership spotlights.");
      return;
    }

    setWorkflowBusy(action);
    try {
      const response = await partnershipSpotlightsApi.workflow(form.id, action);
      const updated = response.data;
      setSpotlights((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setForm(formFromSpotlight(updated));
      toast.success(`Spotlight ${action.replace(/_/g, " ")} complete.`);
    } catch {
      toast.error(`Failed to ${action.replace(/_/g, " ")} spotlight.`);
    } finally {
      setWorkflowBusy(null);
    }
  };

  return (
    <PageTransition>
      <PageHeader
        title="Partnership Spotlights"
        description="Manage spotlight copy, CTA strategy, media roles, and enabled windows for research partner highlights."
        backHref="/corporate-communication/page-cms"
        actions={(
          <div className="flex flex-wrap gap-2">
            {availableWorkflowActions.map((action) => (
              <Button
                key={action}
                type="button"
                variant={action === "publish" ? "default" : action === "archive" ? "destructive" : "outline"}
                disabled={workflowBusy !== null || isSaving}
                onClick={() => void handleWorkflow(action)}
              >
                {workflowBusy === action ? "Working..." : action.replace(/_/g, " ")}
              </Button>
            ))}
            <Button type="button" variant="outline" disabled={!canManageSpotlights || isSaving} onClick={handleCreateNew}>
              New Spotlight
            </Button>
            <Button type="button" disabled={!canManageSpotlights || isSaving} onClick={() => void handleSave()}>
              {isSaving ? "Saving..." : form.id ? "Save Changes" : "Create Spotlight"}
            </Button>
          </div>
        )}
      />

      <section className="mb-6 overflow-hidden rounded-3xl border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(248,250,252,0.86))] p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_32%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.86))] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <Sparkles className="size-3.5 text-orange-600" />
              Partnership spotlight editor
            </div>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Promote strategic research partnerships
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Select a partner, shape the homepage story, attach supporting media, and move the spotlight through the backend workflow.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <SpotlightMetric label="Loaded" value={spotlights.length} />
            <SpotlightMetric label="Enabled" value={spotlights.filter((item) => item.is_enabled).length} />
            <SpotlightMetric label="Status" value={form.status.replace(/_/g, " ")} />
          </div>
        </div>
      </section>

      {error ? (
        <Card className="mb-6 border-destructive/30">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card className="overflow-hidden border-white/70 bg-white/90 shadow-sm backdrop-blur dark:border-white/10 dark:bg-background/90">
            <CardHeader className="space-y-2">
              <CardTitle>Visible Spotlights</CardTitle>
              <CardDescription>{spotlightSummary}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading spotlights...</p>
              ) : spotlights.length ? (
                spotlights.map((spotlight) => {
                  const selected = form.id === spotlight.id;
                  return (
                    <button
                      key={spotlight.id}
                      type="button"
                      className={`w-full rounded-2xl border bg-background p-3 text-left transition-colors ${selected ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/50 hover:bg-primary/5"}`}
                      onClick={() => void selectSpotlight(spotlight)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{spotlight.headline}</p>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            Research partner spotlight
                          </p>
                        </div>
                        <Badge variant={spotlight.is_enabled ? "default" : "secondary"}>
                          {spotlight.is_enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {spotlight.primary_cta_source.replace(/_/g, " ")} · {spotlight.status}
                      </p>
                    </button>
                  );
                })
              ) : (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  No spotlight entries are currently visible.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-white/70 bg-white/90 shadow-sm backdrop-blur dark:border-white/10 dark:bg-background/90">
            <CardHeader>
              <CardTitle>Editorial Focus</CardTitle>
              <CardDescription>Use the list to move between partnership stories without leaving the editor.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Select a spotlight to edit its headline, CTA, media, timing, and workflow state.</p>
              <p>Create a new spotlight when a research partner should be promoted on the homepage.</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden border-white/70 bg-white/90 shadow-sm backdrop-blur dark:border-white/10 dark:bg-background/90">
            <CardHeader>
              <CardTitle>Spotlight Content</CardTitle>
              <CardDescription>Update source mapping, headline content, CTA behavior, validity window, and enabled state.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Source Type</p>
                <Input value="research_partner" disabled />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Status</p>
                <div className="flex h-10 items-center rounded-md border px-3">
                  <Badge variant={form.status === "published" ? "default" : "secondary"}>
                    {form.status.replace(/_/g, " ")}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <ResearchPartnerPicker
                  value={form.source_id}
                  onChange={(id) => setForm((current) => ({ ...current, source_id: id }))}
                  disabled={!canManageSpotlights}
                  required
                  allowClear={false}
                  label="Research Partner"
                  description="Choose the partner record this homepage spotlight promotes."
                  placeholder="Select research partner"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Primary CTA Source</p>
                <Select
                  value={form.primary_cta_source}
                  disabled={!canManageSpotlights}
                  onValueChange={(value) => setForm((current) => ({ ...current, primary_cta_source: value as PartnershipCtaSource }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select CTA source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {PARTNERSHIP_CTA_SOURCES.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 lg:col-span-2">
                <p className="text-sm font-medium">Headline</p>
                <Input
                  value={form.headline}
                  disabled={!canManageSpotlights}
                  onChange={(event) => setForm((current) => ({ ...current, headline: event.target.value }))}
                  placeholder="Strategic partnership headline"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Primary CTA Label</p>
                <Input
                  value={form.primary_cta_label}
                  disabled={!canManageSpotlights}
                  onChange={(event) => setForm((current) => ({ ...current, primary_cta_label: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Primary CTA URL</p>
                <Input
                  value={form.primary_cta_url}
                  disabled={!canManageSpotlights}
                  onChange={(event) => setForm((current) => ({ ...current, primary_cta_url: event.target.value }))}
                  placeholder="https:// or /path"
                />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <p className="text-sm font-medium">Summary</p>
                <Textarea
                  rows={4}
                  value={form.summary}
                  disabled={!canManageSpotlights}
                  onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
                  placeholder="Short partnership summary"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Valid From</p>
                <DateTimePicker
                  mode="datetime-local"
                  value={form.valid_from}
                  disabled={!canManageSpotlights}
                  onChange={(value) => setForm((current) => ({ ...current, valid_from: value }))}
                  placeholder="Select start date"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Valid To</p>
                <DateTimePicker
                  mode="datetime-local"
                  value={form.valid_to}
                  disabled={!canManageSpotlights}
                  onChange={(value) => setForm((current) => ({ ...current, valid_to: value }))}
                  placeholder="Select end date"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3 lg:col-span-2">
                <div>
                  <p className="text-sm font-medium">Enabled</p>
                  <p className="text-sm text-muted-foreground">Disable the spotlight without discarding its editorial copy.</p>
                </div>
                <Switch
                  checked={form.is_enabled}
                  disabled={!canManageSpotlights}
                  onCheckedChange={(checked) => setForm((current) => ({ ...current, is_enabled: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-white/70 bg-white/90 shadow-sm backdrop-blur dark:border-white/10 dark:bg-background/90">
            <CardHeader>
              <CardTitle>Pillars and Opportunities</CardTitle>
              <CardDescription>Manage structured list content used by the spotlight presentation.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Pillars</p>
                <JsonObjectEditor
                  mode="array"
                  value={form.pillars}
                  onChange={(value) => setForm((current) => ({ ...current, pillars: (value as Record<string, unknown>[]) ?? [] }))}
                  allowCustomFields
                  disabled={!canManageSpotlights}
                  itemLabel="Pillar"
                  addLabel="Add pillar"
                  emptyLabel="No pillars added."
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Opportunities</p>
                <JsonObjectEditor
                  mode="array"
                  value={form.opportunities}
                  onChange={(value) => setForm((current) => ({ ...current, opportunities: (value as Record<string, unknown>[]) ?? [] }))}
                  allowCustomFields
                  disabled={!canManageSpotlights}
                  itemLabel="Opportunity"
                  addLabel="Add opportunity"
                  emptyLabel="No opportunities added."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-white/70 bg-white/90 shadow-sm backdrop-blur dark:border-white/10 dark:bg-background/90">
            <CardHeader>
              <CardTitle>Spotlight Media</CardTitle>
              <CardDescription>Attach brand, gallery, background, and video assets using the shared media manager.</CardDescription>
            </CardHeader>
            <CardContent>
              <AttachmentManager
                entityType="partnership_spotlight"
                entityId={form.id}
                roles={MEDIA_ROLE_OPTIONS}
                pendingAttachments={pendingAttachments}
                onPendingAttachmentsChange={setPendingAttachments}
                disabled={!canManageSpotlights}
                title="Spotlight Attachments"
                description="Attach spotlight-specific media using the existing admin media workflow."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}

function SpotlightMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="min-w-[112px] rounded-2xl border bg-background/80 p-3 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tracking-tight capitalize">{value}</p>
    </div>
  );
}
