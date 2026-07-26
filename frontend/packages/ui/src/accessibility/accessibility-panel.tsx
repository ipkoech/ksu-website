"use client";

import * as React from "react";
import { Accessibility, RotateCcw } from "lucide-react";

import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet";
import { Switch } from "../components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { cn } from "../lib/utils";
import { useAccessibility } from "./accessibility-provider";
import {
  ACCESSIBILITY_PRESETS,
  type AccessibilityPreferences,
  type AccessibilityPreset,
} from "./preferences";

const PANEL_ID = "ksu-accessibility-panel";

type BooleanPreference = {
  key:
    | "readableFont"
    | "emphasizeLinks"
    | "largeTargets"
    | "reduceMotion"
    | "pauseMotion";
  label: string;
  description: string;
};

const BOOLEAN_PREFERENCES: readonly BooleanPreference[] = [
  {
    key: "readableFont",
    label: "Readable font",
    description: "Use a clear system sans-serif typeface.",
  },
  {
    key: "emphasizeLinks",
    label: "Emphasize links",
    description: "Underline links so they do not depend on colour alone.",
  },
  {
    key: "largeTargets",
    label: "Larger controls",
    description: "Increase the size and spacing of interactive controls.",
  },
  {
    key: "reduceMotion",
    label: "Reduce motion",
    description: "Turn off non-essential animation and smooth scrolling.",
  },
  {
    key: "pauseMotion",
    label: "Pause moving content",
    description: "Stop carousels, marquees, and rotating announcements.",
  },
];

function PreferenceSwitch({
  preference,
  checked,
  onCheckedChange,
}: {
  preference: BooleanPreference;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const id = `a11y-${preference.key}`;
  const descriptionId = `${id}-description`;

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
      <div className="min-w-0">
        <Label htmlFor={id} className="font-semibold">
          {preference.label}
        </Label>
        <p
          id={descriptionId}
          className="mt-1 text-xs leading-5 text-muted-foreground"
        >
          {preference.description}
        </p>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-describedby={descriptionId}
        className="mt-1 shrink-0"
      />
    </div>
  );
}

function SelectPreference<K extends "textScale" | "contrast">({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: AccessibilityPreferences[K];
  options: ReadonlyArray<{
    value: AccessibilityPreferences[K];
    label: string;
  }>;
  onChange: (value: AccessibilityPreferences[K]) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={(event) =>
          onChange(event.currentTarget.value as AccessibilityPreferences[K])
        }
        className="flex min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function AccessibilityPanel() {
  const [open, setOpen] = React.useState(false);
  const { preferences, setPreference, applyPreset, reset } =
    useAccessibility();

  const applySpacing = (checked: boolean) => {
    setPreference("lineHeight", checked ? "relaxed" : "default");
    setPreference("letterSpacing", checked ? "increased" : "default");
    setPreference("wordSpacing", checked ? "increased" : "default");
  };
  const increasedSpacing =
    preferences.lineHeight === "relaxed" ||
    preferences.letterSpacing === "increased" ||
    preferences.wordSpacing === "increased";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <TooltipProvider delayDuration={250}>
        <Tooltip>
          <TooltipTrigger asChild>
            <SheetTrigger asChild>
              <button
                type="button"
                className="ksu-floating-action"
                aria-label="Accessibility"
                aria-expanded={open}
                aria-controls={PANEL_ID}
              >
                <Accessibility aria-hidden className="h-6 w-6" />
              </button>
            </SheetTrigger>
          </TooltipTrigger>
          <TooltipContent side="left">Accessibility</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <SheetContent
        id={PANEL_ID}
        side="right"
        className="flex h-dvh w-full flex-col gap-0 overflow-hidden bg-background p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-border px-5 pb-5 pt-6 pr-14 text-left">
          <SheetTitle className="text-xl">
            Accessibility preferences
          </SheetTitle>
          <SheetDescription className="leading-6">
            Adjust how this website looks and moves. Settings take effect
            immediately and are saved only in this browser.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <section aria-labelledby="a11y-presets-heading">
            <h2
              id="a11y-presets-heading"
              className="text-sm font-bold text-foreground"
            >
              Quick presets
            </h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Choose a starting point, then change any setting below.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {(
                Object.entries(ACCESSIBILITY_PRESETS) as Array<
                  [
                    AccessibilityPreset,
                    (typeof ACCESSIBILITY_PRESETS)[AccessibilityPreset],
                  ]
                >
              ).map(([key, preset]) => (
                <button
                  key={key}
                  type="button"
                  aria-label={preset.label}
                  aria-pressed={preferences.preset === key}
                  onClick={() => applyPreset(key)}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    preferences.preset === key
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background hover:bg-muted",
                  )}
                >
                  <span className="block text-sm font-semibold text-foreground">
                    {preset.label}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    {preset.description}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="a11y-display-heading"
            className="mt-7 space-y-4"
          >
            <h2
              id="a11y-display-heading"
              className="text-sm font-bold text-foreground"
            >
              Display and interaction
            </h2>

            <SelectPreference<"textScale">
              id="a11y-text-size"
              label="Text size"
              value={preferences.textScale}
              onChange={(value) => setPreference("textScale", value)}
              options={[
                { value: "default", label: "Default (100%)" },
                { value: "large", label: "Large (112.5%)" },
                { value: "larger", label: "Larger (125%)" },
                { value: "largest", label: "Largest (150%)" },
              ]}
            />

            <SelectPreference<"contrast">
              id="a11y-contrast"
              label="Contrast"
              value={preferences.contrast}
              onChange={(value) => setPreference("contrast", value)}
              options={[
                { value: "default", label: "Default" },
                { value: "increased", label: "Increased" },
                { value: "high", label: "High contrast" },
              ]}
            />

            <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
              <div className="min-w-0">
                <Label htmlFor="a11y-text-spacing" className="font-semibold">
                  Comfortable text spacing
                </Label>
                <p
                  id="a11y-text-spacing-description"
                  className="mt-1 text-xs leading-5 text-muted-foreground"
                >
                  Increase line, letter, and word spacing together.
                </p>
              </div>
              <Switch
                id="a11y-text-spacing"
                checked={increasedSpacing}
                onCheckedChange={applySpacing}
                aria-describedby="a11y-text-spacing-description"
                className="mt-1 shrink-0"
              />
            </div>

            {BOOLEAN_PREFERENCES.map((preference) => (
              <PreferenceSwitch
                key={preference.key}
                preference={preference}
                checked={preferences[preference.key]}
                onCheckedChange={(checked) =>
                  setPreference(preference.key, checked)
                }
              />
            ))}
          </section>
        </div>

        <div className="border-t border-border bg-background px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full gap-2"
            onClick={reset}
          >
            <RotateCcw aria-hidden className="h-4 w-4" />
            Reset accessibility settings
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
