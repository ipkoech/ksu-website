"use client";

import * as React from "react";
import {
  Accessibility,
  Activity,
  AlignLeft,
  Blend,
  BookOpenText,
  ChevronDown,
  Contrast,
  Droplets,
  Eye,
  Focus,
  Hand,
  ImageOff,
  Info,
  Link2,
  ListTree,
  Maximize2,
  MoveHorizontal,
  MoveVertical,
  MousePointer2,
  PanelLeft,
  PanelRight,
  Pause,
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
import { AccessibilityControlTile } from "./accessibility-control-tile";
import { AccessibilityPageStructure } from "./accessibility-page-structure";
import { useAccessibility } from "./accessibility-provider";
import {
  ACCESSIBILITY_PRESETS,
  type AccessibilityPreferences,
  type AccessibilityPreset,
} from "./preferences";

const PANEL_ID = "ksu-accessibility-panel";

const PRESET_ICONS: Record<AccessibilityPreset, LucideIcon> = {
  low_vision: Eye,
  reduced_motion: Activity,
  reading_support: BookOpenText,
  motor_assistance: Hand,
};

const TEXT_SCALES: ReadonlyArray<{
  value: AccessibilityPreferences["textScale"];
  label: string;
}> = [
  { value: "default", label: "100%" },
  { value: "large", label: "112%" },
  { value: "larger", label: "125%" },
  { value: "largest", label: "150%" },
];

const CONTRAST_LEVELS: ReadonlyArray<{
  value: AccessibilityPreferences["contrast"];
  label: string;
}> = [
  { value: "default", label: "Default" },
  { value: "increased", label: "More" },
  { value: "high", label: "High" },
];

const SATURATION_LEVELS: ReadonlyArray<{
  value: AccessibilityPreferences["saturation"];
  label: string;
}> = [
  { value: "default", label: "Default" },
  { value: "low", label: "Low" },
  { value: "high", label: "High" },
];

const ALIGNMENT_LEVELS: ReadonlyArray<{
  value: AccessibilityPreferences["textAlign"];
  label: string;
}> = [
  { value: "default", label: "Default" },
  { value: "left", label: "Left" },
  { value: "center", label: "Centre" },
  { value: "right", label: "Right" },
];

function nextValue<T extends string>(
  values: ReadonlyArray<{ value: T; label: string }>,
  current: T,
) {
  const index = values.findIndex((item) => item.value === current);
  return values[(index + 1) % values.length] ?? values[0]!;
}

function valueLabel<T extends string>(
  values: ReadonlyArray<{ value: T; label: string }>,
  current: T,
) {
  return values.find((item) => item.value === current)?.label ?? current;
}

export function AccessibilityPanel() {
  const [open, setOpen] = React.useState(false);
  const [profilesOpen, setProfilesOpen] = React.useState(false);
  const [view, setView] = React.useState<"controls" | "structure">("controls");
  const {
    preferences,
    effectiveReduceMotion,
    setPreference,
    applyPreset,
    reset,
  } = useAccessibility();

  React.useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const editing =
        target?.isContentEditable ||
        ["INPUT", "SELECT", "TEXTAREA"].includes(target?.tagName ?? "");
      if (editing || !event.altKey || event.key.toLowerCase() !== "a") return;
      event.preventDefault();
      setOpen((current) => !current);
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setView("controls");
  };

  const increasedSpacing =
    preferences.letterSpacing === "increased" ||
    preferences.wordSpacing === "increased";

  const toggleSpacing = () => {
    const next = increasedSpacing ? "default" : "increased";
    setPreference("letterSpacing", next);
    setPreference("wordSpacing", next);
  };

  const navigateToStructureItem = (element: HTMLElement) => {
    setOpen(false);
    setView("controls");
    window.setTimeout(
      () => {
        if (!element.hasAttribute("tabindex")) {
          element.setAttribute("tabindex", "-1");
        }
        element.scrollIntoView({
          behavior: effectiveReduceMotion ? "auto" : "smooth",
          block: "start",
        });
        element.focus({ preventScroll: true });
      },
      effectiveReduceMotion ? 0 : 220,
    );
  };

  const trigger = (
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
  );

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <TooltipProvider delayDuration={250}>
        {preferences.showTooltips ? (
          <Tooltip>
            <TooltipTrigger asChild>{trigger}</TooltipTrigger>
            <TooltipContent side="left">Accessibility (Alt+A)</TooltipContent>
          </Tooltip>
        ) : (
          trigger
        )}

        <SheetContent
          id={PANEL_ID}
          aria-label="Accessibility preferences"
          side={preferences.widgetPosition}
          className={cn(
            "flex h-dvh w-full flex-col gap-0 overflow-hidden bg-[#eef1f5] p-0 [&>button]:text-primary-foreground [&>button]:opacity-100",
            preferences.widgetSize === "oversized"
              ? "sm:max-w-[640px]"
              : "sm:max-w-[512px]",
          )}
        >
          <SheetHeader className="min-h-[4.25rem] justify-center bg-primary px-5 py-4 pr-16 text-left">
            <SheetTitle className="flex items-center gap-2 text-lg text-primary-foreground">
              <Accessibility aria-hidden className="h-5 w-5" />
              Accessibility preferences
              <span aria-hidden="true" className="text-xs font-medium opacity-85">(Alt+A)</span>
            </SheetTitle>
            <SheetDescription className="sr-only">
              Adjust accessibility profiles, display, reading, motion, and
              interaction settings.
            </SheetDescription>
          </SheetHeader>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {view === "structure" ? (
              <AccessibilityPageStructure
                panelId={PANEL_ID}
                onBack={() => setView("controls")}
                onNavigate={navigateToStructureItem}
              />
            ) : (
              <div className="px-4 py-4 sm:px-5">
                <section aria-labelledby="a11y-profiles-heading">
                  <button
                    type="button"
                    aria-expanded={profilesOpen}
                    aria-controls="a11y-profile-options"
                    onClick={() => setProfilesOpen((current) => !current)}
                    className="flex min-h-12 w-full items-center gap-3 border-b border-slate-300 bg-transparent px-1 py-2 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Accessibility aria-hidden className="h-4 w-4" />
                    </span>
                    <span
                      id="a11y-profiles-heading"
                      className="flex-1 text-sm font-semibold text-foreground"
                    >
                      Accessibility profiles
                    </span>
                    <ChevronDown
                      aria-hidden
                      className={cn(
                        "h-5 w-5 transition-transform",
                        profilesOpen && "rotate-180",
                      )}
                    />
                  </button>

                  {profilesOpen ? (
                    <div
                      id="a11y-profile-options"
                      className="grid grid-cols-2 gap-2 py-3"
                    >
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
                          <button
                            key={key}
                            type="button"
                            aria-pressed={pressed}
                            onClick={() => applyPreset(key)}
                            className={cn(
                              "flex min-h-16 items-center gap-3 rounded-xl border bg-white px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25",
                              pressed
                                ? "border-primary text-primary"
                                : "border-slate-200 text-foreground",
                            )}
                          >
                            <Icon aria-hidden className="h-5 w-5 shrink-0" />
                            <span className="text-sm font-semibold">
                              {preset.label}
                            </span>
                            <span className="sr-only">
                              {preset.description}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </section>

                <button
                  type="button"
                  aria-pressed={preferences.widgetSize === "oversized"}
                  onClick={() =>
                    setPreference(
                      "widgetSize",
                      preferences.widgetSize === "oversized"
                        ? "standard"
                        : "oversized",
                    )
                  }
                  className="mt-3 flex min-h-12 w-full items-center gap-3 border-b border-slate-300 px-1 py-2 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25"
                >
                  <Maximize2 aria-hidden className="h-6 w-6" />
                  <span className="flex-1 text-sm font-semibold">
                    Oversized widget
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors",
                      preferences.widgetSize === "oversized"
                        ? "bg-primary"
                        : "bg-slate-400",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-1 h-4 w-4 rounded-full bg-white transition-transform",
                        preferences.widgetSize === "oversized"
                          ? "translate-x-6"
                          : "translate-x-1",
                      )}
                    />
                  </span>
                </button>

                <section
                  aria-labelledby="a11y-controls-heading"
                  className="mt-4"
                >
                  <h2 id="a11y-controls-heading" className="sr-only">
                    Accessibility controls
                  </h2>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <AccessibilityControlTile
                      icon={Contrast}
                      label="Contrast"
                      value={valueLabel(CONTRAST_LEVELS, preferences.contrast)}
                      description="Cycle through default, increased, and high contrast."
                      pressed={preferences.contrast !== "default"}
                      tooltipsEnabled={preferences.showTooltips}
                      onClick={() =>
                        setPreference(
                          "contrast",
                          nextValue(CONTRAST_LEVELS, preferences.contrast)
                            .value,
                        )
                      }
                    />
                    <AccessibilityControlTile
                      icon={Droplets}
                      label="Saturation"
                      value={valueLabel(
                        SATURATION_LEVELS,
                        preferences.saturation,
                      )}
                      description="Cycle through default, low, and high colour saturation."
                      pressed={preferences.saturation !== "default"}
                      tooltipsEnabled={preferences.showTooltips}
                      onClick={() =>
                        setPreference(
                          "saturation",
                          nextValue(SATURATION_LEVELS, preferences.saturation)
                            .value,
                        )
                      }
                    />
                    <AccessibilityControlTile
                      icon={Pause}
                      label="Pause animations"
                      value={preferences.pauseMotion ? "On" : "Off"}
                      description="Stop carousels and automatically moving content."
                      pressed={preferences.pauseMotion}
                      tooltipsEnabled={preferences.showTooltips}
                      onClick={() =>
                        setPreference("pauseMotion", !preferences.pauseMotion)
                      }
                    />
                    <AccessibilityControlTile
                      icon={Link2}
                      label="Highlight links"
                      value={preferences.emphasizeLinks ? "On" : "Off"}
                      description="Underline links so colour is not the only cue."
                      pressed={preferences.emphasizeLinks}
                      tooltipsEnabled={preferences.showTooltips}
                      onClick={() =>
                        setPreference(
                          "emphasizeLinks",
                          !preferences.emphasizeLinks,
                        )
                      }
                    />
                    <AccessibilityControlTile
                      icon={Type}
                      label="Bigger text"
                      value={valueLabel(TEXT_SCALES, preferences.textScale)}
                      description="Cycle text size from 100 to 150 percent."
                      pressed={preferences.textScale !== "default"}
                      tooltipsEnabled={preferences.showTooltips}
                      onClick={() =>
                        setPreference(
                          "textScale",
                          nextValue(TEXT_SCALES, preferences.textScale).value,
                        )
                      }
                    />
                    <AccessibilityControlTile
                      icon={MoveHorizontal}
                      label="Text spacing"
                      value={increasedSpacing ? "Wide" : "Default"}
                      description="Increase letter and word spacing together."
                      pressed={increasedSpacing}
                      tooltipsEnabled={preferences.showTooltips}
                      onClick={toggleSpacing}
                    />
                    <AccessibilityControlTile
                      icon={ImageOff}
                      label="Hide images"
                      value={preferences.hideImages ? "On" : "Off"}
                      description="Hide non-interactive images while preserving layout."
                      pressed={preferences.hideImages}
                      tooltipsEnabled={preferences.showTooltips}
                      onClick={() =>
                        setPreference("hideImages", !preferences.hideImages)
                      }
                    />
                    <AccessibilityControlTile
                      icon={BookOpenText}
                      label="Reading support"
                      value={preferences.readableFont ? "On" : "Off"}
                      description="Use a clear system sans-serif typeface."
                      pressed={preferences.readableFont}
                      tooltipsEnabled={preferences.showTooltips}
                      onClick={() =>
                        setPreference("readableFont", !preferences.readableFont)
                      }
                    />
                    <AccessibilityControlTile
                      icon={MousePointer2}
                      label="Large cursor"
                      value={preferences.largeCursor ? "On" : "Off"}
                      description="Use a larger, high-visibility pointer."
                      pressed={preferences.largeCursor}
                      tooltipsEnabled={preferences.showTooltips}
                      onClick={() =>
                        setPreference("largeCursor", !preferences.largeCursor)
                      }
                    />
                    <AccessibilityControlTile
                      icon={Focus}
                      label="Strong focus"
                      value={preferences.strongFocus ? "On" : "Off"}
                      description="Make keyboard focus indicators more prominent."
                      pressed={preferences.strongFocus}
                      tooltipsEnabled={preferences.showTooltips}
                      onClick={() =>
                        setPreference("strongFocus", !preferences.strongFocus)
                      }
                    />
                    <AccessibilityControlTile
                      icon={Activity}
                      label="Reduce motion"
                      value={preferences.reduceMotion ? "On" : "Off"}
                      description="Reduce non-essential animation and smooth scrolling."
                      pressed={preferences.reduceMotion}
                      tooltipsEnabled={preferences.showTooltips}
                      onClick={() =>
                        setPreference("reduceMotion", !preferences.reduceMotion)
                      }
                    />
                    <AccessibilityControlTile
                      icon={Info}
                      label="Tooltips"
                      value={preferences.showTooltips ? "On" : "Off"}
                      description="Show or hide brief control explanations."
                      pressed={preferences.showTooltips}
                      tooltipsEnabled={preferences.showTooltips}
                      onClick={() =>
                        setPreference("showTooltips", !preferences.showTooltips)
                      }
                    />
                    <AccessibilityControlTile
                      icon={ScanLine}
                      label="Reading guide"
                      value={preferences.readingGuide ? "On" : "Off"}
                      description="Keep a clear horizontal reading band on screen."
                      pressed={preferences.readingGuide}
                      tooltipsEnabled={preferences.showTooltips}
                      onClick={() =>
                        setPreference("readingGuide", !preferences.readingGuide)
                      }
                    />
                    <AccessibilityControlTile
                      icon={Blend}
                      label="Grayscale"
                      value={preferences.grayscale ? "On" : "Off"}
                      description="Remove colour without changing page structure."
                      pressed={preferences.grayscale}
                      tooltipsEnabled={preferences.showTooltips}
                      onClick={() =>
                        setPreference("grayscale", !preferences.grayscale)
                      }
                    />
                    <AccessibilityControlTile
                      icon={Hand}
                      label="Larger controls"
                      value={preferences.largeTargets ? "On" : "Off"}
                      description="Increase the minimum size of interactive controls."
                      pressed={preferences.largeTargets}
                      tooltipsEnabled={preferences.showTooltips}
                      onClick={() =>
                        setPreference("largeTargets", !preferences.largeTargets)
                      }
                    />
                    <AccessibilityControlTile
                      icon={MoveVertical}
                      label="Line height"
                      value={
                        preferences.lineHeight === "relaxed"
                          ? "Relaxed"
                          : "Default"
                      }
                      description="Increase spacing between lines of text."
                      pressed={preferences.lineHeight === "relaxed"}
                      tooltipsEnabled={preferences.showTooltips}
                      onClick={() =>
                        setPreference(
                          "lineHeight",
                          preferences.lineHeight === "relaxed"
                            ? "default"
                            : "relaxed",
                        )
                      }
                    />
                    <AccessibilityControlTile
                      icon={AlignLeft}
                      label="Text align"
                      value={valueLabel(
                        ALIGNMENT_LEVELS,
                        preferences.textAlign,
                      )}
                      description="Cycle reading text through default, left, centre, and right alignment."
                      pressed={preferences.textAlign !== "default"}
                      tooltipsEnabled={preferences.showTooltips}
                      onClick={() =>
                        setPreference(
                          "textAlign",
                          nextValue(ALIGNMENT_LEVELS, preferences.textAlign)
                            .value,
                        )
                      }
                    />
                    <AccessibilityControlTile
                      icon={ListTree}
                      label="Page structure"
                      value="Open"
                      description="List page headings and landmarks and jump to them."
                      tooltipsEnabled={preferences.showTooltips}
                      onClick={() => setView("structure")}
                    />
                  </div>
                </section>

                <Button
                  type="button"
                  className="mt-5 min-h-12 w-full gap-2"
                  onClick={() => {
                    reset();
                    setProfilesOpen(false);
                  }}
                >
                  <RotateCcw aria-hidden className="h-5 w-5" />
                  Reset accessibility settings
                </Button>

                <section
                  aria-labelledby="a11y-position-heading"
                  className="mt-4 rounded-xl bg-white p-4"
                >
                  <h2
                    id="a11y-position-heading"
                    className="text-sm font-semibold text-foreground"
                  >
                    Widget position
                  </h2>
                  <div
                    className="mt-3 grid grid-cols-2 gap-2"
                    role="group"
                    aria-label="Widget position"
                  >
                    {(
                      [
                        ["left", "Left", PanelLeft],
                        ["right", "Right", PanelRight],
                      ] as const
                    ).map(([position, label, Icon]) => (
                      <button
                        key={position}
                        type="button"
                        aria-pressed={preferences.widgetPosition === position}
                        onClick={() =>
                          setPreference("widgetPosition", position)
                        }
                        className={cn(
                          "flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25",
                          preferences.widgetPosition === position
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-slate-200",
                        )}
                      >
                        <Icon aria-hidden className="h-5 w-5" />
                        {label}
                      </button>
                    ))}
                  </div>
                </section>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Settings apply immediately and stay in this browser.
                </p>
              </div>
            )}
          </div>
        </SheetContent>
      </TooltipProvider>
    </Sheet>
  );
}
