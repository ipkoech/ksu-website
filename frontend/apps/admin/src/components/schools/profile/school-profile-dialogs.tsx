"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ApiClientError,
  resolveMainMediaUrl,
  schoolPortalApi,
  schoolPortalQueryKeys,
  type Media,
  type SchoolPortalMediaSummary,
  type SchoolPortalProfile,
  type SchoolPortalProfileUpdate,
} from "@ksu/api-client";
import { ArrowDown, ArrowUp, Loader2, RotateCcw, Trash2 } from "lucide-react";
import {
  Alert,
  AlertDescription,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  ImageRenderer,
  Label,
  Progress,
  Switch,
  Textarea,
} from "@ksu/ui/components";
import { MediaPicker } from "@/components/media/media-picker";
import { useSchoolPortal } from "@/components/schools/school-portal-provider";

export type ProfileDialogSection =
  | "overview"
  | "leadership"
  | "story"
  | "purpose"
  | "contacts"
  | "media"
  | "visibility";

export type SchoolProfileDraft = SchoolPortalProfileUpdate & {
  dean_id?: string | null;
  logo_image_id?: string | null;
  cover_image_id?: string | null;
  brochure_id?: string | null;
  media_descriptions?: Record<string, string>;
};

const SECTION_COPY: Record<
  ProfileDialogSection,
  { title: string; description: string }
> = {
  overview: {
    title: "Edit overview",
    description: "Maintain the core facts shown across the school profile.",
  },
  leadership: {
    title: "Edit leadership",
    description: "Assign the dean from an existing university person record.",
  },
  story: {
    title: "Edit message and about",
    description:
      "Tell visitors what the school does and share the dean's message.",
  },
  purpose: {
    title: "Edit purpose",
    description: "Maintain the mission, vision, mandate, and core values.",
  },
  contacts: {
    title: "Edit contacts",
    description: "Keep the public contact and location information current.",
  },
  media: {
    title: "Manage profile media",
    description:
      "Select branded images and documents from the shared media library.",
  },
  visibility: {
    title: "Edit visibility",
    description:
      "Control whether the school profile is visible on the public website.",
  },
};

type Draft = SchoolProfileDraft;

export function schoolProfileDraftFrom(
  profile: SchoolPortalProfile,
): SchoolProfileDraft {
  const media = [
    profile.logo_image,
    profile.cover_image,
    profile.brochure,
    ...profile.gallery,
  ].filter((item): item is SchoolPortalMediaSummary => item !== null);
  return {
    establishment_date: profile.establishment_date,
    about: profile.about,
    head_message: profile.head_message,
    mission: profile.mission,
    vision: profile.vision,
    mandate: profile.mandate,
    core_values: profile.core_values,
    email: profile.email,
    phone: profile.phone,
    office_location: profile.office_location,
    website: profile.website,
    is_public: profile.is_public,
    dean_id: profile.dean_id,
    logo_image_id: profile.logo_image_id,
    cover_image_id: profile.cover_image_id,
    brochure_id: profile.brochure_id,
    media_descriptions: Object.fromEntries(
      media.map((item) => [item.id, item.description ?? ""]),
    ),
  };
}

export function SchoolProfileDialog({
  section,
  profile,
  open,
  onOpenChange,
}: {
  section: ProfileDialogSection;
  profile: SchoolPortalProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { school } = useSchoolPortal();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft>(() =>
    schoolProfileDraftFrom(profile),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [galleryIds, setGalleryIds] = useState(() =>
    profile.gallery.map((item) => item.id),
  );

  useEffect(() => {
    if (!open) return;
    setDraft(schoolProfileDraftFrom(profile));
    setGalleryIds(profile.gallery.map((item) => item.id));
    setFieldErrors({});
  }, [open, profile]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (section === "leadership" && draft.dean_id) {
        return (await schoolPortalApi.profile.setDean(draft.dean_id)).data;
      }
      if (section === "media") {
        const links = [
          draft.logo_image_id
            ? { id: draft.logo_image_id, role: "logo" as const, order: 0 }
            : null,
          draft.cover_image_id
            ? { id: draft.cover_image_id, role: "cover" as const, order: 0 }
            : null,
          draft.brochure_id
            ? { id: draft.brochure_id, role: "brochure" as const, order: 0 }
            : null,
          ...galleryIds.map((id, order) => ({
            id,
            role: "gallery" as const,
            order,
          })),
        ].filter((item): item is NonNullable<typeof item> => item !== null);
        let result = profile;
        for (const item of links) {
          result = (
            await schoolPortalApi.profile.linkMedia(
              item.id,
              item.role,
              item.order,
            )
          ).data;
        }
        await Promise.all(
          links.map((item) =>
            schoolPortalApi.media.update(item.id, {
              description:
                draft.media_descriptions?.[item.id]?.trim() || null,
            }),
          ),
        );
        return result;
      }

      const fields: Record<
        Exclude<ProfileDialogSection, "leadership" | "media">,
        Array<keyof Draft>
      > = {
        overview: ["establishment_date"],
        story: ["about", "head_message"],
        purpose: ["mission", "vision", "mandate", "core_values"],
        contacts: ["email", "phone", "office_location", "website"],
        visibility: ["is_public"],
      };
      const payload = Object.fromEntries(
        fields[section as keyof typeof fields].map((key) => [key, draft[key]]),
      ) as SchoolPortalProfileUpdate;
      return (await schoolPortalApi.profile.update(payload)).data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: schoolPortalQueryKeys.profile(school.id),
        }),
        queryClient.invalidateQueries({
          queryKey: schoolPortalQueryKeys.root(school.id),
        }),
        queryClient.invalidateQueries({
          queryKey: schoolPortalQueryKeys.bootstrap,
        }),
      ]);
      onOpenChange(false);
    },
    onError: (error) => {
      setFieldErrors(
        error instanceof ApiClientError && error.errors
          ? error.errors
          : {
              form: [
                error instanceof Error
                  ? error.message
                  : "Unable to save changes",
              ],
            },
      );
    },
  });
  const copy = SECTION_COPY[section];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>
        {fieldErrors.form ? (
          <Alert variant="destructive">
            <AlertDescription>{fieldErrors.form.join(" ")}</AlertDescription>
          </Alert>
        ) : null}
        <div className="space-y-4 py-2">
          {section === "overview" ? (
            <ProfileField
              label="Establishment date"
              type="date"
              value={draft.establishment_date}
              error={fieldErrors.establishment_date}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  establishment_date: value,
                }))
              }
            />
          ) : null}
          {section === "leadership" ? (
            <ProfileField
              label="Dean person ID"
              value={draft.dean_id}
              error={fieldErrors.person_id}
              onChange={(value) =>
                setDraft((current) => ({ ...current, dean_id: value }))
              }
              helper="Use the ID of an active university person record."
            />
          ) : null}
          {section === "story" ? (
            <>
              <ProfileArea
                label="Dean's message"
                value={draft.head_message}
                error={fieldErrors.head_message}
                onChange={(value) =>
                  setDraft((current) => ({ ...current, head_message: value }))
                }
              />
              <ProfileArea
                label="About the school"
                value={draft.about}
                error={fieldErrors.about}
                onChange={(value) =>
                  setDraft((current) => ({ ...current, about: value }))
                }
              />
            </>
          ) : null}
          {section === "purpose" ? (
            <>
              {(["mission", "vision", "mandate", "core_values"] as const).map(
                (field) => (
                  <ProfileArea
                    key={field}
                    label={
                      field === "core_values"
                        ? "Core values"
                        : field[0].toUpperCase() + field.slice(1)
                    }
                    value={draft[field]}
                    error={fieldErrors[field]}
                    onChange={(value) =>
                      setDraft((current) => ({ ...current, [field]: value }))
                    }
                  />
                ),
              )}
            </>
          ) : null}
          {section === "contacts" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {(["email", "phone", "office_location", "website"] as const).map(
                (field) => (
                  <ProfileField
                    key={field}
                    label={
                      field === "office_location"
                        ? "Office location"
                        : field[0].toUpperCase() + field.slice(1)
                    }
                    value={draft[field]}
                    error={fieldErrors[field]}
                    onChange={(value) =>
                      setDraft((current) => ({ ...current, [field]: value }))
                    }
                  />
                ),
              )}
            </div>
          ) : null}
          {section === "media" ? (
            <SchoolMediaPicker
              profile={profile}
              draft={draft}
              onDraftChange={setDraft}
              galleryIds={galleryIds}
              onGalleryChange={setGalleryIds}
              saving={mutation.isPending}
              failed={mutation.isError}
            />
          ) : null}
          {section === "visibility" ? (
            <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
              <div>
                <Label htmlFor="school-public">Public school profile</Label>
                <p className="mt-1 text-sm text-muted-foreground">
                  Visitors can view the school page when this is enabled.
                </p>
              </div>
              <Switch
                id="school-public"
                checked={draft.is_public ?? false}
                onCheckedChange={(checked) =>
                  setDraft((current) => ({ ...current, is_public: checked }))
                }
              />
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="cursor-pointer"
            disabled={
              mutation.isPending || (section === "leadership" && !draft.dean_id)
            }
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProfileField({
  label,
  value,
  onChange,
  error,
  helper,
  type = "text",
}: {
  label: string;
  value?: string | null;
  onChange: (value: string) => void;
  error?: string[];
  helper?: string;
  type?: string;
}) {
  const id = `profile-${label.toLowerCase().replaceAll(" ", "-")}`;
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value ?? ""}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {helper ? (
        <p className="text-xs text-muted-foreground">{helper}</p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error.join(" ")}
        </p>
      ) : null}
    </div>
  );
}

function ProfileArea({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value?: string | null;
  onChange: (value: string) => void;
  error?: string[];
}) {
  const id = `profile-${label.toLowerCase().replaceAll(" ", "-")}`;
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        rows={5}
        value={value ?? ""}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p className="text-xs text-destructive">{error.join(" ")}</p>
      ) : null}
    </div>
  );
}

export function SchoolMediaPicker({
  profile,
  draft,
  onDraftChange,
  galleryIds,
  onGalleryChange,
  saving,
  failed,
}: {
  profile: SchoolPortalProfile;
  draft: Draft;
  onDraftChange: (draft: Draft) => void;
  galleryIds: string[];
  onGalleryChange: (ids: string[]) => void;
  saving: boolean;
  failed: boolean;
}) {
  const [pendingGalleryId, setPendingGalleryId] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<Record<string, Media>>({});
  const mediaById = useMemo(
    () =>
      new Map<string, SchoolPortalMediaSummary>(
        [
          profile.logo_image,
          profile.cover_image,
          profile.brochure,
          ...profile.gallery,
        ]
          .filter((item): item is SchoolPortalMediaSummary => item !== null)
          .map((item) => [item.id, item]),
      ),
    [profile],
  );
  const rememberMedia = (id: string, media?: Media | null) => {
    if (!id || !media) return;
    setSelectedMedia((current) => ({ ...current, [id]: media }));
  };
  const mediaDescription = (id?: string | null) =>
    id ? (draft.media_descriptions?.[id] ?? "") : "";
  const setMediaDescription = (id: string, description: string) =>
    onDraftChange({
      ...draft,
      media_descriptions: {
        ...draft.media_descriptions,
        [id]: description,
      },
    });
  const move = (index: number, offset: number) => {
    const target = index + offset;
    if (target < 0 || target >= galleryIds.length) return;
    const next = [...galleryIds];
    [next[index], next[target]] = [next[target], next[index]];
    onGalleryChange(next);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {(["logo", "cover", "brochure"] as const).map((role) => {
          const id =
            draft[
              `${role}_image_id` as "logo_image_id" | "cover_image_id"
            ] ?? (role === "brochure" ? draft.brochure_id : null);
          return (
            <div key={role} className="space-y-3 rounded-xl border p-3">
              <MediaPicker
                label={role[0].toUpperCase() + role.slice(1)}
                value={id}
                onChange={(nextId, media) => {
                  rememberMedia(nextId, media);
                  onDraftChange({
                    ...draft,
                    [role === "brochure"
                      ? "brochure_id"
                      : `${role}_image_id`]: nextId,
                    media_descriptions: {
                      ...draft.media_descriptions,
                      ...(nextId && media
                        ? { [nextId]: media.description ?? "" }
                        : {}),
                    },
                  });
                }}
                mediaType={role === "brochure" ? "document" : "image"}
                accept={role === "brochure" ? ".pdf" : "image/*"}
                uploadEntityType="school"
                uploadEntityId={profile.id}
                uploadRole={role}
              />
              {id ? (
                <div className="space-y-1.5">
                  <Label htmlFor={`profile-${role}-description`}>
                    Description
                  </Label>
                  <Textarea
                    id={`profile-${role}-description`}
                    rows={3}
                    maxLength={600}
                    value={mediaDescription(id)}
                    placeholder={`Describe this ${role} for profile visitors.`}
                    onChange={(event) =>
                      setMediaDescription(id, event.target.value)
                    }
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="space-y-3">
        <MediaPicker
          label="Add gallery image"
          value={pendingGalleryId}
          onChange={(id, media) => {
            setPendingGalleryId("");
            rememberMedia(id, media);
            if (id && media) {
              onDraftChange({
                ...draft,
                media_descriptions: {
                  ...draft.media_descriptions,
                  [id]: media.description ?? "",
                },
              });
            }
            if (id && !galleryIds.includes(id))
              onGalleryChange([...galleryIds, id]);
          }}
          mediaType="image"
          accept="image/*"
          uploadEntityType="school"
          uploadEntityId={profile.id}
          uploadRole="gallery"
        />
        {galleryIds.map((id, index) => (
          <div
            key={id}
            className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[5rem_minmax(0,1fr)_auto]"
          >
            <ImageRenderer
              src={resolveMainMediaUrl(
                mediaById.get(id)?.url ?? selectedMedia[id]?.url,
              )}
              alt={
                mediaById.get(id)?.alt_text ||
                selectedMedia[id]?.alt_text ||
                `Gallery image ${index + 1}`
              }
              className="h-20 rounded-lg"
              imageClassName="h-full w-full object-cover"
            />
            <div className="min-w-0 space-y-2">
              <p className="truncate text-sm font-medium">
                {mediaById.get(id)?.title ||
                  selectedMedia[id]?.title ||
                  mediaById.get(id)?.alt_text ||
                  `Gallery image ${index + 1}`}
              </p>
              <div className="space-y-1">
                <Label htmlFor={`gallery-${id}-description`}>
                  Description
                </Label>
                <Textarea
                  id={`gallery-${id}-description`}
                  rows={2}
                  maxLength={600}
                  value={mediaDescription(id)}
                  placeholder="Describe what this image shows."
                  onChange={(event) =>
                    setMediaDescription(id, event.target.value)
                  }
                />
              </div>
            </div>
            <div className="flex sm:flex-col">
              <Button
                size="icon"
                variant="ghost"
                aria-label="Move image up"
                onClick={() => move(index, -1)}
              >
                <ArrowUp className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Move image down"
                onClick={() => move(index, 1)}
              >
                <ArrowDown className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Remove image from pending gallery"
                onClick={() =>
                  onGalleryChange(galleryIds.filter((item) => item !== id))
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      {saving ? (
        <div className="space-y-2">
          <p className="text-sm">Linking media…</p>
          <Progress value={70} />
        </div>
      ) : null}
      {failed ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDraftChange({ ...draft })}
        >
          <RotateCcw className="mr-2 size-4" /> Retry after correcting the
          selection
        </Button>
      ) : null}
    </div>
  );
}
