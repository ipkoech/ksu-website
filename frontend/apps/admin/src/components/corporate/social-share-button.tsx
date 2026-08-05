"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { richTextToPlainText } from "@ksu/ui/components";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Skeleton,
} from "@ksu/ui/components";
import { Inbox, Share2 } from "lucide-react";
import {
  SocialComposerSheet,
  type SocialComposerPrefill,
} from "./social-composer-sheet";

const WEB_BASE_URL =
  process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";

type ShareableRecord = Record<string, unknown> & { id?: string };

function recordText(record: ShareableRecord): string {
  const raw =
    record.summary ??
    record.excerpt ??
    record.description ??
    record.content ??
    "";
  // Never let rich-text HTML into a social message.
  return richTextToPlainText(String(raw ?? ""));
}

function recordTitle(record: ShareableRecord): string {
  return String(record.title ?? record.name ?? "Untitled");
}

export interface SocialShareSource {
  /** Stored as SocialMediaPost.source_type. */
  sourceType: string;
  /** Human label, e.g. "news article". */
  contentLabel: string;
  /** Public site path prefix, e.g. "/news" — combined with the record slug. */
  publicPathPrefix: string;
  /** Fetch recently published records (id, title, slug, summary/excerpt). */
  fetchPublished: () => Promise<ShareableRecord[]>;
}

/**
 * "Share to social" entry point for newsroom workspaces: pick a recently
 * published record, then open the social composer prefilled with a
 * platform-safe plain-text message plus the record's public URL.
 */
export function SocialShareButton({ source }: { source: SocialShareSource }) {
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [prefill, setPrefill] = React.useState<SocialComposerPrefill | null>(
    null,
  );
  const [composerOpen, setComposerOpen] = React.useState(false);

  const recordsQuery = useQuery({
    queryKey: ["social-share", source.sourceType, "published"],
    queryFn: source.fetchPublished,
    enabled: pickerOpen,
    staleTime: 30_000,
  });
  const records = recordsQuery.data ?? [];

  const share = (record: ShareableRecord) => {
    const slug = record.slug ? String(record.slug) : null;
    const url = slug
      ? `${WEB_BASE_URL}${source.publicPathPrefix}/${slug}`
      : null;
    const title = recordTitle(record);
    const text = [title, recordText(record)].filter(Boolean).join(" — ");
    setPrefill({
      sourceType: source.sourceType,
      sourceId: record.id ? String(record.id) : null,
      title,
      text,
      url,
    });
    setPickerOpen(false);
    setComposerOpen(true);
  };

  return (
    <>
      <Button variant="outline" onClick={() => setPickerOpen(true)}>
        <Share2 data-icon="inline-start" className="size-4" />
        Share to social
      </Button>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Share a published {source.contentLabel}</DialogTitle>
            <DialogDescription>
              Pick a recently published item — the composer opens prefilled
              with its summary and public link.
            </DialogDescription>
          </DialogHeader>
          {recordsQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center">
              <Inbox className="size-6 text-muted-foreground" />
              <p className="text-sm font-medium">Nothing published yet</p>
              <p className="text-xs text-muted-foreground">
                Publish a {source.contentLabel} first, then share it here.
              </p>
            </div>
          ) : (
            <ul className="max-h-80 space-y-1.5 overflow-y-auto pr-1">
              {records.map((record, index) => (
                <li key={String(record.id ?? index)}>
                  <button
                    type="button"
                    onClick={() => share(record)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-left text-sm transition-colors hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="block truncate font-medium">
                      {recordTitle(record)}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {recordText(record) || "No summary"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>

      <SocialComposerSheet
        open={composerOpen}
        onOpenChange={(open) => {
          setComposerOpen(open);
          if (!open) setPrefill(null);
        }}
        prefill={prefill}
      />
    </>
  );
}
