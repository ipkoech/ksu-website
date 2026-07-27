"use client";

import * as React from "react";
import { ArrowLeft, Heading, Landmark } from "lucide-react";

import { Button } from "../components/ui/button";

type PageStructureItem = {
  key: string;
  label: string;
  detail: string;
  kind: "heading" | "landmark";
  element: HTMLElement;
};

function visible(element: HTMLElement) {
  return element.getClientRects().length > 0;
}

function accessibleLabel(element: HTMLElement) {
  const direct = element.getAttribute("aria-label")?.trim();
  if (direct) return direct;

  const labelledBy = element.getAttribute("aria-labelledby");
  if (labelledBy) {
    const label = labelledBy
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent?.trim())
      .filter(Boolean)
      .join(" ");
    if (label) return label;
  }

  const tagLabels: Record<string, string> = {
    HEADER: "Page header",
    MAIN: "Main content",
    FOOTER: "Page footer",
    NAV: "Navigation",
    ASIDE: "Supporting content",
  };
  return tagLabels[element.tagName] ?? "Page region";
}

function collectPageStructure(panelId: string): PageStructureItem[] {
  const items: PageStructureItem[] = [];
  const seen = new Set<HTMLElement>();

  document
    .querySelectorAll<HTMLElement>(
      "header, nav[aria-label], main, aside[aria-label], footer, [role='banner'], [role='main'], [role='navigation'], [role='complementary'], [role='contentinfo']",
    )
    .forEach((element, index) => {
      if (
        seen.has(element) ||
        element.closest(`#${panelId}`) ||
        !visible(element)
      ) {
        return;
      }
      seen.add(element);
      items.push({
        key: `landmark-${index}`,
        label: accessibleLabel(element),
        detail: "Landmark",
        kind: "landmark",
        element,
      });
    });

  document
    .querySelectorAll<HTMLElement>(
      "main h1, main h2, main h3, main h4, main h5, main h6",
    )
    .forEach((element, index) => {
      if (element.closest(`#${panelId}`) || !visible(element)) return;
      const label = element.textContent?.replace(/\s+/g, " ").trim();
      if (!label) return;
      items.push({
        key: `heading-${index}`,
        label,
        detail: element.tagName.toUpperCase(),
        kind: "heading",
        element,
      });
    });

  return items;
}

export function AccessibilityPageStructure({
  panelId,
  onBack,
  onNavigate,
}: {
  panelId: string;
  onBack: () => void;
  onNavigate: (element: HTMLElement) => void;
}) {
  const [items, setItems] = React.useState<PageStructureItem[]>([]);

  React.useEffect(() => {
    setItems(collectPageStructure(panelId));
  }, [panelId]);

  return (
    <div className="px-5 py-4">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-11 w-11 shrink-0"
          onClick={onBack}
          aria-label="Back to accessibility controls"
        >
          <ArrowLeft aria-hidden className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="font-semibold text-foreground">Page structure</h2>
          <p className="text-xs text-muted-foreground">
            Jump to a heading or landmark.
          </p>
        </div>
      </div>

      {items.length ? (
        <ul className="mt-4 grid gap-2">
          {items.map((item) => {
            const Icon = item.kind === "heading" ? Heading : Landmark;
            return (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => onNavigate(item.element)}
                  className="flex min-h-12 w-full items-center gap-3 rounded-lg border border-border bg-background px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30"
                >
                  <Icon aria-hidden className="h-5 w-5 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {item.label}
                    </span>
                    <span className="block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                      {item.detail}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p
          role="status"
          className="mt-4 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground"
        >
          No visible headings or landmarks were found on this page.
        </p>
      )}
    </div>
  );
}
