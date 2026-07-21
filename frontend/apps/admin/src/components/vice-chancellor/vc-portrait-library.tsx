"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ImagePlus,
  Loader2,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "@ksu/ui";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ImageRenderer,
  Input,
} from "@ksu/ui/components";
import {
  useAttachVcPortrait,
  useDeleteVcPortrait,
  useReorderVcPortraits,
  useSelectVcPortrait,
  useUpdateVcPortrait,
  useVcPortraits,
  type VcPortrait,
} from "@ksu/api-client";
import { MediaPicker } from "@/components/media";

function message(error: unknown) {
  return error instanceof Error
    ? error.message
    : "The portrait change could not be saved.";
}

function PortraitCard({
  portrait,
  index,
  count,
  canManage,
  onMove,
}: {
  portrait: VcPortrait;
  index: number;
  count: number;
  canManage: boolean;
  onMove: (index: number, direction: -1 | 1) => Promise<void>;
}) {
  const update = useUpdateVcPortrait();
  const select = useSelectVcPortrait();
  const remove = useDeleteVcPortrait();
  const [altText, setAltText] = useState(portrait.alt_text ?? "");
  useEffect(() => setAltText(portrait.alt_text ?? ""), [portrait.alt_text]);
  const saveAlt = async () => {
    try {
      await update.mutateAsync({
        id: portrait.id,
        data: { alt_text: altText.trim() || null },
      });
      toast.success("Portrait description saved");
    } catch (error) {
      toast.error(message(error));
    }
  };
  const makeActive = async () => {
    try {
      await select.mutateAsync(portrait.id);
      toast.success(
        "Shared landing portrait selected. Publish the hub when ready.",
      );
    } catch (error) {
      toast.error(message(error));
    }
  };
  const deletePortrait = async () => {
    if (
      !confirm(
        "Remove this portrait from the VC library? The media asset will remain available.",
      )
    )
      return;
    try {
      await remove.mutateAsync(portrait.id);
      toast.success("Portrait removed");
    } catch (error) {
      toast.error(message(error));
    }
  };
  const busy = update.isPending || select.isPending || remove.isPending;
  return (
    <Card className={portrait.is_active ? "border-primary shadow-sm" : ""}>
      <CardContent className="space-y-4 p-4">
        <div className="relative">
          <ImageRenderer
            image={portrait.media}
            alt={portrait.alt_text || "Vice-Chancellor portrait"}
            className="aspect-[4/5]"
            imageClassName="h-full object-cover object-top"
          />
          {portrait.is_active ? (
            <Badge className="absolute left-3 top-3">
              <Check className="mr-1 size-3" />
              Active on landing pages
            </Badge>
          ) : null}
        </div>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Alternative text</span>
          <div className="flex gap-2">
            <Input
              value={altText}
              disabled={!canManage || busy}
              placeholder="Describe the portrait for screen readers"
              onChange={(event) => setAltText(event.target.value)}
            />
            <Button
              size="icon"
              variant="outline"
              disabled={
                !canManage || busy || altText === (portrait.alt_text ?? "")
              }
              aria-label="Save alternative text"
              onClick={() => void saveAlt()}
            >
              <Save className="size-4" />
            </Button>
          </div>
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={!canManage || busy || portrait.is_active}
            onClick={() => void makeActive()}
          >
            {portrait.is_active ? (
              <>
                <Check className="mr-2 size-4" />
                Selected
              </>
            ) : (
              "Use on landing pages"
            )}
          </Button>
          <Button
            size="icon"
            variant="outline"
            disabled={!canManage || busy || index === 0}
            aria-label="Move portrait up"
            onClick={() => void onMove(index, -1)}
          >
            <ArrowUp className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            disabled={!canManage || busy || index === count - 1}
            aria-label="Move portrait down"
            onClick={() => void onMove(index, 1)}
          >
            <ArrowDown className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            disabled={!canManage || busy || portrait.is_active}
            title={
              portrait.is_active
                ? "Select another portrait before removing this one"
                : undefined
            }
            aria-label="Remove portrait"
            onClick={() => void deletePortrait()}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function VcPortraitLibrary({ canManage }: { canManage: boolean }) {
  const query = useVcPortraits();
  const attach = useAttachVcPortrait();
  const reorder = useReorderVcPortraits();
  const [mediaId, setMediaId] = useState("");
  const portraits = useMemo(
    () =>
      [...(query.data?.data ?? [])].sort(
        (a, b) => a.display_order - b.display_order,
      ),
    [query.data?.data],
  );
  const add = async () => {
    if (!mediaId) return;
    try {
      await attach.mutateAsync({
        media_id: mediaId,
        display_order: portraits.length,
      });
      setMediaId("");
      toast.success("Portrait added to the VC library");
    } catch (error) {
      toast.error(message(error));
    }
  };
  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= portraits.length) return;
    const next = [...portraits];
    [next[index], next[target]] = [next[target]!, next[index]!];
    try {
      await reorder.mutateAsync(
        next.map((portrait, order) => ({
          id: portrait.id,
          display_order: order,
        })),
      );
    } catch (error) {
      toast.error(message(error));
    }
  };
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <CardTitle>VC portrait library</CardTitle>
            <CardDescription className="mt-1 max-w-2xl">
              Upload and retain official portraits, then manually choose the one
              shared by the homepage and Meet the VC landing page. The
              professional profile photo remains separate.
            </CardDescription>
          </div>
          {portraits.some((item) => item.is_active) ? (
            <Badge variant="secondary">Shared portrait configured</Badge>
          ) : (
            <Badge variant="outline">No shared portrait selected</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <MediaPicker
            label="Add a VC portrait"
            helperText="Choose an existing public image or upload a new portrait."
            value={mediaId}
            onChange={setMediaId}
            mediaType="image"
            accept="image/*"
            isPublic
            disabled={!canManage}
          />
          <Button
            className="self-end"
            disabled={!canManage || !mediaId || attach.isPending}
            onClick={() => void add()}
          >
            {attach.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <ImagePlus className="mr-2 size-4" />
            )}
            Add to library
          </Button>
        </div>
        {query.isLoading ? (
          <div className="flex min-h-32 items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" />
            Loading portraits…
          </div>
        ) : portraits.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {portraits.map((portrait, index) => (
              <PortraitCard
                key={portrait.id}
                portrait={portrait}
                index={index}
                count={portraits.length}
                canManage={canManage}
                onMove={move}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <ImagePlus className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 font-medium">No portraits in the library</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload the first official portrait, then select it for the landing
              pages.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
