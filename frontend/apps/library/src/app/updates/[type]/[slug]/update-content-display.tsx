"use client";

import { RichTextRenderer } from "@ksu/ui/rich-text-renderer";

export function LibraryUpdateContentDisplay({ content, fallback }: { content: string; fallback: string }) {
  return (
    <div className="max-w-[900px]" data-server-data-display="library-update-content">
      <RichTextRenderer
        content={content}
        className="prose-lg prose-headings:font-[family-name:var(--font-display)] prose-headings:text-primary prose-a:text-secondary"
        emptyFallback={<p className="text-base leading-8 text-muted-foreground">{fallback}</p>}
      />
    </div>
  );
}
