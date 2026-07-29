const ACCESSIBILITY_INIT_SOURCE = String.raw`
(() => {
  try {
    const raw = window.localStorage.getItem("ksu:accessibility:v1");
    if (!raw) return;
    const value = JSON.parse(raw);
    if (!value || value.version !== 1) return;
    const root = document.documentElement;
    const enums = {
      textScale: ["large", "larger", "largest"],
      contrast: ["increased", "high"],
      saturation: ["low", "high"],
      lineHeight: ["relaxed"],
      letterSpacing: ["increased"],
      wordSpacing: ["increased"],
      textAlign: ["left", "center", "right"],
      widgetSize: ["oversized"],
      widgetPosition: ["left"]
    };
    const attributes = {
      textScale: "data-a11y-text-scale",
      contrast: "data-a11y-contrast",
      saturation: "data-a11y-saturation",
      readableFont: "data-a11y-readable-font",
      lineHeight: "data-a11y-line-height",
      letterSpacing: "data-a11y-letter-spacing",
      wordSpacing: "data-a11y-word-spacing",
      textAlign: "data-a11y-text-align",
      emphasizeLinks: "data-a11y-emphasize-links",
      grayscale: "data-a11y-grayscale",
      hideImages: "data-a11y-hide-images",
      readingGuide: "data-a11y-reading-guide",
      largeTargets: "data-a11y-large-targets",
      largeCursor: "data-a11y-large-cursor",
      strongFocus: "data-a11y-strong-focus",
      reduceMotion: "data-a11y-reduce-motion",
      pauseMotion: "data-a11y-pause-motion",
      widgetSize: "data-a11y-widget-size",
      widgetPosition: "data-a11y-widget-position"
    };
    for (const [key, attribute] of Object.entries(attributes)) {
      if (Object.prototype.hasOwnProperty.call(enums, key)) {
        if (enums[key].includes(value[key])) root.setAttribute(attribute, value[key]);
      } else if (value[key] === true) {
        root.setAttribute(attribute, "true");
      }
    }
  } catch {
    // Accessibility preferences are optional; defaults remain usable.
  }
})();
`;

export function AccessibilityInitScript() {
  return (
    <script
      id="ksu-accessibility-init"
      dangerouslySetInnerHTML={{ __html: ACCESSIBILITY_INIT_SOURCE }}
    />
  );
}
