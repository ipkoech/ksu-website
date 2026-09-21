"use client";

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { RichTextRenderer, richTextToPlainText } from "@ksu/ui/rich-text-renderer";

function normalizeText(value: string) {
  return richTextToPlainText(value)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function ExpandableRichText({
  text,
  collapsedLines = 8,
}: {
  text: string;
  collapsedLines?: 4 | 5 | 6 | 7 | 8 | 9 | 10;
}) {
  const [expanded, setExpanded] = useState(false);
  const paragraphs = normalizeText(text);

  if (!paragraphs.length) return null;
  const isLong = text.length > 700 || paragraphs.length > 2;

  return (
    <div>
      <div
        className={[
          "relative space-y-3 overflow-hidden text-sm leading-7 text-muted-foreground transition-[max-height] duration-300",
            isLong ? "after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-12 after:bg-gradient-to-t after:from-white after:to-transparent" : "",
        ].join(" ")}
        style={isLong ? { maxHeight: `${collapsedLines * 1.75}rem` } : undefined}
      >
        <RichTextRenderer content={text} className="text-sm leading-7 text-muted-foreground" />
      </div>
      {isLong ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-3 inline-flex min-h-8 items-center gap-1.5 text-sm font-bold text-primary"
        >
          "Read full biography"
          <ChevronDown
            aria-hidden
            className="h-4 w-4"
          />
        </button>
      ) : null}
      {expanded ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setExpanded(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Full biography"
            className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between gap-4 border-b border-border pb-4">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">
                Full biography
              </h2>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="rounded-full p-2 text-muted-foreground transition hover:bg-surface-subtle hover:text-foreground"
                aria-label="Close full biography"
              >
                <X aria-hidden className="h-5 w-5" />
              </button>
            </div>
            <RichTextRenderer content={text} className="text-sm leading-7 text-muted-foreground" />
          </section>
        </div>
      ) : null}
    </div>
  );
}
