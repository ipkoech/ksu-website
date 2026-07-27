"use client";

import * as React from "react";
import {
  Accessibility,
  Activity,
  AlignLeft,
  Blend,
  BookOpen,
  Contrast,
  Eye,
  Focus,
  Hand,
  ImageOff,
  Link2,
  Maximize2,
  Minus,
  MousePointer2,
  Pause,
  Plus,
  RotateCcw,
  ScanLine,
  Type,
  type LucideIcon,
} from "lucide-react";

import { Button } from "../components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet";
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

const TEXT_SCALES: ReadonlyArray<{
  value: AccessibilityPreferences["textScale"];
  label: string;
}> = [
  { value: "default", label: "100%" },
  { value: "large", label: "112%" },
  { value: "larger", label: "125%" },
  { value: "largest", label: "150%" },
];

const CONTRAST_OPTIONS: ReadonlyArray<{
  value: AccessibilityPreferences["contrast"];
  label: string;
}> = [
  { value: "default", label: "Default" },
  { value: "increased", label: "More" },
  { value: "high", label: "High" },
];

const PRESET_ICONS: Record<AccessibilityPreset, LucideIcon> = {
  low_vision: Eye,
  reduced_motion: Activity,
  reading_support: BookOpen,
  motor_assistance: Hand,
};

type BooleanPreferenceKey =
  | "readableFont"
  | "emphasizeLinks"
  | "grayscale"
  | "hideImages"
  | "readingGuide"
  | "largeTargets"
  | "largeCursor"
  | "strongFocus"
  | "reduceMotion"
  | "pauseMotion";

type DirectControl = {
  key: BooleanPreferenceKey;
  label: string;
  description: string;
  icon: LucideIcon;
};

type CompositeControl = {
  key: "textSpacing" | "leftAlign";
  label: string;
  description: string;
  icon: LucideIcon;
};

type ControlDefinition = DirectControl | CompositeControl;

const CONTROL_GROUPS: ReadonlyArray<{
  title: string;
  controls: readonly ControlDefinition[];
}> = [
  {
    title: "Vision",
    controls: [
      {
        key: "emphasizeLinks",
        label: "Underline links",
        description: "Underline links so colour is not the only cue.",
        icon: Link2,
      },
      {
        key: "grayscale",
        label: "Grayscale",
        description: "Remove colour from the interface.",
        icon: Blend,
      },
      {
        key: "hideImages",
        label: "Hide images",
        description: "Hide photographs while preserving their layout.",
        icon: ImageOff,
      },
      {
        key: "strongFocus",
        label: "Strong focus",
        description: "Make the keyboard focus indicator more prominent.",
        icon: Focus,
      },
    ],
  },
  {
    title: "Reading",
    controls: [
      {
        key: "readableFont",
        label: "Clear font",
        description: "Use a clear system sans-serif typeface.",
        icon: Type,
      },
      {
        key: "textSpacing",
        label: "Text spacing",
        description: "Increase line, letter, and word spacing together.",
        icon: Maximize2,
      },
      {
        key: "leftAlign",
        label: "Align left",
        description: "Left-align headings and reading text.",
        icon: AlignLeft,
      },
      {
        key: "readingGuide",
        label: "Reading guide",
        description: "Keep a clear horizontal reading band on screen.",
        icon: ScanLine,
      },
    ],
  },
  {
    title: "Motion & control",
    controls: [
      {
        key: "largeTargets",
        label: "Larger controls",
        description: "Increase the size of interactive controls.",
        icon: Hand,
      },
      {
        key: "largeCursor",
        label: "Larger cursor",
        description: "Use a larger, high-visibility pointer.",
        icon: MousePointer2,
      },
      {
        key: "reduceMotion",
        label: "Less motion",
        description: "Turn off non-essential animation and smooth scrolling.",
        icon: Activity,
      },
      {
        key: "pauseMotion",
        label: "Pause movement",
        description: "Stop carousels and rotating announcements.",
        icon: Pause,
      },
    ],
  },
];

function IconToggle({
  icon: Icon,
  label,
  description,
  pressed,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  description: string;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-pressed={pressed}
          onClick={onClick}
          className={cn(
            "flex min-h-[4.5rem] items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            pressed
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-background text-foreground hover:bg-muted",
          )}
        >
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
              pressed ? "bg-primary text-primary-foreground" : "bg-muted",
            )}
          >
            <Icon aria-hidden className="h-[18px] w-[18px]" />
          </span>
          <span className="min-w-0 text-sm font-semibold leading-5">
            {label}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        collisionPadding={12}
        className="max-w-[calc(100vw-2rem)]"
      >
        {description}
      </TooltipContent>
    </Tooltip>
  );
}

export function AccessibilityPanel() {
  const [open, setOpen] = React.useState(false);
  const { preferences, setPreference, applyPreset, reset } = useAccessibility();

  const currentScaleIndex = TEXT_SCALES.findIndex(
    (item) => item.value === preferences.textScale,
  );
  const increasedSpacing =
    preferences.lineHeight === "relaxed" ||
    preferences.letterSpacing === "increased" ||
    preferences.wordSpacing === "increased";

  const setScaleIndex = (nextIndex: number) => {
    const option = TEXT_SCALES[nextIndex];
    if (option) setPreference("textScale", option.value);
  };

  const applySpacing = (checked: boolean) => {
    setPreference("lineHeight", checked ? "relaxed" : "default");
    setPreference("letterSpacing", checked ? "increased" : "default");
    setPreference("wordSpacing", checked ? "increased" : "default");
  };

  const controlPressed = (control: ControlDefinition) => {
    if (control.key === "textSpacing") return increasedSpacing;
    if (control.key === "leftAlign") {
      return preferences.textAlign === "left";
    }
    return preferences[control.key];
  };

  const toggleControl = (control: ControlDefinition) => {
    const pressed = controlPressed(control);
    if (control.key === "textSpacing") {
      applySpacing(!pressed);
      return;
    }
    if (control.key === "leftAlign") {
      setPreference("textAlign", pressed ? "default" : "left");
      return;
    }
    setPreference(control.key, !pressed);
  };

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

        <SheetContent
          id={PANEL_ID}
          side="right"
          className="flex h-dvh w-full flex-col gap-0 overflow-hidden bg-background p-0 sm:max-w-md"
        >
          <SheetHeader className="border-b border-border px-5 pb-4 pt-5 pr-14 text-left">
            <SheetTitle className="flex items-center gap-2 text-xl">
              <Accessibility aria-hidden className="h-5 w-5 text-primary" />
              Accessibility
            </SheetTitle>
            <SheetDescription className="sr-only">
              Change display, reading, motion, and interaction settings.
            </SheetDescription>
          </SheetHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <section aria-labelledby="a11y-presets-heading">
              <h2
                id="a11y-presets-heading"
                className="text-xs font-bold uppercase tracking-wide text-muted-foreground"
              >
                Presets
              </h2>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(
                  Object.entries(ACCESSIBILITY_PRESETS) as Array<
                    [
                      AccessibilityPreset,
                      (typeof ACCESSIBILITY_PRESETS)[AccessibilityPreset],
                    ]
                  >
                ).map(([key, preset]) => {
                  const Icon = PRESET_ICONS[key];
                  const pressed = preferences.preset === key;
                  return (
                    <Tooltip key={key}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          aria-pressed={pressed}
                          onClick={() => applyPreset(key)}
                          className={cn(
                            "flex min-h-16 items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            pressed
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background text-foreground hover:bg-muted",
                          )}
                        >
                          <Icon aria-hidden className="h-5 w-5 shrink-0" />
                          <span className="text-sm font-semibold leading-5">
                            {preset.label}
                          </span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        collisionPadding={12}
                        className="max-w-[calc(100vw-2rem)]"
                      >
                        {preset.description}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </section>

            <section aria-labelledby="a11y-display-heading" className="mt-5">
              <h2
                id="a11y-display-heading"
                className="text-xs font-bold uppercase tracking-wide text-muted-foreground"
              >
                Display
              </h2>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <div className="flex min-h-16 items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <Type aria-hidden className="h-4 w-4 text-primary" />
                    Text
                  </span>
                  <div
                    className="flex items-center rounded-md border border-border"
                    role="group"
                    aria-label="Text size"
                  >
                    <button
                      type="button"
                      aria-label="Decrease text size"
                      disabled={currentScaleIndex <= 0}
                      onClick={() => setScaleIndex(currentScaleIndex - 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-l-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Minus aria-hidden className="h-4 w-4" />
                    </button>
                    <output
                      aria-live="polite"
                      className="min-w-12 text-center text-xs font-bold"
                    >
                      {TEXT_SCALES[currentScaleIndex]?.label ?? "100%"}
                    </output>
                    <button
                      type="button"
                      aria-label="Increase text size"
                      disabled={currentScaleIndex >= TEXT_SCALES.length - 1}
                      onClick={() => setScaleIndex(currentScaleIndex + 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-r-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus aria-hidden className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex min-h-16 items-center gap-2 rounded-lg border border-border px-3 py-2">
                  <Contrast
                    aria-hidden
                    className="h-4 w-4 shrink-0 text-primary"
                  />
                  <div
                    className="grid flex-1 grid-cols-3 gap-1"
                    role="group"
                    aria-label="Contrast"
                  >
                    {CONTRAST_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={preferences.contrast === option.value}
                        onClick={() => setPreference("contrast", option.value)}
                        className={cn(
                          "min-h-9 rounded-md px-1 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          preferences.contrast === option.value
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted",
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {CONTROL_GROUPS.map((group) => (
              <section
                key={group.title}
                aria-labelledby={`a11y-${group.title
                  .toLowerCase()
                  .replaceAll(/[^a-z]+/g, "-")}-heading`}
                className="mt-5"
              >
                <h2
                  id={`a11y-${group.title
                    .toLowerCase()
                    .replaceAll(/[^a-z]+/g, "-")}-heading`}
                  className="text-xs font-bold uppercase tracking-wide text-muted-foreground"
                >
                  {group.title}
                </h2>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {group.controls.map((control) => (
                    <IconToggle
                      key={control.key}
                      icon={control.icon}
                      label={control.label}
                      description={control.description}
                      pressed={controlPressed(control)}
                      onClick={() => toggleControl(control)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="border-t border-border bg-background px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full gap-2"
              onClick={reset}
            >
              <RotateCcw aria-hidden className="h-4 w-4" />
              Reset all
            </Button>
          </div>
        </SheetContent>
      </TooltipProvider>
    </Sheet>
  );
}
