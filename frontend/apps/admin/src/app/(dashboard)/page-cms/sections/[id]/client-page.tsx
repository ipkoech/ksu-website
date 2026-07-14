"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { toast } from "@ksu/ui";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  ImageRenderer,
} from "@ksu/ui/components";
import {
  AttachmentManager,
  type AttachmentRoleOption,
  type PendingMediaAttachment,
  useCommitPendingAttachments,
} from "@/components/media";
import { LibraryBranchPicker, ResearchCenterPicker, SchoolPicker } from "@/components/relationships/relationship-pickers";
import { DateTimePicker } from "@/components/shared/date-time-picker";
import { PageHeader } from "@/components/shared/page-header";
import { usePermissions } from "@/hooks/use-permissions";
import { PageTransition } from "@/lib/animations";
import { cn } from "@ksu/ui/lib";
import {
  PAGE_CMS_MEDIA_ROLES,
  PAGE_SCOPE_TYPES,
  PAGE_SECTION_LAYOUT_VARIANTS,
  PAGE_SECTION_STATUSES,
  SECTION_ITEM_TYPES,
  pageSectionsApi,
  sectionItemsApi,
  type PageScopeType,
  type PageSection,
  type PageSectionLayoutVariant,
  type PageSectionStatus,
  type PageSectionWorkflowAction,
  type SectionItem,
  type SectionItemPayload,
  type SectionItemType,
} from "@/lib/api/page-cms";
import { ExternalLink, Sparkles } from "lucide-react";
import { EntityPicker } from "@/components/relationships/entity-picker";
import { PersonPicker } from "@/components/relationships/relationship-pickers";
import { relationshipAdapters } from "@/components/relationships/relationship-adapters";
import { eventsApi, newsApi } from "@ksu/api-client";

type SectionFormState = {
  page_key: string;
  scope_type: PageScopeType;
  scope_id: string;
  section_key: string;
  title: string;
  subtitle: string;
  description: string;
  settings: Record<string, unknown>;
  layout_variant: PageSectionLayoutVariant;
  display_order: number;
  is_enabled: boolean;
  valid_from: string;
  valid_to: string;
  status: PageSectionStatus;
};

type SectionItemDraft = {
  client_id: string;
  id?: string;
  item_type: SectionItemType;
  title: string;
  subtitle: string;
  body_text: string;
  content: Record<string, unknown>;
  content_enriched?: SectionItem["content_enriched"];
  cta_label: string;
  cta_url: string;
  cta_description: string;
  media_caption: string;
  media_alt_text: string;
  video_provider: string;
  video_url: string;
  video_duration_seconds: string;
  display_order: number;
  is_enabled: boolean;
  pending_attachments: PendingMediaAttachment[];
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

function createEmptySectionForm(): SectionFormState {
  return {
    page_key: "homepage",
    scope_type: "university",
    scope_id: "",
    section_key: "",
    title: "",
    subtitle: "",
    description: "",
    settings: {},
    layout_variant: PAGE_SECTION_LAYOUT_VARIANTS[0],
    display_order: 100,
    is_enabled: true,
    valid_from: "",
    valid_to: "",
    status: "draft",
  };
}

function createItemDraft(item?: SectionItem): SectionItemDraft {
  return {
    client_id: crypto.randomUUID(),
    id: item?.id,
    item_type: item?.item_type ?? SECTION_ITEM_TYPES[0],
    title: item?.title ?? "",
    subtitle: item?.subtitle ?? "",
    body_text: item?.body_text ?? "",
    content: (item?.content as Record<string, unknown> | null) ?? {},
    content_enriched: item?.content_enriched ?? null,
    cta_label: item?.cta_label ?? "",
    cta_url: item?.cta_url ?? "",
    cta_description: item?.cta_description ?? "",
    media_caption: item?.media_caption ?? "",
    media_alt_text: item?.media_alt_text ?? "",
    video_provider: item?.video_provider ?? "",
    video_url: item?.video_url ?? "",
    video_duration_seconds:
      item?.video_duration_seconds === null || item?.video_duration_seconds === undefined
        ? ""
        : String(item.video_duration_seconds),
    display_order: item?.display_order ?? 100,
    is_enabled: item?.is_enabled ?? true,
    pending_attachments: [],
  };
}

function leadershipContentValue(item: SectionItemDraft, key: string) {
  const value = item.content?.[key];
  return typeof value === "string" ? value : "";
}

function withLeadershipContent(
  item: SectionItemDraft,
  patch: Record<string, string | null>,
): SectionItemDraft {
  const content = { ...(item.content ?? {}) };
  for (const [key, value] of Object.entries(patch)) {
    if (value) {
      content[key] = value;
    } else {
      delete content[key];
    }
  }
  return { ...item, content };
}

function formFromSection(section: PageSection): SectionFormState {
  return {
    page_key: section.page_key,
    scope_type: section.scope_type,
    scope_id: section.scope_id ?? "",
    section_key: section.section_key,
    title: section.title ?? "",
    subtitle: section.subtitle ?? "",
    description: section.description ?? "",
    settings: (section.settings as Record<string, unknown> | null) ?? {},
    layout_variant: section.layout_variant,
    display_order: section.display_order,
    is_enabled: section.is_enabled,
    valid_from: toDateTimeInput(section.valid_from),
    valid_to: toDateTimeInput(section.valid_to),
    status: section.status,
  };
}

function itemPayloadFromDraft(item: SectionItemDraft): SectionItemPayload {
  return {
    item_type: item.item_type,
    title: item.title || null,
    subtitle: item.subtitle || null,
    body_text: item.body_text || null,
    content: Object.keys(item.content ?? {}).length ? item.content : {},
    cta_label: item.cta_label || null,
    cta_url: item.cta_url || null,
    cta_description: item.cta_description || null,
    media_caption: item.media_caption || null,
    media_alt_text: item.media_alt_text || null,
    video_provider: item.video_provider || null,
    video_url: item.video_url || null,
    video_duration_seconds: item.video_duration_seconds ? Number(item.video_duration_seconds) : null,
    display_order: item.display_order,
    is_enabled: item.is_enabled,
  };
}

function isEmptyItemDraft(item: SectionItemDraft) {
  return (
    !item.title.trim() &&
    !item.subtitle.trim() &&
    !item.body_text.trim() &&
    !item.cta_label.trim() &&
    !item.cta_url.trim() &&
    !item.cta_description.trim() &&
    !item.media_caption.trim() &&
    !item.media_alt_text.trim() &&
    !item.video_provider.trim() &&
    !item.video_url.trim() &&
    !item.video_duration_seconds.trim() &&
    !Object.keys(item.content ?? {}).length &&
    !item.pending_attachments.length
  );
}

function workflowButtonsForStatus(status: PageSectionStatus) {
  const buttons: PageSectionWorkflowAction[] = [];
  if (status === "draft" || status === "changes_requested") buttons.push("submit");
  if (status === "in_review") buttons.push("approve", "request_changes");
  if (status === "approved") buttons.push("publish");
  if (status === "published") buttons.push("unpublish");
  if (status !== "archived") buttons.push("archive");
  return buttons;
}

function scopeLabel(scopeType: PageScopeType) {
  if (scopeType === "school") return "School";
  if (scopeType === "research") return "Research scope";
  if (scopeType === "library") return "Library branch";
  return "University";
}

function SectionScopePicker({
  scopeType,
  value,
  disabled,
  onChange,
}: {
  scopeType: PageScopeType;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  if (scopeType === "university") {
    return (
      <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
        This section is managed at university level and does not need a related record.
      </div>
    );
  }

  if (scopeType === "school") {
    return (
      <SchoolPicker
        value={value}
        onChange={(id) => onChange(id)}
        disabled={disabled}
        required
        allowClear={false}
        label="School"
        description="Choose the school this page section belongs to."
        placeholder="Select school"
      />
    );
  }

  if (scopeType === "research") {
    return (
      <ResearchCenterPicker
        value={value}
        onChange={(id) => onChange(id)}
        disabled={disabled}
        label="Research scope"
        description="Optionally bind this section to a research centre. Leave blank for the main research homepage."
        placeholder="Main research homepage"
      />
    );
  }

  return (
    <LibraryBranchPicker
      value={value}
      onChange={(id) => onChange(id)}
      disabled={disabled}
      filters={{ active_only: false }}
      label="Library branch"
      description="Optionally bind this section to a library branch. Leave blank for the main library homepage."
      placeholder="Main library homepage"
    />
  );
}

function slugifyTitle(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `leadership-activity-${Date.now()}`;
}

function LeadershipActivityControls({
  item,
  disabled,
  onChange,
}: {
  item: SectionItemDraft;
  disabled?: boolean;
  onChange: (item: SectionItemDraft) => void;
}) {
  const [createType, setCreateType] = useState<"news" | "event" | null>(null);
  const linkedType = leadershipContentValue(item, "linked_content_type") as "news" | "event" | "";
  const linkedId = leadershipContentValue(item, "linked_content_id");
  const staff = item.content_enriched?.staff_profile;
  const linked = item.content_enriched?.linked_content;

  return (
    <div className="rounded-2xl border bg-primary/5 p-4">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold">Leadership activity relationship</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Attach the leader profile and connect the activity to a newsroom story or event record.
          </p>
        </div>
        <Badge variant="secondary">leadership activity</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <PersonPicker
            value={leadershipContentValue(item, "staff_profile_id")}
            onChange={(value) => onChange(withLeadershipContent(item, { staff_profile_id: value || null }))}
            disabled={disabled}
            filters={{ status: "active" }}
            label="Staff profile"
            description="The selected profile image is used automatically for this activity card."
            placeholder="Select VC, DVC, dean, director, or staff profile"
            allowClear
          />
          {staff?.photo_url ? (
            <div className="flex items-center gap-3 rounded-xl border bg-background/80 p-3">
              <div className="size-14 overflow-hidden rounded-xl border bg-muted">
                <ImageRenderer src={staff.photo_url} alt={staff.display_name ?? staff.full_name ?? "Staff profile"} className="h-full border-0" imageClassName="h-full w-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{staff.display_name ?? staff.full_name}</p>
                <p className="truncate text-xs text-muted-foreground">{staff.institutional_role ?? staff.email ?? "Profile image attached"}</p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-[150px_minmax(0,1fr)]">
            <div className="space-y-2">
              <p className="text-sm font-medium">Linked record type</p>
              <Select
                value={linkedType || "news"}
                disabled={disabled}
                onValueChange={(value) =>
                  onChange(withLeadershipContent(item, {
                    linked_content_type: value,
                    linked_content_id: null,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="news">News</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Linked news/event</p>
              <EntityPicker
                adapter={relationshipAdapters[linkedType === "event" ? "event" : "news"] as any}
                value={linkedId}
                onChange={(value) =>
                  onChange(withLeadershipContent(item, {
                    linked_content_type: linkedType || "news",
                    linked_content_id: value || null,
                  }))
                }
                filters={{ is_main: true }}
                disabled={disabled}
                placeholder={linkedType === "event" ? "Select related event" : "Select related news"}
                allowClear
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => setCreateType("news")}>
              Create news
            </Button>
            <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => setCreateType("event")}>
              Create event
            </Button>
            {linked?.href ? (
              <Button type="button" variant="ghost" size="sm" asChild>
                <a href={linked.href} target="_blank" rel="noreferrer">
                  <ExternalLink data-icon="inline-start" />
                  Preview linked
                </a>
              </Button>
            ) : null}
          </div>

          {linked ? (
            <p className="rounded-xl border bg-background/80 p-3 text-sm text-muted-foreground">
              Linked to <span className="font-medium text-foreground">{linked.title}</span>
            </p>
          ) : null}
        </div>
      </div>

      <LeadershipLinkedContentDialog
        type={createType}
        seedTitle={item.title}
        seedSummary={item.body_text}
        onOpenChange={(open) => {
          if (!open) setCreateType(null);
        }}
        onCreated={(type, id) => {
          onChange(withLeadershipContent(item, {
            linked_content_type: type,
            linked_content_id: id,
          }));
          setCreateType(null);
        }}
      />
    </div>
  );
}

function LeadershipLinkedContentDialog({
  type,
  seedTitle,
  seedSummary,
  onOpenChange,
  onCreated,
}: {
  type: "news" | "event" | null;
  seedTitle: string;
  seedSummary: string;
  onOpenChange: (open: boolean) => void;
  onCreated: (type: "news" | "event", id: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [startDate, setStartDate] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    if (!type) return;
    setTitle(seedTitle || "");
    setSummary(seedSummary || "");
    setStartDate("");
    setLocation("");
  }, [seedSummary, seedTitle, type]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!type) throw new Error("Missing content type");
      const cleanTitle = title.trim();
      if (!cleanTitle) throw new Error("Title is required");
      const basePayload = {
        title: cleanTitle,
        slug: slugifyTitle(cleanTitle),
        summary: summary.trim() || null,
        plain_text: summary.trim() || null,
        is_main: true,
        scope_type: "university",
        scope_id: null,
      };
      if (type === "news") {
        return { type, response: await newsApi.create(basePayload) };
      }
      if (!startDate) throw new Error("Event start date is required");
      return {
        type,
        response: await eventsApi.create({
          ...basePayload,
          start_date: new Date(startDate).toISOString(),
          location: location.trim() || null,
          is_virtual: false,
        }),
      };
    },
    onSuccess: ({ type: createdType, response }) => {
      const created = response.data;
      toast.success(`${createdType === "news" ? "News" : "Event"} draft created`);
      onCreated(createdType, created.id);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create linked content");
    },
  });

  return (
    <Dialog open={Boolean(type)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create linked {type === "event" ? "event" : "news"}</DialogTitle>
          <DialogDescription>
            Creates a draft main-site record and links it to this leadership activity item.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Title</p>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Leadership activity title" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Summary</p>
            <Textarea rows={4} value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Short news/event summary" />
          </div>
          {type === "event" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Start date</p>
                <DateTimePicker mode="datetime-local" value={startDate} onChange={setStartDate} placeholder="Select event date" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Location</p>
                <Input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Venue or campus" />
              </div>
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? "Creating..." : `Create ${type === "event" ? "event" : "news"} draft`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function PageCmsSectionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { hasAnyPermission, hasPermission } = usePermissions();
  const commitPendingAttachments = useCommitPendingAttachments();
  const sectionId = String(params?.id ?? "");
  const isNew = sectionId === "new";
  const [form, setForm] = useState<SectionFormState>(createEmptySectionForm());
  const [section, setSection] = useState<PageSection | null>(null);
  const [items, setItems] = useState<SectionItemDraft[]>([createItemDraft()]);
  const [pendingSectionAttachments, setPendingSectionAttachments] = useState<PendingMediaAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [workflowBusy, setWorkflowBusy] = useState<PageSectionWorkflowAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canManageSection = hasAnyPermission([
    "page_sections.create",
    "page_sections.update",
    "page_sections.manage",
    "homepage.manage",
    "school_homepage.manage",
    "research_homepage.manage",
    "library_homepage.manage",
  ]);
  const canManageItems = hasAnyPermission([
    "section_items.manage",
    "page_sections.manage",
    "homepage.manage",
    "school_homepage.manage",
    "research_homepage.manage",
    "library_homepage.manage",
  ]);
  const canReview = hasAnyPermission(["page_sections.review", "page_sections.manage"]);
  const canPublish = hasAnyPermission(["page_sections.publish", "page_sections.manage", "homepage.publish"]);
  const canArchive = hasAnyPermission([
    "page_sections.delete",
    "page_sections.manage",
    "homepage.manage",
    "school_homepage.manage",
    "research_homepage.manage",
    "library_homepage.manage",
  ]);

  const availableWorkflowActions = useMemo(() => {
    if (isNew) return [];
    return workflowButtonsForStatus(form.status).filter((action) => {
      if (action === "approve" || action === "request_changes") return canReview;
      if (action === "publish" || action === "unpublish") return canPublish;
      if (action === "archive") return canArchive;
      return canManageSection;
    });
  }, [canArchive, canManageSection, canPublish, canReview, form.status, isNew]);

  useEffect(() => {
    if (isNew) {
      setSection(null);
      setForm(createEmptySectionForm());
      setItems([createItemDraft()]);
      setPendingSectionAttachments([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await pageSectionsApi.get(sectionId);
        if (cancelled) return;
        const nextSection = response.data ?? null;
        if (!nextSection) throw new Error("Missing section");
        setSection(nextSection);
        setForm(formFromSection(nextSection));
        setItems(nextSection.items.length ? nextSection.items.map((item) => createItemDraft(item)) : [createItemDraft()]);
        setPendingSectionAttachments([]);
      } catch {
        if (!cancelled) {
          setError("Failed to load section details.");
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
  }, [isNew, sectionId]);

  const persistAttachments = async (
    entityType: "page_section" | "section_item",
    entityId: string,
    attachments: PendingMediaAttachment[],
  ) => {
    if (!attachments.length) return;
    await commitPendingAttachments({
      entityType,
      entityId,
      attachments,
    });
  };

  const handleSave = async () => {
    if (!canManageSection) {
      toast.error("You do not have permission to update page sections.");
      return;
    }

    if (!form.page_key.trim() || !form.section_key.trim()) {
      toast.error("Page key and section key are required.");
      return;
    }

    if (form.scope_type === "school" && !form.scope_id.trim()) {
      toast.error("A school-scoped section requires a scope ID.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const sectionPayload = {
        page_key: form.page_key.trim(),
        scope_type: form.scope_type,
        scope_id: form.scope_id.trim() || null,
        section_key: form.section_key.trim(),
        title: form.title.trim() || null,
        subtitle: form.subtitle.trim() || null,
        description: form.description.trim() || null,
        settings: form.settings,
        layout_variant: form.layout_variant,
        display_order: form.display_order,
        is_enabled: form.is_enabled,
        valid_from: fromDateTimeInput(form.valid_from),
        valid_to: fromDateTimeInput(form.valid_to),
      };

      const savedSection = isNew
        ? (await pageSectionsApi.create(sectionPayload)).data
        : (await pageSectionsApi.update(sectionId, sectionPayload)).data;

      await persistAttachments("page_section", savedSection.id, pendingSectionAttachments);

      const creatableItems = items.filter((item) => item.id || !isEmptyItemDraft(item));
      const nextItems: SectionItemDraft[] = [];
      for (const item of creatableItems) {
        const payload = itemPayloadFromDraft(item);
        const savedItem = item.id
          ? (await sectionItemsApi.update(item.id, payload)).data
          : (await sectionItemsApi.create(savedSection.id, payload)).data;
        await persistAttachments("section_item", savedItem.id, item.pending_attachments);
        nextItems.push(createItemDraft(savedItem));
      }

      setPendingSectionAttachments([]);
      setSection(savedSection);
      setItems(nextItems.length ? nextItems : [createItemDraft()]);
      setForm(formFromSection(savedSection));
      toast.success(isNew ? "Page section created." : "Page section updated.");

      if (isNew) {
        router.replace(`/corporate-communication/page-cms/sections/${savedSection.id}`);
      }
    } catch {
      toast.error("Failed to save the page section.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleWorkflow = async (action: PageSectionWorkflowAction) => {
    if (isNew) return;
    if (action === "archive" && !canArchive) {
      toast.error("You do not have permission to archive page sections.");
      return;
    }
    if ((action === "approve" || action === "request_changes") && !canReview) {
      toast.error("You do not have permission to review page sections.");
      return;
    }
    if ((action === "publish" || action === "unpublish") && !canPublish) {
      toast.error("You do not have permission to publish page sections.");
      return;
    }
    setWorkflowBusy(action);
    try {
      const response = await pageSectionsApi.workflow(sectionId, action);
      setSection(response.data);
      setForm(formFromSection(response.data));
      toast.success(`Section ${action.replace(/_/g, " ")} complete.`);
    } catch {
      toast.error(`Failed to ${action.replace(/_/g, " ")} section.`);
    } finally {
      setWorkflowBusy(null);
    }
  };

  const sectionTitle = isNew ? "New Page Section" : section?.title || section?.section_key || "Edit Page Section";

  return (
    <PageTransition>
      <PageHeader
        title={isNew ? "Create Page Section" : "Edit Page Section"}
        description={isNew ? "Compose section settings, items, attachments, and workflow metadata." : `Editing: ${sectionTitle}`}
        backHref="/corporate-communication/page-cms/sections"
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
            <Button type="button" disabled={!canManageSection || isSaving || isLoading} onClick={() => void handleSave()}>
              {isSaving ? "Saving..." : isNew ? "Create Section" : "Save Changes"}
            </Button>
          </div>
        )}
      />

      <section className="mb-6 overflow-hidden rounded-3xl border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(248,250,252,0.86))] p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_32%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.86))] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <Sparkles className="size-3.5 text-orange-600" />
              Section editor
            </div>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{sectionTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Configure scope, layout, media roles and item-level content using the Page CMS backend workflow.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <DetailMetric label="Items" value={items.filter((item) => !isEmptyItemDraft(item)).length} />
            <DetailMetric label="Order" value={form.display_order} />
            <DetailMetric label="Status" value={form.status.replace(/_/g, " ")} />
          </div>
        </div>
      </section>

      {error ? (
        <Card className="mb-6 border-destructive/30">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
        <div className="space-y-6">
          <Card className="overflow-hidden border-white/70 bg-white/90 shadow-sm backdrop-blur dark:border-white/10 dark:bg-background/90">
            <CardHeader>
              <CardTitle>Section Configuration</CardTitle>
              <CardDescription>Define where this section renders and how it behaves in the composition workflow.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Page Key</p>
                <Input
                  value={form.page_key}
                  disabled={!canManageSection || isLoading}
                  onChange={(event) => setForm((current) => ({ ...current, page_key: event.target.value }))}
                  placeholder="homepage"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Section Key</p>
                <Input
                  value={form.section_key}
                  disabled={!canManageSection || isLoading}
                  onChange={(event) => setForm((current) => ({ ...current, section_key: event.target.value }))}
                  placeholder="hero"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Scope Type</p>
                <Select
                  value={form.scope_type}
                  disabled={!canManageSection || isLoading}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      scope_type: value as PageScopeType,
                      scope_id: value === current.scope_type ? current.scope_id : "",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select scope type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {PAGE_SCOPE_TYPES.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">{scopeLabel(form.scope_type)}</p>
                <SectionScopePicker
                  scopeType={form.scope_type}
                  value={form.scope_id}
                  disabled={!canManageSection || isLoading}
                  onChange={(scopeId) => setForm((current) => ({ ...current, scope_id: scopeId }))}
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Title</p>
                <Input
                  value={form.title}
                  disabled={!canManageSection || isLoading}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Homepage Hero"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Subtitle</p>
                <Input
                  value={form.subtitle}
                  disabled={!canManageSection || isLoading}
                  onChange={(event) => setForm((current) => ({ ...current, subtitle: event.target.value }))}
                  placeholder="Supporting section subtitle"
                />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <p className="text-sm font-medium">Description</p>
                <Textarea
                  rows={4}
                  value={form.description}
                  disabled={!canManageSection || isLoading}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Section-level copy for this composition block"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Layout Variant</p>
                <Select
                  value={form.layout_variant}
                  disabled={!canManageSection || isLoading}
                  onValueChange={(value) => setForm((current) => ({ ...current, layout_variant: value as PageSectionLayoutVariant }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select layout variant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {PAGE_SECTION_LAYOUT_VARIANTS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Display Order</p>
                <Input
                  type="number"
                  value={form.display_order}
                  disabled={!canManageSection || isLoading}
                  onChange={(event) => setForm((current) => ({ ...current, display_order: Number(event.target.value || 0) }))}
                />
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
                <p className="text-sm font-medium">Valid From</p>
                <DateTimePicker
                  mode="datetime-local"
                  value={form.valid_from}
                  disabled={!canManageSection || isLoading}
                  onChange={(value) => setForm((current) => ({ ...current, valid_from: value }))}
                  placeholder="Select start date"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Valid To</p>
                <DateTimePicker
                  mode="datetime-local"
                  value={form.valid_to}
                  disabled={!canManageSection || isLoading}
                  onChange={(value) => setForm((current) => ({ ...current, valid_to: value }))}
                  placeholder="Select end date"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3 lg:col-span-2">
                <div>
                  <p className="text-sm font-medium">Enabled</p>
                  <p className="text-sm text-muted-foreground">Disable the section without changing workflow status.</p>
                </div>
                <Switch
                  checked={form.is_enabled}
                  disabled={!canManageSection || isLoading}
                  onCheckedChange={(checked) => setForm((current) => ({ ...current, is_enabled: checked }))}
                />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Settings</p>
                  <Badge variant="outline">JSON</Badge>
                </div>
                <JsonObjectEditor
                  value={form.settings}
                  onChange={(value) => setForm((current) => ({ ...current, settings: (value as Record<string, unknown>) ?? {} }))}
                  allowCustomFields
                  disabled={!canManageSection || isLoading}
                  emptyLabel="No section settings added."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-white/70 bg-white/90 shadow-sm backdrop-blur dark:border-white/10 dark:bg-background/90">
            <CardHeader>
              <CardTitle>Section Media</CardTitle>
              <CardDescription>Attach assets to the page section using supported frontend roles.</CardDescription>
            </CardHeader>
            <CardContent>
              <AttachmentManager
                entityType="page_section"
                entityId={section?.id}
                roles={MEDIA_ROLE_OPTIONS}
                pendingAttachments={pendingSectionAttachments}
                onPendingAttachmentsChange={setPendingSectionAttachments}
                disabled={!canManageSection || isLoading}
                title="Section Attachments"
                description="Use structured roles like hero image, background, poster, or logo."
              />
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-white/70 bg-white/90 shadow-sm backdrop-blur dark:border-white/10 dark:bg-background/90">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>Section Items</CardTitle>
                <CardDescription>Manage item-level title, subtitle, description, settings JSON, CTA data, and attachments.</CardDescription>
              </div>
              <Button type="button" variant="outline" disabled={!canManageItems || isLoading} onClick={() => setItems((current) => [...current, createItemDraft()])}>
                Add Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <Card key={item.client_id} className={cn("overflow-hidden bg-background shadow-sm", !item.is_enabled ? "border-dashed opacity-80" : undefined)}>
                  <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">Item {index + 1}</CardTitle>
                      <CardDescription>
                        {item.id ? `Saved item ${item.id}` : "Unsaved item"}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={item.is_enabled ? "default" : "secondary"}>
                        {item.is_enabled ? "Enabled" : "Disabled"}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={!canManageItems || isLoading}
                        onClick={() => {
                          if (item.id) {
                            setItems((current) =>
                              current.map((entry) =>
                                entry.client_id === item.client_id ? { ...entry, is_enabled: false } : entry,
                              ),
                            );
                            return;
                          }
                          setItems((current) => current.filter((entry) => entry.client_id !== item.client_id));
                        }}
                      >
                        {item.id ? "Disable Item" : "Remove Item"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Item Type</p>
                        <Select
                          value={item.item_type}
                          disabled={!canManageItems || isLoading}
                          onValueChange={(value) =>
                            setItems((current) =>
                              current.map((entry) =>
                                entry.client_id === item.client_id ? { ...entry, item_type: value as SectionItemType } : entry,
                              ),
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select item type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {SECTION_ITEM_TYPES.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Display Order</p>
                        <Input
                          type="number"
                          value={item.display_order}
                          disabled={!canManageItems || isLoading}
                          onChange={(event) =>
                            setItems((current) =>
                              current.map((entry) =>
                                entry.client_id === item.client_id
                                  ? { ...entry, display_order: Number(event.target.value || 0) }
                                  : entry,
                              ),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Title</p>
                        <Input
                          value={item.title}
                          disabled={!canManageItems || isLoading}
                          onChange={(event) =>
                            setItems((current) =>
                              current.map((entry) =>
                                entry.client_id === item.client_id ? { ...entry, title: event.target.value } : entry,
                              ),
                            )
                          }
                          placeholder="Section item title"
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Subtitle</p>
                        <Input
                          value={item.subtitle}
                          disabled={!canManageItems || isLoading}
                          onChange={(event) =>
                            setItems((current) =>
                              current.map((entry) =>
                                entry.client_id === item.client_id ? { ...entry, subtitle: event.target.value } : entry,
                              ),
                            )
                          }
                          placeholder="Supporting subtitle"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Description</p>
                      <Textarea
                        rows={4}
                        value={item.body_text}
                        disabled={!canManageItems || isLoading}
                        onChange={(event) =>
                          setItems((current) =>
                            current.map((entry) =>
                              entry.client_id === item.client_id ? { ...entry, body_text: event.target.value } : entry,
                            ),
                          )
                        }
                        placeholder="Body copy or description for this item"
                      />
                    </div>

                    {form.layout_variant === "leadership_activity" ? (
                      <LeadershipActivityControls
                        item={item}
                        disabled={!canManageItems || isLoading}
                        onChange={(nextItem) =>
                          setItems((current) =>
                            current.map((entry) =>
                              entry.client_id === item.client_id ? nextItem : entry,
                            ),
                          )
                        }
                      />
                    ) : null}

                    <div className="grid gap-4 lg:grid-cols-3">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">CTA Label</p>
                        <Input
                          value={item.cta_label}
                          disabled={!canManageItems || isLoading}
                          onChange={(event) =>
                            setItems((current) =>
                              current.map((entry) =>
                                entry.client_id === item.client_id ? { ...entry, cta_label: event.target.value } : entry,
                              ),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">CTA URL</p>
                        <Input
                          value={item.cta_url}
                          disabled={!canManageItems || isLoading}
                          onChange={(event) =>
                            setItems((current) =>
                              current.map((entry) =>
                                entry.client_id === item.client_id ? { ...entry, cta_url: event.target.value } : entry,
                              ),
                            )
                          }
                          placeholder="https:// or /path"
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">CTA Description</p>
                        <Input
                          value={item.cta_description}
                          disabled={!canManageItems || isLoading}
                          onChange={(event) =>
                            setItems((current) =>
                              current.map((entry) =>
                                entry.client_id === item.client_id ? { ...entry, cta_description: event.target.value } : entry,
                              ),
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Video Provider</p>
                        <Input
                          value={item.video_provider}
                          disabled={!canManageItems || isLoading}
                          onChange={(event) =>
                            setItems((current) =>
                              current.map((entry) =>
                                entry.client_id === item.client_id ? { ...entry, video_provider: event.target.value } : entry,
                              ),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Video URL</p>
                        <Input
                          value={item.video_url}
                          disabled={!canManageItems || isLoading}
                          onChange={(event) =>
                            setItems((current) =>
                              current.map((entry) =>
                                entry.client_id === item.client_id ? { ...entry, video_url: event.target.value } : entry,
                              ),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Video Duration (seconds)</p>
                        <Input
                          type="number"
                          value={item.video_duration_seconds}
                          disabled={!canManageItems || isLoading}
                          onChange={(event) =>
                            setItems((current) =>
                              current.map((entry) =>
                                entry.client_id === item.client_id
                                  ? { ...entry, video_duration_seconds: event.target.value }
                                  : entry,
                              ),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Media Caption</p>
                        <Input
                          value={item.media_caption}
                          disabled={!canManageItems || isLoading}
                          onChange={(event) =>
                            setItems((current) =>
                              current.map((entry) =>
                                entry.client_id === item.client_id ? { ...entry, media_caption: event.target.value } : entry,
                              ),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2 lg:col-span-2">
                        <p className="text-sm font-medium">Media Alt Text</p>
                        <Input
                          value={item.media_alt_text}
                          disabled={!canManageItems || isLoading}
                          onChange={(event) =>
                            setItems((current) =>
                              current.map((entry) =>
                                entry.client_id === item.client_id ? { ...entry, media_alt_text: event.target.value } : entry,
                              ),
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Settings JSON</p>
                        <Badge variant="outline">content</Badge>
                      </div>
                      <JsonObjectEditor
                        value={item.content}
                        onChange={(value) =>
                          setItems((current) =>
                            current.map((entry) =>
                              entry.client_id === item.client_id
                                ? { ...entry, content: (value as Record<string, unknown>) ?? {} }
                                : entry,
                            ),
                          )
                        }
                        allowCustomFields
                        disabled={!canManageItems || isLoading}
                        emptyLabel="No item settings added."
                      />
                    </div>

                    <AttachmentManager
                      entityType="section_item"
                      entityId={item.id}
                      roles={MEDIA_ROLE_OPTIONS}
                      pendingAttachments={item.pending_attachments}
                      onPendingAttachmentsChange={(attachments) =>
                        setItems((current) =>
                          current.map((entry) =>
                            entry.client_id === item.client_id ? { ...entry, pending_attachments: attachments } : entry,
                          ),
                        )
                      }
                      disabled={!canManageItems || isLoading}
                      title="Item Attachments"
                      description="Attach media assets for this section item."
                    />
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden border-white/70 bg-white/90 shadow-sm backdrop-blur dark:border-white/10 dark:bg-background/90">
            <CardHeader>
              <CardTitle>Workflow Summary</CardTitle>
              <CardDescription>Current lifecycle status and permission-sensitive actions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium text-muted-foreground">Current status</p>
                <p className="mt-2 text-xl font-semibold">{form.status.replace(/_/g, " ")}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {PAGE_SECTION_STATUSES.map((status) => (
                    <Badge key={status} variant={status === form.status ? "default" : "outline"}>
                      {status.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Review permissions: {canReview ? "available" : "not available"}</p>
                <p>Publish permissions: {canPublish ? "available" : "not available"}</p>
                <p>Section update permissions: {canManageSection ? "available" : "not available"}</p>
                <p>Item management permissions: {canManageItems ? "available" : "not available"}</p>
                {hasPermission("homepage.publish") ? <p>Homepage publish override is active.</p> : null}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-white/70 bg-white/90 shadow-sm backdrop-blur dark:border-white/10 dark:bg-background/90">
            <CardHeader>
              <CardTitle>Publishing Guidance</CardTitle>
              <CardDescription>Use this summary to confirm the section is ready for the public homepage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Keep the section enabled when it should render after publication.</p>
              <p>Use item order to control how calls to action and supporting content appear in the hero layout.</p>
              <p>Attach media with clear roles so the frontend can select the correct image, background, poster, or gallery asset.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}

function DetailMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="min-w-[112px] rounded-2xl border bg-background/80 p-3 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tracking-tight capitalize">{value}</p>
    </div>
  );
}
