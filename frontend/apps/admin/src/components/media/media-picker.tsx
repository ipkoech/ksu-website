"use client";

import * as React from "react";
import { File, ImageIcon, Loader2, Search, UploadCloud, X } from "lucide-react";
import { toast } from "@ksu/ui";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  ImageRenderer,
  Input,
} from "@ksu/ui/components";
import { useMedia, useMediaItem, useUploadMedia, type Media } from "@ksu/api-client";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { formatFileSize, getMediaLabel, getMediaUrl, isImageMedia, mediaAcceptsFile, mediaMatchesSearch } from "./media-utils";

export type MediaPickerProps = {
  value?: string | null;
  onChange: (value: string, media?: Media | null, source?: "upload" | "selection") => void;
  mediaType?: string;
  folderId?: string;
  label?: string;
  helperText?: string;
  placeholder?: string;
  accept?: string;
  maxSize?: number;
  isPublic?: boolean;
  uploadEntityType?: string;
  uploadEntityId?: string;
  uploadRole?: string;
  allowUpload?: boolean;
  allowClear?: boolean;
  disabled?: boolean;
  dialogTitle?: string;
  dialogDescription?: string;
  uploadLabel?: string;
};

function MediaPreview({ media, className = "h-20 w-28" }: { media?: Media | null; className?: string }) {
  const url = getMediaUrl(media);

  return (
    <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted ${className}`}>
      {url && isImageMedia(media) ? (
        <ImageRenderer src={url} alt={getMediaLabel(media)} className="h-full border-0" imageClassName="h-full w-full" />
      ) : isImageMedia(media) ? (
        <ImageIcon className="size-5 text-muted-foreground" />
      ) : (
        <File className="size-5 text-muted-foreground" />
      )}
    </div>
  );
}

export function MediaPicker({
  value,
  onChange,
  mediaType,
  folderId,
  label = "Media",
  helperText,
  placeholder,
  accept,
  maxSize = 20 * 1024 * 1024,
  isPublic = false,
  uploadEntityType,
  uploadEntityId,
  uploadRole,
  allowUpload = true,
  allowClear = true,
  disabled,
  dialogTitle,
  dialogDescription,
  uploadLabel = "Upload file",
}: MediaPickerProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const mediaId = value ?? "";
  const selectedQuery = useMediaItem(mediaId, { enabled: Boolean(mediaId) });
  const mediaQuery = useMedia({ media_type: mediaType, folder_id: folderId, per_page: 80 });
  const uploadMedia = useUploadMedia();
  const selectedMedia = selectedQuery.data?.data ?? null;

  const mediaItems = React.useMemo(() => {
    return (mediaQuery.data?.data ?? []).filter((media) => mediaMatchesSearch(media, search));
  }, [mediaQuery.data?.data, search]);

  const uploadFile = async (file?: File | null) => {
    if (!file) return;
    if (file.size > maxSize) {
      toast.error(`File must be ${formatFileSize(maxSize)} or smaller.`);
      return;
    }
    if (!mediaAcceptsFile(file, accept)) {
      toast.error("Choose a supported file type.");
      return;
    }

    try {
      const response = await uploadMedia.mutateAsync({
        file,
        folderId,
        isPublic,
        entityType: uploadEntityType,
        entityId: uploadEntityId,
        role: uploadRole,
      });
      onChange(response.data.id, response.data, "upload");
      toast.success("Media uploaded");
      setOpen(false);
    } catch {
      toast.error("Failed to upload media");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled || uploadMedia.isPending}
        onChange={(event) => void uploadFile(event.target.files?.[0])}
      />

      <div className="flex gap-3 rounded-lg border p-3">
        <MediaPreview media={selectedMedia} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {selectedMedia ? getMediaLabel(selectedMedia) : placeholder ?? `No ${label.toLowerCase()} selected`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {selectedMedia ? [selectedMedia.mime_type, formatFileSize(selectedMedia.file_size ?? selectedMedia.size)].filter(Boolean).join(" · ") : helperText}
          </p>
          {selectedQuery.isLoading ? <p className="mt-2 text-xs text-muted-foreground">Loading selected media...</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => setOpen(true)}>
              <Search data-icon="inline-start" />
              Choose
            </Button>
            {allowUpload ? (
              <Button type="button" variant="outline" size="sm" disabled={disabled || uploadMedia.isPending} onClick={() => inputRef.current?.click()}>
                {uploadMedia.isPending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <UploadCloud data-icon="inline-start" />}
                Upload
              </Button>
            ) : null}
            {allowClear && mediaId ? (
              <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => onChange("", null)}>
                <X data-icon="inline-start" />
                Remove
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>{dialogTitle ?? `Select ${label.toLowerCase()}`}</DialogTitle>
            <DialogDescription>{dialogDescription ?? "Choose an existing media item or upload a new file."}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search media by filename, title, alt text, or type"
                  className="pl-9"
                />
              </div>
              {allowUpload ? (
                <Button type="button" variant="outline" disabled={disabled || uploadMedia.isPending} onClick={() => inputRef.current?.click()}>
                  {uploadMedia.isPending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <UploadCloud data-icon="inline-start" />}
                  {uploadLabel}
                </Button>
              ) : null}
            </div>

            {mediaQuery.isLoading ? (
              <LoadingSkeleton rows={4} />
            ) : mediaItems.length ? (
              <div className="grid max-h-[520px] gap-3 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
                {mediaItems.map((media) => {
                  const selected = mediaId === media.id;
                  return (
                    <button
                      key={media.id}
                      type="button"
                      className={`rounded-lg border p-2 text-left transition hover:border-primary ${selected ? "border-primary ring-2 ring-primary/20" : ""}`}
                      onClick={() => {
                        onChange(media.id, media, "selection");
                        setOpen(false);
                      }}
                    >
                      <MediaPreview media={media} className="h-32 w-full" />
                      <p className="mt-2 truncate text-sm font-medium">{getMediaLabel(media)}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[media.mime_type, formatFileSize(media.file_size ?? media.size)].filter(Boolean).join(" · ")}
                      </p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <File className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">No media found</p>
                <p className="mt-1 text-xs text-muted-foreground">Upload a file or try another search term.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
