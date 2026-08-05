"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ApiClientError,
  socialPostsApi,
  socialQueryKeys,
  SOCIAL_PLATFORMS,
  SOCIAL_PLATFORM_LIMITS,
  type Media,
  type SocialMediaPost,
  type SocialPlatform,
} from "@ksu/api-client";
import { toast } from "@ksu/ui";
import {
  Button,
  Input,
  Label,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Textarea,
} from "@ksu/ui/components";
import { cn } from "@ksu/ui/lib/utils";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Loader2,
  Send,
  X,
} from "lucide-react";
import { MediaPicker } from "@/components/media/media-picker";

/**
 * Build a social-safe message from plain text + an optional public URL.
 *
 * The text must already be plain (run rich text through richTextToPlainText
 * before calling this — never raw HTML). Whitespace is collapsed and the text
 * is truncated with an ellipsis so the whole message fits `limit`; the URL is
 * never truncated.
 */
export function buildSocialShareMessage({
  text,
  url,
  limit,
}: {
  text: string;
  url?: string | null;
  limit: number;
}): string {
  const clean = text.replace(/\s+/g, " ").trim();
  const suffix = url ? `\n\n${url}` : "";
  if (clean.length + suffix.length <= limit) return `${clean}${suffix}`;
  const room = limit - suffix.length - 1; // 1 char for the ellipsis
  if (room <= 0) return url ?? clean.slice(0, Math.max(0, limit - 1)) + "…";
  return `${clean.slice(0, room).trimEnd()}…${suffix}`;
}

export interface SocialComposerPrefill {
  sourceType: string;
  sourceId?: string | null;
  title?: string | null;
  /** Plain text only — convert rich text with richTextToPlainText first. */
  text: string;
  /** Public URL of the source content; kept intact when truncating. */
  url?: string | null;
}

type MediaSelection = { id: string; media: Media | null };

function isImageOrVideo(media: Media | null): boolean {
  if (!media) return true; // unknown — let the backend validator decide
  const kind = (media.media_type ?? "").toLowerCase();
  const mime = (media.mime_type ?? "").toLowerCase();
  return (
    kind === "image" ||
    kind === "video" ||
    kind === "gif" ||
    mime.startsWith("image/") ||
    mime.startsWith("video/")
  );
}

/** Client-side pre-flight mirroring validate_social_payload + adapter rules. */
function preflightIssues(
  platforms: SocialPlatform[],
  content: string,
  media: MediaSelection[],
): string[] {
  const issues: string[] = [];
  for (const platform of platforms) {
    const rules = SOCIAL_PLATFORM_LIMITS[platform];
    if (content.length > rules.maxTextLength) {
      issues.push(
        `${rules.label} allows at most ${rules.maxTextLength.toLocaleString()} characters (currently ${content.length.toLocaleString()}).`,
      );
    }
    if (media.length > rules.maxMediaCount) {
      issues.push(
        `${rules.label} allows at most ${rules.maxMediaCount} media items.`,
      );
    }
  }
  if (platforms.includes("instagram")) {
    if (media.length === 0) {
      issues.push("Instagram requires an image or video — attach one media item.");
    } else if (media.length > 1) {
      issues.push("Instagram publishing currently supports a single image or video per post.");
    } else if (!isImageOrVideo(media[0].media)) {
      issues.push("Instagram only accepts images or videos.");
    }
  }
  return issues;
}

function toDatetimeLocal(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function SocialComposerSheet({
  open,
  onOpenChange,
  post,
  prefill,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Existing post to edit; omit to create a new one. */
  post?: SocialMediaPost | null;
  /** Seed content when composing from existing site content. */
  prefill?: SocialComposerPrefill | null;
}) {
  const queryClient = useQueryClient();
  const [content, setContent] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [platforms, setPlatforms] = React.useState<SocialPlatform[]>([]);
  const [media, setMedia] = React.useState<MediaSelection[]>([]);
  const [scheduledAt, setScheduledAt] = React.useState("");
  const [pickerValue, setPickerValue] = React.useState<string | null>(null);

  const accountsQuery = useQuery({
    queryKey: socialQueryKeys.accounts,
    queryFn: async () =>
      (await socialPostsApi.listAccounts({ active_only: true })).data ?? [],
    enabled: open,
    staleTime: 60_000,
  });
  const connectedProviders = React.useMemo(
    () =>
      new Set(
        (accountsQuery.data ?? []).map((account) =>
          String(account.provider).toLowerCase(),
        ),
      ),
    [accountsQuery.data],
  );

  // Seed the form whenever the sheet opens for a new subject.
  React.useEffect(() => {
    if (!open) return;
    if (post) {
      setContent(post.content ?? "");
      setTitle(post.title ?? "");
      setPlatforms(
        (post.platforms ?? []).filter((p): p is SocialPlatform =>
          (SOCIAL_PLATFORMS as string[]).includes(String(p)),
        ),
      );
      setMedia((post.media_ids ?? []).map((id) => ({ id, media: null })));
      setScheduledAt(toDatetimeLocal(post.scheduled_at));
    } else if (prefill) {
      // Truncate against the strictest limit among connected platforms so the
      // prefill is valid everywhere; the URL is always kept intact.
      const limit = SOCIAL_PLATFORM_LIMITS.x.maxTextLength;
      setContent(
        buildSocialShareMessage({ text: prefill.text, url: prefill.url, limit }),
      );
      setTitle(prefill.title ?? "");
      setPlatforms([]);
      setMedia([]);
      setScheduledAt("");
    } else {
      setContent("");
      setTitle("");
      setPlatforms([]);
      setMedia([]);
      setScheduledAt("");
    }
    setPickerValue(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, post?.id]);

  const issues = preflightIssues(platforms, content, media);
  const canSubmit =
    content.trim().length > 0 && platforms.length > 0 && issues.length === 0;

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: socialQueryKeys.all });

  const saveMutation = useMutation({
    mutationFn: async (mode: "draft" | "schedule" | "publish") => {
      const payload = {
        source_type: post?.source_type ?? prefill?.sourceType ?? "manual",
        source_id: post?.source_id ?? prefill?.sourceId ?? null,
        title: title.trim() || null,
        content,
        media_ids: media.length ? media.map((item) => item.id) : null,
        platforms,
        scheduled_at:
          mode === "schedule" && scheduledAt
            ? new Date(scheduledAt).toISOString()
            : null,
        status: "draft" as const,
      };
      const saved = post
        ? (await socialPostsApi.update(post.id, payload)).data
        : (await socialPostsApi.create(payload)).data;
      if (mode === "publish") {
        await socialPostsApi.publish(saved.id);
      }
      return mode;
    },
    onSuccess: (mode) => {
      void invalidate();
      onOpenChange(false);
      toast.success(
        mode === "publish"
          ? "Post queued for publishing"
          : mode === "schedule"
            ? "Post scheduled"
            : "Draft saved",
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Could not save the social post",
      );
    },
  });

  const togglePlatform = (platform: SocialPlatform) => {
    setPlatforms((current) =>
      current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform],
    );
  };

  const addMedia = (id: string, mediaItem?: Media | null) => {
    if (!id) return;
    setMedia((current) =>
      current.some((item) => item.id === id)
        ? current
        : [...current, { id, media: mediaItem ?? null }],
    );
    setPickerValue(null);
  };

  const isSaving = saveMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={(next) => !isSaving && onOpenChange(next)}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-xl">
        <SheetHeader className="border-b p-6 pb-4 text-left">
          <SheetTitle>{post ? "Edit social post" : "Compose social post"}</SheetTitle>
          <SheetDescription>
            {post
              ? "Update the message, platforms, or schedule before it goes out."
              : "Write once, choose platforms, then publish now or schedule for later."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 p-6">
          <div className="space-y-2">
            <Label htmlFor="social-composer-title">Internal title (optional)</Label>
            <Input
              id="social-composer-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Graduation ceremony announcement"
              maxLength={255}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social-composer-message">Message</Label>
            <Textarea
              id="social-composer-message"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="What would you like to share?"
              rows={7}
              disabled={isSaving}
            />
            <div className="flex flex-wrap gap-x-4 gap-y-1" aria-live="polite">
              {(platforms.length ? platforms : SOCIAL_PLATFORMS).map(
                (platform) => {
                  const rules = SOCIAL_PLATFORM_LIMITS[platform];
                  const remaining = rules.maxTextLength - content.length;
                  const active = platforms.includes(platform);
                  return (
                    <span
                      key={platform}
                      className={cn(
                        "text-xs tabular-nums",
                        remaining < 0
                          ? "font-medium text-destructive"
                          : active
                            ? "text-foreground"
                            : "text-muted-foreground",
                      )}
                    >
                      {rules.label}: {remaining.toLocaleString()} left
                    </span>
                  );
                },
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Platforms</Label>
            <div className="grid grid-cols-2 gap-2">
              {SOCIAL_PLATFORMS.map((platform) => {
                const rules = SOCIAL_PLATFORM_LIMITS[platform];
                const selected = platforms.includes(platform);
                const connected = connectedProviders.has(platform);
                return (
                  <button
                    key={platform}
                    type="button"
                    aria-pressed={selected}
                    disabled={isSaving}
                    onClick={() => togglePlatform(platform)}
                    className={cn(
                      "flex items-center justify-between rounded-lg border bg-background px-3 py-2 text-left text-sm transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      selected
                        ? "border-primary/60 ring-1 ring-primary/40"
                        : "hover:border-primary/30",
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {rules.label}
                      </span>
                      <span
                        className={cn(
                          "block text-xs",
                          connected
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-muted-foreground",
                        )}
                      >
                        {connected ? "Account connected" : "No connected account"}
                      </span>
                    </span>
                    {selected ? (
                      <CheckCircle2 className="size-4 shrink-0 text-primary" />
                    ) : null}
                  </button>
                );
              })}
            </div>
            {platforms.some((platform) => !connectedProviders.has(platform)) &&
            !accountsQuery.isLoading ? (
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Some selected platforms have no connected account — publishing
                to them will fail until an administrator links one.
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Media</Label>
            {media.length ? (
              <ul className="space-y-1.5">
                {media.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-2 rounded-md border bg-muted/40 px-3 py-1.5 text-sm"
                  >
                    <span className="min-w-0 truncate">
                      {item.media?.title ??
                        item.media?.filename ??
                        `Media ${item.id.slice(0, 8)}`}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove media"
                      disabled={isSaving}
                      onClick={() =>
                        setMedia((current) =>
                          current.filter((entry) => entry.id !== item.id),
                        )
                      }
                    >
                      <X className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : null}
            <MediaPicker
              value={pickerValue}
              onChange={(id, mediaItem) => addMedia(id, mediaItem)}
              label=""
              helperText="Instagram needs exactly one image or video with a public URL. X accepts up to 4 items; Facebook and Instagram up to 10; LinkedIn up to 9."
              placeholder="Attach image or video"
              allowClear={false}
              disabled={isSaving}
              dialogTitle="Attach media"
              dialogDescription="Pick from the media library or upload a new file."
              uploadLabel="Upload media"
              isPublic
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="social-composer-schedule">Schedule (optional)</Label>
            <Input
              id="social-composer-schedule"
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to keep as draft or publish immediately.
            </p>
          </div>

          {issues.length ? (
            <div
              role="alert"
              className="space-y-1 rounded-lg border border-destructive/30 bg-destructive/5 p-3"
            >
              {issues.map((issue) => (
                <p
                  key={issue}
                  className="flex items-start gap-2 text-xs text-destructive"
                >
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                  {issue}
                </p>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t bg-muted/30 p-4">
          <Button
            type="button"
            variant="outline"
            disabled={isSaving || content.trim().length === 0 || platforms.length === 0}
            onClick={() => saveMutation.mutate("draft")}
          >
            Save draft
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={!canSubmit || !scheduledAt || isSaving}
            onClick={() => saveMutation.mutate("schedule")}
          >
            <CalendarClock data-icon="inline-start" className="size-4" />
            Schedule
          </Button>
          <Button
            type="button"
            disabled={!canSubmit || isSaving}
            onClick={() => saveMutation.mutate("publish")}
          >
            {isSaving ? (
              <Loader2 data-icon="inline-start" className="size-4 animate-spin" />
            ) : (
              <Send data-icon="inline-start" className="size-4" />
            )}
            Publish now
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
