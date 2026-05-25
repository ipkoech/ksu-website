"use client";

import * as React from "react";
import { ImagePlus, Link2, Loader2, Trash2, UploadCloud } from "lucide-react";
import { Button, Input } from "../ui";
import { cn } from "../../lib";
import { ImageRenderer } from "./image-renderer";

export type UploadedImageValue = {
  url: string;
  file?: File;
  id?: string;
  mediaId?: string;
  altText?: string;
  caption?: string;
};

export interface ImageUploaderProps {
  value?: string | UploadedImageValue | null;
  onChange: (value: UploadedImageValue | null) => void;
  onUpload?: (file: File) => Promise<string | UploadedImageValue>;
  accept?: string;
  maxSize?: number;
  aspectRatio?: number;
  disabled?: boolean;
  showMetadata?: boolean;
  className?: string;
  error?: string;
}

function normalizeValue(value?: string | UploadedImageValue | null): UploadedImageValue | null {
  if (!value) return null;
  if (typeof value === "string") return { url: value };
  return value;
}

function formatSize(size: number) {
  return `${(size / (1024 * 1024)).toFixed(size >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
}

export function ImageUploader({
  value,
  onChange,
  onUpload,
  accept = "image/*",
  maxSize = 8 * 1024 * 1024,
  aspectRatio,
  disabled = false,
  showMetadata = true,
  className,
  error,
}: ImageUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const [urlValue, setUrlValue] = React.useState("");
  const [uploading, setUploading] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const normalized = normalizeValue(value);

  React.useEffect(() => {
    return () => {
      if (normalized?.file && normalized.url.startsWith("blob:")) {
        URL.revokeObjectURL(normalized.url);
      }
    };
  }, [normalized?.file, normalized?.url]);

  const setFile = async (file?: File) => {
    if (!file) return;
    setLocalError(null);
    if (!file.type.startsWith("image/")) {
      setLocalError("Choose an image file.");
      return;
    }
    if (file.size > maxSize) {
      setLocalError(`Image must be ${formatSize(maxSize)} or smaller.`);
      return;
    }

    if (!onUpload) {
      onChange({ url: URL.createObjectURL(file), file, altText: normalized?.altText, caption: normalized?.caption });
      return;
    }

    setUploading(true);
    try {
      const uploaded = await onUpload(file);
      onChange(
        typeof uploaded === "string"
          ? { url: uploaded, altText: normalized?.altText, caption: normalized?.caption }
          : { ...uploaded, altText: uploaded.altText ?? normalized?.altText, caption: uploaded.caption ?? normalized?.caption },
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const applyUrl = () => {
    const url = urlValue.trim();
    if (!url) return;
    onChange({ url, altText: normalized?.altText, caption: normalized?.caption });
    setUrlValue("");
  };

  const updateMetadata = (patch: Partial<UploadedImageValue>) => {
    if (!normalized) return;
    onChange({ ...normalized, ...patch });
  };

  return (
    <div className={cn("space-y-4", className)}>
      {normalized ? (
        <div className="space-y-3">
          <ImageRenderer
            src={normalized.url}
            alt={normalized.altText}
            caption={normalized.caption}
            aspectRatio={aspectRatio}
            className="max-w-xl"
          />
          {showMetadata ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                value={normalized.altText ?? ""}
                onChange={(event) => updateMetadata({ altText: event.target.value })}
                placeholder="Alt text"
                disabled={disabled}
              />
              <Input
                value={normalized.caption ?? ""}
                onChange={(event) => updateMetadata({ caption: event.target.value })}
                placeholder="Caption"
                disabled={disabled}
              />
            </div>
          ) : null}
          <Button type="button" variant="outline" className="text-destructive" onClick={() => onChange(null)} disabled={disabled || uploading}>
            <Trash2 className="h-4 w-4" />
            Remove image
          </Button>
        </div>
      ) : null}

      <div
        className={cn(
          "rounded-lg border border-dashed p-5 text-center transition-colors",
          dragging && "border-primary bg-primary/5",
          disabled && "cursor-not-allowed opacity-60",
          (error || localError) && "border-destructive",
        )}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (!disabled) void setFile(event.dataTransfer.files?.[0]);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          disabled={disabled || uploading}
          onChange={(event) => void setFile(event.target.files?.[0])}
        />
        {uploading ? (
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-muted-foreground" />
        ) : (
          <UploadCloud className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        )}
        <p className="text-sm font-medium">Drop an image here or choose a file</p>
        <p className="mt-1 text-xs text-muted-foreground">Max size {formatSize(maxSize)}</p>
        <Button type="button" variant="outline" className="mt-4" onClick={() => inputRef.current?.click()} disabled={disabled || uploading}>
          <ImagePlus className="h-4 w-4" />
          Choose image
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={urlValue}
          onChange={(event) => setUrlValue(event.target.value)}
          placeholder="Paste image URL"
          disabled={disabled || uploading}
        />
        <Button type="button" variant="outline" onClick={applyUrl} disabled={disabled || uploading || !urlValue.trim()}>
          <Link2 className="h-4 w-4" />
          Use URL
        </Button>
      </div>

      {error || localError ? <p className="text-sm text-destructive">{error || localError}</p> : null}
    </div>
  );
}
