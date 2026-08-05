"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

function normalizeText(value: string) {
  return value
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
          isLong && !expanded ? "after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-12 after:bg-gradient-to-t after:from-white after:to-transparent" : "",
        ].join(" ")}
        style={
          isLong && !expanded
            ? { maxHeight: `${collapsedLines * 1.75}rem` }
            : { maxHeight: "none" }
        }
      >
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      {isLong ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-3 inline-flex min-h-8 items-center gap-1.5 text-sm font-bold text-primary"
        >
          {expanded ? "Show less" : "Read full biography"}
          <ChevronDown
            aria-hidden
            className={`h-4 w-4 transition ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      ) : null}
    </div>
  );
}
