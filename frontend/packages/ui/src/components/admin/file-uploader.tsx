"use client";

import * as React from "react";
import { File, FileImage, Trash2, UploadCloud } from "lucide-react";
import { Button, Progress, Input } from "../ui";
import { cn } from "../../lib";

export interface FileUploaderProps {
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  value?: File | File[] | string | string[];
  onChange: (files: File | File[] | null) => void;
  onUpload?: (file: File) => Promise<string>;
  disabled?: boolean;
  error?: string;
}

type PreviewItem = { id: string; file?: File; url: string; name: string; uploadedUrl?: string };

function toArray(value?: File | File[] | string | string[]) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function FileUploader({
  accept,
  maxSize = 5 * 1024 * 1024,
  multiple = false,
  value,
  onChange,
  onUpload,
  disabled = false,
  error,
}: FileUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = React.useState<PreviewItem[]>([]);
  const [dragging, setDragging] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    const nextPreviews = toArray(value).map((item, index) => {
      if (typeof item === "string") {
        return { id: `${item}-${index}`, url: item, name: item.split("/").pop() || `file-${index}`, uploadedUrl: item };
      }
      return { id: `${item.name}-${index}-${item.size}`, file: item, url: URL.createObjectURL(item), name: item.name };
    });
    setPreviews(nextPreviews);
    return () => {
      nextPreviews.forEach((item) => {
        if (item.file) URL.revokeObjectURL(item.url);
      });
    };
  }, [value]);

  const ingestFiles = async (files: FileList | null) => {
    if (!files) return;
    const accepted = Array.from(files).filter((file) => file.size <= maxSize);
    const nextFiles = multiple ? accepted : accepted.slice(0, 1);
    onChange(multiple ? nextFiles : nextFiles[0] ?? null);

    if (onUpload) {
      for (const file of nextFiles) {
        setUploadProgress((current) => ({ ...current, [file.name]: 15 }));
        await onUpload(file);
        setUploadProgress((current) => ({ ...current, [file.name]: 100 }));
      }
    }
  };

  const removeFile = (index: number) => {
    const items = toArray(value).filter((_, currentIndex) => currentIndex !== index);
    if (items.length === 0) {
      onChange(null);
      return;
    }
    const remainingFiles = items.filter((item): item is File => item instanceof File);
    onChange(multiple ? remainingFiles : remainingFiles[0] ?? null);
  };

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "rounded-lg border border-dashed p-6 text-center transition-colors",
          dragging && "border-primary bg-primary/5",
          disabled && "cursor-not-allowed opacity-60",
          error && "border-destructive"
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={async (event) => {
          event.preventDefault();
          setDragging(false);
          if (!disabled) await ingestFiles(event.dataTransfer.files);
        }}
      >
        <Input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="hidden"
          onChange={(event) => void ingestFiles(event.target.files)}
        />
        <UploadCloud className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">Drag files here or choose from disk</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Max size {(maxSize / (1024 * 1024)).toFixed(0)} MB{accept ? ` • ${accept}` : ""}
        </p>
        <Button type="button" variant="outline" className="mt-4" onClick={() => inputRef.current?.click()} disabled={disabled}>
          Choose files
        </Button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {previews.length > 0 ? (
        <div className="space-y-3">
          {previews.map((preview, index) => {
            const isImage = preview.url.match(/\.(png|jpe?g|gif|webp|svg)$/i) || preview.file?.type.startsWith("image/");
            return (
              <div key={preview.id} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-md bg-muted">
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview.url} alt={preview.name} className="h-full w-full object-cover" />
                  ) : preview.file?.type ? (
                    <FileImage className="h-6 w-6 text-muted-foreground" />
                  ) : (
                    <File className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{preview.name}</p>
                  {uploadProgress[preview.name] ? <Progress value={uploadProgress[preview.name]} className="mt-2 h-2" /> : null}
                </div>
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeFile(index)} disabled={disabled}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove file</span>
                </Button>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
