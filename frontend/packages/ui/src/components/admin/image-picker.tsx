"use client";

import * as React from "react";
import { ImagePlus, Search } from "lucide-react";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, Input } from "../ui";
import { FileUploader } from "./file-uploader";

export interface ImagePickerProps {
  value?: string;
  onChange: (value: string | null) => void;
  aspectRatio?: number;
  disabled?: boolean;
}

const demoImages = [
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80",
  "https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=800&q=80",
  "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=800&q=80",
];

export function ImagePicker({ value, onChange, aspectRatio, disabled = false }: ImagePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const filtered = demoImages.filter((imageUrl) => imageUrl.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border bg-muted">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Selected" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div className="space-y-2">
          <Button type="button" variant="outline" onClick={() => setOpen(true)} disabled={disabled}>
            Choose image
          </Button>
          {value ? (
            <Button type="button" variant="ghost" onClick={() => onChange(null)} disabled={disabled}>
              Remove image
            </Button>
          ) : null}
          {aspectRatio ? <p className="text-xs text-muted-foreground">Suggested ratio: {aspectRatio}:1</p> : null}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Select image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search media" className="pl-9" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {filtered.map((imageUrl) => (
                <button
                  key={imageUrl}
                  type="button"
                  className="overflow-hidden rounded-lg border text-left transition hover:border-primary"
                  onClick={() => {
                    onChange(imageUrl);
                    setOpen(false);
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="Media item" className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>
            <div className="border-t pt-4">
              <p className="mb-3 text-sm font-medium">Upload new image</p>
              <FileUploader
                accept="image/*"
                onChange={(files) => {
                  const file = Array.isArray(files) ? files[0] : files;
                  if (file instanceof File) {
                    onChange(URL.createObjectURL(file));
                  }
                }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
