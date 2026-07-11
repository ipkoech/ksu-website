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
} from "@/lib/api/page-cms";

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

export default function PageCmsSpotlightsPage() {
  const { hasAnyPermission } = usePermissions();
  const commitPendingAttachments = useCommitPendingAttachments();
  const [spotlights, setSpotlights] = useState<PartnershipSpotlight[]>([]);
  const [form, setForm] = useState<SpotlightFormState>(createEmptyForm());
  const [pendingAttachments, setPendingAttachments] = useState<PendingMediaAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
    return `${spotlights.length} spotlight${spotlights.length === 1 ? "" : "s"} available in admin, including drafts and disabled records.`;
  }, [spotlights.length]);

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
      toast.error("Source ID and headline are required.");
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

  return (
    <PageTransition>
      <PageHeader
        title="Partnership Spotlights"
        description="Manage spotlight copy, CTA strategy, media roles, and enabled windows for research partner highlights."
        backHref="/page-cms"
        actions={(
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={handleCreateNew}>
              New Spotlight
            </Button>
            <Button type="button" disabled={!canManageSpotlights || isSaving} onClick={() => void handleSave()}>
              {isSaving ? "Saving..." : form.id ? "Save Changes" : "Create Spotlight"}
            </Button>
          </div>
        )}
      />

      {error ? (
        <Card className="mb-6 border-destructive/30">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card>
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
                      className={`w-full rounded-lg border p-3 text-left transition-colors ${selected ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/50"}`}
                      onClick={() => void selectSpotlight(spotlight)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{spotlight.headline}</p>
                          <p className="mt-1 truncate text-xs text-muted-foreground">{spotlight.source_id}</p>
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

          <Card>
            <CardHeader>
              <CardTitle>Admin Coverage</CardTitle>
              <CardDescription>These records come from admin endpoints, not public homepage composition.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Draft, disabled, expired, and unpublished spotlight records stay visible here for editorial management.</p>
              <p>Detail editing loads a single admin record so the editor is not tied to whichever list page was fetched first.</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
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
                <p className="text-sm font-medium">Source ID</p>
                <Input
                  value={form.source_id}
                  disabled={!canManageSpotlights}
                  onChange={(event) => setForm((current) => ({ ...current, source_id: event.target.value }))}
                  placeholder="Research partner UUID"
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
                <Input
                  type="datetime-local"
                  value={form.valid_from}
                  disabled={!canManageSpotlights}
                  onChange={(event) => setForm((current) => ({ ...current, valid_from: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Valid To</p>
                <Input
                  type="datetime-local"
                  value={form.valid_to}
                  disabled={!canManageSpotlights}
                  onChange={(event) => setForm((current) => ({ ...current, valid_to: event.target.value }))}
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

          <Card>
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

          <Card>
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
