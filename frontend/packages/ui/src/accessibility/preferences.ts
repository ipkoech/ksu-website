export const ACCESSIBILITY_STORAGE_KEY = "ksu:accessibility:v1";

export type AccessibilityPreset =
  | "low_vision"
  | "reduced_motion"
  | "reading_support"
  | "motor_assistance";

export type AccessibilityPreferences = {
  version: 1;
  preset: AccessibilityPreset | null;
  textScale: "default" | "large" | "larger" | "largest";
  contrast: "default" | "increased" | "high";
  readableFont: boolean;
  lineHeight: "default" | "relaxed";
  letterSpacing: "default" | "increased";
  wordSpacing: "default" | "increased";
  emphasizeLinks: boolean;
  largeTargets: boolean;
  reduceMotion: boolean;
  pauseMotion: boolean;
};

export const DEFAULT_ACCESSIBILITY_PREFERENCES: AccessibilityPreferences = {
  version: 1,
  preset: null,
  textScale: "default",
  contrast: "default",
  readableFont: false,
  lineHeight: "default",
  letterSpacing: "default",
  wordSpacing: "default",
  emphasizeLinks: false,
  largeTargets: false,
  reduceMotion: false,
  pauseMotion: false,
};

export const ACCESSIBILITY_PRESETS = {
  low_vision: {
    label: "Low vision",
    description: "Larger text, stronger contrast, emphasized links, and larger controls.",
    preferences: {
      preset: "low_vision",
      textScale: "larger",
      contrast: "increased",
      emphasizeLinks: true,
      largeTargets: true,
    },
  },
  reduced_motion: {
    label: "Reduced motion",
    description: "Stops non-essential animation and automatically moving content.",
    preferences: {
      preset: "reduced_motion",
      reduceMotion: true,
      pauseMotion: true,
    },
  },
  reading_support: {
    label: "Reading support",
    description: "Uses a readable font with more line, letter, and word spacing.",
    preferences: {
      preset: "reading_support",
      readableFont: true,
      lineHeight: "relaxed",
      letterSpacing: "increased",
      wordSpacing: "increased",
    },
  },
  motor_assistance: {
    label: "Motor assistance",
    description: "Provides larger controls and pauses automatically moving content.",
    preferences: {
      preset: "motor_assistance",
      largeTargets: true,
      pauseMotion: true,
    },
  },
} as const satisfies Record<
  AccessibilityPreset,
  {
    label: string;
    description: string;
    preferences: Partial<AccessibilityPreferences>;
  }
>;

const PRESETS: readonly AccessibilityPreset[] = [
  "low_vision",
  "reduced_motion",
  "reading_support",
  "motor_assistance",
];
const TEXT_SCALES: readonly AccessibilityPreferences["textScale"][] = [
  "default",
  "large",
  "larger",
  "largest",
];
const CONTRASTS: readonly AccessibilityPreferences["contrast"][] = [
  "default",
  "increased",
  "high",
];
const LINE_HEIGHTS: readonly AccessibilityPreferences["lineHeight"][] = [
  "default",
  "relaxed",
];
const LETTER_SPACINGS: readonly AccessibilityPreferences["letterSpacing"][] = [
  "default",
  "increased",
];
const WORD_SPACINGS: readonly AccessibilityPreferences["wordSpacing"][] = [
  "default",
  "increased",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function includesValue<T extends string>(
  values: readonly T[],
  value: unknown,
): value is T {
  return typeof value === "string" && values.includes(value as T);
}

function booleanOrDefault(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function parseStoredPreferences(
  raw: string | null | undefined,
): AccessibilityPreferences {
  if (!raw) return { ...DEFAULT_ACCESSIBILITY_PREFERENCES };

  try {
    const stored: unknown = JSON.parse(raw);
    if (!isRecord(stored) || stored.version !== 1) {
      return { ...DEFAULT_ACCESSIBILITY_PREFERENCES };
    }

    return {
      version: 1,
      preset:
        stored.preset === null || includesValue(PRESETS, stored.preset)
          ? stored.preset
          : null,
      textScale: includesValue(TEXT_SCALES, stored.textScale)
        ? stored.textScale
        : "default",
      contrast: includesValue(CONTRASTS, stored.contrast)
        ? stored.contrast
        : "default",
      readableFont: booleanOrDefault(stored.readableFont, false),
      lineHeight: includesValue(LINE_HEIGHTS, stored.lineHeight)
        ? stored.lineHeight
        : "default",
      letterSpacing: includesValue(LETTER_SPACINGS, stored.letterSpacing)
        ? stored.letterSpacing
        : "default",
      wordSpacing: includesValue(WORD_SPACINGS, stored.wordSpacing)
        ? stored.wordSpacing
        : "default",
      emphasizeLinks: booleanOrDefault(stored.emphasizeLinks, false),
      largeTargets: booleanOrDefault(stored.largeTargets, false),
      reduceMotion: booleanOrDefault(stored.reduceMotion, false),
      pauseMotion: booleanOrDefault(stored.pauseMotion, false),
    };
  } catch {
    return { ...DEFAULT_ACCESSIBILITY_PREFERENCES };
  }
}

export function mergeAccessibilityPreferences(
  current: AccessibilityPreferences,
  patch: Partial<AccessibilityPreferences>,
): AccessibilityPreferences {
  return {
    ...current,
    ...patch,
    version: 1,
    preset: Object.prototype.hasOwnProperty.call(patch, "preset")
      ? (patch.preset ?? null)
      : null,
  };
}
