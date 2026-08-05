import { describe, expect, it } from "vitest";

import {
  ACCESSIBILITY_PRESETS,
  DEFAULT_ACCESSIBILITY_PREFERENCES,
  mergeAccessibilityPreferences,
  parseStoredPreferences,
} from "./preferences";

describe("parseStoredPreferences", () => {
  it("returns defaults for malformed storage", () => {
    expect(parseStoredPreferences("{bad")).toEqual(
      DEFAULT_ACCESSIBILITY_PREFERENCES,
    );
  });

  it("keeps valid values and rejects unknown enum values", () => {
    expect(
      parseStoredPreferences(
        JSON.stringify({
          version: 1,
          textScale: "large",
          contrast: "solarized",
          emphasizeLinks: true,
        }),
      ),
    ).toMatchObject({
      version: 1,
      textScale: "large",
      contrast: "default",
      emphasizeLinks: true,
    });
  });
});

describe("accessibility presets", () => {
  it("applies reading support without locking later changes", () => {
    const preset = mergeAccessibilityPreferences(
      DEFAULT_ACCESSIBILITY_PREFERENCES,
      ACCESSIBILITY_PRESETS.reading_support.preferences,
    );

    expect(preset).toMatchObject({
      preset: "reading_support",
      readableFont: true,
      lineHeight: "relaxed",
      letterSpacing: "increased",
      wordSpacing: "increased",
    });

    expect(
      mergeAccessibilityPreferences(preset, {
        letterSpacing: "default",
      }),
    ).toMatchObject({
      preset: null,
      letterSpacing: "default",
    });
  });
});
