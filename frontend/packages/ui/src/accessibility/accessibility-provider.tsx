"use client";

import * as React from "react";

import {
  ACCESSIBILITY_PRESETS,
  ACCESSIBILITY_STORAGE_KEY,
  DEFAULT_ACCESSIBILITY_PREFERENCES,
  mergeAccessibilityPreferences,
  parseStoredPreferences,
  type AccessibilityPreferences,
  type AccessibilityPreset,
} from "./preferences";

type AccessibilityContextValue = {
  preferences: AccessibilityPreferences;
  systemReduceMotion: boolean;
  effectiveReduceMotion: boolean;
  setPreference: <K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K],
  ) => void;
  applyPreset: (preset: AccessibilityPreset) => void;
  reset: () => void;
};

type AttributeDefinition = {
  attribute: string;
  kind: "boolean" | "enum";
};

export const ROOT_ATTRIBUTE_MAP = {
  textScale: {
    attribute: "data-a11y-text-scale",
    kind: "enum",
  },
  contrast: {
    attribute: "data-a11y-contrast",
    kind: "enum",
  },
  readableFont: {
    attribute: "data-a11y-readable-font",
    kind: "boolean",
  },
  lineHeight: {
    attribute: "data-a11y-line-height",
    kind: "enum",
  },
  letterSpacing: {
    attribute: "data-a11y-letter-spacing",
    kind: "enum",
  },
  wordSpacing: {
    attribute: "data-a11y-word-spacing",
    kind: "enum",
  },
  emphasizeLinks: {
    attribute: "data-a11y-emphasize-links",
    kind: "boolean",
  },
  largeTargets: {
    attribute: "data-a11y-large-targets",
    kind: "boolean",
  },
  reduceMotion: {
    attribute: "data-a11y-reduce-motion",
    kind: "boolean",
  },
  pauseMotion: {
    attribute: "data-a11y-pause-motion",
    kind: "boolean",
  },
} as const satisfies Partial<
  Record<keyof AccessibilityPreferences, AttributeDefinition>
>;

const AccessibilityContext =
  React.createContext<AccessibilityContextValue | null>(null);

function applyRootAttributes(preferences: AccessibilityPreferences) {
  const root = document.documentElement;

  for (const [key, definition] of Object.entries(ROOT_ATTRIBUTE_MAP) as Array<
    [
      keyof typeof ROOT_ATTRIBUTE_MAP,
      (typeof ROOT_ATTRIBUTE_MAP)[keyof typeof ROOT_ATTRIBUTE_MAP],
    ]
  >) {
    const value = preferences[key];
    if (definition.kind === "boolean") {
      if (value === true) {
        root.setAttribute(definition.attribute, "true");
      } else {
        root.removeAttribute(definition.attribute);
      }
      continue;
    }

    if (value === "default") {
      root.removeAttribute(definition.attribute);
    } else {
      root.setAttribute(definition.attribute, String(value));
    }
  }
}

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [preferences, setPreferences] =
    React.useState<AccessibilityPreferences>(
      DEFAULT_ACCESSIBILITY_PREFERENCES,
    );
  const [ready, setReady] = React.useState(false);
  const [systemReduceMotion, setSystemReduceMotion] = React.useState(false);

  React.useEffect(() => {
    try {
      setPreferences(
        parseStoredPreferences(
          window.localStorage.getItem(ACCESSIBILITY_STORAGE_KEY),
        ),
      );
    } catch {
      setPreferences(DEFAULT_ACCESSIBILITY_PREFERENCES);
    } finally {
      setReady(true);
      document.documentElement.setAttribute("data-a11y-ready", "true");
    }
    return () => {
      document.documentElement.removeAttribute("data-a11y-ready");
    };
  }, []);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemReduceMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener?.("change", update);
    return () => mediaQuery.removeEventListener?.("change", update);
  }, []);

  React.useEffect(() => {
    if (!ready) return;

    applyRootAttributes(preferences);
    try {
      window.localStorage.setItem(
        ACCESSIBILITY_STORAGE_KEY,
        JSON.stringify(preferences),
      );
    } catch {
      // The preferences remain active for this page when storage is unavailable.
    }
  }, [preferences, ready]);

  React.useEffect(
    () => () => {
      for (const definition of Object.values(ROOT_ATTRIBUTE_MAP)) {
        document.documentElement.removeAttribute(definition.attribute);
      }
    },
    [],
  );

  const setPreference = React.useCallback(
    <K extends keyof AccessibilityPreferences>(
      key: K,
      value: AccessibilityPreferences[K],
    ) => {
      setPreferences((current) =>
        mergeAccessibilityPreferences(current, { [key]: value }),
      );
    },
    [],
  );

  const applyPreset = React.useCallback((preset: AccessibilityPreset) => {
    setPreferences((current) =>
      mergeAccessibilityPreferences(
        current,
        ACCESSIBILITY_PRESETS[preset].preferences,
      ),
    );
  }, []);

  const reset = React.useCallback(() => {
    setPreferences({ ...DEFAULT_ACCESSIBILITY_PREFERENCES });
  }, []);

  const value = React.useMemo<AccessibilityContextValue>(
    () => ({
      preferences,
      systemReduceMotion,
      effectiveReduceMotion:
        preferences.reduceMotion || systemReduceMotion,
      setPreference,
      applyPreset,
      reset,
    }),
    [
      applyPreset,
      preferences,
      reset,
      setPreference,
      systemReduceMotion,
    ],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility(): AccessibilityContextValue {
  const context = React.useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      "useAccessibility must be used inside AccessibilityProvider.",
    );
  }
  return context;
}
