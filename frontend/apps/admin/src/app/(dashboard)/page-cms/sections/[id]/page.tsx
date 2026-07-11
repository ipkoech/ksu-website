"use client";

import { useEffect, useMemo, useState } from "react";
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

function workflowButtonsForStatus(status: PageSectionStatus) {
  const buttons: PageSectionWorkflowAction[] = [];
  if (status === "draft" || status === "changes_requested") buttons.push("submit");
  if (status === "in_review") buttons.push("approve", "request_changes");
  if (status === "approved") buttons.push("publish");
  if (status === "published") buttons.push("unpublish");
  if (status !== "archived") buttons.push("archive");
  return buttons;
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

  const availableWorkflowActions = useMemo(() => {
    if (isNew) return [];
    return workflowButtonsForStatus(form.status).filter((action) => {
      if (action === "approve" || action === "request_changes") return canReview;
      if (action === "publish" || action === "unpublish") return canPublish;
      return canManageSection;
    });
  }, [canManageSection, canPublish, canReview, form.status, isNew]);

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

      const nextItems: SectionItemDraft[] = [];
      for (const item of items) {
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
        router.replace(`/page-cms/sections/${savedSection.id}`);
      }
    } catch {
      toast.error("Failed to save the page section.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleWorkflow = async (action: PageSectionWorkflowAction) => {
    if (isNew) return;
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
        backHref="/page-cms/sections"
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

      {error ? (
        <Card className="mb-6 border-destructive/30">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
        <div className="space-y-6">
          <Card>
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
                  onValueChange={(value) => setForm((current) => ({ ...current, scope_type: value as PageScopeType }))}
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
                <p className="text-sm font-medium">Scope ID</p>
                <Input
                  value={form.scope_id}
                  disabled={!canManageSection || isLoading}
                  onChange={(event) => setForm((current) => ({ ...current, scope_id: event.target.value }))}
                  placeholder={form.scope_type === "school" ? "Required UUID for school scope" : "Optional UUID"}
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
                <Input
                  type="datetime-local"
                  value={form.valid_from}
                  disabled={!canManageSection || isLoading}
                  onChange={(event) => setForm((current) => ({ ...current, valid_from: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Valid To</p>
                <Input
                  type="datetime-local"
                  value={form.valid_to}
                  disabled={!canManageSection || isLoading}
                  onChange={(event) => setForm((current) => ({ ...current, valid_to: event.target.value }))}
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

          <Card>
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

          <Card>
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
                <Card key={item.client_id} className={!item.is_enabled ? "border-dashed opacity-80" : undefined}>
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
          <Card>
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

          <Card>
            <CardHeader>
              <CardTitle>Save Notes</CardTitle>
              <CardDescription>Behavior notes for this admin surface.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Saved items can be disabled directly from this editor. The current backend does not expose a dedicated item delete route.</p>
              <p>Section details load from the dedicated admin read endpoint, so this editor does not depend on paginated list results.</p>
              <p>Media links persist after save for both the section record and each saved item.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
